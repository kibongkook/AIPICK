import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth, markSourceRunning, markSourceComplete, upsertExternalScore, delay } from '@/lib/pipeline/fetcher-base';
import { DATA_SOURCE_KEYS } from '@/lib/constants';
import { normalizeToScale } from '@/lib/scoring';

const SOURCE_KEY = DATA_SOURCE_KEYS.OPEN_PAGERANK;

const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 1000;

/**
 * POST /api/cron/pagerank - Open PageRank 점수 수집
 *
 * 모든 도구의 URL에서 도메인을 추출하여 Open PageRank API로
 * 페이지랭크 점수를 수집하고 tool_external_scores에 저장합니다.
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

  // 모든 도구 조회
  const { data: tools, error } = await supabase
    .from('tools')
    .select('id, name, url');

  if (error || !tools?.length) {
    await markSourceComplete(supabase, SOURCE_KEY, result);
    return NextResponse.json({ success: true, updated: 0, message: 'No tools found' });
  }

  // 도메인 추출 및 매핑
  const toolDomainMap: { id: string; name: string; domain: string }[] = [];
  for (const tool of tools) {
    const domain = extractDomain(tool.url);
    if (domain) {
      toolDomainMap.push({ id: tool.id, name: tool.name, domain });
    }
  }

  result.total = toolDomainMap.length;

  if (toolDomainMap.length === 0) {
    await markSourceComplete(supabase, SOURCE_KEY, result);
    return NextResponse.json({ success: true, updated: 0, message: 'No valid domains found' });
  }

  const apiKey = process.env.OPEN_PAGERANK_API_KEY;
  if (!apiKey) {
    result.errors.push('OPEN_PAGERANK_API_KEY not configured');
    await markSourceComplete(supabase, SOURCE_KEY, result);
    return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
  }

  // 배치 처리 (100개씩)
  for (let i = 0; i < toolDomainMap.length; i += BATCH_SIZE) {
    const batch = toolDomainMap.slice(i, i + BATCH_SIZE);
    const domainParams = batch.map((t) => `domains[]=${encodeURIComponent(t.domain)}`).join('&');

    try {
      const res = await fetch(
        `https://openpagerank.com/api/v1.0/getPageRank?${domainParams}`,
        {
          headers: { 'API-OPR': apiKey },
          next: { revalidate: 0 },
        }
      );

      if (!res.ok) {
        result.errors.push(`Batch ${i / BATCH_SIZE + 1}: HTTP ${res.status}`);
        result.skipped += batch.length;
        if (i + BATCH_SIZE < toolDomainMap.length) await delay(BATCH_DELAY_MS);
        continue;
      }

      const data = await res.json();
      const responses: { domain: string; page_rank_decimal: number; rank: number; status_code: number }[] =
        data.response || [];

      // 도메인 → PageRank 결과 매핑
      const domainResultMap = new Map<string, { page_rank_decimal: number; rank: number }>();
      for (const entry of responses) {
        if (entry.status_code === 200 && entry.page_rank_decimal != null) {
          domainResultMap.set(entry.domain, {
            page_rank_decimal: entry.page_rank_decimal,
            rank: entry.rank,
          });
        }
      }

      // 배치 내 각 도구에 대해 점수 저장
      for (const tool of batch) {
        const prResult = domainResultMap.get(tool.domain);
        if (!prResult) {
          result.skipped++;
          continue;
        }

        try {
          const normalizedScore = normalizeToScale(prResult.page_rank_decimal, 10);

          await upsertExternalScore(supabase, tool.id, SOURCE_KEY, normalizedScore, {
            domain: tool.domain,
            page_rank_decimal: prResult.page_rank_decimal,
            rank: prResult.rank,
          });

          result.updated++;
        } catch (err) {
          result.errors.push(`${tool.name}: ${err instanceof Error ? err.message : 'Unknown'}`);
          result.skipped++;
        }
      }
    } catch (err) {
      result.errors.push(`Batch ${i / BATCH_SIZE + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      result.skipped += batch.length;
    }

    // 배치 간 딜레이
    if (i + BATCH_SIZE < toolDomainMap.length) {
      await delay(BATCH_DELAY_MS);
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

function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return null;
  }
}
