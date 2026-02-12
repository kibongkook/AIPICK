-- ==========================================
-- 도발 시스템 (Provocation System)
-- ==========================================

-- 제안 테이블
CREATE TABLE IF NOT EXISTS provocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,

  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('feature', 'design', 'bug', 'performance', 'mobile', 'other')),
  description TEXT NOT NULL,
  expected_effect TEXT,
  reference_url TEXT,
  images TEXT[],

  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'voting', 'accepted', 'in_development', 'completed', 'rejected')),

  vote_up_count INT DEFAULT 0,
  vote_down_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,

  voting_round_id INT,
  voting_start_date TIMESTAMP,
  voting_end_date TIMESTAMP,

  rejection_reason TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 투표 테이블
CREATE TABLE IF NOT EXISTS provocation_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provocation_id UUID REFERENCES provocations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(provocation_id, user_id)
);

-- 투표 라운드 테이블
CREATE TABLE IF NOT EXISTS voting_rounds (
  id SERIAL PRIMARY KEY,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  winner_ids UUID[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_provocations_status ON provocations(status);
CREATE INDEX IF NOT EXISTS idx_provocations_voting_round ON provocations(voting_round_id);
CREATE INDEX IF NOT EXISTS idx_provocations_category ON provocations(category);
CREATE INDEX IF NOT EXISTS idx_provocations_created_at ON provocations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_provocation_votes_user ON provocation_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_provocation_votes_provocation ON provocation_votes(provocation_id);
CREATE INDEX IF NOT EXISTS idx_voting_rounds_status ON voting_rounds(status);

-- RLS 정책
ALTER TABLE provocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE provocation_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_rounds ENABLE ROW LEVEL SECURITY;

-- provocations: 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view provocations" ON provocations
  FOR SELECT USING (true);

-- provocations: 로그인한 사용자만 작성 가능
CREATE POLICY "Authenticated users can create provocations" ON provocations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- provocations: 본인만 수정 가능 (submitted 상태일 때만)
CREATE POLICY "Users can update own provocations" ON provocations
  FOR UPDATE USING (auth.uid() = user_id AND status = 'submitted');

-- provocation_votes: 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view votes" ON provocation_votes
  FOR SELECT USING (true);

-- provocation_votes: 로그인한 사용자만 투표 가능
CREATE POLICY "Authenticated users can vote" ON provocation_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- provocation_votes: 본인만 투표 취소 가능
CREATE POLICY "Users can delete own votes" ON provocation_votes
  FOR DELETE USING (auth.uid() = user_id);

-- voting_rounds: 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view voting rounds" ON voting_rounds
  FOR SELECT USING (true);

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_provocations_updated_at
  BEFORE UPDATE ON provocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 투표 카운트 업데이트 함수
CREATE OR REPLACE FUNCTION update_provocation_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE provocations SET vote_up_count = vote_up_count + 1 WHERE id = NEW.provocation_id;
    ELSE
      UPDATE provocations SET vote_down_count = vote_down_count + 1 WHERE id = NEW.provocation_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE provocations SET vote_up_count = GREATEST(0, vote_up_count - 1) WHERE id = OLD.provocation_id;
    ELSE
      UPDATE provocations SET vote_down_count = GREATEST(0, vote_down_count - 1) WHERE id = OLD.provocation_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_provocation_vote_count
  AFTER INSERT OR DELETE ON provocation_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_provocation_vote_count();
