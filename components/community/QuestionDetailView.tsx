'use client';

import { useState, useEffect } from 'react';
import { MessageCircleQuestion, Check, ThumbsUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn, getAvatarColor } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthContext';
import AnswerCard from './AnswerCard';
import AnswerForm from './AnswerForm';
import type { CommunityPost } from '@/types';

interface QuestionDetailViewProps {
  postId: string;
}

export default function QuestionDetailView({ postId }: QuestionDetailViewProps) {
  const { user } = useAuth();
  const [question, setQuestion] = useState<CommunityPost | null>(null);
  const [answers, setAnswers] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/community/v2/answer?question_id=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setQuestion(data.question);
        setAnswers(data.answers || []);
      }
    } catch (error) {
      console.error('Failed to fetch question:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [postId]);

  const handleAddAnswer = async (questionId: string, content: string) => {
    try {
      const res = await fetch('/api/community/v2/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: questionId, content }),
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (error) {
      console.error('Answer submit error:', error);
    }
    return false;
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      const res = await fetch('/api/community/v2/accept-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer_id: answerId }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Accept answer error:', error);
    }
  };

  const handleLike = async (id: string) => {
    try {
      await fetch('/api/community/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: id }),
      });
      await fetchData();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">로딩 중...</div>;
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">글을 찾을 수 없습니다</p>
        <Link href="/community" className="text-primary hover:underline text-sm">
          커뮤니티로 돌아가기
        </Link>
      </div>
    );
  }

  const isQuestionOwner = user?.id === question.user_id;
  const avatarColor = getAvatarColor(question.user_name || 'User');
  const firstChar = (question.user_name || 'U')[0];
  const isQuestion = question.post_type === 'question';
  const hasAcceptedAnswer = !!question.accepted_answer_id;

  return (
    <div className="max-w-3xl mx-auto">
      {/* 상단 네비 */}
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        커뮤니티
      </Link>

      {/* 질문/글 본문 */}
      <div className="rounded-xl border border-border bg-white p-6 mb-6">
        {/* 타입 뱃지 */}
        <div className="flex items-center gap-2 mb-3">
          {isQuestion && (
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold',
              hasAcceptedAnswer
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-purple-100 text-purple-700'
            )}>
              {hasAcceptedAnswer ? (
                <><Check className="h-3 w-3" /> 답변 완료</>
              ) : (
                <><MessageCircleQuestion className="h-3 w-3" /> 질문</>
              )}
            </span>
          )}
          {question.answer_count !== undefined && question.answer_count > 0 && (
            <span className="text-xs text-gray-400">답변 {question.answer_count}개</span>
          )}
        </div>

        {/* 제목 */}
        <h1 className="text-xl font-bold text-foreground mb-4">
          {question.title || question.content.slice(0, 60)}
        </h1>

        {/* 본문 */}
        <div className="text-sm text-gray-700 whitespace-pre-wrap mb-4">
          {question.content}
        </div>

        {/* 작성자 정보 */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className={cn('h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold', avatarColor)}>
              {firstChar}
            </div>
            <span className="font-medium text-foreground">{question.user_name}</span>
            <span>•</span>
            <span>{new Date(question.created_at).toLocaleDateString('ko-KR')}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              {question.like_count}
            </span>
          </div>
        </div>
      </div>

      {/* 답변 목록 */}
      {isQuestion && (
        <>
          <h3 className="text-base font-bold text-foreground mb-4">
            답변 {answers.length}개
          </h3>

          {answers.length > 0 ? (
            <div className="space-y-3 mb-6">
              {/* 채택된 답변 먼저 */}
              {answers
                .sort((a, b) => {
                  if (a.id === question.accepted_answer_id) return -1;
                  if (b.id === question.accepted_answer_id) return 1;
                  return b.like_count - a.like_count;
                })
                .map((answer) => (
                  <AnswerCard
                    key={answer.id}
                    answer={answer}
                    isAccepted={answer.id === question.accepted_answer_id}
                    isQuestionOwner={isQuestionOwner}
                    onLike={handleLike}
                    onAccept={handleAcceptAnswer}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-8 rounded-xl border border-dashed border-border bg-gray-50 mb-6">
              <p className="text-sm text-gray-400">아직 답변이 없습니다. 첫 번째로 답변해보세요!</p>
            </div>
          )}

          {/* 답변 작성 폼 */}
          <AnswerForm questionId={postId} onSubmit={handleAddAnswer} />
        </>
      )}
    </div>
  );
}
