# AIPICK - Product Requirements Document (PRD)

> 최종 수정일: 2026-02-06
> 버전: v1.0

---

## 1. 프로젝트 개요

### 1.1 프로젝트명
**AIPICK** (에이아이픽)

### 1.2 비전
"어떤 AI를 써야 할지 모르겠다면, AIPICK이 골라줍니다."

### 1.3 문제 정의
- AI 서비스가 폭발적으로 늘어났지만, 사용자는 **어떤 서비스가 자기 목적에 맞는지** 판단하기 어렵다.
- 대부분의 AI 서비스가 무료 티어를 제공하지만, **무료로 어디까지 쓸 수 있는지** 정보가 흩어져 있다.
- 비용 대비 효율적인 AI 서비스를 찾기 위해 여러 사이트를 돌아다녀야 한다.

### 1.4 솔루션
- **목적 기반 AI 큐레이션**: "나는 ~을 하고 싶다" → 최적의 AI 서비스 추천
- **무료 사용량(Quota) 정보 강조**: 모든 서비스의 무료 제공 범위를 한눈에 비교
- **목적별 추천 위자드**: 대화형 UI로 사용자 니즈 파악 후 맞춤 추천

### 1.5 타겟 사용자
| 페르소나 | 설명 | 핵심 니즈 |
|---------|------|----------|
| AI 입문자 | 어떤 AI가 있는지조차 모르는 일반인 | 쉬운 탐색, 목적별 추천 |
| 실무자 | 업무에 AI를 활용하고 싶은 직장인/프리랜서 | 비용 효율, 기능 비교 |
| 학생/연구자 | 논문, 과제에 AI를 쓰고 싶은 사용자 | 무료 서비스, 학술 특화 |

---

## 2. 기술 스택

| 영역 | 기술 | 선택 이유 |
|------|------|----------|
| Framework | Next.js 14 (App Router) | SSR/SSG 지원, SEO 최적화 |
| UI | React + Tailwind CSS | 빠른 프로토타이핑, 반응형 |
| Icons | Lucide React | 경량, 일관된 아이콘 세트 |
| Backend/DB | Supabase (PostgreSQL) | Auth, Storage, Realtime 내장 |
| Auth | Supabase Auth | Google/GitHub OAuth 지원 |
| State | Zustand | 경량 전역 상태 관리 |
| Deploy | Vercel | Next.js 네이티브 배포 |
| Linting | ESLint + Prettier | 코드 품질 관리 |

---

## 3. 데이터베이스 스키마

### 3.1 ERD 개요

```
categories 1──N tools 1──N reviews
                              N──1 users
news (독립)
bookmarks (users N──M tools)
```

### 3.2 테이블 상세

#### `categories` - 카테고리
| 컬럼 | 타입 | 설명 | 제약 |
|------|------|------|------|
| id | uuid | PK | auto-generated |
| name | text | 카테고리명 (예: 텍스트 생성) | NOT NULL |
| slug | text | URL용 식별자 (예: text-generation) | UNIQUE, NOT NULL |
| icon | text | Lucide 아이콘명 | nullable |
| sort_order | int | 노출 순서 | default: 0 |
| created_at | timestamptz | 생성일시 | default: now() |

#### `tools` - AI 서비스
| 컬럼 | 타입 | 설명 | 제약 |
|------|------|------|------|
| id | uuid | PK | auto-generated |
| name | text | 서비스명 | NOT NULL |
| slug | text | URL용 식별자 | UNIQUE, NOT NULL |
| description | text | 한 줄 소개 | NOT NULL |
| long_description | text | 상세 설명 | nullable |
| category_id | uuid | FK → categories.id | NOT NULL |
| url | text | 서비스 접속 링크 | NOT NULL |
| logo_url | text | 로고 이미지 URL | nullable |
| pricing_type | text | Free / Freemium / Paid | NOT NULL |
| free_quota_detail | text | 무료 제공량 상세 | nullable |
| monthly_price | text | 유료 최저 가격 | nullable |
| rating_avg | float | 평균 평점 (1~5) | default: 0 |
| review_count | int | 리뷰 수 | default: 0 |
| visit_count | int | 클릭 수 (인기도) | default: 0 |
| tags | text[] | 검색용 태그 | default: '{}' |
| is_editor_pick | boolean | 에디터 추천 | default: false |
| supports_korean | boolean | 한국어 지원 여부 | default: false |
| pros | text[] | 장점 리스트 | default: '{}' |
| cons | text[] | 단점 리스트 | default: '{}' |
| created_at | timestamptz | 생성일시 | default: now() |
| updated_at | timestamptz | 수정일시 | default: now() |

