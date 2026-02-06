'use client';

import { useState } from 'react';
import { ThumbsUp, Trash2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { cn, getAvatarColor } from '@/lib/utils';
import CommentForm from './CommentForm';
import type { StoredComment } from '@/hooks/useComments';

interface CommentListProps {
  topLevelComments: StoredComment[];
  getReplies: (parentId: string) => StoredComment[];
  onAddComment: (content: string, parentId: string | null) => boolean | Promise<boolean>;
  onDelete: (commentId: string) => void;
  onLike: (commentId: string) => void;
}

export default function CommentList({ topLevelComments, getReplies, onAddComment, onDelete, onLike }: CommentListProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      {/* 댓글 작성 */}
      {user ? (
        <CommentForm onSubmit={(content) => onAddComment(content, null)} />
      ) : (
        <p className="text-center text-sm text-gray-400 py-2">
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      )}

      {topLevelComments.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
        </p>
      ) : (
        <div className="space-y-3">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              isOwn={user?.id === comment.user_id}
              onReply={(content) => onAddComment(content, comment.id)}
              onDelete={() => onDelete(comment.id)}
              onLike={() => onLike(comment.id)}
              onDeleteReply={onDelete}
              onLikeReply={onLike}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  isOwn,
  onReply,
  onDelete,
  onLike,
  onDeleteReply,
  onLikeReply,
  currentUserId,
}: {
  comment: StoredComment;
  replies: StoredComment[];
  isOwn: boolean;
  onReply: (content: string) => boolean | Promise<boolean>;
  onDelete: () => void;
  onLike: () => void;
  onDeleteReply: (commentId: string) => void;
  onLikeReply: (commentId: string) => void;
  currentUserId?: string;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold', getAvatarColor(comment.user_name))}>
          {comment.user_name.charAt(0)}
        </div>
        <span className="text-sm font-medium text-foreground">{comment.user_name}</span>
        <span className="text-xs text-gray-400">
          {new Date(comment.created_at).toLocaleDateString('ko-KR')}
        </span>
      </div>

      {/* 내용 */}
      <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>

      {/* 액션 */}
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={onLike}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
        >
          <ThumbsUp className="h-3 w-3" />
          {comment.like_count > 0 && comment.like_count}
        </button>
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
        >
          <MessageCircle className="h-3 w-3" />
          답글
        </button>
        {isOwn && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            삭제
          </button>
        )}
      </div>

      {/* 답글 작성 */}
      {showReplyForm && (
        <div className="mt-3 pl-4 border-l-2 border-gray-100">
          <CommentForm
            onSubmit={async (content) => {
              const result = await onReply(content);
              if (result) setShowReplyForm(false);
              return result;
            }}
            placeholder="답글을 작성하세요..."
            autoFocus
            compact
          />
        </div>
      )}

      {/* 대댓글 */}
      {replies.length > 0 && (
        <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-100">
          {replies.map((reply) => (
            <div key={reply.id} className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <div className={cn('flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-bold', getAvatarColor(reply.user_name))}>
                  {reply.user_name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-foreground">{reply.user_name}</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(reply.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-700">{reply.content}</p>
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => onLikeReply(reply.id)}
                  className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-primary"
                >
                  <ThumbsUp className="h-2.5 w-2.5" />
                  {reply.like_count > 0 && reply.like_count}
                </button>
                {currentUserId === reply.user_id && (
                  <button
                    onClick={() => onDeleteReply(reply.id)}
                    className="text-[10px] text-red-400 hover:text-red-600"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
