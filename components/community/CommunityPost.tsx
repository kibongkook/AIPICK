'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, MessageSquare, Trash2, Star, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { COMMUNITY_POST_TYPES, FEATURE_RATING_LABELS } from '@/lib/constants';
import { cn, getAvatarColor, formatRating } from '@/lib/utils';
import MediaPreview from './MediaPreview';
import type { CommunityPost as CommunityPostType, MediaAttachment } from '@/types';

interface CommunityPostCardProps {
  post: CommunityPostType;
  onLike: (postId: string) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onReply: (parentId: string, content: string, media?: MediaAttachment[]) => Promise<boolean>;
  getReplies: (parentId: string) => CommunityPostType[];
}

const FEATURE_KEYS = Object.keys(FEATURE_RATING_LABELS) as (keyof typeof FEATURE_RATING_LABELS)[];

export default function CommunityPostCard({ post, onLike, onDelete, onReply, getReplies }: CommunityPostCardProps) {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<CommunityPostType[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isOwner = user?.id === post.user_id;
  const typeConfig = COMMUNITY_POST_TYPES[post.post_type as keyof typeof COMMUNITY_POST_TYPES];
  const firstChar = (post.user_name || '사')[0];
  const avatarColor = getAvatarColor(post.user_name || '사');

  // 답글 로드
  const loadReplies = useCallback(async () => {
    if (isSupabaseConfigured()) {
      try {
        const params = new URLSearchParams({
          target_type: post.target_type,
          target_id: post.target_id,
          parent_id: post.id,
        });
        const res = await fetch(`/api/community?${params}`);
        if (res.ok) {
          const data = await res.json();
          setReplies(data.posts || []);
          return;
        }
      } catch { /* fallback */ }
    }
    setReplies(getReplies(post.id));
  }, [post.id, post.target_type, post.target_id, getReplies]);

  useEffect(() => {
    if (showReplies) loadReplies();
  }, [showReplies, loadReplies]);

  const handleReply = async () => {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    const ok = await onReply(post.id, replyText.trim());
    if (ok) {
      setReplyText('');
      await loadReplies();
    }
    setSubmitting(false);
  };

  const dateStr = formatDate(post.created_at);

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white', avatarColor)}>
            {firstChar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{post.user_name || '사용자'}</span>
              <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', typeConfig.color)}>
                {typeConfig.label}
              </span>
            </div>
            <span className="text-xs text-gray-400">{dateStr}</span>
          </div>
        </div>
        {isOwner && (
          <button onClick={() => onDelete(post.id)} className="text-gray-300 hover:text-red-500 transition-colors" title="삭제">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 평가: 별점 */}
      {post.post_type === 'rating' && post.rating && (
        <div className="mt-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={cn('h-4 w-4', post.rating! >= s ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200')} />
          ))}
          <span className="ml-1 text-sm font-medium text-gray-700">{formatRating(post.rating)}</span>
        </div>
      )}

      {/* 기능별 평가 요약 */}
      {post.post_type === 'rating' && post.feature_ratings && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {FEATURE_KEYS.map((key) => {
            const fr = post.feature_ratings;
            const val = fr ? fr[key as keyof typeof fr] : undefined;
            if (!val || val === 0) return null;
            return (
              <span key={key} className="text-xs text-gray-500">
                {FEATURE_RATING_LABELS[key]} <span className="font-medium text-gray-700">{val}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* 본문 */}
      <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>

      {/* 미디어 */}
      <MediaPreview media={post.media || []} />

      {/* 액션 바 */}
      <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
        <button onClick={() => onLike(post.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors">
          <ThumbsUp className="h-3.5 w-3.5" />
          {post.like_count > 0 && <span>{post.like_count}</span>}
        </button>
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          답글 {post.comment_count > 0 && `(${post.comment_count})`}
        </button>
      </div>

      {/* 답글 섹션 */}
      {showReplies && (
        <div className="mt-3 space-y-3 border-l-2 border-gray-100 pl-4">
          {replies.map((reply) => (
            <ReplyCard key={reply.id} reply={reply} onLike={onLike} onDelete={onDelete} isOwner={user?.id === reply.user_id} />
          ))}

          {/* 답글 입력 */}
          {user && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                placeholder="답글을 입력하세요..."
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim() || submitting}
                className="rounded-lg bg-primary p-2 text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReplyCard({ reply, onLike, onDelete, isOwner }: {
  reply: CommunityPostType;
  onLike: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isOwner: boolean;
}) {
  const firstChar = (reply.user_name || '사')[0];
  const avatarColor = getAvatarColor(reply.user_name || '사');

  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white', avatarColor)}>
            {firstChar}
          </div>
          <span className="text-xs font-medium text-foreground">{reply.user_name || '사용자'}</span>
          <span className="text-[10px] text-gray-400">{formatDate(reply.created_at)}</span>
        </div>
        {isOwner && (
          <button onClick={() => onDelete(reply.id)} className="text-gray-300 hover:text-red-500">
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
      <p className="mt-1.5 text-xs text-gray-600 whitespace-pre-wrap">{reply.content}</p>
      <MediaPreview media={reply.media || []} compact />
      <div className="mt-1.5">
        <button onClick={() => onLike(reply.id)} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-primary">
          <ThumbsUp className="h-3 w-3" />
          {reply.like_count > 0 && <span>{reply.like_count}</span>}
        </button>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}
