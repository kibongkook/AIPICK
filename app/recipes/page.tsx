import { Suspense } from 'react';
import { BookOpen } from 'lucide-react';
import { ALL_RECIPES } from '@/data/recipes';
import { toRecipeV2 } from '@/lib/recipe-adapter';
import { getMinDifficulty } from '@/lib/recipe-adapter';
import RecipeCard from '@/components/recipe/RecipeCard';
import RecipeCategoryFilter from '@/components/recipe/RecipeCategoryFilter';
import { RECIPE_CATEGORIES } from '@/lib/constants';
import type { RecipeCategory } from '@/types';

export const metadata = {
  title: 'AI 레시피 — 여러 AI를 조합해서 결과물 만들기 | AIPICK',
  description: '음악, 영상, 이미지, 마케팅 등 — 원하는 결과물별로 어떤 AI를 어떻게 조합하면 되는지 단계별 가이드',
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function RecipesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category || 'all';

  const filtered = category === 'all'
    ? ALL_RECIPES
    : ALL_RECIPES.filter(r => r.category === category);

  // 난이도 순서: 최소 난이도 오름차순, 같으면 옵션 수 많은 것 우선
  const recipes = [...filtered].sort((a, b) => {
    const v2A = toRecipeV2(a);
    const v2B = toRecipeV2(b);
    const diffA = getMinDifficulty(v2A);
    const diffB = getMinDifficulty(v2B);
    if (diffA !== diffB) return diffA - diffB;
    // 멀티옵션 레시피를 위로
    return v2B.options.length - v2A.options.length;
  });

  const categoryLabel = category !== 'all' && category in RECIPE_CATEGORIES
    ? RECIPE_CATEGORIES[category as RecipeCategory].label
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-4">
        <div className="mb-1 flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">AI 레시피</h1>
        </div>
        <p className="text-sm text-gray-500">
          여러 AI를 조합해서 원하는 결과물을 만드는 단계별 가이드
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6">
        <Suspense fallback={<div className="h-8" />}>
          <RecipeCategoryFilter />
        </Suspense>
      </div>

      {/* 결과 카운트 */}
      <p className="text-xs text-gray-400 mb-4">
        {categoryLabel && <span className="font-medium text-foreground">{categoryLabel}</span>}
        {categoryLabel && ' — '}
        총 {recipes.length}개 레시피
      </p>

      {/* 레시피 그리드 */}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="text-sm text-gray-400">해당 카테고리의 레시피가 아직 없습니다</p>
        </div>
      )}
    </div>
  );
}
