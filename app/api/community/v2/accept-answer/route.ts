import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * POST /api/community/v2/accept-answer
 * 답변 채택 (질문 작성자만 가능)
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { answer_id } = body;

  if (!answer_id) {
    return NextResponse.json({ error: 'answer_id required' }, { status: 400 });
  }

  // 답변 조회
  const { data: answer } = await supabase
    .from('community_posts')
    .select('id, parent_id, is_answer')
    .eq('id', answer_id)
    .single();

  if (!answer || !answer.parent_id || !answer.is_answer) {
    return NextResponse.json({ error: 'Valid answer not found' }, { status: 404 });
  }

  // 질문 조회 + 소유자 확인
  const { data: question } = await supabase
    .from('community_posts')
    .select('id, user_id, accepted_answer_id')
    .eq('id', answer.parent_id)
    .single();

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  if (question.user_id !== user.id) {
    return NextResponse.json({ error: 'Only question owner can accept answers' }, { status: 403 });
  }

  // 채택 업데이트
  const { error } = await supabase
    .from('community_posts')
    .update({ accepted_answer_id: answer_id })
    .eq('id', question.id);

  if (error) {
    console.error('Accept answer error:', error);
    return NextResponse.json({ error: 'Failed to accept answer' }, { status: 500 });
  }

  return NextResponse.json({ success: true, accepted_answer_id: answer_id });
}
