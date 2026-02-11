'use client';

import { use, useState, useEffect } from 'react';
import { ArrowLeft, ThumbsUp, Bookmark, Eye, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { cn, getAvatarColor } from '@/lib/utils';
import type { CommunityPost } from '@/types';
import TagPill from '@/components/community/v2/TagPill';
import QuestionDetailView from '@/components/community/QuestionDetailView';
import CommentSection from '@/components/community/v2/CommentSection';

const STORAGE_KEY = 'aipick_community_v2';

function CommunityPostDetail({ postId }: { postId: string }) {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      // localStorage에서 먼저 찾기 (cp-v2- 로 시작하는 로컬 ID)
      if (postId.startsWith('cp-v2-')) {
        const localPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CommunityPost[];
        const localPost = localPosts.find(p => p.id === postId);

        if (localPost) {
          // 조회수 증가
          const updatedPosts = localPosts.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                view_count: (p.view_count || 0) + 1,
              };
            }
            return p;
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));

          // 좋아요/북마크 상태 로드
          const userLikes = JSON.parse(localStorage.getItem('aipick_user_likes') || '[]') as string[];
          const userBookmarks = JSON.parse(localStorage.getItem('aipick_user_bookmarks') || '[]') as string[];

          setPost({
            ...localPost,
            view_count: (localPost.view_count || 0) + 1,
            has_liked: userLikes.includes(postId),
            has_bookmarked: userBookmarks.includes(postId),
          });
          setLoading(false);
          return;
        }
      }

      // API에서 시도
      const res = await fetch(`/api/community/v2/answer?question_id=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data.question);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    // localStorage 기반 좋아요 토글
    const likesKey = 'aipick_user_likes';
    const userLikes = JSON.parse(localStorage.getItem(likesKey) || '[]') as string[];
    const hasLiked = userLikes.includes(post.id);

    // 토글
    const newLikes = hasLiked
      ? userLikes.filter(id => id !== post.id)
      : [...userLikes, post.id];

    localStorage.setItem(likesKey, JSON.stringify(newLikes));

    // 게시글 업데이트
    const localPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CommunityPost[];
    const updatedPosts = localPosts.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          like_count: hasLiked ? (p.like_count - 1) : (p.like_count + 1),
          has_liked: !hasLiked,
        };
      }
      return p;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
    await fetchPost();
  };

  const handleBookmark = async () => {
    if (!post) return;

    // localStorage 기반 북마크 토글
    const bookmarksKey = 'aipick_user_bookmarks';
    const userBookmarks = JSON.parse(localStorage.getItem(bookmarksKey) || '[]') as string[];
    const hasBookmarked = userBookmarks.includes(post.id);

    // 토글
    const newBookmarks = hasBookmarked
      ? userBookmarks.filter(id => id !== post.id)
      : [...userBookmarks, post.id];

    localStorage.setItem(bookmarksKey, JSON.stringify(newBookmarks));

    // 게시글 업데이트
    const localPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CommunityPost[];
    const updatedPosts = localPosts.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          bookmark_count: hasBookmarked ? (p.bookmark_count - 1) : (p.bookmark_count + 1),
          has_bookmarked: !hasBookmarked,
        };
      }
      return p;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
    await fetchPost();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-12 text-gray-400">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            커뮤니티로 돌아가기
          </Link>
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">글을 찾을 수 없습니다</p>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              커뮤니티로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 질문 타입인 경우 기존 QuestionDetailView 사용
  if (post.post_type === 'question') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <QuestionDetailView postId={postId} />
        </div>
      </div>
    );
  }

  // 일반 글 (discussion) 뷰
  const avatarColor = getAvatarColor(post.user_name || 'User');
  const firstChar = (post.user_name || 'U')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 뒤로 가기 */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          커뮤니티로 돌아가기
        </Link>

        {/* 글 상세 + 댓글 (하나의 박스) */}
        <div className="rounded-xl border border-border bg-white p-6">
          {/* 작성자 정보 + 액션 버튼 */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            {/* 좌측: 작성자 정보 */}
            <div className="flex items-center gap-2">
              <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold', avatarColor)}>
                {firstChar}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{post.user_name}</div>
                <div className="text-xs text-gray-400">{formatTimeAgo(post.created_at)}</div>
              </div>
            </div>

            {/* 우측: 액션 버튼 */}
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={handleLike}
                className={cn(
                  'flex items-center gap-1 transition-colors',
                  post.has_liked ? 'text-primary' : 'text-gray-400 hover:text-primary'
                )}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{post.like_count}</span>
              </button>

              <button
                onClick={handleBookmark}
                className={cn(
                  'flex items-center gap-1 transition-colors',
                  post.has_bookmarked ? 'text-primary' : 'text-gray-400 hover:text-primary'
                )}
              >
                <Bookmark className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1 text-gray-400">
                <Eye className="h-4 w-4" />
                <span>{post.view_count || 0}</span>
              </div>

              <div className="flex items-center gap-1 text-gray-400">
                <MessageSquare className="h-4 w-4" />
                <span>{post.comment_count || 0}</span>
              </div>
            </div>
          </div>

          {/* 태그 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {post.tags.map(tag => (
                <TagPill key={tag.id} tag={tag} />
              ))}
            </div>
          )}

          {/* 본문 */}
          <div className="text-base text-gray-700 whitespace-pre-wrap mb-6">
            {post.content}
          </div>

          {/* 미디어 */}
          {post.media && post.media.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {post.media.map((attachment, index) => (
                <div key={index} className="rounded-lg overflow-hidden border border-border">
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt={`첨부 이미지 ${index + 1}`}
                      className="w-full h-auto"
                    />
                  ) : (
                    <video
                      src={attachment.url}
                      controls
                      className="w-full h-auto"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 구분선 */}
          <div className="border-t border-border my-6"></div>

          {/* 댓글 영역 (같은 박스 내) */}
          <div>
            <CommentSection
              postId={postId}
              commentCount={post.comment_count || 0}
              onCommentCountChange={(newCount) => {
                setPost({ ...post, comment_count: newCount });
              }}
            />
          </div>
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
  return past.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CommunityPostDetail postId={id} />;
}
