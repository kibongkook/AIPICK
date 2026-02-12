'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, MessageSquare, Clock } from 'lucide-react';
import { cn, getAvatarColor } from '@/lib/utils';
import { PROVOCATION_CATEGORIES, PROVOCATION_STATUSES } from '@/lib/constants';
import type { Provocation } from '@/types';

interface ProvocationCardProps {
  provocation: Provocation;
  onVote?: (voteType: 'up' | 'down') => Promise<void>;
}

export default function ProvocationCard({ provocation, onVote }: ProvocationCardProps) {
  const [isVoting, setIsVoting] = useState(false);

  const categoryConfig = PROVOCATION_CATEGORIES[provocation.category as keyof typeof PROVOCATION_CATEGORIES];
  const statusConfig = PROVOCATION_STATUSES[provocation.status as keyof typeof PROVOCATION_STATUSES];
  const avatarColor = getAvatarColor(provocation.user_name);
  const firstChar = provocation.user_name[0];

  const handleVote = async (e: React.MouseEvent, voteType: 'up' | 'down') => {
    e.preventDefault();
    if (!onVote || isVoting) return;

    setIsVoting(true);
    try {
      await onVote(voteType);
    } finally {
      setIsVoting(false);
    }
  };

  // 투표 종료까지 시간 계산
  const getTimeRemaining = () => {
    if (!provocation.voting_end_date) return null;
    const now = new Date();
    const end = new Date(provocation.voting_end_date);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return '종료됨';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}일 ${hours}시간 남음`;
    if (hours > 0) return `${hours}시간 남음`;
    return '1시간 미만 남음';
  };

  const voteRatio = provocation.vote_ratio || 0;
  const totalVotes = provocation.vote_up_count + provocation.vote_down_count;

  return (
    <Link href={`/provocation/${provocation.id}`}>
      <div className="rounded-xl border border-border bg-white p-5 hover:shadow-md transition-shadow">
        {/* 상태 + 카테고리 */}
        <div className="flex items-center gap-2 mb-3">
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusConfig?.color || 'bg-gray-100 text-gray-600')}>
            {statusConfig?.label || provocation.status}
          </span>
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', categoryConfig?.color || 'bg-gray-100 text-gray-600')}>
            {categoryConfig?.label || provocation.category}
          </span>
          {provocation.status === 'voting' && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 ml-auto">
              <Clock className="h-3 w-3" />
              {getTimeRemaining()}
            </span>
          )}
        </div>

        {/* 제목 */}
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
          {provocation.title}
        </h3>

        {/* 설명 미리보기 */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {provocation.description}
        </p>

        {/* 하단 정보 */}
        <div className="flex items-center justify-between">
          {/* 작성자 */}
          <div className="flex items-center gap-2">
            <div className={cn('h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold', avatarColor)}>
              {firstChar}
            </div>
            <span className="text-sm text-gray-600">{provocation.user_name}</span>
          </div>

          {/* 투표 & 댓글 */}
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={(e) => handleVote(e, 'up')}
              disabled={isVoting || provocation.user_vote !== null}
              className={cn(
                'flex items-center gap-1 transition-colors',
                provocation.user_vote === 'up'
                  ? 'text-primary'
                  : provocation.user_vote !== null
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-400 hover:text-primary'
              )}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{provocation.vote_up_count}</span>
            </button>

            <button
              onClick={(e) => handleVote(e, 'down')}
              disabled={isVoting || provocation.user_vote !== null}
              className={cn(
                'flex items-center gap-1 transition-colors',
                provocation.user_vote === 'down'
                  ? 'text-red-500'
                  : provocation.user_vote !== null
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-400 hover:text-red-500'
              )}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{provocation.vote_down_count}</span>
            </button>

            <div className="flex items-center gap-1 text-gray-400">
              <MessageSquare className="h-4 w-4" />
              <span>{provocation.comment_count || 0}</span>
            </div>
          </div>
        </div>

        {/* 투표 진행 바 */}
        {totalVotes > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>찬성률 {Math.round(voteRatio * 100)}%</span>
              <span>{totalVotes}명 투표</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${voteRatio * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
