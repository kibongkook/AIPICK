import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen, Eye, PenSquare } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { getGuides } from '@/lib/supabase/queries';
import type { GuideCategory } from '@/types';

export const metadata: Metadata = {
  title: `AI 활용 가이드 | ${SITE_NAME}`,
  description: 'AI 도구 활용법, 직군별 가이드, 교육 활용 팁을 확인하세요.',
};

const GUIDE_CATEGORIES: Record<GuideCategory, { label: string; color: string }> = {
  job: { label: '직군', color: 'bg-blue-100 text-blue-700' },
  education: { label: '교육', color: 'bg-emerald-100 text-emerald-700' },
  tip: { label: '팁', color: 'bg-purple-100 text-purple-700' },
  tutorial: { label: '튜토리얼', color: 'bg-orange-100 text-orange-700' },
};

const CATEGORY_TABS = [
  { key: undefined, label: '전체', href: '/guides' },
  { key: 'job', label: '직군별', href: '/guides?category=job' },
  { key: 'education', label: '교육/학년별', href: '/guides?category=education' },
  { key: 'tip', label: '팁', href: '/guides?category=tip' },
] as const;

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function GuidesPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const validCategory =
    category && category in GUIDE_CATEGORIES ? (category as GuideCategory) : undefined;
  const guides = await getGuides(validCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-foreground sm:text-3xl">
            <BookOpen className="h-7 w-7 text-primary" />
            AI 활용 가이드
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            AI 도구를 200% 활용하는 방법을 알아보세요.
          </p>
        </div>
        <Link
          href="/guides/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors shrink-0"
        >
          <PenSquare className="h-4 w-4" />
          가이드 작성
        </Link>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORY_TABS.map((tab) => (
          <a
            key={tab.label}
            href={tab.href}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              validCategory === tab.key
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* 가이드 목록 */}
      {guides.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => {
            const catConfig = GUIDE_CATEGORIES[guide.category];
            const summary =
              guide.content.length > 100
                ? guide.content.slice(0, 100) + '...'
                : guide.content;
            const date = new Date(guide.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <a
                key={guide.id}
                href={`/guides/${guide.slug}`}
                className="group rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
              >
                {/* 카테고리 뱃지 */}
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${catConfig.color}`}
                >
                  {catConfig.label}
                </span>

                {/* 제목 */}
                <h2 className="mt-3 text-base font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {guide.title}
                </h2>

                {/* 요약 */}
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{summary}</p>

                {/* 메타 */}
                <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {guide.view_count.toLocaleString()}
                  </span>
                  <span>{date}</span>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-200" />
          <p className="mt-4 text-sm text-gray-400">해당 카테고리의 가이드가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
