import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Newspaper, Info } from 'lucide-react';
import { SITE_NAME, NEWS_CATEGORIES } from '@/lib/constants';
import { getNews } from '@/lib/supabase/queries';
import type { NewsCategory } from '@/types';

export const metadata: Metadata = {
  title: `뉴스 관리 | ${SITE_NAME}`,
};

export default function AdminNewsPage() {
  const news = getNews();

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
        <h1 className="flex items-center gap-3 text-2xl font-extrabold text-foreground sm:text-3xl">
          <Newspaper className="h-7 w-7 text-primary" />
          뉴스 관리
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          등록된 뉴스 {news.length}개
        </p>
      </div>

      {/* 데모 안내 */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
        <p className="text-sm text-blue-700">
          현재 데모 모드입니다. Supabase 연동 후 CRUD 기능이 활성화됩니다.
        </p>
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
