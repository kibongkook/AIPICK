'use client';

import { useState } from 'react';
import { ThumbsUp, ExternalLink, CheckCircle } from 'lucide-react';
import type { ToolSuggestion } from '@/types';
import { cn } from '@/lib/utils';

interface SuggestionCardProps {
  suggestion: ToolSuggestion;
  onVote: (suggestionId: string) => Promise<void>;
}

export default function SuggestionCard({ suggestion, onVote }: SuggestionCardProps) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    setIsVoting(true);
    await onVote(suggestion.id);
    setIsVoting(false);
  };

  const votesNeeded = Math.max(0, 20 - suggestion.vote_count);

  return (
    <div className="rounded-xl border border-border bg-white p-4 hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-foreground truncate">
            {suggestion.tool_name}
          </h4>
          <a
            href={suggestion.tool_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
          >
            {suggestion.tool_url}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* 상태 배지 */}
        {suggestion.status === 'approved' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
            <CheckCircle className="h-3 w-3" />
            승인됨
          </span>
        )}
      </div>

      {/* 설명 */}
      <p className="text-sm text-gray-700 mb-3">{suggestion.tool_description}</p>

      {/* 제안 이유 */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-3">
        <p className="text-xs font-semibold text-amber-800 mb-1">💡 제안 이유</p>
        <p className="text-xs text-amber-900">{suggestion.reason}</p>
      </div>

      {/* 하단: 투표 + 정보 */}
      <div className="flex items-center justify-between">
        {/* 투표 버튼 */}
        <button
          onClick={handleVote}
          disabled={isVoting || suggestion.status !== 'pending'}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
            suggestion.has_voted
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-primary-light',
            (isVoting || suggestion.status !== 'pending') && 'opacity-50 cursor-not-allowed'
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          {suggestion.vote_count}
        </button>

        {/* 진행 상황 */}
        {suggestion.status === 'pending' && (
          <p className="text-xs text-gray-400">
            {votesNeeded > 0
              ? `승인까지 ${votesNeeded}표 남음`
              : '곧 승인됩니다!'}
          </p>
        )}

        {/* 제안자 */}
        <p className="text-xs text-gray-400">
          {suggestion.user_name} • {new Date(suggestion.created_at).toLocaleDateString('ko-KR')}
        </p>
      </div>
    </div>
  );
}
