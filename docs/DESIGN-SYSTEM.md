# AIPICK 디자인 시스템

> 모든 UI 구현 시 이 문서를 기준으로 삼는다.
> 새 컴포넌트 또는 기능 추가 시 이 문서를 먼저 참고하고, 이 문서에 없는 패턴을 도입할 경우 여기에 추가한다.
> 최종 수정일: 2026-02-20 (필터 탭 표준 + 페이지 패딩 + sticky 바 max-w-7xl 정렬 + 하드코딩 제거 규칙)

---

## 1. 타이포그래피

### 1.1 폰트 패밀리

```
Pretendard Variable → Pretendard → -apple-system → sans-serif
```
(`globals.css` `--font-sans` 변수로 body 전체 적용)

---

### 1.2 폰트 사이즈 계층

| 레벨 | 클래스 | px | 사용처 |
|------|--------|----|--------|
| 1 | `text-2xl` | 24px | 페이지 헤더 (`<h1>`) |
| 2 | `text-xl` | 20px | 섹션 헤더 (`<h2>`) |
| 3 | `text-lg` | 18px | 서브 섹션 타이틀 |
| 4 | `text-base` | 16px | 카드 본문 제목, 모달 제목 |
| 5 | `text-sm` | 14px | **기본 본문 텍스트**, 카드 설명, 버튼 |
| 6 | `text-xs` | 12px | **메타 정보**, 배지 라벨, 보조 설명 |

> ❌ 금지: `text-[10px]`, `text-[11px]`, `text-[13px]` 등 임의 픽셀값 사용 금지.
> 반드시 위 6단계 중 하나를 사용한다.

**반응형 예시:**
```tsx
<h1 className="text-2xl font-extrabold sm:text-3xl">
```

---

### 1.3 폰트 무게

| 클래스 | 사용처 |
|--------|--------|
| `font-normal` | 기본 본문 |
| `font-medium` | 약한 강조, 네비게이션 |
| `font-semibold` | 버튼 텍스트, 중요 메타 |
| `font-bold` | 카드 제목, 중간 헤더 |
| `font-extrabold` | 페이지 제목, 큰 숫자 |

---

### 1.4 텍스트 색상

```
주 텍스트:      text-foreground   (#0B1120)
부 텍스트:      text-gray-600
보조 텍스트:    text-gray-400
비활성 텍스트:  text-gray-300
강조/링크:      text-primary      (#4F46E5)
성공:           text-emerald-600
에러:           text-red-500
경고:           text-amber-700
```

---

## 2. 컬러 시스템

### 2.1 CSS 변수 (globals.css)

```css
--color-primary:       #4F46E5   /* 인디고 — 주 브랜드 컬러 */
--color-primary-hover: #4338CA
--color-primary-light: #EEF2FF
--color-primary-glow:  rgba(79, 70, 229, 0.15)
--color-accent:        #06D6A0   /* 에메랄드 — 성공/무료 강조 */
--color-accent-hover:  #05B384
--color-accent-warm:   #F97316   /* 주황 — HOT/트렌드 */
--color-surface:       #F8FAFC
--color-border:        #E2E8F0
--background:          #FAFBFE
--foreground:          #0B1120
```

### 2.2 Tailwind 사용 규칙

- **primary** 계열: `bg-primary`, `text-primary`, `border-primary` 사용 → CSS 변수 자동 참조
- **gray** 계열: `gray-100 / 200 / 300 / 400 / 500 / 600` 범위 사용
- **임의 색상 hex 값** (`bg-[#4F46E5]` 등) 금지 — 반드시 변수/클래스 사용

### 2.3 카테고리 배경 (GalleryCard, CategoryBadge 등)

```
chat / writing   bg-blue-50    border-blue-100
design           bg-purple-50  border-purple-100
video            bg-red-50     border-red-100
music            bg-pink-50    border-pink-100
coding           bg-emerald-50 border-emerald-100
automation       bg-amber-50   border-amber-100
translation      bg-cyan-50    border-cyan-100
data             bg-teal-50    border-teal-100
presentation     bg-rose-50    border-rose-100
marketing        bg-orange-50  border-orange-100
building         bg-violet-50  border-violet-100
```

---

## 3. 레이아웃

