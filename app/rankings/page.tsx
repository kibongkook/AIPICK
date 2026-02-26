import Link from 'next/link';
import type { Metadata } from 'next';
import { Trophy, Star, Users, Zap, BarChart3 } from 'lucide-react';
import { SITE_NAME, SIDEBAR_CATEGORY_RANKINGS, BENCHMARK_EXPLANATIONS } from '@/lib/constants';
import { getRankings, getRankingsByBenchmark, getCategories } from '@/lib/supabase/queries';
import { cn, getAvatarColor, formatRating, formatVisitCount, getQualityLabel } from '@/lib/utils';
import { getToolShortDescription } from '@/lib/tool-descriptions';
import type { Tool, Category } from '@/types';
import TrendBadge from '@/components/ranking/TrendBadge';

export const metadata: Metadata = {
  title: `AI 서비스 랭킹 | ${SITE_NAME}`,
  description: '사용자 평점과 AI 성능 벤치마크 기반 AI 서비스 랭킹.',
};

interface Props {
  searchParams: Promise<{ category?: string; tab?: string }>;
}

export default async function RankingsPage({ searchParams }: Props) {
  const { category, tab } = await searchParams;
  const isPerformanceTab = tab === 'performance';

  const allCategories = await getCategories();
  const sidebarSlugs = SIDEBAR_CATEGORY_RANKINGS.map(r => r.slug) as readonly string[];
  const categories = allCategories.filter(cat => (sidebarSlugs as readonly string[]).includes(cat.slug));

  // 탭에 따라 다른 데이터 가져오기
  const ratingTools = isPerformanceTab ? null : await getRankings(category);
  const performanceTools = isPerformanceTab ? await getRankingsByBenchmark(category) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-4">
        <div className="mb-1 flex items-center gap-2">
          <Trophy className="h-7 w-7 text-yellow-500" />
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            AI 서비스 랭킹
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          사용자 평점과 AI 성능 벤치마크 기반 랭킹
        </p>
      </div>

      {/* 평점순 / 성능순 탭 */}
      <div className="mb-4 flex gap-2">
        <Link
          href={`/rankings${category ? `?category=${category}` : ''}`}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors',
            !isPerformanceTab
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <Star className="h-4 w-4" />
          평점순
        </Link>
        <Link
          href={`/rankings?tab=performance${category ? `&category=${category}` : ''}`}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors',
            isPerformanceTab
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <BarChart3 className="h-4 w-4" />
          성능순
        </Link>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={`/rankings${isPerformanceTab ? '?tab=performance' : ''}`}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            !category
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          전체
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/rankings?category=${cat.slug}${isPerformanceTab ? '&tab=performance' : ''}`}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              category === cat.slug
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* 랭킹 테이블 */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        {performanceTools ? (
          <PerformanceTable tools={performanceTools} categories={categories} />
        ) : (
          <RatingTable tools={ratingTools!} categories={categories} />
        )}
      </div>
    </div>
  );
}

/* ============================================
   평점순 테이블
   ============================================ */
function RatingTable({ tools, categories }: { tools: (Tool & { ranking: number })[]; categories: Category[] }) {
  return (
    <>
      <div className="grid grid-cols-12 gap-2 border-b border-border bg-gray-50/80 px-4 py-3 text-xs font-semibold text-gray-500 sm:px-6">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-7 sm:col-span-3 lg:col-span-3">서비스</div>
        <div className="col-span-2 hidden lg:block text-center">카테고리</div>
        <div className="col-span-3 hidden sm:block">설명</div>
        <div className="col-span-2 sm:col-span-1 text-center">평점</div>
        <div className="col-span-1 hidden sm:block text-center">리뷰</div>
        <div className="col-span-2 sm:col-span-1 text-center">변동</div>
      </div>

      {tools.map((tool) => {
        const primaryCategory = tool.categories?.find((c) => c.is_primary) || tool.categories?.[0];
        const cat = categories.find((c) => c.id === primaryCategory?.id);
        const hasRating = tool.rating_avg > 0;

        return (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="grid grid-cols-12 gap-2 items-center px-4 py-3.5 border-b border-border/50 hover:bg-primary-light/30 transition-colors sm:px-6"
          >
            <div className="col-span-1 text-center">
              <RankBadge rank={tool.ranking} />
            </div>

            <div className="col-span-7 sm:col-span-3 lg:col-span-3 flex items-center gap-3 min-w-0">
              {tool.logo_url ? (
                <img src={tool.logo_url} alt={tool.name} className="h-9 w-9 rounded-xl object-cover shrink-0 ring-1 ring-border" />
              ) : (
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl text-white text-xs font-bold shrink-0', getAvatarColor(tool.name))}>
                  {tool.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-sm font-bold text-foreground truncate block">{tool.name}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {formatVisitCount(tool.visit_count)}명
                </span>
              </div>
            </div>

            <div className="col-span-2 hidden lg:flex justify-center">
              <span className="text-xs text-gray-500 rounded-full bg-gray-50 px-2 py-0.5 truncate">{cat?.name || '-'}</span>
            </div>

            <div className="col-span-3 hidden sm:block min-w-0">
              <span className="text-xs text-gray-500 line-clamp-1">
                {getToolShortDescription(tool.slug, cat?.name)}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1">
              {hasRating ? (
                <>
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{formatRating(tool.rating_avg)}</span>
                </>
              ) : (
                <span className="text-xs text-gray-400">미평가</span>
              )}
            </div>

            <div className="col-span-1 hidden sm:block text-center">
              <span className="text-xs text-gray-500">
                {tool.review_count > 0 ? `${tool.review_count}개` : '-'}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 flex justify-center">
              <TrendBadge direction={tool.trend_direction || 'stable'} magnitude={tool.trend_magnitude || 0} size="sm" />
            </div>
          </Link>
        );
      })}

      {tools.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-400">
          해당 카테고리에 등록된 서비스가 없습니다.
        </div>
      )}
    </>
  );
}

/* ============================================
   성능순 테이블 (벤치마크 기준)
   ============================================ */
function PerformanceTable({ tools, categories }: { tools: (Tool & { ranking: number; elo_rating: number | null; overall_score: number | null; speed_tps: number | null })[]; categories: Category[] }) {
  const eloExp = BENCHMARK_EXPLANATIONS.elo_rating;

  return (
    <>
      <div className="grid grid-cols-12 gap-2 border-b border-border bg-gray-50/80 px-4 py-3 text-xs font-semibold text-gray-500 sm:px-6">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-7 sm:col-span-3 lg:col-span-3">서비스</div>
        <div className="col-span-2 hidden lg:block text-center">카테고리</div>
        <div className="col-span-2 text-center">Elo</div>
        <div className="col-span-2 hidden sm:block text-center">등급</div>
        <div className="col-span-2 hidden sm:block text-center">속도</div>
      </div>

      {tools.map((tool) => {
        const primaryCategory = tool.categories?.find((c) => c.is_primary) || tool.categories?.[0];
        const cat = categories.find((c) => c.id === primaryCategory?.id);
        const elo = tool.elo_rating;
        const quality = elo && eloExp
          ? getQualityLabel(elo, eloExp.goodThreshold, eloExp.greatThreshold, eloExp.higherIsBetter)
          : null;

        return (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="grid grid-cols-12 gap-2 items-center px-4 py-3.5 border-b border-border/50 hover:bg-primary-light/30 transition-colors sm:px-6"
          >
            <div className="col-span-1 text-center">
              <RankBadge rank={tool.ranking} />
            </div>

            <div className="col-span-7 sm:col-span-3 lg:col-span-3 flex items-center gap-3 min-w-0">
              {tool.logo_url ? (
                <img src={tool.logo_url} alt={tool.name} className="h-9 w-9 rounded-xl object-cover shrink-0 ring-1 ring-border" />
              ) : (
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl text-white text-xs font-bold shrink-0', getAvatarColor(tool.name))}>
                  {tool.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-sm font-bold text-foreground truncate block">{tool.name}</span>
                <span className="text-xs text-gray-400">
                  {tool.overall_score ? `종합 ${tool.overall_score.toFixed(1)}점` : ''}
                </span>
              </div>
            </div>

            <div className="col-span-2 hidden lg:flex justify-center">
              <span className="text-xs text-gray-500 rounded-full bg-gray-50 px-2 py-0.5 truncate">{cat?.name || '-'}</span>
            </div>

            <div className="col-span-2 text-center">
              {elo ? (
                <span className="text-sm font-bold text-foreground">{elo}</span>
              ) : (
                <span className="text-xs text-gray-400">-</span>
              )}
            </div>

            <div className="col-span-2 hidden sm:flex justify-center">
              {quality ? (
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', quality.color, quality.label === '최상위' ? 'bg-emerald-50' : quality.label === '우수' ? 'bg-blue-50' : 'bg-gray-50')}>
                  {quality.label}
                </span>
              ) : (
                <span className="text-xs text-gray-400">-</span>
              )}
            </div>

            <div className="col-span-2 hidden sm:block text-center">
              {tool.speed_tps ? (
                <span className="text-xs text-gray-600 flex items-center justify-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" />
                  {tool.speed_tps} tok/s
                </span>
              ) : (
                <span className="text-xs text-gray-400">-</span>
              )}
            </div>
          </Link>
        );
      })}

      {tools.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-400">
          해당 카테고리에 벤치마크 데이터가 있는 서비스가 없습니다.
        </div>
      )}
    </>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-white shadow-sm shadow-yellow-200">1</span>;
  if (rank === 2) return <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-white">2</span>;
  if (rank === 3) return <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">3</span>;
  return <span className="text-sm font-medium text-gray-500">{rank}</span>;
}
