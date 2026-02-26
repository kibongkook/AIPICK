'use client';

import { useState, useMemo } from 'react';
import { DISCOVER_CATEGORY_TABS, DISCOVER_SORT_OPTIONS, type DiscoverSortKey } from '@/lib/constants';
import GalleryCard, { type GalleryItem } from './GalleryCard';

const PRICING_ORDER = { Free: 0, Freemium: 1, Paid: 2 } as const;

function sortItems(items: GalleryItem[], key: DiscoverSortKey): GalleryItem[] {
  const arr = [...items];
  switch (key) {
    case 'free':
      return arr.sort((a, b) => PRICING_ORDER[a.pricingType] - PRICING_ORDER[b.pricingType]);
    case 'quality':
      return arr.sort((a, b) => b.ratingAvg - a.ratingAvg);
    case 'rich':
      return arr.sort((a, b) => b.cases[0].output.length - a.cases[0].output.length);
    default: // recommended: 무료 우선 + 평점
      return arr.sort((a, b) => {
        const diff = PRICING_ORDER[a.pricingType] - PRICING_ORDER[b.pricingType];
        return diff !== 0 ? diff : b.ratingAvg - a.ratingAvg;
      });
  }
}

interface Props {
  items: GalleryItem[];
}

export default function OutputGallery({ items }: Props) {
  const [activeTab, setActiveTab] = useState('');
  const [sortKey, setSortKey] = useState<DiscoverSortKey>('recommended');

  const availableSlugs = useMemo(() => new Set(items.map((i) => i.categorySlug)), [items]);
  const visibleTabs = DISCOVER_CATEGORY_TABS.filter((t) => t.slug === '' || availableSlugs.has(t.slug));

  const filtered = useMemo(() => {
    const result = activeTab ? items.filter((i) => i.categorySlug === activeTab) : items;
    return sortItems(result, sortKey);
  }, [items, activeTab, sortKey]);

  return (
    <div>
      {/* ── 카테고리 탭 ── */}
      <div className="flex flex-wrap gap-2 mb-3">
        {visibleTabs.map((tab) => (
          <button
            key={tab.slug}
            onClick={() => setActiveTab(tab.slug)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.slug
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.emoji && <span className="mr-1">{tab.emoji}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 정렬 옵션 ── */}
      <div className="flex items-center gap-2 mb-6">
        <span className="shrink-0 text-xs font-medium text-gray-400">정렬</span>
        {DISCOVER_SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortKey(opt.key)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              sortKey === opt.key
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── 카드 목록 ── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="mb-2 text-4xl">🤔</p>
          <p className="text-sm text-gray-400">해당 조건의 결과물이 없어요</p>
          <button
            onClick={() => { setActiveTab(''); setSortKey(DISCOVER_SORT_OPTIONS[0].key); }}
            className="mt-4 text-sm text-primary hover:underline"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs text-gray-400">{filtered.length}개의 AI</p>
          <div className="space-y-5">
            {filtered.map((item) => (
              <GalleryCard key={item.slug} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
