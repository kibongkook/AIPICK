# AI 레시피 플레이그라운드 기획서 v2.0

> **한 줄 요약**: 57개 AI 레시피의 각 단계를 AIPICK 사이트에서 바로 실행 — 일 3회 무료, 이후 건당 1,000원

---

## 1. 배경 및 목표

### 현재 상황
- AIPICK의 AI 레시피(57개, 173개 옵션, 463개 스텝)는 **읽기 전용 가이드**
- 사용자 흐름: 프롬프트 예시 복사 → 외부 사이트 이동 → 붙여넣기 → 실행 → 결과 확인 → 다시 AIPICK으로 복귀
- 이 과정에서 **이탈률이 높고**, 레시피의 실제 완주율이 낮을 것으로 예상

### 목표
1. **레시피 단계를 사이트 안에서 바로 실행** — "프롬프트 복사" 버튼 옆에 "실행하기" 버튼 추가
2. **결과물 즉시 확인** — 텍스트, 이미지, 코드 등 결과를 인라인으로 표시
3. **완주율 극대화** — 외부 이동 없이 레시피를 처음부터 끝까지 완료 가능
4. **수익 모델 구축** — 무료 체험 후 유료 전환으로 지속 가능한 비즈니스

---

## 2. 비즈니스 모델

### 2-1. 가격 구조

| 구분 | 내용 |
|------|------|
| **무료 실행** | 일 3회 (자정 KST 리셋) |
| **유료 실행** | 건당 1,000원 (부가세 포함) |
| **비로그인** | 실행 불가 (로그인 유도) |

### 2-2. 무료 실행 정책

```
- 로그인한 모든 사용자에게 일일 3회 무료 실행 제공
- 텍스트/이미지/코드 등 실행 유형에 관계없이 동일하게 1회로 카운트
- 실행 실패(API 오류 등)는 횟수에서 차감하지 않음
- 매일 KST 00:00에 자동 리셋
- 무료 실행은 이월되지 않음 (당일 미사용분 소멸)
```

### 2-3. 유료 실행 정책

```
- 일일 무료 3회 소진 후, 건당 1,000원 결제
- 실행 유형 무관 (텍스트/이미지/코드 모두 동일 가격)
- 결제 방식: 건별 즉시 결제 (충전 방식 아님)
- 결제 수단: 카드, 카카오페이, 네이버페이, 토스페이
- 실행 실패 시 자동 환불
- 영수증/결제 내역 마이페이지에서 확인 가능
```

### 2-4. 수익 시뮬레이션

```
시나리오: DAU 500명 기준

무료 전환율 20% (500명 중 100명이 유료 실행)
유료 사용자 평균 일 2회 유료 실행

일일 유료 실행: 100명 × 2회 = 200건
일일 매출: 200건 × 1,000원 = 200,000원
월 매출: 200,000원 × 30일 = 6,000,000원

API 비용 (전체 실행 기준):
- 무료 실행: 500명 × 3회 = 1,500건/일
- 유료 실행: 200건/일
- 총 1,700건/일

API 비용 (무료 API 사용 시):
- Gemini 무료 티어: 텍스트 1,600건/일 + 이미지 500건/일 = 커버 가능
- AIPICK API 비용: 사실상 $0 (무료 티어 내)

순수익: 월 ~6,000,000원 (API 비용 ≈ 0원)
```

---

## 3. 제로 코스트 API 전략

### 3-1. 핵심 원칙

> AIPICK은 **무료 API 티어만** 사용하여 서비스 운영 비용을 $0으로 유지한다.
> 사용자의 유료 결제 수익은 100% 순수익이 된다.

### 3-2. 무료 API 제공자 매핑

| 작업 유형 | 1순위 Provider | 무료 한도 | 2순위 (폴백) | 무료 한도 |
|----------|---------------|----------|-------------|----------|
| **텍스트 생성** | Google Gemini 2.5 Flash | 1,000 RPD | Groq (Llama 3.3 70B) | 1,000 RPD |
| **이미지 생성** | Google Gemini Flash Image | 500 이미지/일 | Cloudflare Workers AI (Flux) | 10,000 뉴런/일 |
| **코드 생성** | Google Gemini 2.5 Flash | 1,000 RPD | Cerebras (Llama 3.3 70B) | 1,000 RPD |
| **문서 요약** | Google Gemini 2.0 Flash-Lite | 1,600 RPD | Groq (Llama 3.3 70B) | 1,000 RPD |
| **번역** | Google Gemini 2.0 Flash-Lite | 1,600 RPD | DeepL Free | 500K 자/월 |

> RPD = Requests Per Day

### 3-3. 일일 용량 계산

```
최대 일일 실행 용량 (단일 API 키):

텍스트 생성:
- Gemini Flash: 1,000건/일
- Groq: 1,000건/일
- 합계: 2,000건/일

이미지 생성:
- Gemini Flash Image: 500건/일
- 합계: 500건/일

DAU 500명 기준 예상 실행 (무료 3회 + 유료):
- 총 실행: ~1,700건/일
- 텍스트:이미지 비율 예상 7:3 → 텍스트 1,190건 + 이미지 510건

결론:
- 텍스트: 2,000건 한도 > 1,190건 예상 → ✅ 충분
- 이미지: 500건 한도 ≈ 510건 예상 → ⚠️ 빠듯 (API 키 추가 or 폴백 필요)
```

### 3-4. 확장 전략 (DAU 1,000+ 시)

1. **Google API 키 복수 발급** — 다른 Google 계정으로 추가 키 발급 (약관 확인 필요)
2. **Provider 로드밸런싱** — 요청을 여러 무료 Provider에 분산
3. **캐싱** — 동일 프롬프트 24시간 캐시 (특히 레시피 기본 예시 프롬프트)
4. **유료 API 전환** — 수익이 충분히 쌓이면 OpenAI/Anthropic 유료 API로 전환하여 품질 향상

### 3-5. API 키 환경변수

```env
# 무료 API (Phase 1 - 비용 $0)
GOOGLE_AI_API_KEY=AI...                  # Gemini (텍스트 + 이미지)
GROQ_API_KEY=gsk_...                     # Groq (텍스트 폴백)
CEREBRAS_API_KEY=csk-...                 # Cerebras (코드 폴백)
CLOUDFLARE_ACCOUNT_ID=...               # Workers AI (이미지 폴백)
CLOUDFLARE_AI_TOKEN=...                 # Workers AI 토큰

# 유료 API (Phase 3+ - 수익 발생 후)
OPENAI_API_KEY=sk-...                   # GPT-4o-mini (선택)
ANTHROPIC_API_KEY=sk-ant-...            # Claude Haiku (선택)

# 결제 (Phase 2)
TOSS_PAYMENTS_SECRET_KEY=...            # 토스페이먼츠 시크릿 키
TOSS_PAYMENTS_CLIENT_KEY=...            # 토스페이먼츠 클라이언트 키
NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY=... # 클라이언트 사이드용
```

---

## 4. 범용 AI 서비스 역량 비교 (2026.02 기준)

> 레시피 플레이그라운드에서 어떤 AI 서비스를 대안으로 노출하고, 어떤 서비스의 API를 백엔드에서 호출할지 결정하기 위한 기초 자료.

### 4-1. 종합 비교표

