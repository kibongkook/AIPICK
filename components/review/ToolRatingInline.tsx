'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { formatRating } from '@/lib/utils';
import StarRating from './StarRating';

const RATINGS_STORAGE_KEY = 'aipick_user_ratings';
const useApi = isSupabaseConfigured();

interface ToolRatingInlineProps {
  toolId: string;
  currentAvg: number;
  reviewCount: number;
}

function getLocalRating(toolId: string): number | null {
  try {
    const stored = localStorage.getItem(RATINGS_STORAGE_KEY);
    if (stored) {
      const ratings: Record<string, number> = JSON.parse(stored);
      return ratings[toolId] ?? null;
    }
  } catch { /* ignore */ }
  return null;
}

function saveLocalRating(toolId: string, rating: number) {
  const stored = localStorage.getItem(RATINGS_STORAGE_KEY);
  const ratings: Record<string, number> = stored ? JSON.parse(stored) : {};
  ratings[toolId] = rating;
  localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(ratings));
}

export default function ToolRatingInline({ toolId, currentAvg, reviewCount }: ToolRatingInlineProps) {
  const { user } = useAuth();
  const [myRating, setMyRating] = useState<number | null>(null);
  const [avg, setAvg] = useState(currentAvg);
  const [count, setCount] = useState(reviewCount);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (useApi) {
      fetch(`/api/tools/rate?tool_id=${encodeURIComponent(toolId)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data?.rating) setMyRating(data.rating); })
        .catch(() => { setMyRating(getLocalRating(toolId)); });
    } else {
      setMyRating(getLocalRating(toolId));
    }
  }, [user, toolId]);

  const handleRate = useCallback(async (rating: number) => {
    if (!user || submitting) return;
    setSubmitting(true);
    setMyRating(rating); // 즉시 반영

    if (useApi) {
      try {
        const res = await fetch('/api/tools/rate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tool_id: toolId, rating }),
        });
        if (res.ok) {
          const data = await res.json();
          setAvg(data.avg);
          setCount(data.count);
          setSubmitting(false);
          return;
        }
      } catch { /* fallback */ }
    }

    saveLocalRating(toolId, rating);
    setSubmitting(false);
  }, [user, toolId, submitting]);

  return (
    <div className="flex items-center gap-2">
      {/* 기존 평균 평점 */}
      <StarRating value={avg} readonly size="sm" />
      <span className="font-medium text-gray-700 text-sm">{formatRating(avg)}</span>
      <span className="text-sm text-gray-500">({count}개 평가)</span>

      {/* 내 평가: 항상 보이는 인터랙티브 별 */}
      {user && (
        <>
          <span className="text-gray-300 text-sm">|</span>
          <span className="text-xs text-gray-400">내 평가</span>
          <StarRating value={myRating || 0} onChange={handleRate} size="sm" />
        </>
      )}
    </div>
  );
}
