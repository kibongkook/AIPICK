import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** POST /api/recipe/payment/webhook — 토스페이먼츠 웹훅 (환불/취소 처리) */
export async function POST(request: NextRequest) {
  // 웹훅 시크릿 검증
  const webhookSecret = process.env.TOSS_PAYMENTS_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = request.headers.get('toss-signature');
    if (!signature || signature !== webhookSecret) {
      return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 401 });
    }
  }

  let body: { eventType: string; data: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const { eventType, data } = body;
  const supabase = await createClient();

  switch (eventType) {
    case 'PAYMENT_STATUS_CHANGED': {
      const { paymentKey, orderId, status } = data as {
        paymentKey: string;
        orderId: string;
        status: string;
      };

      if (status === 'CANCELED') {
        await supabase
          .from('payments')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('order_id', orderId || '');
      } else if (status === 'PARTIAL_CANCELED') {
        await supabase
          .from('payments')
          .update({ status: 'refunded', cancelled_at: new Date().toISOString() })
          .eq('payment_key', paymentKey || '');
      }
      break;
    }
    default:
      // 기타 이벤트 무시
      break;
  }

  return NextResponse.json({ received: true });
}
