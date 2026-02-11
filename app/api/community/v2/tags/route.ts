import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/** GET /api/community/v2/tags - 태그 목록 조회 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ tags: [] });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // GOAL, AI_TOOL, FEATURE, KEYWORD
  const popular = searchParams.get('popular') === 'true';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  const supabase = await createClient();

  let query = supabase
    .from('community_tags')
    .select('*');

  // 타입 필터
  if (type) {
    query = query.eq('tag_type', type);
  }

  // 정렬
  if (popular) {
    query = query.order('usage_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.limit(limit);

  const { data: tags, error } = await query;

  if (error) {
    console.error('Tags fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }

  return NextResponse.json({ tags: tags || [] });
}
