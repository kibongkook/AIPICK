'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const STORAGE_KEY = 'aipick_bookmarks';
const useApi = isSupabaseConfigured();

// ── localStorage 헬퍼 ──
function getLocalBookmarks(userId: string): string[] {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
function setLocalBookmarks(userId: string, bookmarks: string[]) {
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(bookmarks));
}

export function useBookmark(toolId: string) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!user) { setIsBookmarked(false); return; }

    if (useApi && user.provider !== 'demo') {
      fetch(`/api/bookmarks?tool_id=${encodeURIComponent(toolId)}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => { if (data) setIsBookmarked(data.bookmarked); })
        .catch(() => {
          setIsBookmarked(getLocalBookmarks(user.id).includes(toolId));
        });
    } else {
      setIsBookmarked(getLocalBookmarks(user.id).includes(toolId));
    }
  }, [user, toolId]);

  const toggle = useCallback(async () => {
    if (!user) return false;

    if (useApi && user.provider !== 'demo') {
      try {
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tool_id: toolId }),
        });
        if (res.ok) {
          const data = await res.json();
          setIsBookmarked(data.bookmarked);
          return true;
        }
      } catch { /* fallback */ }
    }

    // localStorage fallback
    const bookmarks = getLocalBookmarks(user.id);
    let updated: string[];
    if (bookmarks.includes(toolId)) {
      updated = bookmarks.filter((id) => id !== toolId);
      setIsBookmarked(false);
    } else {
      updated = [...bookmarks, toolId];
      setIsBookmarked(true);
    }
    setLocalBookmarks(user.id, updated);
    return true;
  }, [user, toolId]);

  return { isBookmarked, toggle };
}

export function useBookmarkList() {
  const { user } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    if (!user) { setBookmarkedIds([]); return; }

    if (useApi && user.provider !== 'demo') {
      try {
        const res = await fetch('/api/bookmarks');
        if (res.ok) {
          const data = await res.json();
          setBookmarkedIds(data.bookmarkedIds || []);
          return;
        }
      } catch { /* fallback */ }
    }

    setBookmarkedIds(getLocalBookmarks(user.id));
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { bookmarkedIds, refresh };
}
