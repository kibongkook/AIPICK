import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** POST /api/reviews/helpful - 도움이 됨 카운트 증가 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { review_id } = await request.json();
  if (!review_id) {
    return NextResponse.json({ error: 'review_id required' }, { status: 400 });
  }

  // select → +1 → update
  const { data: review } = await supabase
    .from('reviews')
    .select('helpful_count')
    .eq('id', review_id)
    .single();

  if (review) {
    await supabase
      .from('reviews')
      .update({ helpful_count: review.helpful_count + 1 })
      .eq('id', review_id);
  }

  return NextResponse.json({ success: true });
}
