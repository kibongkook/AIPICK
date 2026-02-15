'use client';

import { useEffect, useState } from 'react';
import { Bookmark, Users, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBookmarkList } from '@/hooks/useBookmark';
import { cn, getAvatarColor } from '@/lib/utils';
import AuthGuard from '@/components/auth/AuthGuard';
import ServiceCard from '@/components/service/ServiceCard';
import { COMMUNITY_STORAGE_KEY, COMMUNITY_POST_TYPES } from '@/lib/constants';
import type { Tool, CommunityPost } from '@/types';
import Link from 'next/link';

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
  const [tab, setTab] = useState<'bookmarks' | 'community' | 'saved-posts'>('bookmarks');
  const [bookmarkedTools, setBookmarkedTools] = useState<Tool[]>([]);
  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    if (bookmarkedIds.length === 0) {
      setBookmarkedTools([]);
      return;
    }
    fetch('/api/tools')
      .then((res) => res.json())
      .then((data) => {
        const allTools: Tool[] = data.tools || [];
        setBookmarkedTools(allTools.filter((t) => bookmarkedIds.includes(t.id)));
      })
      .catch(() => setBookmarkedTools([]));
  }, [bookmarkedIds]);

  useEffect(() => {
    if (!user) return;
    try {
      // 새 형식
      const posts: CommunityPost[] = JSON.parse(localStorage.getItem(COMMUNITY_STORAGE_KEY) || '[]');
      const mine = posts.filter((p) => p.user_id === user.id && !p.parent_id);
      setMyPosts(mine);

      // 레거시 형식도 확인 (마이그레이션 안 된 경우)
      if (mine.length === 0) {
        const oldReviews = JSON.parse(localStorage.getItem('aipick_reviews') || '[]');
        const oldComments = JSON.parse(localStorage.getItem('aipick_comments') || '[]');
        const legacy: CommunityPost[] = [];
        for (const r of oldReviews) {
          if (r.user_id === user.id) {
            legacy.push({
              id: r.id, target_type: 'tool', target_id: r.tool_id,
              user_id: r.user_id, user_name: r.user_name || '사용자',
              post_type: 'discussion', title: r.content.slice(0, 50), content: r.content,
              rating: r.rating,
              parent_id: null, media: [], like_count: r.helpful_count || 0,
              comment_count: 0, bookmark_count: 0, view_count: 0,
              popularity_score: 0, quality_score: 0,
              is_reported: false, is_pinned: false, is_hidden: false,
              created_at: r.created_at, updated_at: r.created_at,
            });
          }
        }
        for (const c of oldComments) {
          if (c.user_id === user.id && !c.parent_id) {
            legacy.push({
              id: c.id, target_type: 'tool', target_id: c.tool_id,
              user_id: c.user_id, user_name: c.user_name || '사용자',
              post_type: 'discussion', title: c.content.slice(0, 50), content: c.content,
              rating: null,
              parent_id: null, media: [], like_count: c.like_count || 0,
              comment_count: 0, bookmark_count: 0, view_count: 0,
              popularity_score: 0, quality_score: 0,
              is_reported: false, is_pinned: false, is_hidden: false,
              created_at: c.created_at, updated_at: c.created_at,
            });
          }
        }
        if (legacy.length > 0) setMyPosts(legacy);
      }
    } catch { /* ignore */ }
  }, [user]);

  // 저장한 커뮤니티 글 로드
  useEffect(() => {
    if (!user) return;
    loadSavedPosts();
  }, [user, tab]);

  const loadSavedPosts = () => {
    try {
      const bookmarksKey = 'aipick_user_bookmarks';
      const userBookmarks = JSON.parse(localStorage.getItem(bookmarksKey) || '[]') as string[];

      if (userBookmarks.length === 0) {
        setSavedPosts([]);
        return;
      }

      const allPosts: CommunityPost[] = JSON.parse(localStorage.getItem(COMMUNITY_STORAGE_KEY) || '[]');
      const bookmarked = allPosts.filter(p => userBookmarks.includes(p.id));
      setSavedPosts(bookmarked);
    } catch { /* ignore */ }
  };

  if (!user) return null;

  const tabs = [
    { id: 'bookmarks' as const, label: '북마크', icon: Bookmark, count: bookmarkedTools.length },
    { id: 'saved-posts' as const, label: '저장한 글', icon: BookmarkCheck, count: savedPosts.length },
    { id: 'community' as const, label: '내 글', icon: Users, count: myPosts.length },
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

      {tab === 'saved-posts' && (
        savedPosts.length > 0 ? (
          <div className="space-y-3">
            {savedPosts.map((post) => {
              const typeConfig = COMMUNITY_POST_TYPES[post.post_type as keyof typeof COMMUNITY_POST_TYPES];
              const avatarColor = getAvatarColor(post.user_name || 'User');
              const firstChar = (post.user_name || 'U')[0];

              return (
                <Link key={post.id} href={`/community/${post.id}`}>
                  <div className="rounded-xl border border-border bg-white p-5 hover:shadow-md transition-shadow">
                    {/* 태그 */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                            #{tag.tag_display}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 제목 */}
                    <h3 className="text-base font-bold text-foreground mb-2 line-clamp-1">
                      {post.title}
                    </h3>

                    {/* 본문 미리보기 */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>

                    {/* 하단 정보 */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <div className={cn('h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-bold', avatarColor)}>
                          {firstChar}
                        </div>
                        <span>{post.user_name}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', typeConfig?.color || 'bg-gray-100 text-gray-600')}>
                          {typeConfig?.label || post.post_type}
                        </span>
                        <span>좋아요 {post.like_count}</span>
                        <span>댓글 {post.comment_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={BookmarkCheck} message="저장한 글이 없습니다" />
        )
      )}

      {tab === 'community' && (
        myPosts.length > 0 ? (
          <div className="space-y-3">
            {myPosts.map((post) => {
              const typeConfig = COMMUNITY_POST_TYPES[post.post_type as keyof typeof COMMUNITY_POST_TYPES];
              return (
                <div key={post.id} className="rounded-xl border border-border bg-white p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', typeConfig?.color || 'bg-gray-100 text-gray-600')}>
                      {typeConfig?.label || post.post_type}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
                  {post.like_count > 0 && (
                    <p className="text-xs text-gray-400 mt-2">좋아요 {post.like_count}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Users} message="작성한 커뮤니티 글이 없습니다" />
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
