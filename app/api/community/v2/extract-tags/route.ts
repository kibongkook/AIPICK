import { NextRequest, NextResponse } from 'next/server';
import { extractTags, enrichAIToolTags } from '@/lib/community/tag-extractor';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/** POST /api/community/v2/extract-tags - 태그 자동 추출 (미리보기) */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }

  // 태그 추출
  const tags = await extractTags(title, content, {
    minConfidence: 0.4, // 미리보기는 신뢰도 낮춰서 더 많이 보여줌
    maxTags: 15,
  });

  // Supabase가 설정되어 있으면 AI 도구 ID 조회
  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const enrichedTags = await enrichAIToolTags(tags, async (slug) => {
      const { data } = await supabase
        .from('tools')
        .select('id')
        .eq('slug', slug)
        .single();
      return data;
    });

    return NextResponse.json({ tags: enrichedTags });
  }

  return NextResponse.json({ tags });
}
