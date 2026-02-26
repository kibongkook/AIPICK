import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callGeminiImageGeneration } from '@/lib/ai/providers';
import { checkRateLimit } from '@/lib/api/rate-limit';
import {
  DAILY_FREE_EXECUTIONS,
  EXECUTION_PRICE_KRW,
  EXECUTABLE_TOOLS,
  MAX_PROMPT_LENGTH,
  EXECUTION_RATE_LIMIT,
} from '@/lib/constants';

/** POST /api/recipe/execute-image — 이미지 생성 (JSON, base64) */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1. 인증
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'LOGIN_REQUIRED' }, { status: 401 });
  }

  // 2. Rate Limit (텍스트 실행과 동일한 rateLimitMap 공유)
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
    payment_id?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const { recipe_slug, option_id, step, tool_slug, prompt, payment_id } = body;

  if (!recipe_slug || !tool_slug || !prompt || typeof step !== 'number') {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: 'PROMPT_TOO_LONG' }, { status: 400 });
  }

  // 4. 이미지 도구 확인
  const config = EXECUTABLE_TOOLS[tool_slug];
  if (!config || config.type !== 'image') {
    return NextResponse.json({ error: 'UNSUPPORTED_TOOL' }, { status: 400 });
  }

  // 5. 무료 횟수 확인 (날짜 리셋 포함, DB 반영)
  const today = new Date().toISOString().slice(0, 10);

  // upsert: 레코드가 없으면 생성
  await supabase
    .from('user_executions')
    .upsert({ user_id: user.id, daily_reset_date: today }, { onConflict: 'user_id', ignoreDuplicates: true });

  const { data: execData } = await supabase
    .from('user_executions')
    .select('daily_free_used, daily_reset_date')
    .eq('user_id', user.id)
    .single();

  // 날짜가 변경된 경우 DB도 리셋 (execute/route.ts와 동일한 처리)
  if (execData && execData.daily_reset_date < today) {
    await supabase
      .from('user_executions')
      .update({ daily_free_used: 0, daily_reset_date: today, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
  }

  const dailyUsed = (execData && execData.daily_reset_date >= today)
    ? (execData.daily_free_used ?? 0)
    : 0;

  const isFree = dailyUsed < DAILY_FREE_EXECUTIONS;

  if (!isFree && !payment_id) {
    return NextResponse.json({
      error: 'FREE_LIMIT_REACHED',
      daily_free_used: dailyUsed,
      daily_free_limit: DAILY_FREE_EXECUTIONS,
      price: EXECUTION_PRICE_KRW,
    }, { status: 402 });
  }

  // 6. 결제 검증 (유료인 경우)
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

  // 7. 이미지 생성
  let imageResult: { base64: string; mimeType: string };
  try {
    imageResult = await callGeminiImageGeneration(prompt);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await supabase.from('recipe_executions').insert({
      user_id: user.id, recipe_slug, option_id: option_id || null, step_number: step,
      tool_slug, execution_type: 'image', provider: 'gemini', model: config.model,
      is_free: isFree, paid_amount: isFree ? 0 : EXECUTION_PRICE_KRW,
      payment_id: payment_id || null, status: 'error', error_message: errMsg,
    });
    return NextResponse.json({ error: 'IMAGE_GENERATION_FAILED', message: errMsg }, { status: 503 });
  }

  // 8. 성공 처리 (비동기) — 원자적 카운터 증가
  void (async () => {
    if (isFree) {
      // 원자적 증가 (날짜 리셋 포함한 DB 함수 사용)
      await supabase.rpc('record_free_execution', { p_user_id: user.id });
    }
    await supabase.from('recipe_executions').insert({
      user_id: user.id, recipe_slug, option_id: option_id || null, step_number: step,
      tool_slug, execution_type: 'image', provider: 'gemini', model: config.model,
      is_free: isFree, paid_amount: isFree ? 0 : EXECUTION_PRICE_KRW,
      payment_id: payment_id || null, status: 'success',
    });
  })();

  return NextResponse.json({
    success: true,
    image: {
      base64: imageResult.base64,
      mimeType: imageResult.mimeType,
      dataUrl: `data:${imageResult.mimeType};base64,${imageResult.base64}`,
    },
    is_free: isFree,
    remaining_free: Math.max(0, DAILY_FREE_EXECUTIONS - dailyUsed - (isFree ? 1 : 0)),
  });
}
