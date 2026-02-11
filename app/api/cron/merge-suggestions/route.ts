import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth } from '@/lib/pipeline/fetcher-base';
import { resolveLogoUrl } from '@/lib/utils/logo-resolver';

/**
 * POST /api/cron/merge-suggestions
 *
 * 승인된 제안을 tools 테이블로 자동 병합
 */
export async function POST(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase not configured' });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  // 승인된 제안 조회
  const { data: suggestions, error } = await supabase
    .from('tool_suggestions')
    .select('*')
    .eq('status', 'approved')
    .is('merged_tool_id', null)
    .limit(10);

  if (error || !suggestions?.length) {
    return NextResponse.json({
      success: true,
      message: 'No suggestions to merge',
      merged: 0,
      failed: 0,
      total: 0
    });
  }

  let merged = 0;
  let failed = 0;

  for (const suggestion of suggestions) {
    try {
      // 카테고리 ID 조회
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', suggestion.category_slug)
        .single();

      if (!category) {
        console.error(`Category not found: ${suggestion.category_slug}`);
        failed++;
        continue;
      }

      // Slug 생성 (중복 방지)
      let slug = suggestion.tool_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { data: existingSlug } = await supabase
        .from('tools')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();

      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }

      // 로고 URL 해결
      const logoUrl = resolveLogoUrl(suggestion.tool_url, suggestion.tool_name);

      // tools 테이블에 삽입
      const { data: tool, error: toolError } = await supabase
        .from('tools')
        .insert({
          name: suggestion.tool_name,
          slug,
          url: suggestion.tool_url,
          description: suggestion.tool_description,
          logo_url: logoUrl,
          category_id: category.id,
          pricing_type: 'Freemium',
          supports_korean: false,
          is_editor_pick: false,
          rating_avg: 0,
          review_count: 0,
          visit_count: 0,
          upvote_count: 0,
          ranking_score: 0,
          weekly_visit_delta: 0,
          hybrid_score: 0,
          external_score: 0,
          internal_score: 0,
          trend_direction: 'new',
          trend_magnitude: 0,
          has_benchmark_data: false,
        })
        .select('id')
        .single();

      if (toolError || !tool) {
        console.error('Tool insertion error:', toolError);
        failed++;
        continue;
      }

      // 제안 상태 업데이트
      await supabase
        .from('tool_suggestions')
        .update({
          status: 'merged',
          merged_tool_id: tool.id,
          merged_at: new Date().toISOString(),
        })
        .eq('id', suggestion.id);

      merged++;
    } catch (err) {
      console.error('Merge error:', err);
      failed++;
    }
  }

  return NextResponse.json({
    success: true,
    merged,
    failed,
    total: suggestions.length,
  });
}
