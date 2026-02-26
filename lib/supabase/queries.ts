/* eslint-disable @typescript-eslint/no-explicit-any */
// ==========================================
// AIPICK 데이터 페칭 레이어
// Supabase 설정 시 실제 DB 사용, 미설정 시 seed.json 폴백
// ==========================================

import type {
  Tool, Category, JobCategory, EduLevel, UserType,
  JobToolRecommendation, EduToolRecommendation, PurposeToolRecommendation,
  News, Guide, NewsCategory, PurposeSlug, UserTypeSlug,
  ToolBenchmarkScore, ToolExternalScore, ToolPricingData, CategoryPopularity, ScoringWeight,
  CategoryShowcase, ToolShowcase, RoleShowcase, RoleUseCaseShowcase,
  DailyPick, CommunityPost, ToolUpdate, ToolUpdateType,
} from '@/types';
import { HERO_KEYWORDS } from '@/lib/constants';
import seedData from '@/data/seed.json';

// ==========================================
// 컬렉션 시드 타입 (seed.json 전용, tool_ids 배열 사용)
// ==========================================
export interface SeedCollection {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  description: string | null;
  is_public: boolean;
  like_count: number;
  tool_ids: string[];
  created_at: string;
  updated_at: string;
}

// ==========================================
// Supabase 연결 설정
// ==========================================

/** Supabase 환경변수가 설정되어 있는지 확인 */
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-supabase-url'
  );
}

/**
 * 서버 Supabase 클라이언트 가져오기
 * - 동적 임포트로 클라이언트 번들에 server.ts가 포함되는 것을 방지
 * - Supabase 미설정 시 즉시 null 반환
 * - 에러 발생 시 (클라이언트 측 호출 등) null 반환 → seed 폴백
 */
async function db() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { createClient } = await import('@/lib/supabase/server');
    return await createClient();
  } catch {
    return null;
  }
}

// ==========================================
// Seed 데이터 캐스팅
// ==========================================
const seedRaw = seedData as Record<string, unknown>;
const seed = {
  tools: seedData.tools as unknown as Tool[],
  categories: seedData.categories as unknown as Category[],
  tool_categories: seedRaw.tool_categories as any[] | undefined,
  // 새 2단계 분류
  user_types: seedRaw.user_types as UserType[] | undefined,
  purpose_tool_recommendations: seedRaw.purpose_tool_recommendations as PurposeToolRecommendation[] | undefined,
  // 레거시 호환
  job_categories: seedRaw.job_categories as JobCategory[] | undefined,
  edu_levels: seedRaw.edu_levels as EduLevel[] | undefined,
  job_tool_recommendations: seedRaw.job_tool_recommendations as JobToolRecommendation[] | undefined,
  edu_tool_recommendations: seedRaw.edu_tool_recommendations as EduToolRecommendation[] | undefined,
  // 기타 데이터
  news: seedRaw.news as News[] | undefined,
  guides: seedRaw.guides as Guide[] | undefined,
  collections: seedRaw.collections as SeedCollection[] | undefined,
  tool_benchmark_scores: seedRaw.tool_benchmark_scores as ToolBenchmarkScore[] | undefined,
  tool_external_scores: seedRaw.tool_external_scores as ToolExternalScore[] | undefined,
  tool_updates: seedRaw.tool_updates as ToolUpdate[] | undefined,
  category_showcases: seedRaw.category_showcases as CategoryShowcase[] | undefined,
  tool_showcases: seedRaw.tool_showcases as ToolShowcase[] | undefined,
  role_showcases: seedRaw.role_showcases as RoleShowcase[] | undefined,
  role_use_cases: seedRaw.role_use_cases as RoleUseCaseShowcase[] | undefined,
};

// ==========================================
// 다중 카테고리 헬퍼 함수
// ==========================================

/**
 * Seed 데이터에서 도구에 카테고리 정보를 첨부
 */
function attachCategoriesToTools(tools: Tool[]): Tool[] {
  if (!seed.tool_categories) {
    // tool_categories가 없으면 레거시 category_id 사용
    return tools.map(tool => {
      const category = seed.categories.find(c => c.id === (tool as any).category_id);
      return {
        ...tool,
        categories: category ? [{ ...category, is_primary: true }] : [],
        primary_category_id: (tool as any).category_id
      };
    });
  }

  return tools.map(tool => {
    const toolCategoryMappings = seed.tool_categories!.filter(tc => tc.tool_id === tool.id);

    // tool_categories에 매핑이 없으면 레거시 category_id로 폴백
    if (toolCategoryMappings.length === 0) {
      const category = seed.categories.find(c => c.id === (tool as any).category_id);
      return {
        ...tool,
        categories: category ? [{ ...category, is_primary: true }] : [],
        primary_category_id: (tool as any).category_id
      };
    }

    const categories = toolCategoryMappings
      .map(tc => {
        const category = seed.categories.find(c => c.id === tc.category_id);
        return category ? { ...category, is_primary: tc.is_primary } : null;
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a!.is_primary !== b!.is_primary) return b!.is_primary ? 1 : -1;
        return 0;
      }) as any[];

    const primaryCategory = categories.find(c => c.is_primary);

    return {
      ...tool,
      categories,
      primary_category_id: primaryCategory?.id
    };
  });
}

/**
 * Supabase에서 도구 조회 시 카테고리 JOIN 쿼리
 */
const TOOL_WITH_CATEGORIES_SELECT = `
  *,
  tool_categories!inner (
    category_id,
    is_primary,
    sort_order,
    categories:category_id (
      id,
      name,
      slug,
      icon,
      description,
      color,
      sort_order,
      created_at
    )
  )
`;

// ==========================================
// 카테고리
// ==========================================
export async function getCategories(): Promise<Category[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    if (data?.length) return data as Category[];
  }
  return seed.categories.sort((a, b) => a.sort_order - b.sort_order);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase.from('categories').select('*').eq('slug', slug).single();
    if (data) return data as Category;
  }
  return seed.categories.find((c) => c.slug === slug);
}

// ==========================================
// AI 서비스 (Tools)
// ==========================================
export async function getTools(): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    // TODO: Supabase multi-category query - 임시로 기본 쿼리 사용
    const { data } = await supabase.from('tools').select('*');
    if (data?.length) return data as Tool[];
  }
  return attachCategoriesToTools(seed.tools);
}

export async function getToolById(id: string): Promise<Tool | undefined> {
  const supabase = await db();
  if (supabase) {
    // TODO: Supabase multi-category query - 임시로 기본 쿼리 사용
    const { data } = await supabase.from('tools').select('*').eq('id', id).single();
    if (data) return data as Tool;
  }
  const tool = seed.tools.find((t) => t.id === id);
  if (!tool) return undefined;
  return attachCategoriesToTools([tool])[0];
}

