import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** GET /api/recipe/payment/list — 로그인 사용자의 결제 내역 조회 */
export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('payments')
    .select('order_id, payment_key, amount, order_name, method, status, confirmed_at, cancelled_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 });
  }

  return NextResponse.json({ payments: data ?? [] });
}
