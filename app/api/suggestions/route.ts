import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const MIN_DESCRIPTION_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_REASON_LENGTH = 20;
const MAX_REASON_LENGTH = 200;

/** POST /api/suggestions - 새로운 AI 서비스 제안 */
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
  const { tool_name, tool_url, tool_description, category_slug, reason } = body;

  // 필수 필드 검증
  if (!tool_name || !tool_url || !tool_description || !category_slug || !reason) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 길이 검증
  if (tool_description.length < MIN_DESCRIPTION_LENGTH || tool_description.length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json(
      { error: `설명은 ${MIN_DESCRIPTION_LENGTH}-${MAX_DESCRIPTION_LENGTH}자 사이여야 합니다` },
      { status: 400 }
    );
  }

  if (reason.length < MIN_REASON_LENGTH || reason.length > MAX_REASON_LENGTH) {
    return NextResponse.json(
      { error: `제안 이유는 ${MIN_REASON_LENGTH}-${MAX_REASON_LENGTH}자 사이여야 합니다` },
      { status: 400 }
    );
  }

  // URL 검증
  try {
    new URL(tool_url);
  } catch {
    return NextResponse.json({ error: '유효한 URL을 입력해주세요' }, { status: 400 });
  }

  // 카테고리 검증
  const { data: category } = await supabase
    .from('categories')
    .select('slug')
    .eq('slug', category_slug)
    .single();

  if (!category) {
    return NextResponse.json({ error: '유효하지 않은 카테고리입니다' }, { status: 400 });
  }

  // 중복 확인 (URL 기준)
  const { data: existing } = await supabase
    .from('tool_suggestions')
    .select('id')
    .eq('tool_url', tool_url)
    .eq('status', 'pending')
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: '이미 제안된 서비스입니다' }, { status: 409 });
  }

  // 사용자명 가져오기
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', user.id)
    .single();

  const userName = profile?.name || profile?.email?.split('@')[0] || 'Anonymous';

  // 제안 생성
  const { data: suggestion, error } = await supabase
    .from('tool_suggestions')
    .insert({
      user_id: user.id,
      user_name: userName,
      tool_name,
      tool_url,
      tool_description,
      category_slug,
      reason,
    })
    .select()
    .single();

  if (error) {
    console.error('Suggestion creation error:', error);
    return NextResponse.json({ error: 'Failed to create suggestion' }, { status: 500 });
  }

  return NextResponse.json({ suggestion }, { status: 201 });
}

/** GET /api/suggestions - 제안 목록 조회 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ suggestions: [] });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';
  const sort = searchParams.get('sort') || 'latest'; // latest | popular
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('tool_suggestions')
    .select('*')
    .eq('status', status)
    .range(offset, offset + limit - 1);

  // 정렬
  if (sort === 'popular') {
    query = query.order('vote_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: suggestions, error } = await query;

  if (error) {
    console.error('Suggestions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }

  // 사용자가 투표했는지 확인
  if (user) {
    const { data: votes } = await supabase
      .from('tool_suggestion_votes')
      .select('suggestion_id')
      .eq('user_id', user.id)
      .in('suggestion_id', suggestions.map(s => s.id));

    const voteSet = new Set(votes?.map(v => v.suggestion_id) || []);
    suggestions.forEach(s => {
      s.has_voted = voteSet.has(s.id);
    });
  }

  return NextResponse.json({ suggestions });
}
