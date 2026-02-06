# AIPICK - 단계별 개발 상세 진행사항

> 각 Phase의 세부 태스크와 진행 상태를 추적합니다.
> 상태: [ ] 미진행 / [~] 진행중 / [x] 완료

---

## Phase 1: 프로젝트 초기 세팅 및 메인 UI/UX

### 1-1. 프로젝트 초기화
- [ ] `npx create-next-app@latest aipick` (App Router, TypeScript, Tailwind)
- [ ] 폴더 구조 생성 (components/, lib/, types/, hooks/, store/, data/)
- [ ] ESLint 규칙 설정 (next/core-web-vitals 기반)
- [ ] Prettier 설정 (.prettierrc)
- [ ] `.env.local.example` 파일 생성
- [ ] `lucide-react` 설치
- [ ] CLAUDE.md 프로젝트 컨벤션 파일 작성

### 1-2. 타입 정의
- [ ] `types/index.ts` - 모든 DB 스키마에 대응하는 TypeScript 인터페이스
  - Category, Tool, Review, Bookmark, News

### 1-3. 상수 및 설정
- [ ] `lib/constants.ts`
  - 사이트명, 설명 등 메타 정보
  - 카테고리 목록 (초기 더미)
  - 가격 타입 enum
  - 페이지네이션 설정값

### 1-4. 공통 UI 컴포넌트
- [ ] `components/ui/Button.tsx` - variant: primary, secondary, outline, ghost
- [ ] `components/ui/Badge.tsx` - variant: free(green), freemium(blue), paid(gray)
- [ ] `components/ui/Card.tsx` - 기본 카드 래퍼
- [ ] `components/ui/Input.tsx` - 검색 입력 등
- [ ] `components/ui/Skeleton.tsx` - 로딩 스켈레톤

### 1-5. 레이아웃 컴포넌트
- [ ] `app/layout.tsx` - 루트 레이아웃 (HTML head, body)
- [ ] `components/layout/Header.tsx`
  - 로고 (AIPICK 텍스트)
  - 카테고리 메뉴 (드롭다운)
  - 검색창
  - 로그인 버튼
  - 모바일: 햄버거 메뉴
- [ ] `components/layout/Footer.tsx`
  - 사이트 소개, 링크, 저작권
- [ ] `components/layout/MobileNav.tsx`
  - 슬라이드 메뉴

### 1-6. 서비스 카드 컴포넌트 (핵심)
- [ ] `components/service/ServiceCard.tsx`
  ```
  ┌─────────────────────────┐
  │  [로고]  서비스명        │
  │  한 줄 설명              │
  │                         │
  │  ┌──────────────────┐   │
  │  │ 🟢 매일 5크레딧   │   │  ← 무료 사용량 뱃지 (강조)
  │  └──────────────────┘   │
  │                         │
  │  ⭐ 4.5  │ Freemium     │
  │  #태그1 #태그2          │
  └─────────────────────────┘
  ```
- [ ] `components/service/ServiceGrid.tsx` - 반응형 그리드 (PC: 3열, 태블릿: 2열, 모바일: 1열)

### 1-7. 메인 페이지
- [ ] `app/page.tsx`
  - 히어로 섹션: "어떤 AI를 찾고 계신가요?" + 목적별 퀵 버튼
  - Editor's Pick 섹션: 에디터 추천 서비스 가로 스크롤
  - 카테고리별 인기 서비스 섹션
  - 최신 등록 서비스 섹션

### 1-8. 더미 데이터
- [ ] `data/seed.json` 작성
  - 카테고리 8개: 텍스트 생성, 이미지 생성, 영상 편집, 코딩 도구, 음악 생성, 데이터 분석, 번역, 기타
  - AI 서비스 24개 이상 (카테고리별 3개씩)
  - 실제 서비스 기반 데이터 (ChatGPT, Midjourney, Runway 등)

**완료 기준**: `npm run dev`로 메인 페이지가 PC/모바일에서 완벽히 렌더링됨

---

## Phase 2: Supabase 연동 및 상세 페이지

### 2-1. Supabase 설정
- [ ] `lib/supabase/client.ts` - 브라우저용 클라이언트
- [ ] `lib/supabase/server.ts` - Server Component용 클라이언트
- [ ] 환경변수 설정
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2-2. DB 마이그레이션
- [ ] `supabase/migrations/001_initial_schema.sql`
  - categories 테이블
  - tools 테이블
  - reviews 테이블
  - bookmarks 테이블
  - news 테이블
  - RLS (Row Level Security) 정책
  - 인덱스 설정

