'use client';

import { useState, useEffect } from 'react';
import { Send, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { cn, getAvatarColor } from '@/lib/utils';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  content: string;
  like_count: number;
  created_at: string;
}

interface CommentSectionProps {
  postId: string;
  commentCount: number;
  onCommentCountChange?: (newCount: number) => void;
}

const COMMENTS_STORAGE_KEY = 'aipick_comments';
const USER_COMMENT_LIKES_KEY = 'aipick_user_comment_likes';

export default function CommentSection({ postId, commentCount, onCommentCountChange }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = () => {
    try {
      const allComments = JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY) || '[]') as Comment[];
      const postComments = allComments.filter(c => c.post_id === postId);
      setComments(postComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      // 새 댓글 생성
      const comment: Comment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        post_id: postId,
        user_id: user.id,
        user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        content: newComment.trim(),
        like_count: 0,
        created_at: new Date().toISOString(),
      };

      // localStorage에 저장
      const allComments = JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY) || '[]') as Comment[];
      allComments.push(comment);
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));

      // 게시글의 댓글 수 업데이트
      const POSTS_KEY = 'aipick_community_v2';
      const posts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
      const updatedPosts = posts.map((p: any) => {
        if (p.id === postId) {
          return { ...p, comment_count: (p.comment_count || 0) + 1 };
        }
        return p;
      });
      localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));

      // 상태 업데이트
      setComments([...comments, comment]);
      setNewComment('');
      if (onCommentCountChange) {
        onCommentCountChange(comments.length + 1);
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = (commentId: string) => {
    try {
      // 사용자 좋아요 상태
      const userLikes = JSON.parse(localStorage.getItem(USER_COMMENT_LIKES_KEY) || '[]') as string[];
      const hasLiked = userLikes.includes(commentId);

      // 토글
      const newLikes = hasLiked
        ? userLikes.filter(id => id !== commentId)
        : [...userLikes, commentId];

      localStorage.setItem(USER_COMMENT_LIKES_KEY, JSON.stringify(newLikes));

      // 댓글 좋아요 수 업데이트
      const allComments = JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY) || '[]') as Comment[];
      const updatedComments = allComments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            like_count: hasLiked ? c.like_count - 1 : c.like_count + 1,
          };
        }
        return c;
      });
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(updatedComments));

      // 화면 업데이트
      loadComments();
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const isCommentLiked = (commentId: string): boolean => {
    const userLikes = JSON.parse(localStorage.getItem(USER_COMMENT_LIKES_KEY) || '[]') as string[];
    return userLikes.includes(commentId);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="text-center py-8 text-gray-400 text-sm">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">
        댓글 {comments.length}개
      </h2>

      {/* 댓글 작성 폼 */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            required
            minLength={1}
            maxLength={1000}
            rows={3}
            className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:border-primary focus:outline-none resize-none mb-2"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{newComment.length}/1000</span>
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-3">댓글을 작성하려면 로그인이 필요합니다.</p>
          <a
            href="/auth/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
          >
            로그인
          </a>
        </div>
      )}

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          첫 댓글을 작성해보세요!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const avatarColor = getAvatarColor(comment.user_name);
            const firstChar = comment.user_name[0];
            const liked = isCommentLiked(comment.id);

            return (
              <div key={comment.id} className="pb-4 border-b border-border last:border-b-0 last:pb-0">
                {/* 작성자 정보 */}
                <div className="flex items-start gap-3">
                  <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0', avatarColor)}>
                    {firstChar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{comment.user_name}</span>
                      <span className="text-xs text-gray-400">{formatTimeAgo(comment.created_at)}</span>
                    </div>

                    {/* 댓글 내용 */}
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
                      {comment.content}
                    </p>

                    {/* 좋아요 버튼 */}
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={cn(
                        'flex items-center gap-1 text-xs transition-colors',
                        liked ? 'text-primary' : 'text-gray-400 hover:text-primary'
                      )}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{comment.like_count > 0 ? comment.like_count : '좋아요'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
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
  return past.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
