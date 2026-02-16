import type { CommunityPost } from '@/types';

import {
  getTools,
  getRecentCommunityPosts,
  getCommunityStats,
  getTrendingTools,
} from '@/lib/supabase/queries';

import TopRotationBanner from '@/components/home/TopRotationBanner';
import CommunityStatsBanner from '@/components/home/CommunityStatsBanner';
import RecipeCarousel from '@/components/home/RecipeCarousel';

export default async function Home() {
  const [
    trendingTools,
    communityPosts, communityStats,
  ] = await Promise.all([
    getTrendingTools(4),
    getRecentCommunityPosts(4),
    getCommunityStats(),
  ]);

  const allTools = await getTools();
  const totalToolCount = allTools.length;

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* 상태 표시 */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-gray-500">{totalToolCount}개 AI 서비스 분석 중</span>
        </div>

        {/* 단일 컬럼 레이아웃 (Reddit 스타일) */}
        <div className="space-y-10">
          {/* 2. 커뮤니티 통계 배너 */}
          <CommunityStatsBanner {...communityStats} />

          {/* 3. 상단 로테이션 배너 (오늘의 PICK, 급상승, 당신에게 맞는 AI) */}
          <TopRotationBanner
            trendingTools={trendingTools}
            allTools={allTools}
          />

          {/* 4. AI 레시피 미리보기 + 관련 커뮤니티 */}
          <RecipeCarousel communityPosts={communityPosts} />
        </div>
      </div>
    </>
  );
}

