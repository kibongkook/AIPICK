import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  verifyCronAuth,
  markSourceRunning,
  markSourceComplete,
  upsertExternalScore,
  delay,
  type FetcherResult,
} from '@/lib/pipeline/fetcher-base';
import { findToolByModelName, loadToolIdentifiers } from '@/lib/pipeline/model-matcher';

const SOURCE_KEY = 'lmsys_arena';

/**
 * LMSYS Chatbot Arena 리더보드 데이터 URL
 * HuggingFace Spaces에서 JSON 형태로 제공
 */
const ARENA_LEADERBOARD_URL =
  'https://huggingface.co/api/spaces/lmarena-ai/lmarena-leaderboard/output';
const ARENA_FALLBACK_URL =
  'https://raw.githubusercontent.com/lm-sys/FastChat/main/fastchat/serve/leaderboard_data.json';

/**
 * POST /api/cron/arena-elo - LMSYS Chatbot Arena Elo 레이팅 수집
 *
 * Chatbot Arena의 블라인드 사용자 투표 기반 Elo 레이팅을 수집하여
 * 해당 도구의 tool_external_scores에 정규화된 점수로 저장합니다.
 *
 * Elo 레이팅은 600만+ 사용자 투표 기반으로 가장 신뢰도 높은
 * LLM 품질 지표입니다.
 */
export async function POST(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase not configured, skipping' });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  await markSourceRunning(supabase, SOURCE_KEY);

  const result: FetcherResult = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // 1. Arena 리더보드 데이터 가져오기
    const leaderboardData = await fetchArenaLeaderboard();

    if (!leaderboardData || leaderboardData.length === 0) {
      result.errors.push('Failed to fetch Arena leaderboard data');
      await markSourceComplete(supabase, SOURCE_KEY, result);
      return NextResponse.json({ success: false, ...result });
    }

    result.total = leaderboardData.length;

    // 2. DB 도구 식별 정보 캐싱
    const cachedTools = await loadToolIdentifiers(supabase);

    // 3. Elo 레이팅 범위 파악 (정규화용)
    const eloRatings = leaderboardData
      .map((m) => m.elo)
      .filter((e): e is number => e !== null && e > 0);
    const maxElo = Math.max(...eloRatings, 1300);
    const minElo = Math.min(...eloRatings, 800);

    // 4. 각 모델을 DB 도구와 매칭
    for (const model of leaderboardData) {
      if (!model.name || !model.elo) {
        result.skipped++;
        continue;
      }

      try {
        const matchedTool = await findToolByModelName(
          supabase,
          model.name,
          cachedTools
        );

        if (!matchedTool) {
          result.skipped++;
          continue;
        }

        // Elo를 0-100으로 정규화
        // 일반적 Elo 범위: 800~1400 → 0~100
        const normalizedScore = normalizeElo(model.elo, minElo, maxElo);

        // tool_external_scores에 저장
        await upsertExternalScore(supabase, matchedTool.id, SOURCE_KEY, normalizedScore, {
          model_name: model.name,
          elo_rating: model.elo,
          elo_rank: model.rank,
          votes: model.votes,
          organization: model.organization,
        });

        // tool_benchmark_scores의 elo_rating, elo_rank도 업데이트
        await supabase
          .from('tool_benchmark_scores')
          .upsert(
            {
              tool_id: matchedTool.id,
              benchmark_source: 'lmsys_arena',
              elo_rating: model.elo,
              elo_rank: model.rank,
              extra_scores: {
                votes: model.votes,
                organization: model.organization,
                ci_lower: model.ci_lower,
                ci_upper: model.ci_upper,
              },
              fetched_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'tool_id,benchmark_source' }
          );

        result.updated++;
      } catch (err) {
        result.errors.push(
          `${model.name}: ${err instanceof Error ? err.message : String(err)}`
        );
      }

      await delay(100);
    }
  } catch (err) {
    result.errors.push(`Fatal: ${err instanceof Error ? err.message : String(err)}`);
  }

  await markSourceComplete(supabase, SOURCE_KEY, result);

  return NextResponse.json({
    success: result.errors.length === 0,
    ...result,
  });
}

