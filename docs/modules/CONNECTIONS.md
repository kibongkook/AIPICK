# 모듈 연결고리 (Module Connections)

> AIPICK 7개 모듈 간의 데이터 흐름, API 의존성, UI 연계를 정리한 문서
> 최종 수정일: 2026-02-20

---

## 1. 전체 모듈 의존성 지도

```
┌──────────────────────────────────────────────────────────────────┐
│                        사용자 진입점                               │
│   홈(/)  AI찾기(/discover)  랭킹(/rankings)  뉴스(/news)  검색    │
└────┬──────────┬────────────────┬──────────────┬────────────┬─────┘
     │          │                │              │            │
     ▼          ▼                ▼              ▼            ▼
┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐
│ M1      │ │ M2       │ │ M3        │ │ M5       │ │ M6       │
│ DISCOV. │ │ RANKING  │ │ CURATION  │ │ CONTENT  │ │ AUTH     │
│         │ │          │ │           │ │          │ │          │
│/discover│ │/rankings │ │/jobs      │ │/news     │ │/auth     │
│/search  │ │/trending │ │/education │ │/guides   │ │/profile  │
│/category│ │          │ │           │ │/recipes  │ │/bookmarks│
│/compare │ │          │ │           │ │          │ │/collections│
└────┬────┘ └────┬─────┘ └─────┬─────┘ └─────┬────┘ └─────┬────┘
     │           │             │             │             │
     └─────┬─────┴─────────────┘             │             │
           │                                 │             │
           ▼                                 ▼             ▼
     ┌───────────┐                    ┌───────────────────────┐
     │   tools   │                    │  M4-COMMUNITY         │
     │ (핵심 DB) │◄───────────────────│  /community           │
     └───────────┘                    └───────────────────────┘
           ▲
           │
     ┌───────────┐
     │ M7-ADMIN  │
     │ /admin    │
     │ cron/     │
     └───────────┘
```

---

## 2. 모듈별 제공/소비 관계

### M1 (Discovery) ↔ 다른 모듈

| 방향 | 대상 | 연계 내용 |
|------|------|---------|
| M1 → M2 | 랭킹 | 카테고리 페이지에 랭킹 TOP 3 위젯 표시 |
| M1 → M3 | 큐레이션 | 위자드 Step 2에서 직군/학년 선택 → M3 데이터 사용 |
| M1 → M4 | 커뮤니티 | 카테고리 페이지 하단 관련 커뮤니티 글 표시 |
| M1 ← M2 | 랭킹 | 검색 정렬 기준으로 ranking_score 사용 |
| M1 ← tools DB | — | 검색, 카테고리, 비교 모두 tools 테이블 기반 |

### M2 (Ranking) ↔ 다른 모듈

| 방향 | 대상 | 연계 내용 |
|------|------|---------|
| M2 ← M6 | 인증 | 북마크 수 → bookmark_count → 랭킹 가중치 |
| M2 ← M4 | 커뮤니티 | 업보트 수 → upvote_count → 랭킹 가중치 |
| M2 ← M7 | 관리자 | 크론잡이 hybrid_score 재계산 |
| M2 → M1 | 탐색 | 랭킹 위젯을 홈, 카테고리 페이지에 제공 |
| M2 → M5 | 콘텐츠 | 홈 페이지 "TOP 5 랭킹" 사이드바 위젯 |

### M3 (Curation) ↔ 다른 모듈

| 방향 | 대상 | 연계 내용 |
|------|------|---------|
| M3 → M1 | 탐색 | 위자드 Step 2 직군/학년 데이터 제공 |
| M3 → M5 | 콘텐츠 | 직군/학년 상세 페이지 → 관련 가이드 링크 |
| M3 ← M7 | 관리자 | admin/jobs, admin/education에서 데이터 관리 |
| M3 ← M6 | 인증 | 검색 필터의 직군/학년 필터는 로그인 불필요 |

### M4 (Community) ↔ 다른 모듈

| 방향 | 대상 | 연계 내용 |
|------|------|---------|
| M4 → M2 | 랭킹 | 업보트 → tools.upvote_count → 랭킹 |
| M4 ← M6 | 인증 | 글 작성, 댓글, 업보트는 로그인 필수 |
| M4 ← M1 | 탐색 | 카테고리 페이지에서 `?goal=...` 필터로 연계 |
| M4 ← M5 | 콘텐츠 | 레시피 페이지에서 관련 커뮤니티 섹션 표시 |
| M4 ↔ tools | — | 글에 AI 서비스 태그(AI_TOOL) 자동 연결 |

### M5 (Content) ↔ 다른 모듈

