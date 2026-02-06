import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { SITE_NAME, RECOMMENDATION_LEVELS } from '@/lib/constants';
import { getJobCategoryBySlug, getJobRecommendations, getJobCategories } from '@/lib/supabase/queries';
import type { RecommendationLevel } from '@/types';
import DynamicIcon from '@/components/ui/DynamicIcon';
import Badge from '@/components/ui/Badge';
import ServiceCard from '@/components/service/ServiceCard';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobCategoryBySlug(slug);
  if (!job) return { title: '직군을 찾을 수 없습니다' };
  return {
    title: `${job.name}을 위한 AI 추천 | ${SITE_NAME}`,
    description: `${job.name}에게 꼭 필요한 AI 도구를 확인하세요. 필수/추천/선택 등급별 AI 서비스 큐레이션.`,
  };
}

export function generateStaticParams() {
  const jobs = getJobCategories();
  return jobs.map((job) => ({ slug: job.slug }));
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = getJobCategoryBySlug(slug);
  if (!job) notFound();

  const recommendations = getJobRecommendations(slug);
  const grouped: Record<RecommendationLevel, typeof recommendations> = {
    essential: recommendations.filter((r) => r.recommendation_level === 'essential'),
    recommended: recommendations.filter((r) => r.recommendation_level === 'recommended'),
    optional: recommendations.filter((r) => r.recommendation_level === 'optional'),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 뒤로가기 */}
      <Link
        href="/jobs"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        직군 목록
      </Link>

      {/* 직군 헤더 */}
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <DynamicIcon name={job.icon || 'Briefcase'} className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {job.name}을 위한 AI
          </h1>
          <p className="mt-1 text-gray-500">{job.description}</p>
        </div>
      </div>

      {/* 등급별 추천 */}
      {(['essential', 'recommended', 'optional'] as const).map((level) => {
        const items = grouped[level];
        if (items.length === 0) return null;
        const config = RECOMMENDATION_LEVELS[level];

        return (
          <section key={level} className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <Badge className={config.color}>{config.label}</Badge>
              <h2 className="text-lg font-bold text-foreground">
                {level === 'essential' ? '필수 AI 툴킷' : level === 'recommended' ? '추천 AI' : '선택 AI'}
              </h2>
              <span className="text-sm text-gray-400">({items.length}개)</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((rec) => (
                <div key={rec.id}>
                  {rec.tool && <ServiceCard tool={rec.tool} />}
                  {rec.reason && (
                    <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                      💡 {rec.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {recommendations.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">아직 추천 데이터가 없습니다.</p>
          <p className="mt-1 text-sm">곧 업데이트될 예정입니다.</p>
        </div>
      )}
    </div>
  );
}
