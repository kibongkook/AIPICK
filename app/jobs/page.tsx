import Link from 'next/link';
import type { Metadata } from 'next';
import { Briefcase, ArrowRight } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { getJobCategories, getJobRecommendations } from '@/lib/supabase/queries';
import DynamicIcon from '@/components/ui/DynamicIcon';

export const metadata: Metadata = {
  title: `직군별 AI 추천 | ${SITE_NAME}`,
  description: '당신의 직업에 맞는 AI 도구를 찾아보세요. 개발자, 디자이너, 마케터 등 10개 직군별 맞춤 추천.',
};

export default function JobsPage() {
  const jobCategories = getJobCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Briefcase className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          당신의 직업을 선택하세요
        </h1>
        <p className="mt-2 text-gray-500">
          직군별로 꼭 필요한 AI 도구를 추천해드립니다
        </p>
      </div>

      {/* 직군 카드 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {jobCategories.map((job) => {
          const recs = getJobRecommendations(job.slug);
          const essentialCount = recs.filter((r) => r.recommendation_level === 'essential').length;

          return (
            <Link
              key={job.slug}
              href={`/jobs/${job.slug}`}
              className="group rounded-xl border border-border bg-white p-6 text-center shadow-sm card-hover"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <DynamicIcon name={job.icon || 'Briefcase'} className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {job.name}
              </h3>
              <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                {job.description}
              </p>
              {essentialCount > 0 && (
                <p className="mt-3 text-xs text-primary font-medium">
                  필수 AI {essentialCount}개
                </p>
              )}
              <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400 group-hover:text-primary transition-colors">
                자세히 보기
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