| 방향 | 대상 | 연계 내용 |
|------|------|---------|
| M5 → M4 | 커뮤니티 | 레시피 상세 페이지에 관련 커뮤니티 섹션 |
| M5 → M3 | 큐레이션 | 직군/학년별 가이드 링크 |
| M5 ← M7 | 관리자 | 뉴스 크론잡 자동 수집, admin에서 CRUD |
| M5 ← M6 | 인증 | 가이드 작성은 관리자만 |

### M6 (Auth) ↔ 다른 모듈

| 방향 | 대상 | 연계 내용 |
|------|------|---------|
| M6 → M4 | 커뮤니티 | 글 작성/댓글/업보트 인증 Gate |
| M6 → M2 | 랭킹 | 북마크 수 → 랭킹 가중치 |
| M6 → M1 | 탐색 | 위자드 결과 저장 (미구현) |
| M6 ← M7 | 관리자 | adminCheck.ts로 관리자 권한 확인 |

### M7 (Admin) ↔ 다른 모듈

| 방향 | 대상 | 연계 내용 |
|------|------|---------|
| M7 → M2 | 랭킹 | ranking 크론잡 → hybrid_score 갱신 |
| M7 → M5 | 콘텐츠 | news 크론잡, admin CRUD |
| M7 → M3 | 큐레이션 | admin/jobs, admin/education CRUD |
| M7 ← M6 | 인증 | ADMIN_EMAILS 기반 권한 제어 |

---

## 3. 핵심 데이터 흐름

### 3.1 AI 서비스 탐색 흐름

```
사용자
  ↓
[목적 선택] → M1(/discover) → 위자드 → M3 직군/학년 매핑
                                      ↓
                              tools 테이블 쿼리
                              (category + job + edu 필터)
                                      ↓
                              [AI 서비스 목록/상세 표시]
```

### 3.2 랭킹 점수 갱신 흐름

```
M7 크론잡 (매일)
  ↓
외부 데이터 수집
  ├── Product Hunt (평점/추천)
  ├── 벤치마크 (LMSYS, AlpacaEval)
  └── Artificial Analysis
  ↓
내부 데이터 집계
  ├── M6 업보트 (upvote_count)
  ├── M6 북마크 (bookmark_count)
  └── M4 커뮤니티 댓글 수
  ↓
hybrid_score 재계산 (lib/scoring/)
  ↓
tools 테이블 업데이트
  ↓
M2 랭킹 페이지에 반영
```

### 3.3 커뮤니티 글 작성 흐름

```
사용자 (로그인 필수 — M6 Auth Gate)
  ↓
/community/write
  ↓
글 제목 + 본문 입력
  ↓
자동 태그 추출 (lib/community/tag-extractor.ts)
  ├── AI_TOOL 태그: tools 슬러그 사전 매칭
  ├── GOAL 태그: PURPOSE_CATEGORIES 키워드 매칭
  ├── FEATURE 태그: 기능 키워드 사전
  └── KEYWORD 태그: 나머지 명사
  ↓
community_posts + community_post_tags 저장
  ↓
업보트 발생 시 → tools.upvote_count → M2 랭킹 반영
```

### 3.4 뉴스 자동 수집 흐름

```
M7 크론잡 /api/cron/news-fetch (매시간)
  ↓
외부 뉴스 소스 수집
  ↓
related_tool_id 자동 매핑 (model-matcher.ts)
  ↓
news 테이블 저장
  ↓
M5 /news 페이지에 표시
```

---

## 4. 공유 상수 위치

**파일**: `lib/constants.ts`

| 상수 | 사용 모듈 |
|------|---------|
| `PURPOSE_CATEGORIES` | M1 (카테고리 그리드), M4 (태그 추출 GOAL) |
| `JOB_CATEGORIES` | M3, M1 (위자드 Step 2) |
| `EDU_LEVELS` | M3, M1 (위자드 Step 2) |
| `BENCHMARK_EXPLANATIONS` | M2 (벤치마크 점수 표시) |
| `PERSONA_CARDS` | 홈페이지 (Phase 8-D) |
| `SIDEBAR_MENU_SECTIONS` | 레이아웃 사이드바 |

---

## 5. 공유 컴포넌트

| 컴포넌트 | 사용 모듈 |
|---------|---------|
| `components/service/ServiceCard.tsx` | M1, M2, M3, M6, 홈 |
| `components/ui/LogoImage.tsx` | 전 모듈 |
| `components/ui/DynamicIcon.tsx` | M1, M5 (레시피) |
| `components/search/FilterSidebar.tsx` | M1 (/search, /category) |
| `components/ranking/TrendBadge.tsx` | M2 |
| `components/layout/MainSidebar.tsx` | 전체 레이아웃 |
| `components/layout/BottomTabBar.tsx` | 전체 모바일 |

