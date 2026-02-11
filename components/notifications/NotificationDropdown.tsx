'use client';

import { CheckCheck } from 'lucide-react';
import NotificationItem from './NotificationItem';
import type { Notification } from '@/types';

interface NotificationDropdownProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export default function NotificationDropdown({
  notifications,
  loading,
  onMarkAllRead,
  onClose,
}: NotificationDropdownProps) {
  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-white shadow-lg z-50">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-bold text-foreground">알림</h3>
        {hasUnread && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            모두 읽음
          </button>
        )}
      </div>

      {/* 알림 목록 */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-xs text-gray-400">로딩 중...</div>
        ) : notifications.length > 0 ? (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClose={onClose}
            />
          ))
        ) : (
          <div className="text-center py-8 text-xs text-gray-400">
            알림이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