export async function getToolBySlug(slug: string): Promise<Tool | undefined> {
  const supabase = await db();
  if (supabase) {
    // TODO: Supabase multi-category query
    const { data } = await supabase.from('tools').select('*').eq('slug', slug).single();
    if (data) return data as Tool;
  }
  const tool = seed.tools.find((t) => t.slug === slug);
  if (!tool) return undefined;
  return attachCategoriesToTools([tool])[0];
}

export async function getToolsByCategory(categoryId: string): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    // TODO: Supabase multi-category query using tool_categories table
    const { data } = await supabase
      .from('tool_categories')
      .select('tool_id, tools (*)')
      .eq('category_id', categoryId);
    if (data?.length) {
      const tools = data.map((item: any) => item.tools).filter(Boolean);
      return tools as Tool[];
    }
  }

  // Seed data에서 tool_categories를 통해 필터링
  if (seed.tool_categories) {
    const toolIds = seed.tool_categories
      .filter(tc => tc.category_id === categoryId)
      .map(tc => tc.tool_id);
    const tools = seed.tools.filter(t => toolIds.includes(t.id));
    return attachCategoriesToTools(tools).sort((a, b) => b.visit_count - a.visit_count);
  }

  // 레거시: category_id 사용
  return attachCategoriesToTools(
    seed.tools.filter((t) => (t as any).category_id === categoryId)
  ).sort((a, b) => b.visit_count - a.visit_count);
}

export async function getEditorPicks(limit = 6): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    // TODO: Supabase multi-category query
    const { data } = await supabase
      .from('tools')
      .select('*')
      .eq('is_editor_pick', true)
      .order('rating_avg', { ascending: false })
      .limit(limit);
    if (data?.length) return data as Tool[];
  }
  return attachCategoriesToTools(
    seed.tools
      .filter((t) => t.is_editor_pick)
      .sort((a, b) => b.rating_avg - a.rating_avg)
      .slice(0, limit)
  );
}

export async function getSimilarTools(tool: Tool, limit = 3): Promise<Tool[]> {
  const supabase = await db();
  const primaryCategoryId = tool.categories?.find(c => c.is_primary)?.id || tool.categories?.[0]?.id;

  if (supabase && primaryCategoryId) {
    // Find tools in the same primary category
    const { data: toolIds } = await supabase
      .from('tool_categories')
      .select('tool_id')
      .eq('category_id', primaryCategoryId)
      .eq('is_primary', true);

    if (toolIds?.length) {
      const ids = toolIds.map(tc => tc.tool_id).filter(id => id !== tool.id);
      const { data } = await supabase
        .from('tools')
        .select('*')
        .in('id', ids)
        .order('rating_avg', { ascending: false })
        .limit(limit);
      if (data?.length) return data as Tool[];
    }
  }

  // Seed fallback
  if (seed.tool_categories && primaryCategoryId) {
    const toolIds = seed.tool_categories
      .filter(tc => tc.category_id === primaryCategoryId && tc.is_primary)
      .map(tc => tc.tool_id)
      .filter(id => id !== tool.id);
    const tools = seed.tools.filter(t => toolIds.includes(t.id));
    return attachCategoriesToTools(tools)
      .sort((a, b) => b.rating_avg - a.rating_avg)
      .slice(0, limit);
  }

  // Legacy fallback
  return attachCategoriesToTools(
    seed.tools
      .filter((t) => (t as any).category_id === primaryCategoryId && t.id !== tool.id)
      .sort((a, b) => b.rating_avg - a.rating_avg)
      .slice(0, limit)
  );
}

export async function getLatestTools(limit = 4): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    // TODO: Supabase multi-category query
    const { data } = await supabase
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (data?.length) return data as Tool[];
  }
  return attachCategoriesToTools(
    [...seed.tools]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  );
}

// ==========================================
// 급상승 AI (트렌딩)
// ==========================================
export async function getTrendingTools(limit = 4): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tools')
      .select('*')
      .eq('trend_direction', 'up')
      .order('trend_magnitude', { ascending: false })
      .limit(limit);
    if (data?.length) return data as Tool[];
  }
  // seed fallback: trend_direction='up' 우선, 없으면 ranking_score 상위
  const trending = [...seed.tools]
    .filter(t => t.trend_direction === 'up')
    .sort((a, b) => (b.trend_magnitude ?? 0) - (a.trend_magnitude ?? 0));
  if (trending.length >= limit) return trending.slice(0, limit);

  // trending 부족 시 ranking_score 상위로 채움
  const usedIds = new Set(trending.map(t => t.id));
  const topRanked = [...seed.tools]
    .filter(t => !usedIds.has(t.id))
    .sort((a, b) => b.ranking_score - a.ranking_score);
  return [...trending, ...topRanked].slice(0, limit);
}

// ==========================================
// 카테고리 slug 기반 상위 도구
// ==========================================
export async function getTopToolsByCategorySlug(slug: string, limit = 4): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();
    if (cat) {
      const { data } = await supabase
        .from('tools')
        .select('*')
        .eq('category_id', cat.id)
        .order('ranking_score', { ascending: false })
        .limit(limit);
      if (data?.length) return data as Tool[];
    }
  }
  const seedCat = seed.categories.find((c) => c.slug === slug);
  if (!seedCat) return [];

  let tools = [...seed.tools];
  if (seed.tool_categories) {
    const toolIds = seed.tool_categories
      .filter(tc => tc.category_id === seedCat.id)
      .map(tc => tc.tool_id);
    tools = tools.filter((t) => toolIds.includes(t.id));
  } else {
    tools = tools.filter((t) => (t as any).category_id === seedCat.id);
  }

  return attachCategoriesToTools(tools)
    .sort((a, b) => b.ranking_score - a.ranking_score)
    .slice(0, limit);
}

