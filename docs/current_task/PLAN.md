# PLAN: AI 서비스 변경 이력 시스템 (tool_updates)

## 목표
AIPICK에 등록된 229개 AI 서비스의 변경사항(신기능, 가격 변경, 모델 업데이트 등)을 추적하고, 사용자에게 타임라인 형태로 보여주는 시스템 구축.

## 아키텍처 설계

### 수정/생성 파일 목록

#### 신규 파일 (6개)
| 파일 | 목적 |
|------|------|
| `supabase/migrations/020_tool_updates.sql` | DB 스키마 |
| `components/tool-updates/ToolUpdateTimeline.tsx` | 타임라인 UI |
| `app/updates/page.tsx` | 전체 업데이트 피드 `/updates` |
| `app/api/admin/tool-updates/route.ts` | 어드민 CRUD API |
| `app/api/cron/tool-updates-fetch/route.ts` | 자동 수집 Cron |
| `app/admin/tool-updates/page.tsx` | 어드민 관리 페이지 |

#### 수정 파일 (5개)
| 파일 | 변경 |
|------|------|
| `types/index.ts` | ToolUpdate 타입 추가 |
| `lib/constants.ts` | TOOL_UPDATE_TYPES, UPDATE_IMPACT 상수 |
| `lib/supabase/queries.ts` | 쿼리 함수 3개 추가 |
| `app/tools/[slug]/page.tsx` | 타임라인 삽입 |
| `data/seed.json` | tool_updates 시드 데이터 |

### 데이터 흐름
- tool_updates 테이블 → tools FK 연결
- Supabase 우선 → seed.json 폴백 패턴
- update_type 6종: feature, model, pricing, improvement, api, other
- impact 2단계: major, minor

## 구현 순서
1. Phase 1: 데이터 레이어 (types → constants → SQL → seed → queries)
2. Phase 2: API 레이어 (admin CRUD, cron job)
3. Phase 3: UI 레이어 (timeline, detail page, feed page, admin page)
4. Phase 4: 검증 (npm run build)
