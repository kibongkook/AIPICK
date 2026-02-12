import Link from 'next/link';
import { Search, MessageCircleQuestion, Flame } from 'lucide-react';
import { SOCIAL_PROOF_MESSAGES } from '@/lib/constants';

interface HeroSimplifiedProps {
  toolCount: number;
}

const ENTRY_POINTS = [
  {
    title: 'AI 찾기',
    description: '목적에 맞는 AI를 찾아보세요',
    icon: Search,
    href: '/discover',
    color: 'from-primary to-blue-600',
  },
  {
    title: '커뮤니티',
    description: 'AI 활용 팁과 질문을 나눠보세요',
    icon: MessageCircleQuestion,
    href: '/community',
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: '🔥 도발',
    description: 'AIPICK 개발에 직접 참여하세요',
    icon: Flame,
    href: '/provocation',
    color: 'from-orange-500 to-red-500',
  },
] as const;

export default function HeroSimplified({ toolCount }: HeroSimplifiedProps) {
  return (
    <section className="hero-gradient">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="text-center">
          {/* 라이브 인디케이터 */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 mb-4 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse-dot" />
            <span className="text-xs text-gray-400">{toolCount}개 AI 서비스 분석 중</span>
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl leading-tight">
            {SOCIAL_PROOF_MESSAGES.hero_headline}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
            {SOCIAL_PROOF_MESSAGES.hero_sub}
          </p>

          {/* 진입점 카드 */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto">
            {ENTRY_POINTS.map((ep) => (
              <Link
                key={ep.title}
                href={ep.href}
                className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm hover:bg-white/10 transition-all"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${ep.color} shadow-lg`}>
                  <ep.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white">{ep.title}</h3>
                <p className="text-xs text-gray-400">{ep.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
