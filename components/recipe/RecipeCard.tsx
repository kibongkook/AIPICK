import Link from 'next/link';
import { Clock, Wrench, ArrowRight, Sparkles } from 'lucide-react';
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
        {/* 헤더: 아이콘 + 제목 + 메타 */}
        <div className="flex items-center gap-3 mb-1.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${recipe.color} shadow-sm shrink-0`}>
            <DynamicIcon name={recipe.icon} className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                {recipe.title}
              </h3>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ${difficulty.color}`}>
                {difficulty.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{recipe.subtitle}</span>
              <span className="flex items-center gap-1 shrink-0">
                <Wrench className="h-3 w-3" />AI {recipe.tool_count}개
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3" />{recipe.estimated_time}
              </span>
            </div>
          </div>
        </div>

        {/* 단계별 가로 배치 */}
        <div className={`grid gap-2.5 mt-3 ${recipe.steps.length <= 3 ? `grid-cols-${recipe.steps.length}` : 'grid-cols-3'}`} style={{ gridTemplateColumns: `repeat(${Math.min(recipe.steps.length, 4)}, 1fr)` }}>
          {recipe.steps.slice(0, 4).map((step) => (
            <div key={step.step} className="rounded-lg bg-gray-50 p-2.5 min-w-0">
              {/* 단계 헤더 */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${recipe.color} text-white text-xs font-bold shrink-0`}>
                  {step.step}
                </span>
                <span className="text-sm font-bold text-foreground truncate">{step.tool_name}</span>
              </div>

              {/* 설명 */}
              <p className="text-xs text-gray-500 line-clamp-2 mb-1.5 leading-relaxed">
                {step.action}
              </p>

              {/* 프롬프트 예시 */}
              {step.prompt_example && (
                <div className="rounded bg-white border border-border/50 px-2 py-1 mb-1.5">
                  <p className="text-xs text-gray-400 line-clamp-2 italic">
                    {step.prompt_example}
                  </p>
                </div>
              )}

              {/* 대안 도구 */}
              {step.alt_tools && step.alt_tools.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-xs text-gray-400">참고:</span>
                  {step.alt_tools.slice(0, 3).map((alt) => (
                    <span key={alt} className="text-xs bg-white text-gray-500 px-1 py-0.5 rounded border border-border/50">
                      {alt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 완성물 + CTA */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary shrink-0" />
            <span className="text-xs text-gray-500 line-clamp-1">
              <span className="font-semibold text-foreground">완성:</span> {recipe.result_description}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
            보기 <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
