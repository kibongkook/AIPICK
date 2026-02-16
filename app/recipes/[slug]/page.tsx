import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Wrench, Target, BookOpen } from 'lucide-react';
import { AI_RECIPES, getRecipeBySlug } from '@/data/recipes';
import { RECIPE_CATEGORIES, RECIPE_DIFFICULTY } from '@/lib/constants';
import DynamicIcon from '@/components/ui/DynamicIcon';
import RecipeStepCard from '@/components/recipe/RecipeStepCard';
import RelatedRecipeCarousel from '@/components/recipe/RelatedRecipeCarousel';
import RecipeCommunitySection from '@/components/recipe/RecipeCommunitySection';
import type { RecipeCategory } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return AI_RECIPES.map((recipe) => ({
    slug: recipe.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) return {};

  return {
    title: `${recipe.title} — AI 레시피 | AIPICK`,
    description: recipe.subtitle,
  };
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  const categoryConfig = RECIPE_CATEGORIES[recipe.category as RecipeCategory];
  const difficulty = RECIPE_DIFFICULTY[recipe.difficulty];

  // 같은 카테고리의 다른 레시피 추천
  const relatedRecipes = AI_RECIPES
    .filter(r => r.category === recipe.category && r.slug !== recipe.slug);

  // 사용되는 모든 도구 slug (중복 제거)
  const allToolSlugs = [...new Set(recipe.steps.map(s => s.tool_slug))];

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
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${recipe.color} px-2.5 py-1 text-xs font-bold text-white`}>
            <DynamicIcon name={categoryConfig.icon} className="h-3 w-3" />
            {categoryConfig.label}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${difficulty.color}`}>
            {difficulty.label}
          </span>
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
            AI {recipe.tool_count}개 사용
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {recipe.estimated_time}
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
          {recipe.steps.map((step) => (
            <Link
              key={step.step}
              href={`/tools/${step.tool_slug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-all"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                {step.step}
              </span>
              {step.tool_name}
            </Link>
          ))}
        </div>
      </div>

      {/* 단계별 가이드 */}
      <div className="mb-12">
        <h2 className="text-lg font-extrabold text-foreground mb-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          단계별 가이드
        </h2>
        <div>
          {recipe.steps.map((step, i) => (
            <RecipeStepCard
              key={step.step}
              step={step}
              isLast={i === recipe.steps.length - 1}
            />
          ))}
        </div>
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
        <RecipeCommunitySection recipe={recipe} />
      </div>

      {/* 관련 레시피 */}
      {relatedRecipes.length > 0 && (
        <RelatedRecipeCarousel recipes={relatedRecipes} categorySlug={recipe.category} />
      )}
    </div>
  );
}
