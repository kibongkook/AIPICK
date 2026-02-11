import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCronAuth, delay } from '@/lib/pipeline/fetcher-base';
import { categorizeByDescription, generateSlug, extractDomain } from '@/lib/pipeline/auto-categorizer';
import { resolveLogoUrl } from '@/lib/utils/logo-resolver';

/**
 * POST /api/cron/discover-tools - AI 도구 자동 발견 파이프라인
 *
 * 3개 외부 소스에서 새로운 AI 도구를 탐색하여 tool_candidates 테이블에 추가:
 * 1. Product Hunt — AI 카테고리 최신 제품
 * 2. GitHub — AI/ML 관련 인기 리포지토리
 * 3. HackerNews — AI 도구 관련 게시물 (Algolia API)
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

  const startTime = Date.now();
  const results = {
    product_hunt: { found: 0, new: 0, errors: [] as string[] },
    github: { found: 0, new: 0, errors: [] as string[] },
    hackernews: { found: 0, new: 0, errors: [] as string[] },
  };

  // 기존 도구 + 후보의 slug 목록 캐싱 (중복 방지)
  const { data: existingTools } = await supabase.from('tools').select('slug, url');
  const { data: existingCandidates } = await supabase.from('tool_candidates').select('slug, url');

  const knownSlugs = new Set([
    ...(existingTools || []).map((t) => t.slug),
    ...(existingCandidates || []).map((c) => c.slug),
  ]);
  const knownUrls = new Set([
    ...(existingTools || []).map((t) => t.url),
    ...(existingCandidates || []).map((c) => c.url),
  ]);

  // ==========================================
  // 1. Product Hunt 탐색
  // ==========================================
  const phToken = process.env.PRODUCT_HUNT_TOKEN;
  if (phToken) {
    try {
      const phCandidates = await discoverFromProductHunt(phToken);
      results.product_hunt.found = phCandidates.length;

      for (const candidate of phCandidates) {
        if (knownSlugs.has(candidate.slug) || knownUrls.has(candidate.url)) continue;

        const { error } = await supabase.from('tool_candidates').upsert(
          candidate,
          { onConflict: 'slug' }
        );

        if (!error) {
          results.product_hunt.new++;
          knownSlugs.add(candidate.slug);
          knownUrls.add(candidate.url);
        } else {
          results.product_hunt.errors.push(`${candidate.name}: ${error.message}`);
        }
      }
    } catch (err) {
      results.product_hunt.errors.push(
        `Fatal: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // ==========================================
  // 2. GitHub Trending 탐색
  // ==========================================
  try {
    const ghCandidates = await discoverFromGitHub();
    results.github.found = ghCandidates.length;

    for (const candidate of ghCandidates) {
      if (knownSlugs.has(candidate.slug) || knownUrls.has(candidate.url)) continue;

      const { error } = await supabase.from('tool_candidates').upsert(
        candidate,
        { onConflict: 'slug' }
      );

      if (!error) {
        results.github.new++;
        knownSlugs.add(candidate.slug);
        knownUrls.add(candidate.url);
      } else {
        results.github.errors.push(`${candidate.name}: ${error.message}`);
      }
    }
  } catch (err) {
    results.github.errors.push(
      `Fatal: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // ==========================================
  // 3. HackerNews AI 언급 탐색
  // ==========================================
  try {
    const hnCandidates = await discoverFromHackerNews();
    results.hackernews.found = hnCandidates.length;

    for (const candidate of hnCandidates) {
      if (knownSlugs.has(candidate.slug) || knownUrls.has(candidate.url)) continue;

      const { error } = await supabase.from('tool_candidates').upsert(
        candidate,
        { onConflict: 'slug' }
      );

      if (!error) {
        results.hackernews.new++;
        knownSlugs.add(candidate.slug);
        knownUrls.add(candidate.url);
      } else {
        results.hackernews.errors.push(`${candidate.name}: ${error.message}`);
      }
    }
  } catch (err) {
    results.hackernews.errors.push(
      `Fatal: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // ==========================================
  // 발견 로그 기록
  // ==========================================
  const duration = Date.now() - startTime;
  const totalNew = results.product_hunt.new + results.github.new + results.hackernews.new;
  const totalFound = results.product_hunt.found + results.github.found + results.hackernews.found;

  for (const [source, r] of Object.entries(results)) {
    if (r.found > 0 || r.errors.length > 0) {
      await supabase.from('tool_discovery_log').insert({
        source,
        candidates_found: r.found,
        candidates_new: r.new,
        errors: r.errors.length > 0 ? r.errors.slice(0, 10) : null,
        duration_ms: duration,
      });
    }
  }

  return NextResponse.json({
    success: true,
    total_found: totalFound,
    total_new: totalNew,
    duration_ms: duration,
    details: results,
  });
}

// ==========================================
// Product Hunt 탐색
// ==========================================
interface CandidateInsert {
  name: string;
  slug: string;
  url: string;
  description: string | null;
  logo_url: string | null;
  discovered_from: string;
  category_slug: string;
  ph_votes: number;
  ph_reviews: number;
  ph_rating: number;
  github_stars: number;
  hn_mentions: number;
  raw_data: Record<string, unknown>;
}

async function discoverFromProductHunt(token: string): Promise<CandidateInsert[]> {
  const query = `{
    posts(order: VOTES, first: 50, topic: "artificial-intelligence") {
      edges {
        node {
          id
          name
          tagline
          description
          url
          website
          votesCount
          reviewsCount
          reviewsRating
          thumbnail { url }
          topics { edges { node { name } } }
        }
      }
    }
  }`;

  const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'AIPICK-Bot',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) return [];

  const json = await response.json();
  const posts = json?.data?.posts?.edges || [];

  const candidates: CandidateInsert[] = [];

  for (const edge of posts) {
    const post = edge?.node;
    if (!post?.name || !post?.website) continue;

    const name = post.name;
    const slug = generateSlug(name);
    const url = post.website || post.url;
    const description = post.tagline || post.description || null;
    const topics = (post.topics?.edges || []).map(
      (e: { node: { name: string } }) => e.node.name
    );

    candidates.push({
      name,
      slug,
      url,
      description,
      logo_url: resolveLogoUrl(name, url),
      discovered_from: 'product_hunt',
      category_slug: categorizeByDescription(name, description, topics),
      ph_votes: post.votesCount || 0,
      ph_reviews: post.reviewsCount || 0,
      ph_rating: post.reviewsRating || 0,
      github_stars: 0,
      hn_mentions: 0,
      raw_data: {
        ph_id: post.id,
        ph_url: post.url,
        tagline: post.tagline,
        topics,
      },
    });

    await delay(100);
  }

  return candidates;
}

// ==========================================
// GitHub Trending 탐색
// ==========================================
async function discoverFromGitHub(): Promise<CandidateInsert[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const queries = [
    `topic:ai stars:>500 pushed:>${thirtyDaysAgo}`,
    `topic:llm stars:>500 pushed:>${thirtyDaysAgo}`,
    `topic:machine-learning stars:>1000 pushed:>${thirtyDaysAgo}`,
  ];

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'AIPICK-Bot',
  };

  const ghToken = process.env.GITHUB_TOKEN;
  if (ghToken) {
    headers['Authorization'] = `Bearer ${ghToken}`;
  }

  const seenSlugs = new Set<string>();
  const candidates: CandidateInsert[] = [];

  for (const q of queries) {
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=30`,
        { headers }
      );

      if (!response.ok) continue;

      const json = await response.json();
      const repos = json?.items || [];

      for (const repo of repos) {
        if (!repo?.name || !repo?.html_url) continue;

        const name = repo.name;
        const slug = generateSlug(name);

        if (seenSlugs.has(slug)) continue;
        seenSlugs.add(slug);

        const description = repo.description || null;
        const topics: string[] = repo.topics || [];

        candidates.push({
          name,
          slug,
          url: repo.homepage || repo.html_url,
          description,
          logo_url: repo.owner?.avatar_url || null,
          discovered_from: 'github',
          category_slug: categorizeByDescription(name, description, topics),
          ph_votes: 0,
          ph_reviews: 0,
          ph_rating: 0,
          github_stars: repo.stargazers_count || 0,
          hn_mentions: 0,
          raw_data: {
            github_url: repo.html_url,
            full_name: repo.full_name,
            forks: repo.forks_count,
            open_issues: repo.open_issues_count,
            language: repo.language,
            topics,
            license: repo.license?.spdx_id,
          },
        });
      }

      await delay(1500); // GitHub rate limit 대응
    } catch {
      // 개별 쿼리 실패 시 다음 쿼리로 계속
    }
  }

  return candidates;
}

// ==========================================
// HackerNews AI 언급 탐색
// ==========================================
async function discoverFromHackerNews(): Promise<CandidateInsert[]> {
  const searchTerms = ['AI tool', 'AI app', 'AI startup', 'LLM tool'];
  const ninetyDaysAgo = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);

  const urlMentionMap = new Map<
    string,
    { name: string; url: string; description: string; mentions: number }
  >();

  for (const term of searchTerms) {
    try {
      const response = await fetch(
        `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(term)}&tags=story&numericFilters=created_at_i>${ninetyDaysAgo}&hitsPerPage=50`
      );

      if (!response.ok) continue;

      const json = await response.json();
      const hits = json?.hits || [];

      for (const hit of hits) {
        const storyUrl = hit.url;
        if (!storyUrl || storyUrl.includes('github.com') || storyUrl.includes('youtube.com')) continue;

        try {
          const domain = new URL(storyUrl).hostname.replace(/^www\./, '');
          if (!domain || domain.includes('news.') || domain.includes('blog.')) continue;

          const existing = urlMentionMap.get(domain);
          if (existing) {
            existing.mentions++;
          } else {
            urlMentionMap.set(domain, {
              name: hit.title || domain,
              url: storyUrl,
              description: hit.title || null,
              mentions: 1,
            });
          }
        } catch {
          // invalid URL
        }
      }

      await delay(500);
    } catch {
      // 개별 검색 실패 시 계속
    }
  }

  // 3회 이상 언급된 도구만 후보로 추가
  const candidates: CandidateInsert[] = [];

  for (const [, info] of urlMentionMap) {
    if (info.mentions < 2) continue; // 최소 2회 이상 (품질 게이트에서 3회 기준 재검증)

    const name = cleanHnTitle(info.name);
    const slug = generateSlug(name);

    candidates.push({
      name,
      slug,
      url: info.url,
      description: info.description,
      logo_url: resolveLogoUrl(name, info.url),
      discovered_from: 'hackernews',
      category_slug: categorizeByDescription(name, info.description, []),
      ph_votes: 0,
      ph_reviews: 0,
      ph_rating: 0,
      github_stars: 0,
      hn_mentions: info.mentions,
      raw_data: { mentions: info.mentions },
    });
  }

  return candidates;
}

/**
 * HN 제목에서 불필요한 접미사 제거
 */
function cleanHnTitle(title: string): string {
  return title
    .replace(/\s*[\-–—|:]\s*(Show HN|Ask HN|Launch HN|YC\s*\w+).*$/i, '')
    .replace(/\s*\(YC\s*\w+\).*$/i, '')
    .trim()
    .slice(0, 100);
}
