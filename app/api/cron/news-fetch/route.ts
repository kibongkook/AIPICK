import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * POST /api/cron/news-fetch - 외부 AI 뉴스 소스에서 뉴스 수집
 *
 * 지원 소스:
 * - HackerNews (AI/ML 태그 기사)
 * - 직접 입력 (body로 뉴스 배열 전달)
 *
 * Vercel Cron 또는 외부 스케줄러에서 호출
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase not configured, skipping' });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const body = await request.json().catch(() => ({}));
  const source = body.source || 'hackernews';
  let newArticles: NewsFetchItem[] = [];

  if (body.articles) {
    // 직접 입력 모드: body에 뉴스 배열 전달
    newArticles = body.articles;
  } else if (source === 'hackernews') {
    newArticles = await fetchHackerNews();
  }

  if (newArticles.length === 0) {
    return NextResponse.json({ success: true, inserted: 0, message: 'No new articles' });
  }

  // 중복 체크: source_url 기준
  const urls = newArticles.map((a) => a.source_url).filter(Boolean);
  const { data: existing } = await supabase
    .from('news')
    .select('source_url')
    .in('source_url', urls);

  const existingUrls = new Set((existing || []).map((e) => e.source_url));
  const toInsert = newArticles
    .filter((a) => a.source_url && !existingUrls.has(a.source_url))
    .map((a) => ({
      title: a.title,
      summary: a.summary || null,
      content: a.content || null,
      source_url: a.source_url,
      source_name: a.source_name || null,
      category: a.category || 'general',
      image_url: a.image_url || null,
      published_at: a.published_at || new Date().toISOString(),
    }));

  if (toInsert.length === 0) {
    return NextResponse.json({ success: true, inserted: 0, message: 'All articles already exist' });
  }

  const { error } = await supabase.from('news').insert(toInsert);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, inserted: toInsert.length, source });
}

interface NewsFetchItem {
  title: string;
  summary?: string;
  content?: string;
  source_url: string;
  source_name?: string;
  category?: string;
  image_url?: string;
  published_at?: string;
}

/** HackerNews AI 관련 기사 수집 */
async function fetchHackerNews(): Promise<NewsFetchItem[]> {
  try {
    // HN 검색 API로 최근 AI 관련 기사 가져오기
    const res = await fetch(
      'https://hn.algolia.com/api/v1/search_by_date?query=AI+artificial+intelligence&tags=story&hitsPerPage=10',
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return [];

    const data = await res.json();
    return (data.hits || [])
      .filter((hit: { url?: string; title?: string }) => hit.url && hit.title)
      .map((hit: { title: string; url: string; author: string; created_at: string; points: number }) => ({
        title: hit.title,
        summary: `HackerNews (${hit.points || 0} points) by ${hit.author}`,
        source_url: hit.url,
        source_name: 'Hacker News',
        category: 'general' as const,
        published_at: hit.created_at,
      }));
  } catch {
    return [];
  }
}
