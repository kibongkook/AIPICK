import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** GET /api/reviews?tool_id=xxx */
export async function GET(request: NextRequest) {
  const toolId = request.nextUrl.searchParams.get('tool_id');
  if (!toolId) {
    return NextResponse.json({ error: 'tool_id required' }, { status: 400 });
  }

  const supabase = await createClient();

  // 리뷰 + 기능별 평가 조인
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*, tool_feature_ratings(*)')
    .eq('tool_id', toolId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // StoredReview 형태로 변환
  const mapped = (reviews || []).map((r) => {
    const fr = r.tool_feature_ratings?.[0];
    return {
      id: r.id,
      tool_id: r.tool_id,
      user_id: r.user_id,
      user_name: r.user_name || '사용자',
      rating: r.rating,
      content: r.content,
      feature_ratings: {
        ease_of_use: fr?.ease_of_use || 0,
        korean_support: fr?.korean_support || 0,
        free_quota: fr?.free_quota || 0,
        feature_variety: fr?.feature_variety || 0,
        value_for_money: fr?.value_for_money || 0,
      },
      helpful_count: r.helpful_count,
      created_at: r.created_at,
    };
  });

  return NextResponse.json({ reviews: mapped });
}

/** POST /api/reviews - 리뷰 생성 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { tool_id, rating, content, feature_ratings } = body;

  if (!tool_id || !rating || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 리뷰 생성
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      tool_id,
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '사용자',
      rating,
      content,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '이미 리뷰를 작성했습니다' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 기능별 평가 저장
  if (feature_ratings && review) {
    await supabase.from('tool_feature_ratings').insert({
      review_id: review.id,
      tool_id,
      user_id: user.id,
      ease_of_use: feature_ratings.ease_of_use || null,
      korean_support: feature_ratings.korean_support || null,
      free_quota: feature_ratings.free_quota || null,
      feature_variety: feature_ratings.feature_variety || null,
      value_for_money: feature_ratings.value_for_money || null,
    });
  }

  return NextResponse.json({ review }, { status: 201 });
}

/** DELETE /api/reviews?id=xxx */
export async function DELETE(request: NextRequest) {
  const reviewId = request.nextUrl.searchParams.get('id');
  if (!reviewId) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
