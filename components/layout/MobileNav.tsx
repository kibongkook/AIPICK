'use client';

import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';
import SearchBar from '@/components/search/SearchBar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
        onClick={onClose}
      />

      {/* 슬라이드 패널 */}
      <div className="fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-xl md:hidden">
        <div className="flex flex-col h-full p-6">
          {/* 검색 */}
          <div className="mb-6">
            <SearchBar className="w-full" placeholder="AI 서비스 검색..." />
          </div>

          {/* 주요 메뉴 */}
          <nav className="flex flex-col gap-1 mb-6">
            <Link href="/rankings" onClick={onClose} className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-surface hover:text-primary transition-colors">
              랭킹
            </Link>
            <Link href="/jobs" onClick={onClose} className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-surface hover:text-primary transition-colors">
              직군별
            </Link>
            <Link href="/education" onClick={onClose} className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-surface hover:text-primary transition-colors">
              학년별
            </Link>
            <Link href="/recommend" onClick={onClose} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
              AI 추천
            </Link>
          </nav>

          {/* 카테고리 */}
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            카테고리
          </p>
          <nav className="flex flex-col gap-1">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                onClick={onClose}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-surface hover:text-primary transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* 하단 */}
          <div className="mt-auto pt-6 border-t border-border">
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
              로그인
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
