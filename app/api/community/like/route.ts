import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** POST /api/community/like - 게시물 좋아요 증가 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { post_id } = await request.json();
  if (!post_id) {
    return NextResponse.json({ error: 'post_id required' }, { status: 400 });
  }

  const { data: post } = await supabase
    .from('community_posts')
    .select('like_count')
    .eq('id', post_id)
    .single();

  if (post) {
    await supabase
      .from('community_posts')
      .update({ like_count: post.like_count + 1 })
      .eq('id', post_id);
  }

  return NextResponse.json({ success: true });
}