// ==========================================
// Arena 데이터 타입 및 페칭
// ==========================================

interface ArenaModelData {
  name: string;
  elo: number;
  rank: number;
  votes: number;
  organization: string | null;
  ci_lower: number | null;
  ci_upper: number | null;
}

/**
 * LMSYS Arena 리더보드 데이터를 가져옵니다.
 * 여러 소스를 시도합니다.
 */
async function fetchArenaLeaderboard(): Promise<ArenaModelData[]> {
  // 방법 1: HuggingFace Spaces API
  try {
    const data = await fetchFromHuggingFaceSpaces();
    if (data.length > 0) return data;
  } catch {
    // fallback으로 계속
  }

  // 방법 2: GitHub raw 데이터
  try {
    const data = await fetchFromGitHub();
    if (data.length > 0) return data;
  } catch {
    // 실패
  }

  return [];
}

async function fetchFromHuggingFaceSpaces(): Promise<ArenaModelData[]> {
  const response = await fetch(ARENA_LEADERBOARD_URL, {
    headers: { 'User-Agent': 'AIPICK-Bot' },
  });

  if (!response.ok) return [];

  const json = await response.json();

  // HF Spaces 응답 구조에 따라 파싱 (구조가 다를 수 있음)
  return parseArenaData(json);
}

async function fetchFromGitHub(): Promise<ArenaModelData[]> {
  const response = await fetch(ARENA_FALLBACK_URL, {
    headers: { 'User-Agent': 'AIPICK-Bot' },
  });

  if (!response.ok) return [];

  const json = await response.json();
  return parseArenaData(json);
}

/**
 * Arena 리더보드의 다양한 JSON 형식을 통일된 형태로 파싱합니다.
 */
function parseArenaData(data: unknown): ArenaModelData[] {
  const results: ArenaModelData[] = [];

  // 형식 1: { leaderboard: [...] }
  if (data && typeof data === 'object' && 'leaderboard' in data) {
    const lb = (data as Record<string, unknown>).leaderboard;
    if (Array.isArray(lb)) {
      return lb.map((entry, idx) => parseArenaEntry(entry, idx));
    }
  }

  // 형식 2: 직접 배열
  if (Array.isArray(data)) {
    return data.map((entry, idx) => parseArenaEntry(entry, idx));
  }

  // 형식 3: { data: { leaderboard_table: [...] } }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const tableData = obj.data || obj.output || obj.result;
    if (tableData && typeof tableData === 'object') {
      const inner = tableData as Record<string, unknown>;
      const table = inner.leaderboard_table || inner.data || inner.rows;
      if (Array.isArray(table)) {
        return table.map((entry, idx) => parseArenaEntry(entry, idx));
      }
    }
  }

  return results;
}

function parseArenaEntry(entry: unknown, index: number): ArenaModelData {
  const e = entry as Record<string, unknown>;
  return {
    name: String(e.model || e.Model || e.name || e.model_name || ''),
    elo: Number(e.elo || e.rating || e.score || e.Arena_Elo || 0),
    rank: Number(e.rank || e.Rank || index + 1),
    votes: Number(e.num_battles || e.votes || e.num_votes || 0),
    organization: (e.organization || e.org || null) as string | null,
    ci_lower: e.ci_lower != null ? Number(e.ci_lower) : null,
    ci_upper: e.ci_upper != null ? Number(e.ci_upper) : null,
  };
}

/**
 * Elo 레이팅을 0-100 스케일로 정규화합니다.
 */
function normalizeElo(elo: number, minElo: number, maxElo: number): number {
  if (maxElo === minElo) return 50;
  const normalized = ((elo - minElo) / (maxElo - minElo)) * 100;
  return Math.round(Math.max(0, Math.min(100, normalized)) * 100) / 100;
}
