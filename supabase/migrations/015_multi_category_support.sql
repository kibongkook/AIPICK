-- ==========================================
-- 015: 다중 카테고리 지원 (Multi-Category Support)
-- 하나의 AI 서비스가 여러 카테고리에 속할 수 있도록 변경
-- ==========================================

-- 1. tool_categories 중간 테이블 생성 (many-to-many)
CREATE TABLE tool_categories (
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,  -- 메인 카테고리 표시
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tool_id, category_id)
);

CREATE INDEX idx_tool_categories_tool ON tool_categories(tool_id);
CREATE INDEX idx_tool_categories_category ON tool_categories(category_id);
CREATE INDEX idx_tool_categories_primary ON tool_categories(is_primary) WHERE is_primary = TRUE;

-- 2. 기존 데이터 마이그레이션: tools.category_id → tool_categories
-- 모든 기존 도구의 카테고리를 primary로 설정하여 마이그레이션
INSERT INTO tool_categories (tool_id, category_id, is_primary, sort_order)
SELECT
  id as tool_id,
  category_id,
  TRUE as is_primary,  -- 기존 카테고리는 모두 primary로 설정
  0 as sort_order
FROM tools
WHERE category_id IS NOT NULL;

-- 3. tools 테이블에서 category_id 컬럼 제거
-- (모든 데이터가 마이그레이션된 후)
ALTER TABLE tools DROP COLUMN category_id;

-- 4. 뷰 생성: 도구와 카테고리 조인을 쉽게 하기 위한 뷰
CREATE OR REPLACE VIEW tools_with_categories AS
SELECT
  t.*,
  ARRAY_AGG(
    json_build_object(
      'id', c.id,
      'name', c.name,
      'slug', c.slug,
      'icon', c.icon,
      'description', c.description,
      'color', c.color,
      'sort_order', c.sort_order,
      'is_primary', tc.is_primary
    )
    ORDER BY tc.is_primary DESC, tc.sort_order
  ) as categories
FROM tools t
LEFT JOIN tool_categories tc ON t.id = tc.tool_id
LEFT JOIN categories c ON tc.category_id = c.id
GROUP BY t.id;

-- 5. 카테고리별 도구 조회를 위한 함수
CREATE OR REPLACE FUNCTION get_tools_by_category(category_slug_param TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  long_description TEXT,
  url TEXT,
  logo_url TEXT,
  pricing_type TEXT,
  free_quota_detail TEXT,
  monthly_price NUMERIC,
  rating_avg NUMERIC,
  review_count INT,
  visit_count INT,
  upvote_count INT,
  ranking_score NUMERIC,
  weekly_visit_delta INT,
  prev_ranking INT,
  tags TEXT[],
  is_editor_pick BOOLEAN,
  supports_korean BOOLEAN,
  pros TEXT[],
  cons TEXT[],
  usage_tips TEXT[],
  hybrid_score NUMERIC,
  external_score NUMERIC,
  internal_score NUMERIC,
  trend_direction TEXT,
  trend_magnitude NUMERIC,
  has_benchmark_data BOOLEAN,
  github_stars INT,
  github_forks INT,
  product_hunt_upvotes INT,
  model_identifiers TEXT[],
  sample_output TEXT,
  sample_output_prompt TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  categories JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.slug,
    t.description,
    t.long_description,
    t.url,
    t.logo_url,
    t.pricing_type,
    t.free_quota_detail,
    t.monthly_price,
    t.rating_avg,
    t.review_count,
    t.visit_count,
    t.upvote_count,
    t.ranking_score,
    t.weekly_visit_delta,
    t.prev_ranking,
    t.tags,
    t.is_editor_pick,
    t.supports_korean,
    t.pros,
    t.cons,
    t.usage_tips,
    t.hybrid_score,
    t.external_score,
    t.internal_score,
    t.trend_direction,
    t.trend_magnitude,
    t.has_benchmark_data,
    t.github_stars,
    t.github_forks,
    t.product_hunt_upvotes,
    t.model_identifiers,
    t.sample_output,
    t.sample_output_prompt,
    t.created_at,
    t.updated_at,
    jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'slug', c.slug,
        'icon', c.icon,
        'description', c.description,
        'color', c.color,
        'sort_order', c.sort_order,
        'is_primary', tc.is_primary
      )
      ORDER BY tc.is_primary DESC, tc.sort_order
    ) as categories
  FROM tools t
  INNER JOIN tool_categories tc ON t.id = tc.tool_id
  INNER JOIN categories c ON tc.category_id = c.id
  WHERE c.slug = category_slug_param
  GROUP BY t.id;
END;
$$ LANGUAGE plpgsql;

-- 6. 각 도구마다 최소 1개의 primary category를 갖도록 보장하는 트리거
CREATE OR REPLACE FUNCTION ensure_primary_category()
RETURNS TRIGGER AS $$
BEGIN
  -- primary category가 없어지는 경우 (UPDATE or DELETE)
  IF (TG_OP = 'DELETE' AND OLD.is_primary = TRUE) OR
     (TG_OP = 'UPDATE' AND OLD.is_primary = TRUE AND NEW.is_primary = FALSE) THEN

    -- 해당 도구에 다른 primary가 있는지 확인
    IF NOT EXISTS (
      SELECT 1 FROM tool_categories
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
      AND is_primary = TRUE
      AND (category_id != OLD.category_id OR TG_OP = 'DELETE')
    ) THEN
      -- 다른 카테고리가 있으면 그 중 첫번째를 primary로 승격
      UPDATE tool_categories
      SET is_primary = TRUE
      WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
      AND (category_id != OLD.category_id OR TG_OP = 'DELETE')
      ORDER BY sort_order
      LIMIT 1;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_primary_category_trigger
AFTER UPDATE OR DELETE ON tool_categories
FOR EACH ROW
EXECUTE FUNCTION ensure_primary_category();

-- 7. 코멘트
COMMENT ON TABLE tool_categories IS '도구-카테고리 다대다 매핑 테이블';
COMMENT ON COLUMN tool_categories.is_primary IS '메인 카테고리 여부 (UI에서 우선 표시)';
COMMENT ON COLUMN tool_categories.sort_order IS '도구 내에서 카테고리 표시 순서';
