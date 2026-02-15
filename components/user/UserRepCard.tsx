'use client';

import { useState, useEffect } from 'react';
import { Trophy, MessageSquare, Check, Star } from 'lucide-react';
import { USER_LEVELS } from '@/lib/constants';
import UserLevelBadge from './UserLevelBadge';
import type { UserProfile } from '@/types';

interface UserRepCardProps {
  userId?: string;
}

export default function UserRepCard({ userId }: UserRepCardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) return <div className="animate-pulse h-32 rounded-xl bg-gray-100" />;
  if (!profile) return null;

  const currentLevel = USER_LEVELS[profile.level] || USER_LEVELS.newcomer;
  const nextLevel = profile.level === 'newcomer' ? USER_LEVELS.active
    : profile.level === 'active' ? USER_LEVELS.expert
    : profile.level === 'expert' ? USER_LEVELS.master
    : null;

  const progressPercent = nextLevel
    ? Math.min(100, ((profile.experience_points - currentLevel.minExp) / (nextLevel.minExp - currentLevel.minExp)) * 100)
    : 100;

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
          {(profile.display_name || 'U')[0]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{profile.display_name}</span>
            <UserLevelBadge level={profile.level} />
          </div>
          <p className="text-xs text-gray-400">{profile.experience_points} EXP</p>
        </div>
      </div>

      {/* EXP 바 */}
      {nextLevel && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{currentLevel.label}</span>
            <span>{nextLevel.label}까지 {nextLevel.minExp - profile.experience_points} EXP</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* 활동 통계 */}
      <div className="grid grid-cols-3 gap-3">
        <StatItem icon={MessageSquare} label="질문" count={(profile as any).question_count || 0} />
        <StatItem icon={Star} label="답변" count={(profile as any).answer_count || 0} />
        <StatItem icon={Check} label="채택" count={(profile as any).accepted_answer_count || 0} />
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, count }: { icon: typeof Trophy; label: string; count: number }) {
  return (
    <div className="text-center">
      <Icon className="h-4 w-4 text-gray-400 mx-auto mb-1" />
      <p className="text-lg font-bold text-foreground">{count}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
