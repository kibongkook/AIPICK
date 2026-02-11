'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { NOTIFICATION_POLL_INTERVAL_MS } from '@/lib/constants';
import type { Notification } from '@/types';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 미읽 수 폴링
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await fetch('/api/notifications/count');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch {
      // ignore
    }
  }, [user]);

  // 알림 목록 조회
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=20');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 읽음 처리
  const markAsRead = useCallback(async (ids?: string[]) => {
    if (!user) return;

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ids ? { ids } : { all: true }),
      });
      await fetchUnreadCount();
      await fetchNotifications();
    } catch {
      // ignore
    }
  }, [user, fetchUnreadCount, fetchNotifications]);

  // 폴링 시작
  useEffect(() => {
    if (!user) return;

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, NOTIFICATION_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
  };
}
