import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth, markSourceRunning, markSourceComplete, upsertExternalScore, delay } from '@/lib/pipeline/fetcher-base';
import { DATA_SOURCE_KEYS } from '@/lib/constants';
import { normalizeToScale } from '@/lib/scoring';

const SOURCE_KEY = DATA_SOURCE_KEYS.PLAY_STORE;

/**
 * POST /api/cron/play-store - Google Play Store 평점/리뷰 수 수집
 *
 * play_store_id가 있는 도구에 대해 google-play-scraper로
 * 평점, 리뷰 수, 설치 수를 수집하여 tool_external_scores 업데이트
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

  // play_store_id가 있는 도구만 조회
  const { data: tools, error } = await supabase
    .from('tools')
    .select('id, name, play_store_id')
    .not('play_store_id', 'is', null);

  if (error || !tools?.length) {
    await markSourceComplete(supabase, SOURCE_KEY, result);
    return NextResponse.json({ success: true, updated: 0, message: 'No Play Store tools found' });
  }

  result.total = tools.length;

  const gplay = await import('google-play-scraper');

  for (const tool of tools) {
    try {
      const appData = await gplay.default.app({
        appId: tool.play_store_id,
        lang: 'en',
        country: 'us',
      });

      const score = appData.score || 0;
      const ratings = appData.ratings || 0;
      const installs = appData.installs || null;

      // 1-5 평점을 0-100으로 정규화
      const normalizedScore = normalizeToScale(score, 5);

      await upsertExternalScore(supabase, tool.id, SOURCE_KEY, normalizedScore, {
        rating: score,
        review_count: ratings,
        installs,
      });

      result.updated++;
      await delay(2000);
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
