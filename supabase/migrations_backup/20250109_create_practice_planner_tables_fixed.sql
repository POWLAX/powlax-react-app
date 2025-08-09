-- Migration: Create Practice Planner Phase 2 Tables (FIXED)
-- Date: 2025-01-09
-- Purpose: Support save/load, templates, and images for Practice Planner
-- Fixed: Corrected ID types for foreign key references

-- 1. Create powlax_images table for drill and strategy images
CREATE TABLE IF NOT EXISTS powlax_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  drill_id UUID REFERENCES powlax_drills(id) ON DELETE CASCADE,
  user_drill_id INTEGER REFERENCES user_drills(id) ON DELETE CASCADE,
  strategy_id INTEGER REFERENCES powlax_strategies(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Ensure at least one reference exists
  CONSTRAINT at_least_one_reference CHECK (
    drill_id IS NOT NULL OR 
    user_drill_id IS NOT NULL OR 
    strategy_id IS NOT NULL
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_powlax_images_drill ON powlax_images(drill_id);
CREATE INDEX IF NOT EXISTS idx_powlax_images_user_drill ON powlax_images(user_drill_id);
CREATE INDEX IF NOT EXISTS idx_powlax_images_strategy ON powlax_images(strategy_id);
CREATE INDEX IF NOT EXISTS idx_powlax_images_uploaded_by ON powlax_images(uploaded_by);

-- 2. Create practice_plans table for saving practice plans
CREATE TABLE IF NOT EXISTS practice_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  practice_date DATE,
  start_time TIME,
  duration_minutes INTEGER DEFAULT 90,
  field_type TEXT CHECK (field_type IN ('turf', 'grass', 'indoor', 'other')),
  setup_time INTEGER DEFAULT 0,
  setup_notes TEXT,
  practice_notes TEXT,
  drill_sequence JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_strategies INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- Changed to INTEGER array for strategy IDs
  template BOOLEAN DEFAULT false,
  age_group TEXT CHECK (age_group IN ('8-10', '11-14', '15+', 'all')),
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES practice_plans(id) ON DELETE SET NULL,
  is_draft BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_practice_plans_team ON practice_plans(team_id);
CREATE INDEX IF NOT EXISTS idx_practice_plans_user ON practice_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_plans_date ON practice_plans(practice_date);
CREATE INDEX IF NOT EXISTS idx_practice_plans_template ON practice_plans(template) WHERE template = true;
CREATE INDEX IF NOT EXISTS idx_practice_plans_parent ON practice_plans(parent_id);

-- 3. Create practice_plan_drills junction table
CREATE TABLE IF NOT EXISTS practice_plan_drills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_plan_id UUID REFERENCES practice_plans(id) ON DELETE CASCADE NOT NULL,
  drill_id UUID REFERENCES powlax_drills(id) ON DELETE CASCADE, -- UUID for powlax_drills
  user_drill_id INTEGER REFERENCES user_drills(id) ON DELETE CASCADE, -- INTEGER for user_drills
  order_index INTEGER NOT NULL,
  duration_override INTEGER,
  instance_notes TEXT,
  is_parallel BOOLEAN DEFAULT false,
  is_key_focus BOOLEAN DEFAULT false,
  start_time INTEGER, -- Minutes from practice start
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure at least one drill reference exists
  CONSTRAINT at_least_one_drill CHECK (
    drill_id IS NOT NULL OR user_drill_id IS NOT NULL
  ),
  
  -- Ensure unique order per practice plan (unless parallel)
  CONSTRAINT unique_order_unless_parallel UNIQUE (practice_plan_id, order_index, is_parallel)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_practice_plan_drills_plan ON practice_plan_drills(practice_plan_id);
CREATE INDEX IF NOT EXISTS idx_practice_plan_drills_drill ON practice_plan_drills(drill_id);
CREATE INDEX IF NOT EXISTS idx_practice_plan_drills_user_drill ON practice_plan_drills(user_drill_id);
CREATE INDEX IF NOT EXISTS idx_practice_plan_drills_order ON practice_plan_drills(practice_plan_id, order_index);

-- 4. Create practice_templates table
CREATE TABLE IF NOT EXISTS practice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  age_group TEXT CHECK (age_group IN ('8-10', '11-14', '15+', 'all')),
  duration_minutes INTEGER DEFAULT 90,
  category TEXT CHECK (category IN (
    'tryout', 
    'skill_development', 
    'game_prep', 
    'conditioning',
    'team_building',
    'fundamentals',
    'advanced_tactics'
  )),
  drill_sequence JSONB NOT NULL DEFAULT '[]'::jsonb,
  coaching_tips TEXT[],
  equipment_needed TEXT[],
  is_public BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false, -- POWLAX-provided templates
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_practice_templates_age_group ON practice_templates(age_group);
CREATE INDEX IF NOT EXISTS idx_practice_templates_category ON practice_templates(category);
CREATE INDEX IF NOT EXISTS idx_practice_templates_public ON practice_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_practice_templates_official ON practice_templates(is_official) WHERE is_official = true;
CREATE INDEX IF NOT EXISTS idx_practice_templates_org ON practice_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_practice_templates_created_by ON practice_templates(created_by);

-- Row Level Security Policies

-- powlax_images RLS
ALTER TABLE powlax_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for drill images" ON powlax_images
  FOR SELECT USING (drill_id IS NOT NULL OR strategy_id IS NOT NULL);

CREATE POLICY "Users can upload images for their drills" ON powlax_images
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    (user_drill_id IN (
      SELECT id FROM user_drills WHERE user_id = auth.uid()
    ) OR uploaded_by = auth.uid())
  );

CREATE POLICY "Users can update their own images" ON powlax_images
  FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own images" ON powlax_images
  FOR DELETE USING (uploaded_by = auth.uid());

-- practice_plans RLS
ALTER TABLE practice_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own practice plans" ON practice_plans
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view team practice plans" ON practice_plans
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view public templates" ON practice_plans
  FOR SELECT USING (template = true AND age_group IS NOT NULL);

CREATE POLICY "Users can create practice plans" ON practice_plans
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('coach', 'assistant_coach', 'admin')
    )
  );

