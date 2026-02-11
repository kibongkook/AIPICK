import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth } from '@/lib/pipeline/fetcher-base';

const PICK_CYCLE_DAYS = 7;

interface ToolRow {
  id: string;
  name: string;
  rating_avg: number;
  visit_count: number;
  pricing_type: string;
  free_quota_detail: string | null;
  supports_korean: boolean;
  trend_direction: string | null;
  trend_magnitude: number;
  review_count: number;
}

const TOOL_SELECT = 'id, name, rating_avg, visit_count, pricing_type, free_quota_detail, supports_korean, trend_direction, trend_magnitude, review_count';

/**
 * 도구 데이터를 기반으로 사실적인 추천 이유를 생성
 */
function generateReason(tool: ToolRow, pickType: string): string {
  switch (pickType) {
    case 'trending': {
      const parts: string[] = [];
      if (tool.visit_count > 100_000_000) {
        parts.push(`월 ${Math.round(tool.visit_count / 1_000_000)}M 사용자 보유`);
      } else if (tool.visit_count > 10_000_000) {
        parts.push(`월 ${Math.round(tool.visit_count / 1_000_000)}M+ 방문`);
      } else if (tool.visit_count > 1_000_000) {
        parts.push(`월 ${(tool.visit_count / 1_000_000).toFixed(1)}M 방문`);
      }
      if (tool.trend_magnitude >= 5) {
        parts.push('최근 사용량 급증');
      } else {
        parts.push('사용량 꾸준히 증가 중');
      }
      if (tool.rating_avg >= 4.5) {
        parts.push(`평점 ${tool.rating_avg.toFixed(1)}점`);
      }
      if (tool.supports_korean) parts.push('한국어 지원');
      return parts.slice(0, 2).join(', ');
    }

    case 'new': {
      const parts: string[] = [];
      if (tool.pricing_type === 'Free') {
        parts.push('완전 무료로 바로 시작 가능');
      } else if (tool.free_quota_detail) {
        const quota = tool.free_quota_detail.slice(0, 30);
        parts.push(`무료: ${quota}`);
      }
      if (tool.rating_avg >= 4.0) {
        parts.push(`출시 초기 평점 ${tool.rating_avg.toFixed(1)}점 기록`);
      }
      if (tool.supports_korean) parts.push('한국어 지원');
      if (tool.review_count > 0) {
        parts.push(`이미 ${tool.review_count}개 리뷰 확보`);
      }
      return parts.slice(0, 2).join(' · ') || '새로 등장한 주목할 AI 서비스';
    }

    case 'hidden_gem': {
      const parts: string[] = [];
      parts.push(`평점 ${tool.rating_avg.toFixed(1)}점의 숨은 보석`);
      if (tool.pricing_type === 'Free') {
        parts.push('완전 무료');
      } else if (tool.pricing_type === 'Freemium' && tool.free_quota_detail) {
        parts.push(`무료 사용 가능`);
      }
      if (tool.supports_korean) parts.push('한국어 지원');
      if (tool.review_count > 0) {
        parts.push(`${tool.review_count}개 리뷰에서 검증`);
      }
      return parts.slice(0, 2).join(', ');
    }

    case 'price_drop': {
      if (tool.pricing_type === 'Free') {
        const parts = ['제한 없이 완전 무료 사용'];
        if (tool.rating_avg >= 4.0) parts.push(`평점 ${tool.rating_avg.toFixed(1)}점`);
        if (tool.supports_korean) parts.push('한국어 지원');
        return parts.slice(0, 2).join(', ');
      }
      const parts: string[] = [];
      if (tool.free_quota_detail) {
        parts.push(`무료 제공: ${tool.free_quota_detail.slice(0, 35)}`);
      } else {
        parts.push('넉넉한 무료 사용량 제공');
      }
      if (tool.rating_avg >= 4.0) parts.push(`평점 ${tool.rating_avg.toFixed(1)}점`);
      if (tool.supports_korean) parts.push('한국어 지원');
      return parts.slice(0, 2).join(', ');
    }

    default:
      return `에디터가 검증한 추천 AI`;
  }
}

