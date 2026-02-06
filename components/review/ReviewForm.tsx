'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { LoginPrompt } from '@/components/auth/AuthGuard';
import { FEATURE_RATING_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  toolId: string;
  onSubmit: (data: {
    rating: number;
    content: string;
    feature_ratings: {
      ease_of_use: number;
      korean_support: number;
      free_quota: number;
      feature_variety: number;
      value_for_money: number;
    };
  }) => boolean | Promise<boolean>;
  hasExisting: boolean;
}

const FEATURE_KEYS = ['ease_of_use', 'korean_support', 'free_quota', 'feature_variety', 'value_for_money'] as const;

export default function ReviewForm({ toolId, onSubmit, hasExisting }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [featureRatings, setFeatureRatings] = useState({
    ease_of_use: 0,
    korean_support: 0,
    free_quota: 0,
    feature_variety: 0,
    value_for_money: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  if (!user) {
    return <LoginPrompt message="리뷰를 작성하려면 로그인이 필요합니다." />;
  }

  if (hasExisting) {
    return (
      <div className="rounded-lg border border-border bg-gray-50 p-4 text-center text-sm text-gray-500">
        이미 리뷰를 작성하셨습니다.
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors"
      >
        이 서비스에 대한 리뷰를 작성해주세요
      </button>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0 || !content.trim()) return;
    const success = await onSubmit({ rating, content: content.trim(), feature_ratings: featureRatings });
    if (success) {
      setRating(0);
      setContent('');
      setFeatureRatings({ ease_of_use: 0, korean_support: 0, free_quota: 0, feature_variety: 0, value_for_money: 0 });
      setIsExpanded(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h3 className="text-sm font-semibold text-foreground">리뷰 작성</h3>

      {/* 종합 별점 */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">종합 평점</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-0.5"
            >
              <Star
                className={cn(
                  'h-6 w-6 transition-colors',
                  (hoverRating || rating) >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-200'
                )}
              />
            </button>
          ))}
          {rating > 0 && <span className="ml-2 text-sm font-medium text-gray-700">{rating}.0</span>}
        </div>
      </div>

      {/* 기능별 세부 평가 */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">기능별 평가 (선택)</p>
        <div className="space-y-2">
          {FEATURE_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-20 text-xs text-gray-600">{FEATURE_RATING_LABELS[key]}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeatureRatings((prev) => ({ ...prev, [key]: star }))}
                    className="p-0.5"
                  >
                    <Star
                      className={cn(
                        'h-4 w-4 transition-colors',
                        featureRatings[key] >= star ? 'fill-primary text-primary' : 'text-gray-200'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 리뷰 내용 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="이 서비스에 대한 솔직한 리뷰를 남겨주세요..."
        rows={4}
        className="mt-4 w-full rounded-lg border border-border bg-surface p-3 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
      />

      {/* 버튼 */}
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={() => setIsExpanded(false)}
          className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || !content.trim()}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          리뷰 등록
        </button>
      </div>
    </div>
  );
}
