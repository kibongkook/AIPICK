import { NextResponse } from 'next/server';
// Supabase 연동 시 OAuth 콜백 처리
// 현재는 데모 모드이므로 홈으로 리다이렉트
export async function GET(request: Request) {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL('/', url.origin));
}
