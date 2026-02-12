-- ==========================================
-- AIPICK 데이터베이스 전체 설정
-- 커뮤니티 + 도발 시스템 통합
-- ==========================================

-- UUID 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- Profiles 테이블 (Auth 연동)
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  reputation INT DEFAULT 0,
  post_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- 커뮤니티 V2 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS community_posts_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,

  post_type TEXT NOT NULL CHECK (post_type IN ('discussion', 'rating', 'tip', 'question')),

  title TEXT,
  content TEXT NOT NULL,

  images TEXT[] DEFAULT '{}',

  tags TEXT[] DEFAULT '{}',
  ai_tools TEXT[] DEFAULT '{}',

  upvote_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  bookmark_count INT DEFAULT 0,

  is_accepted_answer BOOLEAN DEFAULT FALSE,
  accepted_answer_id UUID REFERENCES community_posts_v2(id) ON DELETE SET NULL,

  parent_id UUID REFERENCES community_posts_v2(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_community_v2_user ON community_posts_v2(user_id);
CREATE INDEX idx_community_v2_type ON community_posts_v2(post_type);
CREATE INDEX idx_community_v2_parent ON community_posts_v2(parent_id);
CREATE INDEX idx_community_v2_created ON community_posts_v2(created_at DESC);
CREATE INDEX idx_community_v2_tags ON community_posts_v2 USING GIN(tags);
CREATE INDEX idx_community_v2_ai_tools ON community_posts_v2 USING GIN(ai_tools);

ALTER TABLE community_posts_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community posts" ON community_posts_v2
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON community_posts_v2
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON community_posts_v2
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON community_posts_v2
  FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 커뮤니티 북마크
-- ==========================================
CREATE TABLE IF NOT EXISTS community_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts_v2(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_community_bookmarks_user ON community_bookmarks(user_id);
CREATE INDEX idx_community_bookmarks_post ON community_bookmarks(post_id);

ALTER TABLE community_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON community_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks" ON community_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON community_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 도발 시스템
-- ==========================================
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

CREATE TABLE IF NOT EXISTS provocation_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provocation_id UUID REFERENCES provocations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(provocation_id, user_id)
);

CREATE TABLE IF NOT EXISTS voting_rounds (
  id SERIAL PRIMARY KEY,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  winner_ids UUID[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_provocations_status ON provocations(status);
CREATE INDEX idx_provocations_voting_round ON provocations(voting_round_id);
CREATE INDEX idx_provocations_category ON provocations(category);
CREATE INDEX idx_provocations_created_at ON provocations(created_at DESC);
CREATE INDEX idx_provocation_votes_user ON provocation_votes(user_id);
CREATE INDEX idx_provocation_votes_provocation ON provocation_votes(provocation_id);
CREATE INDEX idx_voting_rounds_status ON voting_rounds(status);

ALTER TABLE provocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE provocation_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view provocations" ON provocations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create provocations" ON provocations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own provocations" ON provocations
  FOR UPDATE USING (auth.uid() = user_id AND status = 'submitted');

CREATE POLICY "Anyone can view votes" ON provocation_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON provocation_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON provocation_votes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view voting rounds" ON voting_rounds
  FOR SELECT USING (true);

-- ==========================================
-- 트리거 함수들
-- ==========================================

-- updated_at 자동 업데이트
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

CREATE TRIGGER update_community_v2_updated_at
  BEFORE UPDATE ON community_posts_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 도발 투표 카운트 업데이트
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

-- 커뮤니티 댓글 카운트 업데이트
CREATE OR REPLACE FUNCTION update_community_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE community_posts_v2 SET comment_count = comment_count + 1 WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE community_posts_v2 SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.parent_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_community_comment_count
  AFTER INSERT OR DELETE ON community_posts_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_community_comment_count();

-- 북마크 카운트 업데이트
CREATE OR REPLACE FUNCTION update_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts_v2 SET bookmark_count = bookmark_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts_v2 SET bookmark_count = GREATEST(0, bookmark_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bookmark_count
  AFTER INSERT OR DELETE ON community_bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_bookmark_count();
