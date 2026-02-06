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

/** POST /api/admin/news - 뉴스 생성 */
export async function POST(request: NextRequest) {
  const { user, supabase } = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { title, summary, content, category, source_url, source_name, image_url } = body;

  if (!title || !category) {
    return NextResponse.json({ error: 'title, category required' }, { status: 400 });
  }

  const { data: news, error } = await supabase
    .from('news')
    .insert({
      title,
      summary: summary || null,
      content: content || null,
      category,
      source_url: source_url || null,
      source_name: source_name || null,
      image_url: image_url || null,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ news }, { status: 201 });
}

/** PATCH /api/admin/news - 뉴스 수정 */
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
    .from('news')
    .update(updates)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/** DELETE /api/admin/news?id=xxx - 뉴스 삭제 */
export async function DELETE(request: NextRequest) {
  const { user, supabase } = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const { error } = await supabase.from('news').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
