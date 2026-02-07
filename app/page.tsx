import Link from 'next/link';
import {
  ArrowRight, ArrowRightLeft, Trophy,
  Flame, Sparkles, Star,
} from 'lucide-react';
import {
  MAIN_EDITOR_PICKS_COUNT, MAIN_NEW_TOOLS_COUNT, MAIN_CATEGORY_TOOLS_COUNT,
  FEATURED_JOB_SLUGS, JOB_CATEGORIES,
  SOCIAL_PROOF_MESSAGES, CATEGORIES, HERO_KEYWORDS, MAIN_PAGE_CATEGORIES,
} from '@/lib/constants';
import type { Tool, News, RoleShowcase, RoleUseCaseShowcase } from '@/types';
import DynamicIcon from '@/components/ui/DynamicIcon';
import ServiceCard from '@/components/service/ServiceCard';
import NewsCard from '@/components/news/NewsCard';
import NewsletterForm from '@/components/newsletter/NewsletterForm';
import RoleShowcaseRotation from '@/components/showcase/RoleShowcaseRotation';
import { formatVisitCount } from '@/lib/utils';
import {
  getEditorPicks, getRankings, getTrending,
  getJobCategories, getJobRecommendations, getLatestTools, getNews,
  getTopToolsByCategorySlug, getHeroKeywordsOrdered,
  getAllRoleShowcases, getRoleUseCases,
} from '@/lib/supabase/queries';
import { POPULAR_PAIRS, getCompareUrl } from '@/lib/compare/popular-pairs';

export default async function Home() {
  const [
    editorPicks, topRankedAll, trending, jobCategories, latestTools, latestNews,
    heroKeywords, jobRoleShowcases, eduRoleShowcases,
    ...categoryToolsArr
  ] = await Promise.all([
    getEditorPicks(MAIN_EDITOR_PICKS_COUNT),
    getRankings(),
    getTrending(6),
    getJobCategories(),
    getLatestTools(MAIN_NEW_TOOLS_COUNT),
    getNews(3),
    getHeroKeywordsOrdered(),
    getAllRoleShowcases('job'),
    getAllRoleShowcases('education'),
    ...MAIN_PAGE_CATEGORIES.map(cat => getTopToolsByCategorySlug(cat.slug, MAIN_CATEGORY_TOOLS_COUNT)),
  ]);
  const topRanked = topRankedAll.slice(0, 5);

  // 카테고리별 도구 매핑
  const categoryToolsMap = new Map<string, Tool[]>();
  MAIN_PAGE_CATEGORIES.forEach((cat, i) => {
    categoryToolsMap.set(cat.slug, categoryToolsArr[i] as Tool[]);
  });

  const buildShowcaseWithCases = async (showcases: RoleShowcase[]) => {
    const results = await Promise.all(
      showcases.slice(0, 5).map(async (rs) => ({
        ...rs,
        useCases: await getRoleUseCases(rs.id),
      }))
    );
    return results.filter(r => r.useCases.length > 0);
  };

  const [jobShowcasesWithCases, eduShowcasesWithCases] = await Promise.all([
    buildShowcaseWithCases(jobRoleShowcases),
    buildShowcaseWithCases(eduRoleShowcases),
  ]);

  return (
    <>
      {/* 히어로 */}
      <HeroSection keywords={heroKeywords} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 트렌딩 바 */}
        <TrendingBar tools={trending} />

        {/* 직업/교육별 AI 활용 쇼케이스 (상단 배치) */}
        <div className="mt-8">
          <RoleShowcaseRotation
            jobShowcases={jobShowcasesWithCases}
            eduShowcases={eduShowcasesWithCases}
          />
        </div>

        {/* 2단 레이아웃 */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* 메인 콘텐츠 (2/3) */}
          <div className="lg:col-span-2 space-y-10">
            {/* 1. 에디터 추천 - 가장 중요, 맨 위 */}
            <EditorPicksSection tools={editorPicks} />

            {/* 2-6. 카테고리별 인기 AI */}
            {MAIN_PAGE_CATEGORIES.map((cat) => (
              <CategoryToolsSection
                key={cat.slug}
                title={cat.title}
                subtitle={cat.subtitle}
                icon={cat.icon}
                slug={cat.slug}
                tools={categoryToolsMap.get(cat.slug) || []}
              />
            ))}

            {/* 7. 직군별 필수 AI */}
            <FeaturedJobsSection jobCategories={jobCategories} />

            {/* 8. NEW - 신규 AI */}
            <NewToolsSection tools={latestTools} />

            {/* 9. 인기 비교 */}
            <PopularComparisonsSection />

            {/* 10. AI 뉴스 */}
            {latestNews.length > 0 && <NewsSection news={latestNews} />}
          </div>

          {/* 사이드바 (1/3) */}
          <aside className="space-y-6">
            <RankingSidebar tools={topRanked} />
            <CategorySidebar />
            <WizardSidebar />
            <NewsletterForm />
          </aside>
        </div>
      </div>
    </>
  );
}

