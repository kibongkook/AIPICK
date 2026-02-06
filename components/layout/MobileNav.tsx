'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

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
          <div className="relative mb-6">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="AI 서비스 검색..."
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

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
