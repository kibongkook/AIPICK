'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, User as UserIcon, ChevronDown, Bookmark, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { cn, getAvatarColor } from '@/lib/utils';

export default function AuthButton() {
  const { user, isLoading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-100" />;
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-surface transition-colors"
      >
        로그인
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
      >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <div className={cn('flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold', getAvatarColor(user.name))}>
            {user.name.charAt(0)}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">{user.name}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-white py-1.5 shadow-lg z-50">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-surface transition-colors"
          >
            <UserIcon className="h-4 w-4" />
            내 프로필
          </Link>
          <Link
            href="/bookmarks"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-surface transition-colors"
          >
            <Bookmark className="h-4 w-4" />
            내 북마크
          </Link>
          <Link
            href="/profile#reviews"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-surface transition-colors"
          >
            <Star className="h-4 w-4" />
            내 리뷰
          </Link>
          <hr className="my-1 border-border" />
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
