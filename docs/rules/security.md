# Security 규칙

> 인증, 권한, 환경변수, 입력 검증 관련 코드를 수정할 때 반드시 따를 것.

## 1. 환경변수 분류

### 1.1 공개 (클라이언트 접근 가능)
```
NEXT_PUBLIC_SUPABASE_URL       # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase 공개 키 (RLS로 보호)
NEXT_PUBLIC_SITE_URL           # 사이트 URL (폴백: https://aipick.kr)
```

### 1.2 비공개 (서버 전용)
```
ADMIN_EMAILS    # 관리자 이메일 목록 (쉼표 구분)
CRON_SECRET     # Cron Job 인증 토큰
```

### 1.3 규칙
- **절대 하드코딩 금지** — URL, 키, 이메일은 모두 환경변수로
- `NEXT_PUBLIC_` 접두사가 없는 변수는 서버에서만 접근 가능
- `.env.local`은 `.gitignore`에 포함 (커밋 금지)
- 새 환경변수 추가 시 CLAUDE.md의 환경변수 섹션에도 기록

## 2. 인증 계층

### 2.1 비로그인 허용 (읽기 전용)
```typescript
const { data: { user } } = await supabase.auth.getUser();
// user가 null이어도 에러 반환 X → 비로그인 데이터 반환
return NextResponse.json({ data, isLoggedIn: !!user });
```

### 2.2 로그인 필수 (쓰기 작업)
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
}
```

### 2.3 관리자 전용
```typescript
import { isAdminEmail } from '@/lib/auth/adminCheck';

const { data: profile } = await supabase
  .from('profiles')
  .select('email')
  .eq('id', user.id)
  .single();

if (!isAdminEmail(profile?.email)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### 2.4 Cron Job 인증
```typescript
const authHeader = request.headers.get('authorization');
const cronSecret = process.env.CRON_SECRET;
if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## 3. 입력 검증 규칙

### 3.1 필수 파라미터 체크
```typescript
const toolId = request.nextUrl.searchParams.get('tool_id');
if (!toolId) {
  return NextResponse.json({ error: 'tool_id required' }, { status: 400 });
}
```

### 3.2 숫자 범위 제한
```typescript
const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
```

### 3.3 JSON Body 안전 파싱
```typescript
const body = await request.json().catch(() => ({}));
```

### 3.4 SQL Injection 방어 (PostgREST)
```typescript
// Supabase는 파라미터 바인딩으로 SQL injection 방어
// 하지만 ilike 패턴 검색 시 특수문자 이스케이핑 필요
const safeKeyword = keyword.replace(/[%_\\]/g, (c) => `\\${c}`);
query = query.or(`title.ilike.%${safeKeyword}%,content.ilike.%${safeKeyword}%`);
```

### 3.5 XSS 방어
- React JSX는 기본적으로 이스케이핑 처리
- **`dangerouslySetInnerHTML` 사용 금지** (불가피한 경우 sanitize 필수)
- 사용자 입력을 URL에 포함할 때 `encodeURIComponent()` 사용

## 4. Supabase RLS (Row Level Security)

- 모든 테이블에 RLS 정책 활성화 상태
- `anon` 키는 RLS 정책에 따라 접근 제한됨
- 서버 측에서도 `createClient()`는 anon 키 사용 → RLS 적용
- 관리자 작업이 필요하면 별도 service_role 키 사용 (현재 미사용)

## 5. 파일 업로드 보안
- 허용 MIME 타입 검증 필수
- 파일 크기 제한 설정
- Supabase Storage의 버킷 정책으로 접근 제어

## 6. 금지 사항
- 비밀번호, 토큰, API 키를 코드에 하드코딩
- `.env`, `credentials.json` 등 민감 파일 커밋
- `eval()`, `Function()` 사용
- 사용자 입력을 직접 HTML로 렌더링
- console.log로 민감 정보(user.email, token 등) 출력
