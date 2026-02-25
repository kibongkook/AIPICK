import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

interface ToolUpdateFetchItem {
  title: string;
  tool_id: string;
  update_type?: string;
  description?: string;
  source_url?: string;
  image_url?: string;
  version?: string;
  impact?: string;
  announced_at?: string;
}

/**
 * POST /api/cron/tool-updates-fetch - AI 서비스 업데이트 수집
 *
 * 입력 방식:
 * 1. body.updates 배열로 직접 전달 (어드민/스크립트용)
 * 2. 향후 RSS/API 자동 수집 확장 가능
 *
 * Vercel Cron 또는 외부 스케줄러에서 호출
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase not configured, skipping' });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const body = await request.json().catch(() => ({}));
  const updates: ToolUpdateFetchItem[] = body.updates || [];

  if (updates.length === 0) {
    return NextResponse.json({ success: true, inserted: 0, message: 'No updates provided' });
  }

  // 중복 체크: source_url 기준
  const urls = updates.map(u => u.source_url).filter(Boolean) as string[];
  let existingUrls = new Set<string>();
  if (urls.length > 0) {
    const { data: existing } = await supabase
      .from('tool_updates')
      .select('source_url')
      .in('source_url', urls);
    existingUrls = new Set((existing || []).map(e => e.source_url));
  }

  const toInsert = updates
    .filter(u => !u.source_url || !existingUrls.has(u.source_url))
    .map(u => ({
      title: u.title,
      tool_id: u.tool_id,
      update_type: u.update_type || 'other',
      description: u.description || null,
      source_url: u.source_url || null,
      image_url: u.image_url || null,
      version: u.version || null,
      impact: u.impact || 'minor',
      announced_at: u.announced_at || new Date().toISOString(),
    }));

  if (toInsert.length === 0) {
    return NextResponse.json({ success: true, inserted: 0, message: 'All updates already exist' });
  }

  const { error } = await supabase.from('tool_updates').insert(toInsert);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, inserted: toInsert.length });
}
