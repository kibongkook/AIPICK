# AI 레시피 — 범용 AI 서비스 반영 가이드

> **목적**: 57개 AI 레시피에서 사용자에게 노출되는 AI 서비스 대안이 최신 서비스 역량을 정확하게 반영하도록 업데이트하기 위한 작업 가이드

---

## 1. 현재 상태 분석 (2026.02.26 기준)

### 1-1. 레시피 전체 현황

| 항목 | 수치 |
|------|------|
| 레시피 수 | 57개 |
| 옵션 수 | 173개 |
| 스텝 수 | 584개 (파일 기준, 중복 포함) |
| 사용된 도구 종류 | 31개 |
| 데이터 파일 수 | 13개 |

### 1-2. 카테고리별 스텝 분포

| 카테고리 | tool_slug | 스텝 수 | 비율 |
|---------|-----------|--------|------|
| **텍스트 생성 (LLM)** | chatgpt, claude, perplexity, gemini | 370 | 63.4% |
| **프레젠테이션/디자인** | canva-ai, gamma, notion-ai, figma | 65 | 11.1% |
| **이미지 생성** | midjourney, dall-e-3, ideogram, photoroom, leonardo-ai | 46 | 7.9% |
| **코드 생성** | cursor, v0, github-copilot, lovable, coze, flowise | 30 | 5.1% |
| **비디오 편집** | capcut, vrew, descript | 25 | 4.3% |
| **음악/오디오** | suno-ai, elevenlabs, mubert | 22 | 3.8% |
| **영상 생성** | runway-ml, kling-ai, pika, invideo-ai | 17 | 2.9% |
| **아바타/영상** | heygen | 6 | 1.0% |
| **유틸리티** | google-notebooklm | 3 | 0.5% |

### 1-3. 텍스트 LLM 스텝의 tool_slug 점유율

| tool_slug | 스텝 수 | 비율 | tool_name 패턴 |
|-----------|--------|------|---------------|
| chatgpt | 208 | 56.2% | `ChatGPT 또는 Gemini, Perplexity` |
| claude | 117 | 31.6% | `Claude 또는 ChatGPT, Gemini, Perplexity` |
| perplexity | 41 | 11.1% | `Perplexity` (단독) |
| gemini | 4 | 1.1% | `Gemini` (단독) |

### 1-4. 현재 미포함된 주요 AI 서비스

아래 서비스들은 **현재 어떤 레시피에도 등장하지 않음**:

| 서비스 | 제공 기능 | 레시피 반영 필요성 |
|--------|----------|-----------------|
| **Grok (xAI)** | 텍스트, 이미지 생성, 영상 생성, 음성, 웹검색 | 중 — X 프리미엄 필요, 접근성 낮음 |
| **Mistral Le Chat** | 텍스트, 이미지 생성/이해, 음성, 코드, 웹검색 | **높음** — 무료 + 다기능 + 빠른 속도 |
| **DeepSeek** | 텍스트, 코드, 이미지 이해, 웹검색 | **높음** — 완전 무료 + 코딩 최강급 |
| **Meta AI** | 텍스트, 이미지 생성, 이미지/영상 이해, 다국어 | 중 — 한국어 지원 제한적 |
| **Copilot** | 텍스트, 이미지 생성, Office 통합, 코드 | 중 — Office 생태계 의존 |
| **Poe** | 멀티모델 접근, 이미지/영상 생성 | 낮음 — 집계 플랫폼 (직접 AI 아님) |

---

## 2. 반영 작업 목록

### 작업 A: 텍스트 생성 스텝에 Mistral, DeepSeek 대안 추가

#### 대상
- `tool_name`에 `ChatGPT 또는 Gemini, Perplexity` 패턴 → 208개 스텝
- `tool_name`에 `Claude 또는 ChatGPT, Gemini, Perplexity` 패턴 → 117개 스텝
- `tool_name`에 `Perplexity` 단독 → 41개 스텝
- `tool_name`에 `Gemini` 단독 → 4개 스텝

#### 변경안

**옵션 1: 상위 5개 범용 AI만 표시 (권장)**

