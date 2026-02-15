'use client';

import { Bookmark, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBookmark } from '@/hooks/useBookmark';
import { useUpvote } from '@/hooks/useUpvote';
import { cn } from '@/lib/utils';

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

