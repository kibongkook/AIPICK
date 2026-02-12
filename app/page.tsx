import Link from 'next/link';
import {
  ArrowRight, Sparkles, MessageSquare, BookOpen,
} from 'lucide-react';
import {
  MAIN_EDITOR_PICKS_COUNT,
  MAIN_PAGE_PURPOSES, SIDEBAR_CATEGORY_RANKINGS,
} from '@/lib/constants';
import type { Tool, CommunityPost } from '@/types';
import NewsletterForm from '@/components/newsletter/NewsletterForm';
import CategoryRankingSidebar from '@/components/ranking/CategoryRankingSidebar';
import type { CategoryRanking } from '@/components/ranking/CategoryRankingSidebar';
import PurposeCategoriesSidebar from '@/components/home/PurposeCategoriesSidebar';

import {
  getEditorPicks,
  getTools,
  getTopToolsByCategorySlug,
  getRecentCommunityPosts,
  getDailyPicks, getCommunityStats,
  getTrendingTools,
} from '@/lib/supabase/queries';

import HeroSimplified from '@/components/home/HeroSimplified';
import TodayUpdateSection from '@/components/home/TodayUpdateSection';
import EditorPickRotation from '@/components/home/EditorPickRotation';
import TrendingToolsRotation from '@/components/home/TrendingToolsRotation';
import CommunityPostsRotation from '@/components/home/CommunityPostsRotation';
import AINewsSection from '@/components/home/AINewsSection';
import CommunityStatsBanner from '@/components/home/CommunityStatsBanner';
import LeaderboardWidget from '@/components/user/LeaderboardWidget';
import { AI_RECIPES } from '@/data/recipes';
import RecipeCard from '@/components/recipe/RecipeCard';

// 사이드바 목적별 AI에 표시할 카테고리 5개
const SIDEBAR_PURPOSES = MAIN_PAGE_PURPOSES.slice(0, 5);

export default async function Home() {
  const [
    editorPicks, trendingTools,
    communityPosts, dailyPicks, communityStats,
    ...restArr
  ] = await Promise.all([
    getEditorPicks(MAIN_EDITOR_PICKS_COUNT),
    getTrendingTools(4),
    getRecentCommunityPosts(4),
    getDailyPicks(8),
    getCommunityStats(),
    // 사이드바 카테고리별 랭킹
    ...SIDEBAR_CATEGORY_RANKINGS.map(r => getTopToolsByCategorySlug(r.slug, 5)),
    // 사이드바 목적별 도구
    ...SIDEBAR_PURPOSES.map(cat => getTopToolsByCategorySlug(cat.slug, 4)),
  ]);

  const allTools = await getTools();
  const totalToolCount = allTools.length;

  // 사이드바 카테고리별 랭킹 매핑 (평점 순으로 정렬)
  const categoryRankings: CategoryRanking[] = SIDEBAR_CATEGORY_RANKINGS.map((r, i) => ({
    label: r.label,
    slug: r.slug,
    tools: [...(restArr[i] as Tool[])]
      .sort((a, b) => b.rating_avg - a.rating_avg)
      .map((t, rank) => ({ ...t, ranking: rank + 1 })),
  }));

  // 사이드바 목적별 도구 매핑
  const rankingCount = SIDEBAR_CATEGORY_RANKINGS.length;
  const purposeToolsByCategory: Record<string, Tool[]> = {};
  SIDEBAR_PURPOSES.forEach((cat, i) => {
    purposeToolsByCategory[cat.slug] = restArr[rankingCount + i] as Tool[];
  });

  return (
    <>
      {/* 1. 히어로 (2개 진입점: AI 찾기 + 커뮤니티) */}
      <HeroSimplified toolCount={totalToolCount} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 2단 레이아웃 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* 메인 콘텐츠 (2/3) */}
          <div className="lg:col-span-2 space-y-10">
            {/* 2. 커뮤니티 통계 배너 */}
            <CommunityStatsBanner {...communityStats} />

            {/* 3. AI 소개 + 커뮤니티 2x2 그리드 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TodayUpdateSection picks={dailyPicks} />
              <EditorPickRotation tools={editorPicks} />
              <TrendingToolsRotation tools={trendingTools} />
              <CommunityPostsRotation posts={communityPosts} />
            </div>

            {/* 4. AI 레시피 미리보기 */}
            <RecipePreviewSection />

            {/* 5. 커뮤니티 최신 글 */}
            {communityPosts.length > 0 && <CommunitySection posts={communityPosts} />}

            {/* 6. AI 뉴스 */}
            <AINewsSection />
          </div>

          {/* 사이드바 (1/3) */}
          <aside className="space-y-6">
            <CategoryRankingSidebar rankings={categoryRankings} />
            <PurposeCategoriesSidebar
              categories={SIDEBAR_PURPOSES.map(p => ({ slug: p.slug, title: p.title, icon: p.icon }))}
              toolsByCategory={purposeToolsByCategory}
            />
            <LeaderboardWidget />
            <WizardSidebar />
            <NewsletterForm />
          </aside>
        </div>
      </div>
    </>
  );
}

// ==========================================
// 커뮤니티
// ==========================================
function CommunitySection({ posts }: { posts: CommunityPost[] }) {
  return (
    <section>
      <SectionHeader
        title="커뮤니티"
        badge={<MessageSquare className="ml-1.5 h-4 w-4 text-primary" />}
        href="/community"
        linkText="전체 글 보기"
      />
      <p className="text-xs text-gray-400 mb-4 -mt-2">AI 활용 노하우를 공유하고 배워보세요</p>
      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/community/${post.id}`}
            className="block rounded-xl border border-border bg-white p-4 hover:border-primary hover:shadow-md transition-all"
          >
            <h4 className="font-semibold text-foreground mb-2 line-clamp-1">
              {post.title || post.content.slice(0, 50)}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.content}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>{post.user_name}</span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
              {post.like_count > 0 && (
                <>
                  <span>•</span>
                  <span>좋아요 {post.like_count}</span>
                </>
              )}
              {post.comment_count > 0 && (
                <>
                  <span>•</span>
                  <span>댓글 {post.comment_count}</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ==========================================
// AI 레시피 미리보기
// ==========================================
function RecipePreviewSection() {
  const featured = AI_RECIPES.slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section>
      <SectionHeader
        title="AI 레시피"
        badge={<BookOpen className="ml-1.5 h-4 w-4 text-primary" />}
        href="/recipes"
        linkText="전체 보기"
      />
      <p className="text-xs text-gray-400 mb-4 -mt-2">여러 AI를 조합해 원하는 결과물을 만드는 단계별 가이드</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((recipe) => (
          <RecipeCard key={recipe.slug} recipe={recipe} />
        ))}
      </div>
    </section>
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
