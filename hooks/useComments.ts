'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const STORAGE_KEY = 'aipick_comments';
const useApi = isSupabaseConfigured();

export interface StoredComment {
  id: string;
  tool_id: string;
  user_id: string;
  user_name: string;
  parent_id: string | null;
  content: string;
  like_count: number;
  created_at: string;
}

// ── localStorage 헬퍼 ──
function getLocalComments(): StoredComment[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
function saveLocalComments(comments: StoredComment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}

export function useComments(toolId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<StoredComment[]>([]);

  const load = useCallback(async () => {
    if (useApi) {
      try {
        const res = await fetch(`/api/comments?target_type=tool&target_id=${encodeURIComponent(toolId)}`);
        if (res.ok) {
          const data = await res.json();
          const mapped: StoredComment[] = (data.comments || []).map((c: Record<string, unknown>) => ({
            id: c.id,
            tool_id: c.target_id || toolId,
            user_id: c.user_id,
            user_name: c.user_name || '사용자',
            parent_id: c.parent_id || null,
            content: c.content,
            like_count: c.like_count || 0,
            created_at: c.created_at,
          }));
          setComments(mapped.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ));
          return;
        }
      } catch { /* fallback */ }
    }
    // localStorage fallback
    const all = getLocalComments()
      .filter((c) => c.tool_id === toolId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setComments(all);
  }, [toolId]);

  useEffect(() => { load(); }, [load]);

  const addComment = useCallback(async (content: string, parentId: string | null = null) => {
    if (!user || !content.trim()) return false;

    if (useApi && user.provider !== 'demo') {
      try {
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target_type: 'tool',
            target_id: toolId,
            content: content.trim(),
            parent_id: parentId,
          }),
        });
        if (res.ok) {
          await load();
          return true;
        }
      } catch { /* fallback */ }
    }

    // localStorage fallback
    const all = getLocalComments();
    const comment: StoredComment = {
      id: `comment-${Date.now()}`,
      tool_id: toolId,
      user_id: user.id,
      user_name: user.name,
      parent_id: parentId,
      content: content.trim(),
      like_count: 0,
      created_at: new Date().toISOString(),
    };
    saveLocalComments([...all, comment]);
    await load();
    return true;
  }, [user, toolId, load]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;

    if (useApi && user.provider !== 'demo') {
      try {
        const res = await fetch(`/api/comments?id=${encodeURIComponent(commentId)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          await load();
          return;
        }
      } catch { /* fallback */ }
    }

    const all = getLocalComments().filter(
      (c) => !(c.id === commentId && c.user_id === user.id)
    );
    const filtered = all.filter((c) => c.parent_id !== commentId);
    saveLocalComments(filtered);
    await load();
  }, [user, load]);

  const toggleLike = useCallback(async (commentId: string) => {
    if (useApi) {
      try {
        const res = await fetch('/api/comments/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment_id: commentId }),
        });
        if (res.ok) {
          await load();
          return;
        }
      } catch { /* fallback */ }
    }

    const all = getLocalComments();
    const target = all.find((c) => c.id === commentId);
    if (target) {
      target.like_count += 1;
      saveLocalComments(all);
      await load();
    }
  }, [load]);

  const topLevelComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return { comments, topLevelComments, getReplies, addComment, deleteComment, toggleLike };
}
