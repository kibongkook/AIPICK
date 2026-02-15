'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Users } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { COMMUNITY_POST_TYPES, COMMUNITY_STORAGE_KEY } from '@/lib/constants';
import { cn } from '@/lib/utils';
import QuickWriteInput from './v2/QuickWriteInput';
import CommunityPostCardV2 from './v2/CommunityPostCardV2';
import type { CommunityPost, CommunityPostType, MediaAttachment } from '@/types';

const useApi = isSupabaseConfigured();

// 평가 제외한 필터 (일반, 팁, 질문)
const POST_TYPE_FILTERS: { value: CommunityPostType | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'discussion', label: COMMUNITY_POST_TYPES.discussion.label },
  { value: 'tip', label: COMMUNITY_POST_TYPES.tip.label },
  { value: 'question', label: COMMUNITY_POST_TYPES.question.label },
];

const SORT_OPTIONS = [
  { value: 'latest' as const, label: '최신순' },
  { value: 'popular' as const, label: '인기순' },
];

interface ToolCommunitySectionProps {
  toolId: string;
}

export default function ToolCommunitySection({ toolId }: ToolCommunitySectionProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<CommunityPostType | 'all'>('all');
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    if (useApi) {
      try {
        const params = new URLSearchParams({
          target_type: 'tool',
          target_id: toolId,
          sort,
          limit: '50',
        });
        const res = await fetch(`/api/community/v2?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (data.posts) {
            setPosts(data.posts);
            setLoading(false);
            return;
          }
        }
      } catch { /* fallback */ }
    }

    // localStorage 폴백
    try {
      const stored = localStorage.getItem(COMMUNITY_STORAGE_KEY);
      const allPosts: CommunityPost[] = stored ? JSON.parse(stored) : [];
      let filtered = allPosts.filter(
        p => p.target_type === 'tool' && p.target_id === toolId && !p.parent_id
      );
      if (sort === 'popular') {
        filtered.sort((a, b) => b.like_count - a.like_count);
      } else {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      setPosts(filtered);
    } catch { /* ignore */ }

    setLoading(false);
  }, [toolId, sort]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // 타입 필터 적용
  const filteredPosts = useMemo(() => {
    if (typeFilter === 'all') return posts;
    return posts.filter(p => p.post_type === typeFilter);
  }, [posts, typeFilter]);

  // 타입별 개수
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: posts.length };
    for (const post of posts) {
      counts[post.post_type] = (counts[post.post_type] || 0) + 1;
    }
    return counts;
  }, [posts]);

  // 글쓰기 핸들러
  const handleSubmit = useCallback(async (data: {
    content: string;
    media?: MediaAttachment[];
    tags?: string[];
    post_type?: CommunityPostType;
  }) => {
    if (useApi) {
      try {
        const res = await fetch('/api/community/v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            target_type: 'tool',
            target_id: toolId,
            manual_tags: data.tags,
          }),
        });
        if (res.ok) {
          await fetchPosts();
          return true;
        }
      } catch { /* fallback */ }
    }

    // localStorage 폴백
    try {
      const stored = localStorage.getItem(COMMUNITY_STORAGE_KEY);
      const allPosts: CommunityPost[] = stored ? JSON.parse(stored) : [];
      const newPost: CommunityPost = {
        id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        target_type: 'tool',
        target_id: toolId,
        user_id: 'local',
        user_name: '사용자',
        post_type: data.post_type || 'discussion',
        title: data.content.slice(0, 50),
        content: data.content,
        rating: null,
        parent_id: null,
        media: data.media || [],
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
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify([...allPosts, newPost]));
      await fetchPosts();
      return true;
    } catch { /* ignore */ }

    return false;
  }, [toolId, fetchPosts]);

  // 좋아요 핸들러
  const handleLike = useCallback(async (postId: string) => {
    if (useApi) {
      try {
        await fetch('/api/community/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_id: postId }),
        });
        await fetchPosts();
        return;
      } catch { /* fallback */ }
    }

    // localStorage 폴백
    const stored = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    const allPosts: CommunityPost[] = stored ? JSON.parse(stored) : [];
    const target = allPosts.find(p => p.id === postId);
    if (target) {
      target.like_count += 1;
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(allPosts));
      await fetchPosts();
    }
  }, [fetchPosts]);

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <h2 className="text-lg font-bold text-foreground">
          커뮤니티 ({posts.length})
        </h2>
      </div>

      {/* 글쓰기 폼 */}
      <QuickWriteInput onSubmit={handleSubmit} />

      {/* 필터 + 정렬 */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {POST_TYPE_FILTERS.map((filter) => {
            const count = typeCounts[filter.value] || 0;
            return (
              <button
                key={filter.value}
                onClick={() => setTypeFilter(filter.value)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  typeFilter === filter.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                )}
              >
                {filter.label}
                {count > 0 && (
                  <span className={cn(
                    'ml-1',
                    typeFilter === filter.value ? 'text-white/70' : 'text-gray-400'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={cn(
                'text-xs transition-colors',
                sort === opt.value ? 'font-semibold text-primary' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 글 목록 */}
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">로딩 중...</div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <CommunityPostCardV2
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-gray-50 py-10 text-center text-sm text-gray-400">
          {typeFilter === 'all'
            ? '아직 커뮤니티 글이 없습니다. 첫 번째 글을 작성해보세요!'
            : `아직 ${POST_TYPE_FILTERS.find(f => f.value === typeFilter)?.label} 글이 없습니다.`}
        </div>
      )}
    </div>
  );
}
