import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth } from '@/lib/pipeline/fetcher-base';
import { createClient } from '@/lib/supabase/server';

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
}

interface ToolAggregateRow {
  category_id: string;
  visit_count: number;
  review_count: number;
  rating_avg: number;
}

interface CategoryAggregation {
  category_slug: string;
  category_name: string;
  total_visits: number;
  total_reviews: number;
  tool_count: number;
  avg_ranking_score: number;
}

const PERIOD = 'weekly';

// 인기도 가중치
const WEIGHT_VISITS = 0.4;
const WEIGHT_REVIEWS = 0.2;
const WEIGHT_AVG_RANKING = 0.3;
const WEIGHT_TOOL_COUNT = 0.1;

/**
 * POST /api/cron/category-popularity - 카테고리별 인기도 집계
 *
 * 알고리즘:
 * 1. 모든 카테고리 조회
 * 2. 카테고리별 도구 통계 집계 (방문, 리뷰, 점수, 도구 수)
 * 3. 정규화 후 가중 합산으로 인기도 점수 계산
 * 4. category_popularity 테이블에 upsert
 *
 * Vercel Cron 또는 외부 스케줄러에서 호출
 * Authorization: Bearer <CRON_SECRET> 헤더로 인증
 */
export async function POST(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase not configured, skipping' });
  }

  const supabase = await createClient();

  try {
    // 1. 모든 카테고리 조회
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, slug, name')
      .order('sort_order', { ascending: true });

    if (catError || !categories?.length) {
      return NextResponse.json(
        { error: catError?.message || 'No categories found' },
        { status: 500 }
      );
    }

    // 2. 모든 도구의 집계에 필요한 데이터를 한 번에 조회
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select('category_id, visit_count, review_count, rating_avg');

    if (toolsError) {
      return NextResponse.json({ error: toolsError.message }, { status: 500 });
    }

    // 3. 카테고리별 집계
    const categoryMap = new Map<string, CategoryRow>();
    (categories as CategoryRow[]).forEach((c) => categoryMap.set(c.id, c));

    const aggregations = new Map<string, CategoryAggregation>();

    // 초기화
    for (const cat of categories as CategoryRow[]) {
      aggregations.set(cat.slug, {
        category_slug: cat.slug,
        category_name: cat.name,
        total_visits: 0,
        total_reviews: 0,
        tool_count: 0,
        avg_ranking_score: 0,
      });
    }

    // 도구별 데이터를 카테고리에 합산
    const scoreSums = new Map<string, number>(); // category_slug → 합산 점수

    for (const tool of (tools ?? []) as ToolAggregateRow[]) {
      const cat = categoryMap.get(tool.category_id);
      if (!cat) continue;

      const agg = aggregations.get(cat.slug);
      if (!agg) continue;

      agg.total_visits += tool.visit_count;
      agg.total_reviews += tool.review_count;
      agg.tool_count += 1;

      const effectiveScore = tool.rating_avg || 0;
      scoreSums.set(cat.slug, (scoreSums.get(cat.slug) || 0) + effectiveScore);
    }

    // 평균 점수 계산
    for (const [slug, agg] of aggregations) {
      const totalScore = scoreSums.get(slug) || 0;
      agg.avg_ranking_score = agg.tool_count > 0
        ? Math.round((totalScore / agg.tool_count) * 100) / 100
        : 0;
    }

    // 4. 정규화 및 인기도 점수 계산
    const aggArray = Array.from(aggregations.values());

    const maxVisits = Math.max(...aggArray.map((a) => a.total_visits), 1);
    const maxReviews = Math.max(...aggArray.map((a) => a.total_reviews), 1);
    const maxAvgRanking = Math.max(...aggArray.map((a) => a.avg_ranking_score), 1);
    const maxToolCount = Math.max(...aggArray.map((a) => a.tool_count), 1);

    const results = aggArray.map((agg) => {
      const visitsNorm = agg.total_visits / maxVisits;
      const reviewsNorm = agg.total_reviews / maxReviews;
      const avgRankingNorm = agg.avg_ranking_score / maxAvgRanking;
      const toolCountNorm = agg.tool_count / maxToolCount;

      const popularityScore =
        visitsNorm * WEIGHT_VISITS +
        reviewsNorm * WEIGHT_REVIEWS +
        avgRankingNorm * WEIGHT_AVG_RANKING +
        toolCountNorm * WEIGHT_TOOL_COUNT;

      return {
        category_slug: agg.category_slug,
        period: PERIOD,
        total_visits: agg.total_visits,
        total_reviews: agg.total_reviews,
        total_bookmarks: 0, // 별도 집계 아래에서 수행
        tool_count: agg.tool_count,
        avg_ranking_score: agg.avg_ranking_score,
        popularity_score: Math.round(popularityScore * 10000) / 100, // 0~100 범위
        computed_at: new Date().toISOString(),
      };
    });

    // 5. 카테고리별 북마크 수 집계 (도구 → 북마크 → 카테고리)
    const { data: toolCategories } = await supabase
      .from('tools')
      .select('id, category_id');

    const toolToCategorySlug = new Map<string, string>();
    for (const tc of (toolCategories ?? []) as Array<{ id: string; category_id: string }>) {
      const cat = categoryMap.get(tc.category_id);
      if (cat) toolToCategorySlug.set(tc.id, cat.slug);
    }

    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('tool_id');

    const categoryBookmarkCounts = new Map<string, number>();
    for (const bm of (bookmarks ?? []) as Array<{ tool_id: string }>) {
      const catSlug = toolToCategorySlug.get(bm.tool_id);
      if (catSlug) {
        categoryBookmarkCounts.set(catSlug, (categoryBookmarkCounts.get(catSlug) || 0) + 1);
      }
    }

    for (const r of results) {
      r.total_bookmarks = categoryBookmarkCounts.get(r.category_slug) || 0;
    }

    // 6. category_popularity 테이블에 upsert
    const { error: upsertError } = await supabase
      .from('category_popularity')
      .upsert(results, { onConflict: 'category_slug,period' });

    if (upsertError) {
      return NextResponse.json(
        { success: false, error: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      period: PERIOD,
      categories_processed: results.length,
      results: results.map((r) => ({
        slug: r.category_slug,
        tool_count: r.tool_count,
        total_visits: r.total_visits,
        total_reviews: r.total_reviews,
        total_bookmarks: r.total_bookmarks,
        avg_ranking_score: r.avg_ranking_score,
        popularity_score: r.popularity_score,
      })),
    });
  } catch (topError) {
    const errorMsg = topError instanceof Error ? topError.message : String(topError);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
