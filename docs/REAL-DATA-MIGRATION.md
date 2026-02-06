# AIPICK 실제 데이터 전환 가이드

> 더미 데이터 기반 → 실제 프로덕션 데이터 전환 과정을 기록합니다.
> 각 Step 완료 시 업데이트됩니다.

---

## 전체 진행 현황

| Step | 작업 | 상태 | 커밋 |
|------|------|------|------|
| 1 | 실제 AI 도구 119개 데이터 확장 | ✅ 완료 | `fcf20e3` |
| 2 | 직군별/학년별 추천 105+79개 매핑 | ✅ 완료 | `4ceb2c8` |
| 3 | AI 뉴스 15건 + RSS 자동 수집 | ⏳ 뉴스 15건 완료, RSS API 미구현 |
| 4 | Supabase 백엔드 연동 (async 리팩터링) | ✅ 완료 | `2f29471` |
| 5 | 사용자 인증 (OAuth) 실제 연동 | 🔜 대기 |
| 6 | 리뷰/평점 백엔드 | 🔜 대기 |
| 7 | 댓글/북마크/업보트 백엔드 | 🔜 대기 |
| 8 | 컬렉션/가이드 사용자 생성 | 🔜 대기 |
| 9 | 관리자 대시보드 풀기능 | 🔜 대기 |
| 10 | 외부 데이터 자동 수집 파이프라인 | 🔜 대기 |

---

## Step 1: 실제 AI 도구 데이터 대규모 확장

### 변경 내용
- `data/seed.json`: 26개 → **119개** 실제 AI 도구
- 9개 카테고리 (만능 AI 신설 포함) 균형 분포
- 모든 도구에 실제 URL, 정확한 가격, 무료 사용량 정보 포함

### 카테고리별 도구 수
| 카테고리 | 도구 수 |
|----------|---------|
| 만능 AI | 13 |
| 텍스트 생성 | 15 |
| 이미지 생성 | 13 |
| 영상 편집 | 16 |
| 코딩 도구 | 15 |
| 음악 생성 | 9 |
| 데이터 분석 | 13 |
| 번역 | 8 |
| 기타 | 17 |

### 추가 데이터
- 뉴스: 5건 → 15건 (실제 AI 업계 이슈 기반)
- 컬렉션: 4개 → 8개
- 교육 단계: 6개 → 9개 (학부모/학원강사/코딩강사 추가)

### 도구 데이터 필드
```typescript
{
  id: string           // UUID 형식
  name: string         // 서비스명
  slug: string         // URL용 slug
  description: string  // 한국어 한줄 설명
  category_id: string  // 카테고리 FK
  url: string          // 실제 서비스 URL
  pricing_type: 'Free' | 'Freemium' | 'Paid'
  free_quota_detail: string  // 무료 사용량 상세 (한국어)
  monthly_price: number | null
  rating_avg: number   // 1.0-5.0
  review_count: number
  visit_count: number
  tags: string[]       // 한국어 태그
  is_editor_pick: boolean
  supports_korean: boolean
  pros: string[]       // 장점 (한국어)
  cons: string[]       // 단점 (한국어)
  ranking_score: number  // 0-100 (40% 방문 + 30% 평점 + 20% 리뷰 + 10% 업보트)
  weekly_visit_delta: number  // 주간 방문 변동
}
```

---

## Step 2: 직군별/학년별 추천 데이터 고도화

### 변경 내용
- 직군별 추천: 59개 → **105개** (10개 직군 × 평균 10.5개)
- 교육별 추천: 46개 → **79개** (9개 교육단계)

### 직군별 추천 커버리지
| 직군 | 추천 도구 수 |
|------|-------------|
| AI 개발자 | 12 |
| UI/UX 디자이너 | 9 |
| 그래픽 디자이너 | 10 |
| 마케터 | 12 |
| 영상 크리에이터 | 11 |
| 작가/블로거 | 11 |
| 데이터 분석가 | 10 |
| 사업가/창업자 | 11 |
| 음악가/작곡가 | 7 |
| PM/기획자 | 12 |