// ==========================================
// 랭킹
// ==========================================
export async function getRankings(categorySlug?: string): Promise<(Tool & { ranking: number })[]> {
  const supabase = await db();
  if (supabase) {
    let query = supabase.from('tools').select('*');

    if (categorySlug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
      if (cat) {
        const { data: toolIds } = await supabase
          .from('tool_categories')
          .select('tool_id')
          .eq('category_id', cat.id);

        if (toolIds?.length) {
          const ids = toolIds.map(tc => tc.tool_id);
          query = query.in('id', ids);
        }
      }
    }

    // 사용자 평점 기준 정렬 (2축 평가 시스템)
    const { data } = await query.order('rating_avg', { ascending: false });
    if (data?.length) {
      return data.map((tool: Tool, index: number) => ({ ...tool, ranking: index + 1 }));
    }
  }

  // Seed fallback
  let tools = [...seed.tools];
  if (categorySlug) {
    const cat = seed.categories.find((c) => c.slug === categorySlug);
    if (cat && seed.tool_categories) {
      const toolIds = seed.tool_categories
        .filter(tc => tc.category_id === cat.id)
        .map(tc => tc.tool_id);
      tools = tools.filter((t) => toolIds.includes(t.id));
    } else if (cat) {
      tools = tools.filter((t) => (t as any).category_id === cat.id);
    }
  }

  const toolsWithCategories = attachCategoriesToTools(tools);

  return toolsWithCategories
    .sort((a, b) => {
      // 사용자 평점 기준 정렬
      const ratingA = a.rating_avg || 0;
      const ratingB = b.rating_avg || 0;
      if (ratingA !== ratingB) return ratingB - ratingA;

      // 평점 같으면 리뷰 수로
      const reviewA = a.review_count || 0;
      const reviewB = b.review_count || 0;
      if (reviewA !== reviewB) return reviewB - reviewA;

      // 리뷰도 같으면 방문수
      const visitA = a.visit_count || 0;
      const visitB = b.visit_count || 0;
      if (visitA !== visitB) return visitB - visitA;

      return a.name.localeCompare(b.name);
    })
    .map((tool, index) => ({ ...tool, ranking: index + 1 }));
}

/** 벤치마크 기준 랭킹 (성능순 탭) — LLM 도구만 */
export async function getRankingsByBenchmark(categorySlug?: string): Promise<(Tool & { ranking: number; elo_rating: number | null; overall_score: number | null; speed_tps: number | null })[]> {
  const supabase = await db();

  // 벤치마크 데이터가 있는 도구만 조회
  let tools: Tool[] = [];

  if (supabase) {
    let query = supabase.from('tools').select('*').eq('has_benchmark_data', true);

    if (categorySlug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
      if (cat) {
        const { data: toolIds } = await supabase
          .from('tool_categories')
          .select('tool_id')
          .eq('category_id', cat.id);
        if (toolIds?.length) {
          query = query.in('id', toolIds.map(tc => tc.tool_id));
        }
      }
    }

    const { data } = await query;
    if (data?.length) tools = data as Tool[];
  }

  // Seed fallback
  if (!tools.length) {
    let seedTools = seed.tools.filter(t => t.has_benchmark_data);
    if (categorySlug) {
      const cat = seed.categories.find(c => c.slug === categorySlug);
      if (cat && seed.tool_categories) {
        const toolIds = seed.tool_categories
          .filter(tc => tc.category_id === cat.id)
          .map(tc => tc.tool_id);
        seedTools = seedTools.filter(t => toolIds.includes(t.id));
      }
    }
    tools = attachCategoriesToTools(seedTools);
  }

  // 벤치마크 데이터 조인
  const toolIds = tools.map(t => t.id);
  let benchmarkScores: typeof seed.tool_benchmark_scores = [];

  if (supabase && toolIds.length) {
    const { data: dbBenchmarks } = await supabase
      .from('tool_benchmark_scores')
      .select('*')
      .in('tool_id', toolIds);
    if (dbBenchmarks?.length) {
      benchmarkScores = dbBenchmarks;
    }
  }

  // Supabase에 없으면 seed 폴백
  if (!benchmarkScores.length) {
    benchmarkScores = (seed.tool_benchmark_scores || []).filter(b => toolIds.includes(b.tool_id));
  }

  // tool_id → benchmarks 매핑 (O(n) 조회를 위해 Map 사용)
  const benchmarkMap = new Map<string, typeof benchmarkScores>();
  for (const b of benchmarkScores) {
    if (!benchmarkMap.has(b.tool_id)) benchmarkMap.set(b.tool_id, []);
    benchmarkMap.get(b.tool_id)!.push(b);
  }

  const toolsWithBenchmarks = tools.map(tool => {
    const benchmarks = benchmarkMap.get(tool.id) || [];
    const bestBenchmark = benchmarks.sort((a, b) => (b.elo_rating || 0) - (a.elo_rating || 0))[0];
    return {
      ...tool,
      elo_rating: bestBenchmark?.elo_rating ?? null,
      overall_score: bestBenchmark?.overall_score ?? null,
      speed_tps: bestBenchmark?.speed_tps ?? null,
    };
  });

  // Elo 기준 정렬
  return toolsWithBenchmarks
    .sort((a, b) => {
      const eloA = a.elo_rating || 0;
      const eloB = b.elo_rating || 0;
      if (eloA !== eloB) return eloB - eloA;
      const scoreA = a.overall_score || 0;
      const scoreB = b.overall_score || 0;
      return scoreB - scoreA;
    })
    .map((tool, index) => ({ ...tool, ranking: index + 1 }));
}

/** 가장 많이 사용되는 AI (방문수 기준) */
export async function getMostUsedTools(limit = 5): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tools')
      .select('*')
      .order('visit_count', { ascending: false })
      .limit(limit);
    if (data) return data;
  }
  return [...seed.tools].sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0)).slice(0, limit);
}

/** 최근 가장 인기 있는 AI (주간 증가량 기준) */
export async function getRecentlyPopularTools(limit = 5): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tools')
      .select('*')
      .order('weekly_visit_delta', { ascending: false })
      .limit(limit);
    if (data) return data;
  }
  return [...seed.tools].sort((a, b) => (b.weekly_visit_delta || 0) - (a.weekly_visit_delta || 0)).slice(0, limit);
}

/** 평가 점수가 가장 높은 AI */
export async function getTopRatedTools(limit = 5): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tools')
      .select('*')
      .gte('review_count', 3) // 최소 3개 이상의 리뷰가 있는 도구만
      .order('rating_avg', { ascending: false })
      .limit(limit);
    if (data) return data;
  }
  return [...seed.tools]
    .filter(t => (t.review_count || 0) >= 3)
    .sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0))
    .slice(0, limit);
}

/** 급상승 AI (트렌드 크기 기준) */
export async function getFastestGrowingTools(limit = 5): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tools')
      .select('*')
      .eq('trend_direction', 'up')
      .order('trend_magnitude', { ascending: false })
      .limit(limit);
    if (data) return data;
  }
  return [...seed.tools]
    .filter(t => t.trend_direction === 'up')
    .sort((a, b) => (b.trend_magnitude || 0) - (a.trend_magnitude || 0))
    .slice(0, limit);
}

