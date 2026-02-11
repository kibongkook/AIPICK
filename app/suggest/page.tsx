'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import SuggestionForm from '@/components/suggestions/SuggestionForm';
import SuggestionCard from '@/components/suggestions/SuggestionCard';
import type { ToolSuggestion, Category } from '@/types';

export default function SuggestPage() {
  const [suggestions, setSuggestions] = useState<ToolSuggestion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');

  useEffect(() => {
    fetchData();
  }, [sort]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 제안 목록 조회
      const suggestionsRes = await fetch(`/api/suggestions?status=pending&sort=${sort}`);
      if (suggestionsRes.ok) {
        const data = await suggestionsRes.json();
        setSuggestions(data.suggestions || []);
      }

      // 카테고리 목록 조회 (폼용)
      const categoriesRes = await fetch('/api/categories');
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: {
    tool_name: string;
    tool_url: string;
    tool_description: string;
    category_slug: string;
    reason: string;
  }) => {
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert('제안이 성공적으로 등록되었습니다!');
        fetchData(); // 목록 새로고침
        return true;
      } else {
        const error = await res.json();
        alert(error.error || '제안 등록에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('제안 등록 중 오류가 발생했습니다.');
      return false;
    }
  };

  const handleVote = async (suggestionId: string) => {
    try {
      const res = await fetch('/api/suggestions/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion_id: suggestionId }),
      });

      if (res.ok) {
        fetchData(); // 목록 새로고침
      } else {
        const error = await res.json();
        alert(error.error || '투표에 실패했습니다.');
      }
    } catch (error) {
      console.error('Vote error:', error);
      alert('투표 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-primary">커뮤니티 큐레이션</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            AI 서비스 제안하기
          </h1>
          <p className="text-gray-600">
            알고 계신 좋은 AI 서비스를 AIPICK 커뮤니티와 공유해주세요
          </p>
        </div>

        {/* 제안 폼 */}
        <div className="mb-8">
          <SuggestionForm categories={categories} onSubmit={handleSubmit} />
        </div>

        {/* 정렬 + 제목 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            제안된 서비스 ({suggestions.length})
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSort('latest')}
              className={`text-xs transition-colors ${
                sort === 'latest' ? 'font-semibold text-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setSort('popular')}
              className={`text-xs transition-colors ${
                sort === 'popular' ? 'font-semibold text-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              인기순
            </button>
          </div>
        </div>

        {/* 제안 목록 */}
        {loading ? (
          <div className="text-center py-10 text-gray-400">로딩 중...</div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onVote={handleVote}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-white py-10 text-center text-sm text-gray-400">
            아직 제안된 서비스가 없습니다. 첫 번째로 제안해보세요!
          </div>
        )}

        {/* 안내 */}
        <div className="mt-8 rounded-xl border border-border bg-blue-50 p-6">
          <h3 className="text-sm font-bold text-blue-900 mb-2">💡 제안 가이드</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 실제로 사용해본 AI 서비스를 제안해주세요</li>
            <li>• 20명 이상의 추천을 받으면 자동으로 승인됩니다</li>
            <li>• 승인된 서비스는 AIPICK에 자동으로 등록됩니다</li>
            <li>• 중복 제안을 방지하기 위해 URL을 기준으로 확인합니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
