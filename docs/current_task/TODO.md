# TODO: AI 레시피 플레이그라운드 구현

## Phase 1: 데이터 레이어 + AI
- [x] types/index.ts에 ExecutionType, UserExecution, RecipeExecution, Payment 타입 추가, RecipeStepV2에 alt_tools/execution 필드 추가
- [x] lib/constants.ts에 DAILY_FREE_EXECUTIONS, EXECUTABLE_TOOLS, PAYMENT_CONFIG 등 추가
- [x] supabase/migrations/021_recipe_playground.sql 생성
- [x] lib/ai/providers.ts (Gemini + Groq REST 호출)
- [x] lib/ai/system-prompts.ts (카테고리별 시스템 프롬프트)

## Phase 2: API 레이어
- [x] app/api/recipe/execute/route.ts (텍스트/코드 스트리밍)
- [x] app/api/recipe/status/route.ts (무료 횟수 조회)
- [x] app/api/recipe/execute-image/route.ts (이미지 생성)
- [x] app/api/recipe/history/route.ts (실행 이력)
- [x] app/api/recipe/payment/create/route.ts
- [x] app/api/recipe/payment/confirm/route.ts
- [x] app/api/recipe/payment/webhook/route.ts
- [x] app/api/recipe/payment/list/route.ts (결제 내역 조회)

## Phase 3: 프론트엔드 컴포넌트
- [x] components/recipe/ExecutionCounter.tsx
- [x] components/recipe/PlaygroundTextResult.tsx
- [x] components/recipe/PlaygroundImageResult.tsx
- [x] components/recipe/PlaygroundResult.tsx
- [x] components/recipe/PaymentCheckout.tsx
- [x] components/recipe/RecipePlayground.tsx
- [x] hooks/useExecution.ts

## Phase 4: RecipeStepCard + RecipeOptionSelector 수정
- [x] RecipeStepCard nameMap 확장 (mistral, deepseek, grok 등)
- [x] RecipeStepCard에 DEFAULT_ALT_TOOLS 로직 추가
- [x] RecipeStepCard에 RecipePlayground 삽입
- [x] RecipeOptionCard에 stepResults/onStepResult props 추가
- [x] RecipeOptionSelector에 stepResults 상태 관리 추가
- [x] RecipeDetailPage에 recipeSlug/recipeCategory 전달

## Phase 5: 마이페이지 결제 내역
- [x] profile/page.tsx에 결제 내역 탭 추가 (CreditCard 아이콘 + 결제 상태 표시)

## Phase 6: 검증
- [x] npm run build 통과 (434 pages generated)
