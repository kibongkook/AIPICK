import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAITextStream } from '@/lib/ai/providers';
import { getSystemPrompt } from '@/lib/ai/system-prompts';
import { checkRateLimit } from '@/lib/api/rate-limit';
import {
  DAILY_FREE_EXECUTIONS,
  EXECUTION_PRICE_KRW,
  EXECUTABLE_TOOLS,
  MAX_PROMPT_LENGTH,
  EXECUTION_RATE_LIMIT,
} from '@/lib/constants';

// ── 일일 실행 상태 조회 + 자동 리셋 ──
async function getUserExecutionStatus(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  // upsert: 없으면 생성
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from('user_executions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!existing) {
    const { data } = await supabase
      .from('user_executions')
      .insert({ user_id: userId, daily_reset_date: today })
      .select()
      .single();
    return data;
  }

  // 날짜 바뀌었으면 리셋
  if (existing.daily_reset_date < today) {
    const { data } = await supabase
      .from('user_executions')
      .update({ daily_free_used: 0, daily_reset_date: today, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    return data;
  }

  return existing;
}

// ── 실행 이력 저장 ──
async function saveExecutionHistory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    userId: string;
    recipeSlug: string;
    optionId: string | null;
    stepNumber: number;
    toolSlug: string;
    provider: string;
    model: string;
    isFree: boolean;
    paymentId: string | null;
    status: 'success' | 'error';
    errorMessage?: string;
  }
) {
  await supabase.from('recipe_executions').insert({
    user_id: params.userId,
    recipe_slug: params.recipeSlug,
    option_id: params.optionId,
    step_number: params.stepNumber,
    tool_slug: params.toolSlug,
    execution_type: 'text',
    provider: params.provider,
    model: params.model,
    is_free: params.isFree,
    paid_amount: params.isFree ? 0 : EXECUTION_PRICE_KRW,
    payment_id: params.paymentId,
    status: params.status,
    error_message: params.errorMessage || null,
  });
}

/** POST /api/recipe/execute — 텍스트/코드 실행 (SSE 스트리밍) */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1. 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'LOGIN_REQUIRED' }, { status: 401 });
  }

  // 2. Rate Limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!checkRateLimit(`ip:${ip}`, EXECUTION_RATE_LIMIT.perMinutePerIP)) {
    return NextResponse.json({ error: 'RATE_LIMIT_IP' }, { status: 429 });
  }
  if (!checkRateLimit(`user:${user.id}`, EXECUTION_RATE_LIMIT.perMinutePerUser)) {
    return NextResponse.json({ error: 'RATE_LIMIT_USER' }, { status: 429 });
  }

  // 3. 요청 파싱
  let body: {
    recipe_slug: string;
    option_id?: string;
    step: number;
    tool_slug: string;
    prompt: string;
    category?: string;
    system_prompt?: string;
    payment_id?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const { recipe_slug, option_id, step, tool_slug, prompt, category, system_prompt, payment_id } = body;

  // 4. 입력 검증
  if (!recipe_slug || !tool_slug || !prompt || typeof step !== 'number') {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: 'PROMPT_TOO_LONG', max: MAX_PROMPT_LENGTH }, { status: 400 });
  }
  // system_prompt 길이 제한 (클라이언트 제공 커스텀 프롬프트)
  if (system_prompt && system_prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: 'SYSTEM_PROMPT_TOO_LONG', max: MAX_PROMPT_LENGTH }, { status: 400 });
  }

  // 5. 실행 가능한 도구인지 확인
  const config = EXECUTABLE_TOOLS[tool_slug];
  if (!config || config.type !== 'text' && config.type !== 'code') {
    return NextResponse.json({ error: 'UNSUPPORTED_TOOL', tool_slug }, { status: 400 });
  }

  // 6. 무료 횟수 확인
  const execStatus = await getUserExecutionStatus(supabase, user.id);
  const dailyUsed = execStatus?.daily_free_used ?? 0;
  const isFree = dailyUsed < DAILY_FREE_EXECUTIONS;

  if (!isFree && !payment_id) {
    return NextResponse.json({
      error: 'FREE_LIMIT_REACHED',
      daily_free_used: dailyUsed,
      daily_free_limit: DAILY_FREE_EXECUTIONS,
      price: EXECUTION_PRICE_KRW,
    }, { status: 402 });
  }

  // 7. 유료인 경우 결제 검증
  if (!isFree && payment_id) {
    const { data: payment } = await supabase
      .from('payments')
      .select('status, user_id')
      .eq('payment_key', payment_id)
      .single();

    if (!payment || payment.status !== 'confirmed' || payment.user_id !== user.id) {
      return NextResponse.json({ error: 'INVALID_PAYMENT' }, { status: 403 });
    }
  }

  // 8. 시스템 프롬프트 결정
  const finalSystemPrompt = getSystemPrompt(category, system_prompt);

  // 9. AI 실행
  let stream: ReadableStream<Uint8Array>;
  let usedProvider = config.provider;
  let usedModel = config.model;

  try {
    stream = await callAITextStream(config.provider, config.model, prompt, finalSystemPrompt);
  } catch {
    // 폴백 시도
    if (config.fallback) {
      try {
        usedProvider = config.fallback.provider;
        usedModel = config.fallback.model;
        stream = await callAITextStream(config.fallback.provider, config.fallback.model, prompt, finalSystemPrompt);
      } catch (fallbackErr) {
        const errMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        // 실패 이력 저장 (비동기)
        void saveExecutionHistory(supabase, {
          userId: user.id, recipeSlug: recipe_slug, optionId: option_id || null,
          stepNumber: step, toolSlug: tool_slug,
          provider: usedProvider, model: usedModel,
          isFree, paymentId: payment_id || null,
          status: 'error', errorMessage: errMsg,
        });
        return NextResponse.json({ error: 'AI_UNAVAILABLE', message: errMsg }, { status: 503 });
      }
    } else {
      return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 });
    }
  }

  // 10. 성공 처리 (비동기) — 원자적 카운터 증가
  void (async () => {
    if (isFree) {
      // SELECT+UPDATE 대신 단일 원자적 UPDATE (경쟁 조건 제거)
      await supabase.rpc('record_free_execution', { p_user_id: user.id });
    }

    // 이력 저장
    await saveExecutionHistory(supabase, {
      userId: user.id, recipeSlug: recipe_slug, optionId: option_id || null,
      stepNumber: step, toolSlug: tool_slug,
      provider: usedProvider, model: usedModel,
      isFree, paymentId: payment_id || null,
      status: 'success',
    });
  })();

  // 11. SSE 응답 반환
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Provider': usedProvider,
      'X-Is-Free': String(isFree),
      'X-Remaining-Free': String(Math.max(0, DAILY_FREE_EXECUTIONS - dailyUsed - (isFree ? 1 : 0))),
    },
  });
}
