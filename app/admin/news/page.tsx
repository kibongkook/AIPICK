import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Newspaper, ExternalLink } from 'lucide-react';
import { SITE_NAME, NEWS_CATEGORIES } from '@/lib/constants';
import { getNews } from '@/lib/supabase/queries';
import type { NewsCategory } from '@/types';
import AdminDeleteButton from '@/components/admin/AdminDeleteButton';

export const metadata: Metadata = {
  title: `뉴스 관리 | ${SITE_NAME}`,
};

export default async function AdminNewsPage() {
  const news = await getNews();

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
              <Newspaper className="h-7 w-7 text-primary" />
              뉴스 관리
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              등록된 뉴스 {news.length}개
            </p>
          </div>
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
              <th className="px-5 py-3 font-semibold text-gray-600">발행일</th>
              <th className="px-5 py-3 font-semibold text-gray-600 text-center">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {news.map((item) => {
              const categoryConfig = NEWS_CATEGORIES[item.category as NewsCategory];
              return (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground max-w-md">
                    <span className="line-clamp-1">{item.title}</span>
                  </td>
                  <td className="px-5 py-3">
                    {categoryConfig ? (
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryConfig.color}`}>
                        {categoryConfig.label}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">{item.category}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-700">
                    {item.view_count.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(item.published_at).toLocaleDateString('ko-KR')}
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
                        endpoint="/api/admin/news"
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

        {news.length === 0 && (
          <div className="p-12 text-center">
            <Newspaper className="mx-auto h-12 w-12 text-gray-200" />
            <p className="mt-4 text-sm text-gray-400">등록된 뉴스가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
