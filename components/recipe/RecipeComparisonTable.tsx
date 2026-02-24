import { BarChart3 } from 'lucide-react';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import type { RecipeOption } from '@/types';

interface RecipeComparisonTableProps {
  options: RecipeOption[];
  color: string;
}

export default function RecipeComparisonTable({ options, color }: RecipeComparisonTableProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 mb-8">
      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        방법 비교하기
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3 text-gray-400 font-medium w-20" />
              {options.map((opt, idx) => (
                <th key={opt.option_id} className="text-center py-2 px-2 font-bold text-foreground">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${color} text-white text-xs mr-1`}>
                    {idx + 1}
                  </span>
                  <span className="hidden sm:inline">{opt.title}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 난이도 */}
            <tr className="border-b border-border/50">
              <td className="py-2 pr-3 text-gray-500 font-medium">난이도</td>
              {options.map((opt) => (
                <td key={opt.option_id} className="py-2 px-2 text-center">
                  <DifficultyBadge difficulty={opt.difficulty} showStars />
                </td>
              ))}
            </tr>

            {/* 소요 시간 */}
            <tr className="border-b border-border/50">
              <td className="py-2 pr-3 text-gray-500 font-medium">소요 시간</td>
              {options.map((opt) => (
                <td key={opt.option_id} className="py-2 px-2 text-center text-gray-600">
                  {opt.estimated_time}
                </td>
              ))}
            </tr>

            {/* 도구 수 */}
            <tr className="border-b border-border/50">
              <td className="py-2 pr-3 text-gray-500 font-medium">도구 수</td>
              {options.map((opt) => (
                <td key={opt.option_id} className="py-2 px-2 text-center text-gray-600">
                  {opt.tool_count}개
                </td>
              ))}
            </tr>

            {/* 퀄리티 */}
            <tr className="border-b border-border/50">
              <td className="py-2 pr-3 text-gray-500 font-medium">퀄리티</td>
              {options.map((opt) => (
                <td key={opt.option_id} className="py-2 px-2 text-center">
                  <div className="flex justify-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-3.5 rounded-sm ${
                          i < opt.quality_rating ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* 자유도 */}
            <tr className="border-b border-border/50">
              <td className="py-2 pr-3 text-gray-500 font-medium">자유도</td>
              {options.map((opt) => (
                <td key={opt.option_id} className="py-2 px-2 text-center">
                  <div className="flex justify-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-3.5 rounded-sm ${
                          i < opt.customization_rating ? 'bg-amber-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* 추천 대상 */}
            <tr>
              <td className="py-2 pr-3 text-gray-500 font-medium">추천 대상</td>
              {options.map((opt) => (
                <td key={opt.option_id} className="py-2 px-2 text-center text-gray-500 leading-relaxed">
                  {opt.best_for || '—'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
