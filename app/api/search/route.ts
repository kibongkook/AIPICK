import { NextRequest, NextResponse } from 'next/server';
import { searchTools, getAutocompleteSuggestions } from '@/lib/supabase/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query = searchParams.get('q') || '';
  const mode = searchParams.get('mode'); // 'autocomplete' 모드 지원

  // 자동완성 모드
  if (mode === 'autocomplete') {
    const suggestions = await getAutocompleteSuggestions(query);
    return NextResponse.json({
      suggestions: suggestions.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        description: t.description.slice(0, 60),
        pricing_type: t.pricing_type,
      })),
    });
  }

  // 검색 모드
  const pricing = searchParams.getAll('pricing');
  const category = searchParams.getAll('category');
  const supports_korean = searchParams.get('korean') === 'true';
  const min_rating = searchParams.get('min_rating') ? Number(searchParams.get('min_rating')) : undefined;
  const job = searchParams.get('job') || undefined;
  const edu = searchParams.get('edu') || undefined;
  const sort = (searchParams.get('sort') as 'popular' | 'rating' | 'latest' | 'free_first') || 'popular';

  const results = await searchTools({
    query: query || undefined,
    pricing: pricing.length > 0 ? pricing : undefined,
    category: category.length > 0 ? category : undefined,
    supports_korean: supports_korean || undefined,
    min_rating,
    job,
    edu,
    sort,
  });

  return NextResponse.json({
    results,
    total: results.length,
    query,
  });
}
