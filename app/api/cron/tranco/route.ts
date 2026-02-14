import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth, markSourceRunning, markSourceComplete, upsertExternalScore, delay } from '@/lib/pipeline/fetcher-base';
import { DATA_SOURCE_KEYS } from '@/lib/constants';

const SOURCE_KEY = DATA_SOURCE_KEYS.TRANCO;

/**
 * POST /api/cron/tranco - Tranco 웹사이트 인기도 순위 수집
 *
 * 모든 도구의 URL에서 도메인을 추출한 뒤
 * Tranco 순위를 조회하여 tool_external_scores 업데이트
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

  // 모든 도구 조회 (URL에서 도메인 추출)
  const { data: tools, error } = await supabase
    .from('tools')
    .select('id, name, url');

  if (error || !tools?.length) {
    await markSourceComplete(supabase, SOURCE_KEY, result);
    return NextResponse.json({ success: true, updated: 0, message: 'No tools found' });
  }

  result.total = tools.length;

  for (const tool of tools) {
    const domain = extractDomain(tool.url);
    if (!domain) {
      result.skipped++;
      continue;
    }

    try {
      const res = await fetch(
        `https://tranco-list.eu/api/ranks/domain/${domain}`,
        { next: { revalidate: 0 } }
      );

      if (!res.ok) {
        result.errors.push(`${tool.name}: HTTP ${res.status}`);
        result.skipped++;
        continue;
      }

      const data = await res.json();
      const rank = data.ranks?.[0]?.rank || null;

      // 순위가 낮을수록(숫자가 작을수록) 인기 있음 — 로그 스케일 정규화
      // rank 1 = 100, rank 10 = 80, rank 100 = 60, rank 1000 = 40, etc.
      const normalizedScore = rank ? Math.max(0, 100 - Math.log10(rank) * 20) : 0;

      await upsertExternalScore(supabase, tool.id, SOURCE_KEY, normalizedScore, {
        domain,
        rank,
      });

      result.updated++;
      await delay(100);
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

/**
 * URL에서 도메인을 추출합니다.
 * 예: "https://www.example.com/path" → "example.com"
 */
function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    let hostname = parsed.hostname;
    // www. 접두사 제거
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4);
    }
    return hostname || null;
  } catch {
    return null;
  }
}
