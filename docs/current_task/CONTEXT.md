# CONTEXT: tool_updates 시스템 설계 배경

## 선택한 접근 방식
별도 `tool_updates` 테이블로 분리, tools FK 연결

## 대안과 비교
| 방식 | 장점 | 단점 | 선택 |
|------|------|------|------|
| news 테이블에 통합 | 단일 테이블 | 데이터 성격 불일치, 구조화 어려움 | X |
| **별도 tool_updates 테이블** | 구조화된 데이터, 도구별 타임라인 | 테이블 추가 | **O** |

## 참고해야 할 기존 코드
| 파일 경로 | 참고 이유 |
|----------|----------|
| `lib/supabase/queries.ts` | getNews 등 Supabase→seed 폴백 패턴 |
| `app/api/admin/news/route.ts` | Admin CRUD 패턴 |
| `app/api/cron/news-fetch/route.ts` | Cron Job 인증/추적 패턴 |
| `lib/constants.ts` | NEWS_CATEGORIES 상수 패턴 |
| `types/index.ts` | News interface 타입 패턴 |
| `app/news/page.tsx` | 뉴스 피드 UI 패턴 |
