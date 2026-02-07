import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, ArrowRight, Shield } from 'lucide-react';
import { SITE_NAME, CATEGORIES, JOB_CATEGORIES, EDU_LEVELS } from '@/lib/constants';
import DynamicIcon from '@/components/ui/DynamicIcon';
import Wizard from '@/components/recommend/Wizard';

export const metadata: Metadata = {
  title: `AI 찾기 & 맞춤 추천 | ${SITE_NAME}`,
  description: '목적별, 역할별로 나에게 맞는 AI를 찾거나 4단계 맞춤 추천을 받아보세요.',
};

export default function DiscoverPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 페이지 헤더 */}
      <div className="text-center mb-10">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">AI 찾기 & 맞춤 추천</h1>
        <p className="mt-2 text-sm text-gray-500">목적별로 탐색하거나, 맞춤 추천으로 나에게 딱 맞는 AI를 찾아보세요</p>
      </div>

      {/* 섹션 1: 맞춤 AI 추천 위자드 (임베드) */}
      <section id="wizard" className="mb-12">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-extrabold text-foreground">맞춤 AI 추천</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">4단계 질문으로 나에게 맞는 AI를 추천받으세요</p>
          <Wizard />
        </div>
      </section>

      {/* 구분선 */}
      <div className="flex items-center gap-4 mb-12">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm font-medium text-gray-400">또는 직접 탐색하기</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* 섹션 2: 무엇을 하고 싶나요? (목적/기능별) */}
      <section className="mb-12">
        <h2 className="text-lg font-extrabold text-foreground mb-1">무엇을 하고 싶나요?</h2>
        <p className="text-sm text-gray-500 mb-5">목적에 맞는 AI 카테고리를 선택하세요</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-white p-5 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <DynamicIcon name={cat.icon} className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 구분선 */}
      <div className="flex items-center gap-4 mb-12">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm font-medium text-gray-400">또는</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* 섹션 2: 나의 역할은? (직군 + 학습단계) */}
      <section className="mb-12">
        <h2 className="text-lg font-extrabold text-foreground mb-1">나의 역할은?</h2>
        <p className="text-sm text-gray-500 mb-5">직업이나 학습 단계에 맞는 AI를 추천받으세요</p>

        {/* 직군 */}
        <h3 className="text-sm font-bold text-gray-700 mb-3">직군별</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-8">
          {JOB_CATEGORIES.map((job) => (
            <Link
              key={job.slug}
              href={`/jobs/${job.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                <DynamicIcon name={job.icon} className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">{job.name}</span>
            </Link>
          ))}
        </div>

        {/* 학습 단계 */}
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-gray-700">학습 단계별</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {EDU_LEVELS.map((level) => (
            <Link
              key={level.slug}
              href={`/education/${level.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors shrink-0">
                <DynamicIcon name={level.icon} className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground block">{level.name}</span>
                {level.ageRange && (
                  <span className="text-[11px] text-gray-400">{level.ageRange}</span>
                )}
              </div>
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