/** 최근 커뮤니티 글 (V2) */
export async function getRecentCommunityPosts(limit = 5) {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('community_posts')
      .select('*')
      .is('parent_id', null)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (data) return data;
  }
  // localStorage fallback
  if (typeof window !== 'undefined') {
    const localPosts = JSON.parse(localStorage.getItem('aipick_community_v2') || '[]');
    return localPosts.slice(0, limit);
  }
  return [];
}

export async function getTrending(limit = 10): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    // 트렌드 방향이 'up'인 도구를 magnitude 순으로
    const { data } = await supabase
      .from('tools')
      .select('*')
      .eq('trend_direction', 'up')
      .order('trend_magnitude', { ascending: false })
      .limit(limit);
    if (data?.length) return data as Tool[];

    // 폴백: 기존 weekly_visit_delta 방식
    const { data: fallback } = await supabase
      .from('tools')
      .select('*')
      .order('weekly_visit_delta', { ascending: false })
      .limit(limit);
    if (fallback?.length) return fallback as Tool[];
  }
  return [...seed.tools]
    .sort((a, b) => {
      // trend_magnitude가 있으면 우선 사용
      const aMag = (a as Tool).trend_magnitude ?? 0;
      const bMag = (b as Tool).trend_magnitude ?? 0;
      if (aMag !== bMag) return bMag - aMag;

      const aDelta = a.weekly_visit_delta || 0;
      const bDelta = b.weekly_visit_delta || 0;
      if (aDelta !== bDelta) return bDelta - aDelta;

      // weekly_visit_delta가 0이면 visit_count로 정렬 (전체 인기도)
      const aVisit = a.visit_count || 0;
      const bVisit = b.visit_count || 0;
      if (aVisit !== bVisit) return bVisit - aVisit;

      // visit도 같으면 rating_avg로 정렬
      const aRating = a.rating_avg || 0;
      const bRating = b.rating_avg || 0;
      return bRating - aRating;
    })
    .slice(0, limit);
}

// ==========================================
// 직군별 추천
// ==========================================
export async function getJobCategories(): Promise<JobCategory[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase.from('job_categories').select('*').order('sort_order');
    if (data?.length) return data as JobCategory[];
  }
  return (seed.job_categories || []).sort((a, b) => a.sort_order - b.sort_order);
}

export async function getJobCategoryBySlug(slug: string): Promise<JobCategory | undefined> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase.from('job_categories').select('*').eq('slug', slug).single();
    if (data) return data as JobCategory;
  }
  return (seed.job_categories || []).find((j) => j.slug === slug);
}

export async function getJobRecommendations(jobSlug: string): Promise<JobToolRecommendation[]> {
  const supabase = await db();
  if (supabase) {
    const { data: job } = await supabase
      .from('job_categories')
      .select('id')
      .eq('slug', jobSlug)
      .single();
    if (job) {
      const { data: recs } = await supabase
        .from('job_tool_recommendations')
        .select('*, tool:tools(*)')
        .eq('job_category_id', job.id)
        .order('sort_order');
      if (recs?.length) return recs as JobToolRecommendation[];
    }
  }

  // Seed fallback
  const seedJob = (seed.job_categories || []).find((j) => j.slug === jobSlug);
  if (!seedJob) return [];
  const recs = (seed.job_tool_recommendations || [])
    .filter((r) => r.job_category_id === seedJob.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  return recs.map((rec) => ({
    ...rec,
    tool: seed.tools.find((t) => t.id === rec.tool_id),
  }));
}

// ==========================================
// 학년별 추천
// ==========================================
export async function getEduLevels(): Promise<EduLevel[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase.from('edu_levels').select('*').order('sort_order');
    if (data?.length) return data as EduLevel[];
  }
  return (seed.edu_levels || []).sort((a, b) => a.sort_order - b.sort_order);
}

export async function getEduLevelBySlug(slug: string): Promise<EduLevel | undefined> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase.from('edu_levels').select('*').eq('slug', slug).single();
    if (data) return data as EduLevel;
  }
  return (seed.edu_levels || []).find((e) => e.slug === slug);
}

export async function getEduRecommendations(levelSlug: string): Promise<EduToolRecommendation[]> {
  const supabase = await db();
  if (supabase) {
    const { data: level } = await supabase
      .from('edu_levels')
      .select('id')
      .eq('slug', levelSlug)
      .single();
    if (level) {
      const { data: recs } = await supabase
        .from('edu_tool_recommendations')
        .select('*, tool:tools(*)')
        .eq('edu_level_id', level.id)
        .order('sort_order');
      if (recs?.length) return recs as EduToolRecommendation[];
    }
  }

  // Seed fallback
  const seedLevel = (seed.edu_levels || []).find((e) => e.slug === levelSlug);
  if (!seedLevel) return [];
  const recs = (seed.edu_tool_recommendations || [])
    .filter((r) => r.edu_level_id === seedLevel.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  return recs.map((rec) => ({
    ...rec,
    tool: seed.tools.find((t) => t.id === rec.tool_id),
  }));
}

// ==========================================
// 전체 추천 데이터 (추천 엔진용) - 레거시
// ==========================================
export async function getAllJobRecommendations(): Promise<JobToolRecommendation[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('job_tool_recommendations')
      .select('*');
    if (data?.length) return data as JobToolRecommendation[];
  }
  return seed.job_tool_recommendations || [];
}

export async function getAllEduRecommendations(): Promise<EduToolRecommendation[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('edu_tool_recommendations')
      .select('*');
    if (data?.length) return data as EduToolRecommendation[];
  }
  return seed.edu_tool_recommendations || [];
}

// ==========================================
// 2단계 분류: 사용자 타입
// ==========================================
export async function getUserTypes(): Promise<UserType[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase.from('user_types').select('*').order('sort_order');
    if (data?.length) return data as UserType[];
  }
  return (seed.user_types || []).sort((a, b) => a.sort_order - b.sort_order);
}

export async function getUserTypeBySlug(slug: string): Promise<UserType | undefined> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase.from('user_types').select('*').eq('slug', slug).single();
    if (data) return data as UserType;
  }
  return (seed.user_types || []).find((u) => u.slug === slug);
}

