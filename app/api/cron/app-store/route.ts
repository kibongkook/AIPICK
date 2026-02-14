import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth, markSourceRunning, markSourceComplete, upsertExternalScore, delay } from '@/lib/pipeline/fetcher-base';
import { DATA_SOURCE_KEYS } from '@/lib/constants';
import { normalizeToScale } from '@/lib/scoring';

const SOURCE_KEY = DATA_SOURCE_KEYS.APP_STORE;

/**
 * POST /api/cron/app-store - App Store 평점/리뷰 수 수집
 *
 * app_store_id가 있는 도구에 대해 iTunes Lookup API로
 * 평점 및 리뷰 수를 수집하여 tool_external_scores 업데이트
 */
export async function POST(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase not configured, skipping' });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  await markSourceRunning(supabase, SOURCE_KEY);

  const result = { total: 0, updated: 0, skipped: 0, errors: [] as string[] };

  // app_store_id가 있는 도구만 조회
  const { data: tools, error } = await supabase
    .from('tools')
    .select('id, name, app_store_id')
    .not('app_store_id', 'is', null);

  if (error || !tools?.length) {
    await markSourceComplete(supabase, SOURCE_KEY, result);
    return NextResponse.json({ success: true, updated: 0, message: 'No App Store tools found' });
  }

  result.total = tools.length;

  for (const tool of tools) {
    try {
      const res = await fetch(
        `https://itunes.apple.com/lookup?id=${tool.app_store_id}&country=us`,
        { next: { revalidate: 0 } }
      );

      if (!res.ok) {
        result.errors.push(`${tool.name}: HTTP ${res.status}`);
        result.skipped++;
        continue;
      }

      const data = await res.json();
      const app = data.results?.[0];

      if (!app) {
        result.errors.push(`${tool.name}: No results from iTunes API`);
        result.skipped++;
        continue;
      }

      const rating = app.averageUserRating || 0;
      const reviewCount = app.userRatingCount || 0;
      const version = app.version || null;
      const genre = app.primaryGenreName || null;

      // 1-5 평점을 0-100으로 정규화
      const normalizedScore = normalizeToScale(rating, 5);

      await upsertExternalScore(supabase, tool.id, SOURCE_KEY, normalizedScore, {
        rating,
        review_count: reviewCount,
        version,
        genre,
      });

      result.updated++;
      await delay(500);
    } catch (err) {
      result.errors.push(`${tool.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      result.skipped++;
    }
  }

  await markSourceComplete(supabase, SOURCE_KEY, result);

  return NextResponse.json({
    success: true,
    total: result.total,
    updated: result.updated,
    skipped: result.skipped,
    errors: result.errors.length,
  });
}
