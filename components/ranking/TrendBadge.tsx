import { ArrowUp, ArrowDown, Minus, Sparkles, Flame } from 'lucide-react';
import { TREND_THRESHOLDS } from '@/lib/constants';
import type { TrendDirection } from '@/types';

interface TrendBadgeProps {
  direction: TrendDirection;
  magnitude: number;
  size?: 'sm' | 'md';
}

export default function TrendBadge({ direction, magnitude, size = 'sm' }: TrendBadgeProps) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';
  const isHot = magnitude >= TREND_THRESHOLDS.HOT;

  if (direction === 'new') {
    return (
      <span className={`inline-flex items-center gap-0.5 ${textSize} font-semibold text-blue-500`}>
        <Sparkles className={iconSize} />
        NEW
      </span>
    );
  }

  if (direction === 'up') {
    return (
      <span className={`inline-flex items-center gap-0.5 ${textSize} font-semibold text-emerald-600`}>
        {isHot ? <Flame className={iconSize} /> : <ArrowUp className={iconSize} />}
        +{magnitude}
      </span>
    );
  }

  if (direction === 'down') {
    return (
      <span className={`inline-flex items-center gap-0.5 ${textSize} font-semibold text-red-500`}>
        <ArrowDown className={iconSize} />
        -{magnitude}
      </span>
    );
  }

  // stable
  return (
    <span className={`inline-flex items-center gap-0.5 ${textSize} text-gray-400`}>
      <Minus className={iconSize} />
    </span>
  );
}
