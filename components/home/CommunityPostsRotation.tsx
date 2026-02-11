'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, ThumbsUp, MessageCircle } from 'lucide-react';
import type { CommunityPost } from '@/types';

const ROTATION_INTERVAL_MS = 10_000;

function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return past.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

interface CommunityPostsRotationProps {
  posts: CommunityPost[];
}

export default function CommunityPostsRotation({ posts }: CommunityPostsRotationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [posts.length]);

  if (posts.length === 0) {
    return (
      <section className="flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-foreground flex items-center">
            커뮤니티
            <MessageSquare className="ml-1 h-3.5 w-3.5 text-purple-500" />
          </h2>
        </div>
        <Link
          href="/community"
          className="group flex flex-col flex-1 rounded-xl border border-purple-200 bg-gradient-to-b from-purple-50/50 to-white p-4 hover:border-purple-400 hover:shadow-lg transition-all items-center justify-center"
        >
          <MessageSquare className="h-8 w-8 text-purple-300 mb-2" />
          <p className="text-sm font-semibold text-gray-400 mb-1">아직 커뮤니티 글이 없습니다</p>
          <p className="text-xs text-gray-400">첫 번째 글을 작성해보세요 →</p>
        </Link>
      </section>
    );
  }

  const post = posts[currentIndex];
  const postTitle = post.title || post.content.slice(0, 50);

  return (
    <section className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-extrabold text-foreground flex items-center">
          커뮤니티
          <MessageSquare className="ml-1 h-3.5 w-3.5 text-purple-500" />
        </h2>
        {posts.length > 1 && (
          <div className="flex items-center gap-1">
            {posts.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'w-3 bg-purple-500' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <Link
        href={`/community/${post.id}`}
        className="group flex flex-col flex-1 rounded-xl border border-purple-200 bg-gradient-to-b from-purple-50/50 to-white p-4 hover:border-purple-400 hover:shadow-lg transition-all"
      >
        {/* 제목 */}
        <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-2">{postTitle}</h3>

        {/* 내용 */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-2 flex-1">{post.content}</p>

        {/* 하단 정보 */}
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center gap-2">
            <span>{post.user_name || '익명'}</span>
            <span>·</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            {post.like_count > 0 && (
              <div className="flex items-center gap-0.5">
                <ThumbsUp className="h-2.5 w-2.5" />
                <span>{post.like_count}</span>
              </div>
            )}
            {post.comment_count > 0 && (
              <div className="flex items-center gap-0.5">
                <MessageCircle className="h-2.5 w-2.5" />
                <span>{post.comment_count}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </section>
  );
}
