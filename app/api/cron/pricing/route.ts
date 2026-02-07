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

const SOURCE_KEY = 'openrouter';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/models';
const RATE_LIMIT_MS = 100;

/**
 * POST /api/cron/pricing - OpenRouter 모델 가격 데이터 수집
 *
 * OpenRouter API에서 모델별 가격(prompt/completion), 컨텍스트 길이 등을 수집하여
 * DB의 도구와 매칭하고, 가격 데이터 및 value_score를 저장합니다.
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
    // OpenRouter API에서 모델 목록 가져오기
    const headers: Record<string, string> = {
      'User-Agent': 'AIPICK-Bot',
    };
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey) {
      headers['Authorization'] = `Bearer ${openrouterKey}`;
    }

    const response = await fetch(OPENROUTER_API_URL, {
      headers,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      result.errors.push(`OpenRouter API error: HTTP ${response.status}`);
      await markSourceComplete(supabase, SOURCE_KEY, result);
      return NextResponse.json({ success: false, ...result });
    }

    const json = await response.json();
    const models = json?.data;

    if (!models || !Array.isArray(models)) {
      result.errors.push('Invalid response format: missing data array');
      await markSourceComplete(supabase, SOURCE_KEY, result);
      return NextResponse.json({ success: false, ...result });
    }

    result.total = models.length;

    // DB에서 도구 식별 정보를 캐싱하여 로드
    const cachedTools = await loadToolIdentifiers(supabase);

    // 먼저 매칭된 모델만 필터링하고 가격 정보를 수집
    const matchedModels: Array<{
      toolId: string;
      toolName: string;
      modelId: string;
      modelName: string;
      promptPrice: number;
      completionPrice: number;
      contextLength: number | null;
      topProvider: unknown;
      rawData: Record<string, unknown>;
    }> = [];

    for (const model of models) {
      const modelId = model?.id;
      const modelName = model?.name;

      if (!modelId && !modelName) {
        result.skipped++;
        continue;
      }

      try {
        // 모델명 또는 ID로 DB 도구와 매칭
        const matchedTool = await findToolByModelName(
          supabase,
          modelId ?? modelName,
          cachedTools
        );

        if (!matchedTool) {
          result.skipped++;
          continue;
        }

        const pricing = model?.pricing;
        const promptPrice = parseFloat(pricing?.prompt ?? '0') || 0;
        const completionPrice = parseFloat(pricing?.completion ?? '0') || 0;
        const contextLength = typeof model?.context_length === 'number' ? model.context_length : null;

        matchedModels.push({
          toolId: matchedTool.id,
          toolName: matchedTool.name,
          modelId: modelId ?? '',
          modelName: modelName ?? '',
          promptPrice,
          completionPrice,
          contextLength,
          topProvider: model?.top_provider ?? null,
          rawData: {
            id: modelId,
            name: modelName,
            pricing: { prompt: promptPrice, completion: completionPrice },
            context_length: contextLength,
            top_provider: model?.top_provider ?? null,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        result.errors.push(`${modelName ?? modelId}: ${message}`);
      }
    }

    // value_score 계산을 위한 최대 completion 가격 산출
    const completionPrices = matchedModels
      .map((m) => m.completionPrice)
      .filter((p) => p > 0);
    const maxPrice = completionPrices.length > 0 ? Math.max(...completionPrices) : 1;

    // 가격 데이터 저장
    for (const entry of matchedModels) {
      try {
        // tool_pricing_data 테이블에 upsert
        const { error: pricingError } = await supabase
          .from('tool_pricing_data')
          .upsert(
            {
              tool_id: entry.toolId,
              source: SOURCE_KEY,
              model_id: entry.modelId,
              model_name: entry.modelName,
              prompt_price: entry.promptPrice,
              completion_price: entry.completionPrice,
              context_length: entry.contextLength,
              raw_data: entry.rawData,
              fetched_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'tool_id,source' }
          );

        if (pricingError) {
          result.errors.push(`pricing upsert ${entry.toolName}: ${pricingError.message}`);
          continue;
        }

        // value_score 계산: 가격이 낮을수록 점수가 높음
        // 무료 모델(completion price = 0)은 최고 점수 100
        const valueScore =
          entry.completionPrice === 0
            ? 100
            : (1 - entry.completionPrice / maxPrice) * 100;

        // tool_external_scores에 정규화된 점수 저장
        await upsertExternalScore(supabase, entry.toolId, SOURCE_KEY, valueScore, entry.rawData);

        result.updated++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        result.errors.push(`upsert ${entry.toolName}: ${message}`);
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
