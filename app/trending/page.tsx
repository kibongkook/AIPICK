import Link from 'next/link';
import type { Metadata } from 'next';
import { TrendingUp, ArrowUp, ArrowRight, Star, Sparkles } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { getTrending, getLatestTools } from '@/lib/supabase/queries';
import { cn, formatVisitCount, getAvatarColor, formatRating } from '@/lib/utils';
import ServiceCard from '@/components/service/ServiceCard';

export const metadata: Metadata = {
  title: `주간 트렌딩 | ${SITE_NAME}`,
  description: '이번 주 가장 주목받는 AI 서비스를 확인하세요. 주간 방문 급상승 TOP 10.',
};

export default async function TrendingPage() {
  const trendingTools = await getTrending(10);
  const latestTools = await getLatestTools(4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-emerald-500" />
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            주간 트렌딩
          </h1>
        </div>
        <p className="mt-2 text-gray-500">
          이번 주 가장 주목받는 AI 서비스를 확인하세요
        </p>
      </div>

      {/* 이번 주 급상승 TOP 10 */}
      <section className="mb-16">
        <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">
          이번 주 급상승 TOP 10
        </h2>

        <div className="rounded-xl border border-border bg-white divide-y divide-border/50">
          {trendingTools.map((tool, index) => {
            const rank = index + 1;

            return (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-blue-50/50 transition-colors"
              >
                {/* 순위 배지 */}
                <RankBadge rank={rank} />

                {/* 로고 */}
                {tool.logo_url ? (
                  <img
                    src={tool.logo_url}
                    alt={tool.name}
                    className="h-10 w-10 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg text-white text-sm font-bold shrink-0',
                      getAvatarColor(tool.name)
                    )}
                  >
                    {tool.name.charAt(0)}
                  </div>
                )}

                {/* 서비스명 + 설명 */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground block truncate">
                    {tool.name}
                  </span>
                  <span className="text-xs text-gray-400 block truncate">
                    {tool.description.length > 50
                      ? `${tool.description.slice(0, 50)}...`
                      : tool.description}
                  </span>
                </div>

                {/* 주간 방문 증가량 */}
                <div className="flex items-center gap-1 shrink-0">
                  <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">
                    +{formatVisitCount(tool.weekly_visit_delta)} visits
                  </span>
                </div>

                {/* 평점 */}
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium text-gray-700">
                    {formatRating(tool.rating_avg)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 신규 등록 서비스 */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              신규 등록 서비스
            </h2>
          </div>
          <Link
            href="/search"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            전체 서비스 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {latestTools.map((tool) => (
            <ServiceCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const bgColor =
      rank === 1
        ? 'bg-yellow-400'
        : rank === 2
          ? 'bg-gray-300'
          : 'bg-amber-600';

    return (
      <span
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shrink-0',
          bgColor
        )}
      >
        {rank}
      </span>
    );
  }

  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600 shrink-0">
      {rank}
    </span>
  );
}
