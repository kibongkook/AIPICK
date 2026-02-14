import { SOCIAL_PROOF_MESSAGES } from '@/lib/constants';

interface HeroSimplifiedProps {
  toolCount: number;
}

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
        </div>
      </div>
    </section>
  );
}
