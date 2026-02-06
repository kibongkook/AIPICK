'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Search, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { cn } from '@/lib/utils';
import type { Tool } from '@/types';

const useApi = isSupabaseConfigured();

export default function CreateCollectionButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [toolSearch, setToolSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && allTools.length === 0) {
      fetch('/api/tools')
        .then((r) => r.json())
        .then((d) => setAllTools(d.tools || []))
        .catch(() => {});
    }
  }, [open, allTools.length]);

  if (!user) return null;

  const filteredTools = allTools.filter(
    (t) => t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
           t.description.toLowerCase().includes(toolSearch.toLowerCase())
  );

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);

    if (useApi && user.provider !== 'demo') {
      try {
        const res = await fetch('/api/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            is_public: isPublic,
            tool_ids: selectedTools,
          }),
        });
        if (res.ok) {
          setOpen(false);
          resetForm();
          window.location.reload();
          return;
        }
      } catch { /* ignore */ }
    }

    // Demo mode: localStorage fallback
    const existing = JSON.parse(localStorage.getItem('aipick_collections') || '[]');
    existing.push({
      id: `collection-user-${Date.now()}`,
      user_id: user.id,
      user_name: user.name,
      title: title.trim(),
      description: description.trim() || null,
      is_public: isPublic,
      like_count: 0,
      tool_ids: selectedTools,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('aipick_collections', JSON.stringify(existing));
    setOpen(false);
    resetForm();
    window.location.reload();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setIsPublic(true);
    setSelectedTools([]);
    setToolSearch('');
    setSaving(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
      >
        <Plus className="h-4 w-4" />
        컬렉션 만들기
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[85vh] flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">새 컬렉션 만들기</h2>
              <button onClick={() => { setOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 프리랜서를 위한 AI 필수 도구 모음"
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="이 컬렉션에 대한 간단한 설명..."
                  rows={2}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {/* 공개 설정 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">공개 컬렉션</span>
              </label>

              {/* 도구 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI 도구 선택 ({selectedTools.length}개)
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={toolSearch}
                    onChange={(e) => setToolSearch(e.target.value)}
                    placeholder="도구 검색..."
                    className="w-full rounded-lg border border-border pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-border divide-y divide-gray-100">
                  {filteredTools.slice(0, 30).map((tool) => {
                    const selected = selectedTools.includes(tool.id);
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => toggleTool(tool.id)}
                        className={cn(
                          'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                          selected ? 'bg-primary/5 text-primary' : 'hover:bg-gray-50'
                        )}
                      >
                        <div className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border',
                          selected ? 'border-primary bg-primary' : 'border-gray-300'
                        )}>
                          {selected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="truncate">{tool.name}</span>
                      </button>
                    );
                  })}
                  {filteredTools.length === 0 && (
                    <p className="px-3 py-4 text-xs text-gray-400 text-center">검색 결과가 없습니다.</p>
                  )}
                </div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => { setOpen(false); resetForm(); }}
                className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || saving}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? '저장 중...' : '만들기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
