import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';
import { searchTools } from '@/lib/supabase/queries';
import type { Tool } from '@/types';
import ServiceCard from '@/components/service/ServiceCard';
import SearchBar from '@/components/search/SearchBar';
import FilterSidebar from '@/components/search/FilterSidebar';
import SortSelector from '@/components/search/SortSelector';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : '';
  return {
    title: q ? `"${q}" 검색 결과 | ${SITE_NAME}` : `검색 | ${SITE_NAME}`,
    description: `AI 서비스를 검색하세요. 가격, 카테고리, 직군, 학년별로 필터링 가능.`,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const pricing = Array.isArray(params.pricing) ? params.pricing : params.pricing ? [params.pricing] : undefined;
  const category = Array.isArray(params.category) ? params.category : params.category ? [params.category] : undefined;
  const supports_korean = params.korean === 'true' || undefined;
  const min_rating = params.min_rating ? Number(params.min_rating) : undefined;
  const job = typeof params.job === 'string' ? params.job : undefined;
  const edu = typeof params.edu === 'string' ? params.edu : undefined;
  const sort = (typeof params.sort === 'string' ? params.sort : 'popular') as 'popular' | 'rating' | 'latest' | 'free_first';

  const results = await searchTools({
    query: query || undefined,
    pricing,
    category,
    supports_korean,
    min_rating,
    job,
    edu,
    sort,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 검색바 */}
      <div className="mb-8">
        <SearchBar
          defaultValue={query}
          autoFocus={!query}
          placeholder="AI 서비스명, 기능, 태그로 검색..."
          className="max-w-2xl mx-auto"
        />
      </div>

      <div className="flex gap-8">
        {/* 필터 사이드바 */}
        <div className="hidden w-56 shrink-0 lg:block">
          <Suspense fallback={null}>
            <FilterSidebar />
          </Suspense>
        </div>

        {/* 검색 결과 */}
        <div className="flex-1 min-w-0">
          {/* 결과 요약 + 정렬 */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {query ? (
                <>
                  <span className="font-medium text-foreground">&quot;{query}&quot;</span> 검색 결과{' '}
                  <span className="font-medium text-primary">{results.length}</span>개
                </>
              ) : (
                <>
                  전체 AI 서비스{' '}
                  <span className="font-medium text-primary">{results.length}</span>개
                </>
              )}
            </p>
            <Suspense fallback={null}>
              <SortSelector />
            </Suspense>
          </div>

          {/* 결과 그리드 */}
          {results.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((tool) => (
                <SearchResultCard key={tool.id} tool={tool} query={query} />
              ))}
            </div>
          ) : (
            <EmptyResults query={query} />
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({ tool, query }: { tool: Tool; query: string }) {
  return <ServiceCard tool={tool} />;
}

async function EmptyResults({ query }: { query: string }) {
  const suggestions = (await searchTools({ sort: 'popular' })).slice(0, 4);

  return (
    <div className="text-center py-16">
      <p className="text-lg font-bold text-foreground">
        {query ? `"${query}"에 대한 검색 결과가 없습니다` : '검색어를 입력해주세요'}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        다른 검색어로 시도하거나 필터를 조정해보세요.
      </p>
      {suggestions.length > 0 && (
        <div className="mt-10">
          <p className="mb-4 text-sm font-semibold text-gray-400">이런 서비스는 어때요?</p>
          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
            {suggestions.map((tool) => (
              <ServiceCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
