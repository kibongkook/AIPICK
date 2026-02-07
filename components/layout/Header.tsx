'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import SearchBar from '@/components/search/SearchBar';
import AuthButton from '@/components/auth/AuthButton';
import MobileNav from './MobileNav';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 - 모바일은 아이콘만, 데스크탑은 텍스트 포함 */}
        <Link href="/" className="shrink-0">
          <span className="hidden sm:block">
            <Logo size="md" showText={true} />
          </span>
          <span className="sm:hidden">
            <Logo size="sm" showText={false} />
          </span>
        </Link>

        {/* 데스크탑 네비게이션 - 간소화된 4개 메뉴 */}
        <nav className="hidden items-center gap-5 md:flex">
          <Link href="/discover" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
            AI 찾기
          </Link>
          <Link href="/rankings" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            랭킹
          </Link>
          <Link href="/news" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            뉴스
          </Link>

          <SearchBar className="w-52" />
        </nav>

        {/* 데스크탑 우측 버튼 */}
        <div className="hidden items-center gap-3 md:flex">
          <AuthButton />
        </div>

        {/* 모바일 우측: 검색 + 메뉴 */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/search" className="p-2 text-gray-500 hover:text-primary">
            <Search className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-primary"
            aria-label="메뉴 열기"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* 모바일 네비게이션 */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
}
