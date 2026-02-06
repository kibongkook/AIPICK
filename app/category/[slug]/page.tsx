import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Trophy } from 'lucide-react';
import { SITE_NAME, PRICING_CONFIG } from '@/lib/constants';
import { getCategoryBySlug, getToolsByCategory, getCategories, getRankings } from '@/lib/supabase/queries';
import { cn, getAvatarColor, formatRating } from '@/lib/utils';
import DynamicIcon from '@/components/ui/DynamicIcon';
import Badge from '@/components/ui/Badge';
import ServiceCard from '@/components/service/ServiceCard';
import ServiceGrid from '@/components/service/ServiceGrid';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: '카테고리를 찾을 수 없습니다' };
  return {
    title: `${category.name} AI 서비스 | ${SITE_NAME}`,
    description: `${category.name} 분야 최고의 AI 서비스를 비교하세요. 무료 사용량과 평점 정보 제공.`,
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const tools = await getToolsByCategory(category.id);
  const topRanked = (await getRankings(slug)).slice(0, 3);
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 카테고리 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <DynamicIcon name={category.icon || 'Sparkles'} className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{category.name}</h1>
            {category.description && (
              <p className="mt-1 text-gray-500">{category.description}</p>
            )}
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                cat.slug === slug
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 카테고리별 TOP 3 */}
      {topRanked.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-bold text-foreground">{category.name} TOP 3</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {topRanked.map((tool, index) => (
              <div key={tool.id} className="relative">
                <div className={cn(
                  'absolute -top-2 -left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white',
                  index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-amber-600'
                )}>
                  {index + 1}
                </div>
                <ServiceCard tool={tool} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 전체 서비스 그리드 */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">
          전체 {category.name} 서비스 ({tools.length}개)
        </h2>
        {tools.length > 0 ? (
          <ServiceGrid tools={tools} columns={3} />
        ) : (
          <div className="py-16 text-center text-gray-400">
            <p>아직 등록된 서비스가 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}
