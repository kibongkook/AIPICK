-- ============================================
-- 016: 평점 + 점수 시스템 재설계
-- 외부 데이터 기반 객관적 평가 체계
-- ============================================

-- 1. 외부 식별자 컬럼 추가 (평점 수집용)
ALTER TABLE tools ADD COLUMN IF NOT EXISTS app_store_id TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS play_store_id TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS trustpilot_domain TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS g2_slug TEXT;

-- 2. 신뢰도 시스템 컬럼
ALTER TABLE tools ADD COLUMN IF NOT EXISTS confidence_level TEXT NOT NULL DEFAULT 'none'
  CHECK (confidence_level IN ('high', 'medium', 'low', 'none'));
ALTER TABLE tools ADD COLUMN IF NOT EXISTS confidence_source_count INT NOT NULL DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS rating_sources TEXT[] NOT NULL DEFAULT '{}';

-- 3. 신규 외부 데이터 소스 등록
INSERT INTO external_data_sources (source_key, display_name, source_url, fetch_frequency, is_enabled) VALUES
  ('app_store', 'Apple App Store', 'https://itunes.apple.com/lookup', 'weekly', true),
  ('play_store', 'Google Play Store', 'https://play.google.com', 'weekly', true),
  ('tranco', 'Tranco List', 'https://tranco-list.eu', 'monthly', true),
  ('open_pagerank', 'Open PageRank', 'https://openpagerank.com', 'monthly', true),
  ('trustpilot', 'Trustpilot', 'https://api.trustpilot.com', 'weekly', true),
  ('g2', 'G2 Reviews', 'https://www.g2.com', 'weekly', true)
ON CONFLICT (source_key) DO NOTHING;

-- 4. 평점 집계 가중치 (6-소스 시스템)
INSERT INTO scoring_weights (weight_key, weight_value, description, category) VALUES
  ('rating_agg_app_store', 30, 'App Store 평점 가중치', 'rating_aggregation'),
  ('rating_agg_play_store', 25, 'Google Play 평점 가중치', 'rating_aggregation'),
  ('rating_agg_g2', 20, 'G2 평점 가중치', 'rating_aggregation'),
  ('rating_agg_trustpilot', 10, 'Trustpilot 평점 가중치', 'rating_aggregation'),
  ('rating_agg_aipick', 5, 'AIPICK 자체 평점 가중치', 'rating_aggregation')
ON CONFLICT (weight_key) DO UPDATE SET weight_value = EXCLUDED.weight_value;

-- 5. 점수 4-카테고리 가중치
INSERT INTO scoring_weights (weight_key, weight_value, description, category) VALUES
  ('cat_user_reviews', 40, '사용자 리뷰 카테고리 비중', 'hybrid_v2'),
  ('cat_popularity', 25, '인기도 카테고리 비중', 'hybrid_v2'),
  ('cat_community', 25, '커뮤니티 카테고리 비중', 'hybrid_v2'),
  ('cat_benchmarks', 10, '벤치마크 카테고리 비중 (LLM)', 'hybrid_v2'),
  ('review_app_store', 30, 'App Store 리뷰 서브가중치', 'hybrid_v2'),
  ('review_play_store', 25, 'Play Store 리뷰 서브가중치', 'hybrid_v2'),
  ('review_g2', 20, 'G2 리뷰 서브가중치', 'hybrid_v2'),
  ('review_trustpilot', 10, 'Trustpilot 리뷰 서브가중치', 'hybrid_v2'),
  ('review_product_hunt', 15, 'Product Hunt 리뷰 서브가중치', 'hybrid_v2'),
  ('pop_tranco', 50, 'Tranco 인기도 서브가중치', 'hybrid_v2'),
  ('pop_pagerank', 50, 'PageRank 인기도 서브가중치', 'hybrid_v2'),
  ('comm_ph_upvotes', 35, 'PH 업보트 커뮤니티 서브가중치', 'hybrid_v2'),
  ('comm_github', 40, 'GitHub 커뮤니티 서브가중치', 'hybrid_v2'),
  ('comm_hn_mentions', 25, 'HN 멘션 커뮤니티 서브가중치', 'hybrid_v2'),
  ('bench_lmsys_arena', 50, 'LMSYS Arena 벤치마크 서브가중치', 'hybrid_v2'),
  ('bench_huggingface', 50, 'HuggingFace 벤치마크 서브가중치', 'hybrid_v2')
ON CONFLICT (weight_key) DO UPDATE SET weight_value = EXCLUDED.weight_value;

-- 6. 가짜 rating_avg 초기화 (review_count=0인데 평점이 있는 도구)
UPDATE tools SET rating_avg = 0 WHERE review_count = 0 AND rating_avg > 0;

-- 7. 인덱스
CREATE INDEX IF NOT EXISTS idx_tools_confidence ON tools(confidence_level);
CREATE INDEX IF NOT EXISTS idx_tools_app_store_id ON tools(app_store_id) WHERE app_store_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tools_play_store_id ON tools(play_store_id) WHERE play_store_id IS NOT NULL;
