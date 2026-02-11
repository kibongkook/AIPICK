'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, MessageSquare, Bookmark, Eye, Check, MessageCircleQuestion } from 'lucide-react';
import { cn, getAvatarColor } from '@/lib/utils';
import { COMMUNITY_POST_TYPES } from '@/lib/constants';
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

  // content를 줄바꿈 기준으로 분리
  const contentLines = post.content.split('\n');

  // 제목: 첫 줄만 표시
  const displayTitle = contentLines[0]?.trim() || post.title;

  // 본문 미리보기: 두 번째 줄부터 표시
  const displayContent = contentLines.length > 1
    ? contentLines.slice(1).join('\n').trim()
    : '';

  // post_type 설정
  const typeConfig = COMMUNITY_POST_TYPES[post.post_type as keyof typeof COMMUNITY_POST_TYPES];

  return (
    <Link href={`/community/${post.id}`}>
      <div className="rounded-xl border border-border bg-white p-4 hover:shadow-md transition-shadow">
        {/* 글 타입 + 태그 */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {/* 글 타입 표시 */}
          <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0', typeConfig?.color || 'bg-gray-100 text-gray-600')}>
            {typeConfig?.label || post.post_type}
          </span>

          {/* 태그들 */}
          {post.tags && post.tags.length > 0 && (
            <>
              {post.tags.map(tag => (
                <TagPill
                  key={tag.id}
                  tag={tag}
                  onClick={onTagClick}
                />
              ))}
            </>
          )}
        </div>

        {/* 제목 (1줄) */}
        <h3 className="text-base font-bold text-foreground mb-2 hover:text-primary transition-colors line-clamp-1">
          {displayTitle}
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
