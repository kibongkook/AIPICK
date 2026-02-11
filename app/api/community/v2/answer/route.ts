import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * GET /api/community/v2/answer?question_id=xxx
 * 질문과 답변 목록을 함께 반환
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const questionId = searchParams.get('question_id');

  if (!questionId) {
    return NextResponse.json({ error: 'question_id required' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    // localStorage 기반 폴백 — 클라이언트에서 처리
    return NextResponse.json({ question: null, answers: [] });
  }

  const supabase = await createClient();

  // 질문 조회
  const { data: question, error: qError } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', questionId)
    .single();

  if (qError || !question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  // 답변 목록 조회
  const { data: answers } = await supabase
    .from('community_posts')
    .select('*')
    .eq('parent_id', questionId)
    .eq('is_answer', true)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true });

  return NextResponse.json({
    question,
    answers: answers || [],
  });
}

/**
 * POST /api/community/v2/answer
 * 답변 등록
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
  const { question_id, content } = body;

  if (!question_id || !content) {
    return NextResponse.json({ error: 'question_id and content required' }, { status: 400 });
  }

  if (content.length < 10 || content.length > 5000) {
    return NextResponse.json({ error: 'Content must be 10-5000 characters' }, { status: 400 });
  }

  // 질문 존재 확인
  const { data: question } = await supabase
    .from('community_posts')
    .select('id, target_type, target_id, post_type')
    .eq('id', question_id)
    .single();

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  // 사용자명 가져오기
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', user.id)
    .single();

  const userName = profile?.name || profile?.email?.split('@')[0] || 'Anonymous';

  // 답변 생성
  const { data: answer, error } = await supabase
    .from('community_posts')
    .insert({
      user_id: user.id,
      user_name: userName,
      title: `Re: ${content.slice(0, 50)}`,
      content,
      post_type: 'discussion',
      target_type: question.target_type,
      target_id: question.target_id,
      parent_id: question_id,
      is_answer: true,
      media: [],
    })
    .select()
    .single();

  if (error) {
    console.error('Answer creation error:', error);
    return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 });
  }

  return NextResponse.json({ answer }, { status: 201 });
}
