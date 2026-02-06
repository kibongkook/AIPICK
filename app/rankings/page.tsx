import Link from 'next/link';
import type { Metadata } from 'next';
import { Trophy, Star, TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { SITE_NAME, CATEGORIES } from '@/lib/constants';
import { getRankings, getCategories } from '@/lib/supabase/queries';
import { cn, getAvatarColor, formatRating, formatVisitCount } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import type { Tool } from '@/types';

export const metadata: Metadata = {
  title: `AI 서비스 랭킹 | ${SITE_NAME}`,
  description: '인기 AI 서비스 종합 랭킹. 방문수, 평점, 리뷰를 기반으로 한 TOP 100.',
};

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function RankingsPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const rankedTools = getRankings(category);
  const categories = getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="h-7 w-7 text-yellow-500" />
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            AI 서비스 랭킹
          </h1>
        </div>
        <p className="mt-2 text-gray-500">
          방문수, 평점, 리뷰를 기반으로 한 종합 랭킹
        </p>
      </div>

      {/* 카테고리 탭 필터 */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
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
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="grid grid-cols-12 gap-2 border-b border-border bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-500 sm:px-6">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5 sm:col-span-4">서비스</div>
          <div className="col-span-2 hidden sm:block text-center">카테고리</div>
          <div className="col-span-2 text-center">평점</div>
          <div className="col-span-2 text-center hidden sm:block">방문수</div>
          <div className="col-span-2 sm:col-span-1 text-center">변동</div>
        </div>

        {/* 랭킹 행 */}
        {rankedTools.map((tool) => {
          const cat = categories.find((c) => c.id === tool.category_id);
          const pricingVariant = tool.pricing_type === 'Free' ? 'free' : tool.pricing_type === 'Freemium' ? 'freemium' : 'paid';
          const delta = tool.prev_ranking ? tool.prev_ranking - tool.ranking : 0;

          return (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="grid grid-cols-12 gap-2 items-center px-4 py-3.5 border-b border-border/50 hover:bg-blue-50/50 transition-colors sm:px-6"
            >
              {/* 순위 */}
              <div className="col-span-1 text-center">
                <RankBadge rank={tool.ranking} />
              </div>

              {/* 서비스명 */}
              <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0">
                {tool.logo_url ? (
                  <img src={tool.logo_url} alt={tool.name} className="h-8 w-8 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold shrink-0', getAvatarColor(tool.name))}>
                    {tool.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate block">{tool.name}</span>
                  <span className="text-xs text-gray-400 truncate block">{tool.description.slice(0, 30)}...</span>
                </div>
              </div>

              {/* 카테고리 */}
              <div className="col-span-2 hidden sm:flex justify-center">
                <span className="text-xs text-gray-500">{cat?.name || '-'}</span>
              </div>

              {/* 평점 */}
              <div className="col-span-2 flex items-center justify-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{formatRating(tool.rating_avg)}</span>
              </div>

              {/* 방문수 */}
              <div className="col-span-2 hidden sm:block text-center text-sm text-gray-600">
                {formatVisitCount(tool.visit_count)}
              </div>

              {/* 변동 */}
              <div className="col-span-2 sm:col-span-1 flex justify-center">
                <RankDelta delta={delta} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-white">1</span>;
  if (rank === 2) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-xs font-bold text-white">2</span>;
  if (rank === 3) return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">3</span>;
  return <span className="text-sm font-medium text-gray-500">{rank}</span>;
}

function RankDelta({ delta }: { delta: number }) {
  if (delta > 0) return <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600"><ArrowUp className="h-3 w-3" />{delta}</span>;
  if (delta < 0) return <span className="flex items-center gap-0.5 text-xs font-medium text-red-500"><ArrowDown className="h-3 w-3" />{Math.abs(delta)}</span>;
  return <Minus className="h-3 w-3 text-gray-400" />;
}
