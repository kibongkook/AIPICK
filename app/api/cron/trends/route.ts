import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth } from '@/lib/pipeline/fetcher-base';
import { createClient } from '@/lib/supabase/server';

interface ToolForTrend {
  id: string;
  name: string;
  hybrid_score: number;
  ranking_score: number;
  created_at: string;
  visit_count: number;
  review_count: number;
  upvote_count: number;
}

interface TrendSnapshot {
  tool_id: string;
  ranking_position: number;
}

type TrendDirection = 'up' | 'down' | 'stable' | 'new';

/**
 * POST /api/cron/trends - 일별 트렌드 계산 및 스냅샷 저장
 *
 * 알고리즘:
 * 1. 모든 도구의 hybrid_score(또는 ranking_score) 기준 현재 순위 산정
 * 2. 7일 전 trend_snapshots와 비교하여 순위 변동 계산
 * 3. tools 테이블의 trend_direction / trend_magnitude 업데이트
 * 4. 오늘의 trend_snapshot 저장 (upsert)
 *
 * Vercel Cron 또는 외부 스케줄러에서 호출
 * Authorization: Bearer <CRON_SECRET> 헤더로 인증
 */
export async function POST(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase not configured, skipping' });
  }

  const supabase = await createClient();

  try {
    // 1. 모든 도구 조회 (hybrid_score 우선, fallback ranking_score)
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select('id, name, hybrid_score, ranking_score, created_at, visit_count, review_count, upvote_count');

    if (toolsError || !tools?.length) {
      return NextResponse.json(
        { error: toolsError?.message || 'No tools found' },
        { status: 500 }
      );
    }

    // 2. hybrid_score (fallback ranking_score) 기준 내림차순 정렬 후 현재 순위 부여
    const sortedTools = (tools as ToolForTrend[])
      .map((t) => ({
        ...t,
        effectiveScore: t.hybrid_score > 0 ? t.hybrid_score : t.ranking_score,
      }))
      .sort((a, b) => b.effectiveScore - a.effectiveScore);

    // tool_id → 현재 순위 맵
    const currentPositionMap = new Map<string, number>();
    sortedTools.forEach((tool, idx) => {
      currentPositionMap.set(tool.id, idx + 1);
    });

    // 3. 7일 전 스냅샷 조회
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: oldSnapshots } = await supabase
      .from('trend_snapshots')
      .select('tool_id, ranking_position')
      .eq('snapshot_date', sevenDaysAgoStr);

    // tool_id → 7일 전 순위 맵
    const oldPositionMap = new Map<string, number>();
    (oldSnapshots as TrendSnapshot[] ?? []).forEach((s) => {
      oldPositionMap.set(s.tool_id, s.ranking_position);
    });

    // 4. 트렌드 계산 및 tools 테이블 업데이트
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgoMs = sevenDaysAgo.getTime();
    let updatedCount = 0;
    const snapshotsToUpsert: Array<{
      tool_id: string;
      snapshot_date: string;
      ranking_position: number;
      ranking_score: number;
      visit_count: number;
      review_count: number;
      bookmark_count: number;
      upvote_count: number;
      external_score: number;
    }> = [];

    for (const tool of sortedTools) {
      const currentPosition = currentPositionMap.get(tool.id)!;
      const createdAt = new Date(tool.created_at).getTime();
      const isNew = createdAt > sevenDaysAgoMs;
      const oldPosition = oldPositionMap.get(tool.id);

      let trendDirection: TrendDirection;
      let trendMagnitude: number;

      if (isNew || oldPosition == null) {
        // 생성된 지 7일 미만이거나 7일 전 스냅샷 없음
        trendDirection = 'new';
        trendMagnitude = 0;
      } else {
        // delta > 0 이면 순위가 올라감 (예: 5위 → 3위, oldPosition(5) - currentPosition(3) = 2)
        const delta = oldPosition - currentPosition;

        if (delta > 0) {
          trendDirection = 'up';
          trendMagnitude = delta;
        } else if (delta < 0) {
          trendDirection = 'down';
          trendMagnitude = Math.abs(delta);
        } else {
          trendDirection = 'stable';
          trendMagnitude = 0;
        }
      }

      // tools 테이블 업데이트
      const { error: updateError } = await supabase
        .from('tools')
        .update({
          trend_direction: trendDirection,
          trend_magnitude: trendMagnitude,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tool.id);

      if (!updateError) updatedCount++;

      // 오늘의 스냅샷 데이터 준비
      snapshotsToUpsert.push({
        tool_id: tool.id,
        snapshot_date: today,
        ranking_position: currentPosition,
        ranking_score: tool.effectiveScore,
        visit_count: tool.visit_count,
        review_count: tool.review_count,
        bookmark_count: 0, // 별도 쿼리 없이 기본값
        upvote_count: tool.upvote_count,
        external_score: 0,
      });
    }

    // 5. 북마크 수를 한 번에 가져와서 스냅샷에 반영
    const { data: bookmarkCounts } = await supabase
      .from('bookmarks')
      .select('tool_id');

    const bookmarkMap = new Map<string, number>();
    (bookmarkCounts ?? []).forEach((b: { tool_id: string }) => {
      bookmarkMap.set(b.tool_id, (bookmarkMap.get(b.tool_id) || 0) + 1);
    });

    for (const snapshot of snapshotsToUpsert) {
      snapshot.bookmark_count = bookmarkMap.get(snapshot.tool_id) || 0;
    }

    // 6. 오늘의 trend_snapshot upsert (tool_id + snapshot_date)
    const BATCH_SIZE = 100;
    let snapshotErrors = 0;

    for (let i = 0; i < snapshotsToUpsert.length; i += BATCH_SIZE) {
      const batch = snapshotsToUpsert.slice(i, i + BATCH_SIZE);
      const { error: snapshotError } = await supabase
        .from('trend_snapshots')
        .upsert(batch, { onConflict: 'tool_id,snapshot_date' });

      if (snapshotError) snapshotErrors++;
    }

    return NextResponse.json({
      success: true,
      total: sortedTools.length,
      updated: updatedCount,
      snapshot_date: today,
      compared_to: sevenDaysAgoStr,
      old_snapshots_found: oldSnapshots?.length ?? 0,
      snapshot_errors: snapshotErrors,
    });
  } catch (topError) {
    const errorMsg = topError instanceof Error ? topError.message : String(topError);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
