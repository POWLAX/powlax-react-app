-- =====================================================
-- Migration: 121_permanence_pattern_implementation.sql
-- Purpose: Implement Supabase Permanence Pattern across all features
-- Date: January 2025
-- Mode: CREATION ONLY - NO DELETIONS
-- =====================================================

-- =====================================================
-- PHASE 1: COACH DASHBOARD TABLES
-- =====================================================

-- Coach Favorites table with array fields
CREATE TABLE IF NOT EXISTS coach_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('drill', 'strategy', 'player', 'workout')),
  visibility_teams INTEGER[] DEFAULT '{}',
  visibility_clubs INTEGER[] DEFAULT '{}',
  shared_with_assistants TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(coach_id, item_id, item_type)
);

-- Player Tracking table for coaches
CREATE TABLE IF NOT EXISTS coach_player_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  tracked_metrics TEXT[] DEFAULT '{}',
  skill_tags TEXT[] DEFAULT '{}',
  visibility_teams INTEGER[] DEFAULT '{}',
  visibility_parents TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(coach_id, player_id)
);

-- Quick Actions for coach dashboard
CREATE TABLE IF NOT EXISTS coach_quick_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_data JSONB,
  target_players TEXT[] DEFAULT '{}',
  target_teams INTEGER[] DEFAULT '{}',
  scheduled_for TIMESTAMP,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PHASE 2: RESOURCES PAGE TABLES
-- =====================================================

-- Resource Favorites with sharing
CREATE TABLE IF NOT EXISTS resource_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  shared_with_teams INTEGER[] DEFAULT '{}',
  shared_with_users TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Resource Collections
