import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Wrench, ExternalLink } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { getTools } from '@/lib/supabase/queries';
import AdminDeleteButton from '@/components/admin/AdminDeleteButton';

export const metadata: Metadata = {
  title: `서비스 관리 | ${SITE_NAME}`,
};

export default async function AdminToolsPage() {
  const tools = await getTools();

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
              <Wrench className="h-7 w-7 text-primary" />
              서비스 관리
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              등록된 AI 서비스 {tools.length}개
            </p>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              <th className="px-5 py-3 font-semibold text-gray-600">서비스명</th>
              <th className="px-5 py-3 font-semibold text-gray-600">카테고리</th>
              <th className="px-5 py-3 font-semibold text-gray-600">가격 유형</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-right">평점</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-right">방문</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-center">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {tools.map((tool) => (
              <tr key={tool.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 font-medium text-foreground">
                  <Link href={`/tools/${tool.slug}`} className="hover:text-primary transition-colors">
                    {tool.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-gray-500">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">
                    {tool.categories?.find(c => c.is_primary)?.name || tool.categories?.[0]?.name || '-'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      tool.pricing_type === 'Free'
                        ? 'bg-emerald-100 text-emerald-700'
                        : tool.pricing_type === 'Freemium'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tool.pricing_type}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-gray-700">
                  {tool.rating_avg.toFixed(1)}
                </td>
                <td className="px-5 py-3 text-right text-gray-700">
                  {tool.visit_count.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-primary transition-colors"
                      title="외부 링크"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <AdminDeleteButton
                      endpoint="/api/admin/tools"
                      id={tool.id}
                      name={tool.name}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tools.length === 0 && (
          <div className="p-12 text-center">
            <Wrench className="mx-auto h-12 w-12 text-gray-200" />
            <p className="mt-4 text-sm text-gray-400">등록된 서비스가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
