# AIPICK - Product Requirements Document (PRD)

> 최종 수정일: 2026-02-06
> 버전: v2.0 (전면 개정)

---

## 1. 프로젝트 개요

### 1.1 프로젝트명
**AIPICK** (에이아이픽)

### 1.2 비전
"어떤 AI를 써야 할지 모르겠다면, AIPICK이 골라줍니다."

### 1.3 문제 정의
- AI 서비스가 폭발적으로 늘어났지만, **어떤 서비스가 자기 목적에 맞는지** 판단이 어렵다.
- **무료로 어디까지 쓸 수 있는지** 정보가 흩어져 있다.
- 학생, 교사, 직장인 등 **자신의 역할에 맞는 AI**를 찾는 게 어렵다.
- 기존 AI 디렉토리는 영문 위주이며, **한국 사용자 맞춤 정보**가 부족하다.
- AI 뉴스와 트렌드를 **한 곳에서** 파악하기 어렵다.

### 1.4 솔루션
- **목적 기반 네비게이션**: "나는 ~을 하고 싶다" → 최적의 AI 추천
- **직군/학년별 큐레이션**: 직업, 학년에 맞는 AI 툴킷 제시
- **랭킹 시스템**: 전체/카테고리별/주간 인기 랭킹
- **무료 사용량 강조**: 모든 서비스의 무료 범위를 한눈에
- **커뮤니티**: 리뷰, 기능별 평가, 댓글, 컬렉션 공유
- **AI 뉴스**: 최신 AI 트렌드를 한 곳에서

### 1.5 타겟 사용자

| 페르소나 | 설명 | 핵심 니즈 |
|---------|------|----------|
| AI 입문자 | 어떤 AI가 있는지 모르는 일반인 | 쉬운 탐색, "나한테 맞는 AI" |
| 학생 | 초등~대학, 각 수준에 맞는 AI | 학년별 추천, 무료 서비스 |
| 교사/교수 | 수업에 AI를 활용하고 싶은 교육자 | 교육용 AI, 학년별 추천 |
| 직장인/실무자 | 업무에 AI를 도입하고 싶은 사람 | 직군별 추천, 비용 효율 |
| 프리랜서/크리에이터 | 콘텐츠 제작에 AI 활용 | 기능별 비교, 무료 사용량 |
| AI 관심층 | AI 트렌드를 팔로우하는 사람 | 뉴스, 신규 서비스, 랭킹 |

### 1.6 경쟁 서비스 분석 (벤치마킹)

