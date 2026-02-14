import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth, markSourceRunning, markSourceComplete, upsertExternalScore, delay } from '@/lib/pipeline/fetcher-base';
import { DATA_SOURCE_KEYS } from '@/lib/constants';
import { normalizeToScale } from '@/lib/scoring';

const SOURCE_KEY = DATA_SOURCE_KEYS.G2;

const REQUEST_DELAY_MS = 3000;
const G2_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

/**
 * POST /api/cron/g2 - G2 평점 수집
 *
 * g2_slug가 설정된 도구의 G2 페이지에서 JSON-LD 스키마를 파싱하여
 * 평점과 리뷰 수를 수집하고 tool_external_scores에 저장합니다.
 */
export async function POST(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase not configured, skipping' });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  await markSourceRunning(supabase, SOURCE_KEY);

  const result = { total: 0, updated: 0, skipped: 0, errors: [] as string[] };

  // g2_slug가 있는 도구만 조회
  const { data: tools, error } = await supabase
    .from('tools')
    .select('id, name, g2_slug')
    .not('g2_slug', 'is', null);

  if (error || !tools?.length) {
    await markSourceComplete(supabase, SOURCE_KEY, result);
    return NextResponse.json({ success: true, updated: 0, message: 'No tools with g2_slug found' });
  }

  result.total = tools.length;

  for (const tool of tools) {
    try {
      const res = await fetch(`https://www.g2.com/products/${encodeURIComponent(tool.g2_slug)}`, {
        headers: {
          'Accept': 'text/html',
          'User-Agent': G2_USER_AGENT,
        },
        next: { revalidate: 0 },
      });

      // 차단된 경우 (403/429) skip 처리, 에러로 중단하지 않음
      if (res.status === 403 || res.status === 429) {
        result.skipped++;
        await delay(REQUEST_DELAY_MS);
        continue;
      }

      if (!res.ok) {
        result.errors.push(`${tool.name}: HTTP ${res.status}`);
        result.skipped++;
        await delay(REQUEST_DELAY_MS);
        continue;
      }

      const html = await res.text();

      const rating = extractG2Rating(html);
      if (!rating) {
        result.skipped++;
        await delay(REQUEST_DELAY_MS);
        continue;
      }

      const normalizedScore = normalizeToScale(rating.ratingValue, 5);

      await upsertExternalScore(supabase, tool.id, SOURCE_KEY, normalizedScore, {
        rating: rating.ratingValue,
        review_count: rating.reviewCount,
        slug: tool.g2_slug,
      });

      result.updated++;
    } catch (err) {
      result.errors.push(`${tool.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      result.skipped++;
    }

    await delay(REQUEST_DELAY_MS);
  }

  await markSourceComplete(supabase, SOURCE_KEY, result);

  return NextResponse.json({
    success: true,
    total: result.total,
    updated: result.updated,
    skipped: result.skipped,
    errors: result.errors.length,
  });
}

/**
 * HTML에서 JSON-LD 스키마의 aggregateRating을 추출합니다.
 * Product 또는 SoftwareApplication 타입의 스키마를 찾습니다.
 */
function extractG2Rating(html: string): { ratingValue: number; reviewCount: number } | null {
  // 모든 JSON-LD 스크립트 블록 추출
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(match[1].trim());

      const rating = findAggregateRating(jsonData);
      if (rating) return rating;
    } catch {
      // JSON 파싱 실패 시 다음 블록 시도
      continue;
    }
  }

  return null;
}

/**
 * JSON-LD 객체에서 Product 또는 SoftwareApplication 타입의
 * aggregateRating을 재귀적으로 찾습니다.
 */
function findAggregateRating(
  data: unknown
): { ratingValue: number; reviewCount: number } | null {
  if (!data || typeof data !== 'object') return null;

  // 배열인 경우 각 요소 탐색
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findAggregateRating(item);
      if (found) return found;
    }
    return null;
  }

  const obj = data as Record<string, unknown>;
  const type = obj['@type'];

  // Product 또는 SoftwareApplication 타입 확인
  if (
    (type === 'Product' || type === 'SoftwareApplication') &&
    obj.aggregateRating &&
    typeof obj.aggregateRating === 'object'
  ) {
    const aggRating = obj.aggregateRating as Record<string, unknown>;
    const ratingValue = Number(aggRating.ratingValue);
    const reviewCount = Number(aggRating.reviewCount || 0);

    if (!isNaN(ratingValue) && ratingValue > 0) {
      return { ratingValue, reviewCount: isNaN(reviewCount) ? 0 : reviewCount };
    }
  }

  // @graph 등 중첩 구조 탐색
  if (obj['@graph'] && Array.isArray(obj['@graph'])) {
    return findAggregateRating(obj['@graph']);
  }

  return null;
}
