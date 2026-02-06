'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

const STORAGE_KEY = 'aipick_bookmarks';

function getStoredBookmarks(userId: string): string[] {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredBookmarks(userId: string, bookmarks: string[]) {
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(bookmarks));
}

export function useBookmark(toolId: string) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!user) { setIsBookmarked(false); return; }
    const bookmarks = getStoredBookmarks(user.id);
    setIsBookmarked(bookmarks.includes(toolId));
  }, [user, toolId]);

  const toggle = useCallback(() => {
    if (!user) return false;
    const bookmarks = getStoredBookmarks(user.id);
    let updated: string[];
    if (bookmarks.includes(toolId)) {
      updated = bookmarks.filter((id) => id !== toolId);
      setIsBookmarked(false);
    } else {
      updated = [...bookmarks, toolId];
      setIsBookmarked(true);
    }
    setStoredBookmarks(user.id, updated);
    return true;
  }, [user, toolId]);

  return { isBookmarked, toggle };
}

export function useBookmarkList() {
  const { user } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) { setBookmarkedIds([]); return; }
    setBookmarkedIds(getStoredBookmarks(user.id));
  }, [user]);

  const refresh = useCallback(() => {
    if (!user) return;
    setBookmarkedIds(getStoredBookmarks(user.id));
  }, [user]);

  return { bookmarkedIds, refresh };
}
