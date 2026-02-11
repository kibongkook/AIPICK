import { DEFAULT_SCORING_WEIGHTS } from '@/lib/constants';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ScoringWeightsMap = Record<string, number>;

/**
 * DB에서 스코어링 가중치를 로드합니다.
 * DB 접속 실패 시 DEFAULT_SCORING_WEIGHTS로 폴백합니다.
 */
export async function loadScoringWeights(
  supabase: SupabaseClient | null
): Promise<ScoringWeightsMap> {
  if (supabase) {
    const { data } = await supabase
      .from('scoring_weights')
      .select('weight_key, weight_value');

    if (data?.length) {
      return Object.fromEntries(
        data.map((w) => [w.weight_key, Number(w.weight_value)])
      );
    }
  }

  // 폴백: 상수에서 로드
  return { ...DEFAULT_SCORING_WEIGHTS };
}

/**
 * DB에서 특정 카테고리의 가중치만 로드합니다.
 * @param category - 'rating_aggregation', 'quality_gate' 등
 */
export async function loadWeightsByCategory(
  supabase: SupabaseClient | null,
  category: string
): Promise<ScoringWeightsMap> {
  if (supabase) {
    const { data } = await supabase
      .from('scoring_weights')
      .select('weight_key, weight_value')
      .eq('category', category);

    if (data?.length) {
      return Object.fromEntries(
        data.map((w) => [w.weight_key, Number(w.weight_value)])
      );
    }
  }

  return {};
}

/**
 * 가중치 맵에서 특정 키의 값을 안전하게 가져옵니다.
 */
export function getWeight(weights: ScoringWeightsMap, key: string): number {
  return weights[key] ?? 0;
}
