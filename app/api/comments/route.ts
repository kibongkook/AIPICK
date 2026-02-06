import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** GET /api/comments?target_type=tool&target_id=xxx */
export async function GET(request: NextRequest) {
  const targetType = request.nextUrl.searchParams.get('target_type') || 'tool';
  const targetId = request.nextUrl.searchParams.get('target_id');
  if (!targetId) {
    return NextResponse.json({ error: 'target_id required' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: comments || [] });
}

/** POST /api/comments - 댓글 생성 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { target_type, target_id, content, parent_id } = body;

  if (!target_id || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      target_type: target_type || 'tool',
      target_id,
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '사용자',
      parent_id: parent_id || null,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comment }, { status: 201 });
}

/** DELETE /api/comments?id=xxx */
export async function DELETE(request: NextRequest) {
  const commentId = request.nextUrl.searchParams.get('id');
  if (!commentId) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 대댓글도 삭제 (CASCADE로 처리됨)
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
