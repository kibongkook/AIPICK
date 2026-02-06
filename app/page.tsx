import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HERO_QUICK_BUTTONS, EDITOR_PICKS_COUNT, CATEGORY_PREVIEW_COUNT } from '@/lib/constants';
import type { Tool, Category } from '@/types';
import DynamicIcon from '@/components/ui/DynamicIcon';
import ServiceCard from '@/components/service/ServiceCard';
import ServiceGrid from '@/components/service/ServiceGrid';
import seedData from '@/data/seed.json';

// Phase 2에서 Supabase 쿼리로 교체 예정
function getToolsData() {
  const tools = seedData.tools as unknown as Tool[];
  const categories = seedData.categories as unknown as Category[];
  return { tools, categories };
}

export default function Home() {
  const { tools, categories } = getToolsData();
  const editorPicks = tools.filter((t) => t.is_editor_pick).slice(0, EDITOR_PICKS_COUNT);

  return (
    <>
      {/* 히어로 섹션 */}
      <HeroSection />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 에디터 추천 */}
        <EditorPicksSection tools={editorPicks} />

        {/* 카테고리별 서비스 */}
        <CategorySections tools={tools} categories={categories} />

        {/* 최신 등록 */}
        <LatestSection tools={tools} />
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
  const latest = [...tools]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, CATEGORY_PREVIEW_COUNT);

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          최근 등록된 서비스
        </h2>
      </div>
      <ServiceGrid tools={latest} />
    </section>
  );
}
