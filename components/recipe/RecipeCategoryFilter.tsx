'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RECIPE_CATEGORIES } from '@/lib/constants';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { cn } from '@/lib/utils';

export default function RecipeCategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('category') || 'all';

  function handleFilter(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/recipes?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleFilter('all')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
          current === 'all'
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        )}
      >
        전체
      </button>
      {Object.entries(RECIPE_CATEGORIES).map(([key, config]) => (
        <button
          key={key}
          onClick={() => handleFilter(key)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            current === key
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <DynamicIcon name={config.icon} className="h-3 w-3" />
          {config.label}
        </button>
      ))}
    </div>
  );
}
