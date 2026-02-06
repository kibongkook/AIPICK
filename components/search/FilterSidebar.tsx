'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Filter, X } from 'lucide-react';
import { CATEGORIES, JOB_CATEGORIES, EDU_LEVELS } from '@/lib/constants';
import type { PricingType } from '@/types';

const PRICING_OPTIONS: { value: string; label: string }[] = [
  { value: 'Free', label: '완전 무료' },
  { value: 'Freemium', label: '부분 무료' },
  { value: 'Paid', label: '유료' },
];

const SORT_OPTIONS = [
  { value: 'popular', label: '인기순' },
  { value: 'rating', label: '평점순' },
  { value: 'latest', label: '최신순' },
  { value: 'free_first', label: '무료 우선' },
];

const RATING_OPTIONS = [
  { value: '4', label: '4.0 이상' },
  { value: '4.5', label: '4.5 이상' },
];

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPricing = searchParams.getAll('pricing');
  const currentCategory = searchParams.getAll('category');
  const currentKorean = searchParams.get('korean') === 'true';
  const currentRating = searchParams.get('min_rating') || '';
  const currentJob = searchParams.get('job') || '';
  const currentEdu = searchParams.get('edu') || '';
  const currentSort = searchParams.get('sort') || 'popular';
  const query = searchParams.get('q') || '';

  const hasActiveFilters = currentPricing.length > 0 || currentCategory.length > 0 ||
    currentKorean || currentRating || currentJob || currentEdu;

  const updateFilters = useCallback(
    (key: string, value: string | string[] | null) => {
      const params = new URLSearchParams(searchParams.toString());

      // 기존 해당 키 삭제
      params.delete(key);

      if (value === null) {
        // 삭제만
      } else if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value) {
        params.set(key, value);
      }

      router.push(`/search?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const toggleArrayFilter = useCallback(
    (key: string, value: string) => {
      const current = searchParams.getAll(key);
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      updateFilters(key, updated.length > 0 ? updated : null);
    },
    [searchParams, updateFilters]
  );

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('sort', 'popular');
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  return (
    <aside className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4" />
          필터
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
          >
            <X className="h-3 w-3" />
            초기화
          </button>
        )}
      </div>

      {/* 정렬 */}
      <FilterSection title="정렬">
        <select
          value={currentSort}
          onChange={(e) => updateFilters('sort', e.target.value)}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </FilterSection>

      {/* 가격 */}
      <FilterSection title="가격">
        {PRICING_OPTIONS.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentPricing.includes(opt.value)}
              onChange={() => toggleArrayFilter('pricing', opt.value)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
      </FilterSection>

      {/* 카테고리 */}
      <FilterSection title="카테고리">
        {CATEGORIES.map((cat) => (
          <label key={cat.slug} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentCategory.includes(cat.slug)}
              onChange={() => toggleArrayFilter('category', cat.slug)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">{cat.name}</span>
          </label>
        ))}
      </FilterSection>

      {/* 한국어 지원 */}
      <FilterSection title="한국어 지원">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={currentKorean}
            onChange={() => updateFilters('korean', currentKorean ? null : 'true')}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">한국어 지원만</span>
        </label>
      </FilterSection>

      {/* 최소 평점 */}
      <FilterSection title="최소 평점">
        <select
          value={currentRating}
          onChange={(e) => updateFilters('min_rating', e.target.value || null)}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">전체</option>
          {RATING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </FilterSection>

      {/* 직군 필터 */}
      <FilterSection title="직군">
        <select
          value={currentJob}
          onChange={(e) => updateFilters('job', e.target.value || null)}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">전체</option>
          {JOB_CATEGORIES.map((job) => (
            <option key={job.slug} value={job.slug}>{job.name}</option>
          ))}
        </select>
      </FilterSection>

      {/* 학년 필터 */}
      <FilterSection title="학년">
        <select
          value={currentEdu}
          onChange={(e) => updateFilters('edu', e.target.value || null)}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">전체</option>
          {EDU_LEVELS.map((level) => (
            <option key={level.slug} value={level.slug}>{level.name}</option>
          ))}
        </select>
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}