### 2-3. 시드 데이터
- [ ] `supabase/seed.sql` - seed.json 기반 SQL INSERT문

### 2-4. 데이터 페칭 레이어
- [ ] `lib/supabase/queries.ts` - 데이터 조회 함수들
  - `getTools()` - 전체 서비스 목록
  - `getToolBySlug(slug)` - 슬러그로 서비스 조회
  - `getToolsByCategory(categorySlug)` - 카테고리별 서비스
  - `getEditorPicks()` - 에디터 추천
  - `getCategories()` - 카테고리 목록
  - `getSimilarTools(toolId, categoryId)` - 유사 서비스

### 2-5. 메인 페이지 DB 연동
- [ ] 더미 데이터 → Supabase 쿼리로 교체
- [ ] Skeleton 로딩 UI 적용
- [ ] error.tsx 에러 페이지

### 2-6. 서비스 상세 페이지
- [ ] `app/tools/[slug]/page.tsx`
  - 서비스 헤더: 로고, 이름, 설명, 카테고리 뱃지, 평점
  - "서비스 바로가기" 외부 링크 버튼
  - **무료 사용량 강조 섹션**
    ```
    ┌─────────────────────────────┐
    │  🆓 무료로 어디까지?         │
    │                             │
    │  매일 5크레딧 제공           │
    │  이미지 생성 10장/월         │
    │  ...                        │
    └─────────────────────────────┘
    ```
  - 장점/단점 섹션 (pros/cons 리스트)
  - 가격 정보
  - 유사 서비스 추천 카드 3개
- [ ] `app/tools/[slug]/loading.tsx` - 스켈레톤 UI
- [ ] visit_count 증가 API 연동

**완료 기준**: Supabase에서 실제 데이터를 불러와 메인 + 상세 페이지가 정상 동작

---

## Phase 3: 검색, 필터링 및 목적별 추천

### 3-1. 검색 기능
- [ ] `app/api/search/route.ts` - 검색 API
  - Full-text search (Supabase의 `textSearch` 또는 `ilike`)
  - 서비스명, 설명, 태그 기반 검색
- [ ] `components/search/SearchBar.tsx`
  - 디바운스 적용 (300ms)
  - 자동완성 드롭다운
- [ ] `app/search/page.tsx` - 검색 결과 페이지
  - 결과 개수 표시
  - 결과 없을 때 안내 UI
  - 검색어 하이라이팅

### 3-2. 카테고리 페이지
- [ ] `app/category/[slug]/page.tsx`
  - 카테고리명, 설명 헤더
  - 해당 카테고리 서비스 그리드
  - 필터 사이드바 연동

### 3-3. 필터 시스템
- [ ] `components/search/FilterSidebar.tsx`
  - 가격 필터: Free / Freemium / Paid (체크박스)
  - 한국어 지원 필터 (토글)
  - 평점 필터 (4점 이상 등 슬라이더 또는 라디오)
  - 정렬: 인기순 / 평점순 / 최신순
- [ ] URL 쿼리 파라미터 동기화
  - `?pricing=free,freemium&korean=true&sort=popular`
  - 뒤로가기 시 필터 상태 유지
  - 필터 URL 공유 가능

### 3-4. 목적별 추천 위자드
- [ ] `app/recommend/page.tsx`
- [ ] `components/recommend/Wizard.tsx`
  - Step UI (프로그레스 바)
  - Step 1: 작업 유형 선택 (카테고리 기반)
  - Step 2: 예산 선택 (무료만 / $10 이하 / 상관없음)
  - Step 3: 한국어 지원 필요 여부
  - 결과: 매칭 서비스 TOP 3 카드 + 비교표
- [ ] 위자드 상태 관리 (Zustand 또는 로컬 state)

**완료 기준**: 검색/필터/위자드 모든 경로에서 원하는 서비스를 정확히 탐색 가능

---

## Phase 4: 사용자 기능 (인증, 리뷰, 북마크, 뉴스)

### 4-1. 인증
- [ ] Supabase Auth 설정 (Google, GitHub Provider)
- [ ] `app/auth/login/page.tsx` - 로그인 페이지
- [ ] `app/auth/callback/route.ts` - OAuth 콜백 처리
- [ ] `middleware.ts` - 인증 보호 라우트 미들웨어
- [ ] `components/auth/AuthButton.tsx` - 로그인/로그아웃 버튼
- [ ] `components/auth/AuthGuard.tsx` - 로그인 필요 시 유도 모달

