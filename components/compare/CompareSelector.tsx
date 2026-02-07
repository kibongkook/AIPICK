'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRightLeft } from 'lucide-react';
import { cn, getAvatarColor } from '@/lib/utils';
import type { Tool } from '@/types';
import { getCompareUrl } from '@/lib/compare/popular-pairs';

interface CompareSelectorProps {
  tools: Tool[];
  currentSlugs: string[];
}

export default function CompareSelector({ tools, currentSlugs }: CompareSelectorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(currentSlugs);
  const [query, setQuery] = useState('');
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSlot !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingSlot]);

  const filtered = query
    ? tools
        .filter(
          (t) =>
            !selected.includes(t.slug) &&
            (t.name.toLowerCase().includes(query.toLowerCase()) ||
              t.slug.includes(query.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  const selectTool = (slug: string) => {
    const newSelected = [...selected];
    if (editingSlot !== null && editingSlot < newSelected.length) {
      newSelected[editingSlot] = slug;
    } else {
      newSelected.push(slug);
    }
    setSelected(newSelected);
    setQuery('');
    setEditingSlot(null);

    if (newSelected.length >= 2) {
      router.push(getCompareUrl(newSelected[0], newSelected[1]));
    }
  };

  const removeTool = (index: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {selected.map((slug, index) => {
        const tool = tools.find((t) => t.slug === slug);
        if (!tool) return null;
        return (
          <div
            key={slug}
            className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2"
          >
            {tool.logo_url ? (
              <img src={tool.logo_url} alt={tool.name} className="h-6 w-6 rounded object-cover" />
            ) : (
              <div className={cn('flex h-6 w-6 items-center justify-center rounded text-white text-[10px] font-bold', getAvatarColor(tool.name))}>
                {tool.name.charAt(0)}
              </div>
            )}
            <span className="text-sm font-medium">{tool.name}</span>
            <button
              onClick={() => removeTool(index)}
              className="ml-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}

      {selected.length >= 2 && (
        <ArrowRightLeft className="h-4 w-4 text-gray-300" />
      )}

      {selected.length < 3 && (
        <div className="relative">
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (editingSlot === null) setEditingSlot(selected.length);
              }}
              placeholder="도구 추가..."
              className="w-32 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          {filtered.length > 0 && (
            <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded-lg border border-border bg-white shadow-lg">
              {filtered.map((tool) => (
                <button
                  key={tool.slug}
                  onClick={() => selectTool(tool.slug)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  {tool.logo_url ? (
                    <img src={tool.logo_url} alt={tool.name} className="h-5 w-5 rounded object-cover" />
                  ) : (
                    <div className={cn('flex h-5 w-5 items-center justify-center rounded text-white text-[9px] font-bold', getAvatarColor(tool.name))}>
                      {tool.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium">{tool.name}</span>
                  <span className="ml-auto text-xs text-gray-400">{tool.pricing_type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
