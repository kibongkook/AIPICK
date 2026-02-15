import { CONFIDENCE_BADGES } from '@/lib/constants';
import type { ConfidenceLevel } from '@/types';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  sourceCount?: number;
  size?: 'sm' | 'md';
}

export default function ConfidenceBadge({ level, sourceCount, size = 'sm' }: ConfidenceBadgeProps) {
  if (level === 'none') return null;

  const badge = CONFIDENCE_BADGES[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        badge.color,
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'
      )}
      title={`신뢰도: ${badge.label} (${sourceCount ?? 0}개 소스)`}
    >
      <Shield className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      {badge.label}
      {sourceCount !== undefined && (
        <span className="opacity-70">{sourceCount}</span>
      )}
    </span>
  );
}
