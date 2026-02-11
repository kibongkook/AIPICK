import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import seedData from '@/data/seed.json';

/**
 * GET /api/community/v2/mentions?q=chat
 * @멘션 자동완성 — 도구 검색
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query || query.length < 1) {
    return NextResponse.json({ tools: [] });
  }

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data } = await supabase
      .from('tools')
      .select('id, name, slug')
      .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
      .order('visit_count', { ascending: false })
      .limit(8);

    return NextResponse.json({ tools: data || [] });
  }

  // seed fallback
  const q = query.toLowerCase();
  const tools = (seedData.tools || [])
    .filter(t => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q))
    .slice(0, 8)
    .map(t => ({ id: t.id, name: t.name, slug: t.slug }));

  return NextResponse.json({ tools });
}
