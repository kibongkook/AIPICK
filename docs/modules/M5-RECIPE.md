# M5-RECIPE: AI 레시피 기획서

> 담당 경로: `/recipes`, `/recipes/[slug]`
> 데이터 소스: `data/recipes.ts` (v1), `data/recipes-v2.ts` (v2)
> 최종 수정일: 2026-02-23

---

## 버전 안내

AI 레시피 시스템은 두 가지 버전이 공존합니다.
기존 v1 레시피 100개+와 v2 멀티옵션 레시피가 어댑터(`lib/recipe-adapter.ts`)를 통해 통합 운영됩니다.

---

### Version 1.0 — 단일 경로 레시피

**문서**: [M5-RECIPE-v1.0.md](./M5-RECIPE-v1.0.md)

| 항목 | 내용 |
|------|------|
| **콘셉트** | 하나의 목표 = 하나의 고정 경로 (Step 1 → 2 → 3) |
| **난이도** | 3단계 (쉬움 / 보통 / 어려움) |
| **데이터** | `data/recipes.ts` — 100개+ 레시피 |
| **타입** | `AIRecipe`, `RecipeStep` |
| **특징** | 단순 명확, 대안 도구는 `alt_tools` 이름 나열만 |
| **한계** | 초보/고급 구분 불가, 장단점 비교 없음, 성장 경로 없음 |
| **상태** | 운영 중 (v2 미전환 레시피는 어댑터로 자동 변환) |

---

### Version 2.0 — 멀티옵션 레시피

**문서**: [M5-RECIPE-v2.0.md](./M5-RECIPE-v2.0.md)

| 항목 | 내용 |
|------|------|
| **콘셉트** | 하나의 목표 = 다양한 경로 (옵션 1, 2, 3, 4 선택) |
| **난이도** | 5단계 (아주 쉬움 / 쉬움 / 보통 / 어려움 / 전문가) |
| **데이터** | `data/recipes-v2.ts` — 멀티옵션 레시피 |
| **타입** | `AIRecipeV2`, `RecipeOption`, `RecipeStepV2` |
| **핵심 변경** | 옵션별 장단점, 퀄리티/자유도 평점, 추천 대상, 성장 경로 |
| **UI 추가** | 옵션 선택 카드, 비교표, 성장 경로 시각화, 난이도 범위 배지 |
| **상태** | `ai-song-creation` 1건 전환 완료, 나머지 점진적 확장 예정 |

---

### 버전 비교 요약

```
v1: 레시피 → [Step 1] → [Step 2] → [Step 3] → 결과물
    (하나의 고정 경로, alt_tools로 대안만 나열)

v2: 레시피 → [옵션 선택]
              ├─ 옵션 1 (아주 쉬움): Step 1 → 결과물     ← 완전 초보 진입
              ├─ 옵션 2 (쉬움):     Step 1~3 → 결과물    ← 가사 직접 작성
              ├─ 옵션 3 (보통):     Step 1~3 → 결과물+   ← 앨범 아트 추가
              └─ 옵션 4 (어려움):   Step 1~5 → 결과물++  ← 뮤직비디오까지
              + 장단점 비교표 + 성장 경로 안내
```

---

### v1 → v2 호환 구조

```
data/recipes.ts (v1 100개+)
data/recipes-v2.ts (v2 멀티옵션)
       ↓
ALL_RECIPES (통합 배열: v2 + v1 중 v2에 없는 것)
getRecipeBySlug() (v2 우선, 없으면 v1)
       ↓
toRecipeV2() 어댑터 (v1 → v2 자동 변환)
       ↓
RecipeOptionSelector (v2 → 멀티옵션 UI, v1 → 기존 단일 스텝 UI)
```

---

### 관련 파일

| 파일 | 역할 |
|------|------|
| `types/index.ts` | `AIRecipe` (v1), `AIRecipeV2`, `RecipeOption` 등 타입 |
| `lib/constants.ts` | `RECIPE_DIFFICULTY` (v1), `RECIPE_DIFFICULTY_V2` (v2) |
| `lib/recipe-adapter.ts` | `toRecipeV2()`, `migrateRecipeV1toV2()` |
| `data/recipes.ts` | v1 레시피 데이터 + `ALL_RECIPES` 통합 export |
| `data/recipes-v2.ts` | v2 멀티옵션 레시피 데이터 |
| `components/recipe/` | RecipeCard, RecipeOptionSelector, RecipeComparisonTable 등 |
| `app/recipes/` | 목록/상세 페이지 |