CREATE POLICY "Users can update own practice plans" ON practice_plans
  FOR UPDATE USING (
    user_id = auth.uid() OR
    (team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('coach', 'assistant_coach', 'admin')
    ))
  );

CREATE POLICY "Users can delete own practice plans" ON practice_plans
  FOR DELETE USING (
    user_id = auth.uid() OR
    (team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('coach', 'admin')
    ))
  );

-- practice_plan_drills RLS (inherits from practice_plans)
ALTER TABLE practice_plan_drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view practice plan drills" ON practice_plan_drills
  FOR SELECT USING (
    practice_plan_id IN (
      SELECT id FROM practice_plans 
      WHERE user_id = auth.uid() OR
      team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage practice plan drills" ON practice_plan_drills
  FOR ALL USING (
    practice_plan_id IN (
      SELECT id FROM practice_plans 
      WHERE user_id = auth.uid() OR
      (team_id IN (
        SELECT team_id FROM team_members 
        WHERE user_id = auth.uid() 
        AND role IN ('coach', 'assistant_coach', 'admin')
      ))
    )
  );

-- practice_templates RLS
ALTER TABLE practice_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View public templates" ON practice_templates
  FOR SELECT USING (is_public = true OR is_official = true);

CREATE POLICY "View organization templates" ON practice_templates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM teams
      JOIN team_members ON teams.id = team_members.team_id
      WHERE team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "View own templates" ON practice_templates
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Create templates" ON practice_templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Update own templates" ON practice_templates
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Delete own templates" ON practice_templates
  FOR DELETE USING (created_by = auth.uid());

-- Add update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_powlax_images_updated_at BEFORE UPDATE ON powlax_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practice_plans_updated_at BEFORE UPDATE ON practice_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practice_templates_updated_at BEFORE UPDATE ON practice_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE powlax_images IS 'Stores images for drills and strategies';
COMMENT ON TABLE practice_plans IS 'Stores saved practice plans and templates';
COMMENT ON TABLE practice_plan_drills IS 'Junction table linking drills to practice plans with instance-specific data';
COMMENT ON TABLE practice_templates IS 'Pre-built practice plan templates by age group and category';