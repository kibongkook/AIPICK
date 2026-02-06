import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** POST /api/guides - 가이드 생성 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, content, category, related_job_id, related_edu_id } = await request.json();
  if (!title || !content || !category) {
    return NextResponse.json({ error: 'title, content, category required' }, { status: 400 });
  }

  // slug 생성: 제목에서 생성
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 80)
    + '-' + Date.now().toString(36);

  const { data: guide, error } = await supabase
    .from('guides')
    .insert({
      title,
      slug,
      content,
      category,
      related_job_id: related_job_id || null,
      related_edu_id: related_edu_id || null,
      author_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ guide }, { status: 201 });
}

/** PATCH /api/guides - 가이드 수정 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, title, content, category } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (category !== undefined) updates.category = category;

  const { error } = await supabase
    .from('guides')
    .update(updates)
    .eq('id', id)
    .eq('author_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/** DELETE /api/guides?id=xxx - 가이드 삭제 */
export async function DELETE(request: NextRequest) {
  const guideId = request.nextUrl.searchParams.get('id');
  if (!guideId) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('guides')
    .delete()
    .eq('id', guideId)
    .eq('author_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
