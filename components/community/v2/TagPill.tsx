'use client';

import { cn } from '@/lib/utils';
import type { CommunityTag, TagType } from '@/types';

interface TagPillProps {
  tag: CommunityTag;
  onClick?: (tag: CommunityTag) => void;
  removable?: boolean;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

const TAG_TYPE_COLORS: Record<TagType, string> = {
  GOAL: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  AI_TOOL: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  FEATURE: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  KEYWORD: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
};

export default function TagPill({ tag, onClick, removable, onRemove, size = 'sm' }: TagPillProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(tag);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) onRemove();
  };

  const colorClass = tag.tag_color || TAG_TYPE_COLORS[tag.tag_type];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
        colorClass,
        sizeClass,
        onClick && 'cursor-pointer',
        !onClick && 'cursor-default'
      )}
      disabled={!onClick}
    >
      <span>#{tag.tag_display}</span>
      {removable && onRemove && (
        <span
          onClick={handleRemove}
          className="ml-0.5 hover:opacity-70"
        >
          ×
        </span>
      )}
    </button>
  );
}
