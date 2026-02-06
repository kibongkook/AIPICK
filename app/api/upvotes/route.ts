import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** GET /api/upvotes?tool_id=xxx - 업보트 상태 확인 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const toolId = request.nextUrl.searchParams.get('tool_id');
  if (!toolId) {
    return NextResponse.json({ error: 'tool_id required' }, { status: 400 });
  }

  const { data } = await supabase
    .from('upvotes')
    .select('id')
    .eq('user_id', user.id)
    .eq('tool_id', toolId)
    .maybeSingle();

  return NextResponse.json({ upvoted: !!data });
}

/** POST /api/upvotes - 업보트 토글 */
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
    .from('upvotes')
    .select('id')
    .eq('user_id', user.id)
    .eq('tool_id', tool_id)
    .maybeSingle();

  if (existing) {
    await supabase.from('upvotes').delete().eq('id', existing.id);
    return NextResponse.json({ upvoted: false });
  } else {
    await supabase.from('upvotes').insert({ user_id: user.id, tool_id });
    return NextResponse.json({ upvoted: true });
  }
}
