# AIPICK 전체 코드 리뷰 & 최적화 보고서

> **작성일**: 2026-02-20
> **프레임워크**: Next.js 15 (App Router) + React 19 + TypeScript 5
> **DB**: Supabase (PostgreSQL) — 현재 seed.json 폴백 모드
> **배포**: Vercel

---

## 목차

1. [프로젝트 현황 요약](#1-프로젝트-현황-요약)
2. [아키텍처 분석](#2-아키텍처-분석)
3. [보안 이슈 (Critical/High)](#3-보안-이슈)
4. [성능 최적화 포인트](#4-성능-최적화-포인트)
5. [코드 품질 이슈](#5-코드-품질-이슈)
6. [파일 정리 대상](#6-파일-정리-대상)
7. [개선 로드맵](#7-개선-로드맵)

---

## 1. 프로젝트 현황 요약

### 규모

| 항목 | 수치 |
|------|------|
| 총 페이지 (app/) | 25개 페이지 + 56개 API 라우트 |
| 컴포넌트 (components/) | 98개 파일, ~10,071 LOC |
| 라이브러리 (lib/) | 24개 파일, queries.ts 1,527 LOC |
| 타입 정의 (types/) | 1개 파일, 792 LOC |
| 커스텀 훅 (hooks/) | 4개 |
| 시드 데이터 (data/seed.json) | 216개 AI 도구, 1.3MB |
| AI 레시피 (data/recipes.ts) | 109KB |
| DB 마이그레이션 | 16개 SQL 파일 |
| 스크립트 (scripts/) | 46개 파일 |

### 기술 스택 상태

| 기술 | 상태 | 비고 |
|------|------|------|
| Next.js 15.1.6 | ✅ 최신 | App Router 사용 |
| React 19.2.3 | ✅ 최신 | |
| TypeScript 5 | ✅ strict 모드 | |
| Tailwind CSS v4 | ✅ PostCSS 방식 | |
| Supabase | ⚠️ 미연결 | .env.local 플레이스홀더 상태 |
| Zustand | ❌ 미설치 | CLAUDE.md에 명시되었으나 package.json에 없음 |
| PWA (next-pwa) | ❌ 미설치 | manifest.json만 존재 |
| lucide-react 0.563.0 | ✅ | |

### 서버/클라이언트 컴포넌트 비율

- **Server Components**: 42개 (76%) — 데이터 페칭 최적화
- **Client Components**: 14개 페이지 + 64개 컴포넌트
- **Static Generation (generateStaticParams)**: tools, category, jobs, education, recipes, compare

---

## 2. 아키텍처 분석

### 데이터 흐름

```
[Supabase DB] ←→ [lib/supabase/queries.ts] ←→ [Server Components / API Routes]
       ↓ (미연결 시 폴백)                              ↓
[data/seed.json] ─────────────────────────────→ [UI 렌더링]
```

**현재 상태**: Supabase 미연결 → `isSupabaseConfigured()` → `false` → seed.json 직접 사용

### 페이지별 렌더링 전략

| 페이지 | 타입 | Static Gen | ISR | 이슈 |
|--------|------|------------|-----|------|
| / (홈) | Server | ✅ | - | getTools() 전체 호출 후 .length만 사용 |
| /rankings | Server | ❌ | ❌ | **ISR 필요** (revalidate: 1800) |
| /news | Server | ❌ | ❌ | **ISR 필요** (revalidate: 1800) |
| /tools/[slug] | Server | ✅ | - | 파일 ~250줄, 분리 필요 |
| /category/[slug] | Server | ✅ | - | 정상 |
| /jobs, /jobs/[slug] | Server | ✅ | - | Promise.all 병렬 페칭 ✅ |
| /education/[level] | Server | ✅ | - | 정상 |
| /community | **Client** | ❌ | - | 전체 클라이언트, localStorage 폴백 |
| /bookmarks | **Client** | ❌ | - | Server Component 전환 가능 |
| /profile | **Client** | ❌ | - | localStorage 레거시 혼재 |
| /recipes | Server | ✅ | - | 로컬 데이터 소스 |
| /search | Server | ❌ | - | 동적 검색 — 정상 |
| /compare/[...slugs] | Server | ✅ | - | 인기 조합만 Static Gen |

### API 라우트 분류 (56개)

| 카테고리 | 라우트 수 | 주요 기능 |
|----------|-----------|-----------|
| Community | 7 | CRUD, 태그 추출, 북마크, 업보트 |
| Data CRUD | 5 | tools, categories, news, guides |
| User Features | 4 | bookmarks, upvotes, collections, comments |
| Admin | 3 | tools, news 관리 |
| Cron Jobs | 22 | 랭킹, 가격, 벤치마크, 뉴스 수집 등 |
| Recommendations | 2 | recommend, suggestions |
| Search & Notifications | 2 | search, notifications |
| Auth | 1 | OAuth callback |

---

## 3. 보안 이슈

### 🔴 CRITICAL: XSS 취약점 — Markdown 렌더링

**파일**: `app/guides/[slug]/page.tsx` (L80-82), `app/guides/new/page.tsx` (L152)

```typescript
// ❌ 위험: HTML 이스케이핑 없이 사용자 입력을 직접 삽입
function applyInline(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g,
    '<strong class="font-semibold text-foreground">$1</strong>');
}
// dangerouslySetInnerHTML로 렌더링됨
```

**공격 벡터**: `**<img src=x onerror=alert('XSS')>**` 입력 시 스크립트 실행 가능

**해결**: HTML 이스케이핑 함수 적용 또는 `marked` + `DOMPurify` 라이브러리 사용

---

### 🔴 HIGH: 관리자 인증 우회

**파일**: `lib/auth/adminCheck.ts` (L11-13)

```typescript
export function isAdminEmail(email: string | undefined | null): boolean {
  const admins = getAdminEmails();
  if (admins.length === 0) return true; // ⚠️ 모든 사용자가 관리자!
  return admins.includes(email.toLowerCase());
}
```

**문제**: `ADMIN_EMAILS` 환경변수 미설정 시 **모든 인증된 사용자가 관리자 권한 획득**

**영향**: `/api/admin/tools`, `/api/admin/news` 무단 접근 가능

**해결**:
```typescript
if (admins.length === 0) return false; // 명시적 설정 필수
```

---

### 🟡 HIGH: CRON 라우트 인증 부재

**파일**: `app/api/cron/news-fetch/route.ts` (L14-18)

```typescript
const cronSecret = process.env.CRON_SECRET;
if (cronSecret && authHeader !== `Bearer ${cronSecret}`) { // ← undefined이면 통과
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**문제**: `CRON_SECRET` 미설정 시 22개 CRON 라우트 전부 공개 접근 가능

**해결**:
```typescript
if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

### 🟡 MEDIUM: Community 검색 SQL 인젝션 위험

**파일**: `app/api/community/v2/route.ts` (L126)

```typescript
query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
// ← keyword가 직접 삽입됨
```

**해결**: `keyword`에서 특수문자 (`%`, `_`, `\`) 이스케이핑 필요

---

### 🟡 MEDIUM: CORS / Rate Limiting 미적용

- API 라우트에 CORS 헤더 없음
- Rate limiting 미적용 — 무한 요청 가능
- Request size 제한 없음

---

## 4. 성능 최적화 포인트

### 4.1 이미지 최적화 (30+ 파일)

**문제**: 코드베이스 전체에서 `<img>` 태그 30개 이상 발견

**주요 파일**:
- `components/ui/LogoImage.tsx` — raw `<img>` 사용
- `components/auth/AuthButton.tsx`
- `components/home/EditorPickRotation.tsx`
- `components/home/FeaturedShowcase.tsx`
- `components/home/TopRotationBanner.tsx`
- `components/compare/CompareSelector.tsx`

**해결**: Next.js `<Image>` 컴포넌트로 교체 → 자동 WebP 변환, lazy loading, 반응형 크기 지원

---

### 4.2 React 메모이제이션 부재

**문제**: `React.memo`, `useMemo`, `useCallback` 최적화 거의 없음

**영향받는 컴포넌트**:
- `ServiceCard` — 부모 리렌더링 시 전체 Tool 객체 받아 재렌더링
- `CommunityPostCardV2` — 목록 스크롤 시 불필요한 렌더링
- `RecipeCard` — 필터 변경 시 전체 재렌더링
- `CommentList` — 가상화 없이 전체 댓글 렌더링

---

### 4.3 홈페이지 불필요한 전체 데이터 로드

**파일**: `app/page.tsx` (L24)

```typescript
const allTools = await getTools(); // 216개 전체 로드
// 실제 사용: allTools.length 만 참조
```

**해결**: 카운트만 반환하는 별도 쿼리 함수 작성 (`getToolCount()`)

---

### 4.4 ISR 미적용 페이지

| 페이지 | 현재 | 권장 |
|--------|------|------|
| /rankings | Dynamic (매 요청 렌더링) | ISR `revalidate: 1800` |
| /news | Dynamic (매 요청 렌더링) | ISR `revalidate: 1800` |

---

### 4.5 Community API N+1 쿼리 패턴

**파일**: `app/api/community/v2/route.ts` (L269-322)

```typescript
// 태그 5개인 글 작성 시 → 최대 15개 순차 DB 쿼리
for (const tag of enrichedTags) {
  const { data: existingTag } = await supabase.from('community_tags')...
  if (!existingTag) {
    await supabase.from('community_tags').insert(...)
  }
  await supabase.from('community_post_tags').insert(...)
}
```

**해결**: `Promise.all()` 병렬 처리 또는 벌크 insert 사용

---

### 4.6 Notification 폴링 비효율

**파일**: `hooks/useNotifications.ts`

- 30초마다 폴링하지만 탭 비활성 시에도 계속 요청
- 에러 시 백오프 없이 동일 간격 재시도

**해결**: `document.visibilitychange` 이벤트로 비활성 탭 폴링 중지 + 지수 백오프

---

### 4.7 DynamicIcon 번들 크기

**파일**: `components/ui/DynamicIcon.tsx`

- lucide-react에서 **57개 아이콘** 모듈 레벨 임포트
- 사용 여부 무관하게 전부 번들에 포함

**영향**: ~50KB 추가 번들 크기 (추정)

---

## 5. 코드 품질 이슈

### 5.1 대형 파일 분리 필요

| 파일 | LOC | 권장 |
|------|-----|------|
| `lib/supabase/queries.ts` | 1,527 | 도메인별 분리: queries/tools.ts, queries/community.ts, queries/auth.ts |
| `types/index.ts` | 792 | 모듈별 분리: types/tool.ts, types/community.ts, types/recommendation.ts |
| `lib/constants.ts` | 733 | 분리: constants/categories.ts, constants/ui.ts, constants/scoring.ts |
| `components/recommend/Wizard.tsx` | 423 | 스텝별 컴포넌트 추출 |
| `components/home/RecipeCarousel.tsx` | 402 | 드래그 로직 → 커스텀 훅 |
| `components/home/TopRotationBanner.tsx` | 390 | 로테이션 로직 → 커스텀 훅 |

### 5.2 타입 안전성 이슈

| 위치 | 문제 | 심각도 |
|------|------|--------|
| `components/user/UserRepCard.tsx` (L80-82) | 불필요한 `(profile as any)` — 타입에 이미 필드 존재 | Low |
| `components/community/v2/CommunityFilterBar.tsx` (L96) | `e.target.value as any` — 타입 유니온 사용 가능 | Low |
| `lib/supabase/queries.ts` (L233) | `.map((item: any) => ...)` — 인터페이스 정의 필요 | Medium |
| `lib/supabase/queries.ts` 전반 | `as unknown as T` 타입 캐스팅 다수 — 런타임 안전성 부족 | Medium |

### 5.3 중복 컴포넌트

| 컴포넌트 A | 컴포넌트 B | 중복율 |
|-----------|-----------|--------|
| `components/home/RecipeCommunitySection.tsx` (217 LOC) | `components/recipe/RecipeCommunitySection.tsx` (327 LOC) | ~60% |
| `hooks/useBookmark.ts` | `hooks/useUpvote.ts` | ~70% |

**해결**: 공통 로직 추출 → 제네릭 훅 `useBooleanToggle()` 작성

### 5.4 localStorage 사용 패턴

- **57개 인스턴스**에서 `localStorage` 직접 접근
- JSON.parse에 에러 핸들링 없음 — 손상된 데이터 시 앱 크래시
- 접두사 불일치: `"aipick_"`, `"COMMUNITY_"`, 기타 혼용

**해결**: `lib/storage.ts` 유틸리티 생성 → 안전한 get/set 함수 + 일관된 접두사

### 5.5 TODO 주석

`lib/supabase/queries.ts`에 **8개 TODO** 남아있음:
- 멀티 카테고리 지원 미완성 (L214, 217, 220)
- Supabase 쿼리 최적화 필요 (L226, 233, 246)

### 5.6 에러 처리 부족

- API 라우트에서 에러를 console.log만 하고 사일런트 실패
- 라우트별 `error.tsx` 없음 — `app/error.tsx` 하나만 존재
- `Suspense` 경계 부족 (전체 29개만)

---

## 6. 파일 정리 대상

### 6.1 삭제 가능 — 일회성 배치 스크립트 (11개, ~800KB)

```
scripts/update_tools_batch1.py
scripts/update_tools_batch2.py
scripts/update_tools_batch3.py
scripts/update_tools_batch4a.py
scripts/update_tools_batch4b.py
scripts/update_tools_batch5a.py
scripts/update_tools_batch6.py
scripts/update_tools_batch7a.py
scripts/update_tools_remaining1.py
scripts/update_tools_remaining2.py
scripts/update_tools_remaining3.py
```

**상태**: seed.json 업데이트 완료(216/216) — 더 이상 실행할 필요 없음

### 6.2 삭제 가능 — 백업 데이터 파일 (~2.4MB)

```
data/seed.backup.json          (443KB, Feb 12)
data/seed-backup-119.json      (453KB, Feb 19)
data/seed-merged.json          (572KB, Feb 19)
data/seed-fixed-showcases.json (408KB, Feb 10)
data/seed-google-favicons-backup.json (414KB, Feb 11)
data/seed-logos-fixed.json     (408KB, Feb 10)
data/recipes.backup.bak        (78KB, Feb 19)
```

### 6.3 아카이브 후보 — 일회성 유틸리티 스크립트

```
scripts/collect-500-ai-services.mjs
scripts/generate-sample-outputs.mjs
scripts/generate-showcase-seed.mjs
scripts/enrich-seed-data.js
scripts/fix-seed-data.mjs
scripts/fix-seed-slugs.mjs
scripts/fix-category-ids.mjs
scripts/analyze-db-coverage.js
scripts/audit-showcase-data.js
scripts/verify-*.js
data/transform_seed.js
data/logo-audit-report.json
data/showcase-audit-report.json
data/ai-tools-500.json (207KB)
```

### 6.4 이미지 최적화

- `public/AIPICK LOGO.jpg` (97KB) → WebP 변환 또는 압축 필요

---

## 7. 개선 로드맵

### Phase A — 즉시 수정 (보안, Critical)

| # | 작업 | 파일 | 예상 영향 |
|---|------|------|----------|
| A1 | XSS 취약점 수정 — HTML 이스케이핑 적용 | `app/guides/[slug]/page.tsx`, `app/guides/new/page.tsx` | 보안 취약점 해소 |
| A2 | Admin 인증 기본값 수정 (false) | `lib/auth/adminCheck.ts` | 무단 관리자 접근 차단 |
| A3 | CRON 라우트 인증 필수화 | `app/api/cron/*/route.ts` (22개) | 공개 API 악용 방지 |
| A4 | Community 검색 입력값 이스케이핑 | `app/api/community/v2/route.ts` | SQL 인젝션 방지 |

### Phase B — 성능 최적화 (High)

| # | 작업 | 파일 | 예상 효과 |
|---|------|------|----------|
| B1 | 랭킹/뉴스 페이지 ISR 적용 | `app/rankings/page.tsx`, `app/news/page.tsx` | TTFB 대폭 감소 |
| B2 | 홈 페이지 getToolCount() 도입 | `app/page.tsx`, `lib/supabase/queries.ts` | 불필요한 데이터 로드 제거 |
| B3 | Next.js Image 컴포넌트 전환 | `components/ui/LogoImage.tsx` 외 30+개 | 이미지 최적화 |
| B4 | Community API N+1 쿼리 해결 | `app/api/community/v2/route.ts` | DB 쿼리 60% 감소 |
| B5 | 알림 폴링 최적화 (visibility API) | `hooks/useNotifications.ts` | 불필요한 API 호출 제거 |

### Phase C — 코드 품질 (Medium)

| # | 작업 | 비고 |
|---|------|------|
| C1 | queries.ts 도메인별 분리 (1,527줄) | tools, community, auth, recommendations |
| C2 | types/index.ts 모듈 분리 (792줄) | tool, community, recommendation |
| C3 | constants.ts 분리 (733줄) | categories, ui, scoring |
| C4 | React.memo 적용 | ServiceCard, CommunityPostCardV2, RecipeCard 등 |
| C5 | localStorage 유틸리티 통합 | lib/storage.ts 신규 생성 |
| C6 | 중복 컴포넌트/훅 병합 | RecipeCommunitySection, useBookmark/useUpvote |

### Phase D — 정리 (Low)

| # | 작업 | 절감 |
|---|------|------|
| D1 | 배치 업데이트 스크립트 삭제 (11개) | ~800KB |
| D2 | 백업 데이터 파일 삭제 (7개) | ~2.4MB |
| D3 | 일회성 유틸리티 스크립트 아카이브 | ~15개 파일 |
| D4 | 불필요한 `as any` 타입 캐스팅 제거 | 6개소 |
| D5 | TODO 주석 해결 | queries.ts 8개 |
| D6 | 접근성 개선 (aria-label 추가) | 10+개 컴포넌트 |

### Phase E — 미설치 의존성 (Backlog)

| # | 패키지 | 용도 | Phase |
|---|--------|------|-------|
| E1 | Zustand | 전역 상태 관리 | Phase 5+ |
| E2 | next-pwa | PWA 지원 | Phase 6 |
| E3 | marked + DOMPurify | 안전한 Markdown 렌더링 | Phase A (XSS 수정과 함께) |

---

## 부록: 프로젝트 구조 맵

```
AIPICK/
├── app/                          # 25 pages + 56 API routes
│   ├── (main)/                   # 메인 레이아웃 그룹
│   ├── tools/[slug]/             # AI 서비스 상세 (Static Gen ✅)
│   ├── category/[slug]/          # 카테고리 (Static Gen ✅)
│   ├── rankings/                 # 랭킹 (ISR 필요 ⚠️)
│   ├── news/                     # AI 뉴스 (ISR 필요 ⚠️)
│   ├── jobs/, education/         # 직군/학년별 추천 (Static Gen ✅)
│   ├── community/                # 커뮤니티 (Client ⚠️)
│   ├── recipes/                  # AI 레시피 (Static Gen ✅)
│   ├── compare/                  # 도구 비교 (Static Gen ✅)
│   ├── search/, discover/        # 검색/탐색
│   ├── admin/                    # 관리자 대시보드
│   ├── auth/                     # 인증 (OAuth)
│   └── api/                      # 56개 API 라우트
│       ├── community/v2/         # 커뮤니티 CRUD
│       ├── cron/                 # 22개 크론 작업
│       ├── admin/                # 관리자 API
│       └── ...                   # tools, search, bookmarks 등
├── components/                   # 98개 컴포넌트 (10,071 LOC)
│   ├── layout/                   # Header, Footer, Sidebar
│   ├── ui/                       # Button, Badge, DynamicIcon, LogoImage
│   ├── service/                  # ServiceCard, ServiceGrid
│   ├── community/v2/             # 커뮤니티 v2 컴포넌트
│   ├── home/                     # 메인 페이지 배너, 캐러셀
│   ├── ranking/                  # 랭킹 관련
│   ├── recipe/                   # 레시피 관련
│   ├── compare/                  # 비교 관련
│   └── ...                       # auth, comment, seo, etc.
├── lib/                          # 유틸리티 & 비즈니스 로직
│   ├── supabase/                 # client.ts, server.ts, queries.ts (1,527 LOC)
│   ├── auth/                     # adminCheck.ts, AuthContext.tsx
│   ├── constants.ts              # 733 LOC — 모든 설정값
│   ├── tool-descriptions.ts      # 216 도구 설명 매핑
│   ├── utils.ts                  # 유틸리티 함수
│   ├── scoring/                  # 랭킹 점수 계산
│   ├── community/                # 태그 추출
│   └── ...                       # compare, pipeline, provocation
├── hooks/                        # useBookmark, useUpvote, useComments, useNotifications
├── types/index.ts                # 792 LOC — 전체 타입 정의
├── store/                        # (비어있음 — Zustand 미사용)
├── data/
│   ├── seed.json                 # 216개 도구 (1.3MB) — 현재 주 데이터 소스
│   ├── recipes.ts                # AI 레시피 (109KB)
│   └── [백업 파일 7개]            # ~2.4MB — 삭제 가능
├── supabase/
│   ├── setup_complete.sql        # 통합 스키마 (278 LOC)
│   └── migrations/               # 001~016 순차 마이그레이션
├── scripts/                      # 46개 (배치 스크립트 11개 삭제 가능)
├── docs/                         # PRD, PHASES, 커뮤니티 PRD 등
└── public/                       # manifest.json, 아이콘, 로고
```

---

## 부록: Supabase DB 스키마 (16개 마이그레이션)

| # | 파일 | 내용 |
|---|------|------|
| 001 | initial_schema.sql | tools, categories, user_types 코어 테이블 |
| 002 | add_user_name_columns.sql | 사용자 이름 필드 |
| 003 | community_posts.sql | 커뮤니티 v1 |
| 004 | external_data_pipeline.sql | 외부 데이터 수집 파이프라인 |
| 005 | tool_discovery_pipeline.sql | 도구 발견 파이프라인 |
| 006 | evaluation_system.sql | 평가 시스템 |
| 007 | tool_content_enrichment.sql | long_description, usage_tips 등 |
| 008 | tool_suggestions.sql | 도구 제안 시스템 |
| 009 | community_v2_tags.sql | 커뮤니티 v2 태그 시스템 |
| 010 | daily_picks.sql | 오늘의 추천 |
| 011 | qa_system.sql | Q&A 시스템 |
| 012 | notifications.sql | 알림 시스템 |
| 013 | user_profiles_reputation.sql | 사용자 평판 |
| 014 | provocation_system.sql | 도발적 질문 시스템 |
| 015 | multi_category_support.sql | 다중 카테고리 |
| 016 | rating_scoring_redesign.sql | 평점/스코어링 재설계 |

**RLS 정책**: ✅ Public read + User-based write/update/delete
**인덱스**: ✅ user_id, post_type, created_at(DESC), GIN(tags, ai_tools)
**트리거**: ✅ updated_at, vote_count, comment_count, bookmark_count 자동 업데이트

---

## 결론

AIPICK 프로젝트는 전반적으로 **잘 구조화된 Next.js 프로젝트**입니다. TypeScript strict 모드, Server/Client Component 적절한 분리, 체계적인 DB 마이그레이션 등 좋은 관행이 자리잡고 있습니다.

**즉시 해결해야 할 사항**은:
1. **보안**: XSS 취약점, Admin 인증 기본값, CRON 인증 부재
2. **성능**: ISR 미적용, 이미지 최적화, N+1 쿼리

**장기적으로**:
- 대형 파일 분리 (queries.ts, types/index.ts, constants.ts)
- 일회성 스크립트/백업 파일 정리 (~3.2MB 절감)
- Zustand, PWA 등 미설치 의존성 도입 (Phase 5-6)

이 보고서의 Phase A → B → C → D 순서로 진행하면 가장 효과적입니다.
