import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { MIN_PROVOCATION_DESCRIPTION_LENGTH, MAX_PROVOCATION_DESCRIPTION_LENGTH } from '@/lib/constants';
import type { Provocation, ProvocationFilters } from '@/types';

/** GET /api/provocation - 제안 목록 조회 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ provocations: [], total: 0 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const keyword = searchParams.get('keyword');
  const sort = searchParams.get('sort') || 'latest';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 기본 쿼리
  let query = supabase
    .from('provocations')
    .select('*', { count: 'exact' });

  // 상태 필터
  if (status) {
    query = query.eq('status', status);
  }

  // 카테고리 필터
  if (category) {
    query = query.eq('category', category);
  }

  // 키워드 검색
  if (keyword) {
    query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
  }

  // 정렬
  switch (sort) {
    case 'popular':
      query = query.order('vote_up_count', { ascending: false });
      break;
    case 'votes':
      query = query.order('vote_up_count', { ascending: false });
      break;
    case 'latest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // 페이지네이션
  query = query.range(offset, offset + limit - 1);

  const { data: provocations, error, count } = await query;

  if (error) {
    console.error('Provocation fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch provocations' }, { status: 500 });
  }

  // 사용자 투표 정보 추가
  if (user && provocations) {
    const provocationIds = provocations.map(p => p.id);
    const { data: userVotes } = await supabase
      .from('provocation_votes')
      .select('provocation_id, vote_type')
      .in('provocation_id', provocationIds)
      .eq('user_id', user.id);

    const voteMap = new Map(userVotes?.map(v => [v.provocation_id, v.vote_type]) || []);

    provocations.forEach(p => {
      (p as any).user_vote = voteMap.get(p.id) || null;
      const total = p.vote_up_count + p.vote_down_count;
      (p as any).vote_ratio = total > 0 ? p.vote_up_count / total : 0;
    });
  }

  return NextResponse.json({
    provocations,
    total: count || 0,
  });
}

/** POST /api/provocation - 제안 작성 */
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
  const {
    title,
    category,
    description,
    expected_effect,
    reference_url,
    images = [],
  } = body;

  // 검증
  if (!title || title.length < 5 || title.length > 100) {
    return NextResponse.json({ error: 'Title must be 5-100 characters' }, { status: 400 });
  }

  if (!description || description.length < MIN_PROVOCATION_DESCRIPTION_LENGTH || description.length > MAX_PROVOCATION_DESCRIPTION_LENGTH) {
    return NextResponse.json({ error: `Description must be ${MIN_PROVOCATION_DESCRIPTION_LENGTH}-${MAX_PROVOCATION_DESCRIPTION_LENGTH} characters` }, { status: 400 });
  }

  if (!category || !['feature', 'design', 'bug', 'performance', 'mobile', 'other'].includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  // 사용자명 가져오기
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', user.id)
    .single();

  const userName = profile?.name || profile?.email?.split('@')[0] || 'Anonymous';

  // 제안 생성
  const { data: provocation, error } = await supabase
    .from('provocations')
    .insert({
      user_id: user.id,
      user_name: userName,
      title,
      category,
      description,
      expected_effect,
      reference_url,
      images,
      status: 'submitted',
    })
    .select()
    .single();

  if (error) {
    console.error('Provocation creation error:', error);
    return NextResponse.json({ error: 'Failed to create provocation' }, { status: 500 });
  }

  return NextResponse.json({ provocation }, { status: 201 });
}
