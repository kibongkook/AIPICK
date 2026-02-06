import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** POST /api/collections/like - 컬렉션 좋아요 증가 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { collection_id } = await request.json();
  if (!collection_id) {
    return NextResponse.json({ error: 'collection_id required' }, { status: 400 });
  }

  const { data: collection } = await supabase
    .from('collections')
    .select('like_count')
    .eq('id', collection_id)
    .single();

  if (collection) {
    await supabase
      .from('collections')
      .update({ like_count: collection.like_count + 1 })
      .eq('id', collection_id);
  }

  return NextResponse.json({ success: true });
}
