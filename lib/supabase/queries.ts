// ==========================================
// AIPICK 데이터 페칭 레이어
// Supabase 설정 시 실제 DB 사용, 미설정 시 seed.json 폴백
// ==========================================

import type {
  Tool, Category, JobCategory, EduLevel,
  JobToolRecommendation, EduToolRecommendation, News, Guide, NewsCategory,
} from '@/types';
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
    const { data } = await supabase.from('tools').select('*');
    if (data?.length) return data as Tool[];
  }
  return seed.tools;
}

export async function getToolById(id: string): Promise<Tool | undefined> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase.from('tools').select('*').eq('id', id).single();
    if (data) return data as Tool;
  }
  return seed.tools.find((t) => t.id === id);
}

export async function getToolBySlug(slug: string): Promise<Tool | undefined> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase.from('tools').select('*').eq('slug', slug).single();
    if (data) return data as Tool;
  }
  return seed.tools.find((t) => t.slug === slug);
}

export async function getToolsByCategory(categoryId: string): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tools')
      .select('*')
      .eq('category_id', categoryId)
      .order('visit_count', { ascending: false });
    if (data?.length) return data as Tool[];
  }
  return seed.tools
    .filter((t) => t.category_id === categoryId)
    .sort((a, b) => b.visit_count - a.visit_count);
}

export async function getEditorPicks(limit = 6): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tools')
      .select('*')
      .eq('is_editor_pick', true)
      .order('rating_avg', { ascending: false })
      .limit(limit);
    if (data?.length) return data as Tool[];
  }
  return seed.tools
    .filter((t) => t.is_editor_pick)
    .sort((a, b) => b.rating_avg - a.rating_avg)
    .slice(0, limit);
}

export async function getSimilarTools(tool: Tool, limit = 3): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tools')
      .select('*')
      .eq('category_id', tool.category_id)
      .neq('id', tool.id)
      .order('rating_avg', { ascending: false })
      .limit(limit);
    if (data?.length) return data as Tool[];
  }
  return seed.tools
    .filter((t) => t.category_id === tool.category_id && t.id !== tool.id)
    .sort((a, b) => b.rating_avg - a.rating_avg)
    .slice(0, limit);
}

export async function getLatestTools(limit = 4): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (data?.length) return data as Tool[];
  }
  return [...seed.tools]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
        query = query.eq('category_id', cat.id);
      }
    }

    const { data } = await query.order('ranking_score', { ascending: false });
    if (data?.length) {
      return data.map((tool: Tool, index: number) => ({ ...tool, ranking: index + 1 }));
    }
  }

  // Seed fallback
  let tools = [...seed.tools];
  if (categorySlug) {
    const cat = seed.categories.find((c) => c.slug === categorySlug);
    if (cat) {
      tools = tools.filter((t) => t.category_id === cat.id);
    }
  }
  return tools
    .sort((a, b) => (b.ranking_score || b.visit_count) - (a.ranking_score || a.visit_count))
    .map((tool, index) => ({ ...tool, ranking: index + 1 }));
}

export async function getTrending(limit = 10): Promise<Tool[]> {
  const supabase = await db();
  if (supabase) {
    const { data } = await supabase
      .from('tools')
      .select('*')
      .order('weekly_visit_delta', { ascending: false })
      .limit(limit);
    if (data?.length) return data as Tool[];
  }
  return [...seed.tools]
    .sort((a, b) => (b.weekly_visit_delta || 0) - (a.weekly_visit_delta || 0))
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
        let results = data as Tool[];
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
    results = results.filter((t) => catIds.includes(t.category_id));
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
