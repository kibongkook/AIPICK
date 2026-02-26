import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth } from '@/lib/pipeline/fetcher-base';
import { aggregateRating, buildRatingDataFromScores } from '@/lib/pipeline/rating-aggregator';
import { loadScoringWeights } from '@/lib/scoring/weights';

/**
 * POST /api/cron/ranking - 평점 집계 + 주간 스냅샷
 *
 * 2축 평가 시스템:
 * - 사용자 평점 (rating_avg): 6개 외부 소스 가중 평균 (1~5)
 * - 성능 지표: 벤치마크 데이터는 별도 크론(/api/cron/benchmarks)에서 수집
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

  // 1. 가중치 로드 (DB → 폴백: 상수)
  const weights = await loadScoringWeights(supabase);

  // 2. 모든 도구 조회
  const { data: tools, error: toolsError } = await supabase
    .from('tools')
    .select('id, visit_count, review_count, upvote_count, rating_avg');

  if (toolsError || !tools?.length) {
    return NextResponse.json({ error: toolsError?.message || 'No tools found' }, { status: 500 });
  }

  // 3. 외부 점수 조회 (평점 소스: app_store, play_store, g2, trustpilot, product_hunt)
  const { data: externalScores } = await supabase
    .from('tool_external_scores')
    .select('tool_id, source_key, normalized_score, raw_data');

  const externalByTool = new Map<string, typeof externalScores>();
  (externalScores || []).forEach((es) => {
    if (!externalByTool.has(es.tool_id)) {
      externalByTool.set(es.tool_id, []);
    }
    externalByTool.get(es.tool_id)!.push(es);
  });

  // 4. 각 도구의 rating_avg 집계
  const updates = tools.map((tool) => {
    const scores = externalByTool.get(tool.id) || [];
    const ratingData = buildRatingDataFromScores(scores);
    const result = aggregateRating(ratingData, weights);

    return {
      id: tool.id,
      rating_avg: result.rating_avg,
      review_count: result.total_review_count || tool.review_count,
      confidence_level: result.confidence,
      confidence_source_count: result.rating_sources.length,
      rating_sources: result.rating_sources,
    };
  });

  // 5. 평점순 정렬
  updates.sort((a, b) => b.rating_avg - a.rating_avg);

  // 6. DB 업데이트 (배치: 10개씩 병렬 처리)
  const BATCH_SIZE = 10;
  let updatedCount = 0;
  const now = new Date().toISOString();

  for (let start = 0; start < updates.length; start += BATCH_SIZE) {
    const batch = updates.slice(start, start + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((u, idx) =>
        supabase
          .from('tools')
          .update({
            rating_avg: u.rating_avg,
            confidence_level: u.confidence_level,
            confidence_source_count: u.confidence_source_count,
            rating_sources: u.rating_sources,
            prev_ranking: start + idx + 1,
            updated_at: now,
          })
          .eq('id', u.id)
      )
    );
    updatedCount += results.filter((r) => !r.error).length;
  }

  // 7. 도구별 원본 데이터 맵 (스냅샷용)
  const toolMap = new Map(tools.map((t) => [t.id, t]));

  // 8. 주간 랭킹 스냅샷
  const weekStart = getWeekStart();
  const snapshots = updates.map((u, i) => ({
    tool_id: u.id,
    week_start: weekStart,
    ranking: i + 1,
    ranking_score: u.rating_avg,
    visit_count: toolMap.get(u.id)?.visit_count || 0,
  }));

  const { error: snapshotError } = await supabase
    .from('weekly_rankings')
    .upsert(snapshots, { onConflict: 'tool_id,week_start' });

  // 9. 일별 트렌드 스냅샷
  const today = new Date().toISOString().split('T')[0];
  const trendSnapshots = updates.map((u, i) => ({
    tool_id: u.id,
    snapshot_date: today,
    ranking_position: i + 1,
    ranking_score: u.rating_avg,
    visit_count: toolMap.get(u.id)?.visit_count || 0,
    review_count: u.review_count,
    bookmark_count: 0,
    upvote_count: toolMap.get(u.id)?.upvote_count || 0,
  }));

  await supabase
    .from('trend_snapshots')
    .upsert(trendSnapshots, { onConflict: 'tool_id,snapshot_date' });

  return NextResponse.json({
    success: true,
    updated: updatedCount,
    total: tools.length,
    week_start: weekStart,
    snapshot_error: snapshotError?.message || null,
  });
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}
