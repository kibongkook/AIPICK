import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { VoteType } from '@/types';

/** POST /api/provocation/[id]/vote - 투표 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { vote_type } = body;

  // 검증
  if (!vote_type || !['up', 'down'].includes(vote_type)) {
    return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
  }

  // 제안 존재 확인
  const { data: provocation, error: provocationError } = await supabase
    .from('provocations')
    .select('id, status')
    .eq('id', id)
    .single();

  if (provocationError || !provocation) {
    return NextResponse.json({ error: 'Provocation not found' }, { status: 404 });
  }

  // 투표 가능 상태 확인 (submitted, voting 상태만 투표 가능)
  if (!['submitted', 'voting'].includes(provocation.status)) {
    return NextResponse.json({ error: 'Voting not allowed for this provocation' }, { status: 400 });
  }

  // 기존 투표 확인 (한 번만 투표 가능)
  const { data: existingVote } = await supabase
    .from('provocation_votes')
    .select('id, vote_type')
    .eq('provocation_id', id)
    .eq('user_id', user.id)
    .single();

  if (existingVote) {
    return NextResponse.json({ error: '이미 투표하셨습니다. 투표는 한 번만 가능합니다.' }, { status: 400 });
  }

  // 새 투표 추가
  const { error: insertError } = await supabase
    .from('provocation_votes')
    .insert({
      provocation_id: id,
      user_id: user.id,
      vote_type,
    });

  if (insertError) {
    console.error('Vote insert error:', insertError);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Vote recorded', vote: vote_type });
}
