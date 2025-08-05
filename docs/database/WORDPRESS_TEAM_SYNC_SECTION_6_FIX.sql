-- 6. Create updated_at triggers (drop first to avoid conflicts)
-- PostgreSQL doesn't support CREATE TRIGGER IF NOT EXISTS, so we drop first
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at 
BEFORE UPDATE ON organizations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at 
BEFORE UPDATE ON teams 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();