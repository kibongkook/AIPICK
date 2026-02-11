-- ==========================================
-- 006: AI 서비스 평가 체계 공식화
-- 4계층 하이브리드 스코어링 + 평점 집계 + 품질 게이트
-- 모든 가중치/임계값을 DB 기반으로 관리
-- ==========================================

-- ==========================================
-- 1. 평가 계층 정의 테이블
-- 4계층 하이브리드 스코어링 구조를 DB에 공식 기록
-- ==========================================
CREATE TABLE IF NOT EXISTS evaluation_tiers (
  id SERIAL PRIMARY KEY,
  tier_number INT NOT NULL UNIQUE,
  tier_key TEXT NOT NULL UNIQUE,           -- 'tier1_quality', 'tier2_community', ...
  tier_name TEXT NOT NULL,                 -- '기술 품질', '커뮤니티 검증', ...
  weight_percent INT NOT NULL,             -- 35, 40, 15, 10
  description TEXT NOT NULL,
  applies_to TEXT NOT NULL DEFAULT 'all'   -- 'all', 'llm_only'
    CHECK (applies_to IN ('all', 'llm_only')),
  redistribution_target TEXT,              -- 비해당 시 재분배 대상 tier_key
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO evaluation_tiers (tier_number, tier_key, tier_name, weight_percent, description, applies_to, redistribution_target) VALUES
  (1, 'tier1_quality', '기술 품질', 35,
   'LMSYS Chatbot Arena Elo, HuggingFace 벤치마크, Artificial Analysis 품질 인덱스 기반. LLM/AI 모델 전용 — 비-LLM 도구는 2계층으로 재분배.',
   'llm_only', 'tier2_community'),
  (2, 'tier2_community', '커뮤니티 검증', 40,
   'Product Hunt 평점/투표, GitHub 스타, HackerNews 언급 기반. 모든 AI 서비스에 적용. 비-LLM 도구는 1계층+3계층(pricing) 가중치가 여기로 재분배되어 최대 85%까지 확대.',
   'all', NULL),
  (3, 'tier3_practical', '실용성', 15,
   'OpenRouter 가격 경쟁력(LLM 전용) + 한국어 지원 여부(전체). 가성비와 접근성 평가.',
   'all', NULL),
  (4, 'tier4_internal', 'AIPICK 자체', 10,
   'AIPICK 플랫폼 사용자 평점과 참여도(북마크+업보트). 사용자 기반 확보 후 본격 반영.',
   'all', NULL)
ON CONFLICT (tier_key) DO UPDATE SET
  tier_name = EXCLUDED.tier_name,
  weight_percent = EXCLUDED.weight_percent,
  description = EXCLUDED.description,
  applies_to = EXCLUDED.applies_to,
  redistribution_target = EXCLUDED.redistribution_target;

-- ==========================================
-- 2. 평점 집계(Rating Aggregation) 가중치 추가
-- rating_avg (1-5 별점) 계산에 사용
-- ==========================================
INSERT INTO scoring_weights (weight_key, weight_value, description, category) VALUES
  ('rating_agg_ph', 40, 'Product Hunt 리뷰 평점 가중치 (%)', 'rating_aggregation'),
  ('rating_agg_benchmark', 25, '벤치마크 품질 점수 가중치 (%)', 'rating_aggregation'),
  ('rating_agg_aa', 15, 'Artificial Analysis 품질 인덱스 가중치 (%)', 'rating_aggregation'),
  ('rating_agg_github', 20, 'GitHub 인기도 가중치 (%)', 'rating_aggregation'),
  ('rating_agg_g2', 0, 'G2 평점 가중치 (유료 API, 현재 비활성)', 'rating_aggregation')
ON CONFLICT (weight_key) DO UPDATE SET
  weight_value = EXCLUDED.weight_value,
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- ==========================================
-- 3. 품질 게이트(Quality Gate) 임계값
-- 도구 자동 승인 기준을 DB에서 관리
-- ==========================================
INSERT INTO scoring_weights (weight_key, weight_value, description, category) VALUES
  -- 기준 1: 사용자 기반
  ('qg_ph_votes_min', 100, 'Product Hunt 최소 투표수', 'quality_gate'),
  ('qg_github_stars_min', 500, 'GitHub 최소 스타수', 'quality_gate'),
  -- 기준 2: 커뮤니티 피드백
  ('qg_ph_reviews_min', 10, 'Product Hunt 최소 리뷰수', 'quality_gate'),
  ('qg_github_issues_min', 50, 'GitHub 최소 이슈수', 'quality_gate'),
  -- 기준 3: 벤치마크 성능
  ('qg_benchmark_avg_min', 60, 'HuggingFace 벤치마크 최소 평균', 'quality_gate'),
  ('qg_aa_quality_min', 50, 'Artificial Analysis 최소 품질 인덱스', 'quality_gate'),
  -- 기준 4: 커뮤니티 언급
  ('qg_hn_mentions_min', 3, 'HackerNews 최소 언급 횟수 (90일)', 'quality_gate'),
  -- 기준 5: 분야 독보적
  ('qg_category_top_n', 3, '카테고리 내 상위 N위', 'quality_gate'),
  -- 자동 승인 기준
  ('qg_min_criteria', 3, '자동 승인에 필요한 최소 기준 충족 수 (5개 중)', 'quality_gate'),
  -- 품질 점수 산정 가중치
  ('qg_score_ph_votes', 20, '품질 점수 산정: PH 투표 가중치 (%)', 'quality_gate'),
  ('qg_score_github', 20, '품질 점수 산정: GitHub 스타 가중치 (%)', 'quality_gate'),
  ('qg_score_feedback', 15, '품질 점수 산정: 피드백 가중치 (%)', 'quality_gate'),
  ('qg_score_mentions', 15, '품질 점수 산정: 커뮤니티 언급 가중치 (%)', 'quality_gate'),
  ('qg_score_benchmark', 15, '품질 점수 산정: 벤치마크 가중치 (%)', 'quality_gate'),
  ('qg_score_aa', 15, '품질 점수 산정: AA 품질 가중치 (%)', 'quality_gate')
ON CONFLICT (weight_key) DO UPDATE SET
  weight_value = EXCLUDED.weight_value,
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- ==========================================
-- 4. 평가 데이터 소스 현황 테이블
-- 각 외부 소스의 상태와 수집 범위를 기록
-- ==========================================
CREATE TABLE IF NOT EXISTS evaluation_data_sources (
  id SERIAL PRIMARY KEY,
  source_key TEXT NOT NULL UNIQUE,
  source_name TEXT NOT NULL,
  source_url TEXT,
  tier_key TEXT NOT NULL REFERENCES evaluation_tiers(tier_key),
  data_type TEXT NOT NULL,                  -- 'score', 'rating', 'count', 'boolean'
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  api_type TEXT,                            -- 'rest', 'graphql', 'scrape', 'none'
  fetch_frequency TEXT DEFAULT 'daily',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO evaluation_data_sources (source_key, source_name, source_url, tier_key, data_type, is_free, api_type, fetch_frequency, description) VALUES
  -- 1계층: 기술 품질
  ('lmsys_arena', 'LMSYS Chatbot Arena', 'https://lmarena.ai', 'tier1_quality', 'score', TRUE, 'rest', 'weekly',
   'Elo 레이팅 기반 LLM 순위. HuggingFace Spaces API에서 리더보드 데이터 수집.'),
  ('huggingface_llm', 'HuggingFace Open LLM Leaderboard', 'https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard', 'tier1_quality', 'score', TRUE, 'rest', 'weekly',
   'MMLU, HellaSwag, ARC 등 벤치마크 점수. API로 모델별 성능 데이터 수집.'),
  ('artificial_analysis', 'Artificial Analysis', 'https://artificialanalysis.ai', 'tier1_quality', 'score', TRUE, 'rest', 'weekly',
   '품질 인덱스, 속도(TTFT, TPS), 가격 등 종합 AI 모델 분석.'),
  -- 2계층: 커뮤니티 검증
  ('product_hunt', 'Product Hunt', 'https://api.producthunt.com/v2/api/graphql', 'tier2_community', 'rating', TRUE, 'graphql', 'daily',
   '사용자 리뷰 평점(0-5), 투표수, 리뷰수. GraphQL API로 수집.'),
  ('github', 'GitHub', 'https://api.github.com', 'tier2_community', 'count', TRUE, 'rest', 'daily',
   '스타, 포크, 이슈 수 등 오픈소스 인기 지표. REST API로 수집.'),
  ('hackernews', 'HackerNews', 'https://hn.algolia.com/api/v1/search', 'tier2_community', 'count', TRUE, 'rest', 'weekly',
   '최근 90일간 AI 도구 관련 언급 횟수. Algolia Search API로 수집.'),
  -- 3계층: 실용성
  ('openrouter', 'OpenRouter', 'https://openrouter.ai/api/v1/models', 'tier3_practical', 'score', TRUE, 'rest', 'daily',
   'LLM API 가격 비교. 입출력 토큰 단가 기반 가성비 점수.'),
  -- 비활성 (유료)
  ('g2', 'G2', 'https://www.g2.com', 'tier2_community', 'rating', FALSE, 'rest', 'none',
   '기업 소프트웨어 리뷰 평점. 유료 API ($15K+/년), 현재 비활성.')
ON CONFLICT (source_key) DO UPDATE SET
  source_name = EXCLUDED.source_name,
  tier_key = EXCLUDED.tier_key,
  is_free = EXCLUDED.is_free,
  is_active = EXCLUDED.is_active,
  description = EXCLUDED.description;

-- ==========================================
-- 5. RLS 정책
-- ==========================================
ALTER TABLE evaluation_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 읽기" ON evaluation_tiers FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON evaluation_data_sources FOR SELECT USING (true);

-- ==========================================
-- 6. 인덱스
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_sw_category ON scoring_weights(category);
CREATE INDEX IF NOT EXISTS idx_eds_tier ON evaluation_data_sources(tier_key);
CREATE INDEX IF NOT EXISTS idx_eds_active ON evaluation_data_sources(is_active);