현재 대안 표시가 이미 3~4개로 길어져 있어, 추가하면 가독성이 떨어질 수 있음.
대신 `alt_tools` 필드를 활용하여 UI에서 "더 많은 대안" 형태로 노출.

```
변경 전: tool_name: 'ChatGPT 또는 Gemini, Perplexity'
변경 후: tool_name: 'ChatGPT 또는 Gemini, Perplexity'  (유지)
         alt_tools: ['gemini', 'perplexity', 'mistral', 'deepseek']  (추가)
```

> alt_tools는 RecipeStepCard에서 "대안: ..." 텍스트로 이미 렌더링됨

**옵션 2: tool_name에 직접 추가**

```
변경 전: 'ChatGPT 또는 Gemini, Perplexity'
변경 후: 'ChatGPT 또는 Gemini, Perplexity, Mistral, DeepSeek'
```

#### 판단 기준

| 기준 | Mistral | DeepSeek | 결론 |
|------|---------|----------|------|
| 무료 여부 | 대부분 무료 | 완전 무료 | 둘 다 적합 |
| 한국어 성능 | 양호 | 양호 | 둘 다 적합 |
| 사용자 인지도 (한국) | 낮음 | 높음 (R1 화제) | DeepSeek 우선 |
| 기능 범위 | 텍스트+이미지+음성 | 텍스트+코드 | Mistral 더 넓음 |
| API 무료 제공 | O (Le Chat) | O (chat.deepseek.com) | 둘 다 적합 |

#### 수정 대상 파일 (13개)

| 파일 | 예상 변경 스텝 수 |
|------|-----------------|
| `data/recipes.ts` | ~64 |
| `data/recipes-v2.ts` | ~10 |
| `data/recipes-v2-expanded.ts` | ~31 |
| `data/recipes-v2-batch1.ts` | ~19 |
| `data/recipes-v2-batch2.ts` | ~36 |
| `data/recipes-v2-batch3.ts` | ~15 |
| `data/recipes-v2-batch4.ts` | ~15 |
| `data/recipes-v2-batch5.ts` | ~12 |
| `data/recipes-v2-batch6.ts` | ~26 |
| `data/recipes-v2-batch7.ts` | ~24 |
| `data/recipes-v2-batch8.ts` | ~37 |
| `data/recipes-v2-batch9.ts` | ~18 |
| `data/recipes-v2-batch10.ts` | ~11 |

---

### 작업 B: 이미지 생성 스텝에 Grok, Mistral 대안 추가

#### 대상
- `tool_slug: 'midjourney'` → 21개 스텝
- `tool_slug: 'dall-e-3'` → 9개 스텝
- `tool_slug: 'ideogram'` → 6개 스텝
- `tool_slug: 'leonardo-ai'` → 4개 스텝
- 합계: 40개 스텝

#### 근거
- **Grok Imagine 1.0**: 이미지 생성 가능 (X 프리미엄 필요)
- **Mistral Le Chat**: Black Forest Labs 파트너십으로 이미지 생성/편집 가능 (무료)
- **Gemini Imagen 4**: 이미 일부 포함되어 있으나 확대 필요
- **Meta AI Imagine**: 이미지 생성 가능 (무료)

#### 변경안

```
변경 전: tool_name: 'Midjourney'
         alt_tools: ['dall-e-3', 'leonardo-ai']

변경 후: tool_name: 'Midjourney'
         alt_tools: ['dall-e-3', 'leonardo-ai', 'gemini', 'mistral']

         또는 tool_name이 이미 "또는" 패턴이면:
         tool_name: 'Midjourney 또는 DALL·E 3, Gemini (Imagen)'
```

---

### 작업 C: 영상 생성 스텝에 ChatGPT (Sora), Gemini (Veo) 대안 추가

#### 대상
- `tool_slug: 'runway-ml'` → 9개 스텝
- `tool_slug: 'kling-ai'` → 5개 스텝
- `tool_slug: 'pika'` → 2개 스텝
- `tool_slug: 'invideo-ai'` → 1개 스텝
- 합계: 17개 스텝

