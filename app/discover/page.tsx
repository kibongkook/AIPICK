import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, ArrowRight, Users } from 'lucide-react';
import { SITE_NAME, PURPOSE_CATEGORIES, USER_TYPES } from '@/lib/constants';
import DynamicIcon from '@/components/ui/DynamicIcon';
import Wizard from '@/components/recommend/Wizard';

export const metadata: Metadata = {
  title: `AI 찾기 & 맞춤 추천 | ${SITE_NAME}`,
  description: '목적별, 사용자 타입별로 나에게 맞는 AI를 찾거나 맞춤 추천을 받아보세요.',
};

export default function DiscoverPage() {
  const skillTypes = USER_TYPES.filter(u => u.group === 'skill');
  const roleTypes = USER_TYPES.filter(u => u.group === 'role');

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
          <p className="text-sm text-gray-500 mb-6">2단계 질문으로 나에게 맞는 AI를 추천받으세요</p>
          <Wizard />
        </div>
      </section>

      {/* 구분선 */}
      <div className="flex items-center gap-4 mb-12">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm font-medium text-gray-400">또는 직접 탐색하기</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* 1단계: 지금 뭐 하려고 하세요? (목적별) */}
      <section className="mb-12">
        <h2 className="text-lg font-extrabold text-foreground mb-1">지금 뭐 하려고 하세요?</h2>
        <p className="text-sm text-gray-500 mb-5">목적에 맞는 AI를 찾아보세요</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {PURPOSE_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-white p-5 hover:border-primary hover:shadow-md transition-all"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} shadow-sm`}>
                <DynamicIcon name={cat.icon} className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-foreground text-center">{cat.name}</span>
              <span className="text-[11px] text-gray-400 text-center">{cat.description}</span>
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

      {/* 2단계: 당신은 어떤 상황에서 쓰나요? (사용자 타입별) */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-extrabold text-foreground">당신은 어떤 상황에서 쓰나요?</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">사용자 타입에 맞는 AI 추천을 받아보세요</p>

        {/* 숙련도 */}
        <h3 className="text-sm font-bold text-gray-700 mb-3">숙련도별</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
          {skillTypes.map((ut) => (
            <Link
              key={ut.slug}
              href={`/discover/${ut.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                <DynamicIcon name={ut.icon} className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground block">{ut.name}</span>
                <span className="text-[11px] text-gray-400">{ut.description}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* 역할별 */}
        <h3 className="text-sm font-bold text-gray-700 mb-3">역할별</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {roleTypes.map((ut) => (
            <Link
              key={ut.slug}
              href={`/discover/${ut.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors shrink-0">
                <DynamicIcon name={ut.icon} className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-foreground">{ut.name}</span>
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
