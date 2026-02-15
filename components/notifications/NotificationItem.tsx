'use client';

import Link from 'next/link';
import { MessageSquare, Check, ThumbsUp, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types';

const NOTIFICATION_ICONS: Record<NotificationType, { icon: typeof MessageSquare; color: string }> = {
  answer_received: { icon: MessageSquare, color: 'bg-blue-100 text-blue-600' },
  answer_accepted: { icon: Check, color: 'bg-emerald-100 text-emerald-600' },
  like_received: { icon: ThumbsUp, color: 'bg-amber-100 text-amber-600' },
  mention: { icon: AtSign, color: 'bg-purple-100 text-purple-600' },
};

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

export default function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const config = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.answer_received;
  const Icon = config.icon;

  const content = (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer',
      !notification.is_read && 'bg-primary/5'
    )}>
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', config.color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-xs', !notification.is_read ? 'font-semibold text-foreground' : 'text-gray-600')}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatTimeAgo(notification.created_at)}
        </p>
      </div>
      {!notification.is_read && (
        <div className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1.5" />
      )}
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={onClose}>
        {content}
      </Link>
    );
  }

  return content;
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) return '방금';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
  return past.toLocaleDateString('ko-KR');
}
