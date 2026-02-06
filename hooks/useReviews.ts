'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

const STORAGE_KEY = 'aipick_reviews';

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

function getAllReviews(): StoredReview[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAllReviews(reviews: StoredReview[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function useReviews(toolId: string) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<StoredReview[]>([]);
  const [sort, setSort] = useState<'latest' | 'rating' | 'helpful'>('latest');

  const load = useCallback(() => {
    const all = getAllReviews().filter((r) => r.tool_id === toolId);
    switch (sort) {
      case 'rating': all.sort((a, b) => b.rating - a.rating); break;
      case 'helpful': all.sort((a, b) => b.helpful_count - a.helpful_count); break;
      default: all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    setReviews(all);
  }, [toolId, sort]);

  useEffect(() => { load(); }, [load]);

  const addReview = useCallback((data: {
    rating: number;
    content: string;
    feature_ratings: StoredReview['feature_ratings'];
  }) => {
    if (!user) return false;
    const all = getAllReviews();
    // 이미 리뷰를 작성했는지 확인
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
    saveAllReviews([...all, review]);
    load();
    return true;
  }, [user, toolId, load]);

  const deleteReview = useCallback((reviewId: string) => {
    if (!user) return;
    const all = getAllReviews().filter((r) => !(r.id === reviewId && r.user_id === user.id));
    saveAllReviews(all);
    load();
  }, [user, load]);

  const toggleHelpful = useCallback((reviewId: string) => {
    const all = getAllReviews();
    const target = all.find((r) => r.id === reviewId);
    if (target) {
      target.helpful_count += 1;
      saveAllReviews(all);
      load();
    }
  }, [load]);

  const myReview = user ? reviews.find((r) => r.user_id === user.id) : null;

  return { reviews, myReview, sort, setSort, addReview, deleteReview, toggleHelpful };
}
