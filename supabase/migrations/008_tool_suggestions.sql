-- AI 서비스 제안 테이블
CREATE TABLE tool_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 제안자 정보
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,

  -- 제안 도구 정보
  tool_name TEXT NOT NULL,
  tool_url TEXT NOT NULL,
  tool_description TEXT NOT NULL,
  category_slug TEXT NOT NULL,

  -- 제안 이유
  reason TEXT NOT NULL,

  -- 투표 및 상태
  vote_count INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'merged')),

  -- 승인/병합 정보
  merged_tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
  merged_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_tool_suggestions_user_id ON tool_suggestions(user_id);
CREATE INDEX idx_tool_suggestions_status ON tool_suggestions(status);
CREATE INDEX idx_tool_suggestions_vote_count ON tool_suggestions(vote_count DESC);
CREATE INDEX idx_tool_suggestions_created_at ON tool_suggestions(created_at DESC);

-- RLS 정책
ALTER TABLE tool_suggestions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자: 읽기 (pending/approved만)
CREATE POLICY "Anyone can view pending or approved suggestions"
  ON tool_suggestions FOR SELECT
  USING (status IN ('pending', 'approved'));

-- 인증된 사용자: 제안 생성
CREATE POLICY "Authenticated users can create suggestions"
  ON tool_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 본인: 수정 (pending만)
CREATE POLICY "Users can update their own pending suggestions"
  ON tool_suggestions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 본인: 삭제 (pending만)
CREATE POLICY "Users can delete their own pending suggestions"
  ON tool_suggestions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- 투표 테이블
CREATE TABLE tool_suggestion_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_id UUID NOT NULL REFERENCES tool_suggestions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 중복 투표 방지
  UNIQUE(user_id, suggestion_id)
);

-- 인덱스
CREATE INDEX idx_suggestion_votes_user_id ON tool_suggestion_votes(user_id);
CREATE INDEX idx_suggestion_votes_suggestion_id ON tool_suggestion_votes(suggestion_id);

-- RLS 정책
ALTER TABLE tool_suggestion_votes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자: 투표 조회
CREATE POLICY "Anyone can view votes"
  ON tool_suggestion_votes FOR SELECT
  USING (true);

-- 인증된 사용자: 투표
CREATE POLICY "Authenticated users can vote"
  ON tool_suggestion_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 본인: 투표 취소
CREATE POLICY "Users can unvote"
  ON tool_suggestion_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 트리거: vote_count 자동 업데이트
CREATE OR REPLACE FUNCTION update_suggestion_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tool_suggestions
    SET vote_count = vote_count + 1,
        updated_at = NOW()
    WHERE id = NEW.suggestion_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tool_suggestions
    SET vote_count = vote_count - 1,
        updated_at = NOW()
    WHERE id = OLD.suggestion_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_suggestion_vote_count
AFTER INSERT OR DELETE ON tool_suggestion_votes
FOR EACH ROW EXECUTE FUNCTION update_suggestion_vote_count();

-- 트리거: 20+ 투표 시 자동 승인
CREATE OR REPLACE FUNCTION auto_approve_suggestion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vote_count >= 20 AND OLD.vote_count < 20 AND NEW.status = 'pending' THEN
    UPDATE tool_suggestions
    SET status = 'approved',
        reviewed_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_approve_suggestion
AFTER UPDATE OF vote_count ON tool_suggestions
FOR EACH ROW EXECUTE FUNCTION auto_approve_suggestion();
