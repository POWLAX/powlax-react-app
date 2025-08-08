-- Practice Planner Enhancement Migration
-- This migration adds required fields and tables for the complete Practice Planner implementation

-- 1. Enhance powlax_drills table
ALTER TABLE powlax_drills 
ADD COLUMN IF NOT EXISTS game_states JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS lab_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_urls JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS image_ids UUID[] DEFAULT '{}';

-- 2. Enhance practice_plans table
ALTER TABLE practice_plans
ADD COLUMN IF NOT EXISTS template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS age_group TEXT CHECK (age_group IN ('8-10', '11-14', '15+', NULL)),
ADD COLUMN IF NOT EXISTS drill_sequence JSONB,
ADD COLUMN IF NOT EXISTS setup_notes TEXT,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES practice_plans(id);

-- 3. Enhance practice_plan_drills junction table
ALTER TABLE practice_plan_drills
ADD COLUMN IF NOT EXISTS duration_override INTEGER,
ADD COLUMN IF NOT EXISTS instance_notes TEXT,
ADD COLUMN IF NOT EXISTS is_parallel BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_key_focus BOOLEAN DEFAULT false;

-- 4. Create powlax_images table
CREATE TABLE IF NOT EXISTS powlax_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  drill_id UUID REFERENCES powlax_drills(id) ON DELETE CASCADE,
  user_drill_id UUID REFERENCES user_drills(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES powlax_strategies(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  -- Ensure image is linked to at least one entity
  CONSTRAINT image_must_have_reference CHECK (
    drill_id IS NOT NULL OR 
    user_drill_id IS NOT NULL OR 
    strategy_id IS NOT NULL
  )
);

-- Indexes for powlax_images
CREATE INDEX IF NOT EXISTS idx_powlax_images_drill ON powlax_images(drill_id);
CREATE INDEX IF NOT EXISTS idx_powlax_images_user_drill ON powlax_images(user_drill_id);
CREATE INDEX IF NOT EXISTS idx_powlax_images_strategy ON powlax_images(strategy_id);
CREATE INDEX IF NOT EXISTS idx_powlax_images_uploaded_by ON powlax_images(uploaded_by);

-- 5. Create practice_templates table
CREATE TABLE IF NOT EXISTS practice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  age_group TEXT CHECK (age_group IN ('8-10', '11-14', '15+')),
  duration_minutes INTEGER DEFAULT 90,
  category TEXT CHECK (category IN (
    'tryout', 
    'skill_development', 
    'game_prep', 
    'conditioning',
    'team_building',
    'first_practice',
    'last_practice',
    'tournament_prep'
  )),
  drill_sequence JSONB NOT NULL,
  coaching_tips TEXT[],
  equipment_needed TEXT[],
  is_public BOOLEAN DEFAULT false,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for practice_templates
CREATE INDEX IF NOT EXISTS idx_templates_age_group ON practice_templates(age_group);
CREATE INDEX IF NOT EXISTS idx_templates_category ON practice_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_organization ON practice_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_templates_public ON practice_templates(is_public);

-- 6. Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_drills_game_states ON powlax_drills USING GIN(game_states);
CREATE INDEX IF NOT EXISTS idx_drills_category ON powlax_drills(category);
CREATE INDEX IF NOT EXISTS idx_drills_duration ON powlax_drills(duration);

CREATE INDEX IF NOT EXISTS idx_practice_plans_template ON practice_plans(template);
CREATE INDEX IF NOT EXISTS idx_practice_plans_age_group ON practice_plans(age_group);
CREATE INDEX IF NOT EXISTS idx_practice_plans_team ON practice_plans(team_id);
CREATE INDEX IF NOT EXISTS idx_practice_plans_date ON practice_plans(practice_date);

-- 7. Enable RLS on new tables
ALTER TABLE powlax_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_templates ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for powlax_images
-- Public read access for drill/strategy images
CREATE POLICY "Public read for drill images" ON powlax_images
  FOR SELECT USING (drill_id IS NOT NULL OR strategy_id IS NOT NULL);

-- Users can upload images for their custom drills
CREATE POLICY "Users can upload drill images" ON powlax_images
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    (
      user_drill_id IN (
        SELECT id FROM user_drills WHERE created_by = auth.uid()
      )
      OR uploaded_by = auth.uid()
    )
  );

-- Users can update their own images
CREATE POLICY "Users can update own images" ON powlax_images
  FOR UPDATE USING (uploaded_by = auth.uid());

-- Users can delete their own images
CREATE POLICY "Users can delete own images" ON powlax_images
  FOR DELETE USING (uploaded_by = auth.uid());

-- 9. RLS Policies for practice_templates
-- Public templates are readable by all
CREATE POLICY "Public templates readable by all" ON practice_templates
  FOR SELECT USING (is_public = true);

