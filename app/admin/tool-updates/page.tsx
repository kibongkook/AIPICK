import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';

import { SITE_NAME, TOOL_UPDATE_TYPES, UPDATE_IMPACT } from '@/lib/constants';
import { getRecentUpdates } from '@/lib/supabase/queries';
import AdminDeleteButton from '@/components/admin/AdminDeleteButton';

import type { ToolUpdateType, UpdateImpact } from '@/types';

export const metadata: Metadata = {
  title: `서비스 업데이트 관리 | ${SITE_NAME}`,
};

export default async function AdminToolUpdatesPage() {
  const updates = await getRecentUpdates(100);

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
              <RefreshCw className="h-7 w-7 text-primary" />
              서비스 업데이트 관리
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              등록된 업데이트 {updates.length}개
            </p>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              <th className="px-5 py-3 font-semibold text-gray-600">서비스</th>
              <th className="px-5 py-3 font-semibold text-gray-600">제목</th>
              <th className="px-5 py-3 font-semibold text-gray-600">타입</th>
              <th className="px-5 py-3 font-semibold text-gray-600">영향도</th>
              <th className="px-5 py-3 font-semibold text-gray-600">발표일</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-center">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {updates.map((item) => {
              const typeConfig = TOOL_UPDATE_TYPES[item.update_type as ToolUpdateType] || TOOL_UPDATE_TYPES.other;
              const impactConfig = UPDATE_IMPACT[item.impact as UpdateImpact] || UPDATE_IMPACT.minor;
              return (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">
                    {item.tool ? (
                      <Link href={`/tools/${item.tool.slug}`} className="hover:text-primary transition-colors">
                        {item.tool.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">알 수 없음</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground max-w-md">
                    <span className="line-clamp-1">{item.title}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${typeConfig.color}`}>
                      {typeConfig.label}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium ${impactConfig.color}`}>
                      {impactConfig.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(item.announced_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {item.source_url && (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-primary transition-colors"
                          title="원문 보기"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <AdminDeleteButton
                        endpoint="/api/admin/tool-updates"
                        id={item.id}
                        name={item.title}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {updates.length === 0 && (
          <div className="p-12 text-center">
            <RefreshCw className="mx-auto h-12 w-12 text-gray-200" />
            <p className="mt-4 text-sm text-gray-400">등록된 업데이트가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
