'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommunityTag, CommunityFilters } from '@/types';

interface CommunityFilterBarProps {
  filters: CommunityFilters;
  availableGoals: CommunityTag[];
  availableAIs: CommunityTag[];
  onFilterChange: (filters: Partial<CommunityFilters>) => void;
}

export default function CommunityFilterBar({
  filters,
  availableGoals,
  availableAIs,
  onFilterChange,
}: CommunityFilterBarProps) {
  const { goal, ai, keyword, sort = 'latest' } = filters;

  return (
    <div className="py-4">
      {/* 목적 필터 */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onFilterChange({ goal: undefined })}
          className={cn(
            'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
            !goal
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          전체
        </button>
        {availableGoals.map(tag => (
          <button
            key={tag.id}
            onClick={() => onFilterChange({ goal: tag.tag_value })}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              goal === tag.tag_value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {tag.tag_display}
          </button>
        ))}
      </div>

      {/* AI 서비스 + 검색 + 정렬 */}
      <div className="flex items-center gap-3">
        {/* AI 필터 */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {availableAIs.slice(0, 8).map(tag => (
            <button
              key={tag.id}
              onClick={() => onFilterChange({
                ai: ai === tag.tag_value ? undefined : tag.tag_value
              })}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                ai === tag.tag_value
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              )}
            >
              {tag.tag_display}
            </button>
          ))}
        </div>

        {/* 검색 */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={keyword || ''}
              onChange={(e) => onFilterChange({ keyword: e.target.value || undefined })}
              placeholder="키워드 검색"
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* 정렬 */}
        <select
          value={sort}
          onChange={(e) => onFilterChange({ sort: e.target.value as any })}
          className="shrink-0 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
        >
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
          <option value="saved">저장순</option>
        </select>
      </div>
    </div>
  );
}
