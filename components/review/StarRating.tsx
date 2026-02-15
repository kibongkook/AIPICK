'use client';

import { useState, useRef } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const;

/**
 * 0.5 단위 별점 컴포넌트
 * - readonly: 평균 별점 표시 (반별 채움)
 * - interactive: 마우스 호버로 0.5 단위 선택
 */
export default function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const displayValue = hoverValue || value;
  const starSize = SIZE_MAP[size];

  const handleMouseMove = (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (readonly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    setHoverValue(starIndex + (isLeftHalf ? 0.5 : 1));
  };

  const handleClick = (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (readonly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const newValue = starIndex + (isLeftHalf ? 0.5 : 1);
    onChange(newValue === value ? 0 : newValue);
  };

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', !readonly && 'cursor-pointer')}
      onMouseLeave={() => setHoverValue(0)}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = displayValue - i;
        const isFull = fill >= 1;
        const isHalf = fill >= 0.5 && fill < 1;

        return (
          <button
            key={i}
            ref={(el) => { starRefs.current[i] = el; }}
            type="button"
            disabled={readonly}
            onMouseMove={(e) => handleMouseMove(i, e)}
            onClick={(e) => handleClick(i, e)}
            className={cn(
              'relative p-0 border-0 bg-transparent',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
            )}
            aria-label={`${i + 1}점`}
          >
            {/* 빈 별 (배경) */}
            <Star className={cn(starSize, 'text-gray-200')} />

            {/* 채워진 별 (오버레이) */}
            {(isFull || isHalf) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: isFull ? '100%' : '50%' }}
              >
                <Star className={cn(starSize, 'fill-yellow-400 text-yellow-400')} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
