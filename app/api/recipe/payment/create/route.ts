import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PAYMENT_CONFIG, EXECUTION_PRICE_KRW } from '@/lib/constants';

/** POST /api/recipe/payment/create — 결제 주문 생성 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'LOGIN_REQUIRED' }, { status: 401 });
  }

  let body: { recipe_slug: string; step: number; tool_slug: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const { recipe_slug, step, tool_slug } = body;
  if (!recipe_slug || typeof step !== 'number' || !tool_slug) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }

  // 주문 ID 생성 (중복 없이)
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const orderId = `${PAYMENT_CONFIG.orderIdPrefix}-${timestamp}-${random}`;

  const orderName = 'AIPICK AI 레시피 실행 (1회)';

  // DB에 pending 상태로 저장
  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      order_id: orderId,
      amount: EXECUTION_PRICE_KRW,
      order_name: orderName,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    order_id: orderId,
    amount: EXECUTION_PRICE_KRW,
    order_name: orderName,
    payment_id: payment.id,
    currency: PAYMENT_CONFIG.currency,
  });
}
