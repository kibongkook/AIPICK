import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** GET /api/bookmarks - 사용자 북마크 목록 (tool_id 파라미터 있으면 단일 확인) */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const toolId = request.nextUrl.searchParams.get('tool_id');

  if (toolId) {
    // 단일 북마크 확인
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .maybeSingle();

    return NextResponse.json({ bookmarked: !!data });
  }

  // 전체 북마크 목록
  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('tool_id')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    bookmarkedIds: (bookmarks || []).map((b) => b.tool_id),
  });
}

/** POST /api/bookmarks - 북마크 토글 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tool_id } = await request.json();
  if (!tool_id) {
    return NextResponse.json({ error: 'tool_id required' }, { status: 400 });
  }

  // 이미 존재하는지 확인
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('tool_id', tool_id)
    .maybeSingle();

  if (existing) {
    // 삭제
    await supabase.from('bookmarks').delete().eq('id', existing.id);
    return NextResponse.json({ bookmarked: false });
  } else {
    // 생성
    await supabase.from('bookmarks').insert({ user_id: user.id, tool_id });
    return NextResponse.json({ bookmarked: true });
  }
}
