import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SITE_NAME, PURPOSE_CATEGORIES } from '@/lib/constants';
import DynamicIcon from '@/components/ui/DynamicIcon';
import Wizard from '@/components/recommend/Wizard';

export const metadata: Metadata = {
  title: `AI 찾기 | ${SITE_NAME}`,
  description: '2단계 질문으로 나에게 맞는 AI를 추천받으세요.',
};

export default function DiscoverPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 페이지 헤더 */}
      <div className="text-center mb-10">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">AI 찾기</h1>
        <p className="mt-2 text-sm text-gray-500">2단계 질문으로 나에게 딱 맞는 AI를 찾아보세요</p>
      </div>

      {/* 맞춤 AI 추천 위자드 */}
      <section id="wizard" className="mb-12">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-extrabold text-foreground">맞춤 AI 추천</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">2단계 질문으로 나에게 맞는 AI를 추천받으세요</p>
          <Wizard />
        </div>
      </section>

      {/* 구분선 */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm font-medium text-gray-400">또는 직접 탐색하기</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* 컴팩트 카테고리 바로가기 */}
      <section className="mb-8">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {PURPOSE_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5 hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <DynamicIcon name={cat.icon} className="h-4 w-4 text-gray-500 group-hover:text-primary shrink-0 transition-colors" />
              <span className="text-xs font-medium text-foreground truncate">{cat.name.split(' · ')[0]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 하단 CTA */}
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-3">원하는 걸 못 찾으셨나요?</p>
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          직접 검색하기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
