import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EXECUTION_PRICE_KRW } from '@/lib/constants';

/** POST /api/recipe/payment/confirm — 토스페이먼츠 결제 승인 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'LOGIN_REQUIRED' }, { status: 401 });
  }

  let body: { paymentKey: string; orderId: string; amount: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const { paymentKey, orderId, amount } = body;
  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }

  // 금액 검증
  if (amount !== EXECUTION_PRICE_KRW) {
    return NextResponse.json({ error: 'INVALID_AMOUNT' }, { status: 400 });
  }

  // 주문 존재 확인
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id, user_id, status, amount')
    .eq('order_id', orderId)
    .single();

  if (!existingPayment) {
    return NextResponse.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
  }
  if (existingPayment.user_id !== user.id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }
  if (existingPayment.status !== 'pending') {
    return NextResponse.json({ error: 'ALREADY_PROCESSED' }, { status: 409 });
  }

  // 토스페이먼츠 승인 API 호출
  const tossSecretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
  if (!tossSecretKey) {
    return NextResponse.json({ error: 'PAYMENT_CONFIG_ERROR' }, { status: 500 });
  }

  const encodedKey = Buffer.from(`${tossSecretKey}:`).toString('base64');

  let tossResponse: Response;
  try {
    tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
  } catch {
    return NextResponse.json({ error: 'PAYMENT_GATEWAY_ERROR' }, { status: 503 });
  }

  if (!tossResponse.ok) {
    const errData = await tossResponse.json().catch(() => ({}));
    // 결제 실패 상태 업데이트
    await supabase
      .from('payments')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('order_id', orderId);

    return NextResponse.json({
      error: 'PAYMENT_FAILED',
      toss_error: errData,
    }, { status: 400 });
  }

  const tossResult = await tossResponse.json();

  // 결제 성공 DB 업데이트
  await supabase
    .from('payments')
    .update({
      payment_key: paymentKey,
      status: 'confirmed',
      method: tossResult.method || null,
      receipt_url: tossResult.receipt?.url || null,
      confirmed_at: new Date().toISOString(),
    })
    .eq('order_id', orderId);

  // 유료 실행 횟수 업데이트
  void (async () => {
    const { data: current } = await supabase
      .from('user_executions')
      .select('total_paid_used, total_paid_amount')
      .eq('user_id', user.id)
      .single();
    if (current) {
      await supabase
        .from('user_executions')
        .update({
          total_paid_used: (current.total_paid_used || 0) + 1,
          total_paid_amount: (current.total_paid_amount || 0) + EXECUTION_PRICE_KRW,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    }
  })();

  return NextResponse.json({
    success: true,
    payment_key: paymentKey,
    order_id: orderId,
    method: tossResult.method,
    receipt_url: tossResult.receipt?.url,
  });
}
