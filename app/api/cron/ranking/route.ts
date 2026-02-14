import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth } from '@/lib/pipeline/fetcher-base';
import { calculateHybridScore, loadScoringWeights } from '@/lib/scoring';
import type { ToolMetrics } from '@/lib/scoring';

/**
 * POST /api/cron/ranking - 4-카테고리 하이브리드 랭킹 점수 재계산 + 주간 스냅샷
 *
 * 4-카테고리: 사용자 리뷰(40%) + 인기도(25%) + 커뮤니티(25%) + 벤치마크(10%)
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
    .select('id, has_benchmark_data, visit_count, review_count, upvote_count');

  if (toolsError || !tools?.length) {
    return NextResponse.json({ error: toolsError?.message || 'No tools found' }, { status: 500 });
  }

  // 3. 카테고리 slug 매핑 (LLM 판단용) — 다중 카테고리에서 primary 카테고리 사용
  const { data: toolCategories } = await supabase
    .from('tool_categories')
    .select('tool_id, category_id, is_primary');

  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug');
  const catIdToSlug = new Map((categories || []).map((c) => [c.id, c.slug]));

  // tool_id → primary category slug
  const toolCatSlugMap = new Map<string, string>();
  for (const tc of toolCategories || []) {
    if (tc.is_primary) {
      toolCatSlugMap.set(tc.tool_id, catIdToSlug.get(tc.category_id) || '');
    }
  }
  // primary가 없는 경우 첫 번째 카테고리 사용
  for (const tc of toolCategories || []) {
    if (!toolCatSlugMap.has(tc.tool_id)) {
      toolCatSlugMap.set(tc.tool_id, catIdToSlug.get(tc.category_id) || '');
    }
  }

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

  // 5. 하이브리드 점수 계산 (4-카테고리)
  const { isBenchmarkApplicable } = await import('@/lib/scoring/hybrid');

  const updates = tools.map((tool) => {
    const categorySlug = toolCatSlugMap.get(tool.id) || '';
    const isLlm = isBenchmarkApplicable(categorySlug) || tool.has_benchmark_data;

    const toolMetrics: ToolMetrics = {
      is_llm: isLlm,
      category_slug: categorySlug,
      external_scores: externalMap.get(tool.id) || new Map(),
    };

    const result = calculateHybridScore(toolMetrics, weights);

    return {
      id: tool.id,
      ...result,
      // 하위 호환: ranking_score도 hybrid_score로 동기화
      ranking_score: result.hybrid_score,
    };
  });

  // 6. 점수순 정렬
  updates.sort((a, b) => b.hybrid_score - a.hybrid_score);

  // 7. DB 업데이트
  let updatedCount = 0;
  for (let i = 0; i < updates.length; i++) {
    const u = updates[i];
    const { error } = await supabase
      .from('tools')
      .update({
        hybrid_score: u.hybrid_score,
        // 하위 호환: internal/external을 카테고리별로 매핑
        internal_score: u.review_score,
        external_score: u.popularity_score + u.community_score + u.benchmark_score,
        ranking_score: u.ranking_score,
        confidence_level: u.confidence_level,
        confidence_source_count: u.contributing_sources.length,
        prev_ranking: i + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', u.id);

    if (!error) updatedCount++;
  }

  // 8. 주간 랭킹 스냅샷
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

  // 9. 일별 트렌드 스냅샷
  const today = new Date().toISOString().split('T')[0];
  const trendSnapshots = updates.map((u, i) => ({
    tool_id: u.id,
    snapshot_date: today,
    ranking_position: i + 1,
    ranking_score: u.hybrid_score,
    visit_count: tools.find((t) => t.id === u.id)?.visit_count || 0,
    review_count: tools.find((t) => t.id === u.id)?.review_count || 0,
    bookmark_count: 0,
    upvote_count: tools.find((t) => t.id === u.id)?.upvote_count || 0,
    external_score: u.popularity_score + u.community_score + u.benchmark_score,
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
