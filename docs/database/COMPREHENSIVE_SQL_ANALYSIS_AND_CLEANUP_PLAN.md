# POWLAX Comprehensive SQL Analysis & Database Cleanup Plan

**Generated:** 2025-01-15  
**Purpose:** Complete analysis of all SQL files, table relationships, and cleanup strategy for Supabase database

---

## 🚨 **CRITICAL FINDINGS - Why Agents Are Confused**

### 1. **Multiple Naming Conventions Conflict**
- **Database Reality:** Tables use `[entity]_powlax` format (e.g., `strategies_powlax`, `drills_powlax`)
- **Code Expectations:** Components expect `powlax_[entity]` format (e.g., `powlax_drills`, `powlax_strategies`)
- **Result:** Hooks fail, fall back to mock data, agents can't find tables

### 2. **82 SQL Files with Overlapping Purposes**
- **Migration Files:** 40+ files in `supabase/migrations/`
- **Script Files:** 32+ files in `scripts/database/`
- **Documentation SQL:** 11+ files in `docs/database/`
- **Many create the SAME tables with different approaches**

### 3. **Table Creation Conflicts**
- Multiple files attempt to create the same tables
- Some use different schemas/column names
- Migration order creates dependency conflicts
- RLS policies applied multiple times

---

## 📊 **CURRENT DATABASE STATE**

### **Tables That Exist and Have Data:**  - Delete all of these
1. `powlax_wall_ball_drill_library` (5 records) ✅
2. `powlax_wall_ball_collections` (4 records) ✅  
3. `powlax_wall_ball_collection_drills` (3 records) ✅

### **Tables That Exist But Are Empty:** Delete All of these
- `strategies_powlax` (0 records) ⚠️ 
- `drills_powlax` (0 records) ⚠️
- `skills_academy_powlax` (0 records) ⚠️
- `wall_ball_powlax` (0 records) ⚠️
- `lessons_powlax` (0 records) ⚠️
- `drill_strategy_map_powlax` (0 records) ⚠️
- Plus 22 other empty tables

### **Tables Expected by Code But Missing:**  How are these missing?
- `powlax_drills` (code expects this)
- `powlax_strategies` (code expects this)
- `skills_academy_drills` (code expects this)
- `skills_academy_workouts` (code expects this)

---

## 🗂️ **COMPLETE SQL FILE ANALYSIS**

### **A. Migration Files (supabase/migrations/)** - 40 files

#### **Core Foundation Migrations:**
1. **001_staging_tables.sql** - Creates staging tables for WordPress import
2. **002_update_staging_tables.sql** - Updates staging table structure
3. **002_wordpress_auth_tables.sql** - WordPress authentication bridge
4. **003_enhanced_security_policies.sql** - RLS policies
5. **003_paid_features_enhancements.sql** - Paid features schema

#### **Organization/Team Migrations:**
6. **004_organizations_and_teams.sql** - Creates organizations/teams
7. **051_core_org_team_members.sql** - Team membership structure
8. **050_wp_org_team_enhancements.sql** - WordPress team sync

#### **Gamification Migrations:**
9. **052_gamification_core.sql** - Points, badges, ranks system
10. **053_prefix_tables_and_catalogs.sql** - Naming convention enforcement
11. **055_bootstrap_all_tables.sql** - One-shot table creation

#### **Skills Academy Migrations:**
12. **004_skills_academy_rls_policies.sql** - Skills Academy RLS
13. **004_skills_academy_rls_simple.sql** - Simplified RLS
14. **004_skills_academy_rls_minimal.sql** - Minimal RLS
15. **fix_table_naming_and_skills_academy.sql** - Naming fixes

#### **Practice Planner Migrations:**
16. **009_practice_planner_optimization.sql** - Practice planner tables
17. **030_practice_planner_enhancements.sql** - Enhanced practice features
18. **20250109_create_practice_planner_tables.sql** - Latest practice tables
19. **20250109_create_practice_planner_tables_fixed.sql** - Fixed version

#### **Wall Ball Migrations:**
20. **020_create_wall_ball_v2.sql** - Wall ball system v2

#### **Other Migrations:**
21. **005_add_difficulty_scores.sql** - Difficulty scoring
22. **006_add_streak_tracking.sql** - Streak tracking
23. **007_workout_completions.sql** - Workout completion tracking
24. **008_update_badge_requirements.sql** - Badge system updates
25. **010_create_user_favorites_table.sql** - User favorites
26. **057_registration_and_status.sql** - Registration system
27. **058_adjust_registration_link_defaults.sql** - Registration links
28. **059_webhook_events.sql** - Webhook system
29. **060_webhook_queue_system.sql** - Webhook queue
30. **061_supabase_auth_bridge.sql** - Auth bridge

### **B. Database Scripts (scripts/database/)** - 32 files

#### **Skills Academy Scripts:**
1. **create_skills_academy_SAFE.sql** - Safe Skills Academy creation
2. **create_skills_academy_real_data.sql** - Skills Academy with real data
3. **create_skills_academy_system_complete.sql** - Complete Skills Academy
4. **create_academy_workouts_v2.sql** - Academy workouts v2

