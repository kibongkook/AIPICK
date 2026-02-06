'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

const STORAGE_KEY = 'aipick_comments';

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

function getAllComments(): StoredComment[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAllComments(comments: StoredComment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}

export function useComments(toolId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<StoredComment[]>([]);

  const load = useCallback(() => {
    const all = getAllComments()
      .filter((c) => c.tool_id === toolId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setComments(all);
  }, [toolId]);

  useEffect(() => { load(); }, [load]);

  const addComment = useCallback((content: string, parentId: string | null = null) => {
    if (!user || !content.trim()) return false;
    const all = getAllComments();
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
    saveAllComments([...all, comment]);
    load();
    return true;
  }, [user, toolId, load]);

  const deleteComment = useCallback((commentId: string) => {
    if (!user) return;
    const all = getAllComments().filter(
      (c) => !(c.id === commentId && c.user_id === user.id)
    );
    // 대댓글도 삭제
    const filtered = all.filter((c) => c.parent_id !== commentId);
    saveAllComments(filtered);
    load();
  }, [user, load]);

  const toggleLike = useCallback((commentId: string) => {
    const all = getAllComments();
    const target = all.find((c) => c.id === commentId);
    if (target) {
      target.like_count += 1;
      saveAllComments(all);
      load();
    }
  }, [load]);

  // 트리 구조로 변환 (최상위 댓글 + 대댓글)
  const topLevelComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return { comments, topLevelComments, getReplies, addComment, deleteComment, toggleLike };
}
