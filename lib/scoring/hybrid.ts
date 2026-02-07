import { BENCHMARK_APPLICABLE_CATEGORIES } from '@/lib/constants';
import { normalizeToScale, roundScore, clampScore } from './normalize';
import { getWeight, type ScoringWeightsMap } from './weights';

// ==========================================
// 타입 정의
// ==========================================

export interface ToolMetrics {
  visit_count: number;
  rating_avg: number;
  review_count: number;
  bookmark_count: number;
  upvote_count: number;
  has_benchmark_data: boolean;
  category_slug?: string;
  /** source_key → normalized_score (0-100) */
  external_scores: Map<string, number>;
}

export interface MaxValues {
  max_visit: number;
  max_review: number;
  max_bookmark: number;
  max_upvote: number;
}

export interface HybridScoreResult {
  hybrid_score: number;
  internal_score: number;
  external_score: number;
}

// ==========================================
// 내부 점수 계산 (AIPICK 사용자 데이터)
// ==========================================

function calculateInternalScore(
  tool: ToolMetrics,
  weights: ScoringWeightsMap,
  maxValues: MaxValues
): number {
  const visitNorm = normalizeToScale(tool.visit_count, maxValues.max_visit);
  const ratingNorm = (tool.rating_avg / 5.0) * 100;
  const reviewNorm = normalizeToScale(tool.review_count, maxValues.max_review);
  const bookmarkNorm = normalizeToScale(tool.bookmark_count, maxValues.max_bookmark);
  const upvoteNorm = normalizeToScale(tool.upvote_count, maxValues.max_upvote);

  return (
    (visitNorm * getWeight(weights, 'internal_visit_count')) / 100 +
    (ratingNorm * getWeight(weights, 'internal_rating_avg')) / 100 +
    (reviewNorm * getWeight(weights, 'internal_review_count')) / 100 +
    (bookmarkNorm * getWeight(weights, 'internal_bookmark_count')) / 100 +
    (upvoteNorm * getWeight(weights, 'internal_upvote_count')) / 100
  );
}

// ==========================================
// 외부 점수 계산 (벤치마크 미해당 시 가중치 재분배)
// ==========================================

function calculateExternalScore(
  externalScores: Map<string, number>,
  weights: ScoringWeightsMap,
  hasBenchmarkData: boolean
): number {
  const externalKeys = [
    'external_github',
    'external_product_hunt',
    'external_benchmark',
    'external_pricing',
    'external_artificial_analysis',
  ];

  // 벤치마크 미해당 시 가중치 재분배
  let applicableKeys = externalKeys;
  let totalApplicableWeight = externalKeys.reduce((sum, k) => sum + getWeight(weights, k), 0);
  let redistributionFactor = 1;

  if (!hasBenchmarkData) {
    applicableKeys = externalKeys.filter((k) => k !== 'external_benchmark');
    const benchmarkWeight = getWeight(weights, 'external_benchmark');
    const otherWeight = totalApplicableWeight - benchmarkWeight;
    redistributionFactor = otherWeight > 0 ? totalApplicableWeight / otherWeight : 1;
    totalApplicableWeight = otherWeight;
  }

  // source_key와 weight_key 매핑
  const sourceKeyMap: Record<string, string> = {
    external_github: 'github',
    external_product_hunt: 'product_hunt',
    external_benchmark: 'huggingface_llm',
    external_pricing: 'openrouter',
    external_artificial_analysis: 'artificial_analysis',
  };

  let score = 0;
  for (const weightKey of applicableKeys) {
    const sourceKey = sourceKeyMap[weightKey];
    const normalizedScore = externalScores.get(sourceKey) ?? 0;
    let weight = getWeight(weights, weightKey);

    // 벤치마크 미해당 시 가중치 비례 증가
    if (!hasBenchmarkData && weightKey !== 'external_benchmark') {
      weight *= redistributionFactor;
    }

    score += (normalizedScore * weight) / 100;
  }

  return score;
}

// ==========================================
// 하이브리드 점수 계산 (메인 함수)
// ==========================================

/**
 * 내부 점수 + 외부 점수를 결합한 하이브리드 점수를 계산합니다.
 *
 * - 내부 점수 (최대 50점): 방문수, 평점, 리뷰수, 북마크수, 업보트수
 * - 외부 점수 (최대 50점): GitHub, Product Hunt, 벤치마크, 가격, Artificial Analysis
 * - 벤치마크 미해당 도구: 벤치마크 가중치가 나머지 외부 가중치에 비례 재분배
 *
 * @returns 0~100 범위의 하이브리드 점수
 */
export function calculateHybridScore(
  tool: ToolMetrics,
  weights: ScoringWeightsMap,
  maxValues: MaxValues
): HybridScoreResult {
  const internalScore = calculateInternalScore(tool, weights, maxValues);
  const externalScore = calculateExternalScore(
    tool.external_scores,
    weights,
    tool.has_benchmark_data
  );

  const hybridScore = clampScore(internalScore + externalScore);

  return {
    hybrid_score: roundScore(hybridScore),
    internal_score: roundScore(internalScore),
    external_score: roundScore(externalScore),
  };
}

/**
 * 카테고리 slug를 기반으로 벤치마크 해당 여부를 판단합니다.
 */
export function isBenchmarkApplicable(categorySlug: string): boolean {
  return (BENCHMARK_APPLICABLE_CATEGORIES as readonly string[]).includes(categorySlug);
}