#### **Wall Ball Scripts:**
5. **create_wall_ball_system_complete.sql** - Complete wall ball system
6. **create_wall_ball_system_v3.sql** - Wall ball system v3
7. **create_wall_ball_v2.sql** - Wall ball v2
8. **create_wall_ball_grouped_system.sql** - Grouped wall ball
9. **create_and_populate_wall_ball_complete.sql** - Wall ball with data
10. **populate_wall_ball_complete.sql** - Wall ball data population
11. **insert_wall_ball_workouts_complete.sql** - Wall ball workout inserts

#### **General Table Creation Scripts:**
12. **create-all-powlax-tables.sql** - All POWLAX tables
13. **create-all-missing-tables.sql** - Missing table creation
14. **create-all-missing-tables-fixed.sql** - Fixed missing tables
15. **create-missing-powlax-tables.sql** - Missing POWLAX tables

#### **Utility Scripts:**
16. **phase1-database-prep.sql** - Database preparation
17. **seed_powlax_club_os.sql** - Club OS seeding
18. **check-all-tables.ts** - Table checking utility
19. **check-supabase-tables.ts** - Supabase table check

### **C. Import Scripts (scripts/imports/)** - 11 files

1. **gamification_complete_import.sql** - Complete gamification import
2. **skills_academy_complete_import.sql** - Complete Skills Academy import
3. **badges_import.sql** - Badge data import
4. **ranks_import.sql** - Rank data import
5. **skills_academy_workouts_import.sql** - Workout import
6. **skills_academy_drills_import.sql** - Drill import
7. **create_table.sql** - Generic table creation

### **D. Documentation SQL (docs/database/)** - 11 files

1. **CHECK_TABLE_STRUCTURE.sql** - Table structure validation
2. **CHECK_COLUMNS.sql** - Column validation
3. **CORRECT_RLS_POLICIES.sql** - RLS policy corrections
4. **CORRECT_VIEWS_AND_FUNCTIONS.sql** - View/function fixes
5. **FIX_USERS_ROLES_COLUMN.sql** - User roles fix
6. **WORDPRESS_TEAM_SYNC_*.sql** - WordPress sync scripts (6 files)

---

## 🔗 **TABLE RELATIONSHIP MAPPING**

### **Core Entity Relationships:**

```
users (Supabase Auth)
├── wordpress_id → WordPress Users
├── user_points_wallets → Gamification
├── user_badges → Badge System  
├── user_ranks → Rank System
├── team_members → Team Membership
└── user_favorites → Content Favorites

organizations (club_organizations)
└── teams (team_teams)
    └── team_members
        └── users

powlax_strategies (strategies_powlax)
├── drill_strategy_map_powlax → powlax_drills
└── user_favorites

powlax_drills (drills_powlax)  
├── drill_strategy_map_powlax → powlax_strategies
├── skills_academy_drills (separate system)
└── user_favorites

skills_academy_workouts
├── drill_ids[] → skills_academy_drills
└── workout_drill_relationships (alternative)

powlax_wall_ball_collections
└── powlax_wall_ball_collection_drills
    └── powlax_wall_ball_drill_library
```

### **Foreign Key Dependencies:**
- **users** → All user_* tables (CASCADE DELETE)
- **organizations** → teams (SET NULL)
- **teams** → team_members (CASCADE DELETE)
- **powlax_points_currencies** → user_points_wallets (RESTRICT DELETE)

---

## 🧹 **CLEANUP STRATEGY**

### **Phase 1: Critical Naming Fix (IMMEDIATE)**

#### **Problem:** Code expects `powlax_drills` but database has `drills_powlax`

**Solution A: Rename Database Tables (RECOMMENDED)**
```sql
-- Rename to match code expectations
ALTER TABLE drills_powlax RENAME TO powlax_drills;
ALTER TABLE strategies_powlax RENAME TO powlax_strategies;
ALTER TABLE wall_ball_powlax RENAME TO powlax_wall_ball;
ALTER TABLE lessons_powlax RENAME TO powlax_lessons;
ALTER TABLE drill_strategy_map_powlax RENAME TO powlax_drill_strategy_map;

-- Update indexes and constraints
-- (Automated script needed)
```

**Solution B: Create Views (TEMPORARY)**
```sql
-- Compatibility views until code is updated
CREATE VIEW powlax_drills AS SELECT * FROM drills_powlax;
CREATE VIEW powlax_strategies AS SELECT * FROM strategies_powlax;
```

### **Phase 2: Remove Duplicate/Conflicting SQL Files**

#### **Files to DELETE (Safe to Remove):**
1. **Duplicate Migration Files:**
   - `004_skills_academy_rls_simple.sql` (keep `004_skills_academy_rls_policies.sql`)
   - `004_skills_academy_rls_minimal.sql` (redundant)
   - `004_dynamic_rls_fix.sql` (superseded)
   - `004_fix_unrestricted_tables.sql` (superseded)
   - `004_secure_only_tables.sql` (superseded)

2. **Superseded Scripts:**
   - `scripts/database/create_wall_ball_v2.sql` (use v3)
   - `scripts/database/create-all-missing-tables.sql` (use fixed version)
   - `scripts/database/create_skills_academy_real_data.sql` (use complete version)

