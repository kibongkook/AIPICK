'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Loader2, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { PROVOCATION_HEADERS } from '@/lib/constants';
import { getLocalProvocations, filterAndSortProvocations, saveLocalVote, getUserVote } from '@/lib/provocation/localStorage';
import ProvocationCard from '@/components/provocation/ProvocationCard';
import type { Provocation } from '@/types';

function ProvocationContent() {
  const router = useRouter();

  const [allProvocations, setAllProvocations] = useState<Provocation[]>([]);
  const [topProvocations, setTopProvocations] = useState<Provocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // 랜덤 헤더 메시지
  const randomHeader = PROVOCATION_HEADERS[Math.floor(Math.random() * PROVOCATION_HEADERS.length)];

  // 데이터 페칭
  useEffect(() => {
    fetchProvocations();
  }, []);

  const fetchProvocations = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/provocation?limit=100');
      const data = await res.json();

      let provocations: Provocation[] = [];

      // API에서 데이터가 없으면 로컬스토리지 사용
      if (!data.provocations || data.provocations.length === 0) {
        const localProvocations = getLocalProvocations();
        // 사용자 투표 정보 및 투표율 추가
        provocations = localProvocations.map(p => {
          const totalVotes = p.vote_up_count + p.vote_down_count;
          return {
            ...p,
            user_vote: getUserVote(p.id),
            vote_ratio: totalVotes > 0 ? p.vote_up_count / totalVotes : 0,
          };
        });
      } else {
        provocations = data.provocations || [];
      }

      // 전체 목록 (최신순)
      const sortedAll = [...provocations].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // 투표 진행중인 상위 5개 (투표수 기준)
      const voting = provocations.filter(p =>
        p.status === 'submitted' || p.status === 'voting'
      );
      const sortedTop = [...voting].sort((a, b) =>
        (b.vote_up_count - b.vote_down_count) - (a.vote_up_count - a.vote_down_count)
      ).slice(0, 5);

      setAllProvocations(sortedAll);
      setTopProvocations(sortedTop);
    } catch (err) {
      // API 실패 시 로컬스토리지 사용
      console.log('API failed, using localStorage');
      const localProvocations = getLocalProvocations();

      const enriched = localProvocations.map(p => {
        const totalVotes = p.vote_up_count + p.vote_down_count;
        return {
          ...p,
          user_vote: getUserVote(p.id),
          vote_ratio: totalVotes > 0 ? p.vote_up_count / totalVotes : 0,
        };
      });

      const sortedAll = [...enriched].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const voting = enriched.filter(p =>
        p.status === 'submitted' || p.status === 'voting'
      );
      const sortedTop = [...voting].sort((a, b) =>
        (b.vote_up_count - b.vote_down_count) - (a.vote_up_count - a.vote_down_count)
      ).slice(0, 5);

      setAllProvocations(sortedAll);
      setTopProvocations(sortedTop);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (provocationId: string, voteType: 'up' | 'down') => {
    try {
      // 로컬 도발인지 확인 (id가 'local-'로 시작)
      if (provocationId.startsWith('local-')) {
        const success = saveLocalVote(provocationId, voteType);
        if (!success) {
          alert('이미 투표하셨습니다. 투표는 한 번만 가능합니다.');
          return;
        }
        fetchProvocations();
        return;
      }

      // API 투표 시도
      const res = await fetch(`/api/provocation/${provocationId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType }),
      });

      if (!res.ok) {
        const data = await res.json();
        // Supabase not configured면 로컬스토리지로 fallback
        if (data.error === 'Supabase not configured') {
          const success = saveLocalVote(provocationId, voteType);
          if (!success) {
            alert('이미 투표하셨습니다. 투표는 한 번만 가능합니다.');
            return;
          }
          fetchProvocations();
          return;
        }
        alert(data.error || '투표에 실패했습니다');
        return;
      }

      // 목록 새로고침
      fetchProvocations();
    } catch (err) {
      // API 실패 시 로컬스토리지로 fallback
      console.log('Vote API failed, using localStorage');
      const success = saveLocalVote(provocationId, voteType);
      if (!success) {
        alert('이미 투표하셨습니다. 투표는 한 번만 가능합니다.');
        return;
      }
      fetchProvocations();
    }
  };

  // 페이지네이션
  const totalPages = Math.ceil(allProvocations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProvocations = allProvocations.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🔥</span>
              <h1 className="text-2xl font-bold text-foreground">도발</h1>
            </div>
            <Link
              href="/provocation/write"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              도발하기
            </Link>
          </div>
          <p className="text-base text-gray-600">{randomHeader}</p>
          <p className="text-sm text-gray-500 mt-1">
            AIPICK 개발에 직접 참여하세요. 제안 → 투표 → 개발 → 완료
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* 투표 진행 중 - TOP 5 */}
            {topProvocations.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">투표 진행 중</h2>
                  <span className="text-sm text-gray-500">상위 {topProvocations.length}개 제안</span>
                </div>
                <div className="grid gap-4">
                  {topProvocations.map((provocation, index) => (
                    <div key={provocation.id} className="relative">
                      {/* 순위 배지 */}
                      <div className="absolute -left-2 -top-2 z-10 flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm rounded-full shadow-lg">
                        {index + 1}
                      </div>
                      <ProvocationCard
                        provocation={provocation}
                        onVote={(voteType) => handleVote(provocation.id, voteType)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 전체 제안 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">전체 제안</h2>
                <span className="text-sm text-gray-500">
                  총 {allProvocations.length}개 제안
                </span>
              </div>

              {currentProvocations.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500 mb-4">아직 제안이 없습니다</p>
                  <Link
                    href="/provocation/write"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    첫 제안 시작하기
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 mb-6">
                    {currentProvocations.map((provocation) => (
                      <ProvocationCard
                        key={provocation.id}
                        provocation={provocation}
                        onVote={(voteType) => handleVote(provocation.id, voteType)}
                      />
                    ))}
                  </div>

                  {/* 페이지네이션 */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // 현재 페이지 주변 5개만 표시
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 2 && page <= currentPage + 2)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                  currentPage === page
                                    ? 'bg-primary text-white'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (page === currentPage - 3 || page === currentPage + 3) {
                            return (
                              <span key={page} className="px-2 text-gray-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProvocationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ProvocationContent />
    </Suspense>
  );
}