#### `reviews` - 사용자 리뷰
| 컬럼 | 타입 | 설명 | 제약 |
|------|------|------|------|
| id | uuid | PK | auto-generated |
| tool_id | uuid | FK → tools.id | NOT NULL |
| user_id | uuid | FK → auth.users.id | NOT NULL |
| rating | int | 별점 (1~5) | CHECK(1~5) |
| content | text | 리뷰 내용 | NOT NULL |
| created_at | timestamptz | 작성일시 | default: now() |

#### `bookmarks` - 북마크
| 컬럼 | 타입 | 설명 | 제약 |
|------|------|------|------|
| id | uuid | PK | auto-generated |
| user_id | uuid | FK → auth.users.id | NOT NULL |
| tool_id | uuid | FK → tools.id | NOT NULL |
| created_at | timestamptz | 생성일시 | default: now() |
| | | | UNIQUE(user_id, tool_id) |

#### `news` - AI 뉴스
| 컬럼 | 타입 | 설명 | 제약 |
|------|------|------|------|
| id | uuid | PK | auto-generated |
| title | text | 뉴스 제목 | NOT NULL |
| summary | text | 요약 | nullable |
| source_url | text | 원문 링크 | NOT NULL |
| image_url | text | 썸네일 | nullable |
| published_at | timestamptz | 발행일 | NOT NULL |
| created_at | timestamptz | 등록일 | default: now() |

---

## 4. 개발 단계 (Phases)

각 Phase는 독립적으로 배포 가능한 단위로 설계합니다.

---

### Phase 1: 프로젝트 초기 세팅 및 메인 UI

**목표**: 프로젝트 기반 구축 + 더미 데이터로 핵심 UI 완성

#### 1-1. 프로젝트 초기화
- [ ] Next.js 14 프로젝트 생성 (App Router)
- [ ] Tailwind CSS 설정
- [ ] 프로젝트 폴더 구조 설계
- [ ] ESLint / Prettier 설정
- [ ] 환경변수 파일 구조 설정 (.env.local.example)

#### 1-2. 공통 컴포넌트 & 레이아웃
- [ ] 루트 레이아웃 (RootLayout)
  - GNB: 로고, 카테고리 드롭다운, 검색창, 로그인 버튼
  - Footer: 사이트 정보, 링크
- [ ] 모바일 반응형 네비게이션 (햄버거 메뉴)
- [ ] 공통 UI 컴포넌트: Button, Badge, Card, Input, Modal

