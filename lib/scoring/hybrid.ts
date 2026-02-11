import { BENCHMARK_APPLICABLE_CATEGORIES } from '@/lib/constants';
import { normalizeToScale, roundScore, clampScore } from './normalize';
import { getWeight, type ScoringWeightsMap } from './weights';

// ==========================================
// 타입 정의
// ==========================================

export interface ToolMetrics {
  // AIPICK 내부 데이터 (4계층)
  rating_avg: number;         // AIPICK 사용자 평점
  bookmark_count: number;
  upvote_count: number;
  supports_korean: boolean;
  // 메타
  is_llm: boolean;            // LLM 여부 (1계층 적용 결정)
  category_slug?: string;
  /** source_key → normalized_score (0-100) */
  external_scores: Map<string, number>;
}

export interface MaxValues {
  max_bookmark: number;
  max_upvote: number;
}

export interface HybridScoreResult {
  hybrid_score: number;
  tier1_score: number;  // 기술 품질
  tier2_score: number;  // 커뮤니티 검증
  tier3_score: number;  // 실용성
  tier4_score: number;  // AIPICK 자체
}

// ==========================================
// 4계층 가중치 키 → 외부 소스 키 매핑
// ==========================================

/** 1계층: 기술 품질 (LLM 전용) */
const TIER1_MAP: Record<string, string> = {
  tier1_arena_elo: 'lmsys_arena',
  tier1_benchmark: 'huggingface_llm',
  tier1_artificial_analysis: 'artificial_analysis',
};

/** 2계층: 커뮤니티 검증 (전체) */
const TIER2_MAP: Record<string, string> = {
  tier2_ph_rating: 'product_hunt',
  tier2_ph_votes: 'product_hunt_votes',
  tier2_github: 'github',
  tier2_hn_mentions: 'hackernews',
};

/** 3계층: 실용성 */
const TIER3_LLM_MAP: Record<string, string> = {
  tier3_pricing: 'openrouter',
};

// ==========================================
// 1계층: 기술 품질 점수 (LLM 전용, 최대 35점)
// ==========================================

function calculateTier1Score(
  externalScores: Map<string, number>,
  weights: ScoringWeightsMap,
  isLlm: boolean
): number {
  if (!isLlm) return 0; // 비-LLM은 0 (가중치가 2계층으로 재분배됨)

  let score = 0;
  for (const [weightKey, sourceKey] of Object.entries(TIER1_MAP)) {
    const normalizedScore = externalScores.get(sourceKey) ?? 0;
    const weight = getWeight(weights, weightKey);
    score += (normalizedScore * weight) / 100;
  }
  return score;
}

// ==========================================
// 2계층: 커뮤니티 검증 점수 (전체, 최대 40점)
// 비-LLM 도구: 1계층+3계층(pricing) 가중치가 여기로 재분배
// ==========================================

function calculateTier2Score(
  externalScores: Map<string, number>,
  weights: ScoringWeightsMap,
  isLlm: boolean
): number {
  // 2계층 기본 가중치 합계
  const tier2Keys = Object.keys(TIER2_MAP);
  const baseTier2Weight = tier2Keys.reduce(
    (sum, k) => sum + getWeight(weights, k), 0
  );

  // 비-LLM: 1계층(35%) + 3계층 pricing(10%) = 45%를 2계층으로 재분배
  let redistributionFactor = 1;
  if (!isLlm) {
    const tier1Weight = Object.keys(TIER1_MAP).reduce(
      (sum, k) => sum + getWeight(weights, k), 0
    );
    const tier3PricingWeight = getWeight(weights, 'tier3_pricing');
    const redistributedWeight = tier1Weight + tier3PricingWeight;
    redistributionFactor = baseTier2Weight > 0
      ? (baseTier2Weight + redistributedWeight) / baseTier2Weight
      : 1;
  }

  let score = 0;
  for (const [weightKey, sourceKey] of Object.entries(TIER2_MAP)) {
    const normalizedScore = externalScores.get(sourceKey) ?? 0;
    let weight = getWeight(weights, weightKey);

    if (!isLlm) {
      weight *= redistributionFactor;
    }

    score += (normalizedScore * weight) / 100;
  }
  return score;
}

