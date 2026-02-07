-- ==========================================
-- 004: 외부 데이터 파이프라인 & 하이브리드 스코어링
-- ==========================================

-- ==========================================
-- 1. 외부 데이터 소스 메타 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS external_data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  source_url TEXT,
  fetch_frequency TEXT NOT NULL DEFAULT 'weekly',
  last_fetched_at TIMESTAMPTZ,
  last_status TEXT DEFAULT 'pending',
  last_error TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eds_source_key ON external_data_sources(source_key);

-- 기본 소스 시드
INSERT INTO external_data_sources (source_key, display_name, source_url, fetch_frequency) VALUES
  ('github', 'GitHub API', 'https://api.github.com', 'weekly'),
  ('product_hunt', 'Product Hunt', 'https://api.producthunt.com/v2/api/graphql', 'weekly'),
  ('huggingface_llm', 'HuggingFace Open LLM Leaderboard', 'https://huggingface.co/spaces/open-llm-leaderboard', 'weekly'),
  ('openrouter', 'OpenRouter Models & Pricing', 'https://openrouter.ai/api/v1/models', 'daily'),
  ('artificial_analysis', 'Artificial Analysis', 'https://artificialanalysis.ai', 'weekly')
ON CONFLICT (source_key) DO NOTHING;

-- ==========================================
-- 2. 도구별 외부 점수 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS tool_external_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  source_key TEXT NOT NULL,
  normalized_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  raw_data JSONB NOT NULL DEFAULT '{}',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tool_id, source_key)
);

CREATE INDEX idx_tes_tool ON tool_external_scores(tool_id);
CREATE INDEX idx_tes_source ON tool_external_scores(source_key);
CREATE INDEX idx_tes_score ON tool_external_scores(normalized_score DESC);

-- ==========================================
-- 3. LLM 벤치마크 전용 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS tool_benchmark_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  benchmark_source TEXT NOT NULL,
  overall_score NUMERIC(6,2),
  mmlu NUMERIC(6,2),
  hellaswag NUMERIC(6,2),
  arc_challenge NUMERIC(6,2),
  truthfulqa NUMERIC(6,2),
  winogrande NUMERIC(6,2),
  gsm8k NUMERIC(6,2),
  humaneval NUMERIC(6,2),
  elo_rating INT,
  elo_rank INT,
  quality_index NUMERIC(5,2),
  speed_index NUMERIC(5,2),
  speed_ttft_ms INT,
  speed_tps NUMERIC(8,2),
  extra_scores JSONB NOT NULL DEFAULT '{}',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tool_id, benchmark_source)
);

CREATE INDEX idx_tbs_tool ON tool_benchmark_scores(tool_id);
CREATE INDEX idx_tbs_source ON tool_benchmark_scores(benchmark_source);
CREATE INDEX idx_tbs_overall ON tool_benchmark_scores(overall_score DESC);

-- ==========================================
-- 4. 외부 가격 데이터 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS tool_pricing_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  input_price_per_1m_tokens NUMERIC(10,4),
  output_price_per_1m_tokens NUMERIC(10,4),
  context_window INT,
  max_output_tokens INT,
  free_tier_details TEXT,
  pro_monthly_price NUMERIC(10,2),
  enterprise_monthly_price NUMERIC(10,2),
  value_score NUMERIC(5,2),
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tool_id, source)
);

CREATE INDEX idx_tpd_tool ON tool_pricing_data(tool_id);
CREATE INDEX idx_tpd_value ON tool_pricing_data(value_score DESC);

-- ==========================================
-- 5. 일별 트렌드 스냅샷 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS trend_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  ranking_position INT NOT NULL,
  ranking_score NUMERIC(10,2) NOT NULL,
  visit_count INT NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  bookmark_count INT NOT NULL DEFAULT 0,
  upvote_count INT NOT NULL DEFAULT 0,
  external_score NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tool_id, snapshot_date)
);

CREATE INDEX idx_ts_date ON trend_snapshots(snapshot_date DESC, ranking_position);
CREATE INDEX idx_ts_tool_date ON trend_snapshots(tool_id, snapshot_date DESC);

-- ==========================================
-- 6. 카테고리 인기도 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS category_popularity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_slug TEXT NOT NULL,
  period TEXT NOT NULL DEFAULT 'weekly',
  total_visits INT NOT NULL DEFAULT 0,
  total_reviews INT NOT NULL DEFAULT 0,
  total_bookmarks INT NOT NULL DEFAULT 0,
  tool_count INT NOT NULL DEFAULT 0,
  avg_ranking_score NUMERIC(10,2) NOT NULL DEFAULT 0,
  popularity_score NUMERIC(10,2) NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category_slug, period)
);

CREATE INDEX idx_cp_popularity ON category_popularity(period, popularity_score DESC);

-- ==========================================
-- 7. 스코어링 가중치 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS scoring_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  weight_key TEXT NOT NULL UNIQUE,
  weight_value NUMERIC(5,2) NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 기본 가중치 시드 (내부 50 + 외부 50 = 100)
INSERT INTO scoring_weights (weight_key, weight_value, description, category) VALUES
  ('internal_visit_count', 15, '방문수 가중치', 'internal'),
  ('internal_rating_avg', 15, '평균 평점 가중치', 'internal'),
  ('internal_review_count', 10, '리뷰 수 가중치', 'internal'),
  ('internal_bookmark_count', 5, '북마크 수 가중치', 'internal'),
  ('internal_upvote_count', 5, '업보트 수 가중치', 'internal'),
  ('external_github', 10, 'GitHub stars/forks 가중치', 'external'),
  ('external_product_hunt', 10, 'Product Hunt 업보트/리뷰 가중치', 'external'),
  ('external_benchmark', 15, 'LLM 벤치마크 점수 가중치', 'external'),
  ('external_pricing', 5, '가격 경쟁력 가중치', 'external'),
  ('external_artificial_analysis', 10, 'Artificial Analysis 품질 인덱스 가중치', 'external')
ON CONFLICT (weight_key) DO NOTHING;

-- ==========================================
-- 8. tools 테이블 컬럼 추가
-- ==========================================
ALTER TABLE tools ADD COLUMN IF NOT EXISTS hybrid_score NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS external_score NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS internal_score NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS trend_direction TEXT NOT NULL DEFAULT 'stable'
  CHECK (trend_direction IN ('up', 'down', 'stable', 'new'));
ALTER TABLE tools ADD COLUMN IF NOT EXISTS trend_magnitude INT NOT NULL DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS has_benchmark_data BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS github_stars INT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS github_forks INT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS product_hunt_upvotes INT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS model_identifiers TEXT[] NOT NULL DEFAULT '{}';

-- hybrid_score 인덱스
CREATE INDEX IF NOT EXISTS idx_tools_hybrid_score ON tools(hybrid_score DESC);
CREATE INDEX IF NOT EXISTS idx_tools_trend ON tools(trend_direction, trend_magnitude DESC);

-- 기존 ranking_score 값을 hybrid_score로 초기 복사
UPDATE tools SET hybrid_score = ranking_score, internal_score = ranking_score WHERE hybrid_score = 0 AND ranking_score > 0;

-- ==========================================
-- 9. RLS 정책
-- ==========================================
ALTER TABLE external_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_external_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_benchmark_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_pricing_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_popularity ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 읽기" ON external_data_sources FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON tool_external_scores FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON tool_benchmark_scores FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON tool_pricing_data FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON trend_snapshots FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON category_popularity FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON scoring_weights FOR SELECT USING (true);
