-- =====================================================
-- COMPLETE PERMANENCE PATTERN SQL
-- Run this in Supabase Dashboard SQL Editor
-- =====================================================

-- 1. Coach Favorites table
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

-- 2. Resource Favorites table
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

-- 3. Resource Collections table
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

-- 4. Workout Assignments table
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

-- 5. Role Change Log table
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

-- 6. Permission Templates table
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

-- Enable RLS on all tables
ALTER TABLE coach_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_templates ENABLE ROW LEVEL SECURITY;

-- Create simple policies for authenticated users
CREATE POLICY "Authenticated users can use coach_favorites" ON coach_favorites
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can use resource_favorites" ON resource_favorites
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can use resource_collections" ON resource_collections
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can use workout_assignments" ON workout_assignments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view role_change_log" ON role_change_log
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can use permission_templates" ON permission_templates
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON coach_favorites TO authenticated;
GRANT ALL ON resource_favorites TO authenticated;
GRANT ALL ON resource_collections TO authenticated;
GRANT ALL ON workout_assignments TO authenticated;
GRANT SELECT ON role_change_log TO authenticated;
GRANT ALL ON permission_templates TO authenticated;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ PERMANENCE PATTERN TABLES CREATED!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  ✅ coach_favorites - Coach dashboard favorites';
    RAISE NOTICE '  ✅ resource_favorites - Resource page favorites';
    RAISE NOTICE '  ✅ resource_collections - Resource collections';
    RAISE NOTICE '  ✅ workout_assignments - Academy workout assignments';
    RAISE NOTICE '  ✅ role_change_log - Role change audit log';
    RAISE NOTICE '  ✅ permission_templates - Permission templates';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'All tables use array columns for permanence!';
END $$;