// ==========================================
// 히어로 - 키워드 태그 추가
// ==========================================
function HeroSection({ keywords }: { keywords: typeof HERO_KEYWORDS[number][] }) {
  return (
    <section className="hero-gradient">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="text-center">
          {/* 라이브 인디케이터 */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 mb-5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse-dot" />
            <span className="text-xs text-gray-400">{SOCIAL_PROOF_MESSAGES.hero_stat}</span>
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight whitespace-pre-line">
            {SOCIAL_PROOF_MESSAGES.hero_headline}
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm text-gray-400 sm:text-base">
            {SOCIAL_PROOF_MESSAGES.hero_sub}
          </p>

          {/* 키워드 태그 */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {keywords.map((kw) => (
              <Link
                key={kw.slug}
                href={`/category/${kw.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-gray-300 backdrop-blur-sm hover:bg-white/15 hover:text-white transition-all"
              >
                <DynamicIcon name={kw.icon} className="h-3 w-3" />
                {kw.label}
              </Link>
            ))}
          </div>

          {/* CTA - 통합 버튼 */}
          <div className="mt-7">
            <Link
              href="/discover"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-7 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
            >
              <Sparkles className="h-4 w-4" />
              AI 찾기 · 맞춤 추천
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 트렌딩 바
// ==========================================
function TrendingBar({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) return null;

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1">
      <div className="flex items-center gap-1.5 shrink-0">
        <Flame className="h-4 w-4 text-orange-500 animate-flame" />
        <span className="text-xs font-bold text-orange-600">HOT</span>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {tools.slice(0, 5).map((tool, i) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="shrink-0 flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs hover:border-primary transition-colors"
          >
            <span className="font-bold text-primary/50">{i + 1}</span>
            <span className="font-semibold text-foreground">{tool.name}</span>
            <span className="text-emerald-600 text-[10px]">+{formatVisitCount(tool.weekly_visit_delta || 0)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 에디터 추천
// ==========================================
function EditorPicksSection({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) return null;

  return (
    <section>
      <SectionHeader
        title="에디터 추천"
        badge={<Sparkles className="ml-1.5 h-4 w-4 text-primary" />}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tools.map((tool) => (
          <ServiceCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}

// ==========================================
// 카테고리별 인기 AI (범용)
// ==========================================
function CategoryToolsSection({ title, subtitle, icon, slug, tools }: {
  title: string; subtitle: string; icon: string; slug: string; tools: Tool[];
}) {
  if (tools.length === 0) return null;

  return (
    <section>
      <SectionHeader
        title={title}
        badge={<DynamicIcon name={icon} className="ml-1.5 h-4 w-4 text-primary" />}
        href={`/category/${slug}`}
        linkText="전체 보기"
      />
      <p className="text-xs text-gray-400 mb-4 -mt-2">{subtitle}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tools.map((tool) => (
          <ServiceCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}

// ==========================================
// 직군별 필수 AI
// ==========================================
async function FeaturedJobsSection({ jobCategories }: { jobCategories: { id: string; name: string; slug: string; icon: string | null; description: string | null }[] }) {
  const featured = jobCategories.filter(j => (FEATURED_JOB_SLUGS as readonly string[]).includes(j.slug));

  const recsMap = new Map<string, Awaited<ReturnType<typeof getJobRecommendations>>>();
  await Promise.all(
    featured.map(async (job) => {
      recsMap.set(job.slug, await getJobRecommendations(job.slug));
    })
  );

  return (
    <section>
      <SectionHeader title={SOCIAL_PROOF_MESSAGES.job_fomo} href="/discover" linkText="역할별 AI 찾기" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {featured.map((job) => {
          const recs = recsMap.get(job.slug) || [];
          const essentials = recs.filter(r => r.recommendation_level === 'essential');

          return (
            <Link
              key={job.slug}
              href={`/jobs/${job.slug}`}
              className="group job-card rounded-xl border border-border bg-white p-4"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <DynamicIcon name={job.icon || 'Briefcase'} className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{job.name}</h3>
                    <span className="text-[11px] text-primary font-semibold">필수 {essentials.length}개</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {essentials.slice(0, 3).map((rec) => rec.tool && (
                    <span key={rec.id} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600">
                      {rec.tool.name}
                    </span>
                  ))}
                </div>

                <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-1.5 transition-all">
                  {SOCIAL_PROOF_MESSAGES.job_cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ==========================================
// NEW - 신규 AI 서비스
// ==========================================
function NewToolsSection({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) return null;

  return (
    <section>
      <SectionHeader
        title="NEW"
        badge={<span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">신규</span>}
        href="/search?sort=latest"
        linkText="전체 보기"
      />
      <p className="text-xs text-gray-400 mb-4 -mt-2">새로 등장한 AI 서비스</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tools.map((tool) => (
          <ServiceCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}

// ==========================================
// 뉴스
// ==========================================
function NewsSection({ news }: { news: News[] }) {
  return (
    <section>
      <SectionHeader title="AI 뉴스" href="/news" linkText="전체 뉴스" />
      <div className="space-y-3">
        {news.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>
    </section>
  );
}

// ==========================================
// 인기 비교
// ==========================================
const FEATURED_COMPARISONS = [
  { slugs: ['chatgpt', 'claude'] as const, label: 'ChatGPT vs Claude' },
  { slugs: ['midjourney', 'dall-e-3'] as const, label: 'Midjourney vs DALL-E 3' },
  { slugs: ['cursor', 'github-copilot'] as const, label: 'Cursor vs GitHub Copilot' },
  { slugs: ['deepl', 'google-translate'] as const, label: 'DeepL vs Google 번역' },
  { slugs: ['runway-ml', 'sora'] as const, label: 'Runway vs Sora' },
  { slugs: ['suno-ai', 'udio'] as const, label: 'Suno vs Udio' },
];

function PopularComparisonsSection() {
  return (
    <section>
      <SectionHeader title="AI 비교" href="/compare/chatgpt/claude" linkText="비교하기" />
      <div className="grid gap-3 sm:grid-cols-2">
        {FEATURED_COMPARISONS.slice(0, 4).map(({ slugs, label }) => (
          <Link
            key={label}
            href={getCompareUrl(slugs[0], slugs[1])}
            className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:border-primary hover:shadow-md transition-all"
          >
            <ArrowRightLeft className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-semibold text-foreground">{label}</span>
            <ArrowRight className="ml-auto h-3.5 w-3.5 text-gray-400" />
          </Link>
        ))}
      </div>
    </section>
  );
}

// ==========================================
// 사이드바: 랭킹 TOP 5
// ==========================================
function RankingSidebar({ tools }: { tools: (Tool & { ranking: number })[] }) {
  if (tools.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <h3 className="text-sm font-bold text-foreground">TOP 5</h3>
        </div>
        <Link href="/rankings" className="text-[11px] text-primary font-medium">전체 →</Link>
      </div>
      <div className="space-y-1">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-primary-light/40 transition-colors"
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white shrink-0 ${
              tool.ranking === 1 ? 'bg-yellow-400' :
              tool.ranking === 2 ? 'bg-gray-400' :
              tool.ranking === 3 ? 'bg-amber-600' :
              'bg-gray-200 text-gray-500'
            }`}>
              {tool.ranking}
            </span>
            <span className="text-xs font-semibold text-foreground truncate flex-1">{tool.name}</span>
            <span className="text-[10px] font-bold text-primary">{(tool.hybrid_score || tool.ranking_score).toFixed(1)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 사이드바: 카테고리 퀵 링크
// ==========================================
function CategorySidebar() {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <h3 className="text-sm font-bold text-foreground mb-3">카테고리</h3>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-primary-light hover:text-primary transition-colors"
          >
            <DynamicIcon name={cat.icon} className="h-3 w-3" />
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 사이드바: AI 추천 위자드
// ==========================================
function WizardSidebar() {
  return (
    <div className="rounded-xl hero-gradient overflow-hidden">
      <div className="relative z-10 p-4 text-center">
        <p className="text-sm font-bold text-white">어떤 AI를 써야 할지 모르겠다면?</p>
        <Link
          href="/discover#wizard"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-xs font-bold text-primary hover:shadow-lg transition-all"
        >
          <Sparkles className="h-3.5 w-3.5" />
          맞춤 AI 추천
        </Link>
      </div>
    </div>
  );
}

// ==========================================
// 공통: 섹션 헤더
// ==========================================
function SectionHeader({ title, badge, href, linkText }: { title: string; badge?: React.ReactNode; href?: string; linkText?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-extrabold text-foreground flex items-center">
        {title}
        {badge}
      </h2>
      {href && linkText && (
        <Link href={href} className="text-xs font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-0.5">
          {linkText}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