#### 근거
- **ChatGPT (Sora 2)**: 영상 생성 가능 (Plus 이상), API도 존재
- **Gemini (Veo 3)**: 8초 영상 + 사운드 생성 가능, API 존재
- **Grok Imagine**: 10초 영상 720p 생성 가능

#### 변경안

```
변경 전: tool_name: 'Runway Gen-4'
         alt_tools: ['kling-ai', 'pika']

변경 후: tool_name: 'Runway Gen-4'
         alt_tools: ['kling-ai', 'pika', 'chatgpt', 'gemini', 'grok']

         또는:
         tool_name: 'Runway Gen-4 또는 ChatGPT (Sora), Gemini (Veo)'
```

---

### 작업 D: 코드 생성 스텝에 DeepSeek 대안 추가

#### 대상
- `tool_slug: 'cursor'` → 12개 스텝
- `tool_slug: 'v0'` → 10개 스텝
- `tool_slug: 'github-copilot'` → 3개 스텝
- `tool_slug: 'lovable'` → 2개 스텝
- `tool_slug: 'coze'` → 2개 스텝
- `tool_slug: 'flowise'` → 1개 스텝
- 합계: 30개 스텝

#### 근거
- **DeepSeek V4**: 코딩 특화 모델 (1조 파라미터), 무료
- **Claude**: SWE-bench 1위, 이미 일부 포함
- **Gemini**: 코딩 능력 우수, 무료 API

#### 변경안

```
변경 전: tool_name: 'Cursor'
         alt_tools: []  (대안 없음)

변경 후: tool_name: 'Cursor'
         alt_tools: ['github-copilot', 'claude', 'deepseek']
```

---

### 작업 E: RecipeStepCard의 nameMap 업데이트

#### 대상
`components/recipe/RecipeStepCard.tsx`의 `nameMap` 객체

#### 현재 상태
```typescript
const nameMap: Record<string, string> = {
  'claude': 'Claude', 'gemini': 'Gemini', 'chatgpt': 'ChatGPT',
  // ... 기존 61개 매핑
};
```

#### 추가 필요 항목

```typescript
// 신규 추가
'mistral': 'Mistral',
'deepseek': 'DeepSeek',
'grok': 'Grok',
'meta-ai': 'Meta AI',
'copilot': 'Copilot',
'poe': 'Poe',
```

---

### 작업 F: AIPICK tools 데이터에 신규 서비스 등록 확인

#### 확인 필요 사항
아래 서비스가 `data/seed.json` 또는 Supabase `tools` 테이블에 등록되어 있는지 확인:

| 서비스 | slug | 등록 필요성 |
|--------|------|-----------|
| Mistral Le Chat | `mistral` | **필수** — alt_tools 링크 대상 |
| DeepSeek | `deepseek` | **필수** — alt_tools 링크 대상 |
| Grok | `grok` | 선택 — alt_tools에 추가 시 필요 |
| Meta AI | `meta-ai` | 선택 — 한국 접근성 낮음 |
| Poe | `poe` | 낮음 — 집계 플랫폼 |

> alt_tools에 slug를 넣으면 RecipeStepCard에서 해당 slug의 이름으로 렌더링됨.
> tools 테이블에 없으면 nameMap 폴백으로 이름만 표시 (링크 없음).

---

## 3. 우선순위 및 실행 순서

### Priority 1 (즉시 실행)

| 순서 | 작업 | 영향 범위 | 이유 |
|------|------|----------|------|
| 1 | **작업 E**: RecipeStepCard nameMap 업데이트 | 1개 파일 | 다른 작업의 전제 조건 |
| 2 | **작업 F**: tools 데이터에 Mistral/DeepSeek 등록 확인 | 1~2개 파일 | alt_tools 링크 대상 |

### Priority 2 (검토 후 실행)

