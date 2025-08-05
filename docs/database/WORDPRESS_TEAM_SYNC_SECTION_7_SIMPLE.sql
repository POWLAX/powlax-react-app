-- 7. Row Level Security (RLS) - Simplified version
-- Enable RLS on new tables only
ALTER TABLE user_organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_team_roles ENABLE ROW LEVEL SECURITY;

-- For now, skip the complex policies and continue with the migration
-- We'll add the policies after all tables are properly set up