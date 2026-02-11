-- ==========================================
-- 010: Daily Picks — 매일 자동 선정 AI 도구
-- ==========================================

CREATE TABLE IF NOT EXISTS daily_picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pick_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  pick_type TEXT NOT NULL CHECK (pick_type IN ('trending', 'new', 'hidden_gem', 'price_drop')),
  reason TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pick_date, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_picks_date ON daily_picks(pick_date DESC);

ALTER TABLE daily_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read daily picks"
  ON daily_picks FOR SELECT USING (true);
