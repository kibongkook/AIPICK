import Link from 'next/link';
import { MessageCircleQuestion, ArrowRight, Plus } from 'lucide-react';
import type { CommunityPost } from '@/types';

interface TrendingQuestionsPlaceholderProps {
  questions: CommunityPost[];
}

export default function TrendingQuestionsPlaceholder({ questions }: TrendingQuestionsPlaceholderProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
          <MessageCircleQuestion className="h-5 w-5 text-purple-500" />
          커뮤니티 질문
        </h2>
        <Link
          href="/community"
          className="text-xs font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-0.5"
        >
          전체 보기
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {questions.length > 0 ? (
        <div className="space-y-2">
          {questions.map((q) => (
            <Link
              key={q.id}
              href={`/community/${q.id}`}
              className="flex items-start gap-3 rounded-xl border border-border bg-white p-4 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-sm line-clamp-1">
                  {q.title || q.content.slice(0, 60)}
                </h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{q.content}</p>
                <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2">
                  <span>{q.user_name}</span>
                  {q.comment_count > 0 && <span>답변 {q.comment_count}</span>}
                  {q.like_count > 0 && <span>좋아요 {q.like_count}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* 질문이 없을 때 CTA */
        <div className="rounded-xl border border-dashed border-purple-200 bg-purple-50/50 p-6 text-center">
          <MessageCircleQuestion className="h-8 w-8 text-purple-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">AI 사용 중 궁금한 점이 있나요?</p>
          <p className="text-xs text-gray-400 mb-4">커뮤니티에 질문을 올리면 경험 많은 사용자들이 답변해드려요</p>
          <Link
            href="/community"
            className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            첫 번째 질문하기
          </Link>
        </div>
      )}
    </section>
  );
}
