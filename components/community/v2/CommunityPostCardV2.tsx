'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, MessageSquare, Bookmark, Eye, Check, MessageCircleQuestion } from 'lucide-react';
import { cn, getAvatarColor } from '@/lib/utils';
import type { CommunityPost as CommunityPostType, CommunityTag } from '@/types';
import TagPill from './TagPill';

interface CommunityPostCardV2Props {
  post: CommunityPostType;
  onTagClick?: (tag: CommunityTag) => void;
  onLike?: () => Promise<void>;
  onBookmark?: () => Promise<void>;
}

export default function CommunityPostCardV2({
  post,
  onTagClick,
  onLike,
  onBookmark,
}: CommunityPostCardV2Props) {
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onLike || isLiking) return;
    setIsLiking(true);
    await onLike();
    setIsLiking(false);
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onBookmark || isBookmarking) return;
    setIsBookmarking(true);
    await onBookmark();
    setIsBookmarking(false);
  };

  const avatarColor = getAvatarColor(post.user_name || 'User');
  const firstChar = (post.user_name || 'U')[0];

  // 제목 이후의 본문 추출 (중복 방지)
  let displayContent = post.content;

  // title이 content의 시작 부분과 일치하면 해당 부분 제거
  const titleWithoutEllipsis = post.title.replace(/\.\.\.$/g, '').trim();
  if (post.content.startsWith(titleWithoutEllipsis)) {
    displayContent = post.content.slice(titleWithoutEllipsis.length).trim();
    // '...' 제거
    if (displayContent.startsWith('...')) {
      displayContent = displayContent.slice(3).trim();
    }
  }

  return (
    <Link href={`/community/${post.id}`}>
      <div className="rounded-xl border border-border bg-white p-4 hover:shadow-md transition-shadow">
        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {post.tags.map(tag => (
              <TagPill
                key={tag.id}
                tag={tag}
                onClick={onTagClick}
              />
            ))}
          </div>
        )}

        {/* 제목 (1줄) */}
        <h3 className="text-base font-bold text-foreground mb-2 hover:text-primary transition-colors line-clamp-1">
          {post.title}
        </h3>

        {/* 본문 미리보기 (2줄) - 제목 이후 내용만 표시 */}
        {displayContent && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed whitespace-pre-wrap">
            {displayContent}
          </p>
        )}

        {/* 하단 정보 */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className={cn('h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold', avatarColor)}>
              {firstChar}
            </div>
            <span>{post.user_name}</span>
            <span>•</span>
            <span>{formatTimeAgo(post.created_at)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                'flex items-center gap-1 hover:text-primary transition-colors',
                post.has_liked && 'text-primary'
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{post.like_count}</span>
            </button>

            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{post.comment_count || 0}</span>
            </span>

            <button
              onClick={handleBookmark}
              disabled={isBookmarking}
              className={cn(
                'flex items-center gap-1 hover:text-primary transition-colors',
                post.has_bookmarked && 'text-primary fill-primary'
              )}
            >
              <Bookmark className="h-3.5 w-3.5" />
            </button>

            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{post.view_count || 0}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
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
