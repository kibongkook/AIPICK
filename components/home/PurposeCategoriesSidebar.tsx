'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { formatRating } from '@/lib/utils';
import type { Tool } from '@/types';

interface PurposeCategory {
  slug: string;
  title: string;
  icon: string;
}

interface PurposeCategoriesSidebarProps {
  categories: PurposeCategory[];
  toolsByCategory: Record<string, Tool[]>;
}

export default function PurposeCategoriesSidebar({ categories, toolsByCategory }: PurposeCategoriesSidebarProps) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug || '');

  if (categories.length === 0) return null;

  // 평점 순으로 정렬
  const activeTools = [...(toolsByCategory[activeSlug] || [])]
    .sort((a, b) => b.rating_avg - a.rating_avg);

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">목적별 인기 AI</h3>
        <Link href="/discover" className="text-[11px] text-primary font-medium">전체 →</Link>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex flex-wrap gap-1 mb-3">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveSlug(cat.slug)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
              activeSlug === cat.slug
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <DynamicIcon name={cat.icon} className="h-3 w-3" />
            {cat.title.split(' · ')[0]}
          </button>
        ))}
      </div>

      {/* 해당 카테고리 도구 목록 (평점 순) */}
      <div className="space-y-1">
        {activeTools.map((tool, i) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-primary-light/40 transition-colors"
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white shrink-0 ${
              i === 0 ? 'bg-yellow-400' :
              i === 1 ? 'bg-gray-400' :
              i === 2 ? 'bg-amber-600' :
              'bg-gray-200 text-gray-500'
            }`}>
              {i + 1}
            </span>
            {tool.logo_url ? (
              <img src={tool.logo_url} alt={tool.name} className="h-6 w-6 rounded object-cover shrink-0" />
            ) : (
              <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-400 shrink-0">
                {tool.name.charAt(0)}
              </div>
            )}
            <span className="text-xs font-semibold text-foreground truncate flex-1">{tool.name}</span>
            {tool.rating_avg > 0 && (
              <div className="flex items-center gap-0.5 shrink-0">
                <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                <span className="text-[10px] font-bold text-foreground">{formatRating(tool.rating_avg)}</span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* 카테고리 전체 보기 링크 */}
      <Link
        href={`/category/${activeSlug}`}
        className="mt-2 flex items-center justify-center gap-1 rounded-lg bg-gray-50 py-2 text-[11px] font-medium text-primary hover:bg-primary-light/40 transition-colors"
      >
        전체 보기
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