### 3.1 페이지 최대 너비

| 용도 | 클래스 | 해당 페이지 |
|------|--------|-----------|
| 그리드/테이블/갤러리 | `max-w-7xl` | discover, rankings, news, recipes목록, search, compare, admin, jobs, education, tools |
| 일반 콘텐츠 | `max-w-5xl` | 홈 |
| 읽기/폼 중심 | `max-w-4xl` | 레시피 상세, 가이드 본문, profile |
| 좁은 폼/모달 | `max-w-lg` / `max-w-xl` | 모달, 폼 |

> **예외 — community (`max-w-4xl`)**: 게시글 피드는 의도적으로 좁게 유지.
> 장문 텍스트 가독성을 위해 Reddit·Discord·Twitter 등 소셜 피드가 모두 좁은 폭을 사용하는 것과 동일한 이유.
> community/*, provocation/* 경로는 `max-w-4xl`을 유지한다.

**항상 `mx-auto`와 함께 사용:**
```tsx
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
```

### 3.2 페이지 패딩

```tsx
// 표준 페이지 래퍼 (모든 섹션 페이지 동일)
<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
```

- **`py-8` (상단 32px, 하단 32px)**: 모든 섹션 페이지 표준 (rankings, recipes, news, discover 등)
- `py-10`, `py-6`, `pt-8 pb-4` 등 변형 사용 금지
- **예외 — discover**: 헤더가 별도 컨테이너이므로 `pt-8`만 사용 (pb는 생략 — mb-8이 gap을 담당)

### 3.3 페이지 헤더 표준 패턴

**모든 주요 섹션 페이지(리스트/그리드 형태)는 아래 패턴을 사용한다.**

```tsx
<div className="mb-8">
  <div className="mb-1 flex items-center gap-2">
    <Icon className="h-7 w-7 text-primary" />
    <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
      페이지 제목
    </h1>
  </div>
  <p className="text-sm text-gray-500">부제목 설명</p>
</div>
```

**규칙:**
- 아이콘: `h-7 w-7 text-primary` (랭킹만 예외: `text-yellow-500`)
- h1: `text-2xl font-extrabold text-foreground sm:text-3xl`
- 부제목: `text-sm text-gray-500`
- 정렬: **좌측 정렬** (중앙 정렬 금지)
- 아이콘은 h1 밖 flex 컨테이너에 배치 (h1 안에 포함 금지)

**페이지별 아이콘 매핑:**

| 페이지 | 아이콘 | 색상 |
|--------|--------|------|
| AI 레시피 (`/recipes`) | `BookOpen` | `text-primary` |
| AI 찾기 (`/discover`) | `Target` | `text-primary` |
| 랭킹 (`/rankings`) | `Trophy` | `text-yellow-500` |
| 뉴스 (`/news`) | `Newspaper` | `text-primary` |
| 직군별 추천 (`/jobs`) | `Briefcase` | `text-primary` |
| 학년별 추천 (`/education`) | `GraduationCap` | `text-primary` |

**예외 페이지 (표준 헤더 미적용):**
- `/search`: 검색창이 헤더 역할 대체
- `/community`, `/provocation`: 소셜 피드 — 자체 헤더 스타일 유지
- `/jobs`, `/education` 선택 화면: 중앙 정렬 배경박스 아이콘 패턴 유지 가능 (선택 위자드 UI)

---

### 3.4 필터 탭 표준 패턴

**모든 섹션 페이지의 카테고리/필터 탭은 아래 스타일을 사용한다. (랭킹 기준)**

```tsx
{/* 탭 컨테이너 */}
<div className="mb-6 flex flex-wrap gap-2">
  <button
    className="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors bg-primary text-white"
  >
    전체
  </button>
  <button
    className="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
  >
    카테고리명
  </button>
