-- ==========================================
-- 020: AI 서비스 변경 이력 (tool_updates)
-- 각 도구의 신기능, 모델 업데이트, 가격 변경 등을 추적
-- ==========================================

CREATE TABLE tool_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL DEFAULT 'other'
    CHECK (update_type IN ('feature', 'model', 'pricing', 'improvement', 'api', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  image_url TEXT,
  version TEXT,
  impact TEXT NOT NULL DEFAULT 'minor'
    CHECK (impact IN ('major', 'minor')),
  announced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 도구별 업데이트 조회 (타임라인)
CREATE INDEX idx_tool_updates_tool ON tool_updates(tool_id, announced_at DESC);

-- 전체 최신 업데이트 피드
CREATE INDEX idx_tool_updates_announced ON tool_updates(announced_at DESC);

-- 타입별 필터
CREATE INDEX idx_tool_updates_type ON tool_updates(update_type);
