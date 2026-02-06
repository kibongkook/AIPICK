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

/** POST /api/admin/tools - 도구 생성 */
export async function POST(request: NextRequest) {
  const { user, supabase } = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, slug, description, category_id, url, pricing_type, free_quota_detail, tags, supports_korean, pros, cons } = body;

  if (!name || !slug || !description || !category_id || !url || !pricing_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: tool, error } = await supabase
    .from('tools')
    .insert({
      name,
      slug,
      description,
      category_id,
      url,
      pricing_type,
      free_quota_detail: free_quota_detail || null,
      tags: tags || [],
      supports_korean: supports_korean || false,
      pros: pros || [],
      cons: cons || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tool }, { status: 201 });
}

/** PATCH /api/admin/tools - 도구 수정 */
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
    .from('tools')
    .update(updates)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/** DELETE /api/admin/tools?id=xxx - 도구 삭제 */
export async function DELETE(request: NextRequest) {
  const { user, supabase } = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const { error } = await supabase.from('tools').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
