import Link from 'next/link';
import { ExternalLink, Eye } from 'lucide-react';
import { NEWS_CATEGORIES } from '@/lib/constants';
import { cn, formatVisitCount } from '@/lib/utils';
import type { News } from '@/types';
import { getToolById } from '@/lib/supabase/queries';

interface NewsCardProps {
  news: News;
  compact?: boolean;
}

export default async function NewsCard({ news, compact }: NewsCardProps) {
  const categoryConfig = NEWS_CATEGORIES[news.category] || NEWS_CATEGORIES.general;
  const relatedTool = news.related_tool_id ? await getToolById(news.related_tool_id) : null;

  if (compact) {
    return (
      <a
        href={news.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-3 rounded-lg p-3 hover:bg-blue-50/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground line-clamp-2">{news.title}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', categoryConfig.color)}>
              {categoryConfig.label}
            </span>
            <span>{new Date(news.published_at).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>
      </a>
    );
  }

  return (
    <div className="group rounded-xl border border-border bg-white p-5 hover:border-primary/50 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-medium', categoryConfig.color)}>
          {categoryConfig.label}
        </span>
        <ExternalLink className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-primary transition-colors" />
      </div>

      <a
        href={news.source_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <h3 className="mt-3 text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {news.title}
        </h3>
      </a>

      {news.summary && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{news.summary}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{new Date(news.published_at).toLocaleDateString('ko-KR')}</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatVisitCount(news.view_count)}
          </span>
        </div>
        {relatedTool && (
          <Link
            href={`/tools/${relatedTool.slug}`}
            className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {relatedTool.name}
          </Link>
        )}
      </div>
    </div>
  );
}
