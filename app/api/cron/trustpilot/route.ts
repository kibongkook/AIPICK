import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth, markSourceRunning, markSourceComplete, upsertExternalScore, delay } from '@/lib/pipeline/fetcher-base';
import { DATA_SOURCE_KEYS } from '@/lib/constants';
import { normalizeToScale } from '@/lib/scoring';

const SOURCE_KEY = DATA_SOURCE_KEYS.TRUSTPILOT;

const REQUEST_DELAY_MS = 1500;

/**
 * POST /api/cron/trustpilot - Trustpilot 평점 수집
 *
 * trustpilot_domain이 설정된 도구의 Trustpilot 평점과 리뷰 수를
 * 수집하여 tool_external_scores에 저장합니다.
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

  // trustpilot_domain이 있는 도구만 조회
  const { data: tools, error } = await supabase
    .from('tools')
    .select('id, name, trustpilot_domain')
    .not('trustpilot_domain', 'is', null);

  if (error || !tools?.length) {
    await markSourceComplete(supabase, SOURCE_KEY, result);
    return NextResponse.json({ success: true, updated: 0, message: 'No tools with trustpilot_domain found' });
  }

  result.total = tools.length;

  for (const tool of tools) {
    try {
      const res = await fetch(
        `https://www.trustpilot.com/api/categories-and-header/business-unit/find?name=${encodeURIComponent(tool.trustpilot_domain)}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AIPICK-Bot',
          },
          next: { revalidate: 0 },
        }
      );

      if (res.status === 404) {
        result.skipped++;
        await delay(REQUEST_DELAY_MS);
        continue;
      }

      if (!res.ok) {
        result.errors.push(`${tool.name}: HTTP ${res.status}`);
        result.skipped++;
        await delay(REQUEST_DELAY_MS);
        continue;
      }

      const data = await res.json();

      const trustScore = data.trustScore;
      const numberOfReviews = data.numberOfReviews;

      if (trustScore == null) {
        result.skipped++;
        await delay(REQUEST_DELAY_MS);
        continue;
      }

      const normalizedScore = normalizeToScale(trustScore, 5);

      await upsertExternalScore(supabase, tool.id, SOURCE_KEY, normalizedScore, {
        rating: trustScore,
        review_count: numberOfReviews ?? 0,
        domain: tool.trustpilot_domain,
      });

      result.updated++;
    } catch (err) {
      result.errors.push(`${tool.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      result.skipped++;
    }

    await delay(REQUEST_DELAY_MS);
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