| 서비스 | 강점 | AIPICK 차별점 |
|--------|------|--------------|
| [There's an AI for That](https://theresanaiforthat.com/) | 5만+ 툴, 업무 기반 검색, 커뮤니티 | 한국어, 직군/학년별, 무료 사용량 강조 |
| [Toolify.ai](https://www.toolify.ai/) | 28,000+ 툴, 트래픽 랭킹, 카테고리 | 한국 특화, 교육 분야, 커뮤니티 |
| [Futurepedia](https://www.futurepedia.io/) | 4,000+ 툴, 교육 콘텐츠, 뉴스레터 | 직군별 추천, 기능별 평가, 한국어 |

---

## 2. 기술 스택

| 영역 | 기술 | 선택 이유 |
|------|------|----------|
| Framework | Next.js 14 (App Router) | SSR/SSG, SEO, PWA 지원 |
| UI | React + Tailwind CSS | 반응형, 모바일 퍼스트 |
| Icons | Lucide React | 경량, 일관성 |
| Backend/DB | Supabase (PostgreSQL) | Auth, Storage, Realtime |
| Auth | Supabase Auth | Google/GitHub/Kakao OAuth |
| State | Zustand | 경량 전역 상태 |
| Deploy | Vercel | Next.js 네이티브 배포 |
| PWA | next-pwa | 앱 설치, 오프라인 지원 |
| Analytics | Vercel Analytics | 트래픽, 이벤트 추적 |

### 2.1 멀티 플랫폼 전략
- **Phase 1~5**: 반응형 웹 (모바일 퍼스트)
- **Phase 6**: PWA (Progressive Web App) → 앱 설치 가능
- **이후**: React Native 또는 Capacitor로 네이티브 앱 확장

---

## 3. 핵심 기능 정의

### 3.1 네비게이션 체계 (사용자가 AI를 찾는 경로)

```
사용자가 AI를 찾는 5가지 경로:

1. 목적별: "~을 하고 싶다" → 추천 위자드
2. 직군별: "나는 마케터다" → 마케터 AI 툴킷
3. 학년별: "나는 중학생이다" → 학생용 AI 추천
4. 랭킹별: "가장 인기 있는 AI" → 종합/카테고리 랭킹
5. 검색: "ChatGPT 무료" → 키워드 검색
```

### 3.2 기능별 상세

#### A. 랭킹 시스템
- **종합 랭킹** (/rankings)
  - 가중 점수: 방문수(40%) + 평점(30%) + 리뷰수(20%) + 북마크수(10%)
  - 전체 TOP 100
  - 주간/월간 변동 (↑↓ 순위 변동 표시)
- **카테고리별 랭킹** (/rankings/[category])
  - 텍스트 생성 TOP 10, 이미지 생성 TOP 10 등
- **주간 트렌딩** (/trending)
  - 이번 주 급상승 서비스 TOP 10
  - 신규 등록 서비스 하이라이트
  - 무료 쿼터 변경 알림 (예: "Claude 무료 사용량 늘었습니다")

#### B. 직군별 AI 추천
- **직군 목록** (/jobs)

| 직군 | 설명 | 추천 카테고리 예시 |
|------|------|------------------|
| AI 개발자 | 코딩, 모델 학습, 디버깅 | 코딩, 데이터 분석 |
| UI/UX 디자이너 | 와이어프레임, 프로토타입 | 이미지, 텍스트 |
| 그래픽 디자이너 | 로고, 일러스트, 포스터 | 이미지 생성 |
| 마케터 | 카피라이팅, SNS, 광고 | 텍스트, 이미지, 데이터 |
| 영상 크리에이터 | 유튜브, 숏폼, 편집 | 영상, 음악, 이미지 |
| 작가/블로거 | 글쓰기, 블로그, 번역 | 텍스트, 번역 |
| 데이터 분석가 | 시각화, 통계, 보고서 | 데이터, 텍스트 |
| 사업가/창업자 | 사업 계획, 프레젠테이션 | 텍스트, 데이터 |
| 음악가/작곡가 | 작곡, 편곡, 효과음 | 음악 생성 |
| PM/기획자 | 기획서, 회의록, 일정 관리 | 텍스트, 데이터 |

- **직군 상세 페이지** (/jobs/[slug])
  - 해당 직군 소개
  - 추천 AI 툴킷 (필수 AI + 보조 AI)
  - 해당 직군 사용자들의 리뷰
  - "이 직군 사람들이 많이 쓰는 AI" 랭킹

#### C. 학년별 AI 추천 (교육 특화)
- **교육 메인 페이지** (/education)

| 대상 | 세부 | 추천 초점 |
|------|------|----------|
| 초등학생 | 저학년(1~3), 고학년(4~6) | 안전한 AI, 학습 도우미, 창의력 |
| 중학생 | 전체 | 학습 보조, 영어 학습, 코딩 입문 |
| 고등학생 | 전체 | 입시 도우미, 논술, 수학, 코딩 |
| 대학생 | 학부, 대학원 | 논문, 리서치, 코딩, 데이터 분석 |
| 교사/교수 | 초등~대학 | 수업 설계, 과제 생성, 채점, 평가 |

- **학년별 상세 페이지** (/education/[level])
  - 해당 학년 수준에 맞는 AI 추천
  - 안전성/적합성 표시 (특히 초등학생용)
  - 학부모/교사 가이드
  - 활용 사례 및 팁

#### D. AI 뉴스 & 트렌드
- **뉴스 메인** (/news)
  - 최신 AI 뉴스 피드 (카드형 리스트)
  - 카테고리별 필터 (서비스 업데이트, 신규 출시, 업계 동향, 가격 변경)
  - 주간 핫 뉴스 TOP 5
- **뉴스 상세** → 요약 + 원문 링크
- **메인 페이지 노출** → 최신 뉴스 3건 위젯

#### E. 커뮤니티 & 사용자 참여

##### E-1. 리뷰 시스템 (강화)
- **종합 리뷰**: 별점(1~5) + 텍스트
- **기능별 세부 평가**: 각 서비스에 대해 세부 항목 평가
  - UI 편의성 (1~5)
  - 결과물 품질 (1~5)
  - 속도/응답 시간 (1~5)
  - 가성비 (1~5)
  - 한국어 지원 품질 (1~5)
- **리뷰 좋아요**: 도움이 된 리뷰에 투표
- **리뷰 정렬**: 최신순, 평점순, 도움순

##### E-2. 댓글/토론
- 각 서비스 상세 페이지에 댓글 스레드
- 댓글에 대한 답글 (1단계 대댓글)
- 좋아요/신고 기능

##### E-3. 사용자 컬렉션
- "나만의 AI 툴킷" 만들기
- 컬렉션 공개/비공개 설정
- 컬렉션 좋아요 및 공유
- 인기 컬렉션 (/collections)
  - "프리랜서 디자이너의 AI 세트"
  - "대학생 필수 무료 AI 5선"

##### E-4. AI 활용 가이드 & 팁
- 직군별/학년별 AI 활용법 콘텐츠
- 관리자 작성 (Phase 5)
- 사용자 팁 기여 (Phase 6)

##### E-5. 업보트 시스템
- 서비스 카드에 업보트 버튼
- 업보트 수가 랭킹에 반영

#### F. 검색 & 필터
- **자연어 검색**: "보고서 만들어주는 AI" → 관련 서비스 추천
- **필터 조합**: 가격 + 카테고리 + 한국어 + 평점 + 직군
- **정렬**: 인기순, 평점순, 최신순, 무료우선
- **URL 파라미터 기반**: 필터 상태 공유 가능

#### G. 추천 위자드 (강화)
- Step 1: "어떤 작업을 하시나요?" (목적)
- Step 2: "당신의 직군/학년은?" (프로필)
- Step 3: "예산은?" (무료만 / 유료 가능)
- Step 4: "한국어 지원 필요?" (언어)
- 결과: 맞춤 서비스 TOP 3 + 이유 설명

---

## 4. 데이터베이스 스키마 (v2)

### 4.1 ERD 개요

```
categories ──1:N── tools ──1:N── reviews
                     │              │
                     ├──1:N── comments
                     ├──1:N── tool_feature_ratings
                     ├──N:M── bookmarks ──── users
                     ├──N:M── upvotes ────── users
                     └──N:M── collection_items ── collections ── users

job_categories ──1:N── job_tool_recommendations ──N:1── tools
edu_levels ──1:N── edu_tool_recommendations ──N:1── tools
news (독립)
guides (독립)
weekly_rankings (스냅샷)
```

### 4.2 테이블 상세 (신규/변경만)

#### `tools` - AI 서비스 (변경)
기존 필드 유지 + 추가:
| 컬럼 | 타입 | 설명 |
|------|------|------|
| ranking_score | float | 가중 종합 점수 (자동 계산) |
| upvote_count | int | 업보트 수, default: 0 |
| weekly_visit_delta | int | 주간 방문 변동, default: 0 |
| prev_ranking | int | 이전 주 순위, nullable |

#### `job_categories` - 직군 (신규)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| name | text | 직군명 (예: 마케터) |
| slug | text | URL용 (예: marketer) |
| description | text | 직군 설명 |
| icon | text | Lucide 아이콘명 |
| sort_order | int | 노출 순서 |

#### `job_tool_recommendations` - 직군-툴 매핑 (신규)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| job_category_id | uuid | FK → job_categories.id |
| tool_id | uuid | FK → tools.id |
| recommendation_type | text | 'essential' / 'recommended' / 'optional' |
| reason | text | 추천 이유 |
| sort_order | int | 노출 순서 |

#### `edu_levels` - 교육 단계 (신규)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| name | text | 단계명 (예: 초등 저학년) |
| slug | text | URL용 (예: elementary-lower) |
| description | text | 설명 |
| age_range | text | 대상 나이 (예: 7~9세) |
| sort_order | int | 노출 순서 |

#### `edu_tool_recommendations` - 학년-툴 매핑 (신규)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| edu_level_id | uuid | FK → edu_levels.id |
| tool_id | uuid | FK → tools.id |
| safety_rating | text | 'safe' / 'guided' / 'advanced' |
| use_case | text | 활용 사례 (예: 영어 회화 연습) |
| sort_order | int | 노출 순서 |

#### `tool_feature_ratings` - 기능별 세부 평가 (신규)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| tool_id | uuid | FK → tools.id |
| user_id | uuid | FK → auth.users.id |
| ui_score | int | UI 편의성 (1~5) |
| quality_score | int | 결과물 품질 (1~5) |
| speed_score | int | 속도 (1~5) |
| value_score | int | 가성비 (1~5) |
| korean_score | int | 한국어 품질 (1~5) |
| created_at | timestamptz | |
| UNIQUE(tool_id, user_id) | | 사용자당 1회 |

#### `comments` - 댓글 (신규)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| tool_id | uuid | FK → tools.id |
| user_id | uuid | FK → auth.users.id |
| parent_id | uuid | FK → comments.id (대댓글), nullable |
| content | text | 댓글 내용 |
| like_count | int | 좋아요 수, default: 0 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `upvotes` - 업보트 (신규)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| tool_id | uuid | FK → tools.id |
| created_at | timestamptz | |
| UNIQUE(user_id, tool_id) | | |

#### `collections` - 사용자 컬렉션 (신규)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| title | text | 컬렉션 제목 |
| description | text | 설명, nullable |
| is_public | boolean | 공개 여부, default: true |
| like_count | int | 좋아요 수, default: 0 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `collection_items` - 컬렉션 아이템 (신규)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| collection_id | uuid | FK → collections.id |
| tool_id | uuid | FK → tools.id |
| note | text | 메모, nullable |
| sort_order | int | |

#### `guides` - AI 활용 가이드 (신규)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| title | text | 가이드 제목 |
| slug | text | URL용 |
| content | text | 마크다운 본문 |
| category | text | 'job' / 'education' / 'tip' / 'news' |
| target_job_id | uuid | FK → job_categories.id, nullable |
| target_edu_id | uuid | FK → edu_levels.id, nullable |
| thumbnail_url | text | 썸네일, nullable |
| view_count | int | 조회 수, default: 0 |
| published_at | timestamptz | |
| created_at | timestamptz | |

#### `weekly_rankings` - 주간 랭킹 스냅샷 (신규)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| tool_id | uuid | FK → tools.id |
| week_start | date | 주 시작일 |
| ranking | int | 해당 주 순위 |
| ranking_score | float | 해당 주 점수 |
| visit_count | int | 해당 주 방문 수 |

#### `news` - AI 뉴스 (변경)
기존 필드 + 추가:
| 컬럼 | 타입 | 설명 |
|------|------|------|
| category | text | 'update' / 'launch' / 'industry' / 'pricing' |
| related_tool_id | uuid | 관련 서비스 FK, nullable |
| view_count | int | 조회 수, default: 0 |

---

## 5. 개발 단계 (Phases) - v2

### Phase 1: 프로젝트 세팅 및 메인 UI ✅ (완료)
기존 유지

### Phase 2: DB 연동 + 상세 페이지 + 랭킹 + 직군/학년
**목표**: Supabase 연동, 서비스 상세, 랭킹, 직군/학년별 추천

- Supabase 연결 및 전체 스키마 구축
- 서비스 상세 페이지 (/tools/[slug])
- **종합 랭킹 페이지** (/rankings)
- **카테고리별 랭킹** (/rankings/[category])
- **직군별 추천 페이지** (/jobs, /jobs/[slug])
- **학년별 추천 페이지** (/education, /education/[level])
- 랭킹 스코어 자동 계산 로직

### Phase 3: 검색 + 필터 + 추천 위자드
**목표**: 탐색 시스템 완성

- 검색 API + 검색 결과 페이지
- 필터 시스템 (가격, 카테고리, 한국어, 직군, 학년)
- 추천 위자드 (4단계)
- URL 쿼리 파라미터 동기화

### Phase 4: 인증 + 리뷰 + 댓글 + 북마크 + 업보트
**목표**: 커뮤니티 기능 완성

- Supabase Auth (Google, GitHub, Kakao)
- 종합 리뷰 + 기능별 세부 평가
- 댓글/대댓글 시스템
- 북마크 기능
- 업보트 시스템
- 사용자 프로필 페이지

### Phase 5: 뉴스 + 컬렉션 + 가이드 + 관리자
**목표**: 콘텐츠 + 운영 도구

- AI 뉴스 섹션 (CRUD + 메인 위젯)
- 사용자 컬렉션 (만들기, 공유, 좋아요)
- AI 활용 가이드 (직군별/학년별)
- 관리자 대시보드
- 주간 트렌딩 페이지

### Phase 6: SEO + PWA + 성능 최적화
**목표**: 앱 전환 + 검색 최적화 + 성능

- PWA 설정 (next-pwa, manifest, service worker)
- 앱 설치 유도 배너
- SEO 완성 (메타, 사이트맵, JSON-LD)
- 성능 최적화 (ISR, 이미지, 번들)
- Lighthouse 전 항목 90+
- 뉴스레터 구독 기능

---

## 6. 페이지 구조 (Sitemap)

```
/ (홈)
├── /rankings                    종합 랭킹
│   └── /rankings/[category]     카테고리별 랭킹
├── /trending                    주간 트렌딩
├── /tools/[slug]                서비스 상세
├── /category/[slug]             카테고리 페이지
├── /jobs                        직군 목록
│   └── /jobs/[slug]             직군별 AI 추천
├── /education                   학년별 AI 추천
│   └── /education/[level]       학년 상세
├── /search                      검색 결과
├── /recommend                   추천 위자드
├── /news                        AI 뉴스
├── /guides                      AI 활용 가이드
│   └── /guides/[slug]           가이드 상세
├── /collections                 인기 컬렉션
│   └── /collections/[id]        컬렉션 상세
├── /bookmarks                   내 북마크
├── /profile                     내 프로필
│   ├── /profile/reviews         내 리뷰
│   └── /profile/collections     내 컬렉션
├── /auth/login                  로그인
├── /auth/callback               OAuth 콜백
└── /admin                       관리자
    ├── /admin/tools             서비스 관리
    ├── /admin/news              뉴스 관리
    ├── /admin/guides            가이드 관리
    ├── /admin/jobs              직군 관리
    └── /admin/education         학년 관리
```

---

## 7. UI/UX 핵심 원칙

### 7.1 디자인 원칙
- **2클릭 규칙**: 원하는 AI까지 최대 2번의 클릭으로 도달
- **모바일 퍼스트**: 앱으로 전환을 고려한 터치 친화적 UI
- **무료 정보 강조**: free_quota_detail은 항상 가장 눈에 띄는 위치
- **네비게이션 다양화**: 목적/직군/학년/랭킹/검색 5가지 진입점
- **커뮤니티 활성화**: 리뷰, 댓글, 컬렉션을 통한 사용자 참여 유도

### 7.2 모바일 앱 전환 고려사항
- 하단 탭 바 네비게이션 (홈, 랭킹, 검색, 뉴스, MY)
- 카드형 UI → 터치 스와이프 친화적
- PWA → 홈 화면 추가 → 앱처럼 사용
- 푸시 알림 (신규 서비스, 뉴스, 관심 서비스 업데이트)

### 7.3 색상 가이드라인
- Primary: #3B82F6 (Blue) - 신뢰, 기술
- Accent: #10B981 (Emerald) - 무료, 접근성
- Warning: #F59E0B (Amber) - 트렌딩, 주의
- Free 뱃지: Emerald 배경
- Freemium 뱃지: Blue 배경
- Paid 뱃지: Gray 배경
- 랭킹 1~3위: Gold/Silver/Bronze

---

## 8. Phase별 완료 기준

| Phase | 완료 기준 |
|-------|----------|
| Phase 1 | ✅ 더미 데이터 기반 메인 페이지 PC/모바일 렌더링 |
| Phase 2 | DB 연동, 상세 페이지, 랭킹, 직군/학년별 추천 동작 |
| Phase 3 | 검색/필터/위자드 모든 경로로 AI 탐색 가능 |
| Phase 4 | 로그인, 리뷰, 기능별 평가, 댓글, 북마크, 업보트 동작 |
| Phase 5 | 뉴스, 컬렉션, 가이드, 관리자 CRUD 동작 |
| Phase 6 | PWA 설치 가능, Lighthouse 전 항목 90+ |

---

## 9. 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| AI 서비스 정보의 빠른 변화 | 데이터 정확성 저하 | 커뮤니티 크라우드소싱 + 관리자 주기적 갱신 |
| 교육 분야 안전성 이슈 | 부적절한 AI 추천 위험 | 안전성 등급(safe/guided/advanced) 도입 |
| 커뮤니티 스팸/악성 리뷰 | 신뢰도 하락 | 리뷰 신고 + 관리자 모더레이션 |
| 콘텐츠 확보 초기 어려움 | 빈 페이지 문제 | 관리자 초기 시드 콘텐츠 대량 생성 |
| 앱 전환 시 UX 일관성 | 사용자 혼란 | 모바일 퍼스트 + PWA 우선 전략 |
