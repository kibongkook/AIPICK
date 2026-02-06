import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * POST /api/cron/github-stats - 오픈소스 AI 도구 GitHub 통계 수집
 *
 * 도구의 URL이 github.com인 경우 stars/forks/watchers 수집
 * GitHub API rate limit: 60 req/hour (인증 없이)
 *
 * Vercel Cron 또는 외부 스케줄러에서 호출
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase not configured, skipping' });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  // GitHub URL이 있는 도구만 조회
  const { data: tools, error } = await supabase
    .from('tools')
    .select('id, name, url, tags')
    .like('url', '%github.com%');

  if (error || !tools?.length) {
    return NextResponse.json({ success: true, updated: 0, message: 'No GitHub tools found' });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'AIPICK-Bot',
  };
  if (githubToken) {
    headers['Authorization'] = `Bearer ${githubToken}`;
  }

  let updatedCount = 0;

  for (const tool of tools) {
    const repoPath = extractGithubRepo(tool.url);
    if (!repoPath) continue;

    try {
      const res = await fetch(`https://api.github.com/repos/${repoPath}`, {
        headers,
        next: { revalidate: 0 },
      });

      if (!res.ok) continue;

      const repo = await res.json();
      const stars = repo.stargazers_count || 0;
      const forks = repo.forks_count || 0;

      // tags에 GitHub 통계 추가
      const existingTags: string[] = tool.tags || [];
      const newTags = existingTags.filter(
        (t: string) => !t.startsWith('stars:') && !t.startsWith('forks:')
      );
      if (stars > 0) newTags.push(`stars:${formatNumber(stars)}`);
      if (forks > 0) newTags.push(`forks:${formatNumber(forks)}`);

      const { error: updateError } = await supabase
        .from('tools')
        .update({
          tags: newTags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tool.id);

      if (!updateError) updatedCount++;

      // Rate limit 방지: 1초 대기
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch {
      // 개별 도구 실패 시 계속 진행
    }
  }

  return NextResponse.json({
    success: true,
    total: tools.length,
    updated: updatedCount,
  });
}

/** GitHub URL에서 owner/repo 추출 */
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

/** 숫자 포맷 (1234 → 1.2k) */
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
