# Troubleshooting 규칙

> 에러 발생 시 이 문서를 먼저 확인할 것.
> 새로운 에러를 해결했다면 여기에 추가한다.
> 최종 수정일: 2026-02-26 (최초 작성)

---

## 1. 빌드 에러 (npm run build)

### 1.1 TypeScript 타입 에러

**증상:** `Type 'X' is not assignable to type 'Y'`

```
원인 1: props 인터페이스와 실제 전달값 불일치
원인 2: undefined 가능성 미처리 (?.  또는 ?? 누락)
원인 3: Supabase 쿼리 반환값 타입 미정의
```

**해결 순서:**
1. 에러가 발생한 파일/줄 확인
2. `types/` 폴더에서 관련 타입 정의 확인
3. `any` 사용 금지 — 정확한 타입을 찾거나 `unknown` + 타입 가드 사용

```typescript
// ❌ 금지
const data: any = result;

// ✅ 올바른 방법
const data = result as Tool;
// 또는
if (!result) return null;
```

---

### 1.2 `'use client'` 관련 에러

**증상:** `useState` / `useEffect` / 이벤트 핸들러를 Server Component에서 사용

```
Error: useState can only be used in Client Components.
Add the "use client" directive at the top of the file.
```

**해결:**
- 파일 최상단(import보다 위)에 `'use client';` 추가
- 또는 해당 로직을 별도 Client Component로 분리

---

### 1.3 동적 import / `window is not defined`

**증상:** SSR 환경에서 `window`, `document`, `navigator` 접근 시 빌드 실패

**해결:**
```typescript
// useEffect 안에서 접근
useEffect(() => {
  const width = window.innerWidth;
}, []);

// 또는 dynamic import
const Component = dynamic(() => import('./Component'), { ssr: false });
```

---

### 1.4 Tailwind CSS v4 클래스 미적용

**증상:** 클래스를 적었는데 화면에 반영 안 됨

```
원인 1: CSS 변수 참조 오류 (bg-[#4F46E5] 대신 bg-primary 사용해야 함)
원인 2: 임의값(arbitrary value)에 공백 포함 ([box-shadow:0_4px...] ← 언더스코어로 공백 표현)
원인 3: 동적 클래스명 조합 (문자열 연결로 만든 클래스는 purge됨)
```

**해결:**
```typescript
// ❌ 동적 조합 — purge됨
className={`bg-${color}-100`}

// ✅ 전체 클래스명을 코드에 명시
className={color === 'blue' ? 'bg-blue-100' : 'bg-red-100'}
```

---

## 2. Supabase 에러

### 2.1 RLS (Row Level Security) 차단

**증상:** 데이터 조회/삽입이 되지 않음, 빈 배열 반환, `permission denied`

**진단:**
```sql
-- Supabase 대시보드 > SQL Editor에서 실행
SELECT * FROM 테이블명;  -- service_role로 직접 조회해서 데이터 유무 확인
```

**해결 순서:**
1. Supabase 대시보드 > Authentication > Policies 확인
2. 해당 테이블에 RLS 정책이 있는지 확인
3. 클라이언트 사이드: anon key → RLS 정책 필요
4. 서버 사이드(API route): service role key → RLS 우회 가능

```typescript
// 서버 사이드에서 RLS 우회
import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // service role key
);
```

---

### 2.2 `Invalid API key` / `JWTExpired`

**증상:** API 호출 시 401 에러

**해결:**
1. `.env.local` 파일에 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 올바르게 설정됐는지 확인
2. Supabase 대시보드 > Settings > API에서 키 재확인
3. Vercel 환경변수와 로컬 `.env.local` 값이 동일한지 확인

---

### 2.3 `PGRST116` — 단건 조회 실패

**증상:** `.single()` 사용 시 에러

```
원인: 결과가 0건이거나 2건 이상일 때 .single()은 에러를 던짐
```

**해결:**
```typescript
// ❌ 위험
const { data } = await supabase.from('tools').select().eq('slug', slug).single();

// ✅ 안전
const { data, error } = await supabase.from('tools').select().eq('slug', slug).maybeSingle();
if (!data) return notFound();
```

---

### 2.4 실시간(Realtime) 구독이 작동하지 않음

**증상:** `supabase.channel()` 구독을 했는데 이벤트가 안 옴

**해결 순서:**
1. Supabase 대시보드 > Database > Replication에서 해당 테이블 활성화 확인
2. `useEffect` cleanup에서 `supabase.removeChannel(channel)` 호출 확인
3. `'use client'` 선언 여부 확인 (Realtime은 클라이언트 전용)

---

## 3. Next.js App Router 에러

### 3.1 `params` / `searchParams` 타입 에러 (Next.js 15)

**증상:**

```
Type '{ params: { slug: string } }' is not assignable to...
```

**Next.js 15에서는 params가 Promise:**
```typescript
// ✅ Next.js 15 방식
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
}
```

---

### 3.2 `notFound()` / `redirect()` 작동 안 함

**증상:** notFound를 호출했는데 404 페이지가 안 뜸

**해결:**
- `notFound()` / `redirect()`는 **Server Component 또는 Server Action**에서만 동작
- Client Component에서는 `useRouter().push()` 또는 조건부 렌더링 사용

---

### 3.3 API Route에서 CORS 에러

**증상:** 브라우저 콘솔에 `CORS policy` 에러

