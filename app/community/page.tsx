'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import Link from 'next/link';
import CommunityFilterBar from '@/components/community/v2/CommunityFilterBar';
import CommunityPostCardV2 from '@/components/community/v2/CommunityPostCardV2';
import QuickWriteInput from '@/components/community/v2/QuickWriteInput';
import type { CommunityPost, CommunityTag, CommunityFilters, MediaAttachment, CommunityPostType } from '@/types';

const STORAGE_KEY = 'aipick_community_v2';

function CommunityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableGoals, setAvailableGoals] = useState<CommunityTag[]>([]);
  const [availableAIs, setAvailableAIs] = useState<CommunityTag[]>([]);
  const [total, setTotal] = useState(0);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const POSTS_PER_PAGE = 20;
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  const filters: CommunityFilters = {
    goal: searchParams.get('goal') || undefined,
    ai: searchParams.get('ai') || undefined,
    keyword: searchParams.get('keyword') || undefined,
    sort: (searchParams.get('sort') as any) || 'latest',
    post_type: searchParams.get('post_type') as CommunityPostType | undefined,
  };

  const currentPostType = searchParams.get('post_type') || 'all';

  useEffect(() => {
    fetchPosts();
  }, [searchParams.toString()]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.goal) params.set('goal', filters.goal);
      if (filters.ai) params.set('ai', filters.ai);
      if (filters.keyword) params.set('keyword', filters.keyword);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.post_type) params.set('post_type', filters.post_type);

      // 페이지네이션 파라미터 추가
      params.set('limit', POSTS_PER_PAGE.toString());
      params.set('offset', ((currentPage - 1) * POSTS_PER_PAGE).toString());

      const res = await fetch(`/api/community/v2?${params}`);
      if (res.ok) {
        const data = await res.json();

        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts);
          setTotal(data.total || 0);
          setAvailableGoals(data.filters?.popularGoals || []);
          setAvailableAIs(data.filters?.popularAIs || []);
        } else {
          // localStorage fallback
          const localPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CommunityPost[];
          const userLikes = JSON.parse(localStorage.getItem('aipick_user_likes') || '[]') as string[];
          const userBookmarks = JSON.parse(localStorage.getItem('aipick_user_bookmarks') || '[]') as string[];

          // 좋아요/북마크 상태 반영
          let postsWithStatus = localPosts.map(post => ({
            ...post,
            has_liked: userLikes.includes(post.id),
            has_bookmarked: userBookmarks.includes(post.id),
          }));

          // 저장순 필터: 북마크한 글만 표시
          if (filters.sort === 'saved') {
            postsWithStatus = postsWithStatus.filter(post => userBookmarks.includes(post.id));
          }

          // 글 타입 필터
          if (filters.post_type) {
            postsWithStatus = postsWithStatus.filter(post => post.post_type === filters.post_type);
          }

          // 정렬
          if (filters.sort === 'popular') {
            postsWithStatus.sort((a, b) => b.popularity_score - a.popularity_score);
          } else {
            postsWithStatus.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          }

          const offset = (currentPage - 1) * POSTS_PER_PAGE;
          const paginatedPosts = postsWithStatus.slice(offset, offset + POSTS_PER_PAGE);
          setPosts(paginatedPosts);
          setTotal(postsWithStatus.length);
        }
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      // localStorage fallback
      const localPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CommunityPost[];
      const userLikes = JSON.parse(localStorage.getItem('aipick_user_likes') || '[]') as string[];
      const userBookmarks = JSON.parse(localStorage.getItem('aipick_user_bookmarks') || '[]') as string[];

      // 좋아요/북마크 상태 반영
      let postsWithStatus = localPosts.map(post => ({
        ...post,
        has_liked: userLikes.includes(post.id),
        has_bookmarked: userBookmarks.includes(post.id),
      }));

      // 저장순 필터: 북마크한 글만 표시
      if (filters.sort === 'saved') {
        postsWithStatus = postsWithStatus.filter(post => userBookmarks.includes(post.id));
      }

      // 글 타입 필터
      if (filters.post_type) {
        postsWithStatus = postsWithStatus.filter(post => post.post_type === filters.post_type);
      }

      // 정렬
      if (filters.sort === 'popular') {
        postsWithStatus.sort((a, b) => b.popularity_score - a.popularity_score);
      } else {
        postsWithStatus.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      const offset = (currentPage - 1) * POSTS_PER_PAGE;
      const paginatedPosts = postsWithStatus.slice(offset, offset + POSTS_PER_PAGE);
      setPosts(paginatedPosts);
      setTotal(postsWithStatus.length);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<CommunityFilters>) => {
    const params = new URLSearchParams();
    const merged = { ...filters, ...newFilters };

    if (merged.goal) params.set('goal', merged.goal);
    if (merged.ai) params.set('ai', merged.ai);
    if (merged.keyword) params.set('keyword', merged.keyword);
    if (merged.sort && merged.sort !== 'latest') params.set('sort', merged.sort);

    // 필터 변경 시 1페이지로 리셋
    params.set('page', '1');

    router.push(`/community?${params}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/community?${params}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTagClick = (tag: CommunityTag) => {
    if (tag.tag_type === 'GOAL') {
      handleFilterChange({ goal: tag.tag_value });
    } else if (tag.tag_type === 'AI_TOOL') {
      handleFilterChange({ ai: tag.tag_value });
    } else if (tag.tag_type === 'KEYWORD') {
      handleFilterChange({ keyword: tag.tag_value });
    }
  };

  const handleLike = async (postId: string) => {
    // localStorage 기반 좋아요 토글
    const likesKey = 'aipick_user_likes';
    const userLikes = JSON.parse(localStorage.getItem(likesKey) || '[]') as string[];
    const hasLiked = userLikes.includes(postId);

    // 토글: 이미 좋아요했으면 취소, 아니면 추가
    const newLikes = hasLiked
      ? userLikes.filter(id => id !== postId)
      : [...userLikes, postId];

    localStorage.setItem(likesKey, JSON.stringify(newLikes));

    // 게시글 목록 업데이트
    const localPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CommunityPost[];
    const updatedPosts = localPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          like_count: hasLiked ? (post.like_count - 1) : (post.like_count + 1),
          has_liked: !hasLiked,
        };
      }
      return post;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
    await fetchPosts();
  };

  const handleBookmark = async (postId: string) => {
    // localStorage 기반 북마크 토글
    const bookmarksKey = 'aipick_user_bookmarks';
    const userBookmarks = JSON.parse(localStorage.getItem(bookmarksKey) || '[]') as string[];
    const hasBookmarked = userBookmarks.includes(postId);

    // 토글: 이미 북마크했으면 취소, 아니면 추가
    const newBookmarks = hasBookmarked
      ? userBookmarks.filter(id => id !== postId)
      : [...userBookmarks, postId];

    localStorage.setItem(bookmarksKey, JSON.stringify(newBookmarks));

    // 게시글 목록 업데이트
    const localPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CommunityPost[];
    const updatedPosts = localPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          bookmark_count: hasBookmarked ? (post.bookmark_count - 1) : (post.bookmark_count + 1),
          has_bookmarked: !hasBookmarked,
        };
      }
      return post;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
    await fetchPosts();
  };

  const handleQuickSubmit = async (data: {
    content: string;
    media?: MediaAttachment[];
    tags?: string[];
    post_type?: CommunityPostType;
  }) => {
    try {
      const res = await fetch('/api/community/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data.content,
          media: data.media,
          manual_tags: data.tags,
          post_type: data.post_type || 'discussion',
        }),
      });

      if (res.ok) {
        await fetchPosts();
        return true;
      } else if (res.status === 503) {
        // localStorage fallback - 클라이언트 사이드 태그 추출
        const { extractTags } = await import('@/lib/community/tag-extractor');
        const autoTitle = data.content.slice(0, 100);
        const extractedTags = await extractTags(autoTitle, data.content, { minConfidence: 0.5 });

        // 태그를 CommunityTag 형태로 변환
        const tags = [
          ...extractedTags.map(tag => ({
            id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            tag_type: tag.type,
            tag_value: tag.value,
            tag_display: tag.display,
            tag_normalized: tag.value.toLowerCase(),
            tag_color: null,
            tag_icon: null,
            usage_count: 1,
            related_tool_id: null,
            related_category_slug: tag.related_category_slug || null,
            created_at: new Date().toISOString(),
          })),
          ...(data.tags || []).map(tagValue => ({
            id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            tag_type: 'KEYWORD' as const,
            tag_value: tagValue,
            tag_display: tagValue,
            tag_normalized: tagValue.toLowerCase(),
            tag_color: null,
            tag_icon: null,
            usage_count: 1,
            related_tool_id: null,
            related_category_slug: null,
            created_at: new Date().toISOString(),
          }))
        ];

        const post: CommunityPost = {
          id: `cp-v2-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          user_id: 'local-user',
          user_name: '로컬 사용자',
          target_type: 'general',
          target_id: 'general',
          post_type: data.post_type || 'discussion',
          title: autoTitle,
          content: data.content,
          media: data.media || [],
          tags, // 태그 포함
          rating: null,
          feature_ratings: null,
          parent_id: null,
          like_count: 0,
          comment_count: 0,
          bookmark_count: 0,
          view_count: 0,
          popularity_score: 0,
          quality_score: 0,
          is_reported: false,
          is_pinned: false,
          is_hidden: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        existing.unshift(post);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

        await fetchPosts();
        return true;
      } else {
        const error = await res.json();
        alert(error.error || '글 작성에 실패했습니다');
        return false;
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('글 작성 중 오류가 발생했습니다');
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">💬</span>
              <h1 className="text-2xl font-bold text-foreground">커뮤니티</h1>
            </div>
            <p className="text-base text-gray-600">AI 활용 노하우를 공유하고 배워보세요</p>
          </div>
        </div>
      </div>

      {/* 필터 바 - 통합 */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto">
            {/* 통합 필터바 */}
            <div className="flex items-center gap-3">
              {/* 검색 */}
              <div className="flex-1 min-w-[180px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.keyword || ''}
                    onChange={(e) => handleFilterChange({ keyword: e.target.value || undefined })}
                    placeholder="키워드 검색"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* 정렬 */}
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange({ sort: e.target.value as any })}
                className="shrink-0 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="latest">최신순</option>
                <option value="popular">인기순</option>
                <option value="saved">저장순</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* 빠른 글쓰기 */}
          <QuickWriteInput onSubmit={handleQuickSubmit} />

          {/* 글 목록 */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">로딩 중...</div>
          ) : posts.length > 0 ? (
            <>
              <div className="space-y-3">
                {posts.map(post => (
                  <CommunityPostCardV2
                    key={post.id}
                    post={post}
                    onTagClick={handleTagClick}
                    onLike={() => handleLike(post.id)}
                    onBookmark={() => handleBookmark(post.id)}
                  />
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {/* 이전 페이지 */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    이전
                  </button>

                  {/* 페이지 번호 */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // 현재 페이지 근처만 표시 (최대 7개)
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg border transition-colors ${
                            page === currentPage
                              ? 'bg-primary text-white border-primary'
                              : 'border-border bg-white hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 3 || page === currentPage + 3) {
                      // 생략 표시
                      return <span key={page} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  })}

                  {/* 다음 페이지 */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">아직 글이 없습니다</p>
              <Link
                href="/community/write"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                첫 번째 글 작성하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-gray-400">로딩 중...</div>
        </div>
      </div>
    }>
      <CommunityContent />
    </Suspense>
  );
}
