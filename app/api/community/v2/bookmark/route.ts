import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/** POST /api/community/v2/bookmark - 북마크 토글 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { post_id } = await request.json();

  if (!post_id) {
    return NextResponse.json({ error: 'Missing post_id' }, { status: 400 });
  }

  // 이미 북마크했는지 확인
  const { data: existing } = await supabase
    .from('community_bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', post_id)
    .maybeSingle();

  if (existing) {
    // 북마크 취소
    await supabase
      .from('community_bookmarks')
      .delete()
      .eq('id', existing.id);

    return NextResponse.json({ bookmarked: false });
  } else {
    // 북마크
    const { error } = await supabase
      .from('community_bookmarks')
      .insert({ user_id: user.id, post_id });

    if (error) {
      console.error('Bookmark error:', error);
      return NextResponse.json({ error: 'Failed to bookmark' }, { status: 500 });
    }

    return NextResponse.json({ bookmarked: true });
  }
}
