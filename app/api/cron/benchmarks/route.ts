import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  verifyCronAuth,
  markSourceRunning,
  markSourceComplete,
  upsertExternalScore,
  delay,
  type FetcherResult,
} from '@/lib/pipeline/fetcher-base';
import { findToolByModelName, loadToolIdentifiers } from '@/lib/pipeline/model-matcher';

const SOURCE_KEY = 'huggingface_llm';
const HUGGINGFACE_API_URL =
  'https://datasets-server.huggingface.co/rows?dataset=open-llm-leaderboard/contents&config=default&split=train&offset=0&length=100';
const BENCHMARK_SOURCE = 'open_llm_leaderboard';
const RATE_LIMIT_MS = 200;

/**
 * POST /api/cron/benchmarks - HuggingFace Open LLM Leaderboard 벤치마크 수집
 *
 * HuggingFace 데이터셋 API에서 LLM 벤치마크 점수를 가져와
 * DB의 도구와 매칭하고, 벤치마크 점수 및 정규화된 점수를 저장합니다.
 *
 * Vercel Cron 또는 외부 스케줄러에서 호출
 * Authorization: Bearer <CRON_SECRET> 헤더로 인증
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!verifyCronAuth(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase not configured, skipping' });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  await markSourceRunning(supabase, SOURCE_KEY);

  const result: FetcherResult = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // HuggingFace API에서 벤치마크 데이터 가져오기
    const headers: Record<string, string> = {
      'User-Agent': 'AIPICK-Bot',
    };
    const hfToken = process.env.HUGGINGFACE_TOKEN;
    if (hfToken) {
      headers['Authorization'] = `Bearer ${hfToken}`;
    }

    const response = await fetch(HUGGINGFACE_API_URL, {
      headers,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      result.errors.push(`HuggingFace API error: HTTP ${response.status}`);
      await markSourceComplete(supabase, SOURCE_KEY, result);
      return NextResponse.json({ success: false, ...result });
    }

    const json = await response.json();
    const rows = json?.rows;

    if (!rows || !Array.isArray(rows)) {
      result.errors.push('Invalid response format: missing rows array');
      await markSourceComplete(supabase, SOURCE_KEY, result);
      return NextResponse.json({ success: false, ...result });
    }

    result.total = rows.length;

    // DB에서 도구 식별 정보를 캐싱하여 로드
    const cachedTools = await loadToolIdentifiers(supabase);

    for (const row of rows) {
      const rowData = row?.row;
      if (!rowData) {
        result.skipped++;
        continue;
      }

      // 모델명 추출 (필드명은 데이터셋 버전에 따라 다를 수 있음)
      const modelName =
        rowData?.model_name ??
        rowData?.Model ??
        rowData?.model ??
        rowData?.fullname ??
        null;

      if (!modelName) {
        result.skipped++;
        continue;
      }

      try {
        // DB 도구와 매칭 시도
        const matchedTool = await findToolByModelName(supabase, modelName, cachedTools);

        if (!matchedTool) {
          result.skipped++;
          continue;
        }

        // 벤치마크 점수 추출 (필드명이 다양할 수 있으므로 optional chaining 사용)
        const scores = extractBenchmarkScores(rowData);

        if (scores.average === null) {
          result.skipped++;
          continue;
        }

        // tool_benchmark_scores 테이블에 upsert
        const { error: benchmarkError } = await supabase
          .from('tool_benchmark_scores')
          .upsert(
            {
              tool_id: matchedTool.id,
              benchmark_source: BENCHMARK_SOURCE,
              average_score: scores.average,
              mmlu_score: scores.mmlu,
              hellaswag_score: scores.hellaswag,
              arc_score: scores.arc,
              truthfulqa_score: scores.truthfulqa,
              winogrande_score: scores.winogrande,
              gsm8k_score: scores.gsm8k,
              raw_data: rowData,
              fetched_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'tool_id,benchmark_source' }
          );

        if (benchmarkError) {
          result.errors.push(`benchmark upsert ${matchedTool.name}: ${benchmarkError.message}`);
          continue;
        }

        // tool_external_scores에 정규화된 점수 저장 (average를 그대로 사용, 이미 0-100 범위)
        await upsertExternalScore(supabase, matchedTool.id, SOURCE_KEY, scores.average, {
          model_name: modelName,
          average: scores.average,
          mmlu: scores.mmlu,
          hellaswag: scores.hellaswag,
          arc: scores.arc,
          truthfulqa: scores.truthfulqa,
          winogrande: scores.winogrande,
          gsm8k: scores.gsm8k,
        });

        // tools 테이블에 has_benchmark_data 플래그 설정
        await supabase
          .from('tools')
          .update({
            has_benchmark_data: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', matchedTool.id);

        result.updated++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        result.errors.push(`${modelName}: ${message}`);
      }

      await delay(RATE_LIMIT_MS);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    result.errors.push(`Fatal: ${message}`);
  }

  await markSourceComplete(supabase, SOURCE_KEY, result);

  return NextResponse.json({
    success: result.errors.length === 0,
    ...result,
  });
}

/**
 * HuggingFace 벤치마크 데이터에서 점수를 추출합니다.
 * 데이터셋 버전에 따라 필드명이 다를 수 있으므로 여러 형태를 시도합니다.
 */
function extractBenchmarkScores(rowData: Record<string, unknown>): {
  average: number | null;
  mmlu: number | null;
  hellaswag: number | null;
  arc: number | null;
  truthfulqa: number | null;
  winogrande: number | null;
  gsm8k: number | null;
} {
  const parseScore = (...keys: string[]): number | null => {
    for (const key of keys) {
      const value = rowData?.[key];
      if (typeof value === 'number' && !isNaN(value)) return value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return null;
  };

  const mmlu = parseScore('mmlu', 'MMLU', 'mmlu_score');
  const hellaswag = parseScore('hellaswag', 'HellaSwag', 'hellaswag_score');
  const arc = parseScore('arc', 'ARC', 'arc_challenge', 'ARC-Challenge', 'arc_score');
  const truthfulqa = parseScore('truthfulqa', 'TruthfulQA', 'truthfulqa_mc2', 'truthfulqa_score');
  const winogrande = parseScore('winogrande', 'Winogrande', 'winogrande_score');
  const gsm8k = parseScore('gsm8k', 'GSM8K', 'gsm8k_score');

  // average 점수 추출, 없으면 개별 점수의 평균 계산
  let average = parseScore('Average', 'average', 'avg', 'average_score');

  if (average === null) {
    const individualScores = [mmlu, hellaswag, arc, truthfulqa, winogrande, gsm8k].filter(
      (s): s is number => s !== null
    );
    if (individualScores.length > 0) {
      average =
        Math.round(
          (individualScores.reduce((sum, s) => sum + s, 0) / individualScores.length) * 100
        ) / 100;
    }
  }

  return { average, mmlu, hellaswag, arc, truthfulqa, winogrande, gsm8k };
}
