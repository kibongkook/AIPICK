import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/** POST /api/suggestions/vote - 제안 투표 토글 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { suggestion_id } = await request.json();

  if (!suggestion_id) {
    return NextResponse.json({ error: 'Missing suggestion_id' }, { status: 400 });
  }

  // 이미 투표했는지 확인
  const { data: existing } = await supabase
    .from('tool_suggestion_votes')
    .select('id')
    .eq('user_id', user.id)
    .eq('suggestion_id', suggestion_id)
    .maybeSingle();

  if (existing) {
    // 투표 취소
    await supabase
      .from('tool_suggestion_votes')
      .delete()
      .eq('id', existing.id);

    return NextResponse.json({ voted: false });
  } else {
    // 투표
    const { error } = await supabase
      .from('tool_suggestion_votes')
      .insert({ user_id: user.id, suggestion_id });

    if (error) {
      console.error('Vote error:', error);
      return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
    }

    return NextResponse.json({ voted: true });
  }
}
