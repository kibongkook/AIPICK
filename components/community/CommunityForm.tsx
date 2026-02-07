'use client';

import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { LoginPrompt } from '@/components/auth/AuthGuard';
import {
  COMMUNITY_POST_TYPES,
  FEATURE_RATING_LABELS,
  MIN_POST_CONTENT_LENGTH,
  MAX_POST_CONTENT_LENGTH,
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import MediaUploader from './MediaUploader';
import type { CommunityPostType, FeatureRatings, MediaAttachment } from '@/types';

const FEATURE_KEYS = Object.keys(FEATURE_RATING_LABELS) as (keyof typeof FEATURE_RATING_LABELS)[];

interface CommunityFormProps {
  hasExistingRating: boolean;
  onSubmit: (data: {
    post_type: CommunityPostType;
    content: string;
    rating?: number;
    feature_ratings?: FeatureRatings;
    media?: MediaAttachment[];
  }) => Promise<boolean>;
}

export default function CommunityForm({ hasExistingRating, onSubmit }: CommunityFormProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [postType, setPostType] = useState<CommunityPostType>('discussion');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [featureRatings, setFeatureRatings] = useState<FeatureRatings>({
    ease_of_use: 0, korean_support: 0, free_quota: 0, feature_variety: 0, value_for_money: 0,
  });
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return <LoginPrompt message="커뮤니티에 참여하려면 로그인이 필요합니다." />;
  }

  // 평가 탭이고 이미 평가한 경우
  if (postType === 'rating' && hasExistingRating) {
    return (
      <div className="rounded-lg border border-border bg-gray-50 p-4 text-center text-sm text-gray-500">
        이미 평가를 작성하셨습니다.
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full rounded-xl border-2 border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors"
      >
        평가, 팁, 질문 등 자유롭게 글을 작성해주세요
      </button>
    );
  }

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    if (postType === 'rating' && rating === 0) return;

    setSubmitting(true);
    const data: Parameters<typeof onSubmit>[0] = {
      post_type: postType,
      content: content.trim(),
      media: media.length > 0 ? media : undefined,
    };
    if (postType === 'rating') {
      data.rating = rating;
      const hasFeature = Object.values(featureRatings).some((v) => v > 0);
      if (hasFeature) data.feature_ratings = featureRatings;
    }

    const ok = await onSubmit(data);
    if (ok) {
      setContent('');
      setRating(0);
      setFeatureRatings({ ease_of_use: 0, korean_support: 0, free_quota: 0, feature_variety: 0, value_for_money: 0 });
      setMedia([]);
      setIsExpanded(false);
    }
    setSubmitting(false);
  };

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      {/* 글 타입 선택 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.entries(COMMUNITY_POST_TYPES) as [CommunityPostType, typeof COMMUNITY_POST_TYPES[keyof typeof COMMUNITY_POST_TYPES]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setPostType(key)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              postType === key ? cfg.color : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* 평가: 별점 */}
      {postType === 'rating' && (
        <>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">종합 평점</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                  className="p-0.5"
                >
                  <Star className={cn('h-6 w-6 transition-colors', (hoverRating || rating) >= s ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200')} />
                </button>
              ))}
              {rating > 0 && <span className="ml-2 text-sm font-medium text-gray-700">{rating}.0</span>}
            </div>
          </div>

          {/* 기능별 세부 평가 */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">기능별 평가 (선택)</p>
            <div className="space-y-2">
              {FEATURE_KEYS.map((key) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-gray-600">{FEATURE_RATING_LABELS[key]}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setFeatureRatings((prev) => ({ ...prev, [key]: s }))} className="p-0.5">
                        <Star className={cn('h-4 w-4 transition-colors', featureRatings[key] >= s ? 'fill-primary text-primary' : 'text-gray-200')} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 내용 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`내용을 입력하세요 (${MIN_POST_CONTENT_LENGTH}자 이상)`}
        rows={4}
        maxLength={MAX_POST_CONTENT_LENGTH}
        className="w-full rounded-lg border border-border bg-surface p-3 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
      />
      <div className="flex justify-between items-center mt-1">
        <span className="text-[10px] text-gray-400">{content.length}/{MAX_POST_CONTENT_LENGTH}</span>
      </div>

      {/* 미디어 업로더 */}
      <div className="mt-3">
        <MediaUploader
          media={media}
          onAdd={(m) => setMedia((prev) => [...prev, m])}
          onRemove={(i) => setMedia((prev) => prev.filter((_, idx) => idx !== i))}
        />
      </div>

      {/* 버튼 */}
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={() => { setIsExpanded(false); setContent(''); setRating(0); setMedia([]); }}
          className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || content.length < MIN_POST_CONTENT_LENGTH || (postType === 'rating' && rating === 0) || submitting}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
          {submitting ? '등록 중...' : '등록'}
        </button>
      </div>
    </div>
  );
}
