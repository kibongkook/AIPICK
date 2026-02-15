import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { extractTags, enrichAIToolTags } from '@/lib/community/tag-extractor';
import type { CommunityPost, CommunityFilters, ExtractedTag } from '@/types';

/** GET /api/community/v2 - 글 목록 조회 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ posts: [], total: 0 });
  }

  const { searchParams } = new URL(request.url);
  const goal = searchParams.get('goal');
  const ai = searchParams.get('ai');
  const keyword = searchParams.get('keyword');
  const sort = searchParams.get('sort') || 'latest';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');
  const targetType = searchParams.get('target_type');
  const targetId = searchParams.get('target_id');
  const postType = searchParams.get('post_type');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 기본 쿼리
  let query = supabase
    .from('community_posts')
    .select(`
      *,
      post_tags:community_post_tags(
        tag:community_tags(*)
      )
    `, { count: 'exact' })
    .is('parent_id', null)
    .eq('is_hidden', false);

  // 타겟 필터
  if (targetType && targetId) {
    query = query.eq('target_type', targetType).eq('target_id', targetId);
  }

  // 게시물 타입 필터
  if (postType) {
    query = query.eq('post_type', postType);
  }

  // 목적 필터
  if (goal) {
    const { data: goalTag } = await supabase
      .from('community_tags')
      .select('id')
      .eq('tag_type', 'GOAL')
      .eq('tag_normalized', goal.toLowerCase())
      .single();

    if (goalTag) {
      const { data: postIds } = await supabase
        .from('community_post_tags')
        .select('post_id')
        .eq('tag_id', goalTag.id);

      if (postIds && postIds.length > 0) {
        query = query.in('id', postIds.map(p => p.post_id));
      } else {
        // 태그가 없으면 빈 결과
        return NextResponse.json({ posts: [], total: 0 });
      }
    }
  }

  // AI 필터
  if (ai) {
    const { data: aiTag } = await supabase
      .from('community_tags')
      .select('id')
      .eq('tag_type', 'AI_TOOL')
      .eq('tag_normalized', ai.toLowerCase())
      .single();

    if (aiTag) {
      const { data: postIds } = await supabase
        .from('community_post_tags')
        .select('post_id')
        .eq('tag_id', aiTag.id);

      if (postIds && postIds.length > 0) {
        query = query.in('id', postIds.map(p => p.post_id));
      } else {
        return NextResponse.json({ posts: [], total: 0 });
      }
    }
  }

  // 키워드 검색
  if (keyword) {
    query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
  }

  // 정렬
  if (sort === 'popular') {
    query = query.order('popularity_score', { ascending: false });
  } else if (sort === 'saved') {
    query = query.order('bookmark_count', { ascending: false });
  } else if (sort === 'unanswered') {
    query = query.eq('post_type', 'question').is('accepted_answer_id', null).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // 페이지네이션
  query = query.range(offset, offset + limit - 1);

  const { data: posts, error, count } = await query;

  if (error) {
    console.error('Community posts fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }

  // 태그 데이터 정리
  const postsWithTags = posts?.map(post => ({
    ...post,
    tags: post.post_tags?.map((pt: any) => pt.tag) || [],
    post_tags: undefined, // 제거
  })) || [];

  // 사용자별 좋아요/북마크 상태 확인
  if (user && postsWithTags.length > 0) {
    const postIds = postsWithTags.map(p => p.id);

    const [{ data: likes }, { data: bookmarks }] = await Promise.all([
      supabase
        .from('community_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds),
      supabase
        .from('community_bookmarks')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds),
    ]);

    const likeSet = new Set(likes?.map(l => l.post_id) || []);
    const bookmarkSet = new Set(bookmarks?.map(b => b.post_id) || []);

    postsWithTags.forEach(post => {
      post.has_liked = likeSet.has(post.id);
      post.has_bookmarked = bookmarkSet.has(post.id);
    });
  }

  // 인기 태그 조회
  const { data: popularTags } = await supabase
    .from('community_tags')
    .select('*')
    .in('tag_type', ['GOAL', 'AI_TOOL'])
    .order('usage_count', { ascending: false })
    .limit(20);

  return NextResponse.json({
    posts: postsWithTags,
    total: count || 0,
    filters: {
      popularGoals: popularTags?.filter(t => t.tag_type === 'GOAL') || [],
      popularAIs: popularTags?.filter(t => t.tag_type === 'AI_TOOL') || [],
    },
  });
}

/** POST /api/community/v2 - 글 작성 */
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
    content,
    media,
    rating,
    target_type = 'general',
    target_id,
    manual_tags = [],
    post_type = 'discussion',
  } = body;

  // 검증
  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  if (content.length < 1 || content.length > 10000) {
    return NextResponse.json({ error: 'Content must be 1-10000 characters' }, { status: 400 });
  }

  // 제목 자동 생성 (내용 앞부분에서)
  const autoTitle = content.slice(0, 100).trim() + (content.length > 100 ? '...' : '');

  // 사용자명 가져오기
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', user.id)
    .single();

  const userName = profile?.name || profile?.email?.split('@')[0] || 'Anonymous';

  // 1. 글 생성
  const { data: post, error: postError } = await supabase
    .from('community_posts')
    .insert({
      user_id: user.id,
      user_name: userName,
      title: autoTitle,
      content,
      media: media || [],
      rating,
      target_type,
      target_id,
      post_type,
    })
    .select()
    .single();

  if (postError) {
    console.error('Post creation error:', postError);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }

  // 2. 자동 태그 추출
  const autoTags = await extractTags(autoTitle, content, { minConfidence: 0.5 });

  // tools 테이블에서 AI 서비스 ID 조회
  const enrichedTags = await enrichAIToolTags(autoTags, async (slug) => {
    const { data } = await supabase
      .from('tools')
      .select('id')
      .eq('slug', slug)
      .single();
    return data;
  });

  // 3. 태그 저장
  for (const tag of enrichedTags) {
    // 태그가 없으면 생성
    const { data: existingTag } = await supabase
      .from('community_tags')
      .select('id')
      .eq('tag_type', tag.type)
      .eq('tag_normalized', tag.value.toLowerCase())
      .single();

    let tagId: string;

    if (existingTag) {
      tagId = existingTag.id;
    } else {
      const { data: newTag } = await supabase
        .from('community_tags')
        .insert({
          tag_type: tag.type,
          tag_value: tag.value,
          tag_display: tag.display,
          tag_normalized: tag.value.toLowerCase(),
          related_tool_id: tag.related_tool_id,
          related_category_slug: tag.related_category_slug,
        })
        .select('id')
        .single();

      if (!newTag) continue;
      tagId = newTag.id;
    }

    // 글-태그 연결
    await supabase
      .from('community_post_tags')
      .insert({
        post_id: post.id,
        tag_id: tagId,
        is_auto_generated: true,
        confidence_score: tag.confidence,
      });
  }

  // 4. 수동 태그 추가
  for (const tagValue of manual_tags) {
    const { data: existingTag } = await supabase
      .from('community_tags')
      .select('id')
      .eq('tag_type', 'KEYWORD')
      .eq('tag_normalized', tagValue.toLowerCase())
      .single();

    let tagId: string;

    if (existingTag) {
      tagId = existingTag.id;
    } else {
      const { data: newTag } = await supabase
        .from('community_tags')
        .insert({
          tag_type: 'KEYWORD',
          tag_value: tagValue,
          tag_display: tagValue,
          tag_normalized: tagValue.toLowerCase(),
        })
        .select('id')
        .single();

      if (!newTag) continue;
      tagId = newTag.id;
    }

    await supabase
      .from('community_post_tags')
      .insert({
        post_id: post.id,
        tag_id: tagId,
        is_auto_generated: false,
      });
  }

  return NextResponse.json({
    post,
    auto_tags: enrichedTags,
  }, { status: 201 });
}
