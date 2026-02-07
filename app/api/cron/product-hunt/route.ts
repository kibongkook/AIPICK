import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  verifyCronAuth,
  markSourceRunning,
  markSourceComplete,
  upsertExternalScore,
  delay,
  type FetcherResult,
} from '@/lib/pipeline/fetcher-base';
import { loadToolIdentifiers } from '@/lib/pipeline/model-matcher';

const SOURCE_KEY = 'product_hunt';
const PRODUCT_HUNT_API_URL = 'https://api.producthunt.com/v2/api/graphql';
const RATE_LIMIT_MS = 2000;

/**
 * POST /api/cron/product-hunt - Product Hunt 투표/리뷰 데이터 수집
 *
 * 각 도구를 Product Hunt GraphQL API에서 이름으로 검색하여
 * 투표 수, 리뷰 수, 평점을 수집하고 정규화된 점수를 저장합니다.
 *
 * Vercel Cron 또는 외부 스케줄러에서 호출
 * Authorization: Bearer <CRON_SECRET> 헤더로 인증
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!verifyCronAuth(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase not configured, skipping' });
  }

  const productHuntToken = process.env.PRODUCT_HUNT_TOKEN;
  if (!productHuntToken) {
    return NextResponse.json({
      message: 'PRODUCT_HUNT_TOKEN not set, skipping Product Hunt fetch',
    });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  await markSourceRunning(supabase, SOURCE_KEY);

  const result: FetcherResult = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const tools = await loadToolIdentifiers(supabase);
    result.total = tools.length;

    if (tools.length === 0) {
      await markSourceComplete(supabase, SOURCE_KEY, result);
      return NextResponse.json({ success: true, ...result, message: 'No tools found' });
    }

    // 먼저 모든 도구를 검색하여 votesCount를 수집하고 최대값을 구함
    const toolVotes: Array<{
      toolId: string;
      votesCount: number;
      reviewsCount: number;
      reviewsRating: number;
      rawData: Record<string, unknown>;
    }> = [];

    for (const tool of tools) {
      try {
        const query = buildSearchQuery(tool.name);
        const response = await fetch(PRODUCT_HUNT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${productHuntToken}`,
            'User-Agent': 'AIPICK-Bot',
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          result.errors.push(`${tool.name}: HTTP ${response.status}`);
          await delay(RATE_LIMIT_MS);
          continue;
        }

        const json = await response.json();
        const posts = json?.data?.posts?.edges;

        if (!posts || posts.length === 0) {
          result.skipped++;
          await delay(RATE_LIMIT_MS);
          continue;
        }

        // 첫 번째 결과 사용 (가장 관련성 높은 결과)
        const post = posts[0]?.node;
        if (!post) {
          result.skipped++;
          await delay(RATE_LIMIT_MS);
          continue;
        }

        const votesCount = post.votesCount ?? 0;
        const reviewsCount = post.reviewsCount ?? 0;
        const reviewsRating = post.reviewsRating ?? 0;

        toolVotes.push({
          toolId: tool.id,
          votesCount,
          reviewsCount,
          reviewsRating,
          rawData: {
            name: post.name,
            tagline: post.tagline,
            votesCount,
            reviewsCount,
            reviewsRating,
            url: post.url,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        result.errors.push(`${tool.name}: ${message}`);
      }

      await delay(RATE_LIMIT_MS);
    }

    // 최대 투표 수 계산 (정규화 기준)
    const maxVotes = Math.max(...toolVotes.map((t) => t.votesCount), 1);

    // 점수 저장 및 도구 업데이트
    for (const entry of toolVotes) {
      try {
        const normalizedScore = (entry.votesCount / maxVotes) * 100;

        await upsertExternalScore(
          supabase,
          entry.toolId,
          SOURCE_KEY,
          normalizedScore,
          entry.rawData
        );

        // tools 테이블의 product_hunt_upvotes 업데이트
        await supabase
          .from('tools')
          .update({
            product_hunt_upvotes: entry.votesCount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', entry.toolId);

        result.updated++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        result.errors.push(`upsert ${entry.toolId}: ${message}`);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    result.errors.push(`Fatal: ${message}`);
  }

  await markSourceComplete(supabase, SOURCE_KEY, result);

  return NextResponse.json({
    success: result.errors.length === 0,
    ...result,
  });
}

/**
 * Product Hunt GraphQL 검색 쿼리를 생성합니다.
 */
function buildSearchQuery(toolName: string): string {
  const escapedName = toolName.replace(/"/g, '\\"');
  return `{
    posts(order: VOTES, first: 1, topic: "artificial-intelligence", query: "${escapedName}") {
      edges {
        node {
          id
          name
          tagline
          url
          votesCount
          reviewsCount
          reviewsRating
        }
      }
    }
  }`;
}
