import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth, markSourceRunning, markSourceComplete, upsertExternalScore, delay } from '@/lib/pipeline/fetcher-base';
import { DATA_SOURCE_KEYS } from '@/lib/constants';
import { normalizeToScale } from '@/lib/scoring';

const SOURCE_KEY = DATA_SOURCE_KEYS.GITHUB;

/**
 * POST /api/cron/github-stats - 오픈소스 AI 도구 GitHub 통계 수집
 *
 * 도구의 URL이 github.com인 경우 stars/forks 수집 후
 * tool_external_scores + tools.github_stars/forks 업데이트
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

  // GitHub URL이 있는 도구만 조회
  const { data: tools, error } = await supabase
    .from('tools')
    .select('id, name, url, tags')
    .like('url', '%github.com%');

  if (error || !tools?.length) {
    await markSourceComplete(supabase, SOURCE_KEY, result);
    return NextResponse.json({ success: true, updated: 0, message: 'No GitHub tools found' });
  }

  result.total = tools.length;

  const githubToken = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'AIPICK-Bot',
  };
  if (githubToken) {
    headers['Authorization'] = `Bearer ${githubToken}`;
  }

  // 전체 stars 최대값 계산 (정규화용)
  const allStars: number[] = [];

  const toolResults: { id: string; stars: number; forks: number; tags: string[] }[] = [];

  for (const tool of tools) {
    const repoPath = extractGithubRepo(tool.url);
    if (!repoPath) {
      result.skipped++;
      continue;
    }

    try {
      const res = await fetch(`https://api.github.com/repos/${repoPath}`, {
        headers,
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        result.errors.push(`${tool.name}: HTTP ${res.status}`);
        result.skipped++;
        continue;
      }

      const repo = await res.json();
      const stars = repo.stargazers_count || 0;
      const forks = repo.forks_count || 0;

      allStars.push(stars);

      // tags 업데이트 (기존 호환)
      const existingTags: string[] = tool.tags || [];
      const newTags = existingTags.filter(
        (t: string) => !t.startsWith('stars:') && !t.startsWith('forks:')
      );
      if (stars > 0) newTags.push(`stars:${formatNumber(stars)}`);
      if (forks > 0) newTags.push(`forks:${formatNumber(forks)}`);

      toolResults.push({ id: tool.id, stars, forks, tags: newTags });

      await delay(1000);
    } catch (err) {
      result.errors.push(`${tool.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      result.skipped++;
    }
  }

  // 정규화 후 저장
  const maxStars = Math.max(...allStars, 1);

  for (const tr of toolResults) {
    try {
      const normalizedScore = normalizeToScale(tr.stars, maxStars);

      // tools 테이블 업데이트 (tags + github_stars/forks)
      await supabase
        .from('tools')
        .update({
          tags: tr.tags,
          github_stars: tr.stars,
          github_forks: tr.forks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tr.id);

      // external_scores 저장
      await upsertExternalScore(supabase, tr.id, SOURCE_KEY, normalizedScore, {
        stars: tr.stars,
        forks: tr.forks,
      });

      result.updated++;
    } catch (err) {
      result.errors.push(`Save ${tr.id}: ${err instanceof Error ? err.message : 'Unknown'}`);
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

function extractGithubRepo(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('github.com')) return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
    return null;
  } catch {
    return null;
  }
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
