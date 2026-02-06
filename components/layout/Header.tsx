'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { SITE_NAME, CATEGORIES } from '@/lib/constants';
import MobileNav from './MobileNav';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-1">
          <span className="text-2xl font-extrabold text-primary">AI</span>
          <span className="text-2xl font-extrabold text-foreground">PICK</span>
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden items-center gap-6 md:flex">
          {/* 카테고리 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              onBlur={() => setTimeout(() => setIsCategoryOpen(false), 150)}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              카테고리
              <ChevronDown className={`h-4 w-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCategoryOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 rounded-lg border border-border bg-white py-2 shadow-lg">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-surface hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 검색창 */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="AI 서비스 검색..."
              className="w-64 rounded-lg border border-border bg-surface py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>
        </nav>

        {/* 데스크탑 우측 버튼 */}
        <div className="hidden items-center gap-3 md:flex">
          <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-surface transition-colors">
            로그인
          </button>
        </div>

        {/* 모바일 메뉴 버튼 */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-primary"
          aria-label="메뉴 열기"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* 모바일 네비게이션 */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
}
