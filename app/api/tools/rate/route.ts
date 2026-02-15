import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const MIN_RATING = 0.5;
const MAX_RATING = 5.0;
const RATING_STEP = 0.5;

function isValidRating(value: number): boolean {
  return value >= MIN_RATING && value <= MAX_RATING && value % RATING_STEP === 0;
}

/** GET /api/tools/rate?tool_id=xxx — 내 평가 조회 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ rating: null }, { status: 200 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ rating: null }, { status: 200 });
  }

  const toolId = request.nextUrl.searchParams.get('tool_id');
  if (!toolId) {
    return NextResponse.json({ error: 'tool_id required' }, { status: 400 });
  }

  const { data } = await supabase
    .from('tool_ratings')
    .select('rating')
    .eq('tool_id', toolId)
    .eq('user_id', user.id)
    .single();

  return NextResponse.json({ rating: data?.rating ?? null });
}

/** POST /api/tools/rate — 평가 등록/수정 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const { tool_id, rating } = body;

  if (!tool_id || typeof rating !== 'number' || !isValidRating(rating)) {
    return NextResponse.json(
      { error: `Invalid rating. Must be ${MIN_RATING}-${MAX_RATING} in ${RATING_STEP} increments.` },
      { status: 400 }
    );
  }

  // Upsert: 기존 평가 있으면 업데이트, 없으면 생성
  const { error: upsertError } = await supabase
    .from('tool_ratings')
    .upsert(
      { tool_id, user_id: user.id, rating, updated_at: new Date().toISOString() },
      { onConflict: 'tool_id,user_id' }
    );

  if (upsertError) {
    console.error('Rating upsert error:', upsertError);
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 });
  }

  // 평균 재계산
  const { data: stats } = await supabase
    .from('tool_ratings')
    .select('rating')
    .eq('tool_id', tool_id);

  const ratings = stats?.map(r => r.rating) || [];
  const avg = ratings.length > 0
    ? Math.round((ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length) * 10) / 10
    : 0;
  const count = ratings.length;

  // tools 테이블 업데이트
  await supabase
    .from('tools')
    .update({ rating_avg: avg, review_count: count })
    .eq('id', tool_id);

  return NextResponse.json({ avg, count, my_rating: rating });
}
