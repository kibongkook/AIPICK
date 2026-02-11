import { NextResponse } from 'next/server';

interface FeedItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  summary?: string;
}

// 한국어 AI/테크 뉴스 RSS 소스
const RSS_FEEDS = [
  { url: 'https://www.aitimes.com/rss/allArticle.xml', source: 'AI타임스' },
  { url: 'https://zdnet.co.kr/rss/newsall.xml', source: 'ZDNet Korea' },
  { url: 'https://www.etnews.com/etnews_section_rss.xml?id=03', source: '전자신문' },
  { url: 'https://www.bloter.net/feed', source: '블로터' },
  { url: 'https://www.itworld.co.kr/rss/', source: 'ITWorld' },
  { url: 'https://www.aitimes.kr/rss/allArticle.xml', source: '인공지능신문' },
] as const;

const CACHE_TTL_MS = 30 * 60 * 1000; // 30분 캐시
let cachedItems: FeedItem[] = [];
let cacheTimestamp = 0;

// HTML 엔티티 디코딩 (&quot; &amp; &lt; &gt; &#39; &#숫자; 등)
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D');
}

function extractFromXml(xml: string, tag: string): string {
  const openTag = `<${tag}`;
  const closeTag = `</${tag}>`;
  const start = xml.indexOf(openTag);
  if (start === -1) return '';
  const contentStart = xml.indexOf('>', start) + 1;
  const end = xml.indexOf(closeTag, contentStart);
  if (end === -1) return '';
  let content = xml.slice(contentStart, end).trim();
  // Handle CDATA
  if (content.startsWith('<![CDATA[')) {
    content = content.slice(9, content.indexOf(']]>'));
  }
  return decodeHtmlEntities(content);
}

function parseItems(xml: string, source: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemTag = xml.includes('<entry') ? 'entry' : 'item';
  const parts = xml.split(`<${itemTag}`).slice(1);

  for (const part of parts.slice(0, 5)) {
    const title = extractFromXml(part, 'title').replace(/<[^>]*>/g, '').trim();
    let link = extractFromXml(part, 'link');
    // Atom feeds use <link href="..."/>
    if (!link) {
      const hrefMatch = part.match(/<link[^>]*href=["']([^"']+)["']/);
      if (hrefMatch) link = hrefMatch[1];
    }
    const pubDate = extractFromXml(part, 'pubDate') || extractFromXml(part, 'published') || extractFromXml(part, 'updated');
    const summary = extractFromXml(part, 'description').replace(/<[^>]*>/g, '').trim().slice(0, 120);

    if (title && link) {
      items.push({ title, link, source, pubDate, summary: summary || undefined });
    }
  }

  return items;
}

async function fetchAllFeeds(): Promise<FeedItem[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(feed.url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'AIPICK-NewsBot/1.0' },
        });
        clearTimeout(timeout);
        if (!res.ok) return [];
        const xml = await res.text();
        return parseItems(xml, feed.source);
      } catch {
        clearTimeout(timeout);
        return [];
      }
    })
  );

  const allItems: FeedItem[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') allItems.push(...r.value);
  }

  // 최신순 정렬
  allItems.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return db - da;
  });

  return allItems.slice(0, 10);
}

export async function GET() {
  const now = Date.now();

  if (cachedItems.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    return NextResponse.json({ items: cachedItems });
  }

  try {
    cachedItems = await fetchAllFeeds();
    cacheTimestamp = now;
    return NextResponse.json({ items: cachedItems });
  } catch {
    return NextResponse.json({ items: cachedItems.length > 0 ? cachedItems : [] });
  }
}
