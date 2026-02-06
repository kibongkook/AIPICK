import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** POST /api/guides/views - 가이드 조회수 증가 */
export async function POST(request: NextRequest) {
  const { guide_id } = await request.json();
  if (!guide_id) {
    return NextResponse.json({ error: 'guide_id required' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: guide } = await supabase
    .from('guides')
    .select('view_count')
    .eq('id', guide_id)
    .single();

  if (guide) {
    await supabase
      .from('guides')
      .update({ view_count: guide.view_count + 1 })
      .eq('id', guide_id);
  }

  return NextResponse.json({ success: true });
}
