import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DAILY_FREE_EXECUTIONS } from '@/lib/constants';

/** GET /api/recipe/status — 남은 무료 횟수 조회 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ logged_in: false, daily_free_used: 0, daily_free_limit: DAILY_FREE_EXECUTIONS });
  }

  const today = new Date().toISOString().slice(0, 10);

  // upsert
  await supabase
    .from('user_executions')
    .upsert({ user_id: user.id, daily_reset_date: today }, { onConflict: 'user_id', ignoreDuplicates: true });

  const { data } = await supabase
    .from('user_executions')
    .select('daily_free_used, daily_reset_date, total_free_used, total_paid_used, total_paid_amount')
    .eq('user_id', user.id)
    .single();

  let daily_free_used = data?.daily_free_used ?? 0;

  // 날짜 리셋
  if (data && data.daily_reset_date < today) {
    await supabase
      .from('user_executions')
      .update({ daily_free_used: 0, daily_reset_date: today, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    daily_free_used = 0;
  }

  return NextResponse.json({
    logged_in: true,
    daily_free_used,
    daily_free_limit: DAILY_FREE_EXECUTIONS,
    remaining_free: Math.max(0, DAILY_FREE_EXECUTIONS - daily_free_used),
    total_free_used: data?.total_free_used ?? 0,
    total_paid_used: data?.total_paid_used ?? 0,
    total_paid_amount: data?.total_paid_amount ?? 0,
  });
}