-- Organization templates readable by organization members
CREATE POLICY "Organization templates readable by members" ON practice_templates
  FOR SELECT USING (
    organization_id IN (
      SELECT DISTINCT o.id 
      FROM organizations o
      JOIN teams t ON t.organization_id = o.id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Users can create templates for their organizations
CREATE POLICY "Users can create org templates" ON practice_templates
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    (
      is_public = false OR
      organization_id IN (
        SELECT DISTINCT o.id 
        FROM organizations o
        JOIN teams t ON t.organization_id = o.id
        JOIN team_members tm ON tm.team_id = t.id
        WHERE tm.user_id = auth.uid() 
        AND tm.role IN ('coach', 'admin')
      )
    )
  );

-- 10. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for practice_templates
CREATE TRIGGER update_practice_templates_updated_at 
  BEFORE UPDATE ON practice_templates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Sample practice templates for each age group
INSERT INTO practice_templates (
  name,
  description,
  age_group,
  duration_minutes,
  category,
  drill_sequence,
  coaching_tips,
  equipment_needed,
  is_public
) VALUES 
(
  'First Practice - 8-10 Years',
  'Introduction practice focusing on fun and basic skills',
  '8-10',
  60,
  'first_practice',
  '[
    {
      "order": 1,
      "drill_name": "Name Game Circle",
      "duration": 10,
      "notes": "Players pass ball and say their name"
    },
    {
      "order": 2,
      "drill_name": "Scoop and Run Relay",
      "duration": 15,
      "notes": "Focus on fun, not perfect form"
    },
    {
      "order": 3,
      "drill_name": "Monkey in the Middle",
      "duration": 15,
      "notes": "3v1 keep away, rotate every 2 minutes"
    },
    {
      "order": 4,
      "drill_name": "Sharks and Minnows",
      "duration": 15,
      "notes": "With sticks and balls"
    },
    {
      "order": 5,
      "drill_name": "Team Cheer",
      "duration": 5,
      "notes": "Create team chant together"
    }
  ]'::jsonb,
  ARRAY[
    'Keep energy high and positive',
    'Focus on fun over fundamentals',
    'Lots of water breaks',
    'Learn every player''s name'
  ],
  ARRAY['Balls', 'Cones', 'Pennies'],
  true
),
(
  'Skills Development - 11-14 Years',
  'Comprehensive skills practice with competitive elements',
  '11-14',
  90,
  'skill_development',
  '[
    {
      "order": 1,
      "drill_name": "Dynamic Warm-up",
      "duration": 10,
      "notes": "Include stick work while moving"
    },
    {
      "order": 2,
      "drill_name": "Star Drill",
      "duration": 15,
      "notes": "Focus on quick passes and communication"
    },
    {
      "order": 3,
      "drill_name": "2v1 Ground Balls",
      "duration": 20,
      "notes": "Competitive - keep score"
    },
    {
      "order": 4,
      "drill_name": "3v2 Fast Break",
      "duration": 20,
      "notes": "Transition from defense to offense"
    },
    {
      "order": 5,
      "drill_name": "6v6 Scrimmage",
      "duration": 20,
      "notes": "Stop and teach moments"
    },
    {
      "order": 6,
      "drill_name": "Shooting Lines",
      "duration": 5,
      "notes": "End on a high note"
    }
  ]'::jsonb,
  ARRAY[
    'Balance individual development with team concepts',
    'Provide specific feedback',
    'Encourage questions',
    'Create competitive situations'
  ],
  ARRAY['Balls', 'Cones', 'Goals', 'Pennies'],
  true
),
(
  'Game Prep - 15+ Years',
  'Pre-game practice focusing on strategy and execution',
  '15+',
  120,
  'game_prep',
  '[
    {
      "order": 1,
      "drill_name": "Team Warm-up Routine",
      "duration": 15,
      "notes": "Player-led stretching and stick work"
    },
    {
      "order": 2,
      "drill_name": "Transition Drill",
      "duration": 20,
      "notes": "Full field clear to fast break"
    },
    {
      "order": 3,
      "drill_name": "Man-Up/Man-Down",
      "duration": 25,
      "notes": "Review all special teams sets"
    },
    {
      "order": 4,
      "drill_name": "6v6 Team Defense",
      "duration": 25,
      "notes": "Focus on slides and recovery"
    },
    {
      "order": 5,
      "drill_name": "Offensive Sets",
      "duration": 25,
      "notes": "Run through all plays at game speed"
    },
    {
      "order": 6,
      "drill_name": "Situational Scrimmage",
      "duration": 10,
      "notes": "Last 2 minutes scenarios"
    }
  ]'::jsonb,
  ARRAY[
    'Maintain game-speed intensity',
    'Focus on execution over teaching',
    'Build confidence',
    'Review scouting report'
  ],
  ARRAY['Balls', 'Cones', 'Goals', 'Pennies', 'Shot clock'],
  true
);

-- 12. Grant necessary permissions
GRANT ALL ON powlax_images TO authenticated;
GRANT ALL ON practice_templates TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comment to document migration
COMMENT ON TABLE powlax_images IS 'Centralized image storage for drills and strategies';
COMMENT ON TABLE practice_templates IS 'Pre-built practice plan templates organized by age group';
COMMENT ON COLUMN practice_plans.drill_sequence IS 'Complete timeline data in JSONB format';
COMMENT ON COLUMN practice_plan_drills.is_parallel IS 'Indicates if drill runs parallel with previous drill';