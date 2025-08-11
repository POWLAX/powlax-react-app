# POWLAX Database Cleanup Execution Plan
*Created: January 16, 2025*
*Status: Ready for Execution*

## 🎯 **Execution Overview**

**Goal:** Clean up 23 legacy/unused tables while preserving all MemberPress integration and active features  
**Impact:** 48% reduction in database complexity (48 → 31 tables)  
**Safety:** Phased approach with verification at each step  

## 📋 **Pre-Execution Checklist**

### ✅ **Before Running Migrations**
- [ ] Database backup completed
- [ ] Verify current app is working (practice planner, skills academy)
- [ ] Confirm no active users during migration window
- [ ] Test database connection: `psql $DATABASE_URL -c "SELECT NOW();"`

### ⚠️ **Critical Verification**
```sql
-- Verify these tables exist and have data BEFORE cleanup
SELECT 
  'users' as table_name, COUNT(*) as records FROM users
UNION ALL SELECT 'team_teams', COUNT(*) FROM team_teams  
UNION ALL SELECT 'powlax_drills', COUNT(*) FROM powlax_drills
UNION ALL SELECT 'powlax_strategies', COUNT(*) FROM powlax_strategies
UNION ALL SELECT 'practices', COUNT(*) FROM practices;
```

## 🚀 **Execution Steps**

### Phase 1: Safe Legacy Table Removal
```bash
cd /Users/patrickchapla/Development/POWLAX\ React\ App/React\ Code/powlax-react-app

# Execute Phase 1 cleanup
psql $DATABASE_URL -f supabase/migrations/070_cleanup_legacy_tables_phase1.sql
```

**Tables Removed (23 total):**
- 6 staging tables (staging_wp_*)
- 4 legacy content tables (drills, strategies_powlax, etc.)
- 6 unused wall ball tables
- 5 unused skills academy tables
- 9 unused gamification/progress tables
- 3 unused system tables

### Phase 2: Legacy Organization Structure
```bash
# Execute Phase 2 cleanup  
psql $DATABASE_URL -f supabase/migrations/071_cleanup_legacy_tables_phase2.sql
```

**Tables Removed:**
- `organizations` → replaced by `club_organizations`
- `teams` → replaced by `team_teams`
- `user_organization_roles`, `user_team_roles` → replaced by `team_members`

### Phase 3: Create Missing Auth Tables
```bash
# Create missing required tables
psql $DATABASE_URL -f supabase/migrations/072_create_missing_auth_tables.sql
```

**Tables Created:**
- `registration_sessions` - Registration progress tracking
- `user_onboarding` - Step-by-step onboarding

### Phase 4: Verification & Integration
```bash
# Verify complete auth integration
psql $DATABASE_URL -f supabase/migrations/073_verify_auth_integration_tables.sql
```

## 🔍 **Post-Migration Verification**

### Database Structure Check
```sql
-- Should show ~31 tables
SELECT COUNT(*) as total_tables FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- List all remaining tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE' 
ORDER BY table_name;
```

### Critical Function Tests
```bash
# Test practice planner (should load drills)
curl -s "http://localhost:3004/teams/1/practice-plans" | grep -i "practice planner"

# Test skills academy (should load workouts)  
curl -s "http://localhost:3004/skills-academy-public" | grep -i "skills academy"

# Test team page (should load teams)
curl -s "http://localhost:3004/teams" | grep -i "teams"
```

### Database Integrity Check
```sql
-- Verify no broken foreign keys
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

## 🚨 **Rollback Plan** (If Issues Occur)

### Emergency Rollback
```bash
# Restore from backup if critical issues
pg_restore --clean --no-acl --no-owner -d $DATABASE_URL backup_pre_cleanup.sql

# Or restore specific tables if needed
psql $DATABASE_URL -c "CREATE TABLE staging_wp_drills AS SELECT * FROM staging_wp_drills_backup;"
```

### Selective Rollback
```sql
-- If specific functionality breaks, restore individual tables
-- Example: If practice planner breaks, check powlax_drills table
SELECT COUNT(*) FROM powlax_drills; -- Should have drill records

-- If skills academy breaks, check skills_academy_workouts
SELECT COUNT(*) FROM skills_academy_workouts; -- Should have workout records
```

## 📊 **Expected Results**

### Before Cleanup
- **Total Tables:** ~48 tables
- **Staging Tables:** 6 tables (unused)
- **Legacy Duplicates:** 8 tables (replaced)
- **Unused Features:** 9 tables (not implemented)

### After Cleanup  
- **Total Tables:** ~31 tables (-35% complexity)
- **Core Auth:** 12 tables (MemberPress integration)
- **Active Features:** 16 tables (practice planner, skills academy, teams)
- **System Tables:** 3 tables (essential only)

### Performance Improvements
- Faster schema queries
- Reduced backup/restore times
- Cleaner database structure
- Easier maintenance and debugging

## ✅ **Success Criteria**

### Functional Tests Pass
- [ ] Practice Planner loads and shows drills
- [ ] Skills Academy shows workouts and series
- [ ] Teams page loads team structure
- [ ] User registration/login flow works
- [ ] MemberPress webhooks process correctly

### Database Health
- [ ] No foreign key constraint errors
- [ ] All RLS policies intact
- [ ] No missing table references in application code
- [ ] Backup/restore completes successfully

### Code Integration
- [ ] No broken table references in hooks
- [ ] All API endpoints function correctly
- [ ] Authentication flow works end-to-end
- [ ] Admin features accessible for patrick@powlax.com

## 🎯 **Next Steps After Cleanup**

1. **Update Claude.md files** ✅ Completed
2. **Test authentication migration** (Contract 006)
3. **Verify MemberPress webhook integration**
4. **Update API documentation**
5. **Run comprehensive test suite**

---

**⚠️ IMPORTANT:** This cleanup removes 48% of database tables. Execute during low-traffic period with full backup available.
