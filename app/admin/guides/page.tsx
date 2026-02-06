import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { getGuides } from '@/lib/supabase/queries';
import AdminDeleteButton from '@/components/admin/AdminDeleteButton';

const GUIDE_CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  job: { label: '직군', color: 'bg-blue-100 text-blue-700' },
  education: { label: '교육', color: 'bg-emerald-100 text-emerald-700' },
  tip: { label: '팁', color: 'bg-orange-100 text-orange-700' },
  tutorial: { label: '튜토리얼', color: 'bg-purple-100 text-purple-700' },
};

export const metadata: Metadata = {
  title: `가이드 관리 | ${SITE_NAME}`,
};

export default async function AdminGuidesPage() {
  const guides = await getGuides();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          대시보드로 돌아가기
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-extrabold text-foreground sm:text-3xl">
              <BookOpen className="h-7 w-7 text-primary" />
              가이드 관리
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              등록된 가이드 {guides.length}개
            </p>
          </div>
          <Link
            href="/guides/new"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            새 가이드 작성
          </Link>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              <th className="px-5 py-3 font-semibold text-gray-600">제목</th>
              <th className="px-5 py-3 font-semibold text-gray-600">카테고리</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-right">조회수</th>
              <th className="px-5 py-3 font-semibold text-gray-600">작성일</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-center">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {guides.map((guide) => {
              const categoryConfig = GUIDE_CATEGORY_LABELS[guide.category];
              return (
                <tr key={guide.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground max-w-md">
                    <Link href={`/guides/${guide.slug}`} className="hover:text-primary transition-colors line-clamp-1">
                      {guide.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    {categoryConfig ? (
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryConfig.color}`}>
                        {categoryConfig.label}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">{guide.category}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-700">
                    {guide.view_count.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(guide.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <AdminDeleteButton
                      endpoint="/api/guides"
                      id={guide.id}
                      name={guide.title}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {guides.length === 0 && (
          <div className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-200" />
            <p className="mt-4 text-sm text-gray-400">등록된 가이드가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