---

## 6. API 라우트 전체 맵

| 라우트 | 메서드 | 모듈 | 역할 |
|--------|--------|------|------|
| `/api/search` | GET | M1 | 키워드 검색 |
| `/api/recommend` | POST | M1 | 위자드 추천 |
| `/api/suggestions` | GET | M1 | 자동완성 |
| `/api/tools/[slug]/visit` | POST | M1 | 방문수 증가 |
| `/api/community/v2` | GET/POST | M4 | 커뮤니티 CRUD |
| `/api/community/v2/[id]/votes` | POST | M4 | 투표 |
| `/api/community/v2/[id]/bookmark` | POST | M4, M6 | 저장 |
| `/api/community/v2/mentions` | GET | M4 | 멘션 알림 |
| `/api/bookmarks` | GET/POST/DELETE | M6 | 북마크 |
| `/api/upvotes` | POST | M6, M2 | 서비스 업보트 |
| `/api/collections` | CRUD | M6 | 컬렉션 |
| `/api/comments` | CRUD | M6, M4 | 댓글 |
| `/api/admin/tools` | CRUD | M7 | 서비스 관리 |
| `/api/admin/news` | CRUD | M7, M5 | 뉴스 관리 |
| `/api/cron/ranking` | GET | M7, M2 | 랭킹 갱신 |
| `/api/cron/trends` | GET | M7, M2 | 트렌드 갱신 |
| `/api/cron/news-fetch` | GET | M7, M5 | 뉴스 수집 |
| `/api/cron/benchmarks` | GET | M7, M2 | 벤치마크 수집 |
| `/api/cron/pricing` | GET | M7 | 가격 변동 |
| `/api/cron/product-hunt` | GET | M7, M2 | PH 데이터 |
| `/api/cron/artificial-analysis` | GET | M7, M2 | AA 데이터 |
| `/api/cron/category-popularity` | GET | M7, M2 | 카테고리 인기도 |

---

## 7. DB 테이블 ↔ 모듈 매핑

| 테이블 | 주 담당 모듈 | 읽기 모듈 |
|--------|------------|---------|
| `tools` | M7 (CRUD) | M1, M2, M3, M4, M5, M6 |
| `categories` | M7 | M1, M2 |
| `reviews` | M6 | M2 |
| `bookmarks` | M6 | M2 (가중치) |
| `upvotes` | M6 | M2 (가중치) |
| `comments` | M6, M4 | M6 |
| `community_posts` | M4 | M1, M5 |
| `community_tags` | M4 | M1 (태그 클릭) |
| `job_categories` | M7, M3 | M1 |
| `edu_levels` | M7, M3 | M1 |
| `job_tool_recommendations` | M7, M3 | M1 (위자드) |
| `edu_tool_recommendations` | M7, M3 | M1 (위자드) |
| `news` | M7, M5 | M5 |
| `guides` | M7, M5 | M3, M5 |
| `collections` | M6 | M6 |
| `weekly_rankings` | M7 (크론) | M2 |
| `external_benchmark_scores` | M7 (크론) | M2 |

---

## 8. 변경 시 파급 효과 체크리스트

### tools 테이블 스키마 변경 시
- [ ] `types/index.ts` Tool 인터페이스 업데이트
- [ ] `lib/supabase/queries.ts` 관련 쿼리 업데이트
- [ ] `components/service/ServiceCard.tsx` props 확인
- [ ] `data/seed.json` 데이터 필드 추가
- [ ] DB 마이그레이션 파일 추가

### 새 목적 카테고리 추가 시
- [ ] `lib/constants.ts` → `PURPOSE_CATEGORIES` 업데이트
- [ ] `components/ui/DynamicIcon.tsx` → `ICON_MAP` 아이콘 등록
- [ ] `/category/[slug]` 정적 생성 자동 반영 (generateStaticParams)
- [ ] seed.json 해당 카테고리 도구 추가

### 새 직군 추가 시
- [ ] `lib/constants.ts` → `JOB_CATEGORIES` 업데이트
- [ ] DB `job_categories` 테이블에 행 추가
- [ ] `job_tool_recommendations` 매핑 데이터 추가

### 크론잡 추가 시
- [ ] `/api/cron/[name]/route.ts` 생성
- [ ] `CRON_SECRET` 인증 확인
- [ ] `vercel.json` crons 배열에 추가
- [ ] `M7-ADMIN.md` 크론잡 목록 업데이트
