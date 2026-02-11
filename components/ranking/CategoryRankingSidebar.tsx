'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatRating } from '@/lib/utils';
import type { Tool } from '@/types';

export interface CategoryRanking {
  label: string;
  slug: string;
  tools: (Tool & { ranking: number })[];
}

interface CategoryRankingSidebarProps {
  rankings: CategoryRanking[];
}

export default function CategoryRankingSidebar({ rankings }: CategoryRankingSidebarProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (rankings.length === 0) return null;

  const current = rankings[activeIndex];

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + rankings.length) % rankings.length);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % rankings.length);

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      {/* 제목: 카테고리명 + 좌우 화살표 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <h3 className="text-sm font-bold text-foreground">
            {current.label} <span className="text-primary">Top 5</span>
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="이전 카테고리"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-gray-400" />
          </button>
          <span className="text-[10px] text-gray-400 tabular-nums">
            {activeIndex + 1}/{rankings.length}
          </span>
          <button
            onClick={goNext}
            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="다음 카테고리"
          >
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* 도트 인디케이터 */}
      <div className="flex justify-center gap-1 mb-3">
        {rankings.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex ? 'w-4 bg-primary' : 'w-1.5 bg-gray-200 hover:bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* 랭킹 목록 */}
      <div className="space-y-1">
        {current.tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-primary-light/40 transition-colors"
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white shrink-0 ${
              tool.ranking === 1 ? 'bg-yellow-400' :
              tool.ranking === 2 ? 'bg-gray-400' :
              tool.ranking === 3 ? 'bg-amber-600' :
              'bg-gray-200 text-gray-500'
            }`}>
              {tool.ranking}
            </span>
            {tool.logo_url ? (
              <img src={tool.logo_url} alt={tool.name} className="h-5 w-5 rounded object-cover shrink-0" />
            ) : (
              <div className="h-5 w-5 rounded bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400 shrink-0">
                {tool.name.charAt(0)}
              </div>
            )}
            <span className="text-xs font-semibold text-foreground truncate flex-1">{tool.name}</span>
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-bold text-foreground">{formatRating(tool.rating_avg)}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 전체 랭킹 링크 */}
      <Link
        href="/rankings"
        className="mt-3 flex items-center justify-center rounded-lg bg-gray-50 py-2 text-[11px] font-medium text-primary hover:bg-primary-light/40 transition-colors"
      >
        전체 랭킹 보기 →
      </Link>
    </div>
  );
}
