'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const STORAGE_KEY = 'aipick_upvotes';
const useApi = isSupabaseConfigured();

// ── localStorage 헬퍼 ──
function getLocalUpvotes(userId: string): string[] {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
function setLocalUpvotes(userId: string, upvotes: string[]) {
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(upvotes));
}

export function useUpvote(toolId: string) {
  const { user } = useAuth();
  const [isUpvoted, setIsUpvoted] = useState(false);

  useEffect(() => {
    if (!user) { setIsUpvoted(false); return; }

    if (useApi && user.provider !== 'demo') {
      fetch(`/api/upvotes?tool_id=${encodeURIComponent(toolId)}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => { if (data) setIsUpvoted(data.upvoted); })
        .catch(() => {
          setIsUpvoted(getLocalUpvotes(user.id).includes(toolId));
        });
    } else {
      setIsUpvoted(getLocalUpvotes(user.id).includes(toolId));
    }
  }, [user, toolId]);

  const toggle = useCallback(async () => {
    if (!user) return false;

    if (useApi && user.provider !== 'demo') {
      try {
        const res = await fetch('/api/upvotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tool_id: toolId }),
        });
        if (res.ok) {
          const data = await res.json();
          setIsUpvoted(data.upvoted);
          return true;
        }
      } catch { /* fallback */ }
    }

    // localStorage fallback
    const upvotes = getLocalUpvotes(user.id);
    let updated: string[];
    if (upvotes.includes(toolId)) {
      updated = upvotes.filter((id) => id !== toolId);
      setIsUpvoted(false);
    } else {
      updated = [...upvotes, toolId];
      setIsUpvoted(true);
    }
    setLocalUpvotes(user.id, updated);
    return true;
  }, [user, toolId]);

  return { isUpvoted, toggle };
}
