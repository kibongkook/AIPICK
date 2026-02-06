import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';
import Wizard from '@/components/recommend/Wizard';

export const metadata: Metadata = {
  title: `AI 추천받기 | ${SITE_NAME}`,
  description: '4단계 질문으로 나에게 맞는 AI를 추천받으세요. 목적, 직군, 예산, 한국어 지원 기준.',
};

export default function RecommendPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Wizard />
    </div>
  );
}