| 순서 | 작업 | 영향 범위 | 이유 |
|------|------|----------|------|
| 3 | **작업 A**: 텍스트 스텝에 Mistral/DeepSeek 추가 | 13개 파일, ~370개 스텝 | 가장 큰 범위 — 옵션1 vs 옵션2 결정 필요 |
| 4 | **작업 C**: 영상 생성 스텝에 Sora/Veo 추가 | 13개 파일, ~17개 스텝 | 신규 정보 반영 |
| 5 | **작업 B**: 이미지 생성 스텝에 대안 추가 | 13개 파일, ~40개 스텝 | 대안 확대 |
| 6 | **작업 D**: 코드 생성 스텝에 DeepSeek 추가 | 13개 파일, ~30개 스텝 | 코딩 특화 서비스 |

---

## 4. 의사결정 필요 사항

### 결정 1: tool_name에 직접 추가 vs alt_tools 활용

| 방식 | 장점 | 단점 |
|------|------|------|
| **tool_name 직접 추가** | 사용자가 바로 보임 | 문자열이 너무 길어짐 (이미 4개) |
| **alt_tools 필드 활용** | 깔끔한 UI, 확장 용이 | RecipeStepV2에 alt_tools 필드 추가 필요 |

> **권장**: v2 레시피의 RecipeStepV2에 `alt_tools?: string[]` 필드를 추가하고,
> 기존 `tool_name: 'ChatGPT 또는 Gemini, Perplexity'` 패턴은 유지하되,
> 추가 대안은 alt_tools로 분리.

### 결정 2: Grok 포함 여부

| 근거 | 포함 | 미포함 |
|------|------|--------|
| 기능 범위 | 텍스트+이미지+영상+음성 (최다) | - |
| 접근성 | - | X 프리미엄 필요 ($8/월) |
| 한국 사용자 | - | X(트위터) 사용률 낮음 |
| 결론 | 영상 생성 스텝에만 대안으로 추가 | 텍스트 스텝에는 미포함 |

### 결정 3: Meta AI 포함 여부

| 근거 | 포함 | 미포함 |
|------|------|--------|
| 기능 범위 | 텍스트+이미지+이해 | - |
| 가격 | 완전 무료 | - |
| 접근성 | - | 한국 서비스 제한, 한국어 품질 미확인 |
| 결론 | **현재 미포함** (한국 서비스 상황 모니터링 후 추가) | - |

### 결정 4: Poe 포함 여부

| 근거 | 결론 |
|------|------|
| Poe는 자체 AI가 아닌 **집계 플랫폼** | 레시피의 "대안"으로 적합하지 않음 |
| 이미 ChatGPT, Claude, Gemini를 직접 안내 | Poe 통해 간접 접근 안내는 불필요 |
| **결론**: **미포함** | - |

---

## 5. RecipeStepV2 타입 확장 (alt_tools 추가)

### 현재 타입

```typescript
export interface RecipeStepV2 {
  step: number;
  title: string;
  tool_slug: string;
  tool_name: string;
  action: string;
  prompt_example?: string;
  tip?: string;
  estimated_time?: string;
  optional?: boolean;
}
```

### 변경 후

```typescript
export interface RecipeStepV2 {
  step: number;
  title: string;
  tool_slug: string;
  tool_name: string;
  alt_tools?: string[];  // 대안 도구 slug 배열 (신규)
  action: string;
  prompt_example?: string;
  tip?: string;
  estimated_time?: string;
  optional?: boolean;
}
```

> 참고: v1 RecipeStep에는 이미 `alt_tools?: string[]` 필드가 존재함.
> v2에서도 동일하게 추가하면 RecipeStepCard에서 자동으로 대안 렌더링됨.

---

## 6. 변경 전/후 예시

### 텍스트 생성 스텝 (작업 A)

**Before:**
```typescript
{
  step: 1,
  title: 'AI로 가사 작성',
  tool_slug: 'chatgpt',
  tool_name: 'ChatGPT 또는 Gemini, Perplexity',
  action: 'ChatGPT에서 가사 생성 프롬프트를 입력합니다...',
  prompt_example: '...',
}
```

**After (옵션 1 — alt_tools 활용, 권장):**
```typescript
{
  step: 1,
  title: 'AI로 가사 작성',
  tool_slug: 'chatgpt',
  tool_name: 'ChatGPT 또는 Gemini, Perplexity',
  alt_tools: ['gemini', 'perplexity', 'mistral', 'deepseek'],
  action: 'ChatGPT에서 가사 생성 프롬프트를 입력합니다...',
  prompt_example: '...',
}
```