| 서비스 | 텍스트 | 이미지생성 | 이미지이해 | 영상생성 | 음성 | 웹검색 | 코드 | 에이전트 | 무료 |
|--------|-------|-----------|-----------|---------|------|--------|------|---------|------|
| **ChatGPT** | O | O | O | O (Sora 2) | O | O | O | O | 부분 |
| **Gemini** | O | O | O | O (Veo 3) | O | O | O | O | 대부분 |
| **Claude** | O | X | O | X | X | O | O | O | 부분 |
| **Perplexity** | O | X | O | X | O | O | O | O | 부분 |
| **Copilot** | O | O | O | X | O | O | O | O | 부분 |
| **Grok** | O | O | O | O | O | O | O | X | 부분 |
| **Mistral** | O | O | O | X | O | O | O | X | 대부분 |
| **DeepSeek** | O | X | O (제한적) | X | X | O | O | X | 무료 |
| **Meta AI** | O | O | O | X | 제한 | O | O | X | 무료 |
| **Poe** | O | O | O | O | X | X | O | X | 부분 |

### 4-2. 서비스별 기능 상세

#### ChatGPT (OpenAI)
- **텍스트**: GPT-5.2 (Instant/Thinking), Memory, Study Mode
- **이미지 생성**: DALL-E 3 통합
- **영상 생성**: Sora 2 통합 (Plus 월 4~8분)
- **음성**: Voice Mode (웹/모바일/Windows)
- **코드**: Code Interpreter, Codex (에이전트 코딩)
- **에이전트**: Agent Mode (웹 탐색, 양식 작성)
- **검색**: 실시간 웹 검색, Deep Research
- **파일**: 20개 파일 동시 업로드
- **가격**: 무료 / Plus $20 / Pro $200

#### Google Gemini
- **텍스트**: Gemini 3, 2.5 Flash/Pro, Deep Think
- **이미지 생성**: Imagen 4, Gemini Flash Image
- **영상 생성**: Veo 3 (8초, 사운드 포함)
- **음성**: Gemini Live
- **코드**: 코드 생성/설명
- **에이전트**: Auto Browse (예약, 티켓 등 자동)
- **검색**: Google 검색 통합
- **연동**: Drive, Docs, Sheets, Slides, Meet, Gmail, Photos
- **학습**: Guided Learning
- **가격**: 무료 / AI Pro $19.99 / Ultra $149.99
- **API 무료 한도**: 텍스트 1,000~1,600 RPD, 이미지 500건/일

#### Claude (Anthropic)
- **텍스트**: Opus 4.6, Sonnet 4.6, Haiku 4.5 (200K~1M 컨텍스트)
- **이미지 이해**: 이미지 업로드 분석 (문서, 그래프)
- **코드**: SWE-bench 77.2% (업계 1위)
- **에이전트**: Computer Use (GUI 조작), Claude Code (CLI), Claude Cowork (GUI)
- **검색**: 실시간 웹 브라우징
- **추론**: Extended Thinking
- **가격**: 무료 / Pro $20 / Max $100

#### Perplexity
- **텍스트**: GPT-5.2, Claude Opus 4 등 다중 모델
- **검색**: 핵심 기능 — 출처 기반 답변 (모든 답변에 소스 링크)
- **리서치**: Deep Research (반복 검색 + 보고서)
- **금융**: 실시간 주가/기업 분석
- **어시스턴트**: 앱 간 작업 수행
- **파일**: PDF, Word 업로드 분석
- **브라우저**: Comet (무료)
- **가격**: 무료 / Pro $20 / Max $200

#### Microsoft Copilot
- **텍스트**: GPT-5.2 기반
- **이미지 생성**: DALL-E 3 기반 Image Creator
- **Office 통합**: Word, Excel, PowerPoint, Outlook, Teams (핵심 강점)
- **코드**: GitHub Copilot
- **에이전트**: 자율 에이전트 (영업, 경비, SharePoint)
- **가격**: 무료 채팅 + M365 Copilot (기업 구독)

#### Grok (xAI)
- **텍스트**: Grok 4.20, 추론 모델
- **이미지 생성**: Grok Imagine 1.0
- **영상 생성**: 10초, 720p, 오디오 포함
- **음성**: Grok Voice (저지연, 다국어)
- **검색**: 실시간 웹 + X(트위터) 데이터
- **Tesla**: 차량 내 음성 AI
- **가격**: X 무료(제한) / Premium $8 / SuperGrok $30

#### Mistral Le Chat
- **텍스트**: Magistral (추론), ~1000 단어/초 (Flash Answers)
- **이미지 생성/편집**: Black Forest Labs 파트너십
- **이미지 이해**: Pixtral (12B/Large), Le Chat에서 무료 사용 가능
- **음성**: Voxtral (저지연 음성 인식)
- **코드**: Codestral
- **검색**: 실시간 웹 검색
- **리서치**: Deep Research
- **가격**: 무료 / Pro $14.99

#### DeepSeek
- **텍스트**: V3 (범용), R1 (추론 특화)
- **코드**: V4 (1조 파라미터, 코딩 특화)
- **이미지 이해**: VL2 (비전-언어, 제한적 통합)
- **검색**: 실시간 웹 검색
- **가격**: 완전 무료 (웹/앱), API 매우 저렴

#### Meta AI (Llama 4)
- **텍스트**: Llama 4 Scout/Maverick/Behemoth
- **이미지 생성**: Imagine (Meta AI 내장)
- **이미지/영상 이해**: 네이티브 멀티모달 입력
- **다국어**: 100개+ 언어
- **메신저**: WhatsApp, Instagram, Messenger, Oculus 통합
- **오픈소스**: 가중치 공개 (로컬 실행 가능)
- **가격**: 완전 무료

#### Poe (Quora)
- **멀티모델**: GPT-5.2, Claude, Gemini, Llama 전체 접근 (핵심 강점)
- **이미지 생성**: FLUX, Ideogram, Stable Diffusion
- **이미지 이해**: GPT-4, Claude, Gemini 비전 모델 접근
- **영상 생성**: Veo 2, Runway, Hailuo
- **커스텀 봇**: 코딩 없이 봇 생성 + 수익화
- **가격**: 무료(제한) / $5/월 (10,000 포인트/일)

### 4-3. AIPICK 플레이그라운드 관점 정리

| 용도 | 백엔드 API (AIPICK 실행용) | 사용자 노출 (레시피 대안 표시) |
|------|-------------------------|----------------------------|
| **텍스트 생성** | Gemini (무료) + Groq (폴백) | ChatGPT, Gemini, Claude, Perplexity, Mistral, DeepSeek |
| **이미지 생성** | Gemini Flash Image (무료) | ChatGPT (DALL-E), Gemini (Imagen), Midjourney, Copilot, Grok, Mistral |
| **코드 생성** | Gemini (무료) + Cerebras (폴백) | ChatGPT, Claude, Gemini, DeepSeek, Cursor, GitHub Copilot |
| **영상 생성** | 미지원 (외부 이동) | ChatGPT (Sora), Gemini (Veo), Grok, Runway, Kling |
| **음성 합성** | Phase 4 (유료 API) | ElevenLabs, ChatGPT Voice, Gemini Live |

---

## 5. 지원 가능한 AI 작업 유형

### 5-1. Tier별 분류 (수정 반영)

