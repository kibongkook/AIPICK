# AIPICK 문서 인덱스

> 최종 수정일: 2026-02-23
> 이 파일은 모든 문서의 진입점입니다.

---

## 📐 기획 문서

| 문서 | 설명 | 대상 |
|------|------|------|
| [OVERVIEW.md](./OVERVIEW.md) | 프로젝트 비전, 타겟, 5대 탐색경로, 핵심 원칙 | 신규 팀원, 전체 파악 |
| [PRD.md](./PRD.md) | 전체 PRD (레거시 — 모듈별 문서로 이관 중) | 참고용 |

---

## 🧩 모듈별 기획서 (`docs/modules/`)

각 모듈은 독립적으로 수정 가능한 단일 기획 단위입니다.

| 모듈 | 문서 | 핵심 경로 |
|------|------|----------|
| AI 찾기 (탐색) | [M1-DISCOVERY.md](./modules/M1-DISCOVERY.md) | `/discover`, `/search`, `/category/[slug]` |
| 랭킹 시스템 | [M2-RANKING.md](./modules/M2-RANKING.md) | `/rankings`, `/trending` |
| 직군/학년별 추천 | [M3-CURATION.md](./modules/M3-CURATION.md) | `/jobs`, `/education` |
| 커뮤니티 | [M4-COMMUNITY.md](./modules/M4-COMMUNITY.md) | `/community`, `/community/write` |
| 콘텐츠 (뉴스/가이드) | [M5-CONTENT.md](./modules/M5-CONTENT.md) | `/news`, `/guides` |
| **AI 레시피** | [M5-RECIPE.md](./modules/M5-RECIPE.md) | `/recipes` — v1.0 / v2.0 버전 선택 |
| 인증/프로필/컬렉션 | [M6-AUTH.md](./modules/M6-AUTH.md) | `/auth`, `/profile`, `/bookmarks`, `/collections` |
| 관리자/데이터 파이프라인 | [M7-ADMIN.md](./modules/M7-ADMIN.md) | `/admin`, `cron/` |
| **모듈 연결고리** | [CONNECTIONS.md](./modules/CONNECTIONS.md) | 모듈 간 데이터 흐름 + API 의존성 |

---

## 🗄️ 개발 문서

| 문서 | 설명 |
|------|------|
| [DB-SCHEMA.md](./DB-SCHEMA.md) | 전체 DB 스키마 (ERD + 테이블 상세 + RLS) |
| [PHASES.md](./PHASES.md) | Phase별 개발 진행 현황 (Phase 1~8) |
| [TODO.md](./TODO.md) | 현재 할일 + 배포 전 체크리스트 |
| [CODE_REVIEW.md](./CODE_REVIEW.md) | 코드 품질/보안/성능 리뷰 보고서 |

---

## 📊 데이터 문서

| 문서 | 설명 |
|------|------|
| [DATA_SOURCES.md](./DATA_SOURCES.md) | 외부 데이터 수집 출처 및 파이프라인 |
| [COVERAGE_GAPS.md](./COVERAGE_GAPS.md) | 현재 데이터 커버리지 분석 및 누락 현황 |
| [REAL-DATA-MIGRATION.md](./REAL-DATA-MIGRATION.md) | Supabase 실제 데이터 마이그레이션 가이드 |

---

## 🗺️ 어디서 찾아야 하나?

```
기능 추가/수정 → modules/M?-*.md 해당 모듈 기획서 확인
DB 스키마 확인 → DB-SCHEMA.md
현재 진행 상황 → PHASES.md + TODO.md
보안/성능 이슈 → CODE_REVIEW.md
모듈 간 의존성 → modules/CONNECTIONS.md
데이터 소스     → DATA_SOURCES.md
```

---

## 📁 현재 코드베이스 규모

| 항목 | 수치 |
|------|------|
| 페이지 | 25개 페이지 + 56개 API 라우트 |
| 컴포넌트 | 98개 파일 |
| AI 도구 데이터 | 216개 (`data/seed.json`) |
| DB 마이그레이션 | 16개 SQL 파일 |
| 개발 Phase | 1~8 (Phase 8 진행중) |
