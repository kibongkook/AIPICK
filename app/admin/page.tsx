import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Settings, Wrench, Newspaper, BookOpen, Layers,
  ArrowRight, Briefcase, GraduationCap,
} from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import {
  getTools, getNews, getGuides, getCollections,
  getJobCategories, getEduLevels,
} from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: `관리자 대시보드 | ${SITE_NAME}`,
};

export default function AdminDashboard() {
  const tools = getTools();
  const news = getNews();
  const guides = getGuides();
  const collections = getCollections();
  const jobCategories = getJobCategories();
  const eduLevels = getEduLevels();

  const stats = [
    { label: '총 서비스 수', value: tools.length, icon: Wrench, color: 'text-blue-600 bg-blue-50' },
    { label: '총 뉴스', value: news.length, icon: Newspaper, color: 'text-emerald-600 bg-emerald-50' },
    { label: '총 가이드', value: guides.length, icon: BookOpen, color: 'text-purple-600 bg-purple-50' },
    { label: '총 컬렉션', value: collections.length, icon: Layers, color: 'text-orange-600 bg-orange-50' },
  ];

  const quickLinks = [
    {
      title: '서비스 관리',
      href: '/admin/tools',
      icon: Wrench,
      count: tools.length,
      description: 'AI 서비스 목록 관리',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: '뉴스 관리',
      href: '/admin/news',
      icon: Newspaper,
      count: news.length,
      description: 'AI 뉴스 콘텐츠 관리',
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: '가이드 관리',
      href: '/admin/guides',
      icon: BookOpen,
      count: guides.length,
      description: 'AI 활용 가이드 관리',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: '직군 관리',
      href: '/admin/jobs',
      icon: Briefcase,
      count: jobCategories.length,
      description: '직군별 추천 설정',
      color: 'text-rose-600 bg-rose-50',
    },
    {
      title: '학년 관리',
      href: '/admin/education',
      icon: GraduationCap,
      count: eduLevels.length,
      description: '학년별 추천 설정',
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-10">
        <h1 className="flex items-center gap-3 text-2xl font-extrabold text-foreground sm:text-3xl">
          <Settings className="h-7 w-7 text-primary" />
          관리자 대시보드
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          AIPICK 콘텐츠와 서비스를 관리합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 빠른 관리 */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground">빠른 관리</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-xl border border-border bg-white p-5 transition-colors hover:border-primary"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${link.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-primary" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {link.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{link.description}</p>
              <p className="mt-3 text-sm font-medium text-gray-400">
                {link.count}개 항목
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