// ==========================================
// 3계층: 실용성 점수 (최대 15점)
// ==========================================

function calculateTier3Score(
  externalScores: Map<string, number>,
  weights: ScoringWeightsMap,
  isLlm: boolean,
  supportsKorean: boolean
): number {
  let score = 0;

  // pricing (LLM 전용)
  if (isLlm) {
    for (const [weightKey, sourceKey] of Object.entries(TIER3_LLM_MAP)) {
      const normalizedScore = externalScores.get(sourceKey) ?? 0;
      const weight = getWeight(weights, weightKey);
      score += (normalizedScore * weight) / 100;
    }
  }

  // 한국어 지원 보너스 (전체)
  if (supportsKorean) {
    score += getWeight(weights, 'tier3_korean');
  }

  return score;
}

// ==========================================
// 4계층: AIPICK 자체 점수 (최대 10점)
// ==========================================

function calculateTier4Score(
  tool: ToolMetrics,
  weights: ScoringWeightsMap,
  maxValues: MaxValues
): number {
  // 사용자 평점 (0-5 → 0-100 정규화)
  const ratingNorm = tool.rating_avg > 0 ? (tool.rating_avg / 5.0) * 100 : 0;
  const ratingScore = (ratingNorm * getWeight(weights, 'tier4_user_rating')) / 100;

  // 참여도 (북마크 + 업보트 합산)
  const engagement = tool.bookmark_count + tool.upvote_count;
  const maxEngagement = maxValues.max_bookmark + maxValues.max_upvote;
  const engagementNorm = normalizeToScale(engagement, Math.max(maxEngagement, 1));
  const engagementScore = (engagementNorm * getWeight(weights, 'tier4_engagement')) / 100;

  return ratingScore + engagementScore;
}

// ==========================================
// 하이브리드 점수 계산 (메인 함수)
// ==========================================

/**
 * 4계층 하이브리드 점수를 계산합니다.
 *
 * - 1계층 (35점): 기술 품질 — Arena Elo, 벤치마크, AA (LLM만)
 * - 2계층 (40점): 커뮤니티 검증 — PH 평점/투표, GitHub, HN (전체)
 * - 3계층 (15점): 실용성 — 가성비, 한국어 지원
 * - 4계층 (10점): AIPICK 자체 — 사용자 평점, 참여도
 *
 * 비-LLM 도구: 1계층(35%) + 3계층 pricing(10%) → 2계층으로 재분배
 * 총점: 0~100
 */
export function calculateHybridScore(
  tool: ToolMetrics,
  weights: ScoringWeightsMap,
  maxValues: MaxValues
): HybridScoreResult {
  const tier1 = calculateTier1Score(tool.external_scores, weights, tool.is_llm);
  const tier2 = calculateTier2Score(tool.external_scores, weights, tool.is_llm);
  const tier3 = calculateTier3Score(tool.external_scores, weights, tool.is_llm, tool.supports_korean);
  const tier4 = calculateTier4Score(tool, weights, maxValues);

  const hybridScore = clampScore(tier1 + tier2 + tier3 + tier4);

  return {
    hybrid_score: roundScore(hybridScore),
    tier1_score: roundScore(tier1),
    tier2_score: roundScore(tier2),
    tier3_score: roundScore(tier3),
    tier4_score: roundScore(tier4),
  };
}

/**
 * 카테고리 slug를 기반으로 LLM(벤치마크 해당) 여부를 판단합니다.
 */
export function isBenchmarkApplicable(categorySlug: string): boolean {
  return (BENCHMARK_APPLICABLE_CATEGORIES as readonly string[]).includes(categorySlug);
}
