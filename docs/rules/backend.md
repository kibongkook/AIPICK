# Backend 규칙 (API Routes)

> `app/api/` 폴더의 파일을 수정하거나 새로 만들 때 반드시 따를 것.

## 1. API Route 기본 구조

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/** GET /api/example?param=xxx — 간단 설명 */
export async function GET(request: NextRequest) {
  // 1) Supabase 설정 체크
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ data: null }, { status: 200 });
  }

  // 2) 인증 확인 (필요시)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3) 파라미터 추출 + 검증
  const param = request.nextUrl.searchParams.get('param');
  if (!param) {
    return NextResponse.json({ error: 'param required' }, { status: 400 });
  }

  // 4) 쿼리 실행 + 에러 처리
  const { data, error } = await supabase.from('table').select('*').eq('id', param);
  if (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  // 5) 응답 반환
  return NextResponse.json({ data });
}
```

## 2. 필수 규칙

### 2.1 Supabase 설정 체크
- 모든 API route의 첫 줄에서 `isSupabaseConfigured()` 확인
- 미설정 시 에러가 아닌 **빈 데이터로 200 반환** (GET) 또는 **503 반환** (POST/PUT/DELETE)

### 2.2 인증 패턴
```typescript
// 읽기 전용 (인증 선택)
const { data: { user } } = await supabase.auth.getUser();
// user가 null이면 비로그인 데이터 반환

// 쓰기 작업 (인증 필수)
if (!user) {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
}

// 관리자 전용
import { isAdminEmail } from '@/lib/auth/adminCheck';
if (!isAdminEmail(profile?.email)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### 2.3 입력 검증
- 모든 쿼리 파라미터와 body 값은 **사용 전 반드시 검증**
- `request.json()`은 `.catch(() => ({}))` 로 파싱 에러 방어
- 숫자 범위 제한: `Math.min(parseInt(value || '20'), 100)`
- PostgREST 특수문자 이스케이핑: `keyword.replace(/[%_\\]/g, (c) => \`\\${c}\`)`

### 2.4 에러 처리
- 모든 Supabase 쿼리 후 `error` 체크 필수
- `console.error('설명:', error)` 로그 후 적절한 HTTP 상태코드 반환
- HTTP 상태코드 규칙:
  - `200` — 성공
  - `400` — 잘못된 입력
  - `401` — 미인증
  - `403` — 권한 없음
  - `500` — 서버 에러
  - `503` — DB 미설정

### 2.5 Upsert 패턴
```typescript
const { error } = await supabase
  .from('table')
  .upsert(
    { ...data, updated_at: new Date().toISOString() },
    { onConflict: 'col1,col2' }
  );
```

### 2.6 병렬 쿼리
- 독립적인 쿼리는 `Promise.all()` 로 병렬 실행
```typescript
const [{ data: likes }, { data: bookmarks }] = await Promise.all([
  supabase.from('likes').select('post_id').eq('user_id', user.id),
  supabase.from('bookmarks').select('post_id').eq('user_id', user.id),
]);
```

## 3. Cron Job 규칙
- 인증: `authorization` 헤더에서 `Bearer ${CRON_SECRET}` 확인
- 환경변수 `CRON_SECRET` 필수
- POST 메서드만 사용

## 4. 쿼리 함수 중앙화
- 재사용되는 DB 쿼리는 `lib/supabase/queries.ts` 에 함수로 분리
- seed.json 폴백 로직 포함 (Supabase 미설정 시 로컬 데이터 사용)

## 5. 상수 규칙
- API route 내 매직 넘버 금지
- 파일 상단 또는 `lib/constants.ts` 에 상수로 정의
```typescript
const MIN_RATING = 0.5;
const MAX_RATING = 5.0;
const RATING_STEP = 0.5;
```
