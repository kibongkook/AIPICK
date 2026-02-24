import { Sprout, ArrowDown } from 'lucide-react';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import type { RecipeOption } from '@/types';

interface RecipeGrowthPathProps {
  options: RecipeOption[];
  color: string;
}

export default function RecipeGrowthPath({ options, color }: RecipeGrowthPathProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 mb-8">
      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <Sprout className="h-4 w-4 text-emerald-500" />
        나의 성장 경로
      </h3>

      <div className="flex flex-col items-center gap-1">
        {options.map((option, idx) => (
          <div key={option.option_id} className="w-full max-w-sm">
            {/* 옵션 노드 */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-gray-50 p-3 hover:bg-gray-100 transition-colors">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${color} text-white text-sm font-bold shrink-0`}>
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-foreground truncate">{option.title}</span>
                  <DifficultyBadge difficulty={option.difficulty} />
                </div>
                <span className="text-xs text-gray-400">{option.estimated_time}</span>
              </div>
            </div>

            {/* 연결 화살표 */}
            {idx < options.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="h-4 w-4 text-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        각 옵션을 완료하면 다음 옵션에 도전해보세요!
      </p>
    </div>
  );
}
