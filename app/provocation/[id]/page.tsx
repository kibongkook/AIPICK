'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ThumbsUp, ThumbsDown, Clock, ExternalLink, Loader2, Calendar, User } from 'lucide-react';
import { cn, getAvatarColor } from '@/lib/utils';
import { PROVOCATION_CATEGORIES, PROVOCATION_STATUSES } from '@/lib/constants';
import { getLocalProvocations, saveLocalVote, getUserVote } from '@/lib/provocation/localStorage';
import CommentSection from '@/components/community/v2/CommentSection';
import type { Provocation } from '@/types';

export default function ProvocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [provocation, setProvocation] = useState<Provocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    fetchProvocation();
  }, [id]);

  const fetchProvocation = async () => {
    setLoading(true);
    setError(null);

    try {
      // 로컬 ID인지 확인
      if (id.startsWith('local-')) {
        const localProvocations = getLocalProvocations();
        const found = localProvocations.find(p => p.id === id);

        if (found) {
          const provocationData = {
            ...found,
            user_vote: getUserVote(found.id),
            vote_ratio: found.vote_up_count + found.vote_down_count > 0
              ? found.vote_up_count / (found.vote_up_count + found.vote_down_count)
              : 0,
          } as any;
          setProvocation(provocationData);
          setCommentCount(provocationData.comment_count || 0);
        } else {
          setError('도발을 찾을 수 없습니다');
        }
        return;
      }

      // API에서 가져오기
      const res = await fetch(`/api/provocation/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('도발을 찾을 수 없습니다');
        } else {
          throw new Error('Failed to fetch');
        }
        return;
      }

      const data = await res.json();
      setProvocation(data.provocation);
      setCommentCount(data.provocation.comment_count || 0);
    } catch (err) {
      // API 실패 시 로컬스토리지 확인
      console.log('API failed, checking localStorage');
      const localProvocations = getLocalProvocations();
      const found = localProvocations.find(p => p.id === id);

      if (found) {
        const provocationData = {
          ...found,
          user_vote: getUserVote(found.id),
          vote_ratio: found.vote_up_count + found.vote_down_count > 0
            ? found.vote_up_count / (found.vote_up_count + found.vote_down_count)
            : 0,
        } as any;
        setProvocation(provocationData);
        setCommentCount(provocationData.comment_count || 0);
      } else {
        setError('도발을 불러오는데 실패했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!provocation || voting) return;

    setVoting(true);

    try {
      // 로컬 도발인지 확인
      if (id.startsWith('local-')) {
        const success = saveLocalVote(id, voteType);
        if (!success) {
          alert('이미 투표하셨습니다. 투표는 한 번만 가능합니다.');
          return;
        }
        fetchProvocation();
        return;
      }

      // API 투표 시도
      const res = await fetch(`/api/provocation/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType }),
      });

      if (!res.ok) {
        const data = await res.json();
        // Supabase not configured면 로컬스토리지로 fallback
        if (data.error === 'Supabase not configured') {
          const success = saveLocalVote(id, voteType);
          if (!success) {
            alert('이미 투표하셨습니다. 투표는 한 번만 가능합니다.');
            return;
          }
          fetchProvocation();
          return;
        }
        alert(data.error || '투표에 실패했습니다');
        return;
      }

      // 새로고침
      fetchProvocation();
    } catch (err) {
      // API 실패 시 로컬스토리지로 fallback
      console.log('Vote API failed, using localStorage');
      const success = saveLocalVote(id, voteType);
      if (!success) {
        alert('이미 투표하셨습니다. 투표는 한 번만 가능합니다.');
        return;
      }
      fetchProvocation();
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !provocation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '도발을 찾을 수 없습니다'}</p>
          <Link
            href="/provocation"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const categoryConfig = PROVOCATION_CATEGORIES[provocation.category as keyof typeof PROVOCATION_CATEGORIES];
  const statusConfig = PROVOCATION_STATUSES[provocation.status as keyof typeof PROVOCATION_STATUSES];
  const avatarColor = getAvatarColor(provocation.user_name);
  const firstChar = provocation.user_name[0];
  const voteRatio = provocation.vote_ratio || 0;
  const totalVotes = provocation.vote_up_count + provocation.vote_down_count;

  // 투표 종료까지 시간 계산
  const getTimeRemaining = () => {
    if (!provocation.voting_end_date) return null;
    const now = new Date();
    const end = new Date(provocation.voting_end_date);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return '종료됨';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}일 ${hours}시간 남음`;
    if (hours > 0) return `${hours}시간 남음`;
    return '1시간 미만 남음';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

        {/* 메인 콘텐츠 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* 헤더 */}
          <div className="p-6 border-b border-gray-200">
            {/* 상태 + 카테고리 */}
            <div className="flex items-center gap-2 mb-4">
              <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-sm font-medium', statusConfig?.color || 'bg-gray-100 text-gray-600')}>
                {statusConfig?.label || provocation.status}
              </span>
              <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-sm font-medium', categoryConfig?.color || 'bg-gray-100 text-gray-600')}>
                {categoryConfig?.label || provocation.category}
              </span>
              {provocation.status === 'voting' && (
                <span className="inline-flex items-center gap-1 text-sm text-gray-500 ml-auto">
                  <Clock className="h-4 w-4" />
                  {getTimeRemaining()}
                </span>
              )}
            </div>

            {/* 제목 */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{provocation.title}</h1>

            {/* 작성자 & 날짜 */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold', avatarColor)}>
                  {firstChar}
                </div>
                <span>{provocation.user_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(provocation.created_at)}</span>
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="p-6 space-y-6">
            {/* 설명 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">상세 설명</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{provocation.description}</p>
            </div>

            {/* 기대 효과 */}
            {provocation.expected_effect && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">기대 효과</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{provocation.expected_effect}</p>
              </div>
            )}

            {/* 참고 URL */}
            {provocation.reference_url && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">참고 링크</h3>
                <a
                  href={provocation.reference_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  {provocation.reference_url}
                </a>
              </div>
            )}

            {/* 이미지 */}
            {provocation.images && provocation.images.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">첨부 이미지</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {provocation.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`첨부 이미지 ${i + 1}`}
                      className="rounded-lg border border-gray-200 w-full object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 투표 섹션 */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">투표하기</h3>

            {/* 투표 버튼 */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => handleVote('up')}
                disabled={voting || provocation.user_vote !== null || (provocation.status !== 'submitted' && provocation.status !== 'voting')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                  provocation.user_vote === 'up'
                    ? 'bg-primary text-white'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                )}
              >
                <ThumbsUp className="h-5 w-5" />
                <span>찬성</span>
                <span className="text-lg font-bold">{provocation.vote_up_count}</span>
              </button>

              <button
                onClick={() => handleVote('down')}
                disabled={voting || provocation.user_vote !== null || (provocation.status !== 'submitted' && provocation.status !== 'voting')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                  provocation.user_vote === 'down'
                    ? 'bg-red-500 text-white'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-red-500 hover:text-red-500'
                )}
              >
                <ThumbsDown className="h-5 w-5" />
                <span>반대</span>
                <span className="text-lg font-bold">{provocation.vote_down_count}</span>
              </button>
            </div>

            {/* 투표 진행 바 */}
            {totalVotes > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>찬성률 {Math.round(voteRatio * 100)}%</span>
                  <span>{totalVotes}명 투표</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${voteRatio * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * 찬성률 60% 이상 시 개발 검토에 들어갑니다
                </p>
              </div>
            )}
          </div>

          {/* 거부 사유 (거부된 경우) */}
          {provocation.status === 'rejected' && provocation.rejection_reason && (
            <div className="p-6 bg-red-50 border-t border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">거부 사유</h3>
              <p className="text-red-700">{provocation.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* 댓글 섹션 */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <CommentSection
            postId={id}
            commentCount={commentCount}
            onCommentCountChange={setCommentCount}
            contentType="provocation"
          />
        </div>
      </div>
    </div>
  );
}