CREATE TABLE IF NOT EXISTS resource_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id TEXT NOT NULL,
  collection_name TEXT NOT NULL,
  description TEXT,
  resource_ids TEXT[] DEFAULT '{}',
  contributor_ids TEXT[] DEFAULT '{}',
  viewer_teams INTEGER[] DEFAULT '{}',
  viewer_clubs INTEGER[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Resource Progress Tracking
CREATE TABLE IF NOT EXISTS resource_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  completed_sections TEXT[] DEFAULT '{}',
  bookmarked_sections TEXT[] DEFAULT '{}',
  notes JSONB DEFAULT '{}',
  completion_percentage INTEGER DEFAULT 0,
  last_accessed TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- =====================================================
-- PHASE 3: ACADEMY PAGE TABLES
-- =====================================================

-- Enhanced Workout Assignments
CREATE TABLE IF NOT EXISTS workout_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id TEXT NOT NULL,
  workout_id TEXT NOT NULL,
  assigned_players TEXT[] DEFAULT '{}',
  assigned_teams INTEGER[] DEFAULT '{}',
  assigned_groups TEXT[] DEFAULT '{}',
  due_date TIMESTAMP,
  required_completions INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workout Completion Tracking
CREATE TABLE IF NOT EXISTS workout_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL,
  workout_id TEXT NOT NULL,
  assignment_id UUID REFERENCES workout_assignments(id),
  completed_drills TEXT[] DEFAULT '{}',
  skipped_drills TEXT[] DEFAULT '{}',
  drill_scores JSONB DEFAULT '{}',
  total_time_seconds INTEGER,
  completion_date TIMESTAMP DEFAULT NOW(),
  coach_notes TEXT,
  player_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Skills Academy Progress Enhanced
ALTER TABLE skills_academy_user_progress 
ADD COLUMN IF NOT EXISTS visibility_coaches TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS visibility_parents TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS achievement_badges TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS skill_tags TEXT[] DEFAULT '{}';

-- =====================================================
-- PHASE 4: ROLE MANAGEMENT AUDIT TABLES
-- =====================================================

-- Role Change Audit Log
CREATE TABLE IF NOT EXISTS role_change_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  old_roles TEXT[] DEFAULT '{}',
  new_roles TEXT[] DEFAULT '{}',
  old_permissions TEXT[] DEFAULT '{}',
  new_permissions TEXT[] DEFAULT '{}',
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Permission Templates
CREATE TABLE IF NOT EXISTS permission_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL UNIQUE,
  description TEXT,
  roles TEXT[] DEFAULT '{}',
  permissions TEXT[] DEFAULT '{}',
  applicable_to_teams INTEGER[] DEFAULT '{}',
  applicable_to_clubs INTEGER[] DEFAULT '{}',
  created_by TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PHASE 5: ENHANCED USER TABLES WITH ARRAYS
-- =====================================================

-- Add array columns to existing user tables if not present
ALTER TABLE user_drills
ADD COLUMN IF NOT EXISTS team_share INTEGER[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS club_share INTEGER[] DEFAULT '{}';

ALTER TABLE user_strategies
ADD COLUMN IF NOT EXISTS team_share INTEGER[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS club_share INTEGER[] DEFAULT '{}';

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Coach Dashboard Indexes
CREATE INDEX IF NOT EXISTS idx_coach_favorites_coach ON coach_favorites(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_favorites_type ON coach_favorites(item_type);
CREATE INDEX IF NOT EXISTS idx_coach_player_tracking_coach ON coach_player_tracking(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_quick_actions_coach ON coach_quick_actions(coach_id);

-- Resources Indexes
CREATE INDEX IF NOT EXISTS idx_resource_favorites_user ON resource_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_collections_owner ON resource_collections(owner_id);
CREATE INDEX IF NOT EXISTS idx_resource_progress_user ON resource_progress(user_id);

-- Academy Indexes
CREATE INDEX IF NOT EXISTS idx_workout_assignments_coach ON workout_assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_workout_completions_player ON workout_completions(player_id);

-- Audit Indexes
CREATE INDEX IF NOT EXISTS idx_role_change_log_user ON role_change_log(user_id);
CREATE INDEX IF NOT EXISTS idx_role_change_log_changed_by ON role_change_log(changed_by);

-- Array Indexes for GIN operations
CREATE INDEX IF NOT EXISTS idx_coach_favorites_teams_gin ON coach_favorites USING gin(visibility_teams);
CREATE INDEX IF NOT EXISTS idx_resource_collections_contributors_gin ON resource_collections USING gin(contributor_ids);
CREATE INDEX IF NOT EXISTS idx_workout_assignments_players_gin ON workout_assignments USING gin(assigned_players);

-- =====================================================
-- RLS POLICIES (NON-DESTRUCTIVE)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE coach_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_player_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_templates ENABLE ROW LEVEL SECURITY;

-- Coach Favorites Policies
CREATE POLICY IF NOT EXISTS "Coaches manage own favorites" ON coach_favorites
  FOR ALL TO authenticated
  USING (coach_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1))
  WITH CHECK (coach_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Resource Favorites Policies  
CREATE POLICY IF NOT EXISTS "Users manage own resource favorites" ON resource_favorites
  FOR ALL TO authenticated
  USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1))
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Workout Assignment Policies
CREATE POLICY IF NOT EXISTS "Coaches manage workout assignments" ON workout_assignments
  FOR ALL TO authenticated
  USING (coach_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1))
  WITH CHECK (coach_id = (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Players view their assignments
CREATE POLICY IF NOT EXISTS "Players view assigned workouts" ON workout_assignments
  FOR SELECT TO authenticated
  USING (
    (SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1) = ANY(assigned_players)
  );

-- =====================================================
-- HELPER FUNCTIONS FOR ARRAY OPERATIONS
-- =====================================================

-- Function to add items to arrays
CREATE OR REPLACE FUNCTION add_to_array(
  existing_array INTEGER[],
  new_items INTEGER[]
)
RETURNS INTEGER[] AS $$
BEGIN
  RETURN array_cat(
    existing_array, 
    array(SELECT DISTINCT unnest(new_items) EXCEPT SELECT unnest(existing_array))
  );
END;
$$ LANGUAGE plpgsql;

-- Function to remove items from arrays
CREATE OR REPLACE FUNCTION remove_from_array(
  existing_array INTEGER[],
  items_to_remove INTEGER[]
)
RETURNS INTEGER[] AS $$
BEGIN
  RETURN array(
    SELECT unnest(existing_array) 
    EXCEPT 
    SELECT unnest(items_to_remove)
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANTS FOR NEW TABLES
-- =====================================================

GRANT ALL ON coach_favorites TO authenticated;
GRANT ALL ON coach_player_tracking TO authenticated;
GRANT ALL ON coach_quick_actions TO authenticated;
GRANT ALL ON resource_favorites TO authenticated;
GRANT ALL ON resource_collections TO authenticated;
GRANT ALL ON resource_progress TO authenticated;
GRANT ALL ON workout_assignments TO authenticated;
GRANT ALL ON workout_completions TO authenticated;
GRANT ALL ON role_change_log TO authenticated;
GRANT ALL ON permission_templates TO authenticated;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$ 
BEGIN 
    RAISE NOTICE '==============================================';
    RAISE NOTICE '🚀 PERMANENCE PATTERN TABLES CREATED!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ Coach Dashboard tables with array fields';
    RAISE NOTICE '✅ Resource tables with sharing arrays';
    RAISE NOTICE '✅ Academy tables with assignment arrays';
    RAISE NOTICE '✅ Audit log tables with role arrays';
    RAISE NOTICE '✅ All indexes and RLS policies created';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Ready for Permanence Pattern implementation!';
END $$;