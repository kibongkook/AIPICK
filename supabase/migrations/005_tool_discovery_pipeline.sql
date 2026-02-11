-- ==========================================
-- 005: 도구 자동 발견 & 품질 게이트 파이프라인
-- ==========================================

-- ==========================================
-- 1. 도구 후보 스테이징 테이블
-- 외부 소스에서 발견된 AI 도구 후보를 관리
-- ==========================================
CREATE TABLE IF NOT EXISTS tool_candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  discovered_from TEXT NOT NULL,           -- 'product_hunt', 'github', 'hackernews'
  category_slug TEXT,                      -- 자동 분류된 카테고리

  -- 품질 지표 (외부 소스에서 수집)
  ph_votes INT NOT NULL DEFAULT 0,
  ph_reviews INT NOT NULL DEFAULT 0,
  ph_rating NUMERIC(3,1) DEFAULT 0,
  github_stars INT NOT NULL DEFAULT 0,
  github_forks INT NOT NULL DEFAULT 0,
  github_issues INT NOT NULL DEFAULT 0,
  hn_mentions INT NOT NULL DEFAULT 0,
  benchmark_score NUMERIC(5,2),
  aa_quality_index NUMERIC(5,2),

  -- 평가 결과
  criteria_passed JSONB NOT NULL DEFAULT '[]',  -- ['user_base', 'feedback', ...]
  criteria_met INT NOT NULL DEFAULT 0,          -- 통과한 기준 수 (0-5)
  quality_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  auto_approved BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'merged')),

  -- 타임스탬프
  reviewed_at TIMESTAMPTZ,
  merged_at TIMESTAMPTZ,
  raw_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tc_status ON tool_candidates(status);
CREATE INDEX idx_tc_quality ON tool_candidates(quality_score DESC);
CREATE INDEX idx_tc_criteria ON tool_candidates(criteria_met DESC);
CREATE INDEX idx_tc_source ON tool_candidates(discovered_from);
CREATE INDEX idx_tc_slug ON tool_candidates(slug);

-- ==========================================
-- 2. 도구 발견 이력 로그
-- 각 Discovery 실행의 결과를 기록
-- ==========================================
CREATE TABLE IF NOT EXISTS tool_discovery_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,                  -- 'product_hunt', 'github', 'hackernews'
  run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  candidates_found INT NOT NULL DEFAULT 0,
  candidates_new INT NOT NULL DEFAULT 0, -- 기존에 없던 새 후보 수
  candidates_approved INT NOT NULL DEFAULT 0,
  errors TEXT[],
  duration_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tdl_source ON tool_discovery_log(source, run_at DESC);

-- ==========================================
-- 3. RLS 정책
-- ==========================================
ALTER TABLE tool_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_discovery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 읽기" ON tool_candidates FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON tool_discovery_log FOR SELECT USING (true);

-- ==========================================
-- 4. external_data_sources에 discovery 소스 추가
-- ==========================================
INSERT INTO external_data_sources (source_key, display_name, source_url, fetch_frequency) VALUES
  ('lmsys_arena', 'LMSYS Chatbot Arena', 'https://lmarena.ai', 'weekly'),
  ('hackernews', 'HackerNews AI 언급', 'https://hn.algolia.com/api/v1/search', 'weekly'),
  ('rating_aggregator', '평점 집계', NULL, 'daily'),
  ('discovery_product_hunt', 'PH 도구 발견', 'https://api.producthunt.com/v2/api/graphql', 'daily'),
  ('discovery_github', 'GitHub 도구 발견', 'https://api.github.com/search/repositories', 'daily'),
  ('discovery_hackernews', 'HN AI 언급 탐색', 'https://hn.algolia.com/api/v1/search', 'daily')
ON CONFLICT (source_key) DO NOTHING;

-- ==========================================
-- 5. 4계층 스코어링 가중치 업데이트
-- ==========================================
DELETE FROM scoring_weights;
INSERT INTO scoring_weights (weight_key, weight_value, description, category) VALUES
  -- 1계층: 기술 품질 (35%) — LLM 전용
  ('tier1_arena_elo', 15, 'LMSYS Chatbot Arena Elo 레이팅', 'tier1_quality'),
  ('tier1_benchmark', 12, 'HuggingFace 벤치마크 점수', 'tier1_quality'),
  ('tier1_artificial_analysis', 8, 'Artificial Analysis 품질 인덱스', 'tier1_quality'),
  -- 2계층: 커뮤니티 검증 (40%) — 전체
  ('tier2_ph_rating', 15, 'Product Hunt 리뷰 평점', 'tier2_community'),
  ('tier2_ph_votes', 5, 'Product Hunt 투표수', 'tier2_community'),
  ('tier2_github', 12, 'GitHub 스타/포크', 'tier2_community'),
  ('tier2_hn_mentions', 8, 'HackerNews 언급 횟수', 'tier2_community'),
  -- 3계층: 실용성 (15%)
  ('tier3_pricing', 10, 'OpenRouter 가격 경쟁력', 'tier3_practical'),
  ('tier3_korean', 5, '한국어 지원 여부', 'tier3_practical'),
  -- 4계층: AIPICK 자체 (10%)
  ('tier4_user_rating', 5, 'AIPICK 사용자 평점', 'tier4_internal'),
  ('tier4_engagement', 5, 'AIPICK 북마크+업보트', 'tier4_internal')
ON CONFLICT (weight_key) DO UPDATE SET
  weight_value = EXCLUDED.weight_value,
  description = EXCLUDED.description,
  category = EXCLUDED.category;
