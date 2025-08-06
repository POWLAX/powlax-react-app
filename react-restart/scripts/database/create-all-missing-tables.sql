-- POWLAX Complete Tables Setup
-- Generated: 2025-08-05
-- 
-- This script creates all missing tables following the _powlax convention
-- and includes the complete gamification system

-- ============================================
-- SECTION 1: CONTENT TABLES (_powlax suffix)
-- ============================================

-- 1. Team Drills Table (for WordPress drill exports)
CREATE TABLE IF NOT EXISTS drills_powlax (
  id SERIAL PRIMARY KEY,
  wp_id TEXT,
  title TEXT NOT NULL,
  content TEXT,
  drill_types TEXT,
  drill_category TEXT,
  drill_emphasis TEXT,
  game_phase TEXT,
  drill_duration TEXT,
  drill_video_url TEXT,
  drill_notes TEXT,
  game_states TEXT,
  do_it_ages TEXT,
  coach_it_ages TEXT,
  own_it_ages TEXT,
  vimeo_url TEXT,
  featured_image TEXT,
  status TEXT,
  slug TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Wall Ball Skills Table
CREATE TABLE IF NOT EXISTS wall_ball_powlax (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  vimeo_url TEXT,
  workout_type TEXT,
  included_in_workouts JSONB,
  description TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Lessons Table
CREATE TABLE IF NOT EXISTS lessons_powlax (
  id SERIAL PRIMARY KEY,
  wp_id TEXT,
  title TEXT NOT NULL,
  content TEXT,
  lesson_type TEXT,
  vimeo_url TEXT,
  featured_image TEXT,
  categories TEXT,
  tags TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Drill-Strategy Mapping Table
CREATE TABLE IF NOT EXISTS drill_strategy_map_powlax (
  id SERIAL PRIMARY KEY,
  drill_id INTEGER REFERENCES drills_powlax(id) ON DELETE CASCADE,
  strategy_id INTEGER REFERENCES strategies_powlax(id) ON DELETE CASCADE,
  confidence_score DECIMAL(3,2),
  mapping_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(drill_id, strategy_id)
);

-- Create indexes for content tables
CREATE INDEX IF NOT EXISTS idx_drills_powlax_title ON drills_powlax(title);
CREATE INDEX IF NOT EXISTS idx_drills_powlax_drill_types ON drills_powlax(drill_types);
CREATE INDEX IF NOT EXISTS idx_drills_powlax_game_phase ON drills_powlax(game_phase);
CREATE INDEX IF NOT EXISTS idx_drills_powlax_wp_id ON drills_powlax(wp_id);

CREATE INDEX IF NOT EXISTS idx_wall_ball_powlax_title ON wall_ball_powlax(title);
CREATE INDEX IF NOT EXISTS idx_wall_ball_powlax_workouts ON wall_ball_powlax USING gin(included_in_workouts);

CREATE INDEX IF NOT EXISTS idx_lessons_powlax_title ON lessons_powlax(title);
CREATE INDEX IF NOT EXISTS idx_lessons_powlax_type ON lessons_powlax(lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_powlax_wp_id ON lessons_powlax(wp_id);

-- ============================================
-- SECTION 2: GAMIFICATION TABLES (_powlax suffix)
-- ============================================

-- Point Types Table
CREATE TABLE IF NOT EXISTS point_types_powlax (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    plural_name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon_url TEXT,
    description TEXT,
    conversion_rate DECIMAL(10,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert Point Types
INSERT INTO point_types_powlax (name, display_name, plural_name, slug, description) VALUES
('lax_credit', 'Lax Credit', 'Lax Credits', 'lax-credit', 'Universal currency earned from all activities'),
('attack_token', 'Attack Token', 'Attack Tokens', 'attack-token', 'Earned from attack-specific drills and achievements'),
('midfield_medal', 'Midfield Medal', 'Midfield Medals', 'midfield-medal', 'Earned from midfield-specific activities'),
('defense_dollar', 'Defense Dollar', 'Defense Dollars', 'defense-dollar', 'Earned from defensive drills and achievements'),
('rebound_reward', 'Rebound Reward', 'Rebound Rewards', 'rebound-reward', 'Earned from wall ball workouts'),
('lax_iq_point', 'Lax IQ Point', 'Lax IQ Points', 'lax-iq-point', 'Earned from knowledge-based activities'),
('flex_point', 'Flex Point', 'Flex Points', 'flex-point', 'Earned from self-guided workouts')
ON CONFLICT (name) DO NOTHING;

-- Badges Table
CREATE TABLE IF NOT EXISTS badges_powlax (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    category VARCHAR(100),
    sub_category VARCHAR(100),
    earned_by_type VARCHAR(50) CHECK (earned_by_type IN ('milestone', 'quest', 'points', 'action')),
    points_type_required VARCHAR(50),
    points_required INTEGER,
    quest_id INTEGER,
    maximum_earnings INTEGER DEFAULT 1,
    is_hidden BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Player Ranks Table
CREATE TABLE IF NOT EXISTS player_ranks_powlax (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'neutral')),
    rank_order INTEGER NOT NULL,
    description TEXT,
    icon_url TEXT,
    lax_credits_required INTEGER DEFAULT 0,
    badges_required INTEGER DEFAULT 0,
    skills_mastered_required INTEGER DEFAULT 0,
    team_contributions_required INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(gender, rank_order)
);

-- User Points Balance Table
CREATE TABLE IF NOT EXISTS user_points_balance_powlax (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    point_type VARCHAR(50) REFERENCES point_types_powlax(name),
    balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    last_earned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, point_type)
);

-- Points Transaction Log
CREATE TABLE IF NOT EXISTS points_transactions_powlax (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    point_type VARCHAR(50) REFERENCES point_types_powlax(name),
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('earned', 'spent', 'admin_adjustment')),
    source_type VARCHAR(50),
    source_id INTEGER,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Badge Progress Table
CREATE TABLE IF NOT EXISTS user_badge_progress_powlax (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    badge_id INTEGER REFERENCES badges_powlax(id),
    progress INTEGER DEFAULT 0,
    earned_count INTEGER DEFAULT 0,
    first_earned_at TIMESTAMP,
    last_earned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- User Rank Progress Table
CREATE TABLE IF NOT EXISTS user_rank_progress_powlax (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    current_rank_id INTEGER REFERENCES player_ranks_powlax(id),
    previous_rank_id INTEGER REFERENCES player_ranks_powlax(id),
    rank_achieved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for gamification tables
CREATE INDEX idx_points_balance_user_powlax ON user_points_balance_powlax(user_id);
CREATE INDEX idx_points_transactions_user_powlax ON points_transactions_powlax(user_id, created_at DESC);
CREATE INDEX idx_badge_progress_user_powlax ON user_badge_progress_powlax(user_id);
CREATE INDEX idx_rank_progress_user_powlax ON user_rank_progress_powlax(user_id);

-- ============================================
-- SECTION 3: ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE drills_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_ball_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_strategy_map_powlax ENABLE ROW LEVEL SECURITY;

ALTER TABLE point_types_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_ranks_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points_balance_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badge_progress_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rank_progress_powlax ENABLE ROW LEVEL SECURITY;

-- Content tables: Read access for all, write for authenticated
CREATE POLICY "Allow anonymous read" ON drills_powlax FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read" ON wall_ball_powlax FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read" ON lessons_powlax FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read" ON drill_strategy_map_powlax FOR SELECT TO anon USING (true);

CREATE POLICY "Allow authenticated full access" ON drills_powlax FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON wall_ball_powlax FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON lessons_powlax FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON drill_strategy_map_powlax FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Gamification tables: Public read for definitions, user-specific for progress
CREATE POLICY "Anyone can view point types" ON point_types_powlax FOR SELECT USING (true);
CREATE POLICY "Anyone can view badges" ON badges_powlax FOR SELECT USING (NOT is_hidden OR auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can view ranks" ON player_ranks_powlax FOR SELECT USING (true);

CREATE POLICY "Users can view own points" ON user_points_balance_powlax FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON points_transactions_powlax FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own badges" ON user_badge_progress_powlax FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own rank" ON user_rank_progress_powlax FOR SELECT USING (auth.uid() = user_id);

-- Service role has full access to everything
DO $$
DECLARE
  table_name TEXT;
  tables TEXT[] := ARRAY[
    'drills_powlax', 'wall_ball_powlax', 'lessons_powlax', 'drill_strategy_map_powlax',
    'point_types_powlax', 'badges_powlax', 'player_ranks_powlax', 
    'user_points_balance_powlax', 'points_transactions_powlax', 
    'user_badge_progress_powlax', 'user_rank_progress_powlax'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables
  LOOP
    EXECUTE format('CREATE POLICY "Service role full access" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)', table_name);
  END LOOP;
END$$;

-- ============================================
-- SECTION 4: HELPER FUNCTIONS (_powlax suffix)
-- ============================================

-- Function to award points to a user
CREATE OR REPLACE FUNCTION award_points_powlax(
    p_user_id UUID,
    p_point_type VARCHAR(50),
    p_amount INTEGER,
    p_source_type VARCHAR(50),
    p_source_id INTEGER,
    p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    -- Insert transaction
    INSERT INTO points_transactions_powlax (
        user_id, point_type, amount, transaction_type, 
        source_type, source_id, description
    ) VALUES (
        p_user_id, p_point_type, p_amount, 'earned',
        p_source_type, p_source_id, p_description
    );
    
    -- Update balance
    INSERT INTO user_points_balance_powlax (user_id, point_type, balance, total_earned, last_earned_at)
    VALUES (p_user_id, p_point_type, p_amount, p_amount, NOW())
    ON CONFLICT (user_id, point_type) DO UPDATE SET
        balance = user_points_balance_powlax.balance + p_amount,
        total_earned = user_points_balance_powlax.total_earned + p_amount,
        last_earned_at = NOW(),
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- 
-- Summary of tables created:
-- Content Tables:
-- - drills_powlax
-- - wall_ball_powlax
-- - lessons_powlax
-- - drill_strategy_map_powlax
-- 
-- Gamification Tables:
-- - point_types_powlax
-- - badges_powlax
-- - player_ranks_powlax
-- - user_points_balance_powlax
-- - points_transactions_powlax
-- - user_badge_progress_powlax
-- - user_rank_progress_powlax
-- 
-- All tables follow the _powlax naming convention
-- All tables have RLS enabled with appropriate policies