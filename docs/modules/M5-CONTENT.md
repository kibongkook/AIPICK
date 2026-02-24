# M5. 콘텐츠 모듈 (뉴스 / 가이드 / 레시피)

> 담당 경로: `/news`, `/guides`, `/guides/[slug]`, `/recipes`, `/recipes/[slug]`
> 관련 모듈: [M7-ADMIN](./M7-ADMIN.md) (CRUD), [M4-COMMUNITY](./M4-COMMUNITY.md) (커뮤니티 연계)
> 최종 수정일: 2026-02-20

---

## 1. 모듈 개요

AIPICK의 "콘텐츠" 영역. 사용자가 AI를 더 잘 활용할 수 있도록 돕는 3가지 콘텐츠 유형:

| 콘텐츠 | 경로 | 특징 |
|--------|------|------|
| AI 뉴스 | `/news` | 외부 뉴스 링크 + 요약, 크론잡 자동 수집 |
| AI 활용 가이드 | `/guides` | 관리자 작성 마크다운 콘텐츠 |
| AI 레시피 | `/recipes` | 멀티 AI 워크플로우, 로컬 데이터 (`data/recipes.ts`) |

---

## 2. AI 뉴스 (`/news`)

### 2.1 뉴스 카테고리

| category | 표시명 | 예시 |
|---------|--------|------|
| update | 서비스 업데이트 | "Claude 3.7 출시" |
| launch | 신규 출시 | "Sora 공개 베타 시작" |
| industry | 업계 동향 | "OpenAI, 기업가치 300조" |
| pricing | 가격 변경 | "ChatGPT Plus $5 인하" |

### 2.2 뉴스 페이지 구성

```
┌─────────────────────────────────────────┐
│ 카테고리 필터 탭 (전체 | 4개 카테고리)    │
├─────────────────────────────────────────┤
│ [뉴스 카드 목록]                          │
│  썸네일 | 제목 | 요약 | 출처 | 날짜       │
│  관련 AI 서비스 뱃지 (related_tool_id)   │
├─────────────────────────────────────────┤
│ 사이드바: 주간 핫 뉴스 TOP 5             │
│           뉴스레터 구독 폼               │
└─────────────────────────────────────────┘
```

### 2.3 자동 수집 파이프라인

**크론잡**: `/api/cron/news-fetch`
- 외부 RSS/API에서 뉴스 수집
- 관련 AI 도구 자동 매핑 (related_tool_id)
- 중복 제거 후 DB 저장

**보안 이슈**: `CRON_SECRET` 환경변수 미설정 시 공개 접근 가능 → 필수 설정

### 2.4 뉴스 클릭 동작
- 내부 상세 페이지 없음 → 원문 링크로 리다이렉트
- 클릭 시 `view_count` 증가 (별도 API 호출)

### 2.5 성능
- **현재**: Dynamic 렌더링 (매 요청)
- **권장**: ISR `revalidate = 1800` (30분)

---

## 3. AI 활용 가이드 (`/guides`)

### 3.1 가이드 카테고리

| category | 대상 | 예시 |
|---------|------|------|
| job | 직군별 | "마케터를 위한 AI 광고 제작법" |
| education | 학년별 | "고등학생 논술 AI 활용법" |
| tip | 일반 팁 | "ChatGPT 프롬프트 작성 10가지 팁" |

### 3.2 가이드 목록 페이지 (`/guides`)
- 카테고리 탭 (직군별 / 학년별 / 팁)
- 카드형 목록 (썸네일, 제목, 카테고리, 조회수)

### 3.3 가이드 상세 페이지 (`/guides/[slug]`)
- 마크다운 렌더링
- 관련 AI 서비스 카드 인라인 삽입
- 조회수 표시
- 관련 직군/학년 페이지 링크

### 3.4 XSS 보안 이슈 (Critical)

**파일**: `app/guides/[slug]/page.tsx`, `app/guides/new/page.tsx`

```typescript
// ❌ 위험: HTML 이스케이핑 없이 사용자 입력 직접 삽입
function applyInline(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g,
    '<strong class="font-semibold">$1</strong>');
}
// dangerouslySetInnerHTML로 렌더링됨
```

**해결**: `marked` + `DOMPurify` 라이브러리 도입 또는 HTML 이스케이핑 적용

---

## 4. AI 레시피 (`/recipes`)

### 4.1 개요
멀티 AI 워크플로우 가이드. 여러 AI 도구를 조합해 복잡한 작업을 완성하는 방법을 단계별로 안내.

**데이터 소스**: `data/recipes.ts` (로컬 파일, 109KB)

