'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, ArrowRight } from 'lucide-react';
import { cn, getAvatarColor } from '@/lib/utils';
import UserLevelBadge from './UserLevelBadge';
import type { UserLevel } from '@/types';

interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url: string | null;
  level: UserLevel;
  experience_points: number;
  answer_count: number;
  accepted_answer_count: number;
}

export default function LeaderboardWidget() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/user/leaderboard?limit=5');
        if (res.ok) {
          const data = await res.json();
          setLeaders(data.leaderboard || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="animate-pulse h-48 rounded-xl bg-gray-100" />;
  if (leaders.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-amber-500" />
          TOP 기여자
        </h3>
        <Link href="/leaderboard" className="text-xs text-primary hover:text-primary-hover flex items-center gap-0.5">
          전체 보기
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {leaders.map((user, i) => {
          const avatarColor = getAvatarColor(user.display_name || 'User');
          const firstChar = (user.display_name || 'U')[0];

          return (
            <div key={user.id} className="flex items-center gap-2.5">
              <span className={cn(
                'w-5 text-center text-xs font-bold',
                i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-300'
              )}>
                {i + 1}
              </span>
              <div className={cn('h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0', avatarColor)}>
                {firstChar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-foreground truncate">{user.display_name}</span>
                  <UserLevelBadge level={user.level} />
                </div>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{user.experience_points} EXP</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
