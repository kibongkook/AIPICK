'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Compass, Newspaper, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { label: '홈', href: '/', icon: Home },
  { label: '랭킹', href: '/rankings', icon: Trophy },
  { label: 'AI 찾기', href: '/discover', icon: Compass },
  { label: '뉴스', href: '/news', icon: Newspaper },
  { label: 'MY', href: '/profile', icon: User },
] as const;

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/95 backdrop-blur-sm md:hidden"
      aria-label="모바일 내비게이션"
    >
      <div className="flex items-center justify-around h-14">
        {TABS.map((tab) => {
          const isActive = tab.href === '/'
            ? pathname === '/'
            : pathname === tab.href || pathname.startsWith(tab.href + '/');
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-gray-400'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} aria-hidden="true" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[max(env(safe-area-inset-bottom),0px)]" />
    </nav>
  );
}
