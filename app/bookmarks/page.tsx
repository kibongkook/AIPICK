'use client';

import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useBookmarkList } from '@/hooks/useBookmark';
import ServiceCard from '@/components/service/ServiceCard';
import AuthGuard from '@/components/auth/AuthGuard';
import type { Tool } from '@/types';

export default function BookmarksPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">내 북마크</h1>
      </div>
      <AuthGuard message="북마크를 사용하려면 로그인이 필요합니다.">
        <BookmarkContent />
      </AuthGuard>
    </div>
  );
}

function BookmarkContent() {
  const { bookmarkedIds, refresh } = useBookmarkList();
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (bookmarkedIds.length === 0) {
      setTools([]);
      return;
    }
    fetch('/api/tools')
      .then((res) => res.json())
      .then((data) => {
        const allTools: Tool[] = data.tools || [];
        setTools(allTools.filter((t) => bookmarkedIds.includes(t.id)));
      })
      .catch(() => setTools([]));
  }, [bookmarkedIds]);

  if (tools.length === 0) {
    return (
      <div className="py-16 text-center">
        <Bookmark className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-4 text-lg font-medium text-gray-500">저장한 서비스가 없습니다</p>
        <p className="mt-1 text-sm text-gray-400">관심 있는 AI 서비스를 북마크해보세요.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ServiceCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
