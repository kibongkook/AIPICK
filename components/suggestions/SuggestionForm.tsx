'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface SuggestionFormProps {
  categories: { slug: string; name: string }[];
  onSubmit: (data: {
    tool_name: string;
    tool_url: string;
    tool_description: string;
    category_slug: string;
    reason: string;
  }) => Promise<boolean>;
}

export default function SuggestionForm({ categories, onSubmit }: SuggestionFormProps) {
  const [toolName, setToolName] = useState('');
  const [toolUrl, setToolUrl] = useState('');
  const [description, setDescription] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await onSubmit({
      tool_name: toolName,
      tool_url: toolUrl,
      tool_description: description,
      category_slug: categorySlug,
      reason,
    });

    if (success) {
      // 초기화
      setToolName('');
      setToolUrl('');
      setDescription('');
      setCategorySlug('');
      setReason('');
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-foreground mb-4">
        <Plus className="h-5 w-5 text-primary" />
        새로운 AI 서비스 제안하기
      </h3>

      {/* 도구명 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-foreground mb-2">
          서비스 이름 *
        </label>
        <input
          type="text"
          value={toolName}
          onChange={(e) => setToolName(e.target.value)}
          placeholder="예: ChatGPT"
          required
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* URL */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-foreground mb-2">
          웹사이트 URL *
        </label>
        <input
          type="url"
          value={toolUrl}
          onChange={(e) => setToolUrl(e.target.value)}
          placeholder="https://..."
          required
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* 카테고리 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-foreground mb-2">
          카테고리 *
        </label>
        <select
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          required
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">선택해주세요</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 설명 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-foreground mb-2">
          서비스 설명 * (50-500자)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="이 AI 서비스가 무엇을 하는지 간단히 설명해주세요"
          required
          minLength={50}
          maxLength={500}
          rows={4}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{description.length}/500</p>
      </div>

      {/* 제안 이유 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-foreground mb-2">
          왜 이 서비스를 추천하시나요? * (20-200자)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="이 서비스가 AIPICK에 포함되어야 하는 이유"
          required
          minLength={20}
          maxLength={200}
          rows={3}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{reason.length}/200</p>
      </div>

      {/* 제출 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? '제안 중...' : '제안하기'}
      </button>

      <p className="text-xs text-gray-400 mt-3 text-center">
        20명 이상의 추천을 받으면 자동으로 승인됩니다
      </p>
    </form>
  );
}
