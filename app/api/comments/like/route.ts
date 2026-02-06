import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** POST /api/comments/like - 댓글 좋아요 증가 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { comment_id } = await request.json();
  if (!comment_id) {
    return NextResponse.json({ error: 'comment_id required' }, { status: 400 });
  }

  // select → +1 → update
  const { data: comment } = await supabase
    .from('comments')
    .select('like_count')
    .eq('id', comment_id)
    .single();

  if (comment) {
    await supabase
      .from('comments')
      .update({ like_count: comment.like_count + 1 })
      .eq('id', comment_id);
  }

  return NextResponse.json({ success: true });
}