/**
 * POST /api/cron/daily-picks - 주간 자동 PICK 선정 (7일 주기)
 *
 * 4가지 유형:
 * - trending: 사용량 급상승 (trend_direction='up', trend_magnitude 높은 순)
 * - new: 최근 등록된 신규 도구
 * - hidden_gem: 평점 높지만 아직 덜 알려진 도구
 * - price_drop: 무료/넉넉한 무료 사용량 도구
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
  const today = new Date().toISOString().split('T')[0];

  // 7일 이내 기존 PICK이 있으면 스킵
  const cycleStart = new Date(Date.now() - PICK_CYCLE_DAYS * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { data: recentPicks } = await supabase
    .from('daily_picks')
    .select('id')
    .gte('pick_date', cycleStart)
    .limit(1);

  if (recentPicks?.length) {
    return NextResponse.json({
      message: 'Weekly picks still valid, skipping',
      next_update_after: new Date(Date.now() + PICK_CYCLE_DAYS * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  }

  const picks: { tool_id: string; pick_type: string; reason: string; sort_order: number }[] = [];
  let order = 0;

  // 1. 급상승 (2개)
  const { data: trending } = await supabase
    .from('tools')
    .select(TOOL_SELECT)
    .eq('trend_direction', 'up')
    .order('trend_magnitude', { ascending: false })
    .limit(2);

  for (const t of (trending || []) as ToolRow[]) {
    picks.push({
      tool_id: t.id,
      pick_type: 'trending',
      reason: generateReason(t, 'trending'),
      sort_order: order++,
    });
  }

  // 2. 신규 (2개) - 최근 30일 (기존 7일보다 넓은 범위)
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: newTools } = await supabase
    .from('tools')
    .select(TOOL_SELECT)
    .gte('created_at', monthAgo)
    .order('created_at', { ascending: false })
    .limit(4);

  for (const t of (newTools || []) as ToolRow[]) {
    if (picks.length >= 4) break;
    if (!picks.some(p => p.tool_id === t.id)) {
      picks.push({
        tool_id: t.id,
        pick_type: 'new',
        reason: generateReason(t, 'new'),
        sort_order: order++,
      });
    }
  }

  // 3. 숨은 명작 (2개) - 평점 높고 방문 적은
  const { data: hidden } = await supabase
    .from('tools')
    .select(TOOL_SELECT)
    .gte('rating_avg', 4.0)
    .lt('visit_count', 5000000)
    .order('rating_avg', { ascending: false })
    .limit(6);

  for (const t of (hidden || []) as ToolRow[]) {
    if (picks.length >= 6) break;
    if (!picks.some(p => p.tool_id === t.id)) {
      picks.push({
        tool_id: t.id,
        pick_type: 'hidden_gem',
        reason: generateReason(t, 'hidden_gem'),
        sort_order: order++,
      });
    }
  }

  // 4. 무료 추천 (2개)
  const { data: freeGems } = await supabase
    .from('tools')
    .select(TOOL_SELECT)
    .in('pricing_type', ['Free', 'Freemium'])
    .order('ranking_score', { ascending: false })
    .limit(6);

  for (const t of (freeGems || []) as ToolRow[]) {
    if (picks.length >= 8) break;
    if (!picks.some(p => p.tool_id === t.id)) {
      picks.push({
        tool_id: t.id,
        pick_type: 'price_drop',
        reason: generateReason(t, 'price_drop'),
        sort_order: order++,
      });
    }
  }

  // DB 저장
  if (picks.length > 0) {
    const rows = picks.map(p => ({ ...p, pick_date: today }));
    const { error } = await supabase.from('daily_picks').insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    message: `Weekly picks generated: ${picks.length} items`,
    date: today,
    next_update_after: new Date(Date.now() + PICK_CYCLE_DAYS * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    picks: picks.map(p => ({ type: p.pick_type, tool_id: p.tool_id, reason: p.reason })),
  });
}
