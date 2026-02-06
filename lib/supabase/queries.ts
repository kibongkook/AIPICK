// ==========================================
// AIPICK 데이터 페칭 레이어
// Supabase 미설정 시 seed.json 폴백
// ==========================================

import type {
  Tool, Category, JobCategory, EduLevel,
  JobToolRecommendation, EduToolRecommendation, News, Guide, NewsCategory,
} from '@/types';
import seedData from '@/data/seed.json';

// 컬렉션 시드 타입 (seed.json 전용, tool_ids 배열 사용)
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

// seed.json 데이터 캐스팅
const seed = {
  tools: seedData.tools as unknown as Tool[],
  categories: seedData.categories as unknown as Category[],
  job_categories: (seedData as Record<string, unknown>).job_categories as JobCategory[] | undefined,
  edu_levels: (seedData as Record<string, unknown>).edu_levels as EduLevel[] | undefined,
  job_tool_recommendations: (seedData as Record<string, unknown>).job_tool_recommendations as JobToolRecommendation[] | undefined,
  edu_tool_recommendations: (seedData as Record<string, unknown>).edu_tool_recommendations as EduToolRecommendation[] | undefined,
  news: (seedData as Record<string, unknown>).news as News[] | undefined,
  guides: (seedData as Record<string, unknown>).guides as Guide[] | undefined,
  collections: (seedData as Record<string, unknown>).collections as SeedCollection[] | undefined,
};

// ==========================================
// 카테고리
// ==========================================
export function getCategories(): Category[] {
  return seed.categories.sort((a, b) => a.sort_order - b.sort_order);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return seed.categories.find((c) => c.slug === slug);
}

// ==========================================
// AI 서비스 (Tools)
// ==========================================
export function getTools(): Tool[] {
  return seed.tools;
}

export function getToolById(id: string): Tool | undefined {
  return seed.tools.find((t) => t.id === id);
}

