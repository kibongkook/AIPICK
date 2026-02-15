'use client';

import { useState, useEffect } from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn, getAvatarColor } from '@/lib/utils';
import UserLevelBadge from '@/components/user/UserLevelBadge';
import type { UserLevel } from '@/types';

interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url: string | null;
  level: UserLevel;
  experience_points: number;
  question_count: number;
  answer_count: number;
  accepted_answer_count: number;
  review_count: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/user/leaderboard?limit=50');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            홈으로
          </Link>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            리더보드
          </h1>
          <p className="text-sm text-gray-600 mt-1">커뮤니티에 가장 많이 기여한 사용자</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-400">로딩 중...</div>
          ) : leaders.length > 0 ? (
            <div className="space-y-2">
              {leaders.map((user, i) => {
                const avatarColor = getAvatarColor(user.display_name || 'User');
                const firstChar = (user.display_name || 'U')[0];

                return (
                  <div key={user.id} className="flex items-center gap-4 rounded-xl border border-border bg-white p-4">
                    <span className={cn(
                      'w-8 text-center text-lg font-bold',
                      i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-300'
                    )}>
                      {i + 1}
                    </span>
                    <div className={cn('h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shrink-0', avatarColor)}>
                      {firstChar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{user.display_name}</span>
                        <UserLevelBadge level={user.level} size="md" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span>답변 {user.answer_count || 0}</span>
                        <span>채택 {user.accepted_answer_count || 0}</span>
                        <span>리뷰 {user.review_count || 0}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-primary">{user.experience_points}</p>
                      <p className="text-xs text-gray-400">EXP</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              아직 활동 데이터가 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
