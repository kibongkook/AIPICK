// ==========================================
// 외부 평점 집계기 (무료 소스 전용)
// Product Hunt, GitHub, 벤치마크, Artificial Analysis
// 실제 외부 데이터를 기반으로 rating_avg를 계산
// 모든 가중치는 DB(scoring_weights)에서 런타임 로드
// ==========================================

import type { ScoringWeightsMap } from '@/lib/scoring/weights';

/**
 * 외부 소스별 원본 평점 데이터
 */
export interface ExternalRatingData {
  /** Product Hunt 리뷰 평점 (0-5) */
  ph_rating: number | null;
  /** Product Hunt 투표 수 */
  ph_votes: number;
  /** Product Hunt 리뷰 수 */
  ph_reviews: number;
  /** GitHub 스타 수 */
  github_stars: number;
  /** HuggingFace 벤치마크 평균 점수 (0-100) */
  benchmark_avg: number | null;
  /** Artificial Analysis 품질 인덱스 (0-100) */
  aa_quality_index: number | null;
  /** G2 평점 (0-5, 유료 API 연동 시 사용) */
  g2_rating: number | null;
  /** G2 리뷰 수 */
  g2_reviews: number;
}

/**
 * 집계된 평점 결과
 */
export interface AggregatedRating {
  /** 종합 평점 (1.0 - 5.0) */
  rating_avg: number;
  /** 종합 리뷰/피드백 수 */
  review_count: number;
  /** 인기도 점수 (방문 수 대체) */
  popularity_score: number;
  /** 평점 계산에 사용된 소스 목록 */
  rating_sources: string[];
  /** 신뢰도 등급: high(3+ 소스), medium(2 소스), low(1 소스), none(0) */
  confidence: 'high' | 'medium' | 'low' | 'none';
}

// ==========================================
// 하드코딩 폴백 가중치 (DB 미설정 시)
// DB key: rating_agg_ph → 40 등
// ==========================================
const DEFAULT_RATING_WEIGHTS = {
  rating_agg_ph: 40,
  rating_agg_benchmark: 25,
  rating_agg_aa: 15,
  rating_agg_github: 20,
  rating_agg_g2: 0,
} as const;

/**
 * DB 가중치 맵에서 평점 집계용 가중치를 추출합니다.
 * DB 값이 없으면 하드코딩 폴백을 사용합니다.
 */
function getRatingWeight(weights: ScoringWeightsMap | null, key: string): number {
  if (weights && weights[key] !== undefined) {
    return weights[key];
  }
  return (DEFAULT_RATING_WEIGHTS as Record<string, number>)[key] ?? 0;
}

/**
 * 무료 외부 데이터를 기반으로 종합 평점을 계산합니다.
 *
 * 가중치는 DB(scoring_weights, category='rating_aggregation')에서 로드.
 * - PH 리뷰 평점: 0-5 스케일 그대로
 * - 벤치마크 점수: 0-100 → 1-5 스케일로 변환
 * - AA 품질 인덱스: 0-100 → 1-5 스케일로 변환
 * - GitHub 인기도: 로그 스케일로 1-5 변환
 * - G2: DB에서 가중치 > 0일 때만 활성화
 *
 * @param data - 외부 소스 원본 데이터
 * @param dbWeights - DB에서 로드한 가중치 맵 (null이면 폴백 사용)
 */
