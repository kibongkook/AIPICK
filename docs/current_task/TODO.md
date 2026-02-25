# TODO: tool_updates 시스템 구현

## Phase 1: 데이터 레이어
- [x] types/index.ts에 ToolUpdateType, UpdateImpact, ToolUpdate 타입 추가
- [x] lib/constants.ts에 TOOL_UPDATE_TYPES, UPDATE_IMPACT 상수 추가
- [x] supabase/migrations/020_tool_updates.sql 생성
- [x] data/seed.json에 tool_updates 시드 데이터 추가
- [x] lib/supabase/queries.ts에 쿼리 함수 추가

## Phase 2: API 레이어
- [x] app/api/admin/tool-updates/route.ts 어드민 CRUD
- [x] app/api/cron/tool-updates-fetch/route.ts Cron Job

## Phase 3: UI 레이어
- [x] components/tool-updates/ToolUpdateTimeline.tsx 타임라인 컴포넌트
- [x] app/tools/[slug]/page.tsx에 타임라인 삽입
- [x] app/updates/page.tsx 전체 업데이트 피드 페이지
- [x] app/admin/tool-updates/page.tsx 어드민 관리 페이지

## Phase 4: 검증
- [x] npm run build 통과
- [x] seed.json JSON 유효성 확인
