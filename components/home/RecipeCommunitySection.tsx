'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import CommunityPostCardV2 from '@/components/community/v2/CommunityPostCardV2';
import QuickWriteInput from '@/components/community/v2/QuickWriteInput';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { COMMUNITY_STORAGE_KEY } from '@/lib/constants';
import type { CommunityPost, AIRecipe, CommunityTag } from '@/types';

const useApi = isSupabaseConfigured();

interface RecipeCommunitySectionProps {
  recipe: AIRecipe;
  recipeTools: string[];
}

export default function RecipeCommunitySection({ recipe, recipeTools }: RecipeCommunitySectionProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // 레시피에서 관련 태그 값 추출 (도구 slug + 대체 도구 + 레시피 태그) — OR 필터
  const relatedTagValues = useMemo(() => {
    const toolSlugs = [...new Set(recipe.steps.map(s => s.tool_slug))];
    const recipeTags = recipe.tags || [];
    return [...toolSlugs, ...recipeTools, ...recipeTags]
      .map(t => t.toLowerCase())
      .filter((v, i, a) => a.indexOf(v) === i); // 중복 제거
  }, [recipe, recipeTools]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    if (useApi) {
      try {
        const params = new URLSearchParams({
          tags: relatedTagValues.join(','),
          sort: 'latest',
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

    // localStorage 폴백 — 태그 기반 OR 필터링
    try {
      const stored = localStorage.getItem(COMMUNITY_STORAGE_KEY);
      const allPosts: CommunityPost[] = stored ? JSON.parse(stored) : [];
      const userLikes = JSON.parse(localStorage.getItem('aipick_user_likes') || '[]') as string[];
      const userBookmarks = JSON.parse(localStorage.getItem('aipick_user_bookmarks') || '[]') as string[];

      let filtered = allPosts.filter(p => {
        if (p.parent_id) return false;
        if (!p.tags || p.tags.length === 0) return false;
        // 태그 중 하나라도 relatedTagValues에 포함되면 표시
        return p.tags.some(t =>
          relatedTagValues.includes(t.tag_normalized) ||
          relatedTagValues.includes(t.tag_value.toLowerCase())
        );
      });

      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPosts(filtered.map(post => ({
        ...post,
        has_liked: userLikes.includes(post.id),
        has_bookmarked: userBookmarks.includes(post.id),
      })));
    } catch { /* ignore */ }

    setLoading(false);
  }, [relatedTagValues]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleQuickPost = useCallback(async (data: { content: string; post_type?: string; tags?: string[]; media?: any[] }) => {
    const toolSlugs = [...new Set(recipe.steps.map(s => s.tool_slug))];
    const manualTags = [...(data.tags || []), ...toolSlugs];

    if (useApi) {
      try {
        const res = await fetch('/api/community/v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            target_type: 'general',
            target_id: 'general',
            manual_tags: manualTags,
          }),
        });
        if (res.ok) {
          await fetchPosts();
          return true;
        }
      } catch { /* fallback */ }
    }

    // localStorage 폴백 — 자동 태그 추출 포함
    try {
      const { extractTags } = await import('@/lib/community/tag-extractor');
      const autoTitle = data.content.slice(0, 100);
      const extractedTags = await extractTags(autoTitle, data.content);

      const autoTagObjects: CommunityTag[] = extractedTags.map(tag => ({
        id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        tag_type: tag.type,
        tag_value: tag.value,
        tag_display: tag.display,
        tag_normalized: tag.value.toLowerCase(),
        tag_color: null,
        tag_icon: null,
        related_tool_id: tag.related_tool_id || null,
        related_category_slug: tag.related_category_slug || null,
        usage_count: 1,
        created_at: new Date().toISOString(),
      }));

      // 레시피 도구 태그가 자동 추출에 없으면 수동 추가
      for (const slug of toolSlugs) {
        if (!autoTagObjects.some(t => t.tag_value === slug)) {
          autoTagObjects.push({
            id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            tag_type: 'AI_TOOL' as const,
            tag_value: slug,
            tag_display: recipe.steps.find(s => s.tool_slug === slug)?.tool_name || slug,
            tag_normalized: slug.toLowerCase(),
            tag_color: null,
            tag_icon: null,
            related_tool_id: null,
            related_category_slug: null,
            usage_count: 1,
            created_at: new Date().toISOString(),
          });
        }
      }

      const newPost: CommunityPost = {
        id: `cp-v2-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        user_id: 'local-user',
        user_name: '로컬 사용자',
        target_type: 'general',
        target_id: 'general',
        post_type: (data.post_type as any) || 'discussion',
        title: autoTitle,
        content: data.content,
        media: data.media || [],
        tags: autoTagObjects,
        rating: null,
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

      const existing = JSON.parse(localStorage.getItem(COMMUNITY_STORAGE_KEY) || '[]');
      existing.unshift(newPost);
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(existing));

      await fetchPosts();
      return true;
    } catch { /* ignore */ }

    return false;
  }, [recipe, fetchPosts]);

  return (
    <div className="mt-8">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-extrabold text-foreground">
          이 레시피 관련 커뮤니티 {posts.length > 0 && `(${posts.length})`}
        </h2>
      </div>
      <p className="text-xs text-gray-400 mb-6">
        {recipe.title}에 대한 질문, 팁, 경험을 공유해보세요
      </p>

      {/* 빠른 글쓰기 */}
      <div className="mb-6">
        <QuickWriteInput onSubmit={handleQuickPost} />
      </div>

      {/* 글 목록 */}
      {loading ? (
        <div className="py-6 text-center text-sm text-gray-400">로딩 중...</div>
      ) : posts.length > 0 ? (
        <div className="space-y-3 mt-4">
          {posts.map((post) => (
            <CommunityPostCardV2 key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-gray-50 py-8 text-center text-sm text-gray-400">
          아직 관련 커뮤니티 글이 없습니다. 첫 번째 글을 작성해보세요!
        </div>
      )}
    </div>
  );
}
