'use client';

import { useState, useEffect, useRef } from 'react';

interface MentionOption {
  id: string;
  name: string;
  slug: string;
}

interface MentionAutocompleteProps {
  query: string;
  onSelect: (tool: MentionOption) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export default function MentionAutocomplete({ query, onSelect, onClose, position }: MentionAutocompleteProps) {
  const [options, setOptions] = useState<MentionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query || query.length < 1) {
      setOptions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/community/v2/mentions?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setOptions(data.tools || []);
          setSelectedIndex(0);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, options.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && options[selectedIndex]) {
        e.preventDefault();
        onSelect(options[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [options, selectedIndex, onSelect, onClose]);

  if (options.length === 0 && !loading) return null;

  return (
    <div
      ref={ref}
      className="absolute z-50 w-64 max-h-48 bg-white border border-border rounded-lg shadow-lg overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      {loading ? (
        <div className="px-3 py-2 text-xs text-gray-400">검색 중...</div>
      ) : (
        options.map((tool, i) => (
          <button
            key={tool.id}
            onClick={() => onSelect(tool)}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
              i === selectedIndex ? 'bg-primary/5 text-primary' : 'text-foreground'
            }`}
          >
            <span className="font-medium">{tool.name}</span>
            <span className="text-xs text-gray-400 ml-1">@{tool.slug}</span>
          </button>
        ))
      )}
    </div>
  );
}
