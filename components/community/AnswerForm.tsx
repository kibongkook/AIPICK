'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { LoginPrompt } from '@/components/auth/AuthGuard';

interface AnswerFormProps {
  questionId: string;
  onSubmit: (questionId: string, content: string) => Promise<boolean>;
}

export default function AnswerForm({ questionId, onSubmit }: AnswerFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const canSubmit = content.trim().length >= 10 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLogin(true);
      return;
    }
    if (!canSubmit) return;

    setSubmitting(true);
    const success = await onSubmit(questionId, content.trim());
    if (success) {
      setContent('');
    }
    setSubmitting(false);
  };

  if (showLogin && !user) {
    return <LoginPrompt message="답변하려면 로그인이 필요합니다." />;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-gray-50 p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="답변을 작성해주세요 (10자 이상)"
        rows={3}
        className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none focus:border-primary focus:outline-none bg-white"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-gray-400">{content.length}자</span>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-3 w-3" />
          {submitting ? '등록 중...' : '답변 등록'}
        </button>
      </div>
    </form>
  );
}