#### 1-3. 메인 페이지
- [ ] 히어로 배너: "어떤 AI를 찾고 계신가요?" + 목적 선택 버튼
- [ ] 에디터 추천(Editor's Pick) 섹션
- [ ] 카테고리별 인기 서비스 섹션
- [ ] ServiceCard 컴포넌트 (핵심)
  - 로고, 서비스명, 한 줄 설명
  - **무료 사용량 뱃지** (가장 눈에 띄게)
  - 평점, 가격 타입 태그

#### 1-4. 더미 데이터
- [ ] 카테고리 6개 이상
- [ ] AI 서비스 20개 이상의 시드 데이터 JSON 작성

**산출물**: 더미 데이터로 동작하는 반응형 메인 페이지

---

### Phase 2: Supabase 연동 및 상세 페이지

**목표**: 실제 DB 연동 + 서비스 상세 정보 페이지 완성

#### 2-1. Supabase 설정
- [ ] Supabase 프로젝트 생성 가이드 문서화
- [ ] Supabase 클라이언트 설정 (lib/supabase.ts)
- [ ] 테이블 생성 SQL 스크립트 작성
- [ ] 시드 데이터 마이그레이션 스크립트 작성
- [ ] TypeScript 타입 자동 생성 설정

#### 2-2. 데이터 연동
- [ ] 메인 페이지: 더미 데이터 → Supabase 데이터로 교체
- [ ] Server Component로 데이터 패칭 (SSR)
- [ ] 로딩 상태 UI (Skeleton)
- [ ] 에러 상태 UI

#### 2-3. 서비스 상세 페이지 (/tools/[slug])
- [ ] 서비스 기본 정보 헤더 (로고, 이름, 설명, 외부 링크)
- [ ] **"무료로 어디까지?" 섹션** - 무료 사용량 상세 정보 강조
- [ ] 장점/단점 요약 섹션
- [ ] 가격 정보 섹션
- [ ] **유사 서비스 추천** - 같은 카테고리 내 다른 서비스 3개
- [ ] 방문 수 카운트 증가 (visit_count)
- [ ] 동적 메타데이터 (SEO 기초)

**산출물**: DB 연동된 메인 + 상세 페이지

---

### Phase 3: 검색, 필터링 및 목적별 추천

**목표**: 사용자가 원하는 AI 서비스를 빠르게 찾는 핵심 네비게이션 기능

#### 3-1. 검색 기능
- [ ] 검색 API 구현 (서비스명, 태그, 설명 기반)
- [ ] 검색 결과 페이지 (/search?q=...)
- [ ] 검색 자동완성(Autocomplete) UI
- [ ] 검색어 하이라이팅

#### 3-2. 카테고리 & 필터링
- [ ] 카테고리 페이지 (/category/[slug])
- [ ] 필터링 사이드바
  - 가격: 완전 무료 / 부분 유료(Freemium) / 유료
  - 한국어 지원 여부
  - 평점 기준 (4점 이상 등)
  - 정렬: 인기순 / 평점순 / 최신순
- [ ] URL 쿼리 파라미터로 필터 상태 관리 (공유 가능)

#### 3-3. 목적별 추천 위자드
- [ ] 위자드 UI 컴포넌트 (스텝 형태)
- [ ] Step 1: "어떤 작업을 하시나요?"
  - 선택지: 글쓰기, 이미지 생성, 영상 편집, 코딩, 데이터 분석, 음악 제작 등
- [ ] Step 2: "예산은 어떻게 되시나요?"
  - 선택지: 무료만 / 월 $10 이하 / 상관없음
- [ ] Step 3: "한국어 지원이 필요하신가요?"
  - 선택지: 필수 / 상관없음
- [ ] 결과 페이지: 조건 매칭 상위 3개 서비스 카드 + 상세 비교표

**산출물**: 검색 + 필터 + 위자드 추천이 작동하는 탐색 시스템

---

### Phase 4: 사용자 기능 (인증, 리뷰, 북마크, 뉴스)

**목표**: 사용자 참여 기능 + 콘텐츠 소비 기능

#### 4-1. 인증 (Auth)
- [ ] Supabase Auth 설정
- [ ] Google OAuth 로그인
- [ ] GitHub OAuth 로그인
- [ ] 로그인/로그아웃 UI
- [ ] 로그인 보호 미들웨어 (리뷰, 북마크 등)
- [ ] 사용자 프로필 페이지 (/profile)

#### 4-2. 북마크 기능
- [ ] 북마크 추가/제거 API
- [ ] ServiceCard에 북마크 버튼 추가 (하트 아이콘)
- [ ] 내 북마크 리스트 페이지 (/bookmarks)
- [ ] 로그인하지 않은 사용자 → 로그인 유도

#### 4-3. 리뷰 기능
- [ ] 리뷰 작성 폼 (별점 + 텍스트)
- [ ] 상세 페이지에 리뷰 리스트 노출
- [ ] 리뷰 작성 시 tools.rating_avg, review_count 자동 갱신 (DB Trigger)
- [ ] 리뷰 수정/삭제 (본인 것만)

#### 4-4. AI 뉴스 섹션
- [ ] 뉴스 리스트 페이지 (/news)
- [ ] 뉴스 카드 컴포넌트 (제목, 요약, 출처, 날짜)
- [ ] 메인 페이지 하단에 최신 뉴스 3건 노출
- [ ] 뉴스 상세 → 원문 링크로 리다이렉트

**산출물**: 로그인, 북마크, 리뷰, 뉴스가 작동하는 커뮤니티 기능

---

### Phase 5: 관리자 페이지 및 SEO / 성능 최적화

**목표**: 운영 도구 + 검색 엔진 최적화 + 성능 튜닝

#### 5-1. 관리자 대시보드 (/admin)
- [ ] 관리자 권한 체크 (role 기반 또는 이메일 화이트리스트)
- [ ] AI 서비스 CRUD
  - 서비스 등록 폼
  - 서비스 수정 폼
  - 서비스 삭제 (soft delete)
- [ ] 카테고리 관리
- [ ] 뉴스 등록/관리
- [ ] 대시보드 통계: 총 서비스 수, 총 리뷰 수, 인기 서비스 TOP 10

#### 5-2. SEO 최적화
- [ ] 동적 메타데이터 완성 (모든 페이지)
  - title, description, og:image, twitter:card
- [ ] sitemap.xml 자동 생성
- [ ] robots.txt 설정
- [ ] 구조화된 데이터 (JSON-LD) 적용
  - SoftwareApplication 스키마
  - Review 스키마

#### 5-3. 성능 최적화
- [ ] 이미지 최적화 (next/image)
- [ ] 데이터 캐싱 전략 (revalidate 설정)
- [ ] 번들 사이즈 분석 및 최적화
- [ ] Lighthouse 점수 90+ 목표
- [ ] 에러 바운더리 적용

**산출물**: 운영 가능한 완성된 서비스

---

## 5. 폴더 구조 설계

```
aipick/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (GNB, Footer)
│   ├── page.tsx                # 메인 페이지
│   ├── globals.css             # 글로벌 스타일
│   ├── tools/
│   │   └── [slug]/
│   │       └── page.tsx        # 서비스 상세 페이지
│   ├── category/
│   │   └── [slug]/
│   │       └── page.tsx        # 카테고리 페이지
│   ├── search/
│   │   └── page.tsx            # 검색 결과 페이지
│   ├── recommend/
│   │   └── page.tsx            # 목적별 추천 위자드
│   ├── news/
│   │   └── page.tsx            # AI 뉴스 페이지
│   ├── bookmarks/
│   │   └── page.tsx            # 북마크 페이지
│   ├── profile/
│   │   └── page.tsx            # 사용자 프로필
│   ├── admin/
│   │   ├── page.tsx            # 관리자 대시보드
│   │   └── tools/
│   │       ├── page.tsx        # 서비스 관리 리스트
│   │       ├── new/
│   │       │   └── page.tsx    # 서비스 등록
│   │       └── [id]/
│   │           └── edit/
│   │               └── page.tsx # 서비스 수정
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx        # 로그인 페이지
│   │   └── callback/
│   │       └── route.ts        # OAuth 콜백
│   └── api/
│       ├── search/
│       │   └── route.ts        # 검색 API
│       └── tools/
│           └── [id]/
│               └── visit/
│                   └── route.ts # 방문 수 카운트 API
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # GNB
│   │   ├── Footer.tsx          # 푸터
│   │   └── MobileNav.tsx       # 모바일 네비게이션
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   └── StarRating.tsx
│   ├── service/
│   │   ├── ServiceCard.tsx     # 서비스 카드 (핵심)
│   │   ├── ServiceGrid.tsx     # 서비스 그리드 레이아웃
│   │   └── ServiceDetail.tsx   # 상세 정보 컴포넌트
│   ├── search/
│   │   ├── SearchBar.tsx       # 검색창
│   │   ├── FilterSidebar.tsx   # 필터 사이드바
│   │   └── SearchResults.tsx   # 검색 결과
│   ├── recommend/
│   │   └── Wizard.tsx          # 추천 위자드
│   ├── review/
│   │   ├── ReviewForm.tsx      # 리뷰 작성 폼
│   │   └── ReviewList.tsx      # 리뷰 리스트
│   └── news/
│       └── NewsCard.tsx        # 뉴스 카드
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # 브라우저 클라이언트
│   │   ├── server.ts           # 서버 클라이언트
│   │   └── admin.ts            # 관리자 클라이언트
│   ├── constants.ts            # 상수 정의
│   └── utils.ts                # 유틸리티 함수
├── types/
│   └── index.ts                # TypeScript 타입 정의
├── store/
│   └── useStore.ts             # Zustand 스토어
├── hooks/
│   ├── useSearch.ts
│   └── useBookmark.ts
├── data/
│   └── seed.json               # 시드 데이터
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
│   └── images/
├── docs/
│   ├── PRD.md                  # 이 문서
│   └── PHASES.md               # 단계별 상세 진행사항
└── .env.local.example          # 환경변수 템플릿
```

---

## 6. UI/UX 핵심 원칙

### 6.1 디자인 원칙
- **정보 밀도 최적화**: 한 화면에서 서비스 비교가 가능하도록
- **무료 정보 강조**: free_quota_detail은 항상 가장 눈에 띄는 위치에
- **3클릭 규칙**: 원하는 서비스까지 최대 3번의 클릭으로 도달
- **모바일 퍼스트**: 카드 레이아웃은 모바일에서도 자연스럽게

### 6.2 색상 가이드라인
- Primary: Blue 계열 (#3B82F6) - 신뢰, 기술
- Accent: Green 계열 (#10B981) - 무료, 접근성
- Free 뱃지: Green 배경 - "무료" 강조
- Freemium 뱃지: Blue 배경 - "부분무료" 표시
- Paid 뱃지: Gray 배경 - "유료"

---

## 7. Phase별 완료 기준 (Definition of Done)

| Phase | 완료 기준 |
|-------|----------|
| Phase 1 | 더미 데이터 기반 메인 페이지가 PC/모바일에서 정상 렌더링 |
| Phase 2 | Supabase 연동 완료, 상세 페이지에서 실제 데이터 노출 |
| Phase 3 | 검색/필터/위자드를 통해 원하는 서비스 탐색 가능 |
| Phase 4 | 로그인 후 리뷰 작성/북마크 저장 가능, 뉴스 피드 노출 |
| Phase 5 | 관리자가 서비스 등록 가능, Lighthouse SEO 90+ |

---

## 8. 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| AI 서비스 정보의 빠른 변화 | 데이터 정확성 저하 | 사용자 리뷰 기반 업데이트 + 관리자 주기적 갱신 |
| 무료 사용량 정보 파편화 | 데이터 수집 어려움 | 초기 수동 수집 → 커뮤니티 기반 크라우드소싱 |
| Supabase 무료 티어 한계 | 트래픽 증가 시 비용 | 캐싱 적극 활용, 점진적 유료 전환 |
