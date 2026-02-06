-- ==========================================
-- AIPICK 초기 스키마 v2.0
-- ==========================================

-- UUID 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. 카테고리
-- ==========================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ==========================================
-- 2. AI 서비스 (tools)
-- ==========================================
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  long_description TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  logo_url TEXT,
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('Free', 'Freemium', 'Paid')),
  free_quota_detail TEXT,
  monthly_price NUMERIC(10,2),
  rating_avg NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  visit_count INT NOT NULL DEFAULT 0,
  upvote_count INT NOT NULL DEFAULT 0,
  ranking_score NUMERIC(10,2) NOT NULL DEFAULT 0,
  weekly_visit_delta INT NOT NULL DEFAULT 0,
  prev_ranking INT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_editor_pick BOOLEAN NOT NULL DEFAULT FALSE,
  supports_korean BOOLEAN NOT NULL DEFAULT FALSE,
  pros TEXT[] NOT NULL DEFAULT '{}',
  cons TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tools_slug ON tools(slug);
CREATE INDEX idx_tools_category ON tools(category_id);
CREATE INDEX idx_tools_ranking ON tools(ranking_score DESC);
CREATE INDEX idx_tools_visit ON tools(visit_count DESC);
CREATE INDEX idx_tools_rating ON tools(rating_avg DESC);
CREATE INDEX idx_tools_pricing ON tools(pricing_type);
CREATE INDEX idx_tools_editor_pick ON tools(is_editor_pick) WHERE is_editor_pick = TRUE;

-- ==========================================
-- 3. 직군 카테고리
-- ==========================================
CREATE TABLE job_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_categories_slug ON job_categories(slug);

-- ==========================================
-- 4. 교육 단계
-- ==========================================
CREATE TABLE edu_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  age_range TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_edu_levels_slug ON edu_levels(slug);

-- ==========================================
-- 5. 직군-툴 추천 매핑
-- ==========================================
CREATE TABLE job_tool_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_category_id UUID NOT NULL REFERENCES job_categories(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  recommendation_level TEXT NOT NULL CHECK (recommendation_level IN ('essential', 'recommended', 'optional')),
  reason TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_category_id, tool_id)
);

CREATE INDEX idx_job_tool_rec_job ON job_tool_recommendations(job_category_id);
CREATE INDEX idx_job_tool_rec_tool ON job_tool_recommendations(tool_id);

-- ==========================================
-- 6. 학년-툴 추천 매핑
-- ==========================================
CREATE TABLE edu_tool_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  edu_level_id UUID NOT NULL REFERENCES edu_levels(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  safety_level TEXT NOT NULL CHECK (safety_level IN ('safe', 'guided', 'advanced')),
  use_case TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (edu_level_id, tool_id)
);

CREATE INDEX idx_edu_tool_rec_edu ON edu_tool_recommendations(edu_level_id);
CREATE INDEX idx_edu_tool_rec_tool ON edu_tool_recommendations(tool_id);

-- ==========================================
-- 7. 리뷰
-- ==========================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  helpful_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tool_id, user_id)
);

CREATE INDEX idx_reviews_tool ON reviews(tool_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ==========================================
-- 8. 기능별 세부 평가
-- ==========================================
CREATE TABLE tool_feature_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  ease_of_use INT CHECK (ease_of_use BETWEEN 1 AND 5),
  korean_support INT CHECK (korean_support BETWEEN 1 AND 5),
  free_quota INT CHECK (free_quota BETWEEN 1 AND 5),
  feature_variety INT CHECK (feature_variety BETWEEN 1 AND 5),
  value_for_money INT CHECK (value_for_money BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (review_id)
);

CREATE INDEX idx_feature_ratings_tool ON tool_feature_ratings(tool_id);

-- ==========================================
-- 9. 북마크
-- ==========================================
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, tool_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_tool ON bookmarks(tool_id);

-- ==========================================
-- 10. 업보트
-- ==========================================
CREATE TABLE upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, tool_id)
);

CREATE INDEX idx_upvotes_tool ON upvotes(tool_id);

