'use client';

import { Star, Users } from 'lucide-react';
import { useCommunity } from '@/hooks/useCommunity';
import {
  COMMUNITY_SECTION_LABEL,
  COMMUNITY_TAB_ALL_LABEL,
  COMMUNITY_POST_TYPES,
  COMMUNITY_SORT_OPTIONS,
  FEATURE_RATING_LABELS,
} from '@/lib/constants';
import { cn, formatRating } from '@/lib/utils';
import CommunityForm from './CommunityForm';
import CommunityPostCard from './CommunityPost';
import type { CommunityTargetType, CommunityPostType } from '@/types';

const FEATURE_KEYS = Object.keys(FEATURE_RATING_LABELS) as (keyof typeof FEATURE_RATING_LABELS)[];

interface CommunitySectionProps {
  targetType: CommunityTargetType;
  targetId: string;
}

export default function CommunitySection({ targetType, targetId }: CommunitySectionProps) {
  const {
    posts,
    allPosts,
    activeTab,
    setActiveTab,
    sort,
    setSort,
    myRatingPost,
    ratingStats,
    addPost,
    deletePost,
    toggleLike,
    addReply,
    getReplies,
  } = useCommunity(targetType, targetId);

  const tabs: { key: CommunityPostType | 'all'; label: string }[] = [
    { key: 'all', label: COMMUNITY_TAB_ALL_LABEL },
    ...Object.entries(COMMUNITY_POST_TYPES).map(([key, cfg]) => ({
      key: key as CommunityPostType,
      label: cfg.label,
    })),
  ];

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5" />
          {COMMUNITY_SECTION_LABEL} ({allPosts.length})
        </h2>
      </div>

      {/* 평가 요약 (도구 페이지에서만) */}
      {targetType === 'tool' && ratingStats.count > 0 && (
        <RatingSummary avg={ratingStats.avg} count={ratingStats.count} featureAvg={ratingStats.featureAvg} />
      )}

      {/* 탭 바 */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const count = tab.key === 'all'
            ? allPosts.length
            : allPosts.filter((p) => p.post_type === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {tab.label} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* 정렬 */}
      <div className="flex items-center gap-2">
        {COMMUNITY_SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={cn(
              'text-xs transition-colors',
              sort === opt.value ? 'font-semibold text-primary' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 작성 폼 */}
      <CommunityForm
        activeTab={activeTab}
        hasExistingRating={!!myRatingPost}
        onSubmit={addPost}
      />

      {/* 게시물 목록 */}
      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              onLike={toggleLike}
              onDelete={deletePost}
              onReply={addReply}
              getReplies={getReplies}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-gray-50 py-10 text-center text-sm text-gray-400">
          {activeTab === 'all'
            ? '아직 커뮤니티 글이 없습니다. 첫 번째 글을 작성해보세요!'
            : `아직 ${COMMUNITY_POST_TYPES[activeTab as CommunityPostType]?.label || ''} 글이 없습니다.`}
        </div>
      )}
    </div>
  );
}

/** 평가 요약 패널 */
function RatingSummary({ avg, count, featureAvg }: { avg: number; count: number; featureAvg: Record<string, number> }) {
  return (
    <div className="rounded-xl border border-border bg-gradient-to-r from-yellow-50 to-orange-50 p-5">
      <div className="flex items-center gap-6">
        {/* 종합 점수 */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800">{formatRating(avg)}</div>
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={cn('h-3.5 w-3.5', avg >= s ? 'fill-yellow-400 text-yellow-400' : avg >= s - 0.5 ? 'fill-yellow-200 text-yellow-300' : 'text-gray-200')} />
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">{count}개 평가</p>
        </div>

        {/* 기능별 바 */}
        <div className="flex-1 space-y-2">
          {FEATURE_KEYS.map((key) => {
            const val = featureAvg[key] || 0;
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="w-20 text-xs text-gray-600">{FEATURE_RATING_LABELS[key]}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/80">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(val / 5) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-medium text-gray-600">
                  {val > 0 ? formatRating(val) : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
