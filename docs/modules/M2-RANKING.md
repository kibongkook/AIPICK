# M2. 랭킹 시스템 모듈

> 담당 경로: `/rankings`, `/rankings/[category]`, `/trending`
> 관련 모듈: [M7-ADMIN](./M7-ADMIN.md) (크론잡), [M1-DISCOVERY](./M1-DISCOVERY.md) (랭킹 필터)
> 최종 수정일: 2026-02-20

---

## 1. 모듈 개요

AI 서비스의 인기도를 객관적·다면적으로 측정하고 표시하는 시스템.
외부 벤치마크 + 사용자 평가 + 커뮤니티 활동 + AI 메타데이터를 결합한
**하이브리드 스코어링** 방식을 사용한다.

### 핵심 페이지
| 페이지 | 경로 | 역할 |
|--------|------|------|
| 전체 랭킹 | `/rankings` | 전체 TOP 100 + 카테고리 필터 탭 |
| 카테고리별 랭킹 | `/rankings/[category]` | 해당 카테고리 TOP 20 |
| 주간 트렌딩 | `/trending` | 이번 주 급상승 TOP 10 |

---

## 2. 하이브리드 스코어링 시스템

**위치**: `lib/scoring/`

### 2.1 4계층 가중치

```
hybrid_score (0~100) =
  외부 벤치마크 (25%)
  + 사용자 평가 (25%)
  + 커뮤니티 활동 (25%)
  + AI 메타데이터 (25%)
```

| 계층 | 가중치 | 세부 구성 |
|------|--------|---------|
| 외부 벤치마크 | 25% | LMSYS Elo(40%) + AlpacaEval(35%) + Artificial Analysis(25%) |
| 사용자 평가 | 25% | 내부 리뷰 별점(60%) + Product Hunt 평점(40%) |
| 커뮤니티 활동 | 25% | 업보트(40%) + 북마크(30%) + 댓글(20%) + 컬렉션 추가(10%) |
| AI 메타데이터 | 25% | GitHub Stars(40%) + 출시일 신선도(30%) + 무료 사용량(30%) |

### 2.2 신뢰도 등급 (Confidence)

데이터가 충분하지 않은 서비스는 낮은 신뢰도 표시:

| 등급 | 조건 | 표시 |
|------|------|------|
| High | 리뷰 20개+, 벤치마크 데이터 있음 | 초록 |
| Medium | 리뷰 5~19개 | 노랑 |
| Low | 리뷰 5개 미만 | 회색 |

**컴포넌트**: `components/ranking/ConfidenceBadge.tsx`

### 2.3 레거시 스코어링 (ranking_score)
구버전 — 현재 일부 페이지에서 병행 사용:
```
ranking_score = 방문수(40%) + 평점(30%) + 리뷰수(20%) + 북마크수(10%)
```

---

## 3. /rankings — 전체 랭킹 페이지

### 3.1 페이지 구성

```
┌────────────────────────────────────────┐
│ 카테고리 필터 탭 (전체 | 12개 카테고리)  │
├────────────────────────────────────────┤
│ # │ 서비스명 │ 카테고리 │ 평점 │ 순위변동 │
│ 1 │ ChatGPT  │ 챗봇     │ ⭐4.8│ ▲2     │
│ 2 │ Claude   │ 챗봇     │ ⭐4.7│ ▼1     │
│ ...                                    │
│ (TOP 100)                              │
└────────────────────────────────────────┘
```

### 3.2 순위 변동 표시

| 상태 | 아이콘 | 색상 |
|------|--------|------|
| 순위 상승 | ▲N | 초록 |
| 순위 하락 | ▼N | 빨강 |
| 변동 없음 | — | 회색 |
| 신규 | NEW | 파랑 |

**계산**: `current_ranking - prev_ranking` (weekly_rankings 테이블 비교)

### 3.3 1~3위 특별 디자인
- 1위: Gold 배지 🥇
- 2위: Silver 배지 🥈
- 3위: Bronze 배지 🥉

