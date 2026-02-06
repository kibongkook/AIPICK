'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

const STORAGE_KEY = 'aipick_upvotes';

function getStoredUpvotes(userId: string): string[] {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredUpvotes(userId: string, upvotes: string[]) {
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(upvotes));
}

export function useUpvote(toolId: string) {
  const { user } = useAuth();
  const [isUpvoted, setIsUpvoted] = useState(false);

  useEffect(() => {
    if (!user) { setIsUpvoted(false); return; }
    const upvotes = getStoredUpvotes(user.id);
    setIsUpvoted(upvotes.includes(toolId));
  }, [user, toolId]);

  const toggle = useCallback(() => {
    if (!user) return false;
    const upvotes = getStoredUpvotes(user.id);
    let updated: string[];
    if (upvotes.includes(toolId)) {
      updated = upvotes.filter((id) => id !== toolId);
      setIsUpvoted(false);
    } else {
      updated = [...upvotes, toolId];
      setIsUpvoted(true);
    }
    setStoredUpvotes(user.id, updated);
    return true;
  }, [user, toolId]);

  return { isUpvoted, toggle };
}
