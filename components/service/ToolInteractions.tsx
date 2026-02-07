'use client';

import { Bookmark, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBookmark } from '@/hooks/useBookmark';
import { useUpvote } from '@/hooks/useUpvote';
import { useCommunity } from '@/hooks/useCommunity';
import { cn, formatRating } from '@/lib/utils';
import { FEATURE_RATING_LABELS } from '@/lib/constants';

const FEATURE_KEYS = Object.keys(FEATURE_RATING_LABELS) as (keyof typeof FEATURE_RATING_LABELS)[];

export function BookmarkButton({ toolId }: { toolId: string }) {
  const { user } = useAuth();
  const { isBookmarked, toggle } = useBookmark(toolId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          window.location.href = '/auth/login';
          return;
        }
        toggle();
      }}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
        isBookmarked
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border text-gray-600 hover:border-primary/50 hover:text-primary'
      )}
      title={isBookmarked ? '북마크 해제' : '북마크 추가'}
    >
      <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-primary')} />
      {isBookmarked ? '저장됨' : '북마크'}
    </button>
  );
}

export function UpvoteButton({ toolId, initialCount }: { toolId: string; initialCount: number }) {
  const { user } = useAuth();
  const { isUpvoted, toggle } = useUpvote(toolId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          window.location.href = '/auth/login';
          return;
        }
        toggle();
      }}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
        isUpvoted
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border text-gray-600 hover:border-primary/50 hover:text-primary'
      )}
    >
      <ThumbsUp className={cn('h-4 w-4', isUpvoted && 'fill-primary')} />
      {initialCount + (isUpvoted ? 1 : 0)}
    </button>
  );
}

/** 기능별 평가 바 (커뮤니티 데이터 기반) */
export function FeatureRatingBars({ toolId }: { toolId: string }) {
  const { ratingStats } = useCommunity('tool', toolId);

  const hasData = Object.values(ratingStats.featureAvg).some((v) => v > 0);

  return (
    <div className="space-y-3">
      {FEATURE_KEYS.map((key) => {
        const val = ratingStats.featureAvg[key] || 0;
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-24 text-sm text-gray-600">{FEATURE_RATING_LABELS[key]}</span>
            <div className="flex-1 h-2 rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(hasData ? val / 5 : 0) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-sm font-medium text-gray-700">
              {hasData && val > 0 ? formatRating(val) : '-'}
            </span>
          </div>
        );
      })}
      {!hasData && (
        <p className="text-xs text-gray-400 mt-1">아직 기능별 평가 데이터가 없습니다.</p>
      )}
    </div>
  );
}
