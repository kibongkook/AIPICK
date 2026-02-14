'use client';

import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import CommunityPostCardV2 from '@/components/community/v2/CommunityPostCardV2';
import QuickWriteInput from '@/components/community/v2/QuickWriteInput';
import type { CommunityPost, AIRecipe } from '@/types';

const STORAGE_KEY = 'aipick_community_v2';

interface RecipeCommunitySectionProps {
  recipe: AIRecipe;
  recipeTools: string[];
}

export default function RecipeCommunitySection({ recipe, recipeTools }: RecipeCommunitySectionProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<CommunityPost[]>([]);

  // localStorage에서 커뮤니티 글 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const allPosts = JSON.parse(stored) as CommunityPost[];
          const userLikes = JSON.parse(localStorage.getItem('aipick_user_likes') || '[]') as string[];
          const userBookmarks = JSON.parse(localStorage.getItem('aipick_user_bookmarks') || '[]') as string[];

          const postsWithStatus = allPosts.map(post => ({
            ...post,
            has_liked: userLikes.includes(post.id),
            has_bookmarked: userBookmarks.includes(post.id),
          }));

          setPosts(postsWithStatus);
        }
      } catch (error) {
        console.error('Failed to load community posts:', error);
      }
    }
  }, []);

  // 필터링 로직
  useEffect(() => {
    let filtered = posts.filter(post => {
      // 레시피 slug가 태그에 포함되어 있는지 확인 (필수)
      const hasRecipeSlug = post.tags?.some(
        tag => tag.tag_value.toLowerCase() === recipe.slug.toLowerCase()
      );
      return hasRecipeSlug;
    });

    // 최신순 정렬
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredPosts(filtered);
  }, [posts, recipe.slug]);

  const handleQuickPost = async (data: { content: string; post_type?: string }) => {
    try {
      // localStorage에 저장
      const newPost: CommunityPost = {
        id: `cp-v2-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        user_id: 'local-user',
        user_name: '로컬 사용자',
        target_type: 'general',
        target_id: 'general',
        post_type: data.post_type as any,
        title: data.content.slice(0, 100),
        content: data.content,
        media: [],
        tags: [
          { id: '', tag_type: 'GOAL', tag_value: recipe.slug, tag_display: recipe.title, tag_normalized: recipe.slug, tag_color: null, tag_icon: null, usage_count: 1, related_tool_id: null, related_category_slug: null, created_at: new Date().toISOString() },
          ...recipeTools.map(tool => ({
            id: '', tag_type: 'AI_TOOL' as const, tag_value: tool, tag_display: tool, tag_normalized: tool, tag_color: null, tag_icon: null, usage_count: 1, related_tool_id: tool, related_category_slug: null, created_at: new Date().toISOString()
          }))
        ],
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
      existing.unshift(newPost);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

      setPosts([newPost, ...posts]);
      return true;
    } catch (error) {
      console.error('Failed to save post:', error);
      return false;
    }
  };

  return (
    <div className="mt-8">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-extrabold text-foreground">이 레시피 관련 커뮤니티</h2>
      </div>
      <p className="text-xs text-gray-400 mb-6">
        {recipe.title}에 대한 질문, 팁, 경험을 공유해보세요
      </p>

      {/* 빠른 글쓰기 */}
      <div className="mb-6">
        <QuickWriteInput onSubmit={handleQuickPost} />
      </div>

      {/* 글 목록 */}
      <div className="space-y-3 mt-4">
        {filteredPosts.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-3">
              이 레시피와 관련된 커뮤니티 글이 아직 없습니다
            </p>
            <Link
              href={`/community/write?recipe=${recipe.slug}&tools=${recipeTools.join(',')}&tags=${encodeURIComponent(recipe.tags.join(','))}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              첫 번째 글 작성하기
            </Link>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <CommunityPostCardV2 key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
