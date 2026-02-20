import type { Metadata } from 'next';
import { Newspaper } from 'lucide-react';
import { SITE_NAME, NEWS_CATEGORIES } from '@/lib/constants';
import { getNews, getHotNews } from '@/lib/supabase/queries';
import type { NewsCategory } from '@/types';
import NewsCard from '@/components/news/NewsCard';

export const metadata: Metadata = {
  title: `AI 뉴스 | ${SITE_NAME}`,
  description: '최신 AI 서비스 업데이트, 신규 출시, 업계 동향을 한눈에 확인하세요.',
};

interface Props {
  searchParams: Promise<{ category?: string }>;
}

const WEEKLY_BEST_KEY = 'weekly-best';

const NEWS_FILTER_TABS: { key: string | null; label: string }[] = [
  { key: null, label: '전체' },
  { key: WEEKLY_BEST_KEY, label: '주간 베스트' },
  { key: 'update', label: '업데이트' },
  { key: 'launch', label: '신규 출시' },
  { key: 'industry', label: '업계 동향' },
  { key: 'pricing', label: '가격 변경' },
];

export default async function NewsPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const isWeeklyBest = category === WEEKLY_BEST_KEY;
  const validCategory = !isWeeklyBest && category && category in NEWS_CATEGORIES
    ? category as NewsCategory
    : undefined;

  const news = isWeeklyBest ? await getHotNews(20) : await getNews(undefined, validCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <Newspaper className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">AI 뉴스</h1>
        </div>
        <p className="text-sm text-gray-500">최신 AI 서비스 소식을 빠르게 확인하세요.</p>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {NEWS_FILTER_TABS.map(({ key, label }) => {
          const isActive = key === null
            ? !validCategory && !isWeeklyBest
            : key === WEEKLY_BEST_KEY
              ? isWeeklyBest
              : validCategory === key;
          return (
            <a
              key={key ?? 'all'}
              href={key ? `/news?category=${key}` : '/news'}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </a>
          );
        })}
      </div>

      {/* 뉴스 리스트 (가로형 1열) */}
      {news.length > 0 ? (
        <div className="flex flex-col gap-4">
          {news.map((item) => (
            <NewsCard key={item.id} news={item} isWeeklyBest={isWeeklyBest} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <Newspaper className="mx-auto h-12 w-12 text-gray-200" />
          <p className="mt-4 text-sm text-gray-400">해당 카테고리의 뉴스가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