**컴포넌트**: `components/ranking/TrendBadge.tsx`

### 3.4 성능 이슈
- **현재**: Dynamic 렌더링 (매 요청 렌더링)
- **권장**: ISR `export const revalidate = 1800` (30분 캐시)

---

## 4. /trending — 주간 트렌딩

### 4.1 구성
- 이번 주 급상승 TOP 10 (`weekly_visit_delta` 기준)
- 신규 등록 서비스 하이라이트
- 무료 쿼터 변경 알림 (예: "Claude 무료 사용량 늘었습니다")

### 4.2 데이터 갱신
- **크론잡**: `/api/cron/trends` — 매주 월요일 실행
- **갱신 항목**: `weekly_visit_delta`, `prev_ranking`, `weekly_rankings` 스냅샷

---

## 5. 벤치마크 점수 표시

### 5.1 외부 벤치마크 소스

| 소스 | 데이터 | 크론 |
|------|--------|------|
| LMSYS Chatbot Arena | Elo 점수, 승률 | `/api/cron/benchmarks` |
| AlpacaEval | 승률 | `/api/cron/benchmarks` |
| Artificial Analysis | 품질 지수, 속도, 가격 | `/api/cron/artificial-analysis` |

### 5.2 벤치마크 UI

**컴포넌트**: `components/ranking/BenchmarkScores.tsx`
- 한글 설명 + 등급 뱃지 (S/A/B/C/D)
- 색상 코딩 (초록→빨강 그라데이션)
- 프로그레스 바

**상수**: `lib/constants.ts` → `BENCHMARK_EXPLANATIONS`, `SPEED_EXPLANATIONS`

---

## 6. 관련 컴포넌트

| 컴포넌트 | 파일 | 역할 |
|---------|------|------|
| 랭킹 페이지 | `app/rankings/page.tsx` | 전체 랭킹 |
| 트렌딩 페이지 | `app/trending/page.tsx` | 주간 급상승 |
| 순위 뱃지 | `components/ranking/TrendBadge.tsx` | ▲▼ 순위 변동 |
| 신뢰도 뱃지 | `components/ranking/ConfidenceBadge.tsx` | 데이터 신뢰도 |
| 벤치마크 점수 | `components/ranking/BenchmarkScores.tsx` | 외부 벤치마크 |
| 하이브리드 스코어 | `lib/scoring/` | 점수 계산 로직 |

---

## 7. DB 테이블 의존성

```
tools
  ├── ranking_score (레거시 종합점수)
  ├── hybrid_score (신규 하이브리드)
  ├── upvote_count
  ├── weekly_visit_delta (주간 방문 변동)
  └── prev_ranking (이전 주 순위)

weekly_rankings (스냅샷)
  ├── tool_id
  ├── week_start
  ├── ranking (해당 주 순위)
  ├── ranking_score
  └── visit_count
```

→ 전체 스키마: [DB-SCHEMA.md](../DB-SCHEMA.md)

---

## 8. 크론잡 스케줄

| 크론 | 주기 | 역할 |
|------|------|------|
| `/api/cron/ranking` | 매일 자정 | hybrid_score 재계산 |
| `/api/cron/trends` | 매주 월요일 | 주간 스냅샷 저장, weekly_visit_delta 갱신 |
| `/api/cron/benchmarks` | 매주 | 외부 벤치마크 데이터 수집 |

---

## 9. 미결 이슈 / 개선 포인트

| 이슈 | 우선순위 | 메모 |
|------|---------|------|
| 랭킹 페이지 ISR 미적용 | High | `revalidate = 1800` 추가 필요 |
| 주간 랭킹 Cron 미등록 | High | Vercel Cron 등록 필요 |
| hybrid_score vs ranking_score 혼용 | Medium | 단일화 검토 필요 |
| 카테고리별 랭킹 페이지 ISR | Medium | 동일하게 ISR 필요 |
