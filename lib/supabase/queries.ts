// ==========================================
// AIPICK 데이터 페칭 레이어
// Supabase 미설정 시 seed.json 폴백
// ==========================================

import type {
  Tool, Category, JobCategory, EduLevel,
  JobToolRecommendation, EduToolRecommendation, News,
} from '@/types';
import seedData from '@/data/seed.json';

// seed.json 데이터 캐스팅
const seed = {
  tools: seedData.tools as unknown as Tool[],
  categories: seedData.categories as unknown as Category[],
  job_categories: (seedData as Record<string, unknown>).job_categories as JobCategory[] | undefined,
  edu_levels: (seedData as Record<string, unknown>).edu_levels as EduLevel[] | undefined,
  job_tool_recommendations: (seedData as Record<string, unknown>).job_tool_recommendations as JobToolRecommendation[] | undefined,
  edu_tool_recommendations: (seedData as Record<string, unknown>).edu_tool_recommendations as EduToolRecommendation[] | undefined,
  news: (seedData as Record<string, unknown>).news as News[] | undefined,
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
// 뉴스
// ==========================================
export function getNews(limit?: number): News[] {
  const news = (seed.news || [])
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  return limit ? news.slice(0, limit) : news;
}

export function getNewsById(id: string): News | undefined {
  return (seed.news || []).find((n) => n.id === id);
}
