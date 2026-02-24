# M1. AI 찾기 (Discovery) 모듈

> 담당 경로: `/discover`, `/search`, `/category/[slug]`, `/compare/[...slugs]`
> 관련 모듈: [M2-RANKING](./M2-RANKING.md), [M3-CURATION](./M3-CURATION.md), [M5-CONTENT](./M5-CONTENT.md)
> 최종 수정일: 2026-02-20
> **v2.0 — 결과물 갤러리 방식으로 전면 재설계**

---

## 1. 핵심 컨셉 전환

### 기존 방식의 문제
```
기존: AI 목록 → 설명 읽기 → "써볼까?"
      (도구 중심 — 사용자가 직접 상상해야 함)
```

### 새 방식: 결과물 갤러리
```
신규: 결과물 보기 → "저거 나도 하고 싶다" → "어떤 AI야?"
      (결과물 중심 — 욕망이 먼저, AI는 나중)
```

### 왜 결과물 갤러리인가
- AI를 모르는 사람도 "저 이미지 어떻게 만들었지?"는 이해함
- 설명을 읽을 필요 없이 스크롤만 해도 가능성을 발견함
- 기존 경쟁 서비스(Futurepedia, There's an AI for That) 전부 AI 목록 나열 방식 → 차별점
- `sample_output` + `sample_output_prompt` 데이터가 이미 216개 도구에 존재

---

## 2. /discover 페이지 구조

### 2.1 전체 레이아웃

```
┌─────────────────────────────────────────────────────┐
│  헤더: "AI로 이런 게 가능해요"                        │
│  서브: "결과물을 보고 마음에 드는 AI를 찾아보세요"      │
├─────────────────────────────────────────────────────┤
│  [전체] [글쓰기] [이미지] [코드] [음악] [데이터] [발표]│
│                              ○ 무료만 보기            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [카드] [카드] [카드]   ← Masonry Grid (Pinterest식) │
│  [카드] [  큰 카드  ]                               │
│  [  큰 카드  ] [카드]                               │
│                                                     │
│  (무한 스크롤 또는 "더 보기" 버튼)                   │
├─────────────────────────────────────────────────────┤
│  더 구체적으로 찾고 싶다면 →                          │
│  [직군별 추천] [학년별 추천] [필터 검색]              │
└─────────────────────────────────────────────────────┘
```

### 2.2 갤러리 카드 설계

#### 기본 상태

```
┌─────────────────────────┐
│                         │
│   [결과물 미리보기]      │  ← 콘텐츠 타입별 렌더링
│                         │     텍스트: 타이포 강조
│                         │     이미지: img 태그
│                         │     코드: 신택스 하이라이트
│  ─────────────────────  │
│  [로고] Claude    FREE  │  ← AI 정보
│  ✍️ 글쓰기 · 약 30초     │  ← 카테고리 · 소요 시간
└─────────────────────────┘
```

#### hover 상태

```
┌─────────────────────────┐
│  [결과물 (흐림 처리)]    │
│                         │
│  💬 사용한 프롬프트:      │  ← 핵심: "이렇게 물어봤어요"
│  "분기 보고서를 요약해   │
│   줘. 핵심만 3줄로."     │
│                         │
│  [AI 정보 보기 →]        │
│  [레시피로 배우기 →]     │
└─────────────────────────┘
```

#### 클릭 시 — 모달

```
┌──────────────────────────────────────────────┐
│  ✕                                           │
│                                              │
│  [전체 결과물 표시]                            │
│                                              │
│  ────────────────────────────────────────    │
│  🤖 Claude  ★4.8   ▲12위   [FREE 뱃지]        │
│  "무료로 무제한에 가깝게 사용 가능"             │
│                                              │
│  💬 프롬프트:                                 │
│  "마케팅 캠페인 기획서를 작성해줘.             │
│   타겟: 20대 여성, 예산: 500만원"             │
│                                              │
│  🏷️ 태그: 글쓰기 · 기획 · 마케팅               │
│                                              │
│  [AI 상세 보기]  [관련 레시피]  [바로 사용 →]  │
└──────────────────────────────────────────────┘
```

---

## 3. 콘텐츠 타입별 카드 렌더링

| 타입 | 결과물 표시 방식 | 예시 |
|------|----------------|------|
| 글쓰기 | 텍스트 카드 (일부 발췌, 타이포 강조) | 블로그 포스트, 카피, 이메일 |
| 이미지 | `<img>` 직접 표시 | 일러스트, 로고, 사진 |
| 코드 | 신택스 하이라이트 코드 블록 | 함수, 앱, 스크립트 |
| 데이터 | 차트/표 캡처 이미지 or SVG | 시각화, 대시보드 |
| 발표 | 슬라이드 썸네일 이미지 | PPT, 프레젠테이션 |
| 음악 | 파형 이미지 + 재생 버튼 (향후) | 루프, 곡 |

---

## 4. 카드 데이터 소스

### 4.1 기존 데이터 활용 (즉시 사용 가능)

`data/seed.json`의 `sample_output` 필드 → 갤러리 카드로 변환

```typescript
interface GalleryCard {
  toolSlug: string;          // tools.slug
  toolName: string;          // tools.name
  toolLogo: string;          // tools.logo_url
  pricingType: string;       // tools.pricing_type
  category: string;          // tools.category_id → display
  sampleOutput: string;      // tools.sample_output
  samplePrompt: string;      // tools.sample_output_prompt
  outputType: OutputType;    // 카드 렌더링 타입 결정
  rankingScore: number;      // 정렬 기준
}

type OutputType = 'text' | 'image' | 'code' | 'data' | 'presentation' | 'music';
```

### 4.2 카드 우선순위 정렬

```
1순위: 이미지 타입 (시각적 임팩트 최대)
2순위: ranking_score 높은 순
3순위: 무료 서비스 우선 (접근성)
4순위: sample_output 길이 (너무 짧으면 제외)
```

---

## 5. 필터 탭 설계

### 5.1 카테고리 탭

| 탭 | 포함 카테고리 slug |
|----|-----------------|
| 전체 | — |
| ✍️ 글쓰기 | writing, chat |
| 🎨 이미지 | design |
| 💻 코드 | coding |
| 🎵 음악 | music |
| 📊 데이터 | data |
| 🎬 영상 | video |
| 📑 발표 | presentation |
| 🌐 번역 | translation |

### 5.2 "무료만 보기" 토글

- `pricingType === 'free' || pricingType === 'freemium'`
- 기본값: OFF (전체 표시)
- URL: `?free=true` 로 상태 공유

---

## 6. 탐색 레이어 구조

갤러리가 Layer 1, 나머지는 보조 역할.

```
Layer 1 — 즉각 탐색 (0클릭, 스크롤만)
  → 결과물 갤러리
  → "오, 저런 게 가능하구나" 발견의 순간

Layer 2 — 가이드 탐색 (3클릭)
  → 카테고리 탭 클릭
  → 무료만 토글
  → 카드 클릭 → 모달

Layer 3 — 구체적 탐색 (하단 링크)
  → 직군별 추천 → /jobs
  → 학년별 추천 → /education
  → 필터 검색   → /search
```

---

## 7. /search 페이지 (보조 탐색)

갤러리에서 원하는 걸 못 찾았을 때 진입.

### 7.1 검색 방식

| 방식 | 구현 | 설명 |
|------|------|------|
| 키워드 | Supabase `ilike` | 서비스명, 설명, 태그 |
| 자동완성 | SearchBar 드롭다운 (300ms 디바운스) | 인기 검색어 + 매칭 |
| URL 공유 | `?q=...&pricing=free&sort=popular` | 필터 상태 유지 |

### 7.2 필터 시스템

| 필터 | 타입 | 값 |
|------|------|-----|
| 가격 | 체크박스 (다중) | Free / Freemium / Paid |
| 카테고리 | 체크박스 (다중) | 12개 |
| 한국어 지원 | 토글 | true / false |
| 최소 평점 | 선택 | 4.0+ / 4.5+ |
| 직군 필터 | 선택 | 10개 직군 |
| 학년 필터 | 선택 | 6단계 |

### 7.3 정렬

| 정렬 | 기준 |
|------|------|
| 인기순 | `ranking_score` DESC |
| 평점순 | `rating_avg` DESC |
| 최신순 | `created_at` DESC |
| 무료우선 | free 먼저, 나머지 `ranking_score` |

---

## 8. /category/[slug] — 목적별 카테고리

카테고리 내 갤러리 뷰. `/discover?category=[slug]`의 심화 버전.

```
카테고리 헤더 (이름, 설명, 아이콘)
├── 해당 카테고리 결과물 갤러리 (위와 동일한 카드)
├── TOP 3 강조 카드 (금/은/동 — M2 랭킹 연계)
└── 필터 사이드바 (검색 모듈 공유)
```

**정적 생성**: `generateStaticParams()` → 12개 카테고리 빌드 시 생성

---

## 9. /compare/[...slugs] — AI 비교

### 9.1 비교 항목

| 항목 | 데이터 |
|------|--------|
| 기본 정보 | 이름, 카테고리, 가격, 무료 사용량 |
| 결과물 예시 | `sample_output` 나란히 비교 |
| 평점 | 종합 + 기능별 레이더 차트 |
| 랭킹 | hybrid_score, 순위 |
| 한국어 | 지원 여부 + 품질 |

### 9.2 인기 비교 쌍 (정적 생성 대상)

- `chatgpt` vs `claude`
- `midjourney` vs `dalle`
- `notion-ai` vs `microsoft-copilot`

---

## 10. 관련 컴포넌트

| 컴포넌트 | 파일 | 현재 상태 |
|---------|------|---------|
| AI 찾기 페이지 | `app/discover/page.tsx` | ⚠️ 기존 위자드 방식 → 갤러리로 교체 필요 |
| 갤러리 그리드 | `components/discover/OutputGallery.tsx` | ❌ 신규 생성 필요 |
| 갤러리 카드 | `components/discover/GalleryCard.tsx` | ❌ 신규 생성 필요 |
| 결과물 모달 | `components/discover/OutputModal.tsx` | ❌ 신규 생성 필요 |
| 기존 위자드 | `components/recommend/Wizard.tsx` | 하단 보조로 이동 또는 /recommend 전용으로 |
| 검색 바 | `components/search/SearchBar.tsx` | ✅ 재사용 |
| 필터 사이드바 | `components/search/FilterSidebar.tsx` | ✅ /search에서 재사용 |

---

## 11. 구현 우선순위

| 우선순위 | 작업 | 설명 |
|---------|------|------|
| P0 | `GalleryCard` 컴포넌트 | 카드 UI (기본 + hover 상태) |
| P0 | `OutputGallery` 컴포넌트 | Masonry 그리드 + 카테고리 탭 |
| P0 | `/discover` 페이지 교체 | 기존 위자드 제거, 갤러리 삽입 |
| P1 | `OutputModal` 컴포넌트 | 클릭 시 상세 모달 |
| P1 | 카테고리 탭 필터 | 탭 클릭 → 갤러리 필터링 |
| P1 | 무료만 토글 | URL 파라미터 연동 |
| P2 | Masonry 레이아웃 | 고정 그리드 → Masonry 전환 |
| P2 | hover 프롬프트 표시 | 프롬프트 오버레이 |

---

## 12. 데이터 준비 현황

| 필드 | 상태 | 비고 |
|------|------|------|
| `sample_output` | ✅ 216개 완료 | `data/seed.json` |
| `sample_output_prompt` | ✅ 216개 완료 | `data/seed.json` |
| `logo_url` | ✅ 216개 완료 | CDN or Google Favicon |
| `pricing_type` | ✅ 216개 완료 | |
| `outputType` 분류 | ❌ 필요 | category → outputType 매핑 로직 작성 |
| 이미지 결과물 | ❌ 향후 | 현재 텍스트 위주, 이미지 확보 필요 |

---

## 13. 미결 이슈 / 개선 포인트

| 이슈 | 우선순위 | 메모 |
|------|---------|------|
| sample_output이 전부 텍스트 | High | 이미지 결과물 카드 추가 시 훨씬 강렬해짐 |
| Masonry 레이아웃 라이브러리 | Medium | CSS columns 방식 or react-masonry-css |
| 기존 위자드 처리 | Medium | /discover에서 제거, /recommend 전용으로 분리 |
| 갤러리 카드 수 최적화 | Medium | 초기 20개 → 스크롤 시 추가 로드 |
| 모바일 갤러리 레이아웃 | Medium | 모바일은 1열 or 2열 |
| 공유/저장 기능 | Low | 마음에 드는 결과물 저장 (로그인) |
