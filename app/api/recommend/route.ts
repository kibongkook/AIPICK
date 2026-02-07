import { NextRequest, NextResponse } from 'next/server';
import { getTools, getAllJobRecommendations, getAllEduRecommendations } from '@/lib/supabase/queries';
import { recommendTools } from '@/lib/recommend/engine';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const category = searchParams.get('category') || '';
  const persona = searchParams.get('persona') || '';
  const personaType = (searchParams.get('personaType') || '') as 'job' | 'edu' | '';
  const budget = (searchParams.get('budget') || 'any') as 'free' | 'under10' | 'any';
  const korean = (searchParams.get('korean') || 'any') as 'required' | 'any';

  const [tools, jobRecommendations, eduRecommendations] = await Promise.all([
    getTools(),
    getAllJobRecommendations(),
    getAllEduRecommendations(),
  ]);

  const results = recommendTools({
    tools,
    jobRecommendations,
    eduRecommendations,
    category,
    persona,
    personaType,
    budget,
    korean,
  });

  return NextResponse.json({
    results,
    total: results.length,
  });
}
