'use client';

import { Star, ThumbsUp, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { FEATURE_RATING_LABELS } from '@/lib/constants';
import { cn, getAvatarColor, formatRating } from '@/lib/utils';
import type { StoredReview } from '@/hooks/useReviews';

interface ReviewListProps {
  reviews: StoredReview[];
  sort: 'latest' | 'rating' | 'helpful';
  onSortChange: (sort: 'latest' | 'rating' | 'helpful') => void;
  onHelpful: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
}

const SORT_OPTIONS = [
  { value: 'latest' as const, label: '최신순' },
  { value: 'rating' as const, label: '평점순' },
  { value: 'helpful' as const, label: '도움순' },
];

const FEATURE_KEYS = ['ease_of_use', 'korean_support', 'free_quota', 'feature_variety', 'value_for_money'] as const;

export default function ReviewList({ reviews, sort, onSortChange, onHelpful, onDelete }: ReviewListProps) {
  const { user } = useAuth();

  if (reviews.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
      </p>
    );
  }

  return (
    <div>
      {/* 정렬 */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs text-gray-400">정렬:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              sort === opt.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 리뷰 리스트 */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwn={user?.id === review.user_id}
            onHelpful={() => onHelpful(review.id)}
            onDelete={() => onDelete(review.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  isOwn,
  onHelpful,
  onDelete,
}: {
  review: StoredReview;
  isOwn: boolean;
  onHelpful: () => void;
  onDelete: () => void;
}) {
  const hasFeatureRatings = FEATURE_KEYS.some((k) => review.feature_ratings[k] > 0);

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold', getAvatarColor(review.user_name))}>
            {review.user_name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{review.user_name}</p>
            <p className="text-xs text-gray-400">
              {new Date(review.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'h-3.5 w-3.5',
                review.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
              )}
            />
          ))}
        </div>
      </div>

      {/* 기능별 평가 요약 */}
      {hasFeatureRatings && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {FEATURE_KEYS.map((key) =>
            review.feature_ratings[key] > 0 ? (
              <span key={key} className="text-xs text-gray-500">
                {FEATURE_RATING_LABELS[key]} {formatRating(review.feature_ratings[key])}
              </span>
            ) : null
          )}
        </div>
      )}

      {/* 내용 */}
      <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{review.content}</p>

      {/* 하단 */}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={onHelpful}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          도움이 돼요 {review.helpful_count > 0 && `(${review.helpful_count})`}
        </button>
        {isOwn && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