-- ==========================================
-- 11. 댓글
-- ==========================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type TEXT NOT NULL CHECK (target_type IN ('tool', 'news', 'guide')),
  target_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INT NOT NULL DEFAULT 0,
  is_reported BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_target ON comments(target_type, target_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- ==========================================
-- 12. 컬렉션
-- ==========================================
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collections_user ON collections(user_id);
CREATE INDEX idx_collections_public ON collections(is_public, like_count DESC);

-- ==========================================
-- 13. 컬렉션 아이템
-- ==========================================
CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (collection_id, tool_id)
);

CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);

-- ==========================================
-- 14. 뉴스
-- ==========================================
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source_url TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('update', 'launch', 'industry', 'pricing', 'general')),
  related_tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
  view_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_published ON news(published_at DESC);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_view ON news(view_count DESC);

-- ==========================================
-- 15. AI 활용 가이드
-- ==========================================
CREATE TABLE guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'tip' CHECK (category IN ('job', 'education', 'tip', 'tutorial')),
  related_job_id UUID REFERENCES job_categories(id) ON DELETE SET NULL,
  related_edu_id UUID REFERENCES edu_levels(id) ON DELETE SET NULL,
  view_count INT NOT NULL DEFAULT 0,
  author_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guides_slug ON guides(slug);
CREATE INDEX idx_guides_category ON guides(category);

-- ==========================================
-- 16. 주간 랭킹 스냅샷
-- ==========================================
CREATE TABLE weekly_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  ranking INT NOT NULL,
  ranking_score NUMERIC(10,2) NOT NULL,
  visit_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tool_id, week_start)
);

CREATE INDEX idx_weekly_rankings_week ON weekly_rankings(week_start, ranking);

-- ==========================================
-- RLS (Row Level Security) 정책
-- ==========================================
-- 공개 읽기 가능 테이블
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE edu_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tool_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE edu_tool_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_feature_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_rankings ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "공개 읽기" ON categories FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON tools FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON job_categories FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON edu_levels FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON job_tool_recommendations FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON edu_tool_recommendations FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON reviews FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON tool_feature_ratings FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON comments FOR SELECT USING (true);
CREATE POLICY "공개 컬렉션 읽기" ON collections FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "컬렉션 아이템 읽기" ON collection_items FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON news FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON guides FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON weekly_rankings FOR SELECT USING (true);

-- 인증된 사용자 쓰기 정책
CREATE POLICY "본인 북마크 관리" ON bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "본인 업보트 관리" ON upvotes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "본인 리뷰 작성" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "본인 리뷰 수정" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "본인 리뷰 삭제" ON reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "본인 평가 작성" ON tool_feature_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "본인 댓글 작성" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "본인 댓글 수정" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "본인 댓글 삭제" ON comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "본인 컬렉션 관리" ON collections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "본인 컬렉션 아이템 관리" ON collection_items FOR ALL
  USING (EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND user_id = auth.uid()));

-- ==========================================
-- 랭킹 점수 계산 함수
-- ==========================================
CREATE OR REPLACE FUNCTION calculate_ranking_score(
  p_visit_count INT,
  p_rating_avg NUMERIC,
  p_review_count INT,
  p_upvote_count INT
) RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    (p_visit_count * 0.4 / GREATEST((SELECT MAX(visit_count) FROM tools), 1)) +
    (p_rating_avg / 5.0 * 0.3) +
    (p_review_count * 0.2 / GREATEST((SELECT MAX(review_count) FROM tools), 1)) +
    (p_upvote_count * 0.1 / GREATEST((SELECT MAX(upvote_count) FROM tools), 1))
  ) * 100;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 리뷰 통계 자동 갱신 트리거
-- ==========================================
CREATE OR REPLACE FUNCTION update_tool_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tools SET
    rating_avg = COALESCE((SELECT AVG(rating) FROM reviews WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)), 0),
    review_count = (SELECT COUNT(*) FROM reviews WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.tool_id, OLD.tool_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_stats
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_tool_review_stats();