**After (옵션 2 — tool_name 직접 추가):**
```typescript
{
  step: 1,
  title: 'AI로 가사 작성',
  tool_slug: 'chatgpt',
  tool_name: 'ChatGPT 또는 Gemini, Perplexity, Mistral, DeepSeek',
  action: 'ChatGPT에서 가사 생성 프롬프트를 입력합니다...',
  prompt_example: '...',
}
```

### 영상 생성 스텝 (작업 C)

**Before:**
```typescript
{
  step: 3,
  title: '영상 생성',
  tool_slug: 'runway-ml',
  tool_name: 'Runway Gen-4',
  action: 'Runway에서 텍스트-투-비디오로 영상을 생성합니다...',
}
```

**After:**
```typescript
{
  step: 3,
  title: '영상 생성',
  tool_slug: 'runway-ml',
  tool_name: 'Runway Gen-4',
  alt_tools: ['kling-ai', 'pika', 'chatgpt', 'gemini'],
  // ChatGPT = Sora 2, Gemini = Veo 3
  action: 'Runway에서 텍스트-투-비디오로 영상을 생성합니다...',
}
```

### 코드 생성 스텝 (작업 D)

**Before:**
```typescript
{
  step: 2,
  title: '코드 구현',
  tool_slug: 'cursor',
  tool_name: 'Cursor',
  action: 'Cursor에서 AI 코드 생성을 활용합니다...',
}
```

**After:**
```typescript
{
  step: 2,
  title: '코드 구현',
  tool_slug: 'cursor',
  tool_name: 'Cursor',
  alt_tools: ['github-copilot', 'claude', 'chatgpt', 'deepseek'],
  action: 'Cursor에서 AI 코드 생성을 활용합니다...',
}
```

---

## 7. 작업 체크리스트

### Phase 1: 사전 작업
- [ ] RecipeStepV2 타입에 `alt_tools?: string[]` 추가 (types/index.ts)
- [ ] RecipeStepCard nameMap에 mistral, deepseek, grok 등 추가
- [ ] tools 데이터에 Mistral, DeepSeek 서비스 등록 확인/추가
- [ ] 옵션 1(alt_tools) vs 옵션 2(tool_name 직접) 최종 결정

### Phase 2: 레시피 데이터 수정
- [ ] 작업 A: 텍스트 생성 370개 스텝 — alt_tools 추가
- [ ] 작업 B: 이미지 생성 40개 스텝 — alt_tools 추가
- [ ] 작업 C: 영상 생성 17개 스텝 — alt_tools 추가 (Sora, Veo)
- [ ] 작업 D: 코드 생성 30개 스텝 — alt_tools 추가 (DeepSeek)

### Phase 3: 검증
- [ ] npm run build 통과
- [ ] 레시피 상세 페이지에서 대안 도구 렌더링 확인
- [ ] alt_tools의 slug가 tools 데이터에 존재하는지 검증
- [ ] 링크 클릭 시 /tools/[slug] 정상 이동 확인

---

## 8. 주의사항

1. **tool_name은 현재 유지**: 이미 `'ChatGPT 또는 Gemini, Perplexity'` 패턴이 적용되어 있음. 더 추가하면 가독성 문제.
2. **alt_tools 추가가 권장 방식**: v1 RecipeStep에 이미 alt_tools가 있고, RecipeStepCard에서 렌더링 로직도 구현되어 있음.
3. **Poe는 미포함**: 집계 플랫폼이므로 개별 AI 서비스 레벨에서 대안으로 부적합.
4. **Meta AI는 보류**: 한국 서비스 가용성이 불확실. 추후 한국 정식 출시 시 추가.
5. **Grok은 영상/이미지에만**: 텍스트는 이미 대안이 충분. 영상 생성 스텝에서만 대안으로 추가.
6. **Copilot은 코드에만**: Office 생태계 의존적이므로 텍스트 범용 대안으로는 부적합. GitHub Copilot은 이미 3개 스텝에서 사용 중.