export function aggregateRating(
  data: ExternalRatingData,
  dbWeights: ScoringWeightsMap | null = null
): AggregatedRating {
  const sources: { name: string; rating: number; weight: number }[] = [];

  const wPh = getRatingWeight(dbWeights, 'rating_agg_ph');
  const wBenchmark = getRatingWeight(dbWeights, 'rating_agg_benchmark');
  const wAa = getRatingWeight(dbWeights, 'rating_agg_aa');
  const wGithub = getRatingWeight(dbWeights, 'rating_agg_github');
  const wG2 = getRatingWeight(dbWeights, 'rating_agg_g2');

  // 1. Product Hunt 리뷰 평점
  if (wPh > 0 && data.ph_rating !== null && data.ph_rating > 0 && data.ph_reviews >= 3) {
    sources.push({
      name: 'product_hunt',
      rating: Math.min(data.ph_rating, 5),
      weight: wPh,
    });
  }

  // 2. G2 평점 (유료 API — DB에서 가중치 > 0일 때만 활성화)
  if (wG2 > 0 && data.g2_rating !== null && data.g2_rating > 0 && data.g2_reviews >= 5) {
    sources.push({
      name: 'g2',
      rating: Math.min(data.g2_rating, 5),
      weight: wG2,
    });
  }

  // 3. 벤치마크 품질 (0-100 → 1-5)
  if (wBenchmark > 0 && data.benchmark_avg !== null && data.benchmark_avg > 0) {
    const benchmarkRating = scoreToRating(data.benchmark_avg, 40, 90);
    sources.push({
      name: 'benchmark',
      rating: benchmarkRating,
      weight: wBenchmark,
    });
  }

  // 4. Artificial Analysis 품질 (0-100 → 1-5)
  if (wAa > 0 && data.aa_quality_index !== null && data.aa_quality_index > 0) {
    const aaRating = scoreToRating(data.aa_quality_index, 30, 90);
    sources.push({
      name: 'artificial_analysis',
      rating: aaRating,
      weight: wAa,
    });
  }

  // 5. GitHub 인기도 (로그 스케일)
  if (wGithub > 0 && data.github_stars >= 100) {
    const ghRating = starsToRating(data.github_stars);
    sources.push({
      name: 'github',
      rating: ghRating,
      weight: wGithub,
    });
  }

  // 가중 평균 계산 (사용 가능한 소스만)
  if (sources.length === 0) {
    return {
      rating_avg: 0,
      review_count: data.ph_reviews + data.g2_reviews,
      popularity_score: estimatePopularity(data),
      rating_sources: [],
      confidence: 'none',
    };
  }

  const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = sources.reduce((sum, s) => sum + s.rating * s.weight, 0);
  const rating = Math.round((weightedSum / totalWeight) * 10) / 10;

  const confidence: AggregatedRating['confidence'] =
    sources.length >= 3 ? 'high' :
    sources.length >= 2 ? 'medium' : 'low';

  return {
    rating_avg: Math.max(1, Math.min(5, rating)),
    review_count: data.ph_reviews + data.g2_reviews,
    popularity_score: estimatePopularity(data),
    rating_sources: sources.map((s) => s.name),
    confidence,
  };
}

/**
 * 0-100 점수를 1-5 평점으로 변환합니다.
 * @param score 원본 점수
 * @param lowBound 1.0에 해당하는 하한값
 * @param highBound 5.0에 해당하는 상한값
 */
function scoreToRating(score: number, lowBound: number, highBound: number): number {
  const clamped = Math.max(lowBound, Math.min(highBound, score));
  const normalized = (clamped - lowBound) / (highBound - lowBound);
  return 1 + normalized * 4; // 1.0 ~ 5.0
}

/**
 * GitHub 스타 수를 1-5 평점으로 변환합니다.
 * 로그 스케일 사용 (100=1.0, 1K=2.5, 10K=3.5, 100K=4.5, 1M=5.0)
 */
function starsToRating(stars: number): number {
  if (stars < 100) return 1;
  const logStars = Math.log10(stars);
  // log10(100)=2, log10(1M)=6 → 2-6 범위를 1-5로 매핑
  const rating = 1 + ((logStars - 2) / 4) * 4;
  return Math.max(1, Math.min(5, Math.round(rating * 10) / 10));
}

/**
 * 외부 지표를 기반으로 인기도 점수를 추정합니다.
 * visit_count 대체용 (실제 트래픽 데이터 없이 추정)
 */
function estimatePopularity(data: ExternalRatingData): number {
  return (
    data.ph_votes * 10 +
    data.github_stars +
    data.ph_reviews * 50 +
    data.g2_reviews * 100
  );
}
