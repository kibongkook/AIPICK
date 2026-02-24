import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Wrench, Target } from 'lucide-react';
import { ALL_RECIPES, getRecipeBySlug } from '@/data/recipes';
import { RECIPE_CATEGORIES, RECIPE_DIFFICULTY_V2 } from '@/lib/constants';
import { toRecipeV2 } from '@/lib/recipe-adapter';
import DynamicIcon from '@/components/ui/DynamicIcon';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import RecipeOptionSelector from '@/components/recipe/RecipeOptionSelector';
import RelatedRecipeCarousel from '@/components/recipe/RelatedRecipeCarousel';
import RecipeCommunitySection from '@/components/recipe/RecipeCommunitySection';
import type { RecipeCategory } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_RECIPES.map((recipe) => ({
    slug: recipe.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const raw = getRecipeBySlug(slug);
  if (!raw) return {};

  const recipe = toRecipeV2(raw);
  const optionCount = recipe.options.length;
  const suffix = optionCount > 1 ? ` (${optionCount}가지 방법)` : '';

  return {
    title: `${recipe.title}${suffix} — AI 레시피 | AIPICK`,
    description: recipe.subtitle,
  };
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const raw = getRecipeBySlug(slug);

  if (!raw) {
    notFound();
  }

  const recipe = toRecipeV2(raw);
  const categoryConfig = RECIPE_CATEGORIES[recipe.category as RecipeCategory];
  const minDiff = RECIPE_DIFFICULTY_V2[recipe.difficulty_range.min];
  const maxDiff = RECIPE_DIFFICULTY_V2[recipe.difficulty_range.max];
  const isSingleDifficulty = recipe.difficulty_range.min === recipe.difficulty_range.max;

  // 같은 카테고리의 다른 레시피 추천
  const relatedRecipes = ALL_RECIPES
    .filter(r => r.category === recipe.category && r.slug !== recipe.slug);

  // 모든 옵션에서 사용되는 도구 slug (중복 제거)
  const allToolSlugs = [...new Set(
    recipe.options.flatMap(opt => opt.steps.map(s => s.tool_slug))
  )];

  // 모든 옵션에서 사용되는 도구 이름 (중복 제거)
  const allTools = recipe.options
    .flatMap(opt => opt.steps.map(s => ({ slug: s.tool_slug, name: s.tool_name })))
    .filter((t, i, arr) => arr.findIndex(x => x.slug === t.slug) === i);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 뒤로가기 */}
      <Link
        href="/recipes"
        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-3 w-3" />
        AI 레시피 목록
      </Link>

      {/* 헤더 */}
      <div className="mb-8">
        {/* 카테고리 + 난이도 */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${recipe.color} px-2.5 py-1 text-xs font-bold text-white`}>
            <DynamicIcon name={categoryConfig.icon} className="h-3 w-3" />
            {categoryConfig.label}
          </span>
          {isSingleDifficulty ? (
            <DifficultyBadge difficulty={recipe.difficulty_range.min} showStars />
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <DifficultyBadge difficulty={recipe.difficulty_range.min} />
              <span>→</span>
              <DifficultyBadge difficulty={recipe.difficulty_range.max} />
            </span>
          )}
          {recipe.options.length > 1 && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {recipe.options.length}가지 방법
            </span>
          )}
        </div>

        {/* 타이틀 */}
        <h1 className="text-2xl font-extrabold text-foreground mb-2">
          {recipe.title}
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          {recipe.subtitle}
        </p>

        {/* 메타 정보 */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Wrench className="h-3.5 w-3.5" />
            AI {allTools.length}개 사용
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {recipe.options.length > 1
              ? `${recipe.options[0].estimated_time} ~ ${recipe.options[recipe.options.length - 1].estimated_time}`
              : recipe.options[0].estimated_time
            }
          </span>
          <span className="flex items-center gap-1">
            <Target className="h-3.5 w-3.5" />
            {recipe.result_description}
          </span>
        </div>
      </div>

      {/* 사용 도구 요약 */}
      <div className="rounded-xl border border-border bg-gray-50 p-4 mb-8">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">이 레시피에 사용되는 AI</h2>
        <div className="flex flex-wrap gap-2">
          {allTools.map((tool, idx) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-all"
            >
              {tool.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 멀티옵션 단계별 가이드 */}
      <div className="mb-12">
        <RecipeOptionSelector options={recipe.options} color={recipe.color} />
      </div>

      {/* 완성 결과 */}
      <div className="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 p-5 mb-12">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          완성 결과물
        </h3>
        <p className="text-sm text-gray-600">{recipe.result_description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <span key={tag} className="text-xs bg-white/80 text-gray-500 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* 커뮤니티 */}
      <div className="mb-12">
        <RecipeCommunitySection recipe={raw} />
      </div>

      {/* 관련 레시피 */}
      {relatedRecipes.length > 0 && (
        <RelatedRecipeCarousel recipes={relatedRecipes} categorySlug={recipe.category} />
      )}
    </div>
  );
}
