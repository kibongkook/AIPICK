'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, User, PenSquare } from 'lucide-react';
import { FEED_TABS } from '@/lib/constants';
import { useAuth } from '@/lib/auth/AuthContext';

interface TopBarProps {
  currentTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export default function TopBar({ currentTab = 'today', onTabChange, className = '' }: TopBarProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={`bg-white border-b border-border sticky top-0 z-30 ${className}`}>
      {/* 상단: 검색 + 액션 버튼 */}
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        {/* 검색바 */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="AI 도구, 레시피, 질문 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>
        </form>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-2">
          {/* 글쓰기 버튼 */}
          {user && (
            <Link
              href="/community/write"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              <PenSquare className="h-4 w-4" />
              <span className="hidden sm:inline">작성</span>
            </Link>
          )}

          {/* 알림 버튼 */}
          {user && (
            <Link
              href="/notifications"
              className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              {/* 알림 뱃지 (나중에 구현) */}
              {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /> */}
            </Link>
          )}

          {/* 사용자 메뉴 */}
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || 'User'}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">
                {user.name || user.email?.split('@')[0]}
              </span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              로그인
            </Link>
          )}
        </div>
      </div>

    </header>
  );
}
