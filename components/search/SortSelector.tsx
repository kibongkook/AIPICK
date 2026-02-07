'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'popular', label: '인기순' },
  { value: 'rating', label: '평점순' },
  { value: 'latest', label: '최신순' },
  { value: 'free_first', label: '무료 우선' },
] as const;

export default function SortSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('sort') || 'popular';

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1.5">
      <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-foreground outline-none focus:border-primary"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
