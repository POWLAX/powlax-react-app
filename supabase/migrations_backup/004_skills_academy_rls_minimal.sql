-- Minimal RLS policies for Skills Academy tables that actually exist
-- Only targets the 4 tables created by skills_academy_complete_import.sql

-- Enable RLS on Skills Academy tables
ALTER TABLE skills_academy_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_academy_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_drill_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_drill_mapping ENABLE ROW LEVEL SECURITY;

-- Create read policies for authenticated users
CREATE POLICY "authenticated_read_skills_drills" ON skills_academy_drills
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_read_skills_workouts" ON skills_academy_workouts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_read_workout_relationships" ON workout_drill_relationships
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_read_workout_mapping" ON workout_drill_mapping
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin policies for content management
CREATE POLICY "admin_manage_skills_drills" ON skills_academy_drills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

CREATE POLICY "admin_manage_skills_workouts" ON skills_academy_workouts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

COMMENT ON SCHEMA public IS 'Minimal RLS policies for Skills Academy tables';