### 교육단계별 추천 커버리지
| 교육단계 | 추천 도구 수 |
|----------|-------------|
| 초등 저학년 | 4 |
| 초등 고학년 | 7 |
| 중학생 | 10 |
| 고등학생 | 12 |
| 대학생 | 17 |
| 교사/교수 | 13 |
| 학부모 | 5 |
| 학원 강사 | 5 |
| 코딩 강사 | 6 |

### 추천 등급 체계
- **essential (필수)**: 해당 직군에서 반드시 알아야 할 도구
- **recommended (추천)**: 생산성을 크게 향상시키는 도구
- **optional (선택)**: 상황에 따라 유용한 도구

### 안전 등급 체계 (교육)
- **safe (안전)**: 학생이 자유롭게 사용 가능
- **guided (지도 필요)**: 교사/보호자 지도 하에 사용
- **advanced (고급)**: 성인/고학년 대상

---

## Step 4: Supabase 백엔드 연동 (async 리팩터링)

### 변경 내용
- `lib/supabase/queries.ts`: 모든 28개 함수를 async로 전환
- Supabase 설정 시 실제 DB 사용, 미설정 시 seed.json 자동 폴백
- 동적 임포트(`await import()`)로 서버 전용 모듈이 클라이언트 번들에 포함되는 것 방지

### 수정 파일 (27개)
- **핵심**: `lib/supabase/queries.ts` (697줄, 완전 재작성)
- **Server Components** (22개 페이지): async/await 적용
- **Client Components** (3개): API 라우트 전환
  - `Wizard.tsx` → `/api/search` 호출
  - `bookmarks/page.tsx` → `/api/tools` 호출
  - `profile/page.tsx` → `/api/tools` 호출
- **신규**: `app/api/tools/route.ts` (도구 목록 API)

### 아키텍처 패턴
```
┌─────────────────┐     ┌──────────────┐
│ Server Component │────▶│ queries.ts   │
│ (async/await)    │     │ (async)      │
└─────────────────┘     │              │
                         │ Supabase 설정?│
┌─────────────────┐     │  ├─ Yes → DB  │
│ Client Component │──┐  │  └─ No → Seed│
│ (fetch API)      │  │  └──────────────┘
└─────────────────┘  │
                      │  ┌──────────────┐
                      └─▶│ API Routes   │
                         │ (/api/*)     │
                         └──────────────┘
```

### Supabase 활성화 방법
`.env.local` 파일에 실제 Supabase 자격증명 추가:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```
→ 자격증명 추가만으로 자동으로 실제 DB 사용으로 전환됨

---

## 새 도구 추가 방법

### seed.json에 직접 추가
1. `data/seed.json`의 `tools` 배열에 새 도구 객체 추가
2. UUID 패턴: `550e8400-e29b-41d4-a716-446655440XXX`
3. 필수 필드 모두 포함 (위 데이터 필드 참조)
4. 해당 직군/교육 추천 매핑도 함께 추가

### Supabase 연동 후 (Step 4 이후)
1. 관리자 대시보드(`/admin/tools`)에서 추가/수정/삭제
2. API를 통한 자동 수집 파이프라인 활용

---

## 외부 데이터 소스 (Step 10 참조)

### 무료 API
- **GitHub API**: 오픈소스 AI 도구 별점/포크 (5000 req/hr)
- **HackerNews API**: AI 뉴스 자동 수집 (무제한)
- **Product Hunt API**: AI 신규 출시 정보 (450 req/15min, 상업 승인 필요)

### 뉴스 RSS 피드
- TechCrunch AI: `https://techcrunch.com/category/artificial-intelligence/feed/`
- The Verge AI: `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml`
- AI News (한국): `https://www.aitimes.kr/rss`

### 한국 특화 소스
- AI-Hub (aihub.or.kr): 한국 정부 AI 플랫폼
- NAVER SearchAdvisor: 한국 검색 트렌드
- Korea AI (korea.ai): 한국 AI 생태계

---

## 환경변수 체크리스트

```env
# Supabase (Step 4)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin
ADMIN_EMAILS=admin@aipick.kr

# OAuth (Step 5)
# Google, GitHub, Kakao - Supabase Dashboard에서 설정
```
