# PLAN: AI 레시피 플레이그라운드 + 결제 시스템 구현

## 목표
AIPICK AI 레시피 시스템에 실행 기능 추가:
- Phase 1: 텍스트/코드 생성 (Gemini API, 무료 일 3회)
- Phase 2: 이미지 생성 + 토스페이먼츠 결제 (건당 ₩1,000)
- Recipe Data: alt_tools/기본 대안 로직 추가

## 구현 전략

### API 접근 방식
- Gemini API: 직접 fetch REST (SDK 미설치, 의존성 최소화)
- Groq API: fetch REST (폴백)
- TossPayments: 프론트엔드 script 로더 + 백엔드 REST API

### 핵심 파일 목록

#### 신규 생성
| 파일 | 목적 |
|------|------|
| supabase/migrations/021_recipe_playground.sql | DB 스키마 |
| lib/ai/providers.ts | Gemini + Groq REST 호출 |
| lib/ai/system-prompts.ts | 카테고리별 시스템 프롬프트 |
| app/api/recipe/execute/route.ts | 텍스트/코드 실행 API (SSE 스트리밍) |
| app/api/recipe/execute-image/route.ts | 이미지 생성 API |
| app/api/recipe/status/route.ts | 남은 무료 횟수 조회 |
| app/api/recipe/history/route.ts | 실행 이력 조회 |
| app/api/recipe/payment/create/route.ts | 결제 주문 생성 |
| app/api/recipe/payment/confirm/route.ts | 결제 승인 |
| app/api/recipe/payment/webhook/route.ts | 토스 웹훅 |
| components/recipe/RecipePlayground.tsx | 실행 패널 메인 |
| components/recipe/PlaygroundResult.tsx | 결과 렌더러 |
| components/recipe/PlaygroundTextResult.tsx | 텍스트 스트리밍 결과 |
| components/recipe/PlaygroundImageResult.tsx | 이미지 결과 |
| components/recipe/ExecutionCounter.tsx | 남은 횟수 표시 |
| components/recipe/PaymentCheckout.tsx | 결제 위젯 |
| hooks/useExecution.ts | 실행 상태 관리 훅 |

#### 수정
| 파일 | 변경 내용 |
|------|----------|
| types/index.ts | ExecutionType 등 타입 추가, RecipeStepV2에 alt_tools/execution 필드 추가 |
| lib/constants.ts | DAILY_FREE_EXECUTIONS, EXECUTABLE_TOOLS 등 추가 |
| components/recipe/RecipeStepCard.tsx | nameMap 확장 + 기본 alt_tools 로직 + RecipePlayground 삽입 |
| components/recipe/RecipeOptionSelector.tsx | stepResults 상태 관리 추가 |
| app/profile/page.tsx | 결제 내역 탭 추가 |

## 구현 순서
Phase 1: types → constants → DB → AI providers → APIs → Components → RecipeStepCard
Phase 2: 이미지 API → 결제 APIs → PaymentCheckout → PlaygroundImageResult
Data: RecipeStepCard 기본 alt_tools 로직 (nameMap + DEFAULT_ALT_TOOLS)
