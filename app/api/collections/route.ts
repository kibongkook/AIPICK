import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** GET /api/collections - 컬렉션 목록 (mine=true면 내 것만) */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const mine = request.nextUrl.searchParams.get('mine') === 'true';

  if (mine) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('collections')
      .select('*, collection_items(*, tool:tools(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ collections: data || [] });
  }

  // 공개 컬렉션 전체
  const { data, error } = await supabase
    .from('collections')
    .select('*, collection_items(*, tool:tools(*))')
    .eq('is_public', true)
    .order('like_count', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ collections: data || [] });
}

/** POST /api/collections - 컬렉션 생성 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description, is_public, tool_ids } = await request.json();
  if (!title) {
    return NextResponse.json({ error: 'title required' }, { status: 400 });
  }

  // 컬렉션 생성
  const { data: collection, error } = await supabase
    .from('collections')
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      is_public: is_public !== false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 도구 추가
  if (collection && tool_ids?.length) {
    const items = tool_ids.map((tool_id: string, index: number) => ({
      collection_id: collection.id,
      tool_id,
      sort_order: index,
    }));
    await supabase.from('collection_items').insert(items);
  }

  return NextResponse.json({ collection }, { status: 201 });
}

/** DELETE /api/collections?id=xxx - 컬렉션 삭제 */
export async function DELETE(request: NextRequest) {
  const collectionId = request.nextUrl.searchParams.get('id');
  if (!collectionId) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/** PATCH /api/collections - 컬렉션 수정 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, title, description, is_public, tool_ids } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  // 컬렉션 업데이트
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (is_public !== undefined) updates.is_public = is_public;

  const { error } = await supabase
    .from('collections')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 도구 목록 재설정
  if (tool_ids !== undefined) {
    await supabase.from('collection_items').delete().eq('collection_id', id);
    if (tool_ids.length) {
      const items = tool_ids.map((tool_id: string, index: number) => ({
        collection_id: id,
        tool_id,
        sort_order: index,
      }));
      await supabase.from('collection_items').insert(items);
    }
  }

  return NextResponse.json({ success: true });
}