| Tier | 설명 | 해당 작업 | API Provider |
|------|------|----------|-------------|
| **Tier 1** | 무료 API 직접 실행 | 텍스트 생성, 이미지 생성, 코드 생성, 번역, 요약 | Gemini, Groq, Cerebras |
| **Tier 2** | 유료 API 필요 (Phase 3+) | 영상 생성, 음성 합성, 고급 이미지 편집 | OpenAI (Sora), Google (Veo), ElevenLabs |
| **Tier 3** | 공개 API 없음 (외부 이동) | 음악 생성, 프레젠테이션, 노코드 | Suno, Gamma, Canva |

> **변경사항**: 영상 생성을 Tier 3 → Tier 2로 이동. ChatGPT (Sora 2), Gemini (Veo 3) 모두 영상 생성 API를 제공하므로 Phase 3+에서 유료 API 연동 가능.

### 5-2. Phase별 지원 범위 (수정 반영)

| Phase | 지원 작업 | API Provider | 비용 |
|-------|----------|-------------|------|
| **Phase 1** (MVP) | 텍스트 생성, 코드 생성 | Gemini 2.5 Flash + Groq | $0 |
| **Phase 2** | 이미지 생성 + 결제 시스템 | Gemini Flash Image | $0 |
| **Phase 3** | 고급 모델 + 영상 생성 | OpenAI (GPT/Sora), Anthropic, Google (Veo) | 유료 |
| **Phase 4** | 음성 합성, 코드 실행, BYOK | ElevenLabs, 샌드박스, 사용자 API 키 | 유료 |

---

## 5. 사용자 경험 (UX) 설계

### 5-1. 레시피 단계 카드 변경

**Before (현재)**
```
┌──────────────────────────────────────────────────┐
│ ① AI로 가사 작성                                   │
│ [ChatGPT →]  대안: Gemini, Perplexity              │
│                                                     │
│ ChatGPT에서 가사 생성 프롬프트를 입력합니다...       │
│                                                     │
│ ┌ 프롬프트 예시 ──────────────────── [📋 복사] ┐    │
│ │ "감성적인 인디 팝 노래 가사를 써줘..."         │    │
│ └───────────────────────────────────────────────┘    │
│                                                     │
│ 💡 팁: ChatGPT는 한국어 가사의 자연스러움이 강점   │
└──────────────────────────────────────────────────────┘
```

**After (변경 후)**
```
┌──────────────────────────────────────────────────┐
│ ① AI로 가사 작성                                   │
│ [ChatGPT →]  대안: Gemini, Perplexity              │
│                                                     │
│ ChatGPT에서 가사 생성 프롬프트를 입력합니다...       │
│                                                     │
│ ┌ 프롬프트 예시 ──────────────────── [📋 복사] ┐    │
│ │ "감성적인 인디 팝 노래 가사를 써줘..."         │    │
│ └───────────────────────────────────────────────┘    │
│                                                     │
│ ┌─────────────────────────────────────────────┐     │
│ │ ⚡ AIPICK에서 바로 실행        [▶ 실행하기] │     │
│ │                                               │     │
│ │ 프롬프트를 수정하거나 바로 실행하세요         │     │
│ │ ┌─────────────────────────────────────────┐ │     │
│ │ │ (편집 가능한 프롬프트 텍스트영역)         │ │     │
│ │ └─────────────────────────────────────────┘ │     │
│ │                                               │     │
│ │ 오늘 남은 무료 실행: 2/3회  |  추가 실행 ₩1,000/건│
│ └─────────────────────────────────────────────┘     │
│                                                     │
│ 💡 팁: ChatGPT는 한국어 가사의 자연스러움이 강점   │
└──────────────────────────────────────────────────────┘
```

### 5-2. 실행 결과 표시 — 텍스트

```
┌─────────────────────────────────────────────────┐
│ ✅ 실행 완료                        [🔄 다시]   │
│                                                   │
│ ┌ 결과 ──────────────────────── [📋 복사] ┐      │
│ │                                           │      │
│ │ [Verse 1]                                 │      │
│ │ 교실 창가에 앉아 바라본 하늘              │      │
│ │ 우리 함께 걸었던 그 길 위에               │      │
│ │ ...                                       │      │
│ │                                           │      │
│ │ [Chorus]                                  │      │
│ │ 안녕, 잘 지내                             │      │
│ │ ...                                       │      │
│ └───────────────────────────────────────────┘      │
│                                                   │
│ [📥 다운로드]  [다음 단계에서 사용하기 →]          │
│ 오늘 남은 무료 실행: 1/3회                        │
└─────────────────────────────────────────────────────┘
```

### 5-3. 실행 결과 표시 — 이미지

```
┌─────────────────────────────────────────────────┐
│ ✅ 이미지 생성 완료                 [🔄 다시]   │
│                                                   │
│ ┌───────────────────────────────────────────┐    │
│ │                                           │    │
│ │          (생성된 이미지 미리보기)          │    │
│ │             1024 × 1024                   │    │
│ │                                           │    │
│ └───────────────────────────────────────────┘    │
│                                                   │
│ [📥 PNG 다운로드]  [다음 단계에서 사용하기 →]     │
└─────────────────────────────────────────────────────┘
```

### 5-4. 무료 횟수 소진 시 결제 유도

```
┌─────────────────────────────────────────────────┐
│ 오늘의 무료 실행을 모두 사용했습니다              │
│                                                   │
│ ┌───────────────────────────────────────────┐    │
│ │  ⚡ 추가 실행하기                          │    │
│ │                                           │    │
│ │  1회 실행: ₩1,000                         │    │
│ │  결제 수단: 카드 / 카카오페이 / 토스페이   │    │
│ │                                           │    │
│ │  [💳 결제 후 실행하기]                     │    │
│ │                                           │    │
│ │  내일 오전 0시에 무료 3회가 다시 충전됩니다│    │
│ └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 5-5. 비로그인 시

```
┌─────────────────────────────────────────────────┐
│ 🔒 로그인하면 AI 레시피를 직접 실행할 수 있어요  │
│                                                   │
│  매일 3회 무료 실행 제공!                        │
│                                                   │
│  [Google로 로그인]  [GitHub로 로그인]             │
│  [카카오로 로그인]                                │
└─────────────────────────────────────────────────────┘
```

### 5-6. 단계 간 결과 연계 (핵심 UX)

레시피의 핵심은 **이전 단계의 결과물이 다음 단계의 입력이 되는 것**:

```
[Step 1] AI로 가사 작성 → 결과: 가사 텍스트
         ↓ "다음 단계에서 사용하기" 클릭
[Step 2] Suno 스타일 프롬프트 생성 → 프롬프트에 가사 자동 포함
         ↓
[Step 3] Suno에서 곡 생성 → (Tier 3: 외부 이동 안내)
```

- "다음 단계에서 사용하기" 버튼: 현재 결과를 다음 단계 프롬프트의 `{{previous_result}}` 자리에 자동 삽입
- 지원 불가 단계(Tier 3)는 기존처럼 외부 링크 + 복사 버튼 유지

### 5-7. 실행 불가 단계 처리

실행 불가(`tool_slug`가 `EXECUTABLE_TOOLS`에 없음)인 경우:

```
┌─────────────────────────────────────────────────┐
│ 🔗 이 단계는 Suno 사이트에서 직접 실행해주세요    │
│                                                   │
│ [Suno 열기 ↗]  [프롬프트 복사 📋]                │
│                                                   │
│ 💡 위 결과물을 복사해서 Suno에 붙여넣으세요       │
└─────────────────────────────────────────────────────┘
```

---

## 6. DB 스키마

### 6-1. user_executions 테이블 (무료 횟수 추적)

```sql
-- supabase/migrations/021_recipe_playground.sql