</div>
```

**규칙:**
- 패딩: `px-4 py-2`
- 폰트: `text-sm font-medium`
- 모양: `rounded-full`
- 활성: `bg-primary text-white`
- 비활성: `bg-gray-100 text-gray-600 hover:bg-gray-200`
- 컨테이너: `flex flex-wrap gap-2 mb-6`
- `shrink-0` 필수 (flex-wrap 환경에서 탭이 찌그러지지 않도록)

### 3.5 Sticky 필터바

```tsx
{/* 외부 wrapper — 전체 너비 */}
<div className="sticky top-14 z-20 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
  {/* 내부 wrapper — 카드 콘텐츠와 가로 정렬 맞춤 */}
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {/* 카테고리 탭 */}
    <div className="flex flex-wrap gap-2 pt-3 pb-2">
      ...
    </div>
    {/* 정렬 옵션 (2차 행, 선택적) */}
    <div className="flex items-center gap-2 pb-3">
      ...
    </div>
  </div>
</div>
```

**규칙:**
- `top-14`: 헤더(56px) 바로 아래
- `z-20`: 카드 위, 모달 아래
- `backdrop-blur-sm`: 스크롤 시 배경 블러
- **내부 콘텐츠는 반드시 `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` 래퍼로 감싸야 한다** → 아래 카드 목록과 가로 기준선 일치
- 카테고리 탭 컨테이너: `flex flex-wrap gap-2` (overflow-x-auto 사용 금지 — 화면 축소 시 wrap으로 처리)
- 현재 적용: `/discover` 만 (카드가 많아 스크롤 중에도 필터 접근 필요)

---

## 4. 간격 시스템

### 4.1 컴포넌트 내부 패딩

| 크기 | 클래스 | 사용처 |
|------|--------|--------|
| 작은 카드 | `p-3` | 작은 배지 컨테이너 |
| 표준 카드 | `p-4` | ServiceCard, CommunityCard |
| 큰 카드 | `p-5` | GalleryCard, RecipeCard, NewsCard |
| 모달 | `px-5 py-4` | 모달 헤더/푸터 |

### 4.2 수직 간격

```
space-y-2   → 카드 내 밀접 요소 (프롬프트-화살표-결과 등)
space-y-3   → 카드 내 일반 요소
space-y-4   → 카드 목록 내 항목
space-y-5   → 1열 카드 목록
space-y-6   → 섹션 내 그룹
space-y-8   → 섹션 간 구분
space-y-10  → 큰 섹션 구분
```

### 4.3 수평 간격

```
gap-1.5  → 아이콘 + 텍스트
gap-2    → 배지 그룹
gap-2.5  → 작은 카드 요소
gap-3    → 탭/버튼 그룹
gap-4    → 그리드 카드
gap-6    → 큰 그리드
```

---

## 5. 카드 패턴

### 5.1 기본 카드 구조

```tsx
// 표준 (대부분의 카드)
<div className="rounded-xl border border-border bg-white ...">

// 강조 카드 (hover 애니메이션 포함)
<div className="rounded-xl border border-border bg-white card-hover ...">

// 큰 카드 (GalleryCard, 상세 영역)
<div className="rounded-2xl border border-gray-100 bg-white shadow-sm ...">
```

> `rounded-xl` (기본) vs `rounded-2xl` (큰/Feature 카드)
> `border-border` (CSS 변수) vs `border-gray-100` (직접 값) — 둘 다 허용

### 5.2 hover 상태

```tsx
// 표준 hover (shadow)
className="... hover:shadow-md transition-shadow"

// 강조 hover (shadow + border)
className="... hover:border-primary/50 hover:shadow-md transition-all"

// card-hover 클래스 (translateY + glow shadow)
// globals.css에 정의됨 — 위로 4px 이동 + 인디고 글로우
className="... card-hover"
```

### 5.3 카테고리별 카드 내부 색상 영역

```tsx
// 결과물/미리보기 영역에만 카테고리 배경 사용
<div className={`rounded-xl border p-4 ${CATEGORY_BG[categorySlug]}`}>
```

---

## 6. 배지 패턴

### 6.1 가격 배지

```tsx
// 항상 rounded-full, text-xs, font-semibold
Free:     bg-emerald-100 text-emerald-700  px-2.5 py-0.5
Freemium: bg-blue-100    text-blue-700     px-2.5 py-0.5
Paid:     bg-gray-100    text-gray-600     px-2.5 py-0.5
```

### 6.2 카테고리/태그 배지

```tsx
// 일반 태그
<span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
  {label}
</span>

// primary 강조 태그
<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
  {label}
</span>
```

### 6.3 상태 배지 (HOT, NEW 등)

```tsx
// HOT
<span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700">
  🔥 HOT
