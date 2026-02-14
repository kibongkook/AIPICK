// ==========================================
// 외부 평점 집계기 v2 (6-소스 시스템)
// App Store, Play Store, G2, Trustpilot, Product Hunt, AIPICK
// 실제 외부 데이터를 기반으로 rating_avg를 계산
// 모든 가중치는 DB(scoring_weights)에서 런타임 로드
// ==========================================

import {
  DEFAULT_RATING_WEIGHTS,
  RATING_MIN_REVIEWS,
  CONFIDENCE_THRESHOLDS,
} from '@/lib/constants';
import type { ConfidenceLevel } from '@/types';
import type { ScoringWeightsMap } from '@/lib/scoring/weights';

/**
 * 외부 소스별 원본 평점 데이터 (6-소스)
 */
export interface ExternalRatingData {
  /** Apple App Store 평점 (1-5) */
  app_store_rating: number | null;
  /** App Store 리뷰 수 */
  app_store_reviews: number;
  /** Google Play Store 평점 (1-5) */
  play_store_rating: number | null;
  /** Play Store 리뷰 수 */
  play_store_reviews: number;
  /** G2 평점 (1-5) */
  g2_rating: number | null;
  /** G2 리뷰 수 */
  g2_reviews: number;
  /** Trustpilot 평점 (1-5) */
  trustpilot_rating: number | null;
  /** Trustpilot 리뷰 수 */
  trustpilot_reviews: number;
  /** Product Hunt 평점 (1-5) */
  ph_rating: number | null;
  /** Product Hunt 리뷰 수 */
  ph_reviews: number;
  /** AIPICK 자체 평점 (1-5) */
  aipick_rating: number | null;
  /** AIPICK 리뷰 수 */
  aipick_reviews: number;
}

/**
 * 집계된 평점 결과
 */
export interface AggregatedRating {
  /** 종합 평점 (1.0 - 5.0), 데이터 없으면 0 */
  rating_avg: number;
  /** 종합 리뷰 수 (모든 소스 합산) */
  total_review_count: number;
  /** 평점 계산에 사용된 소스 목록 */
  rating_sources: string[];
  /** 신뢰도 등급 */
  confidence: ConfidenceLevel;
}

/**
 * 소스별 설정
 */
interface RatingSource {
  key: string;
  rating: number | null;
  reviewCount: number;
  weightKey: keyof typeof DEFAULT_RATING_WEIGHTS;
}

/**
 * DB 가중치 맵 또는 기본 상수에서 평점 집계용 가중치를 가져옵니다.
 * DB에 rating_agg_* 키가 있으면 사용, 없으면 DEFAULT_RATING_WEIGHTS 폴백.
 */
function getRatingWeight(
  dbWeights: ScoringWeightsMap | null,
  sourceKey: keyof typeof DEFAULT_RATING_WEIGHTS
): number {
  const dbKey = `rating_agg_${sourceKey}`;
  if (dbWeights && dbWeights[dbKey] !== undefined) {
    return dbWeights[dbKey];
  }
  return DEFAULT_RATING_WEIGHTS[sourceKey];
}

/**
 * 소스의 리뷰 수가 최소 기준을 충족하는지 확인합니다.
 */
function meetsMinReviews(sourceKey: string, reviewCount: number): boolean {
  const minRequired = RATING_MIN_REVIEWS[sourceKey] ?? 0;
  return reviewCount >= minRequired;
}

/**
 * 신뢰도 등급을 소스 수 기반으로 결정합니다.
 */
function calculateConfidence(sourceCount: number): ConfidenceLevel {
  if (sourceCount >= CONFIDENCE_THRESHOLDS.HIGH_MIN_SOURCES) return 'high';
  if (sourceCount >= CONFIDENCE_THRESHOLDS.MEDIUM_MIN_SOURCES) return 'medium';
  if (sourceCount >= CONFIDENCE_THRESHOLDS.LOW_MIN_SOURCES) return 'low';
  return 'none';
}

/**
 * 6개 외부 소스의 평점을 가중 평균으로 집계합니다.
 *
 * 소스별 기본 비중 (DEFAULT_RATING_WEIGHTS):
 * - App Store: 30% (최소 100리뷰)
 * - Play Store: 25% (최소 100리뷰)
 * - G2: 20% (최소 10리뷰)
 * - Trustpilot: 10% (최소 20리뷰)
 * - Product Hunt: 10% (최소 5리뷰)
 * - AIPICK 자체: 5% (최소 5리뷰)
 *
 * 없는 소스의 비중은 있는 소스에 비례 재분배.
 * 모든 소스가 없으면 rating_avg = 0 반환.
 *
 * @param data - 외부 소스 원본 데이터
 * @param dbWeights - DB에서 로드한 가중치 맵 (null이면 폴백 사용)
 */
