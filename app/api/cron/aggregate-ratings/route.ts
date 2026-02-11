import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth, markSourceRunning, markSourceComplete, type FetcherResult } from '@/lib/pipeline/fetcher-base';
import { aggregateRating, type ExternalRatingData } from '@/lib/pipeline/rating-aggregator';
import { loadWeightsByCategory } from '@/lib/scoring/weights';

const SOURCE_KEY = 'rating_aggregator';

/**
 * POST /api/cron/aggregate-ratings - 외부 소스 기반 실제 평점 집계
 *
 * Product Hunt, GitHub, 벤치마크, Artificial Analysis, G2 등의
 * 실제 외부 데이터를 수집하여 각 도구의 rating_avg, review_count,
 * visit_count(popularity)를 업데이트합니다.
 *
 * 실행 순서: github-stats, product-hunt, benchmarks 등이 먼저 실행된 후
 * 이 cron이 실행되어 집계합니다.
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

  const result: FetcherResult = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // 1. 모든 도구 조회
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select('id, name, slug, rating_avg, review_count, visit_count, github_stars, product_hunt_upvotes');

    if (toolsError || !tools?.length) {
      result.errors.push(toolsError?.message || 'No tools found');
      await markSourceComplete(supabase, SOURCE_KEY, result);
      return NextResponse.json({ success: false, ...result });
    }

    result.total = tools.length;

    // 2. 평점 집계 가중치 로드 (DB → 폴백: 상수)
    const ratingWeights = await loadWeightsByCategory(supabase, 'rating_aggregation');

    // 3. 외부 점수 일괄 조회
    const { data: externalScores } = await supabase
      .from('tool_external_scores')
      .select('tool_id, source_key, normalized_score, raw_data');

    // tool_id → source_key → raw_data 매핑
    const externalMap = new Map<string, Map<string, Record<string, unknown>>>();
    for (const es of externalScores || []) {
      if (!externalMap.has(es.tool_id)) {
        externalMap.set(es.tool_id, new Map());
      }
      externalMap.get(es.tool_id)!.set(es.source_key, es.raw_data || {});
    }

    // 4. 벤치마크 점수 조회
    const { data: benchmarks } = await supabase
      .from('tool_benchmark_scores')
      .select('tool_id, average_score');

    const benchmarkMap = new Map<string, number>();
    for (const b of benchmarks || []) {
      if (b.average_score) {
        benchmarkMap.set(b.tool_id, Number(b.average_score));
      }
    }

    // 5. 각 도구별 평점 집계
    for (const tool of tools) {
      try {
        const toolExternal = externalMap.get(tool.id);
        const phData = toolExternal?.get('product_hunt') || {};
        const aaData = toolExternal?.get('artificial_analysis') || {};

        const ratingData: ExternalRatingData = {
          ph_rating: phData.reviewsRating as number ?? null,
          ph_votes: (phData.votesCount as number) || tool.product_hunt_upvotes || 0,
          ph_reviews: (phData.reviewsCount as number) || 0,
          github_stars: tool.github_stars || 0,
          benchmark_avg: benchmarkMap.get(tool.id) ?? null,
          aa_quality_index: (aaData.quality_index as number) ?? null,
          g2_rating: null,  // G2 유료 API — 현재 비활성 (가중치 0)
          g2_reviews: 0,
        };

        const aggregated = aggregateRating(ratingData, ratingWeights);

        // 외부 데이터가 있는 경우에만 업데이트 (소스 0개면 건너뜀)
        if (aggregated.rating_sources.length === 0) {
          result.skipped++;
          continue;
        }

        const { error: updateError } = await supabase
          .from('tools')
          .update({
            rating_avg: aggregated.rating_avg,
            review_count: aggregated.review_count,
            // visit_count는 popularity_score로 대체
            // 기존 visit_count가 0인 경우에만 popularity로 채움
            ...(tool.visit_count === 0 ? { visit_count: aggregated.popularity_score } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('id', tool.id);

        if (updateError) {
          result.errors.push(`${tool.name}: ${updateError.message}`);
        } else {
          result.updated++;
        }
      } catch (err) {
        result.errors.push(
          `${tool.name}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  } catch (err) {
    result.errors.push(`Fatal: ${err instanceof Error ? err.message : String(err)}`);
  }

  await markSourceComplete(supabase, SOURCE_KEY, result);

  return NextResponse.json({
    success: result.errors.length === 0,
    ...result,
  });
}
