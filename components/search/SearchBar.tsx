'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  description: string;
  pricing_type: string;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
}

export default function SearchBar({
  className,
  placeholder = 'AI 서비스 검색...',
  defaultValue = '',
  autoFocus = false,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 자동완성 fetch (디바운스 300ms)
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&mode=autocomplete`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setIsOpen(data.suggestions?.length > 0);
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    if (onSearch) {
      onSearch(query.trim());
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[selectedIndex];
      router.push(`/tools/${selected.slug}`);
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-10 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* 자동완성 드롭다운 */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-white shadow-lg overflow-hidden">
          {suggestions.map((s, index) => (
            <Link
              key={s.id}
              href={`/tools/${s.slug}`}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                index === selectedIndex ? 'bg-blue-50 text-primary' : 'hover:bg-gray-50'
              )}
            >
              <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-foreground">{s.name}</span>
                <span className="ml-2 text-xs text-gray-400 truncate">{s.description}</span>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{s.pricing_type}</span>
            </Link>
          ))}
          <div className="border-t border-border px-4 py-2 text-center">
            <button
              onClick={handleSubmit as () => void}
              className="text-xs text-primary hover:text-primary-hover font-medium"
            >
              &quot;{query}&quot; 전체 검색 결과 보기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
