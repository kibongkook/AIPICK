import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth } from '@/lib/pipeline/fetcher-base';
import { calculateHybridScore, loadScoringWeights } from '@/lib/scoring';
import type { ToolMetrics, MaxValues } from '@/lib/scoring';

/**
 * POST /api/cron/ranking - 하이브리드 랭킹 점수 재계산 + 주간 스냅샷
 *
 * 하이브리드 공식: 내부 점수(사용자 데이터) + 외부 점수(벤치마크/GitHub/PH)
 * 모든 가중치는 scoring_weights 테이블에서 런타임 로드
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
    .select('id, visit_count, rating_avg, review_count, upvote_count, has_benchmark_data, category_id');

  if (toolsError || !tools?.length) {
    return NextResponse.json({ error: toolsError?.message || 'No tools found' }, { status: 500 });
  }

  // 3. 북마크 카운트 조회
  const { data: bookmarkCounts } = await supabase
    .from('bookmarks')
    .select('tool_id');

  const bookmarkMap = new Map<string, number>();
  (bookmarkCounts || []).forEach((b) => {
    bookmarkMap.set(b.tool_id, (bookmarkMap.get(b.tool_id) || 0) + 1);
  });

  // 4. 외부 점수 조회
  const { data: externalScores } = await supabase
    .from('tool_external_scores')
    .select('tool_id, source_key, normalized_score');

  const externalMap = new Map<string, Map<string, number>>();
  (externalScores || []).forEach((es) => {
    if (!externalMap.has(es.tool_id)) {
      externalMap.set(es.tool_id, new Map());
    }
    externalMap.get(es.tool_id)!.set(es.source_key, Number(es.normalized_score));
  });

  // 5. 정규화 최대값 계산
  const maxValues: MaxValues = {
    max_visit: Math.max(...tools.map((t) => t.visit_count), 1),
    max_review: Math.max(...tools.map((t) => t.review_count), 1),
    max_bookmark: Math.max(...Array.from(bookmarkMap.values()), 1),
    max_upvote: Math.max(...tools.map((t) => t.upvote_count), 1),
  };

  // 6. 하이브리드 점수 계산
  const updates = tools.map((tool) => {
    const toolMetrics: ToolMetrics = {
      visit_count: tool.visit_count,
      rating_avg: tool.rating_avg,
      review_count: tool.review_count,
      bookmark_count: bookmarkMap.get(tool.id) || 0,
      upvote_count: tool.upvote_count,
      has_benchmark_data: tool.has_benchmark_data ?? false,
      external_scores: externalMap.get(tool.id) || new Map(),
    };

    const result = calculateHybridScore(toolMetrics, weights, maxValues);

    return {
      id: tool.id,
      ...result,
      // 하위 호환: ranking_score도 hybrid_score로 동기화
      ranking_score: result.hybrid_score,
    };
  });

  // 7. 점수순 정렬
  updates.sort((a, b) => b.hybrid_score - a.hybrid_score);

  // 8. DB 업데이트
  let updatedCount = 0;
  for (let i = 0; i < updates.length; i++) {
    const { error } = await supabase
      .from('tools')
      .update({
        hybrid_score: updates[i].hybrid_score,
        internal_score: updates[i].internal_score,
        external_score: updates[i].external_score,
        ranking_score: updates[i].ranking_score,
        prev_ranking: i + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updates[i].id);

    if (!error) updatedCount++;
  }

  // 9. 주간 랭킹 스냅샷
  const weekStart = getWeekStart();
  const snapshots = updates.map((u, i) => ({
    tool_id: u.id,
    week_start: weekStart,
    ranking: i + 1,
    ranking_score: u.hybrid_score,
    visit_count: tools.find((t) => t.id === u.id)?.visit_count || 0,
  }));

  const { error: snapshotError } = await supabase
    .from('weekly_rankings')
    .upsert(snapshots, { onConflict: 'tool_id,week_start' });

  // 10. 일별 트렌드 스냅샷
  const today = new Date().toISOString().split('T')[0];
  const trendSnapshots = updates.map((u, i) => ({
    tool_id: u.id,
    snapshot_date: today,
    ranking_position: i + 1,
    ranking_score: u.hybrid_score,
    visit_count: tools.find((t) => t.id === u.id)?.visit_count || 0,
    review_count: tools.find((t) => t.id === u.id)?.review_count || 0,
    bookmark_count: bookmarkMap.get(u.id) || 0,
    upvote_count: tools.find((t) => t.id === u.id)?.upvote_count || 0,
    external_score: u.external_score,
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
    weights_source: externalScores?.length ? 'hybrid' : 'internal_only',
  });
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}
