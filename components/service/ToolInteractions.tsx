'use client';

import { Bookmark, ThumbsUp, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBookmark } from '@/hooks/useBookmark';
import { useUpvote } from '@/hooks/useUpvote';
import { useReviews } from '@/hooks/useReviews';
import { useComments } from '@/hooks/useComments';
import { cn, formatRating } from '@/lib/utils';
import { FEATURE_RATING_LABELS } from '@/lib/constants';
import ReviewForm from '@/components/review/ReviewForm';
import ReviewList from '@/components/review/ReviewList';
import CommentList from '@/components/comment/CommentList';

interface ToolInteractionsProps {
  toolId: string;
  toolName: string;
  initialUpvoteCount: number;
}

const FEATURE_KEYS = ['ease_of_use', 'korean_support', 'free_quota', 'feature_variety', 'value_for_money'] as const;

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

export function FeatureRatingBars({ toolId }: { toolId: string }) {
  const { reviews } = useReviews(toolId);

  // 리뷰에서 기능별 평균 계산
  const averages: Record<string, number> = {};
  FEATURE_KEYS.forEach((key) => {
    const rated = reviews.filter((r) => r.feature_ratings[key] > 0);
    averages[key] = rated.length > 0
      ? rated.reduce((sum, r) => sum + r.feature_ratings[key], 0) / rated.length
      : 0;
  });

  const hasData = Object.values(averages).some((v) => v > 0);

  return (
    <div className="space-y-3">
      {FEATURE_KEYS.map((key) => (
        <div key={key} className="flex items-center gap-3">
          <span className="w-24 text-sm text-gray-600">{FEATURE_RATING_LABELS[key]}</span>
          <div className="flex-1 h-2 rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(hasData ? averages[key] / 5 : 0) * 100}%` }}
            />
          </div>
          <span className="w-8 text-right text-sm font-medium text-gray-700">
            {hasData && averages[key] > 0 ? formatRating(averages[key]) : '-'}
          </span>
        </div>
      ))}
      {!hasData && (
        <p className="text-xs text-gray-400 mt-1">아직 기능별 평가 데이터가 없습니다.</p>
      )}
    </div>
  );
}

export function ReviewSection({ toolId }: { toolId: string }) {
  const { reviews, myReview, sort, setSort, addReview, deleteReview, toggleHelpful } = useReviews(toolId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Star className="h-5 w-5" />
          리뷰 ({reviews.length})
        </h2>
      </div>

      <ReviewForm
        toolId={toolId}
        onSubmit={addReview}
        hasExisting={!!myReview}
      />

      <ReviewList
        reviews={reviews}
        sort={sort}
        onSortChange={setSort}
        onHelpful={toggleHelpful}
        onDelete={deleteReview}
      />
    </div>
  );
}

export function CommentSection({ toolId }: { toolId: string }) {
  const { topLevelComments, getReplies, addComment, deleteComment, toggleLike } = useComments(toolId);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        댓글 ({topLevelComments.length})
      </h2>

      <CommentList
        topLevelComments={topLevelComments}
        getReplies={getReplies}
        onAddComment={addComment}
        onDelete={deleteComment}
        onLike={toggleLike}
      />
    </div>
  );
}
