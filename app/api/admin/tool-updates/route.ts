import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/auth/adminCheck';

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return { user: null, supabase };
  }
  return { user, supabase };
}

/** POST /api/admin/tool-updates - 업데이트 생성 */
export async function POST(request: NextRequest) {
  const { user, supabase } = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { title, tool_id, update_type, description, source_url, image_url, version, impact, announced_at } = body;

  if (!title || !tool_id) {
    return NextResponse.json({ error: 'title, tool_id required' }, { status: 400 });
  }

  const { data: update, error } = await supabase
    .from('tool_updates')
    .insert({
      title,
      tool_id,
      update_type: update_type || 'other',
      description: description || null,
      source_url: source_url || null,
      image_url: image_url || null,
      version: version || null,
      impact: impact || 'minor',
      announced_at: announced_at || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ update }, { status: 201 });
}

/** PATCH /api/admin/tool-updates - 업데이트 수정 */
export async function PATCH(request: NextRequest) {
  const { user, supabase } = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('tool_updates')
    .update(updates)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/** DELETE /api/admin/tool-updates?id=xxx - 업데이트 삭제 */
export async function DELETE(request: NextRequest) {
  const { user, supabase } = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const { error } = await supabase.from('tool_updates').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