3. **Development/Testing Files:**
   - `scripts/database/create_sample_wall_ball_data.sql`
   - `CREATE_TEST_ADMIN.sql`

#### **Files to CONSOLIDATE:**
1. **Merge Skills Academy Creation:**
   - Keep: `create_skills_academy_system_complete.sql`
   - Remove: `create_skills_academy_SAFE.sql`, `create_skills_academy_real_data.sql`

2. **Merge Wall Ball Creation:**
   - Keep: `create_wall_ball_system_complete.sql`
   - Remove: `create_wall_ball_system_v3.sql`, `create_wall_ball_grouped_system.sql`

### **Phase 3: Table Cleanup in Supabase**

#### **Tables to DROP (Empty and Unused):**
```sql
-- Empty tables that are superseded
DROP TABLE IF EXISTS skills_academy_powlax CASCADE;
DROP TABLE IF EXISTS wall_ball_powlax CASCADE;
DROP TABLE IF EXISTS lessons_powlax CASCADE;

-- Staging tables (if import is complete)
DROP TABLE IF EXISTS staging_wp_drills CASCADE;
DROP TABLE IF EXISTS staging_wp_strategies CASCADE;
DROP TABLE IF EXISTS staging_wp_academy_drills CASCADE;
```

#### **Tables to POPULATE (Currently Empty):**
1. **powlax_drills** (after rename) - Import practice planner drills
2. **powlax_strategies** (after rename) - Import coaching strategies  
3. **skills_academy_drills** - Import Skills Academy individual drills
4. **skills_academy_workouts** - Import Skills Academy workout collections

### **Phase 4: Dependency Resolution**

#### **Safe Deletion Order:**
1. Drop user-specific tables first (no dependencies)
2. Drop junction tables (drill_strategy_map_powlax)
3. Drop content tables (drills, strategies)
4. Drop catalog tables last

#### **Tables That CANNOT be Deleted (Have Dependencies):**
- **users** - Referenced by all user_* tables
- **organizations** - Referenced by teams
- **teams** - Referenced by team_members
- **powlax_points_currencies** - Referenced by user_points_wallets

---

## 🎯 **RECOMMENDED ACTION PLAN**

### **IMMEDIATE (This Week):**

1. **Fix Naming Convention Crisis:**
   ```sql
   -- Run this in Supabase SQL Editor
   ALTER TABLE drills_powlax RENAME TO powlax_drills;
   ALTER TABLE strategies_powlax RENAME TO powlax_strategies;
   ```

2. **Test Practice Planner Connectivity:**
   - Verify hooks now connect to real data
   - Remove mock data fallbacks

3. **Delete Obvious Duplicates:**
   - Remove 15+ redundant SQL files identified above
   - Keep only the "complete" versions

### **SHORT TERM (Next 2 Weeks):**

4. **Populate Empty Tables:**
   - Import drill data into `powlax_drills`
   - Import strategy data into `powlax_strategies`
   - Connect Skills Academy drills to workouts

5. **Clean Database:**
   - Drop unused staging tables
   - Drop empty superseded tables
   - Verify all foreign key constraints

### **LONG TERM (Next Month):**

6. **Consolidate SQL Files:**
   - Create single migration for each major feature
   - Document final table schema
   - Create backup/restore procedures

---

## 🔧 **SAFE DELETION COMMANDS**

### **Check Dependencies Before Deletion:**
```sql
-- Check what references a table before dropping
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.table_name='TABLE_NAME_TO_CHECK';
```

### **Safe Table Deletion Script:**
```sql
-- 1. Drop user data tables (no dependencies)
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_workout_completions CASCADE;

-- 2. Drop junction tables
DROP TABLE IF EXISTS drill_strategy_map_powlax CASCADE;

-- 3. Drop empty content tables
DROP TABLE IF EXISTS skills_academy_powlax CASCADE;
DROP TABLE IF EXISTS wall_ball_powlax CASCADE;
DROP TABLE IF EXISTS lessons_powlax CASCADE;

-- 4. Drop staging tables (after import complete)
DROP TABLE IF EXISTS staging_wp_drills CASCADE;
DROP TABLE IF EXISTS staging_wp_strategies CASCADE;
```

---

## 📋 **SUMMARY FOR AGENTS**

### **What's Causing Confusion:**
1. **Table names don't match code expectations**
2. **82 SQL files with overlapping purposes**
3. **Empty tables that should have data**
4. **Multiple RLS policies for same tables**

### **Immediate Fixes Needed:**
1. **Rename `drills_powlax` → `powlax_drills`**
2. **Rename `strategies_powlax` → `powlax_strategies`**
3. **Delete 15+ redundant SQL files**
4. **Populate empty tables with actual data**

### **Long-term Solution:**
1. **Single source of truth for each table**
2. **Consistent naming convention across all files**
3. **Clear documentation of table purposes**
4. **Proper foreign key relationships**

---

*This analysis provides the complete roadmap to resolve database confusion and establish a clean, maintainable schema for the POWLAX application.*
