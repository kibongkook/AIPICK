import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * POST /api/cron/ranking - 전체 랭킹 점수 재계산 + 주간 스냅샷
 *
 * 랭킹 공식: 방문수(40%) + 평점(30%) + 리뷰수(20%) + 북마크수(10%)
 *
 * Vercel Cron 또는 외부 스케줄러에서 호출
 * Authorization: Bearer <CRON_SECRET> 헤더로 인증
 */
export async function POST(request: NextRequest) {
  // 크론 시크릿 검증
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase not configured, skipping' });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  // 1. 모든 도구 조회
  const { data: tools, error: toolsError } = await supabase
    .from('tools')
    .select('id, visit_count, rating_avg, review_count, upvote_count');

  if (toolsError || !tools?.length) {
    return NextResponse.json({ error: toolsError?.message || 'No tools found' }, { status: 500 });
  }

  // 2. 북마크 카운트 조회
  const { data: bookmarkCounts } = await supabase
    .from('bookmarks')
    .select('tool_id');

  const bookmarkMap = new Map<string, number>();
  (bookmarkCounts || []).forEach((b) => {
    bookmarkMap.set(b.tool_id, (bookmarkMap.get(b.tool_id) || 0) + 1);
  });

  // 3. 정규화를 위한 최대값 계산
  const maxVisit = Math.max(...tools.map((t) => t.visit_count), 1);
  const maxReview = Math.max(...tools.map((t) => t.review_count), 1);
  const maxBookmark = Math.max(...Array.from(bookmarkMap.values()), 1);

  // 4. 랭킹 점수 계산 및 업데이트
  const updates = tools.map((tool) => {
    const bookmarkCount = bookmarkMap.get(tool.id) || 0;
    const score =
      (tool.visit_count / maxVisit) * 40 +
      (tool.rating_avg / 5) * 30 +
      (tool.review_count / maxReview) * 20 +
      (bookmarkCount / maxBookmark) * 10;

    return {
      id: tool.id,
      ranking_score: Math.round(score * 100) / 100,
    };
  });

  // 점수순 정렬하여 이전 랭킹 계산
  updates.sort((a, b) => b.ranking_score - a.ranking_score);

  let updatedCount = 0;
  for (let i = 0; i < updates.length; i++) {
    const { error } = await supabase
      .from('tools')
      .update({
        ranking_score: updates[i].ranking_score,
        prev_ranking: i + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updates[i].id);

    if (!error) updatedCount++;
  }

  // 5. 주간 랭킹 스냅샷 생성
  const weekStart = getWeekStart();
  const snapshots = updates.map((u, i) => ({
    tool_id: u.id,
    week_start: weekStart,
    ranking: i + 1,
    ranking_score: u.ranking_score,
    visit_count: tools.find((t) => t.id === u.id)?.visit_count || 0,
  }));

  // upsert (이번 주 이미 있으면 갱신)
  const { error: snapshotError } = await supabase
    .from('weekly_rankings')
    .upsert(snapshots, { onConflict: 'tool_id,week_start' });

  return NextResponse.json({
    success: true,
    updated: updatedCount,
    total: tools.length,
    week_start: weekStart,
    snapshot_error: snapshotError?.message || null,
  });
}

/** 이번 주 월요일 날짜 반환 (YYYY-MM-DD) */
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}
