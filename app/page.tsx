import Link from 'next/link';
import { ArrowRight, Trophy, Briefcase, GraduationCap, Newspaper } from 'lucide-react';
import { HERO_QUICK_BUTTONS, EDITOR_PICKS_COUNT, CATEGORY_PREVIEW_COUNT } from '@/lib/constants';
import type { Tool, Category, News } from '@/types';
import DynamicIcon from '@/components/ui/DynamicIcon';
import ServiceCard from '@/components/service/ServiceCard';
import ServiceGrid from '@/components/service/ServiceGrid';
import NewsCard from '@/components/news/NewsCard';
import NewsletterForm from '@/components/newsletter/NewsletterForm';
import {
  getTools, getCategories, getEditorPicks, getLatestTools,
  getRankings, getJobCategories, getEduLevels, getNews,
} from '@/lib/supabase/queries';

export default function Home() {
  const tools = getTools();
  const categories = getCategories();
  const editorPicks = getEditorPicks(EDITOR_PICKS_COUNT);
  const topRanked = getRankings().slice(0, 5);
  const jobCategories = getJobCategories();
  const eduLevels = getEduLevels();
  const latestNews = getNews(3);

  return (
    <>
      {/* 히어로 섹션 */}
      <HeroSection />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 에디터 추천 */}
        <EditorPicksSection tools={editorPicks} />

        {/* 종합 랭킹 TOP 5 */}
        <RankingWidgetSection tools={topRanked} />

        {/* 최신 AI 소식 */}
        {latestNews.length > 0 && <NewsWidgetSection news={latestNews} />}

        {/* 직군별 퀵 네비게이션 */}
        {jobCategories.length > 0 && <JobNavSection jobs={jobCategories} />}

        {/* 학년별 퀵 네비게이션 */}
        {eduLevels.length > 0 && <EduNavSection levels={eduLevels} />}

        {/* 카테고리별 서비스 */}
        <CategorySections tools={tools} categories={categories} />

        {/* 최신 등록 */}
        <LatestSection tools={getLatestTools(CATEGORY_PREVIEW_COUNT)} />

        {/* 뉴스레터 구독 */}
        <section className="mb-16 mx-auto max-w-lg">
          <NewsletterForm />
        </section>
      </div>
    </>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            어떤 <span className="text-primary">AI</span>를 찾고 계신가요?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 sm:text-lg">
            목적에 맞는 AI를 추천받고, 무료로 시작하세요.
            <br className="hidden sm:block" />
            각 서비스의 무료 사용량을 한눈에 비교할 수 있습니다.
          </p>

          {/* 퀵 버튼 */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {HERO_QUICK_BUTTONS.map((btn) => (
              <Link
                key={btn.slug}
                href={`/category/${btn.slug}`}
                className="flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:border-primary hover:text-primary hover:shadow-md transition-all"
              >
                <DynamicIcon name={btn.icon} className="h-4 w-4" />
                {btn.label}
              </Link>
            ))}
          </div>

          {/* 빠른 탐색 링크 */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/jobs" className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors">
              <Briefcase className="h-4 w-4" />
              직군별 추천
            </Link>
            <Link href="/education" className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors">
              <GraduationCap className="h-4 w-4" />
              학년별 추천
            </Link>
            <Link href="/rankings" className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors">
              <Trophy className="h-4 w-4" />
              AI 랭킹
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function EditorPicksSection({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          에디터가 추천하는 AI
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scroll-snap-x">
        {tools.map((tool) => (
          <div key={tool.id} className="min-w-[280px] max-w-[320px] flex-shrink-0">
            <ServiceCard tool={tool} />
          </div>
        ))}
      </div>
    </section>
  );
}

function RankingWidgetSection({ tools }: { tools: (Tool & { ranking: number })[] }) {
  if (tools.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">종합 랭킹 TOP 5</h2>
        </div>
        <Link
          href="/rankings"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          전체 랭킹 보기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="rounded-xl border border-border bg-white divide-y divide-border/50">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-blue-50/50 transition-colors"
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
              tool.ranking === 1 ? 'bg-yellow-400' : tool.ranking === 2 ? 'bg-gray-300' : tool.ranking === 3 ? 'bg-amber-600' : 'bg-gray-200 text-gray-600'
            }`}>
              {tool.ranking}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-foreground">{tool.name}</span>
              <span className="ml-2 text-xs text-gray-400 hidden sm:inline">{tool.description.slice(0, 40)}...</span>
            </div>
            <span className="text-xs text-gray-500">{tool.rating_avg.toFixed(1)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function JobNavSection({ jobs }: { jobs: { name: string; slug: string; icon: string | null }[] }) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">당신의 직업은?</h2>
        </div>
        <Link
          href="/jobs"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          전체 보기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {jobs.map((job) => (
          <Link
            key={job.slug}
            href={`/jobs/${job.slug}`}
            className="flex shrink-0 flex-col items-center gap-2 rounded-xl border border-border bg-white px-5 py-4 shadow-sm hover:border-primary hover:shadow-md transition-all min-w-[100px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DynamicIcon name={job.icon || 'Briefcase'} className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{job.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EduNavSection({ levels }: { levels: { name: string; slug: string; age_range: string | null; icon: string | null }[] }) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">학생이신가요?</h2>
        </div>
        <Link
          href="/education"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          전체 보기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {levels.map((level) => (
          <Link
            key={level.slug}
            href={`/education/${level.slug}`}
            className="flex shrink-0 flex-col items-center gap-2 rounded-xl border border-border bg-white px-5 py-4 shadow-sm hover:border-primary hover:shadow-md transition-all min-w-[100px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DynamicIcon name={level.icon || 'GraduationCap'} className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{level.name}</span>
            {level.age_range && (
              <span className="text-[10px] text-gray-400">{level.age_range}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

function NewsWidgetSection({ news }: { news: News[] }) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">최신 AI 소식</h2>
        </div>
        <Link
          href="/news"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          전체 뉴스 보기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
    </section>
  );
}

function CategorySections({ tools, categories }: { tools: Tool[]; categories: Category[] }) {
  return (
    <>
      {categories.map((cat) => {
        const catTools = tools
          .filter((t) => t.category_id === cat.id)
          .sort((a, b) => b.visit_count - a.visit_count)
          .slice(0, CATEGORY_PREVIEW_COUNT);

        if (catTools.length === 0) return null;

        return (
          <section key={cat.slug} className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                {cat.name}
              </h2>
              <Link
                href={`/category/${cat.slug}`}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                더보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ServiceGrid tools={catTools} />
          </section>
        );
      })}
    </>
  );
}

function LatestSection({ tools }: { tools: Tool[] }) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          최근 등록된 서비스
        </h2>
      </div>
      <ServiceGrid tools={tools} />
    </section>
  );
}
