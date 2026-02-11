'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  COMMUNITY_STORAGE_KEY,
  FEATURE_RATING_LABELS,
} from '@/lib/constants';
import type {
  CommunityPost,
  CommunityPostType,
  CommunityTargetType,
  FeatureRatings,
  MediaAttachment,
} from '@/types';

const useApi = isSupabaseConfigured();

type SortOption = 'latest' | 'popular';

export interface RatingStats {
  avg: number;
  count: number;
  featureAvg: Record<string, number>;
}

// ── localStorage 헬퍼 ──
function getLocalPosts(): CommunityPost[] {
  try {
    const stored = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }

  // 기존 데이터 마이그레이션 (최초 1회)
  return migrateLocalStorage();
}

function saveLocalPosts(posts: CommunityPost[]) {
  localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(posts));
}

/** 기존 aipick_reviews + aipick_comments → 새 형식으로 변환 */
function migrateLocalStorage(): CommunityPost[] {
  const migrated: CommunityPost[] = [];

  try {
    const oldReviews = JSON.parse(localStorage.getItem('aipick_reviews') || '[]');
    for (const r of oldReviews) {
      migrated.push({
        id: r.id,
        target_type: 'tool',
        target_id: r.tool_id,
        user_id: r.user_id,
        user_name: r.user_name || '사용자',
        post_type: 'rating',
        content: r.content,
        rating: r.rating,
        feature_ratings: r.feature_ratings || null,
        parent_id: null,
        media: [],
        like_count: r.helpful_count || 0,
        comment_count: 0,
        is_reported: false,
        is_pinned: false,
        created_at: r.created_at,
        updated_at: r.created_at,
        title: r.content.slice(0, 50),
        bookmark_count: 0,
        view_count: 0,
        popularity_score: 0,
        quality_score: 0,
        is_hidden: false,
      });
    }
  } catch { /* ignore */ }

  try {
    const oldComments = JSON.parse(localStorage.getItem('aipick_comments') || '[]');
    for (const c of oldComments) {
      migrated.push({
        id: c.id,
        target_type: 'tool',
        target_id: c.tool_id,
        user_id: c.user_id,
        user_name: c.user_name || '사용자',
        post_type: 'discussion',
        content: c.content,
        rating: null,
        feature_ratings: null,
        parent_id: c.parent_id || null,
        media: [],
        like_count: c.like_count || 0,
        comment_count: 0,
        is_reported: false,
        is_pinned: false,
        created_at: c.created_at,
        updated_at: c.created_at,
        title: c.content.slice(0, 50),
        bookmark_count: 0,
        view_count: 0,
        popularity_score: 0,
        quality_score: 0,
        is_hidden: false,
      });
    }
  } catch { /* ignore */ }

  if (migrated.length > 0) {
    saveLocalPosts(migrated);
  }

  return migrated;
}