</span>

// NEW
<span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-700">
  NEW
</span>
```

---

## 7. 버튼 패턴

### 7.1 사이즈

| 크기 | 클래스 | 사용처 |
|------|--------|--------|
| XSmall | `px-3 py-1 text-xs` | 정렬 옵션 칩 (discover 내부 sort) |
| Small | `px-3 py-1.5 text-sm` | 보조 버튼, 인라인 액션 |
| **Medium** | **`px-4 py-2 text-sm`** | **카테고리/필터 탭 (표준)**, 일반 버튼 |
| Large | `px-6 py-3 text-base` | CTA 버튼 |
| Full | `w-full py-2.5 text-sm` | 카드 내 CTA |

### 7.2 변형

```tsx
// Primary (CTA)
className="rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90"

// Secondary (테두리)
className="rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-foreground hover:bg-gray-50"

// Ghost (텍스트)
className="text-sm font-medium text-primary hover:underline"

// 카테고리/필터 탭 (활성) ← 모든 섹션 페이지 표준
className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors"

// 카테고리/필터 탭 (비활성)
className="shrink-0 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"

// 정렬 옵션 칩 (활성) ← discover 2차 정렬 전용 (작은 크기 유지)
className="shrink-0 rounded-full border border-primary bg-primary/5 px-3 py-1 text-xs font-medium text-primary"

// 정렬 옵션 칩 (비활성)
className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
```

---

## 8. 아이콘 크기

| 클래스 | 사용처 |
|--------|--------|
| `h-3 w-3` | 인라인 메타 아이콘 |
| `h-3.5 w-3.5` | 배지 내 아이콘, Sparkles 등 |
| `h-4 w-4` | 버튼/네비 아이콘 (표준) |
| `h-5 w-5` | 섹션 헤더 아이콘, 화살표 |
| `h-6 w-6` | 카드 로고 (소형) |
| `h-10 w-10` | 카드 로고 (compact) |
| `h-12 w-12` | 카드 로고 (standard) |

---

## 9. 로고 이미지

```tsx
// compact 카드
<LogoImage className="h-10 w-10 rounded-lg object-contain" />

// standard 카드
<LogoImage className="h-12 w-12 rounded-xl object-contain" />

// 모달/상세
<LogoImage className="h-14 w-14 rounded-xl object-contain" />

// 로고 없을 때 폴백
<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 font-bold text-white">
  {name[0]}
</div>
```

---

## 10. 반응형 브레이크포인트

| 접두사 | 최소 너비 | 사용 패턴 |
|--------|----------|----------|
| (none) | 0px | 모바일 기본 |
| `sm:` | 640px | 2열 전환 |
| `lg:` | 1024px | 3열 전환, 사이드바 등장 |
| `xl:` | 1280px | 4열 전환 (갤러리 등) |

**그리드 표준 패턴:**
```tsx
// 2~3열 그리드
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

// 2~4열 그리드
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

// 텍스트 반응형
text-2xl sm:text-3xl
text-xl sm:text-2xl

// 패딩 반응형
px-4 sm:px-6 lg:px-8
```

---

## 11. 글로벌 유틸리티 클래스 (globals.css)

| 클래스 | 설명 |
|--------|------|
| `.card-hover` | translateY(-4px) + 인디고 글로우 shadow (hover 시) |
| `.hero-gradient` | 다크 인디고 그라데이션 배경 (홈 히어로) |
| `.text-gradient` | 인디고→에메랄드 그라데이션 텍스트 |
| `.glow-border` | hover 시 인디고+에메랄드 테두리 글로우 |
| `.job-card` | 직군 카드 hover (translateY(-2px) + 보라 shadow) |
| `.scroll-snap-x` | 가로 스크롤 스냅 컨테이너 |
| `.scrollbar-hide` | 스크롤바 숨김 (전 브라우저 지원) |
| `.animate-fade-up` | opacity 0→1 + translateY 20→0 |
| `.animate-slide-in` | translateX 20→0 |
| `.animate-count-up` | 숫자 카운터 등장 |
| `.animate-pulse-dot` | 펄스 점 (실시간 표시 등) |
| `.animate-flame` | 불꽃 흔들림 (트렌딩 아이콘) |

---

## 12. 섹션 라벨 패턴

카드 내부 섹션 제목 (`사용한 프롬프트`, `AI 결과물` 등):

```tsx
// 표준 섹션 라벨
<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
  AI 결과물
