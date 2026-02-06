'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

interface CommentFormProps {
  onSubmit: (content: string) => boolean;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
}

export default function CommentForm({ onSubmit, placeholder = '댓글을 작성하세요...', autoFocus = false, compact = false }: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const success = onSubmit(content.trim());
    if (success) setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`flex-1 rounded-lg border border-border bg-surface px-3 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${compact ? 'py-1.5' : 'py-2.5'}`}
      />
      <button
        type="submit"
        disabled={!content.trim()}
        className={`rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${compact ? 'px-3 py-1.5' : 'px-4 py-2.5'}`}
      >
        <Send className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </button>
    </form>
  );
}
