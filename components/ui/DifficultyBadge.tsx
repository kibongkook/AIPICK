import { Star } from 'lucide-react';
import { RECIPE_DIFFICULTY_V2 } from '@/lib/constants';
import type { RecipeDifficultyV2 } from '@/types';

interface DifficultyBadgeProps {
  difficulty: RecipeDifficultyV2;
  showStars?: boolean;
  size?: 'sm' | 'md';
}

export default function DifficultyBadge({
  difficulty,
  showStars = false,
  size = 'sm',
}: DifficultyBadgeProps) {
  const config = RECIPE_DIFFICULTY_V2[difficulty];
  const sizeClass = size === 'md' ? 'text-sm px-2.5 py-1' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold ${config.color} ${sizeClass}`}>
      {showStars && (
        <span className="flex items-center gap-px">
          {Array.from({ length: config.stars }).map((_, i) => (
            <Star key={i} className="h-2.5 w-2.5 fill-current" />
          ))}
        </span>
      )}
      {config.label}
    </span>
  );
}
