import { NextRequest, NextResponse } from 'next/server';
import { getTools, getCategories, getAllPurposeRecommendations } from '@/lib/supabase/queries';
import { recommendTools } from '@/lib/recommend/engine';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const purposeSlug = searchParams.get('category') || searchParams.get('purpose') || '';
  const userTypeSlug = searchParams.get('userType') || '';
  const budget = (searchParams.get('budget') || 'any') as 'free' | 'under10' | 'any';
  const korean = (searchParams.get('korean') || 'any') as 'required' | 'any';

  const [tools, categories, purposeRecommendations] = await Promise.all([
    getTools(),
    getCategories(),
    getAllPurposeRecommendations(),
  ]);

  const results = recommendTools({
    tools,
    categories,
    purposeRecommendations,
    purposeSlug,
    userTypeSlug,
    budget,
    korean,
  });

  return NextResponse.json({
    results,
    total: results.length,
  });
}
