import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, BookOpen, Eye } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { getGuideBySlug } from '@/lib/supabase/queries';
import type { GuideCategory } from '@/types';

const GUIDE_CATEGORIES: Record<GuideCategory, { label: string; color: string }> = {
  job: { label: '직군', color: 'bg-blue-100 text-blue-700' },
  education: { label: '교육', color: 'bg-emerald-100 text-emerald-700' },
  tip: { label: '팁', color: 'bg-purple-100 text-purple-700' },
  tutorial: { label: '튜토리얼', color: 'bg-orange-100 text-orange-700' },
};

/**
 * Simple markdown-to-HTML converter.
 * Handles: ## / ### headings, **bold**, - bullet items, and paragraph breaks.
 */
function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  const htmlLines: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Close list if we leave a bullet context
    if (inList && !trimmed.startsWith('- ')) {
      htmlLines.push('</ul>');
      inList = false;
    }

    if (trimmed === '') {
      htmlLines.push('<br />');
      continue;
    }

    // ### heading
    if (trimmed.startsWith('### ')) {
      const text = applyInline(trimmed.slice(4));
      htmlLines.push(
        `<h3 class="mt-6 mb-2 text-lg font-bold text-foreground">${text}</h3>`,
      );
      continue;
    }

    // ## heading
    if (trimmed.startsWith('## ')) {
      const text = applyInline(trimmed.slice(3));
      htmlLines.push(
        `<h2 class="mt-8 mb-3 text-xl font-extrabold text-foreground">${text}</h2>`,
      );
      continue;
    }

    // Bullet list item
    if (trimmed.startsWith('- ')) {
      if (!inList) {
        htmlLines.push('<ul class="my-2 list-disc list-inside space-y-1 text-gray-700">');
        inList = true;
      }
      const text = applyInline(trimmed.slice(2));
      htmlLines.push(`<li>${text}</li>`);
      continue;
    }

    // Regular paragraph line
    htmlLines.push(`<p class="my-1 text-gray-700 leading-relaxed">${applyInline(trimmed)}</p>`);
  }

  if (inList) {
    htmlLines.push('</ul>');
  }

  return htmlLines.join('\n');
}

/** Apply inline formatting: **bold** */
function applyInline(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: '가이드를 찾을 수 없습니다' };
  return {
    title: `${guide.title} | ${SITE_NAME}`,
    description: guide.content.slice(0, 160),
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const catConfig = GUIDE_CATEGORIES[guide.category];
  const date = new Date(guide.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const contentHtml = markdownToHtml(guide.content);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 뒤로가기 */}
      <Link
        href="/guides"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        가이드 목록
      </Link>

      {/* 헤더 */}
      <article className="rounded-xl border border-border bg-white p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${catConfig.color}`}
          >
            {catConfig.label}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Eye className="h-3.5 w-3.5" />
            {guide.view_count.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>

        <h1 className="flex items-start gap-2 text-2xl font-extrabold text-foreground sm:text-3xl">
          <BookOpen className="mt-1 h-7 w-7 shrink-0 text-primary" />
          {guide.title}
        </h1>

        {/* 콘텐츠 */}
        <div
          className="mt-8"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>

      {/* 관련 링크 */}
      {(guide.related_job_id || guide.related_edu_id) && (
        <div className="mt-6 rounded-xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-bold text-foreground">관련 페이지</h2>
          <div className="flex flex-wrap gap-2">
            {guide.related_job_id && (
              <Link
                href={`/jobs/${guide.related_job_id}`}
                className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
              >
                직군별 AI 추천 보기
              </Link>
            )}
            {guide.related_edu_id && (
              <Link
                href={`/education/${guide.related_edu_id}`}
                className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                교육 단계별 AI 보기
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