-- 사용자별 일일 실행 횟수 추적
CREATE TABLE user_executions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_free_used INT NOT NULL DEFAULT 0,       -- 오늘 사용한 무료 실행 횟수
  daily_reset_date DATE NOT NULL DEFAULT CURRENT_DATE, -- 마지막 리셋 날짜
  total_free_used INT NOT NULL DEFAULT 0,       -- 누적 무료 실행 횟수
  total_paid_used INT NOT NULL DEFAULT 0,       -- 누적 유료 실행 횟수
  total_paid_amount INT NOT NULL DEFAULT 0,     -- 누적 결제 금액 (원)
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 일일 리셋 로직: daily_reset_date < CURRENT_DATE이면 daily_free_used = 0으로 리셋
```

### 6-2. recipe_executions 테이블 (실행 이력)

```sql
-- 실행 이력 (분석 + 어뷰징 방지 + 결제 내역)
CREATE TABLE recipe_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_slug TEXT NOT NULL,
  option_id TEXT,                    -- v2 레시피의 옵션 ID
  step_number INT NOT NULL,
  tool_slug TEXT NOT NULL,

  -- 실행 정보
  execution_type TEXT NOT NULL CHECK (execution_type IN ('text', 'image', 'code')),
  provider TEXT NOT NULL,            -- 'gemini', 'groq', 'cerebras', 'openai' 등
  model TEXT NOT NULL,               -- 'gemini-2.5-flash', 'llama-3.3-70b' 등

  -- 비용 정보
  is_free BOOLEAN NOT NULL DEFAULT true,  -- 무료 실행 여부
  paid_amount INT DEFAULT 0,              -- 결제 금액 (원) — 유료면 1000
  payment_id TEXT,                        -- 토스페이먼츠 결제 ID

  -- 사용량 추적
  input_tokens INT,
  output_tokens INT,

  -- 상태
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'cancelled')),
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_recipe_exec_user ON recipe_executions(user_id, created_at DESC);
CREATE INDEX idx_recipe_exec_recipe ON recipe_executions(recipe_slug, created_at DESC);
CREATE INDEX idx_recipe_exec_date ON recipe_executions(created_at DESC);
CREATE INDEX idx_recipe_exec_payment ON recipe_executions(payment_id) WHERE payment_id IS NOT NULL;
```

### 6-3. payments 테이블 (결제 관리)

```sql
-- 결제 내역 (토스페이먼츠 연동)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 토스페이먼츠 정보
  payment_key TEXT UNIQUE,           -- 토스 결제 키
  order_id TEXT UNIQUE NOT NULL,     -- 주문 ID (AIPICK 생성)

  -- 금액
  amount INT NOT NULL,               -- 결제 금액 (원)

  -- 상태
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),

  -- 연결된 실행
  execution_id UUID REFERENCES recipe_executions(id),

  -- 메타데이터
  method TEXT,                       -- 'card', 'kakaopay', 'naverpay', 'tosspay'
  receipt_url TEXT,                  -- 영수증 URL

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_user ON payments(user_id, created_at DESC);
CREATE INDEX idx_payments_status ON payments(status);
```

---

## 7. TypeScript 타입 정의

```typescript
// types/index.ts에 추가

// === 레시피 플레이그라운드 ===

export type ExecutionType = 'text' | 'image' | 'code';
export type ExecutionStatus = 'success' | 'error' | 'cancelled';
export type PaymentStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'card' | 'kakaopay' | 'naverpay' | 'tosspay';

export interface UserExecution {
  user_id: string;
  daily_free_used: number;
  daily_reset_date: string;
  total_free_used: number;
  total_paid_used: number;
  total_paid_amount: number;
  updated_at: string;
}

export interface RecipeExecution {
  id: string;
  user_id: string;
  recipe_slug: string;
  option_id: string | null;
  step_number: number;
  tool_slug: string;
  execution_type: ExecutionType;
  provider: string;
  model: string;
  is_free: boolean;
  paid_amount: number;
  payment_id: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  status: ExecutionStatus;
  error_message: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  payment_key: string | null;
  order_id: string;
  amount: number;
  status: PaymentStatus;
  execution_id: string | null;
  method: PaymentMethod | null;
  receipt_url: string | null;
  created_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
}

export interface ExecutionConfig {
  type: ExecutionType;
  provider: string;
  model: string;
  fallback?: {
    provider: string;
    model: string;
  };
}

// RecipeStepV2에 실행 관련 필드 추가
export interface RecipeStepV2 {
  // ... 기존 필드 유지
  step: number;
  title: string;
  tool_slug: string;
  tool_name: string;
  action: string;
  prompt_example?: string;
  tip?: string;
  estimated_time?: string;
  optional?: boolean;

  // 플레이그라운드 관련 (신규)
  execution_type?: ExecutionType;     // 실행 유형
  system_prompt?: string;             // AI에게 전달할 시스템 프롬프트
  result_format?: string;             // 기대 결과 형식
  use_previous?: boolean;             // 이전 단계 결과를 입력에 포함할지
}
```

---

## 8. 상수 정의

```typescript
// lib/constants.ts에 추가

// === 레시피 플레이그라운드 ===

/** 일일 무료 실행 횟수 */
export const DAILY_FREE_EXECUTIONS = 3;

/** 건당 유료 실행 가격 (원) */
export const EXECUTION_PRICE_KRW = 1000;

/** 프롬프트 입력 최대 길이 */
export const MAX_PROMPT_LENGTH = 2000;

/** 실행 타임아웃 (ms) */
export const EXECUTION_TIMEOUT_MS = 30_000;

/** Rate Limit */
export const EXECUTION_RATE_LIMIT = {
  perMinutePerUser: 5,
  perMinutePerIP: 10,
} as const;

