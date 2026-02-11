import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * GET /api/user/leaderboard — 리더보드 (TOP 기여자)
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ leaderboard: [] });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

  const { data } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url, level, experience_points, question_count, answer_count, accepted_answer_count, review_count')
    .order('experience_points', { ascending: false })
    .limit(limit);

  return NextResponse.json({ leaderboard: data || [] });
}
