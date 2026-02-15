import { cn } from '@/lib/utils';
import { USER_LEVELS } from '@/lib/constants';
import type { UserLevel } from '@/types';

interface UserLevelBadgeProps {
  level: UserLevel;
  size?: 'sm' | 'md';
}

export default function UserLevelBadge({ level, size = 'sm' }: UserLevelBadgeProps) {
  const config = USER_LEVELS[level] || USER_LEVELS.newcomer;

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-bold',
      config.color,
      size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
    )}>
      {config.label}
    </span>
  );
}
