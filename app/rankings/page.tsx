import Link from 'next/link';
import type { Metadata } from 'next';
import { Trophy, Star, Users } from 'lucide-react';
import { SITE_NAME, SIDEBAR_CATEGORY_RANKINGS } from '@/lib/constants';
import { getRankings, getCategories } from '@/lib/supabase/queries';
import { cn, getAvatarColor, formatRating, formatVisitCount } from '@/lib/utils';
import { getToolShortDescription } from '@/lib/tool-descriptions';
import type { Tool } from '@/types';
import TrendBadge from '@/components/ranking/TrendBadge';
import ConfidenceBadge from '@/components/ranking/ConfidenceBadge';

export const metadata: Metadata = {
  title: `AI 서비스 랭킹 | ${SITE_NAME}`,
  description: '외부 데이터 기반 객관적 AI 서비스 하이브리드 랭킹 TOP 100.',
};

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function RankingsPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const rankedTools = await getRankings(category);
  const allCategories = await getCategories();

  // 메인 페이지와 동일한 12개 카테고리만 표시 (SIDEBAR_CATEGORY_RANKINGS 기준)
  const sidebarSlugs = SIDEBAR_CATEGORY_RANKINGS.map(r => r.slug) as readonly string[];
  const categories = allCategories.filter(cat => (sidebarSlugs as readonly string[]).includes(cat.slug));

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
          외부 데이터 기반 객관적 하이브리드 점수 (사용자 리뷰 + 인기도 + 커뮤니티 + 벤치마크)
        </p>
      </div>

      {/* 카테고리 탭 필터 */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/rankings"
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
            href={`/rankings?category=${cat.slug}`}
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
        {/* 테이블 헤더 */}
        <div className="grid grid-cols-12 gap-2 border-b border-border bg-gray-50/80 px-4 py-3 text-xs font-semibold text-gray-500 sm:px-6">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-7 sm:col-span-3 lg:col-span-2">서비스</div>
          <div className="col-span-2 hidden lg:block text-center">카테고리</div>
          <div className="col-span-3 hidden sm:block">설명</div>
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 text-center">평점</div>
          <div className="col-span-2 hidden sm:block text-center">점수</div>
          <div className="col-span-2 sm:col-span-1 text-center">변동</div>
        </div>

        {/* 랭킹 행 */}
        {rankedTools.map((tool) => {
          const primaryCategory = tool.categories?.find(c => c.is_primary) || tool.categories?.[0];
          const cat = categories.find((c) => c.id === primaryCategory?.id);
          const trendDir = tool.trend_direction || 'stable';
          const trendMag = tool.trend_magnitude || 0;
          const hasRating = tool.rating_avg > 0;
          const hasScore = (tool.hybrid_score || tool.ranking_score) > 0;

          return (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="grid grid-cols-12 gap-2 items-center px-4 py-3.5 border-b border-border/50 hover:bg-primary-light/30 transition-colors sm:px-6"
            >
              {/* 순위 */}
              <div className="col-span-1 text-center">
                <RankBadge rank={tool.ranking} />
              </div>

              {/* 서비스명 */}
              <div className="col-span-7 sm:col-span-3 lg:col-span-2 flex items-center gap-3 min-w-0">
                {tool.logo_url ? (
                  <img src={tool.logo_url} alt={tool.name} className="h-9 w-9 rounded-xl object-cover shrink-0 ring-1 ring-border" />
                ) : (
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl text-white text-xs font-bold shrink-0', getAvatarColor(tool.name))}>
                    {tool.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-foreground truncate">{tool.name}</span>
                    {tool.confidence_level && tool.confidence_level !== 'none' && (
                      <ConfidenceBadge
                        level={tool.confidence_level}
                        sourceCount={tool.confidence_source_count}
                        size="sm"
                      />
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {formatVisitCount(tool.visit_count)}명
                  </span>
                </div>
              </div>

              {/* 카테고리 */}
              <div className="col-span-2 hidden lg:flex justify-center">
                <span className="text-xs text-gray-500 rounded-full bg-gray-50 px-2 py-0.5 truncate">{cat?.name || '-'}</span>
              </div>

              {/* 설명 */}
              <div className="col-span-3 hidden sm:block min-w-0">
                <span className="text-xs text-gray-500 line-clamp-1">
                  {getToolShortDescription(tool.slug, cat?.name)}
                </span>
              </div>

              {/* 평점 */}
              <div className="col-span-2 lg:col-span-1 flex items-center justify-center gap-1">
                {hasRating ? (
                  <>
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{formatRating(tool.rating_avg)}</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">미평가</span>
                )}
              </div>

              {/* 종합 점수 */}
              <div className="col-span-2 hidden sm:block text-center">
                {hasScore ? (
                  <span className="text-sm font-bold text-primary">
                    {(tool.hybrid_score || tool.ranking_score).toFixed(1)}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </div>

              {/* 변동 */}
              <div className="col-span-2 sm:col-span-1 flex justify-center">
                <TrendBadge direction={trendDir} magnitude={trendMag} size="sm" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-white shadow-sm shadow-yellow-200">1</span>;
  if (rank === 2) return <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-white">2</span>;
  if (rank === 3) return <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">3</span>;
  return <span className="text-sm font-medium text-gray-500">{rank}</span>;
}
