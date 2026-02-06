import type { Metadata } from 'next';
import { Newspaper } from 'lucide-react';
import { SITE_NAME, NEWS_CATEGORIES } from '@/lib/constants';
import { getNews, getHotNews } from '@/lib/supabase/queries';
import type { NewsCategory } from '@/types';
import NewsCard from '@/components/news/NewsCard';
import NewsletterForm from '@/components/newsletter/NewsletterForm';

export const metadata: Metadata = {
  title: `AI 뉴스 | ${SITE_NAME}`,
  description: '최신 AI 서비스 업데이트, 신규 출시, 업계 동향을 한눈에 확인하세요.',
};

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function NewsPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const validCategory = category && category in NEWS_CATEGORIES ? category as NewsCategory : undefined;
  const news = await getNews(undefined, validCategory);
  const hotNews = await getHotNews(5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-foreground sm:text-3xl">
          <Newspaper className="h-7 w-7 text-primary" />
          AI 뉴스
        </h1>
        <p className="mt-2 text-sm text-gray-500">최신 AI 서비스 소식을 빠르게 확인하세요.</p>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        <a
          href="/news"
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            !validCategory ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전체
        </a>
        {Object.entries(NEWS_CATEGORIES).map(([key, config]) => (
          <a
            key={key}
            href={`/news?category=${key}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              validCategory === key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {config.label}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* 뉴스 리스트 */}
        <div className="lg:col-span-2">
          {news.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-white p-12 text-center">
              <Newspaper className="mx-auto h-12 w-12 text-gray-200" />
              <p className="mt-4 text-sm text-gray-400">해당 카테고리의 뉴스가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 사이드바: 주간 핫 뉴스 + 뉴스레터 */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-5 sticky top-24">
            <h2 className="text-sm font-bold text-foreground mb-4">주간 핫 뉴스 TOP 5</h2>
            <div className="divide-y divide-border/50">
              {hotNews.map((item, index) => (
                <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <NewsCard news={item} compact />
                </div>
              ))}
            </div>
          </div>
          <NewsletterForm />
        </aside>
      </div>
    </div>
  );
}
