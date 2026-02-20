import Link from 'next/link';
import type { Metadata } from 'next';
import { Target } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { getTools } from '@/lib/supabase/queries';
import OutputGallery from '@/components/discover/OutputGallery';
import type { GalleryItem } from '@/components/discover/GalleryCard';

export const metadata: Metadata = {
  title: `AI 찾기 | ${SITE_NAME}`,
  description: 'AI로 이런 게 가능해요. 결과물을 보고 마음에 드는 AI를 찾아보세요.',
};

export default async function DiscoverPage() {
  const tools = await getTools();

  // sample_output이 있는 도구만 GalleryItem 형태로 변환
  const galleryItems: GalleryItem[] = tools
    .filter((t) => t.sample_output && t.sample_output.length > 30)
    .map((t) => {
      const primaryCat =
        t.categories?.find((c) => c.is_primary) ?? t.categories?.[0];

      return {
        slug: t.slug,
        name: t.name,
        logoUrl: t.logo_url,
        pricingType: t.pricing_type,
        freeQuotaDetail: t.free_quota_detail,
        categorySlug: primaryCat?.slug ?? '',
        categoryName: primaryCat?.name?.split(' · ')[0] ?? '',
        cases: [{ prompt: t.sample_output_prompt, output: t.sample_output! }],
        ratingAvg: t.rating_avg,
      };
    });

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-1 flex items-center gap-2">
            <Target className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              AI로 이런 게 가능해요
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            결과물을 보고 마음에 드는 AI를 찾아보세요
          </p>
        </div>
      </div>

      {/* 결과물 갤러리 */}
      <OutputGallery items={galleryItems} />

      {/* 하단 보조 탐색 */}
      <div className="mt-8 border-t border-gray-100 px-4 py-10">
        <p className="mb-4 text-center text-sm text-gray-400">
          더 구체적으로 찾고 싶다면
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/jobs"
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary"
          >
            💼 직군별 추천
          </Link>
          <Link
            href="/education"
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary"
          >
            🎓 학년별 추천
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary"
          >
            🔍 필터 검색
          </Link>
          <Link
            href="/rankings"
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary"
          >
            🏆 랭킹 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
