// ==========================================
// 품질 게이트: AI 도구 포함 기준 평가
// 5가지 기준 중 3개 이상 충족 시 자동 승인
// 모든 임계값은 DB(scoring_weights, category='quality_gate')에서 로드
// ==========================================

import type { ScoringWeightsMap } from '@/lib/scoring/weights';

export interface CandidateMetrics {
  ph_votes: number;
  ph_reviews: number;
  github_stars: number;
  github_issues: number;
  hn_mentions: number;
  benchmark_score: number | null;
  aa_quality_index: number | null;
  category_rank?: number; // 카테고리 내 순위 (외부 점수 기준)
}

export interface QualityGateResult {
  criteriaResults: Record<string, boolean>;
  criteriaMet: number;
  qualityScore: number;
  autoApproved: boolean;
  passedCriteria: string[];
}

// ==========================================
// 하드코딩 폴백 임계값 (DB 미설정 시)
// ==========================================
const DEFAULT_QG_THRESHOLDS: Record<string, number> = {
  // 기준 1: 사용자 기반
  qg_ph_votes_min: 100,
  qg_github_stars_min: 500,
  // 기준 2: 커뮤니티 피드백
  qg_ph_reviews_min: 10,
  qg_github_issues_min: 50,
  // 기준 3: 벤치마크 성능
  qg_benchmark_avg_min: 60,
  qg_aa_quality_min: 50,
  // 기준 4: 커뮤니티 언급
  qg_hn_mentions_min: 3,
  // 기준 5: 분야 독보적
  qg_category_top_n: 3,
  // 자동 승인 기준
  qg_min_criteria: 3,
  // 품질 점수 산정 가중치 (%)
  qg_score_ph_votes: 20,
  qg_score_github: 20,
  qg_score_feedback: 15,
  qg_score_mentions: 15,
  qg_score_benchmark: 15,
  qg_score_aa: 15,
};

/**
 * DB 또는 폴백에서 임계값을 가져옵니다.
 */
function getThreshold(dbWeights: ScoringWeightsMap | null, key: string): number {
  if (dbWeights && dbWeights[key] !== undefined) {
    return dbWeights[key];
  }
  return DEFAULT_QG_THRESHOLDS[key] ?? 0;
}

// ==========================================
// 품질 게이트 평가 함수
// ==========================================

/**
 * 도구 후보의 품질 기준을 평가합니다.
 * 5가지 기준:
 * 1. 사용자 기반 (PH votes ≥ 100 OR GitHub stars ≥ 500)
 * 2. 커뮤니티 피드백 (PH reviews ≥ 10 OR GitHub issues ≥ 50)
 * 3. 벤치마크 성능 (HF 평균 ≥ 60 OR AA quality ≥ 50)
 * 4. 커뮤니티 언급 (HN 90일 내 ≥ 3회)
 * 5. 분야 독보적 (카테고리 내 상위 3위)
 *
 * @param metrics - 후보 도구의 지표
 * @param dbWeights - DB에서 로드한 quality_gate 카테고리 가중치 (null이면 폴백)
 */
export function evaluateCandidate(
  metrics: CandidateMetrics,
  dbWeights: ScoringWeightsMap | null = null
): QualityGateResult {
  const t = (key: string) => getThreshold(dbWeights, key);

  const criteriaResults: Record<string, boolean> = {
    user_base:
      metrics.ph_votes >= t('qg_ph_votes_min') ||
      metrics.github_stars >= t('qg_github_stars_min'),
    community_feedback:
      metrics.ph_reviews >= t('qg_ph_reviews_min') ||
      metrics.github_issues >= t('qg_github_issues_min'),
    benchmark_performance:
      (metrics.benchmark_score !== null && metrics.benchmark_score >= t('qg_benchmark_avg_min')) ||
      (metrics.aa_quality_index !== null && metrics.aa_quality_index >= t('qg_aa_quality_min')),
    community_mentions:
      metrics.hn_mentions >= t('qg_hn_mentions_min'),
    niche_dominance:
      metrics.category_rank !== undefined && metrics.category_rank <= t('qg_category_top_n'),
  };

  const passedCriteria = Object.entries(criteriaResults)
    .filter(([, passed]) => passed)
    .map(([name]) => name);

  const criteriaMet = passedCriteria.length;
  const qualityScore = calculateQualityScore(metrics, dbWeights);
  const autoApproved = criteriaMet >= t('qg_min_criteria');

  return {
    criteriaResults,
    criteriaMet,
    qualityScore,
    autoApproved,
    passedCriteria,
  };
}

/**
 * 종합 품질 점수를 0~100 범위로 계산합니다.
 * 각 지표를 정규화하여 가중 합산. 가중치는 DB에서 로드.
 */
function calculateQualityScore(
  metrics: CandidateMetrics,
  dbWeights: ScoringWeightsMap | null
): number {
  const t = (key: string) => getThreshold(dbWeights, key);

  // 각 지표를 0-100으로 정규화 (상한 클램프)
  const phVoteScore = Math.min((metrics.ph_votes / 1000) * 100, 100);
  const githubScore = Math.min((metrics.github_stars / 10000) * 100, 100);
  const feedbackScore = Math.min(
    ((metrics.ph_reviews + metrics.github_issues) / 100) * 100,
    100
  );
  const mentionScore = Math.min((metrics.hn_mentions / 10) * 100, 100);
  const benchmarkScore = metrics.benchmark_score ?? 0;
  const aaScore = metrics.aa_quality_index ?? 0;

  // DB 가중치 (% → 소수)
  const score =
    phVoteScore * (t('qg_score_ph_votes') / 100) +
    githubScore * (t('qg_score_github') / 100) +
    feedbackScore * (t('qg_score_feedback') / 100) +
    mentionScore * (t('qg_score_mentions') / 100) +
    benchmarkScore * (t('qg_score_benchmark') / 100) +
    aaScore * (t('qg_score_aa') / 100);

  return Math.round(score * 100) / 100;
}