### 4-2. 사용자 프로필
- [ ] `app/profile/page.tsx`
  - 기본 정보 (이메일, 이름, 아바타)
  - 내 리뷰 목록
  - 내 북마크 목록

### 4-3. 북마크
- [ ] `hooks/useBookmark.ts` - 북마크 토글 훅
- [ ] 북마크 추가/제거 Supabase 쿼리
- [ ] ServiceCard에 북마크 아이콘 추가 (로그인 시만 활성)
- [ ] `app/bookmarks/page.tsx` - 내 북마크 페이지

### 4-4. 리뷰
- [ ] `components/review/ReviewForm.tsx`
  - 별점 선택 UI (1~5)
  - 텍스트 입력 (최소 10자)
  - 로그인 확인
- [ ] `components/review/ReviewList.tsx`
  - 리뷰 카드: 작성자, 별점, 내용, 날짜
  - 정렬: 최신순 / 평점순
- [ ] 상세 페이지에 리뷰 섹션 추가
- [ ] DB Trigger: 리뷰 작성/수정/삭제 시 tools.rating_avg, review_count 자동 갱신
- [ ] 본인 리뷰 수정/삭제

### 4-5. AI 뉴스
- [ ] `app/news/page.tsx` - 뉴스 리스트 (최신순)
- [ ] `components/news/NewsCard.tsx`
  - 썸네일, 제목, 요약, 출처, 날짜
  - 클릭 → 원문 링크 새 탭
- [ ] 메인 페이지에 "최신 AI 소식" 섹션 추가 (3건)

**완료 기준**: 로그인 후 북마크 저장, 리뷰 작성, 뉴스 열람이 정상 동작

---

## Phase 5: 관리자 페이지 및 SEO / 성능 최적화

### 5-1. 관리자 페이지
- [ ] 관리자 접근 권한 설정
  - 방법: 환경변수 `ADMIN_EMAILS`에 등록된 이메일만 접근
  - admin 미들웨어 적용
- [ ] `app/admin/page.tsx` - 대시보드
  - 총 서비스 수, 총 리뷰 수
  - 인기 서비스 TOP 10
  - 최근 등록 서비스
- [ ] `app/admin/tools/page.tsx` - 서비스 관리 리스트
  - 검색, 필터, 페이지네이션
- [ ] `app/admin/tools/new/page.tsx` - 서비스 등록 폼
  - 모든 필드 입력
  - 카테고리 선택
  - 태그 입력 (chip 형태)
  - 미리보기
- [ ] `app/admin/tools/[id]/edit/page.tsx` - 서비스 수정
- [ ] 서비스 삭제 (확인 모달)
- [ ] 뉴스 CRUD

### 5-2. SEO
- [ ] 동적 메타데이터 완성
  - `app/layout.tsx` - 기본 메타
  - `app/tools/[slug]/page.tsx` - 서비스별 메타
  - `app/category/[slug]/page.tsx` - 카테고리별 메타
- [ ] `app/sitemap.ts` - 동적 사이트맵 생성
- [ ] `app/robots.ts` - robots.txt
- [ ] JSON-LD 구조화 데이터
  - WebSite 스키마 (메인)
  - SoftwareApplication 스키마 (서비스 상세)
  - Review 스키마

### 5-3. 성능 최적화
- [ ] `next/image`로 이미지 최적화
- [ ] 정적 페이지 ISR 설정 (revalidate)
- [ ] 번들 분석 (@next/bundle-analyzer)
- [ ] Suspense 바운더리 적용
- [ ] Error Boundary 적용
- [ ] Lighthouse 점수 확인 및 개선
  - Performance: 90+
  - Accessibility: 90+
  - Best Practices: 90+
  - SEO: 90+

**완료 기준**: 관리자 CRUD 동작 + Lighthouse 전 항목 90점 이상

---

## 개발 진행 요약

| Phase | 상태 | 예상 주요 파일 수 |
|-------|------|-----------------|
| Phase 1 | [ ] 미진행 | ~20개 |
| Phase 2 | [ ] 미진행 | ~15개 |
| Phase 3 | [ ] 미진행 | ~12개 |
| Phase 4 | [ ] 미진행 | ~15개 |
| Phase 5 | [ ] 미진행 | ~10개 |