/** 실행 가능한 도구 → AI 모델 매핑 */
export const EXECUTABLE_TOOLS: Record<string, ExecutionConfig> = {
  // 텍스트 생성 (Phase 1)
  'chatgpt':    { type: 'text',  provider: 'gemini',   model: 'gemini-2.5-flash-preview-05-20',
                  fallback: { provider: 'groq', model: 'llama-3.3-70b-versatile' } },
  'claude':     { type: 'text',  provider: 'gemini',   model: 'gemini-2.5-flash-preview-05-20',
                  fallback: { provider: 'groq', model: 'llama-3.3-70b-versatile' } },
  'gemini':     { type: 'text',  provider: 'gemini',   model: 'gemini-2.5-flash-preview-05-20',
                  fallback: { provider: 'groq', model: 'llama-3.3-70b-versatile' } },
  'perplexity': { type: 'text',  provider: 'gemini',   model: 'gemini-2.5-flash-preview-05-20',
                  fallback: { provider: 'groq', model: 'llama-3.3-70b-versatile' } },
  'wrtn':       { type: 'text',  provider: 'gemini',   model: 'gemini-2.5-flash-preview-05-20',
                  fallback: { provider: 'groq', model: 'llama-3.3-70b-versatile' } },
  'jasper':     { type: 'text',  provider: 'gemini',   model: 'gemini-2.5-flash-preview-05-20',
                  fallback: { provider: 'groq', model: 'llama-3.3-70b-versatile' } },
  'copy-ai':    { type: 'text',  provider: 'gemini',   model: 'gemini-2.5-flash-preview-05-20',
                  fallback: { provider: 'groq', model: 'llama-3.3-70b-versatile' } },
  'grammarly':  { type: 'text',  provider: 'gemini',   model: 'gemini-2.5-flash-preview-05-20',
                  fallback: { provider: 'groq', model: 'llama-3.3-70b-versatile' } },

  // 이미지 생성 (Phase 2)
  'dall-e-3':         { type: 'image', provider: 'gemini', model: 'gemini-2.0-flash-exp' },
  'midjourney':       { type: 'image', provider: 'gemini', model: 'gemini-2.0-flash-exp' },
  'stable-diffusion': { type: 'image', provider: 'gemini', model: 'gemini-2.0-flash-exp' },
  'ideogram':         { type: 'image', provider: 'gemini', model: 'gemini-2.0-flash-exp' },
  'leonardo-ai':      { type: 'image', provider: 'gemini', model: 'gemini-2.0-flash-exp' },
  'flux':             { type: 'image', provider: 'gemini', model: 'gemini-2.0-flash-exp' },
  'canva-ai':         { type: 'image', provider: 'gemini', model: 'gemini-2.0-flash-exp' },

  // 코드 생성 (Phase 1)
  'cursor':  { type: 'code', provider: 'gemini',   model: 'gemini-2.5-flash-preview-05-20',
               fallback: { provider: 'cerebras', model: 'llama-3.3-70b' } },
  'replit':  { type: 'code', provider: 'gemini',   model: 'gemini-2.5-flash-preview-05-20',
               fallback: { provider: 'cerebras', model: 'llama-3.3-70b' } },
} as const;

/** 결제 관련 상수 */
export const PAYMENT_CONFIG = {
  currency: 'KRW',
  minAmount: 1000,
  provider: 'tosspayments',
  orderIdPrefix: 'AIPICK-EXEC',
} as const;
```

---

## 9. 기술 아키텍처

### 9-1. 전체 흐름 — 무료 실행

```
[사용자] "실행하기" 클릭
  │
  ▼
[RecipePlayground 컴포넌트]
  │
  │ POST /api/recipe/execute
  │ { recipe_slug, step, prompt, execution_type }
  ▼
[API Route: /api/recipe/execute]
  │
  ├─ 1. 인증 확인 (Supabase Auth)
  ├─ 2. Rate Limiting (IP + user)
  ├─ 3. 무료 횟수 확인 (user_executions)
  │     ├─ daily_reset_date < today → 리셋 (daily_free_used = 0)
  │     └─ daily_free_used < 3 → 무료 실행 허용
  ├─ 4. 프롬프트 안전성 검사
  │
  ├─ 5. AI Provider 라우팅
  │     ├─ 1순위: Gemini Flash (무료)
  │     └─ 폴백: Groq / Cerebras (무료)
  │
  ├─ 6. 결과 반환 (스트리밍 or JSON)
  ├─ 7. daily_free_used += 1
  └─ 8. recipe_executions 이력 저장 (is_free = true)
```

### 9-2. 전체 흐름 — 유료 실행

```
[사용자] 무료 3회 소진 → "결제 후 실행하기" 클릭
  │
  ▼
[RecipePlayground 컴포넌트]
  │
  │ 1. POST /api/recipe/payment/create
  │    { recipe_slug, step, prompt }
  │    → { orderId, amount, orderName }
  ▼
[토스페이먼츠 결제 위젯]
  │
  │ 사용자 결제 완료
  │ → successUrl로 리다이렉트 (paymentKey, orderId, amount)
  ▼
[API Route: /api/recipe/payment/confirm]
  │
  ├─ 1. 토스페이먼츠 결제 승인 API 호출
  ├─ 2. payments 테이블에 confirmed 저장
  │
  ├─ 3. AI 실행 (위 무료 실행과 동일 로직)
  │
  ├─ 4. recipe_executions 저장 (is_free = false, paid_amount = 1000)
  └─ 5. user_executions.total_paid_used += 1, total_paid_amount += 1000
```

### 9-3. API Route 설계

```
app/api/recipe/
  execute/route.ts                  — 텍스트/코드 생성 (스트리밍)
  execute-image/route.ts            — 이미지 생성 (JSON, base64)
  status/route.ts                   — 남은 무료 횟수 조회
  history/route.ts                  — 실행 이력 조회

  payment/
    create/route.ts                 — 결제 주문 생성
    confirm/route.ts                — 결제 승인 + 실행
    webhook/route.ts                — 토스 웹훅 (환불/취소)
```

### 9-4. 텍스트 생성 API — 스트리밍

```typescript
// app/api/recipe/execute/route.ts (핵심 로직)

export async function POST(request: NextRequest) {
  // 1. 인증
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  // 2. Rate limit
  if (await isRateLimited(user.id, request)) return tooManyRequests();

  // 3. 무료 횟수 확인
  const execStatus = await getUserExecutionStatus(user.id);
  const isFree = execStatus.daily_free_used < DAILY_FREE_EXECUTIONS;

  if (!isFree) {
    // 유료 결제 필요 → 결제 ID 확인
    const { payment_id } = body;
    if (!payment_id) {
      return NextResponse.json({
        error: 'FREE_LIMIT_REACHED',
        daily_free_used: execStatus.daily_free_used,
        daily_free_limit: DAILY_FREE_EXECUTIONS,
        price: EXECUTION_PRICE_KRW,
      }, { status: 402 });
    }
    // 결제 유효성 검증
    if (!await verifyPayment(payment_id, user.id)) return forbidden();
  }

  // 4. 프롬프트 안전성
  const { prompt, recipe_slug, step, execution_type } = body;
  if (prompt.length > MAX_PROMPT_LENGTH) return badRequest('Prompt too long');

  // 5. AI Provider 라우팅
  const config = EXECUTABLE_TOOLS[body.tool_slug];
  if (!config) return badRequest('Unsupported tool');

  try {
    // 6. Gemini API 호출 (스트리밍)
    const stream = await callAIProvider(config.provider, config.model, prompt);

    // 7. 횟수 차감 + 이력 저장 (비동기)
    void updateExecutionCount(user.id, isFree);
    void saveExecutionHistory({ user_id: user.id, recipe_slug, step, ...config, isFree });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    // 폴백 시도
    if (config.fallback) {
      const stream = await callAIProvider(config.fallback.provider, config.fallback.model, prompt);
      void updateExecutionCount(user.id, isFree);
      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' },
      });
    }
    throw error;
  }
}
```

### 9-5. Gemini API 호출 함수

```typescript
// lib/ai/providers.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function callGeminiText(model: string, prompt: string, systemPrompt?: string) {
  const geminiModel = genAI.getGenerativeModel({ model });

  const result = await geminiModel.generateContentStream({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
  });

  // ReadableStream으로 변환
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
      }
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

export async function callGeminiImage(prompt: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'image/png',
    },
  });

  // base64 이미지 반환
  const image = result.response.candidates?.[0]?.content?.parts?.[0];
  return image?.inlineData;
}
```

### 9-6. Groq 폴백 호출

```typescript
// lib/ai/providers.ts

