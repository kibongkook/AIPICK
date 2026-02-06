'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const STORAGE_KEY = 'aipick_reviews';
const useApi = isSupabaseConfigured();

export interface StoredReview {
  id: string;
  tool_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  content: string;
  feature_ratings: {
    ease_of_use: number;
    korean_support: number;
    free_quota: number;
    feature_variety: number;
    value_for_money: number;
  };
  helpful_count: number;
  created_at: string;
}

// ── localStorage 헬퍼 ──
function getLocalReviews(): StoredReview[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
function saveLocalReviews(reviews: StoredReview[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function useReviews(toolId: string) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<StoredReview[]>([]);
  const [sort, setSort] = useState<'latest' | 'rating' | 'helpful'>('latest');

  const sortReviews = useCallback((list: StoredReview[]) => {
    const sorted = [...list];
    switch (sort) {
      case 'rating': sorted.sort((a, b) => b.rating - a.rating); break;
      case 'helpful': sorted.sort((a, b) => b.helpful_count - a.helpful_count); break;
      default: sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return sorted;
  }, [sort]);

  const load = useCallback(async () => {
    if (useApi) {
      try {
        const res = await fetch(`/api/reviews?tool_id=${encodeURIComponent(toolId)}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(sortReviews(data.reviews || []));
          return;
        }
      } catch { /* fallback */ }
    }
    // localStorage fallback
    const all = getLocalReviews().filter((r) => r.tool_id === toolId);
    setReviews(sortReviews(all));
  }, [toolId, sortReviews]);

  useEffect(() => { load(); }, [load]);

  const addReview = useCallback(async (data: {
    rating: number;
    content: string;
    feature_ratings: StoredReview['feature_ratings'];
  }) => {
    if (!user) return false;

    if (useApi && user.provider !== 'demo') {
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool_id: toolId,
            rating: data.rating,
            content: data.content,
            feature_ratings: data.feature_ratings,
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
    const all = getLocalReviews();
    if (all.some((r) => r.tool_id === toolId && r.user_id === user.id)) return false;
    const review: StoredReview = {
      id: `review-${Date.now()}`,
      tool_id: toolId,
      user_id: user.id,
      user_name: user.name,
      rating: data.rating,
      content: data.content,
      feature_ratings: data.feature_ratings,
      helpful_count: 0,
      created_at: new Date().toISOString(),
    };
    saveLocalReviews([...all, review]);
    await load();
    return true;
  }, [user, toolId, load]);

  const deleteReview = useCallback(async (reviewId: string) => {
    if (!user) return;

    if (useApi && user.provider !== 'demo') {
      try {
        const res = await fetch(`/api/reviews?id=${encodeURIComponent(reviewId)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          await load();
          return;
        }
      } catch { /* fallback */ }
    }

    const all = getLocalReviews().filter((r) => !(r.id === reviewId && r.user_id === user.id));
    saveLocalReviews(all);
    await load();
  }, [user, load]);

  const toggleHelpful = useCallback(async (reviewId: string) => {
    if (useApi) {
      try {
        const res = await fetch('/api/reviews/helpful', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ review_id: reviewId }),
        });
        if (res.ok) {
          await load();
          return;
        }
      } catch { /* fallback */ }
    }

    const all = getLocalReviews();
    const target = all.find((r) => r.id === reviewId);
    if (target) {
      target.helpful_count += 1;
      saveLocalReviews(all);
      await load();
    }
  }, [load]);

  const myReview = user ? reviews.find((r) => r.user_id === user.id) : null;

  return { reviews, myReview, sort, setSort, addReview, deleteReview, toggleHelpful };
}
