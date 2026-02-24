# AIPICK - Product Requirements Document (PRD)

> 최종 수정일: 2026-02-20
> 버전: v4.0 — 모듈별 문서로 재구성됨

---

## ⚠️ 이 문서에 대해

PRD v3.0의 내용은 **모듈별 문서로 이관**되었습니다.
새로운 기획 수정은 아래 모듈 문서에서 직접 편집하세요.

---

## 문서 구조 안내

```
docs/
├── README.md              ← 전체 문서 인덱스 (여기서 시작)
├── OVERVIEW.md            ← 프로젝트 비전, 타겟, 5대 탐색경로
├── DB-SCHEMA.md           ← 전체 DB 스키마
├── modules/
│   ├── M1-DISCOVERY.md   ← AI 찾기, 검색, 카테고리, 비교
│   ├── M2-RANKING.md     ← 랭킹 시스템, 스코어링, 트렌딩
│   ├── M3-CURATION.md    ← 직군별/학년별 추천
│   ├── M4-COMMUNITY.md   ← 커뮤니티, 태그, 업보트, 댓글
│   ├── M5-CONTENT.md     ← 뉴스, 가이드, 레시피
│   ├── M6-AUTH.md        ← 인증, 프로필, 북마크, 컬렉션
│   ├── M7-ADMIN.md       ← 관리자, 크론잡, 파이프라인
│   └── CONNECTIONS.md    ← 모듈 간 데이터 흐름 + API 맵
├── PHASES.md              ← 개발 진행 상태 (Phase 1~8)
└── TODO.md                ← 현재 할일
```

→ [전체 문서 인덱스 보기](./README.md)
→ [프로젝트 개요 보기](./OVERVIEW.md)

---

## 핵심 수치 (2026-02-20 기준)

| 항목 | 수치 |
|------|------|
| AI 도구 데이터 | 216개 (`data/seed.json`) |
| 목적 카테고리 | 12개 |
| 직군 | 10개 |
| 학년 단계 | 6개 |
| 개발 Phase | 8개 (Phase 8 진행중) |
| 페이지 | 25개 + API 56개 |
| DB 마이그레이션 | 16개 |

---

## 즉시 해결 필요한 보안 이슈

| 이슈 | 파일 | 내용 |
|------|------|------|
| XSS 취약점 | `app/guides/[slug]/page.tsx` | dangerouslySetInnerHTML + 미이스케이핑 |
| Admin 인증 버그 | `lib/auth/adminCheck.ts` | 미설정 시 `return true` → `false` 수정 |
| Cron 인증 버그 | `app/api/cron/*/route.ts` | CRON_SECRET 미설정 시 공개 접근 |
| SQL 인젝션 위험 | `app/api/community/v2/route.ts` | keyword 파라미터 이스케이핑 |

→ 상세: [CODE_REVIEW.md](./CODE_REVIEW.md)
