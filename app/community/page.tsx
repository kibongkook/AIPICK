'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import CommunityFilterBar from '@/components/community/v2/CommunityFilterBar';
import CommunityPostCardV2 from '@/components/community/v2/CommunityPostCardV2';
import QuickWriteInput from '@/components/community/v2/QuickWriteInput';
import type { CommunityPost, CommunityTag, CommunityFilters, MediaAttachment } from '@/types';

const STORAGE_KEY = 'aipick_community_v2';

function CommunityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableGoals, setAvailableGoals] = useState<CommunityTag[]>([]);
  const [availableAIs, setAvailableAIs] = useState<CommunityTag[]>([]);

  const filters: CommunityFilters = {
    goal: searchParams.get('goal') || undefined,
    ai: searchParams.get('ai') || undefined,
    keyword: searchParams.get('keyword') || undefined,
    sort: (searchParams.get('sort') as any) || 'latest',
  };

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

      const res = await fetch(`/api/community/v2?${params}`);
      if (res.ok) {
        const data = await res.json();

        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts);
          setAvailableGoals(data.filters?.popularGoals || []);
          setAvailableAIs(data.filters?.popularAIs || []);
        } else {
          const localPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CommunityPost[];
          setPosts(localPosts);
        }
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      const localPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CommunityPost[];
      setPosts(localPosts);
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

    router.push(`/community?${params}`);
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
    try {
      await fetch('/api/community/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      });
    } catch { /* ignore */ }
    await fetchPosts();
  };

  const handleBookmark = async (postId: string) => {
    try {
      await fetch('/api/community/v2/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      });
      await fetchPosts();
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  };

  const handleQuickSubmit = async (data: {
    content: string;
    media?: MediaAttachment[];
    tags?: string[];
  }) => {
    try {
      const res = await fetch('/api/community/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data.content,
          media: data.media,
          manual_tags: data.tags,
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
          post_type: 'discussion',
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">커뮤니티</h1>
              <p className="text-sm text-gray-600 mt-1">
                AI 활용 노하우를 공유하고 배워보세요
              </p>
            </div>
            <Link
              href="/community/write"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              글쓰기
            </Link>
          </div>
        </div>
      </div>

      {/* 필터 바 - max-width 적용 */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <CommunityFilterBar
              filters={filters}
              availableGoals={availableGoals}
              availableAIs={availableAIs}
              onFilterChange={handleFilterChange}
            />
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">아직 글이 없습니다</p>
              <Link
                href="/community/write"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Plus className="h-4 w-4" />
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
