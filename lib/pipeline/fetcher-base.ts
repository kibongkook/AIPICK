import type { SupabaseClient } from '@supabase/supabase-js';

export interface FetcherResult {
  total: number;
  updated: number;
  skipped: number;
  errors: string[];
}

/**
 * 데이터 소스 상태를 'running'으로 업데이트합니다.
 */
export async function markSourceRunning(
  supabase: SupabaseClient,
  sourceKey: string
): Promise<void> {
  await supabase
    .from('external_data_sources')
    .update({ last_status: 'running', updated_at: new Date().toISOString() })
    .eq('source_key', sourceKey);
}

/**
 * 데이터 소스의 최종 상태를 업데이트합니다.
 */
export async function markSourceComplete(
  supabase: SupabaseClient,
  sourceKey: string,
  result: FetcherResult
): Promise<void> {
  const status =
    result.errors.length === 0
      ? 'success'
      : result.updated > 0
        ? 'partial'
        : 'error';

  await supabase
    .from('external_data_sources')
    .update({
      last_fetched_at: new Date().toISOString(),
      last_status: status,
      last_error: result.errors.length > 0 ? result.errors.slice(0, 5).join('; ') : null,
      updated_at: new Date().toISOString(),
    })
    .eq('source_key', sourceKey);
}

/**
 * tool_external_scores 테이블에 정규화된 점수를 upsert합니다.
 */
export async function upsertExternalScore(
  supabase: SupabaseClient,
  toolId: string,
  sourceKey: string,
  normalizedScore: number,
  rawData: Record<string, unknown>
): Promise<void> {
  await supabase.from('tool_external_scores').upsert(
    {
      tool_id: toolId,
      source_key: sourceKey,
      normalized_score: Math.round(normalizedScore * 100) / 100,
      raw_data: rawData,
      fetched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'tool_id,source_key' }
  );
}

/**
 * 비동기 딜레이 (rate limiting용).
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * cron 인증 검증 헬퍼.
 */
export function verifyCronAuth(authHeader: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET;
  // CRON_SECRET 미설정 시 차단 (배포 환경에서 반드시 설정 필요)
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}