</p>

// Primary 강조 섹션 라벨
<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
  사용한 프롬프트
</p>
```

> `text-[10px]` 금지 → 반드시 `text-xs` 사용

---

## 13. 모달 패턴

```tsx
{/* 오버레이 */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4"
     onClick={onClose}>
  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

  {/* 모달 본체 */}
  <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
       onClick={(e) => e.stopPropagation()}>

    {/* 헤더 */}
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
      ...
    </div>

    {/* 본문 (스크롤) */}
    <div className="max-h-[55vh] overflow-y-auto p-5">
      ...
    </div>

    {/* 푸터/CTA */}
    <div className="flex gap-2 border-t border-gray-100 px-5 py-4">
      ...
    </div>
  </div>
</div>
```

---

## 14. 빈 상태 (Empty State) 패턴

```tsx
<div className="py-20 text-center">
  <p className="mb-2 text-4xl">🤔</p>
  <p className="text-sm text-gray-400">해당 조건의 결과물이 없어요</p>
  <button
    onClick={onReset}
    className="mt-4 text-sm text-primary hover:underline"
  >
    필터 초기화
  </button>
</div>
```

---

## 15. 체크리스트 — 새 컴포넌트 추가 시

**타이포그래피**
- [ ] 폰트 사이즈는 `text-xs` ~ `text-2xl` 표준 계층만 사용
- [ ] 임의 픽셀값(`text-[10px]`, `text-[13px]`) 사용 안 함

**레이아웃**
- [ ] 섹션 페이지 컨테이너: `mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8` (py-8 고정)
- [ ] `py-10`, `py-6`, `pt-8 pb-4` 등 변형 사용 금지
- [ ] 최대 너비: 용도에 맞는 `max-w-*` + `mx-auto` + `px-4 sm:px-6 lg:px-8`
- [ ] 페이지 헤더: `mb-8` 감싸기 + `mb-1 flex items-center gap-2` + `h-7 w-7` 아이콘 + `text-2xl font-extrabold sm:text-3xl` h1 + `text-sm text-gray-500` 부제목

**필터/탭**
- [ ] 카테고리 필터 탭: `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors` (Medium 크기)
- [ ] 활성 탭: `bg-primary text-white` / 비활성 탭: `bg-gray-100 text-gray-600 hover:bg-gray-200`
- [ ] 탭 컨테이너: `flex flex-wrap gap-2 mb-6`

**카드**
- [ ] 카드 기본 구조: `rounded-xl border border-border bg-white` 또는 `rounded-2xl border border-gray-100 bg-white`
- [ ] 가격 배지: `PRICING_BADGE` 레코드에서 꺼내 쓰기 (직접 스타일 재정의 금지)
- [ ] hover 상태에 반드시 `transition-*` 포함
- [ ] 카드 hover 애니메이션 필요 시: `.card-hover` 글로벌 클래스 활용

**Sticky 필터바**
- [ ] 외부 div: `sticky top-14 z-20 border-b border-gray-100 bg-white/95 backdrop-blur-sm`
- [ ] 내부 래퍼: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` 필수 (카드 목록과 가로 정렬)
- [ ] 탭 컨테이너: `flex flex-wrap gap-2` (`overflow-x-auto` 사용 금지)

**하드코딩 금지**
- [ ] 매직 넘버는 `lib/constants.ts`에 상수로 정의 (`MIN_SAMPLE_OUTPUT_LENGTH`, `HOT_NEWS_COUNT` 등)
- [ ] 페이지/컴포넌트에서 공통으로 쓰는 데이터 배열(`CATEGORY_TABS`, `SORT_OPTIONS` 등)은 constants로 이동
- [ ] 특정 URL 쿼리 키 문자열(`'weekly-best'` 등)도 constants에 정의

**기타**
- [ ] 스크롤 숨김 필요 시: inline style 대신 `.scrollbar-hide` 클래스 사용
- [ ] 아이콘 크기는 섹션 8 표에서 선택
- [ ] 빈 상태는 섹션 14 패턴 준수
