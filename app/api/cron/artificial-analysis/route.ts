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
import { createClient } from '@/lib/supabase/server';

const SOURCE_KEY = 'artificial_analysis';

interface ArtificialAnalysisModel {
  name: string;
  quality_index: number;
  speed_ttft_ms?: number;
  speed_tps?: number;
  input_price?: number;
  output_price?: number;
}

/**
 * POST /api/cron/artificial-analysis - Artificial Analysis 벤치마크 데이터 수집
 *
 * 두 가지 입력 방식을 지원합니다:
 * 1. POST body에 직접 모델 데이터 전달 (관리자 수동 입력)
 * 2. ARTIFICIAL_ANALYSIS_URL 환경변수에 지정된 URL에서 JSON 가져오기
 *
 * Vercel Cron 또는 외부 스케줄러에서 호출
 * Authorization: Bearer <CRON_SECRET> 헤더로 인증
 */
export async function POST(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase not configured, skipping' });
  }

  const supabase = await createClient();
  const result: FetcherResult = { total: 0, updated: 0, skipped: 0, errors: [] };

  await markSourceRunning(supabase, SOURCE_KEY);

  try {
    // 모델 데이터 확보: POST body 우선, 없으면 외부 URL
    let models: ArtificialAnalysisModel[] = [];

    const body = await request.json().catch(() => ({}));

    if (Array.isArray(body.models) && body.models.length > 0) {
      // 방법 1: POST body에서 직접 전달
      models = body.models;
    } else {
      // 방법 2: 환경변수 URL에서 가져오기
      const fetchUrl = process.env.ARTIFICIAL_ANALYSIS_URL;
      if (!fetchUrl) {
        await markSourceComplete(supabase, SOURCE_KEY, {
          ...result,
          errors: ['No models in request body and ARTIFICIAL_ANALYSIS_URL not configured'],
        });
        return NextResponse.json({
          success: false,
          message: 'No models provided and ARTIFICIAL_ANALYSIS_URL not configured',
        });
      }

      try {
        const res = await fetch(fetchUrl, {
          headers: { 'User-Agent': 'AIPICK-Bot/1.0' },
          next: { revalidate: 0 },
        });

        if (!res.ok) {
          throw new Error(`Fetch failed with status ${res.status}`);
        }

        const data = await res.json();
        // 응답이 배열이면 직접, 아니면 models 키 탐색
        models = Array.isArray(data) ? data : (data.models ?? data.data ?? []);
      } catch (fetchError) {
        const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
        await markSourceComplete(supabase, SOURCE_KEY, {
          ...result,
          errors: [`Failed to fetch from ARTIFICIAL_ANALYSIS_URL: ${errorMsg}`],
        });
        return NextResponse.json({ success: false, error: errorMsg }, { status: 502 });
      }
    }

    if (models.length === 0) {
      await markSourceComplete(supabase, SOURCE_KEY, result);
      return NextResponse.json({ success: true, ...result, message: 'No models to process' });
    }

    result.total = models.length;

    // DB 도구 목록을 한 번만 로드하여 캐시
    const cachedTools = await loadToolIdentifiers(supabase);

    for (const model of models) {
      if (!model.name || model.quality_index == null) {
        result.skipped++;
        continue;
      }

      try {
        // 모델명으로 DB 도구 매칭
        const tool = await findToolByModelName(supabase, model.name, cachedTools);
        if (!tool) {
          result.skipped++;
          continue;
        }

        // tool_benchmark_scores 테이블에 저장
        const { error: benchmarkError } = await supabase
          .from('tool_benchmark_scores')
          .upsert(
            {
              tool_id: tool.id,
              benchmark_source: SOURCE_KEY,
              quality_index: model.quality_index,
              speed_ttft_ms: model.speed_ttft_ms ?? null,
              speed_tps: model.speed_tps ?? null,
              extra_scores: {
                input_price: model.input_price ?? null,
                output_price: model.output_price ?? null,
              },
              fetched_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'tool_id,benchmark_source' }
          );

        if (benchmarkError) {
          result.errors.push(`Benchmark upsert failed for ${model.name}: ${benchmarkError.message}`);
          continue;
        }

        // tool_external_scores 테이블에 정규화 점수 저장
        // quality_index는 이미 0-100 범위
        const normalizedScore = Math.min(Math.max(model.quality_index, 0), 100);
        await upsertExternalScore(supabase, tool.id, SOURCE_KEY, normalizedScore, {
          quality_index: model.quality_index,
          speed_ttft_ms: model.speed_ttft_ms ?? null,
          speed_tps: model.speed_tps ?? null,
          input_price: model.input_price ?? null,
          output_price: model.output_price ?? null,
        });

        // has_benchmark_data 플래그 업데이트
        await supabase
          .from('tools')
          .update({ has_benchmark_data: true, updated_at: new Date().toISOString() })
          .eq('id', tool.id);

        result.updated++;

        // rate limit 방지
        await delay(100);
      } catch (modelError) {
        const errorMsg = modelError instanceof Error ? modelError.message : String(modelError);
        result.errors.push(`Error processing ${model.name}: ${errorMsg}`);
      }
    }
  } catch (topError) {
    const errorMsg = topError instanceof Error ? topError.message : String(topError);
    result.errors.push(`Top-level error: ${errorMsg}`);
  }

  await markSourceComplete(supabase, SOURCE_KEY, result);

  return NextResponse.json({
    success: result.errors.length === 0,
    source: SOURCE_KEY,
    ...result,
  });
}
