'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Star, Bookmark, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBookmarkList } from '@/hooks/useBookmark';
import { getTools } from '@/lib/supabase/queries';
import { cn, getAvatarColor } from '@/lib/utils';
import AuthGuard from '@/components/auth/AuthGuard';
import ServiceCard from '@/components/service/ServiceCard';
import type { Tool } from '@/types';
import type { StoredReview } from '@/hooks/useReviews';
import type { StoredComment } from '@/hooks/useComments';

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <AuthGuard message="프로필을 보려면 로그인이 필요합니다.">
        <ProfileContent />
      </AuthGuard>
    </div>
  );
}

function ProfileContent() {
  const { user, signOut } = useAuth();
  const { bookmarkedIds } = useBookmarkList();
  const [tab, setTab] = useState<'bookmarks' | 'reviews' | 'comments'>('bookmarks');
  const [bookmarkedTools, setBookmarkedTools] = useState<Tool[]>([]);
  const [myReviews, setMyReviews] = useState<StoredReview[]>([]);
  const [myComments, setMyComments] = useState<StoredComment[]>([]);

  useEffect(() => {
    const allTools = getTools();
    setBookmarkedTools(allTools.filter((t) => bookmarkedIds.includes(t.id)));
  }, [bookmarkedIds]);

  useEffect(() => {
    if (!user) return;
    try {
      const reviews: StoredReview[] = JSON.parse(localStorage.getItem('aipick_reviews') || '[]');
      setMyReviews(reviews.filter((r) => r.user_id === user.id));
      const comments: StoredComment[] = JSON.parse(localStorage.getItem('aipick_comments') || '[]');
      setMyComments(comments.filter((c) => c.user_id === user.id));
    } catch { /* ignore */ }
  }, [user]);

  if (!user) return null;

  const tabs = [
    { id: 'bookmarks' as const, label: '북마크', icon: Bookmark, count: bookmarkedTools.length },
    { id: 'reviews' as const, label: '리뷰', icon: Star, count: myReviews.length },
    { id: 'comments' as const, label: '댓글', icon: MessageSquare, count: myComments.length },
  ];

  return (
    <div>
      {/* 프로필 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <div className={cn('flex h-16 w-16 items-center justify-center rounded-full text-white text-2xl font-bold', getAvatarColor(user.name))}>
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {user.provider === 'demo' ? '데모 계정' : `${user.provider} 계정`} · 가입일 {new Date(user.created_at).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {t.count > 0 && (
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {tab === 'bookmarks' && (
        bookmarkedTools.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {bookmarkedTools.map((tool) => (
              <ServiceCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Bookmark} message="저장한 서비스가 없습니다" />
        )
      )}

      {tab === 'reviews' && (
        myReviews.length > 0 ? (
          <div className="space-y-4">
            {myReviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-border bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn('h-3.5 w-3.5', review.rating >= s ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200')}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
                <p className="text-sm text-gray-700">{review.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Star} message="작성한 리뷰가 없습니다" />
        )
      )}

      {tab === 'comments' && (
        myComments.length > 0 ? (
          <div className="space-y-3">
            {myComments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-border bg-white p-4">
                <p className="text-sm text-gray-700">{comment.content}</p>
                <span className="text-xs text-gray-400 mt-1 block">
                  {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={MessageSquare} message="작성한 댓글이 없습니다" />
        )
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: typeof Bookmark; message: string }) {
  return (
    <div className="py-12 text-center">
      <Icon className="mx-auto h-10 w-10 text-gray-300" />
      <p className="mt-3 text-sm text-gray-400">{message}</p>
    </div>
  );
}