export async function callGroqText(model: string, prompt: string, systemPrompt?: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      stream: true,
    }),
  });

  return response.body; // SSE 스트림
}
```

---

## 10. 결제 시스템 (토스페이먼츠)

### 10-1. 왜 토스페이먼츠인가

| PG사 | 장점 | 단점 |
|------|------|------|
| **토스페이먼츠** | 국내 최적화, 결제 위젯 SDK, 카카오/네이버/토스페이 통합 | - |
| Stripe | 글로벌, 문서 우수 | 원화 결제 수수료 높음, 카카오/네이버페이 미지원 |
| 아임포트 | 다양한 PG사 통합 | 추상화 레이어 추가 복잡도 |

### 10-2. 결제 흐름 상세

```
[프론트엔드]                        [백엔드]                     [토스페이먼츠]
     │                                │                               │
     │ 1. "결제 후 실행" 클릭          │                               │
     │──── POST /payment/create ──────>│                               │
     │                                │ 2. orderId 생성                │
     │<─── { orderId, amount } ───────│                               │
     │                                │                               │
     │ 3. 토스 결제 위젯 호출          │                               │
     │─────────────────────────────────────── 결제 요청 ──────────────>│
     │                                │                               │
     │<──────────────────── successUrl 리다이렉트 (paymentKey) ───────│
     │                                │                               │
     │ 4. 결제 승인 요청               │                               │
     │──── POST /payment/confirm ─────>│                               │
     │                                │──── 결제 승인 API ────────────>│
     │                                │<─── 승인 완료 ────────────────│
     │                                │                               │
     │                                │ 5. payments 저장               │
     │                                │ 6. AI 실행                    │
     │                                │ 7. recipe_executions 저장     │
     │                                │                               │
     │<─── { result, payment } ───────│                               │
```

### 10-3. 토스 결제 위젯 (프론트엔드)

```typescript
// components/recipe/PaymentCheckout.tsx

'use client';

import { loadTossPayments } from '@tosspayments/payment-sdk';

export default function PaymentCheckout({ orderId, amount, onSuccess }) {
  const handlePayment = async () => {
    const tossPayments = await loadTossPayments(
      process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY!
    );

    await tossPayments.requestPayment('카드', {
      amount,
      orderId,
      orderName: 'AIPICK AI 레시피 실행 (1회)',
      successUrl: `${window.location.origin}/api/recipe/payment/success`,
      failUrl: `${window.location.origin}/api/recipe/payment/fail`,
    });
  };

  return (
    <button onClick={handlePayment}>
      💳 결제 후 실행하기 (₩{amount.toLocaleString()})
    </button>
  );
}
```

### 10-4. 결제 승인 API

```typescript
// app/api/recipe/payment/confirm/route.ts

export async function POST(request: NextRequest) {
  const { paymentKey, orderId, amount } = await request.json();

  // 1. 토스 결제 승인
  const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(process.env.TOSS_PAYMENTS_SECRET_KEY + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Payment failed' }, { status: 400 });
  }

  const paymentResult = await response.json();

  // 2. DB 저장
  await supabase.from('payments').update({
    payment_key: paymentKey,
    status: 'confirmed',
    method: paymentResult.method,
    receipt_url: paymentResult.receipt?.url,
    confirmed_at: new Date().toISOString(),
  }).eq('order_id', orderId);

  // 3. AI 실행 트리거 (payment_id 포함)
  return NextResponse.json({
    success: true,
    payment_id: paymentKey,
  });
}
```

### 10-5. 환불 처리

```typescript
// 실행 실패 시 자동 환불
async function refundPayment(paymentKey: string, reason: string) {
  await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(process.env.TOSS_PAYMENTS_SECRET_KEY + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cancelReason: reason }),
  });

  await supabase.from('payments')
    .update({ status: 'refunded', cancelled_at: new Date().toISOString() })
    .eq('payment_key', paymentKey);
}
```

---

## 11. 프론트엔드 컴포넌트 설계

### 11-1. 신규 컴포넌트

| 컴포넌트 | 타입 | 위치 | 역할 |
|---------|------|------|------|
| `RecipePlayground.tsx` | Client | `components/recipe/` | 실행 패널 (프롬프트 편집 + 실행 버튼 + 결과) |
| `PlaygroundResult.tsx` | Client | `components/recipe/` | 결과 렌더러 (텍스트/이미지/코드 분기) |
| `PlaygroundTextResult.tsx` | Client | `components/recipe/` | 텍스트 스트리밍 결과 표시 |
| `PlaygroundImageResult.tsx` | Client | `components/recipe/` | 이미지 결과 + 다운로드 |
| `ExecutionCounter.tsx` | Client | `components/recipe/` | 남은 무료 횟수 표시 |
| `PaymentCheckout.tsx` | Client | `components/recipe/` | 토스페이먼츠 결제 위젯 |
| `LoginPromptModal.tsx` | Client | `components/auth/` | 비로그인 시 로그인 유도 |

### 11-2. RecipeStepCard 수정

```tsx
// RecipeStepCard.tsx 수정사항

export default function RecipeStepCard({ step, isLast, recipeSlug, previousResult }) {
  return (
    <div className="relative">
      {/* ... 기존 UI (스텝 번호, 제목, 도구, 설명, 프롬프트, 팁) ... */}

      {/* 신규: 실행 패널 (prompt_example이 있는 스텝만) */}
      {step.prompt_example && isExecutableStep(step.tool_slug) && (
        <RecipePlayground
          step={step}
          recipeSlug={recipeSlug}
          previousResult={previousResult}
        />
      )}
    </div>
  );
}
```

### 11-3. RecipePlayground 컴포넌트

```tsx
// components/recipe/RecipePlayground.tsx

'use client';