**해결:** `app/api/` route handler에 헤더 추가

```typescript
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL ?? '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

---

### 3.4 Middleware 무한 루프

**증상:** 페이지 로딩이 멈추거나 Too many redirects

**원인:** `middleware.ts`의 `matcher`가 `/api/`, `/_next/`, 정적 파일까지 포함

**해결:**
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
```

---

## 4. 레이아웃 / UI 에러

### 4.1 페이지별 필터 버튼 위치 불일치

**증상:** 특정 페이지의 필터/버튼 위치가 다른 페이지보다 위/아래에 있음

**원인 체크리스트:**
- [ ] 페이지 컨테이너가 `mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8`인가?
- [ ] `min-h-screen` 같은 전체 너비 컨테이너를 사용하지 않는가?
- [ ] sticky 필터바가 추가 `pt-*`를 갖고 있지 않는가?
- [ ] 헤더 div가 `mb-4` (또는 `mb-8`)로 통일되어 있는가?

**표준 패턴:** [DESIGN-SYSTEM.md 3.2절](../DESIGN-SYSTEM.md) 참조

---

### 4.2 스크롤 위치 이슈

**증상:** 특정 요소 클릭 후 화면이 예상치 못한 위치에서 시작

**해결 패턴:**
```typescript
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isActive && ref.current) {
    const HEADER_OFFSET = 64; // 헤더 높이
    const top = ref.current.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'instant' }); // 'smooth' 사용 금지 (깜빡임)
  }
}, [isActive]);
```

---

### 4.3 모바일에서 레이아웃 깨짐

**증상:** PC에서는 정상인데 모바일에서 카드/버튼이 잘림

**체크리스트:**
- [ ] flex 컨테이너 안 요소에 `shrink-0` 적용 여부
- [ ] `overflow-x-auto` 대신 `flex-wrap` 사용 여부 (탭 컨테이너)
- [ ] 고정 너비(`w-[200px]`) 대신 `max-w-*` 사용 여부
- [ ] 텍스트에 `truncate` 또는 `break-words` 적용 여부

---

## 5. 인증 에러

### 5.1 로그인 후 리디렉션 안 됨

**증상:** OAuth 로그인 후 원래 페이지로 안 돌아옴

**해결:**
```typescript
// 로그인 시작 전 returnTo 저장
const returnTo = window.location.pathname;
sessionStorage.setItem('returnTo', returnTo);

// 로그인 완료 후 (auth callback)
const returnTo = sessionStorage.getItem('returnTo') ?? '/';
sessionStorage.removeItem('returnTo');
router.push(returnTo);
```

---

### 5.2 관리자 페이지 접근 불가

**증상:** ADMIN_EMAILS에 이메일을 추가했는데 관리자 페이지 접근이 안 됨

**해결 순서:**
1. Vercel 환경변수 `ADMIN_EMAILS` 업데이트 후 **재배포** 필요
2. 로컬에서는 `.env.local`에 추가 후 dev 서버 재시작
3. 쉼표 구분 형식 확인: `admin1@example.com,admin2@example.com`

---

## 6. 성능 이슈

### 6.1 페이지 로딩이 느림

**진단 순서:**
1. Network 탭에서 느린 API 응답 확인
2. Supabase 쿼리에 불필요한 `select('*')` 제거 → 필요한 컬럼만 선택
3. `N+1 쿼리` 여부 확인 — 루프 안에서 쿼리 호출 금지

```typescript
// ❌ N+1
for (const tool of tools) {
  const reviews = await supabase.from('reviews').select().eq('tool_id', tool.id);
}

// ✅ 한 번에 join
const { data } = await supabase
  .from('tools')
  .select('*, reviews(*)');
```

---

### 6.2 불필요한 리렌더링

**진단:** React DevTools Profiler로 렌더링 횟수 확인

**흔한 원인:**
```typescript
// ❌ 매 렌더링마다 새 객체 생성
<Component options={{ key: 'value' }} />

// ✅ useMemo 또는 상수로 분리
const options = useMemo(() => ({ key: 'value' }), []);
<Component options={options} />
```

---

## 7. 배포 (Vercel) 에러

### 7.1 로컬에서는 되는데 Vercel에서 안 됨

**체크리스트:**
- [ ] Vercel 환경변수에 필요한 값이 모두 설정됐는가?
- [ ] `NEXT_PUBLIC_` 접두사 여부 확인 (없으면 클라이언트에서 접근 불가)
- [ ] `npm run build`가 로컬에서 에러 없이 통과하는가?
- [ ] Edge Runtime과 호환되지 않는 Node.js API 사용 여부 (`fs`, `path` 등)

---

### 7.2 빌드는 성공했는데 특정 페이지가 500 에러

**원인:** 빌드 시점엔 괜찮았지만 런타임에 환경변수나 DB 연결 실패

**해결:**
1. Vercel 대시보드 > Functions 탭에서 에러 로그 확인
2. 환경변수 누락 여부 확인
3. Supabase 프로젝트가 paused 상태인지 확인 (무료 플랜 비활성화)

---

## 8. 이 문서에 추가하는 방법

에러를 해결했다면 아래 형식으로 추가:

```markdown
### X.X 에러 제목

**증상:** 어떤 에러 메시지 또는 현상

**원인:** 왜 발생하는가

**해결:**
\`\`\`typescript
// 해결 코드
\`\`\`
```