export function useCommunity(targetType: CommunityTargetType, targetId: string) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [sort, setSort] = useState<SortOption>('latest');

  // ── 데이터 로드 ──
  const load = useCallback(async () => {
    if (useApi) {
      try {
        const params = new URLSearchParams({
          target_type: targetType,
          target_id: targetId,
          sort,
          limit: '50',
        });
        const res = await fetch(`/api/community?${params}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
          return;
        }
      } catch { /* fallback */ }
    }

    // localStorage fallback
    const all = getLocalPosts().filter(
      (p) => p.target_type === targetType && p.target_id === targetId && !p.parent_id
    );
    setPosts(sortPosts(all, sort));
  }, [targetType, targetId, sort]);

  useEffect(() => { load(); }, [load]);

  // ── 내 평가 찾기 ──
  const myRatingPost = useMemo(() => {
    if (!user) return null;
    return posts.find((p) => p.user_id === user.id && p.post_type === 'rating') ?? null;
  }, [posts, user]);

  // ── 평가 통계 ──
  const ratingStats = useMemo((): RatingStats => {
    const ratingPosts = posts.filter((p) => p.post_type === 'rating' && p.rating);
    const count = ratingPosts.length;
    const avg = count > 0 ? ratingPosts.reduce((sum, p) => sum + (p.rating || 0), 0) / count : 0;

    const featureKeys = Object.keys(FEATURE_RATING_LABELS);
    const featureAvg: Record<string, number> = {};
    for (const key of featureKeys) {
      const typedKey = key as keyof FeatureRatings;
      const rated = ratingPosts.filter((p) => p.feature_ratings && p.feature_ratings[typedKey] > 0);
      featureAvg[key] = rated.length > 0
        ? rated.reduce((sum, p) => sum + (p.feature_ratings?.[typedKey] || 0), 0) / rated.length
        : 0;
    }

    return { avg, count, featureAvg };
  }, [posts]);

  // ── 게시물 작성 ──
  const addPost = useCallback(async (data: {
    post_type: CommunityPostType;
    content: string;
    rating?: number;
    feature_ratings?: FeatureRatings;
    media?: MediaAttachment[];
  }) => {
    if (!user) return false;

    if (useApi && user.provider !== 'demo') {
      try {
        const res = await fetch('/api/community', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target_type: targetType,
            target_id: targetId,
            ...data,
          }),
        });
        if (res.ok) {
          await load();
          return true;
        }
        if (res.status === 409) return false;
      } catch { /* fallback */ }
    }

    // localStorage fallback
    const all = getLocalPosts();
    if (data.post_type === 'rating') {
      const exists = all.some(
        (p) => p.target_type === targetType && p.target_id === targetId &&
               p.user_id === user.id && p.post_type === 'rating' && !p.parent_id
      );
      if (exists) return false;
    }

    const post: CommunityPost = {
      id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      target_type: targetType,
      target_id: targetId,
      user_id: user.id,
      user_name: user.name,
      post_type: data.post_type,
      content: data.content,
      rating: data.rating ?? null,
      feature_ratings: data.feature_ratings ?? null,
      parent_id: null,
      media: data.media || [],
      like_count: 0,
      comment_count: 0,
      is_reported: false,
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      title: data.content.slice(0, 50),
      bookmark_count: 0,
      view_count: 0,
      popularity_score: 0,
      quality_score: 0,
      is_hidden: false,
    };

    saveLocalPosts([...all, post]);
    await load();
    return true;
  }, [user, targetType, targetId, load]);

  // ── 게시물 삭제 ──
  const deletePost = useCallback(async (postId: string) => {
    if (!user) return;

    if (useApi && user.provider !== 'demo') {
      try {
        const res = await fetch(`/api/community?id=${encodeURIComponent(postId)}`, { method: 'DELETE' });
        if (res.ok) {
          await load();
          return;
        }
      } catch { /* fallback */ }
    }

    const all = getLocalPosts().filter((p) => !(p.id === postId && p.user_id === user.id));
    saveLocalPosts(all);
    await load();
  }, [user, load]);

  // ── 좋아요 토글 ──
  const toggleLike = useCallback(async (postId: string) => {
    if (useApi) {
      try {
        const res = await fetch('/api/community/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_id: postId }),
        });
        if (res.ok) {
          await load();
          return;
        }
      } catch { /* fallback */ }
    }

    const all = getLocalPosts();
    const target = all.find((p) => p.id === postId);
    if (target) {
      target.like_count += 1;
      saveLocalPosts(all);
      await load();
    }
  }, [load]);

  // ── 답글 추가 ──
  const addReply = useCallback(async (parentId: string, content: string, media?: MediaAttachment[]) => {
    if (!user) return false;

    if (useApi && user.provider !== 'demo') {
      try {
        const res = await fetch('/api/community', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target_type: targetType,
            target_id: targetId,
            post_type: 'discussion',
            content,
            parent_id: parentId,
            media: media || [],
          }),
        });
        if (res.ok) {
          await load();
          return true;
        }
      } catch { /* fallback */ }
    }

    // localStorage fallback
    const all = getLocalPosts();
    const reply: CommunityPost = {
      id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      target_type: targetType,
      target_id: targetId,
      user_id: user.id,
      user_name: user.name,
      post_type: 'discussion',
      content,
      rating: null,
      feature_ratings: null,
      parent_id: parentId,
      media: media || [],
      like_count: 0,
      comment_count: 0,
      is_reported: false,
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      title: content.slice(0, 50),
      bookmark_count: 0,
      view_count: 0,
      popularity_score: 0,
      quality_score: 0,
      is_hidden: false,
    };

    // 부모의 comment_count 증가
    const parent = all.find((p) => p.id === parentId);
    if (parent) parent.comment_count += 1;

    saveLocalPosts([...all, reply]);
    await load();
    return true;
  }, [user, targetType, targetId, load]);

  // ── 답글 목록 ──
  const getReplies = useCallback((parentId: string): CommunityPost[] => {
    if (useApi) {
      // API 모드에서는 별도 fetch 필요하지만, 간소화를 위해
      // load 시 top-level만 가져오므로 별도 상태가 필요
      // → 컴포넌트 레벨에서 직접 fetch 하도록 위임
      return [];
    }

    return getLocalPosts()
      .filter((p) => p.parent_id === parentId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, []);

  // ── 답변 등록 (Q&A) ──
  const addAnswer = useCallback(async (questionId: string, content: string) => {
    if (!user) return false;

    if (useApi && user.provider !== 'demo') {
      try {
        const res = await fetch('/api/community/v2/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question_id: questionId, content }),
        });
        if (res.ok) {
          await load();
          return true;
        }
      } catch { /* fallback */ }
    }

    // localStorage fallback
    const all = getLocalPosts();
    const answer: CommunityPost = {
      id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      target_type: targetType,
      target_id: targetId,
      user_id: user.id,
      user_name: user.name,
      post_type: 'discussion',
      content,
      rating: null,
      feature_ratings: null,
      parent_id: questionId,
      media: [],
      like_count: 0,
      comment_count: 0,
      is_reported: false,
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      title: content.slice(0, 50),
      bookmark_count: 0,
      view_count: 0,
      popularity_score: 0,
      quality_score: 0,
      is_hidden: false,
      is_answer: true,
    };

    const parent = all.find((p) => p.id === questionId);
    if (parent) {
      parent.answer_count = (parent.answer_count || 0) + 1;
      parent.comment_count += 1;
    }

    saveLocalPosts([...all, answer]);
    await load();
    return true;
  }, [user, targetType, targetId, load]);

  // ── 답변 채택 (Q&A) ──
  const acceptAnswer = useCallback(async (answerId: string) => {
    if (!user) return false;

    if (useApi && user.provider !== 'demo') {
      try {
        const res = await fetch('/api/community/v2/accept-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer_id: answerId }),
        });
        if (res.ok) {
          await load();
          return true;
        }
      } catch { /* fallback */ }
    }

    // localStorage fallback
    const all = getLocalPosts();
    const answer = all.find((p) => p.id === answerId);
    if (answer?.parent_id) {
      const question = all.find((p) => p.id === answer.parent_id);
      if (question && question.user_id === user.id) {
        question.accepted_answer_id = answerId;
        saveLocalPosts(all);
        await load();
        return true;
      }
    }
    return false;
  }, [user, load]);

  return {
    allPosts: posts,
    sort,
    setSort,
    myRatingPost,
    ratingStats,
    addPost,
    deletePost,
    toggleLike,
    addReply,
    getReplies,
    addAnswer,
    acceptAnswer,
  };
}

/** 클라이언트 사이드 정렬 (localStorage용) */
function sortPosts(list: CommunityPost[], sort: SortOption): CommunityPost[] {
  const sorted = [...list];
  switch (sort) {
    case 'popular':
      sorted.sort((a, b) => b.like_count - a.like_count);
      break;
    default:
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  return sorted;
}
