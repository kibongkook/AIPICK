/**
 * 로컬스토리지 기반 도발 시스템 (Supabase 없을 때 사용)
 */

import type { Provocation, ProvocationVote, ProvocationCategory } from '@/types';

const STORAGE_KEYS = {
  PROVOCATIONS: 'aipick_provocations',
  VOTES: 'aipick_provocation_votes',
  USER_VOTES: 'aipick_user_provocation_votes',
} as const;

// 로컬스토리지에서 도발 목록 가져오기
export function getLocalProvocations(): Provocation[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROVOCATIONS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// 로컬스토리지에 도발 저장
export function saveLocalProvocation(data: {
  user_id: string;
  user_name: string;
  title: string;
  category: ProvocationCategory;
  description: string;
  expected_effect: string | null;
  reference_url: string | null;
  images: string[];
}): Provocation {
  const provocations = getLocalProvocations();

  const newProvocation: Provocation = {
    ...data,
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    vote_up_count: 0,
    vote_down_count: 0,
    comment_count: 0,
    status: 'submitted',
    voting_round_id: null,
    voting_start_date: null,
    voting_end_date: null,
    rejection_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  provocations.unshift(newProvocation);
  localStorage.setItem(STORAGE_KEYS.PROVOCATIONS, JSON.stringify(provocations));

  return newProvocation;
}

// 로컬스토리지에서 도발 삭제
export function deleteLocalProvocation(id: string): void {
  const provocations = getLocalProvocations();
  const filtered = provocations.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROVOCATIONS, JSON.stringify(filtered));
}

// 로컬스토리지에서 투표 가져오기
export function getLocalVotes(provocationId: string): { up: number; down: number } {
  if (typeof window === 'undefined') return { up: 0, down: 0 };

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VOTES);
    const votes: Record<string, { up: number; down: number }> = stored ? JSON.parse(stored) : {};
    return votes[provocationId] || { up: 0, down: 0 };
  } catch {
    return { up: 0, down: 0 };
  }
}

// 로컬스토리지에서 사용자 투표 상태 가져오기
export function getUserVote(provocationId: string): 'up' | 'down' | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_VOTES);
    const userVotes: Record<string, 'up' | 'down'> = stored ? JSON.parse(stored) : {};
    return userVotes[provocationId] || null;
  } catch {
    return null;
  }
}

// 로컬스토리지에 투표 저장 (한 번만 가능, 취소/수정 불가)
export function saveLocalVote(provocationId: string, voteType: 'up' | 'down'): boolean {
  // 기존 투표 상태 확인
  const currentVote = getUserVote(provocationId);

  // 이미 투표한 경우 아무것도 하지 않음
  if (currentVote) {
    return false;
  }

  // 투표 카운트 업데이트
  const votes = getLocalVotes(provocationId);
  const allVotesStored = localStorage.getItem(STORAGE_KEYS.VOTES);
  const allVotes: Record<string, { up: number; down: number }> = allVotesStored ? JSON.parse(allVotesStored) : {};

  // 새 투표 추가
  allVotes[provocationId] = {
    up: votes.up + (voteType === 'up' ? 1 : 0),
    down: votes.down + (voteType === 'down' ? 1 : 0),
  };

  // 사용자 투표 저장
  const userVotesStored = localStorage.getItem(STORAGE_KEYS.USER_VOTES);
  const userVotes: Record<string, 'up' | 'down'> = userVotesStored ? JSON.parse(userVotesStored) : {};
  userVotes[provocationId] = voteType;
  localStorage.setItem(STORAGE_KEYS.USER_VOTES, JSON.stringify(userVotes));

  localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(allVotes));

  // 도발 카드의 카운트도 업데이트
  updateProvocationVoteCount(provocationId);

  return true;
}

// 도발의 투표 카운트 업데이트
function updateProvocationVoteCount(provocationId: string): void {
  const provocations = getLocalProvocations();
  const votes = getLocalVotes(provocationId);

  const updated = provocations.map(p => {
    if (p.id === provocationId) {
      return {
        ...p,
        vote_up_count: votes.up,
        vote_down_count: votes.down,
      };
    }
    return p;
  });

  localStorage.setItem(STORAGE_KEYS.PROVOCATIONS, JSON.stringify(updated));
}

// 필터링 및 정렬
export function filterAndSortProvocations(
  provocations: Provocation[],
  filters: {
    status?: string;
    category?: string;
    sort?: 'latest' | 'popular' | 'votes';
  }
): Provocation[] {
  let filtered = [...provocations];

  // 상태 필터
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(p => p.status === filters.status);
  }

  // 카테고리 필터
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(p => p.category === filters.category);
  }

  // 정렬
  switch (filters.sort) {
    case 'votes':
      filtered.sort((a, b) => b.vote_up_count - a.vote_up_count);
      break;
    case 'popular':
      filtered.sort((a, b) => (b.vote_up_count - b.vote_down_count) - (a.vote_up_count - a.vote_down_count));
      break;
    case 'latest':
    default:
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
  }

  return filtered;
}