import { useState } from 'react';
import { Play, Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import ExecutionCounter from './ExecutionCounter';
import PlaygroundResult from './PlaygroundResult';
import PaymentCheckout from './PaymentCheckout';
import { DAILY_FREE_EXECUTIONS, EXECUTION_PRICE_KRW } from '@/lib/constants';

interface Props {
  step: RecipeStepV2;
  recipeSlug: string;
  previousResult?: string;
}

export default function RecipePlayground({ step, recipeSlug, previousResult }: Props) {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(step.prompt_example || '');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [executionStatus, setExecutionStatus] = useState({ daily_free_used: 0 });
  const [isExpanded, setIsExpanded] = useState(false);

  const isFree = executionStatus.daily_free_used < DAILY_FREE_EXECUTIONS;
  const remaining = DAILY_FREE_EXECUTIONS - executionStatus.daily_free_used;

  // 이전 단계 결과 삽입
  const finalPrompt = previousResult && step.use_previous
    ? prompt.replace('{{previous_result}}', previousResult)
    : prompt;

  const handleExecute = async () => {
    if (!user) { /* 로그인 모달 표시 */ return; }
    if (!isFree) { setShowPayment(true); return; }

    setIsLoading(true);
    try {
      const response = await fetch('/api/recipe/execute', {
        method: 'POST',
        body: JSON.stringify({
          recipe_slug: recipeSlug,
          step: step.step,
          tool_slug: step.tool_slug,
          prompt: finalPrompt,
          execution_type: step.execution_type || 'text',
        }),
      });

      if (response.status === 402) {
        setShowPayment(true);
        return;
      }

      // 스트리밍 읽기
      const reader = response.body?.getReader();
      // ... 스트리밍 처리
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
        <Lock className="mx-auto h-5 w-5 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-2">로그인하면 AI 레시피를 바로 실행할 수 있어요</p>
        <p className="text-xs text-gray-400">매일 {DAILY_FREE_EXECUTIONS}회 무료!</p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
      {/* 헤더 (접기/펼치기) */}
      <button onClick={() => setIsExpanded(!isExpanded)} className="...">
        ⚡ AIPICK에서 바로 실행
        <ExecutionCounter remaining={remaining} />
      </button>

      {isExpanded && (
        <>
          {/* 프롬프트 편집 영역 */}
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />

          {/* 실행 버튼 */}
          {isFree ? (
            <button onClick={handleExecute} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <Play />}
              {isFree ? '무료 실행하기' : `실행하기 (₩${EXECUTION_PRICE_KRW.toLocaleString()})`}
            </button>
          ) : (
            <PaymentCheckout onSuccess={handleExecute} />
          )}

          {/* 결과 표시 */}
          {result && <PlaygroundResult type={step.execution_type} result={result} />}
        </>
      )}
    </div>
  );
}
```

### 11-4. 단계 간 상태 관리

```typescript
// RecipeOptionSelector에서 관리 (기존 컴포넌트 수정)

const [stepResults, setStepResults] = useState<Record<number, string>>({});

// Step 1 완료 → stepResults[1] = '생성된 가사 텍스트...'
// Step 2의 RecipePlayground에 previousResult={stepResults[1]} 전달
// → 프롬프트 내 {{previous_result}} 자리에 자동 삽입
```

---

## 12. 레시피 데이터 확장

### 12-1. 확장할 필드 (RecipeStepV2)

기존 463개 스텝에 아래 필드를 추가:

```typescript
{
  step: 1,
  title: 'AI로 가사 작성',
  tool_slug: 'chatgpt',
  tool_name: 'ChatGPT 또는 Gemini, Perplexity',
  action: '...',
  prompt_example: '"감성적인 인디 팝 노래 가사를 써줘..."',

  // === 신규 필드 ===
  execution_type: 'text',
  system_prompt: '당신은 전문 작사가입니다. 사용자가 요청한 장르와 주제에 맞는 노래 가사를 작성하세요.',
  result_format: '[Verse], [Chorus] 등 구조 태그가 포함된 한국어 가사',
  use_previous: false,
}
```

### 12-2. 실행 가능 스텝 분석

57개 레시피, 463개 스텝 중 실행 가능 비율:

| tool_slug 기준 | 스텝 수 | 비율 | Tier |
|---------------|--------|------|------|
| chatgpt/claude/gemini/perplexity (텍스트) | ~318 | 69% | Tier 1 ✅ |
| dall-e-3/midjourney/stable-diffusion (이미지) | ~50 | 11% | Tier 1 ✅ |
| cursor/replit (코드) | ~15 | 3% | Tier 1 ✅ |
| suno/udio (음악) | ~20 | 4% | Tier 3 ❌ |
| runway/kling/pika (영상) | ~25 | 5% | Tier 3 ❌ |
| elevenlabs/typecast (음성) | ~15 | 3% | Tier 2 |
| canva/gamma/beautiful-ai (디자인) | ~20 | 4% | Tier 3 ❌ |

**결론**: 전체 스텝의 **약 83% (383개)가 Phase 1~2에서 실행 가능**

### 12-3. system_prompt 패턴 라이브러리

각 레시피 카테고리별로 표준 system_prompt 템플릿을 준비:

```typescript
// lib/ai/system-prompts.ts

export const SYSTEM_PROMPTS: Record<string, string> = {
  // 음악
  'lyrics': '당신은 전문 작사가입니다. 사용자가 요청한 장르와 주제에 맞는 노래 가사를 작성하세요. [Verse], [Chorus], [Bridge] 구조 태그를 포함하세요.',

  // 글쓰기
  'blog': '당신은 SEO에 최적화된 블로그 글을 작성하는 전문 콘텐츠 라이터입니다. 독자의 관심을 끌 수 있는 매력적인 제목과 구조화된 본문을 작성하세요.',
  'email': '당신은 비즈니스 이메일 전문가입니다. 목적에 맞는 격식있고 효과적인 이메일을 작성하세요.',
  'marketing': '당신은 마케팅 카피라이터입니다. 타겟 고객의 관심을 끌고 행동을 유도하는 카피를 작성하세요.',

  // 이미지
  'image': '사용자의 설명을 바탕으로 상세한 이미지 생성 프롬프트를 영어로 작성하세요. 스타일, 구도, 조명, 색상 등을 구체적으로 포함하세요.',

  // 코드
  'code': '당신은 시니어 개발자입니다. 깨끗하고 유지보수 가능한 코드를 작성하세요. 주석은 핵심 로직에만 추가하세요.',

  // 분석
  'analysis': '당신은 데이터 분석 전문가입니다. 주어진 데이터를 분석하고 인사이트를 도출하세요. 차트나 표를 활용한 시각화를 제안하세요.',

  // 교육
  'education': '당신은 교육 콘텐츠 전문가입니다. 학습 목표에 맞는 체계적이고 이해하기 쉬운 교육 자료를 작성하세요.',

  // 번역
  'translation': '당신은 전문 번역가입니다. 원문의 뉘앙스와 문맥을 살려 자연스럽게 번역하세요.',
};
```

---

## 13. 안전장치 및 제한

### 13-1. 프롬프트 안전성

```
1. 입력 길이 제한: 최대 2,000자
2. 기본 키워드 필터: 유해 콘텐츠 차단
3. AI Provider 자체 안전 필터 활용 (Gemini Safety Settings)
4. 이미지 생성: Gemini 자체 NSFW 필터 의존
5. 과도한 반복 입력 감지 (동일 프롬프트 연속 실행 제한)
```

### 13-2. Rate Limiting

```
- IP 기반: 분당 10회 요청
- 유저 기반: 분당 5회 요청
- 일일 무료: 3회/일 (자정 리셋)
- 일일 유료: 무제한 (단, 분당 rate limit 적용)
```

### 13-3. 실행 실패 처리

```
- 무료 실행 실패: 횟수 차감하지 않음
- 유료 실행 실패: 자동 전액 환불
- API 타임아웃 (30초): 에러 메시지 표시 + 재시도 버튼
- Provider 장애: 자동 폴백 (Gemini → Groq)
```

### 13-4. 어뷰징 방지

```
- 계정당 일일 최대 유료 실행: 50회
- 신규 가입 후 24시간 내 유료 결제 제한 (무료만 가능)
- 동일 IP 다중 계정 감지
- 의심스러운 패턴 시 자동 일시 정지 + 어드민 알림
```

---

## 14. 파일 목록 (신규/수정)

### 신규 파일

| 파일 | 목적 |
|------|------|
| `supabase/migrations/021_recipe_playground.sql` | DB 스키마 (user_executions, recipe_executions, payments) |
| `lib/ai/providers.ts` | AI Provider 호출 함수 (Gemini, Groq, Cerebras) |
| `lib/ai/system-prompts.ts` | 카테고리별 시스템 프롬프트 라이브러리 |
| `app/api/recipe/execute/route.ts` | 텍스트/코드 실행 API (스트리밍) |
| `app/api/recipe/execute-image/route.ts` | 이미지 실행 API |
| `app/api/recipe/status/route.ts` | 실행 상태 조회 API |
| `app/api/recipe/history/route.ts` | 실행 이력 조회 API |
| `app/api/recipe/payment/create/route.ts` | 결제 주문 생성 |
| `app/api/recipe/payment/confirm/route.ts` | 결제 승인 |
| `app/api/recipe/payment/webhook/route.ts` | 토스 웹훅 |
| `components/recipe/RecipePlayground.tsx` | 실행 패널 메인 컴포넌트 |
| `components/recipe/PlaygroundResult.tsx` | 결과 렌더러 |
| `components/recipe/PlaygroundTextResult.tsx` | 텍스트 스트리밍 결과 |
| `components/recipe/PlaygroundImageResult.tsx` | 이미지 결과 |
| `components/recipe/ExecutionCounter.tsx` | 남은 무료 횟수 표시 |
| `components/recipe/PaymentCheckout.tsx` | 결제 위젯 |
| `hooks/useExecution.ts` | 실행 상태 관리 커스텀 훅 |

### 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `types/index.ts` | ExecutionType, RecipeExecution, Payment 등 타입 추가 |
| `lib/constants.ts` | DAILY_FREE_EXECUTIONS, EXECUTION_PRICE_KRW, EXECUTABLE_TOOLS 등 상수 추가 |
| `components/recipe/RecipeStepCard.tsx` | RecipePlayground 컴포넌트 삽입 |
| `components/recipe/RecipeOptionSelector.tsx` | stepResults 상태 관리 추가 |
| `data/recipes.ts` | execution_type, system_prompt 필드 추가 |
| `data/recipes-v2.ts` | execution_type, system_prompt 필드 추가 |
| `data/recipes-v2-batch1~10.ts` | execution_type, system_prompt 필드 추가 (10개 파일) |
| `data/recipes-v2-expanded.ts` | execution_type, system_prompt 필드 추가 |

---

## 15. 구현 Phase 및 순서

### Phase 1: 텍스트 실행 MVP (비용 $0)

> 목표: 텍스트 생성만 지원, Gemini 무료 API, 무료 3회/일

| # | 작업 | 상세 |
|---|------|------|
| 1 | 타입 정의 | types/index.ts에 ExecutionType 등 추가 |
| 2 | 상수 정의 | lib/constants.ts에 DAILY_FREE_EXECUTIONS 등 추가 |
| 3 | DB 스키마 | 021_recipe_playground.sql 작성 |
| 4 | AI Provider 모듈 | lib/ai/providers.ts (Gemini + Groq 연동) |
| 5 | 시스템 프롬프트 | lib/ai/system-prompts.ts |
| 6 | 실행 API | /api/recipe/execute (스트리밍) |
| 7 | 상태 API | /api/recipe/status |
| 8 | RecipePlayground | 프론트엔드 실행 패널 |
| 9 | PlaygroundTextResult | 스트리밍 결과 표시 |
| 10 | ExecutionCounter | 남은 횟수 표시 |
| 11 | RecipeStepCard 수정 | 실행 패널 삽입 |
| 12 | 레시피 데이터 확장 | 텍스트 스텝에 execution_type 등 추가 |
| 13 | 빌드 검증 | npm run build |

### Phase 2: 이미지 생성 + 결제 시스템

| # | 작업 | 상세 |
|---|------|------|
| 1 | 토스페이먼츠 SDK | @tosspayments/payment-sdk 설치 |
| 2 | 결제 API | /api/recipe/payment/* (3개 라우트) |
| 3 | PaymentCheckout | 결제 위젯 컴포넌트 |
| 4 | 이미지 실행 API | /api/recipe/execute-image |
| 5 | PlaygroundImageResult | 이미지 결과 표시 |
| 6 | 환불 처리 | 실행 실패 시 자동 환불 |
| 7 | 마이페이지 | 결제 내역/영수증 조회 |

### Phase 3: 고급 모델 + 최적화

| # | 작업 | 상세 |
|---|------|------|
| 1 | OpenAI/Anthropic 연동 | 수익 확보 후 유료 API 추가 |
| 2 | 모델 선택 UI | 사용자가 AI 모델 선택 가능 |
| 3 | 캐싱 시스템 | 동일 프롬프트 캐시 (Redis or KV) |
| 4 | 실행 이력 갤러리 | 과거 실행 결과 열람 |
| 5 | 프롬프트 공유 | 커뮤니티에 프롬프트+결과 공유 |

### Phase 4: 멀티모달 확장

| # | 작업 | 상세 |
|---|------|------|
| 1 | 음성 합성 | ElevenLabs / Typecast API |
| 2 | 코드 실행 | 브라우저 샌드박스 |
| 3 | 결과 저장 | Supabase Storage에 이미지/오디오 저장 |
| 4 | BYOK | 사용자 자체 API 키 등록 (무제한 사용) |

---

## 16. 패키지 의존성

```bash
# Phase 1 (필수, 무료 API)
npm install @google/generative-ai    # Gemini API

# Phase 2 (결제)
npm install @tosspayments/payment-sdk  # 토스페이먼츠 (프론트)
# 토스 백엔드는 REST API 직접 호출 (SDK 불필요)

# Phase 3 (선택, 유료 API)
npm install openai                     # OpenAI
npm install @anthropic-ai/sdk          # Anthropic
```

---

## 17. 성공 지표

| 지표 | Phase 1 목표 (출시 1개월 후) | Phase 2 목표 (3개월 후) |
|------|-----|-----|
| 레시피 실행율 | 방문자 중 20% 1회 이상 실행 | 30% |
| 무료→유료 전환율 | 5% | 15% |
| 유료 일평균 건수 | 50건/일 | 200건/일 |
| 월 매출 | 150만원 | 600만원 |
| 재방문율 (7일) | 30% | 45% |
| 실행 성공율 | 95% 이상 | 98% 이상 |

---

## 18. 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Gemini 무료 한도 변경 | 서비스 비용 증가 | 다중 Provider 폴백 + 캐싱 강화 |
| 결제 분쟁/환불 요청 | 운영 부담 | 실행 실패 시 자동 환불, 명확한 약관 |
| 유해 콘텐츠 생성 | 법적 리스크 | Gemini Safety + 키워드 필터 + 신고 시스템 |
| 응답 지연/타임아웃 | UX 저하 | 30초 타임아웃 + 폴백 + 재시도 |
| 어뷰징 (무한 계정) | 비용 증가 | IP 제한 + 신규 계정 제한 + 감지 알림 |
| 토스페이먼츠 장애 | 매출 손실 | 에러 안내 + 무료 실행으로 임시 전환 |
| AIPICK API 키 노출 | 보안 사고 | 서버사이드 전용 + 환경변수 관리 |

---

## 19. 향후 확장 아이디어

1. **구독 플랜**: 월 9,900원에 일 30회 실행 (헤비 유저용)
2. **BYOK (Bring Your Own Key)**: 사용자 자체 API 키 등록 → 무제한 실행
3. **팀 워크스페이스**: 팀원과 레시피 공동 실행 + 결과 공유
4. **커뮤니티 연계**: "이 레시피로 만들었어요" 결과물 갤러리
5. **레시피 커스텀**: 사용자가 단계를 수정/추가하여 자신만의 레시피 생성
6. **프롬프트 마켓**: 커뮤니티 기반 프롬프트 공유/판매
7. **API 제공**: 외부 개발자에게 AIPICK 레시피 실행 API 제공
8. **교육 기관 할인**: 학교/기업 대상 단체 요금제