// ==========================================
// 2단계 분류: 목적별 도구 추천
// ==========================================
export async function getPurposeRecommendations(
  purposeSlug: PurposeSlug,
  userTypeSlug?: UserTypeSlug
): Promise<PurposeToolRecommendation[]> {
  const supabase = await db();
  if (supabase) {
    let query = supabase
      .from('purpose_tool_recommendations')
      .select('*, tool:tools(*)')
      .eq('purpose_slug', purposeSlug)
      .order('sort_order');
    if (userTypeSlug) {
      query = query.eq('user_type_slug', userTypeSlug);
    }
    const { data } = await query;
    if (data?.length) return data as PurposeToolRecommendation[];
  }

  // Seed fallback
  let recs = (seed.purpose_tool_recommendations || [])
    .filter((r) => r.purpose_slug === purposeSlug);
  if (userTypeSlug) {
    recs = recs.filter((r) => r.user_type_slug === userTypeSlug);
  }
  recs.sort((a, b) => a.sort_order - b.sort_order);
  return recs.map((rec) => ({
    ...rec,
    tool: seed.tools.find((t) => t.id === rec.tool_id),
  }));
}

export async function getAllPurposeRecommendations(): Promise<PurposeToolRecommendation[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('purpose_tool_recommendations')
      .select('*');
    if (data?.length) return data as PurposeToolRecommendation[];
  }
  return seed.purpose_tool_recommendations || [];
}

// ==========================================
// 목적(Purpose) slug 기반 도구 조회
// ==========================================
export async function getToolsByPurpose(purposeSlug: string, limit?: number): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', purposeSlug)
      .single();
    if (cat) {
      let query = supabase
        .from('tools')
        .select('*')
        .eq('category_id', cat.id)
        .order('ranking_score', { ascending: false });
      if (limit) query = query.limit(limit);
      const { data } = await query;
      if (data?.length) return data as Tool[];
    }
  }

  // Seed fallback: find category by slug
  const seedCat = seed.categories.find((c) => c.slug === purposeSlug);
  if (!seedCat) return [];

  let tools = [...seed.tools];
  if (seed.tool_categories) {
    const toolIds = seed.tool_categories
      .filter(tc => tc.category_id === seedCat.id)
      .map(tc => tc.tool_id);
    tools = tools.filter(t => toolIds.includes(t.id));
  } else {
    tools = tools.filter((t) => (t as any).category_id === seedCat.id);
  }

  const toolsWithCategories = attachCategoriesToTools(tools).sort((a, b) => b.ranking_score - a.ranking_score);
  return limit ? toolsWithCategories.slice(0, limit) : toolsWithCategories;
}

// ==========================================
// 검색 + 필터
// ==========================================
export interface SearchFilters {
  query?: string;
  pricing?: string[];
  category?: string[];        // purpose slugs (new) or legacy category slugs
  purpose?: string[];          // explicit purpose filter
  user_type?: string;          // user type filter
  supports_korean?: boolean;
  min_rating?: number;
  job?: string;                // 레거시 호환
  edu?: string;                // 레거시 호환
  sort?: 'popular' | 'rating' | 'latest' | 'free_first';
}

export async function searchTools(filters: SearchFilters): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    try {
      let query = supabase.from('tools').select('*');

      if (filters.query) {
        const q = `%${filters.query}%`;
        query = query.or(`name.ilike.${q},description.ilike.${q}`);
      }

      if (filters.pricing?.length) {
        query = query.in('pricing_type', filters.pricing);
      }

      if (filters.category?.length) {
        const { data: cats } = await supabase
          .from('categories')
          .select('id')
          .in('slug', filters.category);
        if (cats?.length) {
          query = query.in('category_id', cats.map((c: { id: string }) => c.id));
        }
      }

      if (filters.supports_korean) {
        query = query.eq('supports_korean', true);
      }

      if (filters.min_rating) {
        query = query.gte('rating_avg', filters.min_rating);
      }

      if (filters.job) {
        const { data: jobCat } = await supabase
          .from('job_categories')
          .select('id')
          .eq('slug', filters.job)
          .single();
        if (jobCat) {
          const { data: jobRecs } = await supabase
            .from('job_tool_recommendations')
            .select('tool_id')
            .eq('job_category_id', jobCat.id);
          if (jobRecs?.length) {
            query = query.in('id', jobRecs.map((r: { tool_id: string }) => r.tool_id));
          }
        }
      }

      if (filters.edu) {
        const { data: eduLevel } = await supabase
          .from('edu_levels')
          .select('id')
          .eq('slug', filters.edu)
          .single();
        if (eduLevel) {
          const { data: eduRecs } = await supabase
            .from('edu_tool_recommendations')
            .select('tool_id')
            .eq('edu_level_id', eduLevel.id);
          if (eduRecs?.length) {
            query = query.in('id', eduRecs.map((r: { tool_id: string }) => r.tool_id));
          }
        }
      }

      switch (filters.sort) {
        case 'rating':
          query = query.order('rating_avg', { ascending: false });
          break;
        case 'latest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('ranking_score', { ascending: false });
      }

      const { data } = await query;
      if (data?.length) {
        const results = data as Tool[];
        if (filters.sort === 'free_first') {
          const order: Record<string, number> = { Free: 0, Freemium: 1, Paid: 2 };
          results.sort((a, b) => (order[a.pricing_type] ?? 2) - (order[b.pricing_type] ?? 2) || b.ranking_score - a.ranking_score);
        }
        return results;
      }
    } catch {
      // Supabase 에러 시 seed fallback
    }
  }

  return searchToolsSeed(filters);
}

/** Seed 데이터 기반 검색 (폴백용) */
function searchToolsSeed(filters: SearchFilters): Tool[] {
  let results = [...seed.tools];

  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  if (filters.pricing && filters.pricing.length > 0) {
    results = results.filter((t) =>
      filters.pricing!.some((p) => t.pricing_type.toLowerCase() === p.toLowerCase())
    );
  }

  if (filters.category && filters.category.length > 0) {
    const catIds = filters.category
      .map((slug) => seed.categories.find((c) => c.slug === slug)?.id)
      .filter(Boolean);
    results = results.filter((t) =>
      t.categories?.some(c => catIds.includes(c.id)) ||
      catIds.includes((t as any).category_id) // Legacy fallback
    );
  }

  if (filters.supports_korean) {
    results = results.filter((t) => t.supports_korean);
  }

  if (filters.min_rating) {
    results = results.filter((t) => t.rating_avg >= filters.min_rating!);
  }

  if (filters.job) {
    const job = (seed.job_categories || []).find((j) => j.slug === filters.job);
    if (job) {
      const jobToolIds = (seed.job_tool_recommendations || [])
        .filter((r) => r.job_category_id === job.id)
        .map((r) => r.tool_id);
      results = results.filter((t) => jobToolIds.includes(t.id));
    }
  }

  if (filters.edu) {
    const eduLevel = (seed.edu_levels || []).find((e) => e.slug === filters.edu);
    if (eduLevel) {
      const eduToolIds = (seed.edu_tool_recommendations || [])
        .filter((r) => r.edu_level_id === eduLevel.id)
        .map((r) => r.tool_id);
      results = results.filter((t) => eduToolIds.includes(t.id));
    }
  }

  switch (filters.sort) {
    case 'rating':
      results.sort((a, b) => b.rating_avg - a.rating_avg);
      break;
    case 'latest':
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'free_first':
      results.sort((a, b) => {
        const order: Record<string, number> = { Free: 0, Freemium: 1, Paid: 2 };
        return (order[a.pricing_type] ?? 2) - (order[b.pricing_type] ?? 2) || b.ranking_score - a.ranking_score;
      });
      break;
    default:
      results.sort((a, b) => (b.ranking_score || b.visit_count) - (a.ranking_score || a.visit_count));
  }

  return results;
}

