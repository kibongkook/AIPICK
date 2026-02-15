import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  MIN_POST_CONTENT_LENGTH,
  MAX_POST_CONTENT_LENGTH,
  RATING_MIN,
  RATING_MAX,
} from '@/lib/constants';

const VALID_POST_TYPES = ['rating', 'discussion', 'tip', 'question'] as const;
const VALID_TARGET_TYPES = ['tool', 'news', 'guide'] as const;
const VALID_SORT_OPTIONS = ['latest', 'popular', 'rating'] as const;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/** GET /api/community - 게시물 목록 조회 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const targetType = params.get('target_type');
  const targetId = params.get('target_id');
  const postType = params.get('post_type');
  const sort = params.get('sort') || 'latest';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(params.get('limit')) || DEFAULT_LIMIT));
  const parentId = params.get('parent_id');

  if (!targetType || !targetId) {
    return NextResponse.json({ error: 'target_type and target_id required' }, { status: 400 });
  }

  const supabase = await createClient();
  let query = supabase
    .from('community_posts')
    .select('*', { count: 'exact' })
    .eq('target_type', targetType)
    .eq('target_id', targetId);

  // 답글 조회 vs top-level 조회
  if (parentId) {
    query = query.eq('parent_id', parentId);
  } else {
    query = query.is('parent_id', null);
  }

  // post_type 필터
  if (postType && VALID_POST_TYPES.includes(postType as typeof VALID_POST_TYPES[number])) {
    query = query.eq('post_type', postType);
  }

  // 정렬
  if (sort === 'popular') {
    query = query.order('like_count', { ascending: false }).order('created_at', { ascending: false });
  } else if (sort === 'rating') {
    query = query.order('rating', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
  }

  // 페이지네이션
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data: posts, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    posts: (posts || []).map(mapPost),
    total: count || 0,
    page,
    limit,
  });
}

/** POST /api/community - 게시물 작성 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { target_type, target_id, post_type, content, rating, parent_id, media } = body;

  // 필수 필드 검증
  if (!target_type || !target_id || !post_type || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!VALID_TARGET_TYPES.includes(target_type)) {
    return NextResponse.json({ error: 'Invalid target_type' }, { status: 400 });
  }

  if (!VALID_POST_TYPES.includes(post_type)) {
    return NextResponse.json({ error: 'Invalid post_type' }, { status: 400 });
  }

  // 콘텐츠 길이 검증
  if (content.length < MIN_POST_CONTENT_LENGTH || content.length > MAX_POST_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: `내용은 ${MIN_POST_CONTENT_LENGTH}~${MAX_POST_CONTENT_LENGTH}자 사이여야 합니다` },
      { status: 400 }
    );
  }

  // 평가 타입: 별점 필수
  if (post_type === 'rating' && !parent_id) {
    if (!rating || rating < RATING_MIN || rating > RATING_MAX) {
      return NextResponse.json({ error: `평점은 ${RATING_MIN}~${RATING_MAX} 사이여야 합니다` }, { status: 400 });
    }
  }

  const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '사용자';

  const insertData: Record<string, unknown> = {
    target_type,
    target_id,
    user_id: user.id,
    user_name: userName,
    post_type,
    content,
    media: media || [],
  };

  if (parent_id) {
    insertData.parent_id = parent_id;
  }

  const { data: post, error } = await supabase
    .from('community_posts')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '이미 평가를 작성했습니다' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: mapPost(post) }, { status: 201 });
}

/** DELETE /api/community?id=xxx */
export async function DELETE(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get('id');
  if (!postId) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/** DB 레코드 → CommunityPost 매핑 */
function mapPost(row: Record<string, unknown>) {
  return {
    id: row.id,
    target_type: row.target_type,
    target_id: row.target_id,
    user_id: row.user_id,
    user_name: row.user_name || '사용자',
    post_type: row.post_type,
    content: row.content,
    rating: row.rating ?? null,
    parent_id: row.parent_id ?? null,
    media: row.media ?? [],
    like_count: row.like_count ?? 0,
    reply_count: row.reply_count ?? 0,
    is_reported: row.is_reported ?? false,
    is_pinned: row.is_pinned ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
