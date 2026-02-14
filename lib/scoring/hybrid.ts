// ==========================================
// 하이브리드 점수 계산기 v2 (4-카테고리 시스템)
// 사용자 리뷰 40% + 인기도 25% + 커뮤니티 25% + 벤치마크 10%
// ==========================================

import { BENCHMARK_APPLICABLE_CATEGORIES, CONFIDENCE_THRESHOLDS } from '@/lib/constants';
import { roundScore, clampScore } from './normalize';
import { getWeight, type ScoringWeightsMap } from './weights';
import type { ConfidenceLevel } from '@/types';

// ==========================================
// 타입 정의
// ==========================================

export interface ToolMetrics {
  /** 도구가 LLM인지 여부 (벤치마크 카테고리 적용 결정) */
  is_llm: boolean;
  /** 카테고리 slug (벤치마크 적용 판단용) */
  category_slug?: string;
  /** source_key → normalized_score (0-100) */
  external_scores: Map<string, number>;
}

export interface MaxValues {
  // 현재 미사용, 향후 확장용
  [key: string]: number;
}

export interface HybridScoreResult {
  /** 종합 점수 (0-100) */
  hybrid_score: number;
  /** 사용자 리뷰 카테고리 점수 */
  review_score: number;
  /** 인기도 카테고리 점수 */
  popularity_score: number;
  /** 커뮤니티 카테고리 점수 */
  community_score: number;
  /** 벤치마크 카테고리 점수 */
  benchmark_score: number;
  /** 신뢰도 등급 */
  confidence_level: ConfidenceLevel;
  /** 점수 산출에 기여한 소스 목록 */
  contributing_sources: string[];
}

// ==========================================
// 카테고리별 소스 키 매핑
// ==========================================

/** 사용자 리뷰 카테고리 (가중치 키 → 외부 소스 키) */
const REVIEW_SOURCE_MAP: Record<string, string> = {
  review_app_store: 'app_store',
  review_play_store: 'play_store',
  review_g2: 'g2',
  review_trustpilot: 'trustpilot',
  review_product_hunt: 'product_hunt',
};

/** 인기도 카테고리 */
const POPULARITY_SOURCE_MAP: Record<string, string> = {
  pop_tranco: 'tranco',
  pop_pagerank: 'open_pagerank',
};

/** 커뮤니티 카테고리 */
const COMMUNITY_SOURCE_MAP: Record<string, string> = {
  comm_ph_upvotes: 'product_hunt_votes',
  comm_github: 'github',
  comm_hn_mentions: 'hackernews',
};

/** 벤치마크 카테고리 (LLM만) */
const BENCHMARK_SOURCE_MAP: Record<string, string> = {
  bench_lmsys_arena: 'lmsys_arena',
  bench_huggingface: 'huggingface_llm',
};

// ==========================================
// 카테고리별 점수 계산
// ==========================================

/**
 * 특정 카테고리의 점수를 계산합니다.
 * 소스 맵의 가중치 키별로 외부 점수를 가져와 서브 가중 평균을 구합니다.
 * 데이터가 없는 서브 소스는 자동 재분배됩니다.
 *
 * @returns [카테고리 내 정규화 점수 0-100, 기여한 소스 목록]
 */
function calculateCategoryScore(
  externalScores: Map<string, number>,
  weights: ScoringWeightsMap,
  sourceMap: Record<string, string>
): [number, string[]] {
  const sources: { key: string; score: number; weight: number }[] = [];

  for (const [weightKey, sourceKey] of Object.entries(sourceMap)) {
    const normalizedScore = externalScores.get(sourceKey);
    if (normalizedScore !== undefined && normalizedScore > 0) {
      const weight = getWeight(weights, weightKey);
      if (weight > 0) {
        sources.push({ key: sourceKey, score: normalizedScore, weight });
      }
    }
  }

  if (sources.length === 0) return [0, []];

  // 가중 평균 (비중 재분배: 있는 소스의 weight 합이 denominator)
  const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = sources.reduce((sum, s) => sum + s.score * s.weight, 0);
  const score = weightedSum / totalWeight;

  return [Math.min(score, 100), sources.map(s => s.key)];
}

// ==========================================
// 하이브리드 점수 계산 (메인 함수)
// ==========================================

/**
 * 4-카테고리 하이브리드 점수를 계산합니다.
 *
 * 카테고리 구성:
 * - 사용자 리뷰 (40%): App Store, Play Store, G2, Trustpilot, PH
 * - 인기도 (25%): Tranco 순위, Open PageRank
 * - 커뮤니티 (25%): PH 업보트, GitHub Stars, HN 멘션
 * - 벤치마크 (10%): LMSYS Arena, HuggingFace (LLM만)
 *
 * 비-LLM 도구: 벤치마크 10% → 나머지 카테고리에 비례 재분배
 * 데이터 없는 카테고리: 비중이 있는 카테고리로 재분배
 * 총점: 0~100
 */
