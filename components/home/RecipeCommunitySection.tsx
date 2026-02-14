'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import CommunityFilterBar from '@/components/community/v2/CommunityFilterBar';
import CommunityPostCardV2 from '@/components/community/v2/CommunityPostCardV2';
import QuickWriteInput from '@/components/community/v2/QuickWriteInput';
import type { CommunityPost, CommunityTag, AIRecipe } from '@/types';

const STORAGE_KEY = 'aipick_community_v2';

interface RecipeCommunitySectionProps {
  recipe: AIRecipe;
  recipeTools: string[];
}

export default function RecipeCommunitySection({ recipe, recipeTools }: RecipeCommunitySectionProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<CommunityPost[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string | undefined>();
  const [selectedAI, setSelectedAI] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'saved'>('latest');

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
    let filtered = [...posts];

    // 레시피 관련 태그로 필터링
    const recipeTagValues = [
      recipe.slug,
      ...recipeTools,
      ...recipe.tags.map(t => t.toLowerCase())
    ];

    filtered = filtered.filter(post => {
      // 1. 태그 기반 매칭
      if (post.tags && post.tags.length > 0) {
        const postTagValues = post.tags.map(t => t.tag_value.toLowerCase());
        if (recipeTagValues.some(tag => postTagValues.includes(tag))) {
          return true;
        }
      }

      // 2. 검색어 매칭
      const postContent = `${post.title || ''} ${post.content}`.toLowerCase();
      if (searchKeyword && !postContent.includes(searchKeyword.toLowerCase())) {
        return false;
      }

      return false;
    });

    // 추가 필터 적용
    if (selectedGoal) {
      filtered = filtered.filter(post =>
        post.tags?.some(tag => tag.tag_type === 'GOAL' && tag.tag_value === selectedGoal)
      );
    }

    if (selectedAI) {
      filtered = filtered.filter(post =>
        post.tags?.some(tag => tag.tag_type === 'AI_TOOL' && tag.tag_value === selectedAI)
      );
    }

    // 정렬
    if (sortBy === 'popular') {
      filtered.sort((a, b) => b.popularity_score - a.popularity_score);
    } else if (sortBy === 'saved') {
      filtered = filtered.filter(post => post.has_bookmarked);
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredPosts(filtered);
  }, [posts, searchKeyword, selectedGoal, selectedAI, sortBy, recipe, recipeTools]);

  const handleQuickPost = async (data: { content: string; post_type: string }) => {
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

  // 사용 가능한 태그 추출
  const availableGoals: CommunityTag[] = Array.from(
    new Set(posts.flatMap(p => p.tags?.filter(t => t.tag_type === 'GOAL') || []))
  );

  const availableAIs: CommunityTag[] = Array.from(
    new Set(posts.flatMap(p => p.tags?.filter(t => t.tag_type === 'AI_TOOL') || []))
  );

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

      {/* 검색바 */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="키워드 검색"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          />
        </div>
      </div>

      {/* 빠른 글쓰기 */}
      <div className="mb-6">
        <QuickWriteInput onSubmit={handleQuickPost} />
      </div>

      {/* 필터바 */}
      <CommunityFilterBar
        filters={{
          goal: selectedGoal,
          ai: selectedAI,
          sort: sortBy,
        }}
        availableGoals={availableGoals}
        availableAIs={availableAIs}
        onGoalChange={setSelectedGoal}
        onAIChange={setSelectedAI}
        onSortChange={setSortBy as any}
      />

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
