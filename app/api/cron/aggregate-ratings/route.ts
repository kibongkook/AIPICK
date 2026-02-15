import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth, markSourceRunning, markSourceComplete, type FetcherResult } from '@/lib/pipeline/fetcher-base';
import { aggregateRating, buildRatingDataFromScores } from '@/lib/pipeline/rating-aggregator';
import { loadWeightsByCategory } from '@/lib/scoring/weights';

const SOURCE_KEY = 'rating_aggregator';

/**
 * POST /api/cron/aggregate-ratings - 6-소스 기반 평점 집계
 *
 * App Store, Play Store, G2, Trustpilot, Product Hunt, AIPICK 자체 평점을
 * 가중 평균으로 집계하여 각 도구의 rating_avg, review_count,
 * rating_sources, confidence_level을 업데이트합니다.
 *
 * 실행 순서: 각 소스별 크론(app-store, play-store, g2 등)이 먼저 실행된 후
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
      .select('id, name, slug, rating_avg, review_count');

    if (toolsError || !tools?.length) {
      result.errors.push(toolsError?.message || 'No tools found');
      await markSourceComplete(supabase, SOURCE_KEY, result);
      return NextResponse.json({ success: false, ...result });
    }

    result.total = tools.length;

    // 2. 평점 집계 가중치 로드 (DB → 폴백: 상수)
    const ratingWeights = await loadWeightsByCategory(supabase, 'rating_aggregation');

    // 3. 외부 점수 일괄 조회 (평점 관련 소스만)
    const ratingSources = ['app_store', 'play_store', 'g2', 'trustpilot', 'product_hunt'];
    const { data: externalScores } = await supabase
      .from('tool_external_scores')
      .select('tool_id, source_key, normalized_score, raw_data')
      .in('source_key', ratingSources);

    // tool_id → scores 매핑
    const externalMap = new Map<string, Array<{ source_key: string; normalized_score: number; raw_data: Record<string, unknown> | null }>>();
    for (const es of externalScores || []) {
      if (!externalMap.has(es.tool_id)) {
        externalMap.set(es.tool_id, []);
      }
      externalMap.get(es.tool_id)!.push({
        source_key: es.source_key,
        normalized_score: Number(es.normalized_score),
        raw_data: es.raw_data,
      });
    }

    // 4. AIPICK 자체 평점 조회 (tool_ratings 테이블 - 독립 평가 시스템)
    const { data: aipickRatings } = await supabase
      .from('tool_ratings')
      .select('tool_id, rating');

    // tool_id → { rating_sum, count }
    const aipickMap = new Map<string, { sum: number; count: number }>();
    for (const r of aipickRatings || []) {
      if (!r.tool_id || !r.rating) continue;
      const entry = aipickMap.get(r.tool_id) || { sum: 0, count: 0 };
      entry.sum += Number(r.rating);
      entry.count++;
      aipickMap.set(r.tool_id, entry);
    }

    // 5. 각 도구별 평점 집계
    for (const tool of tools) {
      try {
        const toolScores = externalMap.get(tool.id) || [];
        const ratingData = buildRatingDataFromScores(toolScores);

        // AIPICK 자체 평점 주입
        const aipickData = aipickMap.get(tool.id);
        if (aipickData && aipickData.count > 0) {
          ratingData.aipick_rating = Math.round((aipickData.sum / aipickData.count) * 10) / 10;
          ratingData.aipick_reviews = aipickData.count;
        }

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
            review_count: aggregated.total_review_count,
            rating_sources: aggregated.rating_sources,
            confidence_level: aggregated.confidence,
            confidence_source_count: aggregated.rating_sources.length,
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
