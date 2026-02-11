import Link from 'next/link';
import { Clock, Wrench, ArrowRight } from 'lucide-react';
import { RECIPE_DIFFICULTY } from '@/lib/constants';
import DynamicIcon from '@/components/ui/DynamicIcon';
import type { AIRecipe } from '@/types';

interface RecipeCardProps {
  recipe: AIRecipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const difficulty = RECIPE_DIFFICULTY[recipe.difficulty];

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group block rounded-xl border border-border bg-white overflow-hidden hover:border-primary hover:shadow-lg transition-all"
    >
      {/* 상단 그라데이션 바 */}
      <div className={`h-1.5 bg-gradient-to-r ${recipe.color}`} />

      <div className="p-5">
        {/* 아이콘 + 카테고리 */}
        <div className="flex items-start justify-between mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${recipe.color} shadow-sm`}>
            <DynamicIcon name={recipe.icon} className="h-5 w-5 text-white" />
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${difficulty.color}`}>
            {difficulty.label}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {recipe.title}
        </h3>
        <p className="text-xs text-gray-400 mb-4 line-clamp-2">
          {recipe.subtitle}
        </p>

        {/* 메타 정보 */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Wrench className="h-3 w-3" />
            AI {recipe.tool_count}개
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {recipe.estimated_time}
          </span>
        </div>

        {/* 사용 도구 미리보기 */}
        <div className="mt-3 flex flex-wrap gap-1">
          {recipe.steps.slice(0, 4).map((step) => (
            <span
              key={step.step}
              className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded"
            >
              {step.tool_name}
            </span>
          ))}
          {recipe.steps.length > 4 && (
            <span className="text-[10px] text-gray-400">+{recipe.steps.length - 4}</span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          레시피 보기
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}