export function calculateHybridScore(
  tool: ToolMetrics,
  weights: ScoringWeightsMap,
  _maxValues?: MaxValues
): HybridScoreResult {
  const allContributingSources: string[] = [];

  // 각 카테고리 점수 계산 (0-100 정규화)
  const [reviewRaw, reviewSources] = calculateCategoryScore(
    tool.external_scores, weights, REVIEW_SOURCE_MAP
  );
  const [popularityRaw, popularitySources] = calculateCategoryScore(
    tool.external_scores, weights, POPULARITY_SOURCE_MAP
  );
  const [communityRaw, communitySources] = calculateCategoryScore(
    tool.external_scores, weights, COMMUNITY_SOURCE_MAP
  );

  // 벤치마크: LLM만 계산
  let benchmarkRaw = 0;
  let benchmarkSources: string[] = [];
  if (tool.is_llm) {
    [benchmarkRaw, benchmarkSources] = calculateCategoryScore(
      tool.external_scores, weights, BENCHMARK_SOURCE_MAP
    );
  }

  allContributingSources.push(
    ...reviewSources, ...popularitySources, ...communitySources, ...benchmarkSources
  );

  // 카테고리 가중치 로드
  let wReview = getWeight(weights, 'cat_user_reviews');
  let wPopularity = getWeight(weights, 'cat_popularity');
  let wCommunity = getWeight(weights, 'cat_community');
  let wBenchmark = tool.is_llm ? getWeight(weights, 'cat_benchmarks') : 0;

  // 데이터 없는 카테고리 비중 재분배
  const categories = [
    { score: reviewRaw, weight: wReview, hasData: reviewSources.length > 0 },
    { score: popularityRaw, weight: wPopularity, hasData: popularitySources.length > 0 },
    { score: communityRaw, weight: wCommunity, hasData: communitySources.length > 0 },
    { score: benchmarkRaw, weight: wBenchmark, hasData: benchmarkSources.length > 0 },
  ];

  const activeCategories = categories.filter(c => c.hasData && c.weight > 0);
  const inactiveWeight = categories
    .filter(c => !c.hasData || c.weight === 0)
    .reduce((sum, c) => sum + c.weight, 0);

  // 비-LLM의 벤치마크 가중치도 재분배 대상에 포함
  const benchmarkRedist = !tool.is_llm ? getWeight(weights, 'cat_benchmarks') : 0;
  const totalRedistribute = inactiveWeight + benchmarkRedist;

  if (activeCategories.length > 0 && totalRedistribute > 0) {
    const activeWeightSum = activeCategories.reduce((sum, c) => sum + c.weight, 0);
    const redistributionFactor = (activeWeightSum + totalRedistribute) / activeWeightSum;

    for (const cat of activeCategories) {
      cat.weight *= redistributionFactor;
    }
  }

  // 최종 점수 계산
  const totalWeight = activeCategories.reduce((sum, c) => sum + c.weight, 0);
  let hybridScore = 0;

  if (totalWeight > 0) {
    const weightedSum = activeCategories.reduce(
      (sum, c) => sum + (c.score * c.weight), 0
    );
    hybridScore = weightedSum / totalWeight;
  }

  // 각 카테고리의 최종 기여 점수 (가중치 반영)
  const reviewContrib = reviewSources.length > 0
    ? (reviewRaw * (activeCategories.find(c => c.score === reviewRaw)?.weight ?? wReview)) / Math.max(totalWeight, 1) * 100
    : 0;
  const popularityContrib = popularitySources.length > 0
    ? (popularityRaw * (activeCategories.find(c => c.score === popularityRaw)?.weight ?? wPopularity)) / Math.max(totalWeight, 1) * 100
    : 0;
  const communityContrib = communitySources.length > 0
    ? (communityRaw * (activeCategories.find(c => c.score === communityRaw)?.weight ?? wCommunity)) / Math.max(totalWeight, 1) * 100
    : 0;
  const benchmarkContrib = benchmarkSources.length > 0
    ? (benchmarkRaw * (activeCategories.find(c => c.score === benchmarkRaw)?.weight ?? wBenchmark)) / Math.max(totalWeight, 1) * 100
    : 0;

  // 신뢰도: 기여 소스 수 기반
  const uniqueSources = [...new Set(allContributingSources)];
  const confidence = calculateConfidenceFromSources(uniqueSources.length);

  return {
    hybrid_score: roundScore(clampScore(hybridScore)),
    review_score: roundScore(reviewContrib),
    popularity_score: roundScore(popularityContrib),
    community_score: roundScore(communityContrib),
    benchmark_score: roundScore(benchmarkContrib),
    confidence_level: confidence,
    contributing_sources: uniqueSources,
  };
}

/**
 * 소스 수 기반으로 신뢰도를 판단합니다.
 */
function calculateConfidenceFromSources(sourceCount: number): ConfidenceLevel {
  if (sourceCount >= CONFIDENCE_THRESHOLDS.HIGH_MIN_SOURCES) return 'high';
  if (sourceCount >= CONFIDENCE_THRESHOLDS.MEDIUM_MIN_SOURCES) return 'medium';
  if (sourceCount >= CONFIDENCE_THRESHOLDS.LOW_MIN_SOURCES) return 'low';
  return 'none';
}

/**
 * 카테고리 slug를 기반으로 LLM(벤치마크 해당) 여부를 판단합니다.
 */
export function isBenchmarkApplicable(categorySlug: string): boolean {
  return (BENCHMARK_APPLICABLE_CATEGORIES as readonly string[]).includes(categorySlug);
}
