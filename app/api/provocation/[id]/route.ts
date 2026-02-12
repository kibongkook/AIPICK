import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/** GET /api/provocation/[id] - 제안 상세 조회 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: provocation, error } = await supabase
    .from('provocations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !provocation) {
    return NextResponse.json({ error: 'Provocation not found' }, { status: 404 });
  }

  // 사용자 투표 정보 추가
  if (user) {
    const { data: userVote } = await supabase
      .from('provocation_votes')
      .select('vote_type')
      .eq('provocation_id', id)
      .eq('user_id', user.id)
      .single();

    (provocation as any).user_vote = userVote?.vote_type || null;
  }

  // 투표 비율 계산
  const total = provocation.vote_up_count + provocation.vote_down_count;
  (provocation as any).vote_ratio = total > 0 ? provocation.vote_up_count / total : 0;

  return NextResponse.json({ provocation });
}
