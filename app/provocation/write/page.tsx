'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PROVOCATION_HEADERS } from '@/lib/constants';
import ProvocationForm from '@/components/provocation/ProvocationForm';

export default function ProvocationWritePage() {
  // 랜덤 헤더 메시지 선택
  const randomHeader = PROVOCATION_HEADERS[Math.floor(Math.random() * PROVOCATION_HEADERS.length)];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 뒤로 가기 */}
        <Link
          href="/provocation"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          도발 목록으로 돌아가기
        </Link>

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-3xl">
              <span>🔥</span>
              <h1 className="font-bold text-gray-900">도발하기</h1>
            </div>
          </div>
          <p className="text-lg text-gray-600 font-medium">{randomHeader}</p>
          <p className="text-sm text-gray-500 mt-2">
            AIPICK에 추가하고 싶은 기능을 제안하세요. 1주일간 투표를 거쳐 60% 이상 찬성 시 개발이 시작됩니다.
          </p>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <ProvocationForm />
        </div>
      </div>
    </div>
  );
}