export function aggregateRating(
  data: ExternalRatingData,
  dbWeights: ScoringWeightsMap | null = null
): AggregatedRating {
  // 6개 소스 정의
  const allSources: RatingSource[] = [
    { key: 'app_store', rating: data.app_store_rating, reviewCount: data.app_store_reviews, weightKey: 'app_store' },
    { key: 'play_store', rating: data.play_store_rating, reviewCount: data.play_store_reviews, weightKey: 'play_store' },
    { key: 'g2', rating: data.g2_rating, reviewCount: data.g2_reviews, weightKey: 'g2' },
    { key: 'trustpilot', rating: data.trustpilot_rating, reviewCount: data.trustpilot_reviews, weightKey: 'trustpilot' },
    { key: 'product_hunt', rating: data.ph_rating, reviewCount: data.ph_reviews, weightKey: 'product_hunt' },
    { key: 'aipick', rating: data.aipick_rating, reviewCount: data.aipick_reviews, weightKey: 'aipick' },
  ];

  // 유효한 소스만 필터 (평점 있고, 최소 리뷰 수 충족)
  const validSources: { key: string; rating: number; weight: number; reviewCount: number }[] = [];

  for (const source of allSources) {
    if (
      source.rating !== null &&
      source.rating > 0 &&
      source.rating <= 5 &&
      meetsMinReviews(source.key, source.reviewCount)
    ) {
      const weight = getRatingWeight(dbWeights, source.weightKey);
      if (weight > 0) {
        validSources.push({
          key: source.key,
          rating: Math.min(source.rating, 5),
          weight,
          reviewCount: source.reviewCount,
        });
      }
    }
  }

  // 전체 리뷰 수 합산
  const totalReviewCount = allSources.reduce((sum, s) => sum + s.reviewCount, 0);

  // 유효한 소스 없음 → 평점 0
  if (validSources.length === 0) {
    return {
      rating_avg: 0,
      total_review_count: totalReviewCount,
      rating_sources: [],
      confidence: 'none',
    };
  }

  // 가중 평균 계산 (비중 재분배: 있는 소스의 weight 합이 denominator)
  const totalWeight = validSources.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = validSources.reduce((sum, s) => sum + s.rating * s.weight, 0);
  const rating = Math.round((weightedSum / totalWeight) * 10) / 10;

  return {
    rating_avg: Math.max(1, Math.min(5, rating)),
    total_review_count: totalReviewCount,
    rating_sources: validSources.map((s) => s.key),
    confidence: calculateConfidence(validSources.length),
  };
}

/**
 * tool_external_scores 테이블의 데이터를 ExternalRatingData로 변환합니다.
 * 크론에서 수집한 raw 데이터를 평점 집계기 입력 형식으로 매핑.
 */
export function buildRatingDataFromScores(
  scores: Array<{ source_key: string; normalized_score: number; raw_data: Record<string, unknown> | null }>
): ExternalRatingData {
  const data: ExternalRatingData = {
    app_store_rating: null,
    app_store_reviews: 0,
    play_store_rating: null,
    play_store_reviews: 0,
    g2_rating: null,
    g2_reviews: 0,
    trustpilot_rating: null,
    trustpilot_reviews: 0,
    ph_rating: null,
    ph_reviews: 0,
    aipick_rating: null,
    aipick_reviews: 0,
  };

  for (const score of scores) {
    const raw = score.raw_data ?? {};

    switch (score.source_key) {
      case 'app_store':
        data.app_store_rating = (raw.rating as number) ?? null;
        data.app_store_reviews = (raw.review_count as number) ?? 0;
        break;
      case 'play_store':
        data.play_store_rating = (raw.rating as number) ?? null;
        data.play_store_reviews = (raw.review_count as number) ?? 0;
        break;
      case 'g2':
        data.g2_rating = (raw.rating as number) ?? null;
        data.g2_reviews = (raw.review_count as number) ?? 0;
        break;
      case 'trustpilot':
        data.trustpilot_rating = (raw.rating as number) ?? null;
        data.trustpilot_reviews = (raw.review_count as number) ?? 0;
        break;
      case 'product_hunt':
        data.ph_rating = (raw.rating as number) ?? null;
        data.ph_reviews = (raw.review_count as number) ?? 0;
        break;
    }
  }

  return data;
}