export async function getAutocompleteSuggestions(query: string, limit = 5): Promise<Tool[]> {
  if (!query || query.length < 1) return [];

  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tools')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('visit_count', { ascending: false })
      .limit(limit);
    if (data?.length) return data as Tool[];
  }

  const q = query.toLowerCase();
  return seed.tools
    .filter((t) => t.name.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q)))
    .sort((a, b) => b.visit_count - a.visit_count)
    .slice(0, limit);
}

// ==========================================
// 뉴스
// ==========================================
export async function getNews(limit?: number, category?: NewsCategory): Promise<News[]> {
  const supabase = await db();
  if (supabase) {
    let query = supabase.from('news').select('*').order('published_at', { ascending: false });
    if (category) query = query.eq('category', category);
    if (limit) query = query.limit(limit);
    const { data } = await query;
    if (data?.length) return data as News[];
  }

  let news = [...(seed.news || [])]
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  if (category) news = news.filter((n) => n.category === category);
  return limit ? news.slice(0, limit) : news;
}

export async function getNewsById(id: string): Promise<News | undefined> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase.from('news').select('*').eq('id', id).single();
    if (data) return data as News;
  }
  return (seed.news || []).find((n) => n.id === id);
}

export async function getHotNews(limit = 5): Promise<News[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('news')
      .select('*')
      .order('view_count', { ascending: false })
      .limit(limit);
    if (data?.length) return data as News[];
  }
  return [...(seed.news || [])]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, limit);
}

// ==========================================
// 가이드
// ==========================================
export async function getGuides(category?: string): Promise<Guide[]> {
  const supabase = await db();
  if (supabase) {
    let query = supabase.from('guides').select('*').order('created_at', { ascending: false });
    if (category) query = query.eq('category', category);
    const { data } = await query;
    if (data?.length) return data as Guide[];
  }

  let guides = [...(seed.guides || [])];
  if (category) guides = guides.filter((g) => g.category === category);
  return guides.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getGuideBySlug(slug: string): Promise<Guide | undefined> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase.from('guides').select('*').eq('slug', slug).single();
    if (data) return data as Guide;
  }
  return (seed.guides || []).find((g) => g.slug === slug);
}

export async function getGuidesByJob(jobId: string): Promise<Guide[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('guides')
      .select('*')
      .eq('related_job_id', jobId)
      .order('created_at', { ascending: false });
    if (data?.length) return data as Guide[];
  }
  return (seed.guides || []).filter((g) => g.related_job_id === jobId);
}

export async function getGuidesByEdu(eduId: string): Promise<Guide[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('guides')
      .select('*')
      .eq('related_edu_id', eduId)
      .order('created_at', { ascending: false });
    if (data?.length) return data as Guide[];
  }
  return (seed.guides || []).filter((g) => g.related_edu_id === eduId);
}

// ==========================================
// 컬렉션
// ==========================================
export async function getCollections(): Promise<(SeedCollection & { tools: Tool[] })[]> {
  const supabase = await db();
  if (supabase) {
    const { data: collections } = await supabase
      .from('collections')
      .select('*, collection_items(*, tool:tools(*))')
      .eq('is_public', true)
      .order('like_count', { ascending: false });
    if (collections?.length) {
      return collections.map((c: Record<string, unknown>) => ({
        ...c,
        tool_ids: ((c.collection_items as { tool_id: string }[]) || []).map((i) => i.tool_id),
        tools: ((c.collection_items as { tool: Tool }[]) || []).map((i) => i.tool).filter(Boolean),
      })) as (SeedCollection & { tools: Tool[] })[];
    }
  }

  return (seed.collections || [])
    .filter((c) => c.is_public)
    .sort((a, b) => b.like_count - a.like_count)
    .map((c) => ({
      ...c,
      tools: c.tool_ids.map((id) => seed.tools.find((t) => t.id === id)).filter(Boolean) as Tool[],
    }));
}

export async function getCollectionById(id: string): Promise<(SeedCollection & { tools: Tool[] }) | undefined> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('collections')
      .select('*, collection_items(*, tool:tools(*))')
      .eq('id', id)
      .single();
    if (data) {
      const items = (data.collection_items as { tool_id: string; tool: Tool }[]) || [];
      return {
        ...data,
        tool_ids: items.map((i) => i.tool_id),
        tools: items.map((i) => i.tool).filter(Boolean),
      } as SeedCollection & { tools: Tool[] };
    }
  }

  const c = (seed.collections || []).find((col) => col.id === id);
  if (!c) return undefined;
  return {
    ...c,
    tools: c.tool_ids.map((tid) => seed.tools.find((t) => t.id === tid)).filter(Boolean) as Tool[],
  };
}

// ==========================================
// 하이브리드 스코어링 & 외부 데이터
// ==========================================

/**
 * 히어로 키워드를 카테고리 인기순으로 정렬하여 반환합니다.
 * DB에 category_popularity 데이터가 없으면 기본 순서를 반환합니다.
 */
export async function getHeroKeywordsOrdered(): Promise<typeof HERO_KEYWORDS[number][]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('category_popularity')
      .select('category_slug, popularity_score')
      .eq('period', 'weekly')
      .order('popularity_score', { ascending: false });

    if (data?.length) {
      const orderMap = new Map(data.map((d: { category_slug: string; popularity_score: number }, i: number) => [d.category_slug, i]));
      return [...HERO_KEYWORDS].sort((a, b) => {
        const aOrder = orderMap.get(a.slug) ?? 999;
        const bOrder = orderMap.get(b.slug) ?? 999;
        return aOrder - bOrder;
      });
    }
  }

  return [...HERO_KEYWORDS];
}

/**
 * 도구의 벤치마크 점수를 조회합니다.
 */
export async function getToolBenchmarks(toolId: string): Promise<ToolBenchmarkScore[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tool_benchmark_scores')
      .select('*')
      .eq('tool_id', toolId);
    if (data?.length) return data as ToolBenchmarkScore[];
  }
  // Seed fallback
  return (seed.tool_benchmark_scores || []).filter((b) => b.tool_id === toolId);
}

