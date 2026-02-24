import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { RECIPE_DIFFICULTY_V2 } from '@/lib/constants';
import DynamicIcon from '@/components/ui/DynamicIcon';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import type { AnyRecipe, RecipeOption, RecipeDifficultyV2 } from '@/types';
import { toRecipeV2 } from '@/lib/recipe-adapter';

interface RecipeCardProps {
  recipe: AnyRecipe;
}

/** 옵션 배열로부터 스토리텔링형 소개 문단 생성 */
function buildNarrative(options: RecipeOption[], resultDesc: string): string {
  if (options.length <= 1) return options[0]?.subtitle || '';

  const diffLabel = (d: RecipeDifficultyV2) => RECIPE_DIFFICULTY_V2[d].label;

  const parts = options.map((opt, idx) => {
    const diff = diffLabel(opt.difficulty);
    const isFirst = idx === 0;
    const isLast = idx === options.length - 1;

    if (isFirst) return `${opt.title}(${diff})`;
    if (isLast) return `${opt.title}(${diff})까지`;
    return `${opt.title}(${diff})`;
  });

  // "A부터 B, C, D까지 — N가지 방법을 안내합니다."
  const first = parts[0];
  const rest = parts.slice(1);

  return `${first}부터 ${rest.join(', ')} — ${options.length}가지 방법을 안내합니다.`;
}

export default function RecipeCard({ recipe: raw }: RecipeCardProps) {
  const recipe = toRecipeV2(raw);
  const isMultiOption = recipe.options.length > 1;
  const narrative = buildNarrative(recipe.options, recipe.result_description);

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group block rounded-xl border border-border bg-white overflow-hidden hover:border-primary hover:shadow-lg transition-all"
    >
      {/* 상단 그라데이션 바 */}
      <div className={`h-1.5 bg-gradient-to-r ${recipe.color}`} />

      <div className="p-5">
        {/* 아이콘 + 제목 + 난이도 */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${recipe.color} shadow-sm shrink-0`}>
            <DynamicIcon name={recipe.icon} className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
              {recipe.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {recipe.difficulty_range.min === recipe.difficulty_range.max ? (
                <DifficultyBadge difficulty={recipe.difficulty_range.min} />
              ) : (
                <span className="inline-flex items-center gap-0.5">
                  <DifficultyBadge difficulty={recipe.difficulty_range.min} />
                  <span className="text-gray-300 text-xs">~</span>
                  <DifficultyBadge difficulty={recipe.difficulty_range.max} />
                </span>
              )}
              {isMultiOption && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  {recipe.options.length}가지 방법
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 스토리텔링형 소개 문단 */}
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {narrative}
        </p>

        {/* 완성물 + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs text-gray-500 line-clamp-1">
              <span className="font-semibold text-foreground">완성:</span> {recipe.result_description}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3">
            자세히 보기 <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
