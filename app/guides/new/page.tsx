'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { LoginPrompt } from '@/components/auth/AuthGuard';
import type { GuideCategory } from '@/types';

const useApi = isSupabaseConfigured();

const CATEGORIES: { value: GuideCategory; label: string }[] = [
  { value: 'tip', label: '팁' },
  { value: 'tutorial', label: '튜토리얼' },
  { value: 'job', label: '직군별' },
  { value: 'education', label: '교육/학년별' },
];

export default function NewGuidePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<GuideCategory>('tip');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <LoginPrompt message="가이드를 작성하려면 로그인이 필요합니다." />
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);

    if (useApi && user.provider !== 'demo') {
      try {
        const res = await fetch('/api/guides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            category,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          router.push(`/guides/${data.guide.slug}`);
          return;
        }
      } catch { /* ignore */ }
    }

    // Demo mode: localStorage fallback
    const slug = title.toLowerCase().replace(/[^a-z0-9가-힣\s-]/g, '').replace(/\s+/g, '-').substring(0, 80) + '-' + Date.now().toString(36);
    const existing = JSON.parse(localStorage.getItem('aipick_guides') || '[]');
    existing.push({
      id: `guide-user-${Date.now()}`,
      title: title.trim(),
      slug,
      content: content.trim(),
      category,
      related_job_id: null,
      related_edu_id: null,
      view_count: 0,
      author_id: user.id,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('aipick_guides', JSON.stringify(existing));
    router.push('/guides');
  };

  // 간단한 마크다운 렌더링
  const renderMarkdown = (md: string) => {
    return md
      .split('\n')
      .map((line) => {
        if (line.startsWith('### ')) return `<h3 class="text-base font-bold mt-4 mb-2">${line.slice(4)}</h3>`;
        if (line.startsWith('## ')) return `<h2 class="text-lg font-bold mt-5 mb-2">${line.slice(3)}</h2>`;
        if (line.startsWith('# ')) return `<h1 class="text-xl font-bold mt-6 mb-3">${line.slice(2)}</h1>`;
        if (line.startsWith('- ')) return `<li class="ml-4 list-disc text-sm text-gray-700">${line.slice(2)}</li>`;
        if (line.trim() === '') return '<br/>';
        return `<p class="text-sm text-gray-700 leading-relaxed">${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
      })
      .join('');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <BookOpen className="h-6 w-6 text-primary" />
          가이드 작성
        </h1>
        <button
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {preview ? '편집' : '미리보기'}
        </button>
      </div>

      <div className="space-y-4">
        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === cat.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="가이드 제목을 입력하세요"
            className="w-full rounded-lg border border-border px-4 py-3 text-base font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            내용 * <span className="text-xs text-gray-400">(마크다운 지원: #, ##, ###, **, -, 줄바꿈)</span>
          </label>
          {preview ? (
            <div
              className="min-h-[300px] rounded-lg border border-border bg-white p-4"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="가이드 내용을 작성하세요...&#10;&#10;마크다운 문법을 사용할 수 있습니다:&#10;# 큰 제목&#10;## 중간 제목&#10;### 작은 제목&#10;**굵게**&#10;- 목록 항목"
              rows={16}
              className="w-full rounded-lg border border-border px-4 py-3 text-sm font-mono leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
            />
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => router.push('/guides')}
          className="rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || saving}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? '저장 중...' : '가이드 발행'}
        </button>
      </div>
    </div>
  );
}
