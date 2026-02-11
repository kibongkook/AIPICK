'use client';

import { useState } from 'react';
import { ThumbsUp, Check } from 'lucide-react';
import { cn, getAvatarColor } from '@/lib/utils';
import type { CommunityPost } from '@/types';

interface AnswerCardProps {
  answer: CommunityPost;
  isAccepted: boolean;
  isQuestionOwner: boolean;
  onLike: (id: string) => Promise<void>;
  onAccept: (id: string) => Promise<void>;
}

export default function AnswerCard({
  answer,
  isAccepted,
  isQuestionOwner,
  onLike,
  onAccept,
}: AnswerCardProps) {
  const [liking, setLiking] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const avatarColor = getAvatarColor(answer.user_name || 'User');
  const firstChar = (answer.user_name || 'U')[0];

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    await onLike(answer.id);
    setLiking(false);
  };

  const handleAccept = async () => {
    if (accepting || !isQuestionOwner) return;
    setAccepting(true);
    await onAccept(answer.id);
    setAccepting(false);
  };

  return (
    <div className={cn(
      'rounded-xl border p-4',
      isAccepted
        ? 'border-emerald-300 bg-emerald-50/50'
        : 'border-border bg-white'
    )}>
      {/* 채택 뱃지 */}
      {isAccepted && (
        <div className="flex items-center gap-1.5 mb-3">
          <Check className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-600">채택된 답변</span>
        </div>
      )}

      {/* 본문 */}
      <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{answer.content}</p>

      {/* 하단 */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className={cn('h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold', avatarColor)}>
            {firstChar}
          </div>
          <span>{answer.user_name}</span>
          <span>•</span>
          <span>{formatTimeAgo(answer.created_at)}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={liking}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{answer.like_count}</span>
          </button>

          {isQuestionOwner && !isAccepted && (
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors font-medium"
            >
              <Check className="h-3 w-3" />
              채택
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) return '방금';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
  return past.toLocaleDateString('ko-KR');
}
