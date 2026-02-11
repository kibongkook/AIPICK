'use client';

import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, RefreshCw } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  summary?: string;
}

export default function AINewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setNews(data.items || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    return new Date(dateStr).toLocaleDateString('ko-KR');
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-foreground flex items-center">
          AI 뉴스
          <Newspaper className="ml-1.5 h-4 w-4 text-primary" />
        </h2>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="text-xs text-gray-400 hover:text-primary flex items-center gap-1 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-4 -mt-2">국내 AI 최신 소식을 한눈에</p>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-white p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-border bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-500">뉴스를 불러오지 못했습니다</p>
          <button
            onClick={fetchNews}
            className="mt-2 text-xs text-primary font-medium hover:underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && news.length > 0 && (
        <div className="space-y-3">
          {news.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-border bg-white p-4 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  {item.summary && (
                    <p className="text-xs text-gray-500 line-clamp-1 mt-1">{item.summary}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                    <span className="font-medium text-gray-500">{item.source}</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {timeAgo(item.pubDate)}
                    </span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-primary shrink-0 mt-1 transition-colors" />
              </div>
            </a>
          ))}
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="rounded-xl border border-border bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-500">최신 뉴스가 없습니다</p>
        </div>
      )}
    </section>
  );
}
