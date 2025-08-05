-- Correct views and functions based on actual table structure

-- 1. Drop existing view/function if they exist
DROP VIEW IF EXISTS team_hierarchy;
DROP FUNCTION IF EXISTS get_user_teams(UUID);

-- 2. Create corrected view using club_id
CREATE OR REPLACE VIEW team_hierarchy AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  t.slug as team_slug,
  t.level,
  t.gender,
  t.age_group,
  t.subscription_tier,
  o1.id as club_id,
  o1.name as club_name,
  o2.id as parent_club_id,
  o2.name as parent_club_name
FROM teams t
LEFT JOIN organizations o1 ON t.club_id = o1.id
LEFT JOIN organizations o2 ON o1.parent_org_id = o2.id;

-- 3. Create corrected function using club_id
CREATE OR REPLACE FUNCTION get_user_teams(user_uuid UUID)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  team_slug TEXT,
  user_role TEXT,
  club_name TEXT,
  parent_club_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    t.id,
    t.name::TEXT,
    t.slug,
    utr.role,
    o1.name,
    o2.name
  FROM teams t
  JOIN user_team_roles utr ON t.id = utr.team_id
  LEFT JOIN organizations o1 ON t.club_id = o1.id
  LEFT JOIN organizations o2 ON o1.parent_org_id = o2.id
  WHERE utr.user_id = user_uuid
  ORDER BY t.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Additional helper function to get user's organizations
CREATE OR REPLACE FUNCTION get_user_organizations(user_uuid UUID)
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  organization_slug TEXT,
  user_role TEXT,
  organization_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    o.id,
    o.name,
    o.slug,
    uor.role,
    o.type
  FROM organizations o
  JOIN user_organization_roles uor ON o.id = uor.organization_id
  WHERE uor.user_id = user_uuid
  ORDER BY o.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;