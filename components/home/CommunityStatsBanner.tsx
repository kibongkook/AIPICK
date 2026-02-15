import { MessageSquare, Users, TrendingUp } from 'lucide-react';

interface CommunityStatsBannerProps {
  questionCount: number;
  answerCount: number;
  activeUsers: number;
}

export default function CommunityStatsBanner({ questionCount, answerCount, activeUsers }: CommunityStatsBannerProps) {
  // 데이터가 전혀 없으면 표시하지 않음
  if (questionCount === 0 && answerCount === 0 && activeUsers === 0) return null;

  return (
    <div className="rounded-xl bg-gradient-to-r from-primary/5 to-purple-50 border border-primary/10 p-4">
      <div className="flex items-center justify-center gap-6 sm:gap-10">
        <StatItem icon={MessageSquare} label="이번 주 질문" count={questionCount} />
        <StatItem icon={TrendingUp} label="이번 주 답변" count={answerCount} />
        <StatItem icon={Users} label="활동 사용자" count={activeUsers} />
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, count }: { icon: typeof MessageSquare; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <div>
        <p className="text-lg font-bold text-foreground">{count}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}