### 4.2 레시피 구조

```typescript
interface Recipe {
  slug: string;
  title: string;
  description: string;
  icon: string;          // Lucide 아이콘명 — DynamicIcon에 반드시 등록 필요
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tools: string[];       // 사용 AI 도구 슬러그 배열
  steps: RecipeStep[];
  tags: string[];
}
```

**⚠️ 아이콘 등록 규칙**:
- 레시피에 새 `icon` 필드 추가 시 반드시 `components/ui/DynamicIcon.tsx`의 `ICON_MAP`에 등록
- 등록 안 하면 빌드 에러 또는 아이콘 미표시

### 4.3 레시피 카테고리

| 카테고리 | 예시 |
|---------|------|
| music | AI로 음악 앨범 제작하기 |
| video | AI로 유튜브 영상 제작하기 |
| image | AI로 SNS 이미지 만들기 |
| design | AI로 브랜드 아이덴티티 구축 |
| writing | AI로 전자책 쓰기 |
| marketing | AI로 마케팅 캠페인 기획 |

### 4.4 레시피 페이지 구성

```
레시피 목록 (/recipes)
├── 카테고리 필터
├── 난이도 필터 (easy/medium/hard)
└── 레시피 카드 그리드

레시피 상세 (/recipes/[slug])
├── 헤더 (제목, 설명, 난이도, 사용 도구 목록)
├── 단계별 가이드 (Step 1, 2, 3...)
│   └── 각 스텝에 사용 도구 카드 인라인
├── 관련 커뮤니티 섹션 (M4-COMMUNITY 연계)
└── 관련 레시피 캐러셀
```

### 4.5 커뮤니티 연계
레시피 페이지 → `/community?tags=[도구1,도구2]` OR 필터로 관련 커뮤니티 글 표시

---

## 5. 뉴스레터 구독

**컴포넌트**: `components/newsletter/NewsletterForm.tsx`

| 배치 위치 | 설명 |
|----------|------|
| 메인 페이지 하단 | "AI 소식 뉴스레터" |
| 뉴스 페이지 사이드바 | 뉴스 페이지 연계 |

**현재 상태**: localStorage 기반 데모 저장 (Supabase subscribers 테이블 + Resend 연동 예정)

---

## 6. DB 스키마 요약

### news 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| title | text | 뉴스 제목 |
| summary | text | 요약 |
| source_url | text | 원문 링크 |
| thumbnail_url | text | 썸네일 |
| category | text | update/launch/industry/pricing |
| related_tool_id | UUID | 관련 AI 도구 (nullable) |
| view_count | int | 조회수 |
| published_at | timestamptz | |

### guides 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| title | text | 가이드 제목 |
| slug | text | URL |
| content | text | 마크다운 본문 |
| category | text | job/education/tip |
| target_job_id | UUID | 관련 직군 (nullable) |
| target_edu_id | UUID | 관련 학년 (nullable) |
| view_count | int | 조회수 |
| published_at | timestamptz | |

→ 전체 스키마: [DB-SCHEMA.md](../DB-SCHEMA.md)

---

## 7. 관련 컴포넌트

| 컴포넌트 | 파일 | 역할 |
|---------|------|------|
| 뉴스 페이지 | `app/news/page.tsx` | 뉴스 목록 |
| 뉴스 카드 | `components/news/NewsCard.tsx` | 개별 뉴스 |
| 가이드 목록 | `app/guides/page.tsx` | 가이드 목록 |
| 가이드 상세 | `app/guides/[slug]/page.tsx` | 마크다운 렌더링 |
| 가이드 작성 | `app/guides/new/page.tsx` | 관리자 작성 |
| 레시피 목록 | `app/recipes/page.tsx` | 레시피 그리드 |
| 레시피 캐러셀 | `components/home/RecipeCarousel.tsx` | 홈 레시피 표시 |
| 뉴스레터 | `components/newsletter/NewsletterForm.tsx` | 구독 폼 |

---

## 8. 미결 이슈 / 개선 포인트

| 이슈 | 우선순위 | 메모 |
|------|---------|------|
| **XSS 취약점** (guides 마크다운) | Critical | marked+DOMPurify 도입 시급 |
| 뉴스 페이지 ISR 미적용 | High | `revalidate = 1800` |
| 뉴스레터 Resend 연동 | Medium | 배포 후 진행 |
| 가이드 사용자 기여 | Low | Phase 6 이후 |
| 레시피 DB 이관 | Low | 현재 로컬 파일 → 추후 Supabase 고려 |