/**
 * 도구의 외부 점수 목록을 조회합니다.
 */
export async function getToolExternalScores(toolId: string): Promise<ToolExternalScore[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tool_external_scores')
      .select('*')
      .eq('tool_id', toolId);
    if (data?.length) return data as ToolExternalScore[];
  }
  // Seed fallback
  return (seed.tool_external_scores || []).filter((s) => s.tool_id === toolId);
}

/**
 * 도구의 외부 가격 데이터를 조회합니다.
 */
export async function getToolPricingData(toolId: string): Promise<ToolPricingData | null> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tool_pricing_data')
      .select('*')
      .eq('tool_id', toolId)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();
    if (data) return data as ToolPricingData;
  }
  return null;
}

/**
 * 스코어링 가중치를 조회합니다.
 */
export async function getScoringWeights(): Promise<ScoringWeight[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('scoring_weights')
      .select('*')
      .order('category');
    if (data?.length) return data as ScoringWeight[];
  }
  return [];
}

// ==========================================
// 카테고리 쇼케이스 (프롬프트→결과 비교)
// ==========================================
export async function getCategoryShowcase(categorySlug: string): Promise<CategoryShowcase | undefined> {
  return (seed.category_showcases || []).find((s) => s.category_slug === categorySlug);
}

export async function getToolShowcasesByCategory(categorySlug: string): Promise<(ToolShowcase & { tool?: Tool })[]> {
  const showcase = (seed.category_showcases || []).find((s) => s.category_slug === categorySlug);
  if (!showcase) return [];
  const items = (seed.tool_showcases || [])
    .filter((ts) => ts.showcase_id === showcase.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  return items.map((ts) => ({
    ...ts,
    tool: seed.tools.find((t) => t.slug === ts.tool_slug),
  }));
}

export async function getToolShowcases(toolSlug: string): Promise<(ToolShowcase & { showcase?: CategoryShowcase })[]> {
  const items = (seed.tool_showcases || []).filter((ts) => ts.tool_slug === toolSlug);
  return items.map((ts) => ({
    ...ts,
    showcase: (seed.category_showcases || []).find((s) => s.id === ts.showcase_id),
  }));
}

export async function getAllCategoryShowcases(): Promise<CategoryShowcase[]> {
  return (seed.category_showcases || []).sort((a, b) => a.sort_order - b.sort_order);
}

// ==========================================
// 역할별 AI 활용 쇼케이스 (직업/교육)
// ==========================================
export async function getRoleShowcase(targetType: 'job' | 'education', targetSlug: string): Promise<RoleShowcase | undefined> {
  return (seed.role_showcases || []).find(
    (rs) => rs.target_type === targetType && rs.target_slug === targetSlug
  );
}

export async function getRoleUseCases(roleShowcaseId: string): Promise<(RoleUseCaseShowcase & { tool?: Tool })[]> {
  const items = (seed.role_use_cases || [])
    .filter((ruc) => ruc.role_showcase_id === roleShowcaseId)
    .sort((a, b) => a.sort_order - b.sort_order);
  return items.map((ruc) => ({
    ...ruc,
    tool: seed.tools.find((t) => t.slug === ruc.tool_slug),
  }));
}

export async function getAllRoleShowcases(targetType?: 'job' | 'education'): Promise<RoleShowcase[]> {
  const all = (seed.role_showcases || []).sort((a, b) => a.sort_order - b.sort_order);
  return targetType ? all.filter((rs) => rs.target_type === targetType) : all;
}

// ==========================================
// 오늘의 PICK (Weekly Picks - 7일 주기)
// ==========================================

/** 도구 데이터 기반 사실적 추천 이유 생성 (seed fallback용) */
function generateSeedPickReason(tool: Tool, pickType: string): string {
  switch (pickType) {
    case 'trending': {
      const parts: string[] = [];
      if (tool.visit_count > 100_000_000) {
        parts.push(`월 ${Math.round(tool.visit_count / 1_000_000)}M 사용자 보유`);
      } else if (tool.visit_count > 10_000_000) {
        parts.push(`월 ${Math.round(tool.visit_count / 1_000_000)}M+ 방문`);
      }
      if (tool.trend_magnitude >= 5) parts.push('최근 사용량 급증');
      else parts.push('사용량 꾸준히 증가 중');
      if (tool.rating_avg >= 4.5) parts.push(`평점 ${tool.rating_avg.toFixed(1)}점`);
      if (tool.supports_korean) parts.push('한국어 지원');
      return parts.slice(0, 2).join(', ');
    }
    case 'new': {
      const parts: string[] = [];
      if (tool.pricing_type === 'Free') parts.push('완전 무료로 바로 시작 가능');
      else if (tool.free_quota_detail) parts.push(`무료: ${tool.free_quota_detail.slice(0, 30)}`);
      if (tool.rating_avg >= 4.0) parts.push(`평점 ${tool.rating_avg.toFixed(1)}점 기록`);
      if (tool.supports_korean) parts.push('한국어 지원');
      return parts.slice(0, 2).join(' · ') || '새로 등장한 주목할 AI 서비스';
    }
    case 'hidden_gem': {
      const parts: string[] = [];
      parts.push(`평점 ${tool.rating_avg.toFixed(1)}점의 숨은 보석`);
      if (tool.pricing_type === 'Free') parts.push('완전 무료');
      else if (tool.pricing_type === 'Freemium') parts.push('무료 사용 가능');
      if (tool.supports_korean) parts.push('한국어 지원');
      return parts.slice(0, 2).join(', ');
    }
    case 'price_drop': {
      if (tool.pricing_type === 'Free') {
        const parts = ['제한 없이 완전 무료 사용'];
        if (tool.rating_avg >= 4.0) parts.push(`평점 ${tool.rating_avg.toFixed(1)}점`);
        return parts.slice(0, 2).join(', ');
      }
      const parts: string[] = [];
      if (tool.free_quota_detail) parts.push(`무료 제공: ${tool.free_quota_detail.slice(0, 35)}`);
      else parts.push('넉넉한 무료 사용량 제공');
      if (tool.rating_avg >= 4.0) parts.push(`평점 ${tool.rating_avg.toFixed(1)}점`);
      return parts.slice(0, 2).join(', ');
    }
    default:
      return '에디터가 검증한 추천 AI';
  }
}

export async function getDailyPicks(limit = 8): Promise<(DailyPick & { tool?: Tool })[]> {
  const supabase = await db();
  if (supabase) {
    // 7일 이내 PICK 조회
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_picks')
      .select('*, tool:tools(*)')
      .gte('pick_date', weekAgo)
      .order('pick_date', { ascending: false })
      .order('sort_order', { ascending: true })
      .limit(limit);
    if (data?.length) return data as (DailyPick & { tool?: Tool })[];

    // 7일 이내 없으면 가장 최근 pick_date
    const { data: latest } = await supabase
      .from('daily_picks')
      .select('*, tool:tools(*)')
      .order('pick_date', { ascending: false })
      .order('sort_order', { ascending: true })
      .limit(limit);
    if (latest?.length) return latest as (DailyPick & { tool?: Tool })[];
  }

  // seed fallback: 트렌딩/신규/숨은명작/무료추천 자동 생성 (사실적 이유 포함)
  const trending = [...seed.tools]
    .filter(t => t.trend_direction === 'up')
    .sort((a, b) => (b.trend_magnitude ?? 0) - (a.trend_magnitude ?? 0))
    .slice(0, 2);
  const newest = [...seed.tools]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 2);
  const hiddenGems = [...seed.tools]
    .filter(t => t.rating_avg >= 4.0 && t.visit_count < 5000000)
    .sort((a, b) => b.rating_avg - a.rating_avg)
    .slice(0, 2);
  const topFree = [...seed.tools]
    .filter(t => t.pricing_type === 'Free' || t.pricing_type === 'Freemium')
    .sort((a, b) => b.ranking_score - a.ranking_score)
    .slice(0, 2);

  const picks: (DailyPick & { tool?: Tool })[] = [];
  const today = new Date().toISOString().split('T')[0];
  let order = 0;
  const usedIds = new Set<string>();

  for (const t of trending) {
    usedIds.add(t.id);
    picks.push({ id: `dp-${t.id}`, pick_date: today, tool_id: t.id, pick_type: 'trending', reason: generateSeedPickReason(t, 'trending'), sort_order: order++, created_at: new Date().toISOString(), tool: t });
  }
  for (const t of newest) {
    if (usedIds.has(t.id)) continue;
    usedIds.add(t.id);
    picks.push({ id: `dp-${t.id}`, pick_date: today, tool_id: t.id, pick_type: 'new', reason: generateSeedPickReason(t, 'new'), sort_order: order++, created_at: new Date().toISOString(), tool: t });
  }
  for (const t of hiddenGems) {
    if (usedIds.has(t.id)) continue;
    usedIds.add(t.id);
    picks.push({ id: `dp-${t.id}`, pick_date: today, tool_id: t.id, pick_type: 'hidden_gem', reason: generateSeedPickReason(t, 'hidden_gem'), sort_order: order++, created_at: new Date().toISOString(), tool: t });
  }
  for (const t of topFree) {
    if (usedIds.has(t.id)) continue;
    usedIds.add(t.id);
    picks.push({ id: `dp-${t.id}`, pick_date: today, tool_id: t.id, pick_type: 'price_drop', reason: generateSeedPickReason(t, 'price_drop'), sort_order: order++, created_at: new Date().toISOString(), tool: t });
  }

  return picks.slice(0, limit);
}

