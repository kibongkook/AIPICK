import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth } from '@/lib/pipeline/fetcher-base';
import { evaluateCandidate, type CandidateMetrics } from '@/lib/pipeline/quality-gate';
import { loadWeightsByCategory } from '@/lib/scoring/weights';
import { resolveLogoUrl } from '@/lib/utils/logo-resolver';

/**
 * POST /api/cron/approve-candidates - 도구 후보 자동 평가 및 승인
 *
 * 1. tool_candidates에서 status='pending'인 후보를 조회
 * 2. 품질 게이트(5가지 기준) 평가
 * 3. 3개 이상 충족 시 auto_approved=true → tools 테이블로 자동 등록
 */
export async function POST(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase not configured, skipping' });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const result = {
    total: 0,
    evaluated: 0,
    approved: 0,
    rejected: 0,
    merged: 0,
    errors: [] as string[],
  };

  // 1. 평가 대상 후보 조회
  const { data: candidates, error: fetchError } = await supabase
    .from('tool_candidates')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(50); // 한번에 최대 50개 처리

  if (fetchError || !candidates?.length) {
    return NextResponse.json({
      success: true,
      message: 'No pending candidates',
      ...result,
    });
  }

  result.total = candidates.length;

  // 2. 품질 게이트 임계값 로드 (DB → 폴백: 상수)
  const qgWeights = await loadWeightsByCategory(supabase, 'quality_gate');

  // 3. 카테고리별 기존 도구 점수 (분야 독보적 기준용)
  const { data: toolScores } = await supabase
    .from('tools')
    .select('category_id, hybrid_score')
    .order('hybrid_score', { ascending: false });

  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug');

  const categoryTopScores = new Map<string, number[]>();
  if (toolScores && categories) {
    const catIdToSlug = new Map(categories.map((c) => [c.id, c.slug]));
    for (const tool of toolScores) {
      const slug = catIdToSlug.get(tool.category_id);
      if (slug) {
        const scores = categoryTopScores.get(slug) || [];
        scores.push(tool.hybrid_score);
        categoryTopScores.set(slug, scores);
      }
    }
  }

  // 4. 각 후보 평가
  for (const candidate of candidates) {
    try {
      // 카테고리 내 순위 계산 (후보의 quality_score가 기존 top3 안에 드는지)
      const catScores = categoryTopScores.get(candidate.category_slug) || [];
      const topThreshold = catScores[2] ?? 0; // 3위 점수
      const candidateCategoryRank = candidate.quality_score > topThreshold
        ? Math.max(1, catScores.filter((s) => s > candidate.quality_score).length + 1)
        : catScores.length + 1;

      const metrics: CandidateMetrics = {
        ph_votes: candidate.ph_votes || 0,
        ph_reviews: candidate.ph_reviews || 0,
        github_stars: candidate.github_stars || 0,
        github_issues: candidate.github_issues || 0,
        hn_mentions: candidate.hn_mentions || 0,
        benchmark_score: candidate.benchmark_score || null,
        aa_quality_index: candidate.aa_quality_index || null,
        category_rank: candidateCategoryRank,
      };

      const evaluation = evaluateCandidate(metrics, qgWeights);

      // 4. 후보 상태 업데이트
      const newStatus = evaluation.autoApproved ? 'approved' : 'rejected';

      await supabase
        .from('tool_candidates')
        .update({
          criteria_passed: evaluation.passedCriteria,
          criteria_met: evaluation.criteriaMet,
          quality_score: evaluation.qualityScore,
          auto_approved: evaluation.autoApproved,
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidate.id);

      result.evaluated++;

      if (evaluation.autoApproved) {
        result.approved++;

        // 5. 승인된 후보를 tools 테이블로 등록
        const mergeResult = await mergeToTools(supabase, candidate, categories || []);
        if (mergeResult) {
          result.merged++;

          await supabase
            .from('tool_candidates')
            .update({
              status: 'merged',
              merged_at: new Date().toISOString(),
            })
            .eq('id', candidate.id);
        }
      } else {
        result.rejected++;
      }
    } catch (err) {
      result.errors.push(
        `${candidate.name}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return NextResponse.json({
    success: true,
    ...result,
  });
}

/**
 * 승인된 후보를 tools 테이블에 등록합니다.
 */
async function mergeToTools(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  candidate: Record<string, unknown>,
  categories: { id: string; slug: string }[]
): Promise<boolean> {
  const name = candidate.name as string;
  const slug = candidate.slug as string;
  const url = candidate.url as string;

  // 이미 동일 slug가 tools에 있는지 확인
  const { data: existing } = await supabase
    .from('tools')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) return false; // 이미 존재

  // 카테고리 ID 매핑
  const catSlug = candidate.category_slug as string;
  const category = categories.find((c) => c.slug === catSlug);

  const logoUrl = (candidate.logo_url as string) || resolveLogoUrl(name, url);

  const { error } = await supabase.from('tools').insert({
    name,
    slug,
    url,
    description: (candidate.description as string) || `${name} - AI 서비스`,
    logo_url: logoUrl,
    category_id: category?.id || null,
    pricing_type: 'Freemium', // 기본값, 이후 pricing cron에서 업데이트
    supports_korean: false,   // 기본값, 이후 확인
    is_editor_pick: false,
    rating_avg: 0,
    review_count: 0,
    visit_count: 0,
    bookmark_count: 0,
    upvote_count: 0,
    weekly_visit_delta: 0,
    ranking_score: 0,
    hybrid_score: 0,
    internal_score: 0,
    external_score: 0,
    trend_direction: 'new',
    trend_magnitude: 0,
    has_benchmark_data: false,
    tags: [],
    github_stars: (candidate.github_stars as number) || null,
    product_hunt_upvotes: (candidate.ph_votes as number) || null,
    model_identifiers: [],
  });

  return !error;
}