export function getToolBySlug(slug: string): Tool | undefined {
  return seed.tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(categoryId: string): Tool[] {
  return seed.tools
    .filter((t) => t.category_id === categoryId)
    .sort((a, b) => b.visit_count - a.visit_count);
}

export function getEditorPicks(limit = 6): Tool[] {
  return seed.tools
    .filter((t) => t.is_editor_pick)
    .sort((a, b) => b.rating_avg - a.rating_avg)
    .slice(0, limit);
}

export function getSimilarTools(tool: Tool, limit = 3): Tool[] {
  return seed.tools
    .filter((t) => t.category_id === tool.category_id && t.id !== tool.id)
    .sort((a, b) => b.rating_avg - a.rating_avg)
    .slice(0, limit);
}

export function getLatestTools(limit = 4): Tool[] {
  return [...seed.tools]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

// ==========================================
// 랭킹
// ==========================================
export function getRankings(categorySlug?: string): (Tool & { ranking: number })[] {
  let tools = [...seed.tools];

  if (categorySlug) {
    const cat = getCategoryBySlug(categorySlug);
    if (cat) {
      tools = tools.filter((t) => t.category_id === cat.id);
    }
  }

  return tools
    .sort((a, b) => (b.ranking_score || b.visit_count) - (a.ranking_score || a.visit_count))
    .map((tool, index) => ({ ...tool, ranking: index + 1 }));
}

export function getTrending(limit = 10): Tool[] {
  return [...seed.tools]
    .sort((a, b) => (b.weekly_visit_delta || 0) - (a.weekly_visit_delta || 0))
    .slice(0, limit);
}

// ==========================================
// 직군별 추천
// ==========================================
export function getJobCategories(): JobCategory[] {
  return (seed.job_categories || []).sort((a, b) => a.sort_order - b.sort_order);
}

export function getJobCategoryBySlug(slug: string): JobCategory | undefined {
  return (seed.job_categories || []).find((j) => j.slug === slug);
}

export function getJobRecommendations(jobSlug: string): JobToolRecommendation[] {
  const job = getJobCategoryBySlug(jobSlug);
  if (!job) return [];

  const recs = (seed.job_tool_recommendations || [])
    .filter((r) => r.job_category_id === job.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  // tool 객체 조인
  return recs.map((rec) => ({
    ...rec,
    tool: seed.tools.find((t) => t.id === rec.tool_id),
  }));
}

// ==========================================
// 학년별 추천
// ==========================================
export function getEduLevels(): EduLevel[] {
  return (seed.edu_levels || []).sort((a, b) => a.sort_order - b.sort_order);
}

export function getEduLevelBySlug(slug: string): EduLevel | undefined {
  return (seed.edu_levels || []).find((e) => e.slug === slug);
}

export function getEduRecommendations(levelSlug: string): EduToolRecommendation[] {
  const level = getEduLevelBySlug(levelSlug);
  if (!level) return [];

  const recs = (seed.edu_tool_recommendations || [])
    .filter((r) => r.edu_level_id === level.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  return recs.map((rec) => ({
    ...rec,
    tool: seed.tools.find((t) => t.id === rec.tool_id),
  }));
}

// ==========================================
// 검색 + 필터
// ==========================================
export interface SearchFilters {
  query?: string;
  pricing?: string[];
  category?: string[];
  supports_korean?: boolean;
  min_rating?: number;
  job?: string;
  edu?: string;
  sort?: 'popular' | 'rating' | 'latest' | 'free_first';
}

export function searchTools(filters: SearchFilters): Tool[] {
  let results = [...seed.tools];

  // 텍스트 검색
  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  // 가격 필터
  if (filters.pricing && filters.pricing.length > 0) {
    results = results.filter((t) =>
      filters.pricing!.some((p) => t.pricing_type.toLowerCase() === p.toLowerCase())
    );
  }

  // 카테고리 필터
  if (filters.category && filters.category.length > 0) {
    const catIds = filters.category
      .map((slug) => getCategoryBySlug(slug)?.id)
      .filter(Boolean);
    results = results.filter((t) => catIds.includes(t.category_id));
  }

  // 한국어 지원 필터
  if (filters.supports_korean) {
    results = results.filter((t) => t.supports_korean);
  }

  // 최소 평점 필터
  if (filters.min_rating) {
    results = results.filter((t) => t.rating_avg >= filters.min_rating!);
  }

  // 직군 필터
  if (filters.job) {
    const job = getJobCategoryBySlug(filters.job);
    if (job) {
      const jobToolIds = (seed.job_tool_recommendations || [])
        .filter((r) => r.job_category_id === job.id)
        .map((r) => r.tool_id);
      results = results.filter((t) => jobToolIds.includes(t.id));
    }
  }

  // 학년 필터
  if (filters.edu) {
    const eduLevel = getEduLevelBySlug(filters.edu);
    if (eduLevel) {
      const eduToolIds = (seed.edu_tool_recommendations || [])
        .filter((r) => r.edu_level_id === eduLevel.id)
        .map((r) => r.tool_id);
      results = results.filter((t) => eduToolIds.includes(t.id));
    }
  }

  // 정렬
  switch (filters.sort) {
    case 'rating':
      results.sort((a, b) => b.rating_avg - a.rating_avg);
      break;
    case 'latest':
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'free_first':
      results.sort((a, b) => {
        const order = { Free: 0, Freemium: 1, Paid: 2 };
        return order[a.pricing_type] - order[b.pricing_type] || b.ranking_score - a.ranking_score;
      });
      break;
    default: // popular
      results.sort((a, b) => (b.ranking_score || b.visit_count) - (a.ranking_score || a.visit_count));
  }

  return results;
}

export function getAutocompleteSuggestions(query: string, limit = 5): Tool[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return seed.tools
    .filter((t) => t.name.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q)))
    .sort((a, b) => b.visit_count - a.visit_count)
    .slice(0, limit);
}

// ==========================================
// 뉴스
// ==========================================
export function getNews(limit?: number, category?: NewsCategory): News[] {
  let news = [...(seed.news || [])]
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  if (category) {
    news = news.filter((n) => n.category === category);
  }
  return limit ? news.slice(0, limit) : news;
}

export function getNewsById(id: string): News | undefined {
  return (seed.news || []).find((n) => n.id === id);
}

export function getHotNews(limit = 5): News[] {
  return [...(seed.news || [])]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, limit);
}

// ==========================================
// 가이드
// ==========================================
export function getGuides(category?: string): Guide[] {
  let guides = [...(seed.guides || [])];
  if (category) {
    guides = guides.filter((g) => g.category === category);
  }
  return guides.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return (seed.guides || []).find((g) => g.slug === slug);
}

export function getGuidesByJob(jobId: string): Guide[] {
  return (seed.guides || []).filter((g) => g.related_job_id === jobId);
}

export function getGuidesByEdu(eduId: string): Guide[] {
  return (seed.guides || []).filter((g) => g.related_edu_id === eduId);
}

// ==========================================
// 컬렉션
// ==========================================
export function getCollections(): (SeedCollection & { tools: Tool[] })[] {
  return (seed.collections || [])
    .filter((c) => c.is_public)
    .sort((a, b) => b.like_count - a.like_count)
    .map((c) => ({
      ...c,
      tools: c.tool_ids.map((id) => seed.tools.find((t) => t.id === id)).filter(Boolean) as Tool[],
    }));
}

export function getCollectionById(id: string): (SeedCollection & { tools: Tool[] }) | undefined {
  const c = (seed.collections || []).find((col) => col.id === id);
  if (!c) return undefined;
  return {
    ...c,
    tools: c.tool_ids.map((tid) => seed.tools.find((t) => t.id === tid)).filter(Boolean) as Tool[],
  };
}
