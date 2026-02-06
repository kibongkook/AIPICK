/** Supabase 환경변수 설정 여부 확인 (클라이언트/서버 양쪽 사용 가능) */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-supabase-url'
  );
}