// ==========================================
// 커뮤니티 인기 질문 (홈페이지용)
// ==========================================
export async function getTrendingQuestions(limit = 5): Promise<CommunityPost[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('community_posts')
      .select('*')
      .eq('post_type', 'question')
      .is('parent_id', null)
      .eq('is_hidden', false)
      .order('like_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (data?.length) return data as CommunityPost[];
  }
  return [];
}

// ==========================================
// AI 서비스 변경 이력 (Tool Updates)
// ==========================================

/** 특정 도구의 업데이트 이력 */
export async function getToolUpdates(toolId: string, limit = 10): Promise<ToolUpdate[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tool_updates')
      .select('*')
      .eq('tool_id', toolId)
      .order('announced_at', { ascending: false })
      .limit(limit);
    if (data?.length) return data as ToolUpdate[];
  }
  return (seed.tool_updates || [])
    .filter(u => u.tool_id === toolId)
    .sort((a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime())
    .slice(0, limit);
}

/** 전체 최신 업데이트 (크로스 도구) */
export async function getRecentUpdates(limit = 20): Promise<ToolUpdate[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tool_updates')
      .select('*, tool:tools(name, slug, logo_url)')
      .order('announced_at', { ascending: false })
      .limit(limit);
    if (data?.length) return data as ToolUpdate[];
  }
  // seed fallback: tool 정보 수동 조인
  const updates = [...(seed.tool_updates || [])]
    .sort((a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime())
    .slice(0, limit);
  return updates.map(u => {
    const tool = seed.tools.find(t => t.id === u.tool_id);
    return {
      ...u,
      tool: tool ? { name: tool.name, slug: tool.slug, logo_url: tool.logo_url } : undefined,
    };
  });
}

/** 타입별 필터 업데이트 */
export async function getRecentUpdatesByType(type: ToolUpdateType, limit = 20): Promise<ToolUpdate[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tool_updates')
      .select('*, tool:tools(name, slug, logo_url)')
      .eq('update_type', type)
      .order('announced_at', { ascending: false })
      .limit(limit);
    if (data?.length) return data as ToolUpdate[];
  }
  const updates = [...(seed.tool_updates || [])]
    .filter(u => u.update_type === type)
    .sort((a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime())
    .slice(0, limit);
  return updates.map(u => {
    const tool = seed.tools.find(t => t.id === u.tool_id);
    return {
      ...u,
      tool: tool ? { name: tool.name, slug: tool.slug, logo_url: tool.logo_url } : undefined,
    };
  });
}

// ==========================================
// 커뮤니티 통계 (홈페이지용)
// ==========================================
export async function getCommunityStats(): Promise<{ questionCount: number; answerCount: number; activeUsers: number }> {
  const supabase = await db();
  if (supabase) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [{ count: qCount }, { count: aCount }, { data: users }] = await Promise.all([
      supabase
        .from('community_posts')
        .select('id', { count: 'exact', head: true })
        .eq('post_type', 'question')
        .gte('created_at', weekAgo),
      supabase
        .from('community_posts')
        .select('id', { count: 'exact', head: true })
        .eq('is_answer', true)
        .gte('created_at', weekAgo),
      supabase
        .from('community_posts')
        .select('user_id')
        .gte('created_at', weekAgo),
    ]);

    const uniqueUsers = new Set(users?.map(u => u.user_id) || []);

    return {
      questionCount: qCount || 0,
      answerCount: aCount || 0,
      activeUsers: uniqueUsers.size,
    };
  }

  return { questionCount: 0, answerCount: 0, activeUsers: 0 };
}
