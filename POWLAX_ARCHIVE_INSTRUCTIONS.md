# POWLAX Archive Instructions - Step-by-Step Guide

**Date:** January 11, 2025  
**Purpose:** Detailed instructions for archiving 80% of POWLAX documentation  
**Prerequisites:** Read `POWLAX_DOCUMENT_ARCHIVE_ANALYSIS.md` first

---

## 🚨 CRITICAL WARNINGS

### ⚠️ BEFORE YOU START
1. **Backup everything** - Create a git branch or full backup
2. **Review the analysis** - Read `POWLAX_DOCUMENT_ARCHIVE_ANALYSIS.md` completely
3. **Check for active work** - Ensure no one is currently using files you plan to archive
4. **Gamification documents STAY** - User specifically requested to keep all gamification analysis docs

### ⚠️ DO NOT ARCHIVE THESE (User Requested)
- `GAMIFICATION_DESIGN_PROMPT.md` - User will use shortly
- `GAMIFICATION_SHOWCASE_DEMO.md` - User will use shortly  
- `docs/GAMIFICATION_TABLE_ANALYSIS_AND_RESTORATION_PLAN.md` - User will use shortly
- `docs/existing/Gamification/` (entire directory) - User will use shortly

---

## 📋 PHASE 1: PREPARATION (5 minutes)

### Step 1: Create Git Branch
```bash
cd /Users/patrickchapla/Development/POWLAX\ React\ App/React\ Code/powlax-react-app
git checkout -b archive-legacy-docs-$(date +%Y%m%d)
git add .
git commit -m "Backup before archive - all current documentation"
```

### Step 2: Create Archive Directory Structure
```bash
mkdir -p archive
mkdir -p archive/legacy-agents
mkdir -p archive/historical-fixes
mkdir -p archive/completed-migrations
mkdir -p archive/outdated-database-docs
mkdir -p archive/resolved-issues
mkdir -p archive/old-logs
mkdir -p archive/temp-files
mkdir -p archive/old-handoffs
mkdir -p archive/old-tasks
```

### Step 3: Create Archive Index
```bash
cat > archive/README.md << 'EOF'
# POWLAX Archive Directory

**Archive Date:** $(date)
**Reason:** Clean up for Claude-to-Claude Sub Agent workflow optimization
**Analysis:** See ../POWLAX_DOCUMENT_ARCHIVE_ANALYSIS.md

## Directory Structure
- `legacy-agents/` - Old claude-agents/ directory and POWLAX Master Controller system
- `historical-fixes/` - Completed fixes (AUTH_*, VIDEO_*, WORKOUT_* files)
- `completed-migrations/` - Finished migrations (GAMIPRESS_*, AGENT_* files)
- `outdated-database-docs/` - Database docs superseded by database-truth-sync-002.yaml
- `resolved-issues/` - Resolved implementation plans (WALL_BALL_* files)
- `old-logs/` - Development logs and temporary test results
- `temp-files/` - Temporary scripts and test files
- `old-handoffs/` - Outdated handoff documents (kept recent valuable ones)
- `old-tasks/` - Completed tasks and old coordination files

## Recovery
To restore any archived file:
```bash
cp archive/[category]/[filename] ./
```

All files remain in git history if needed.
EOF
```

---

## 📦 PHASE 2: ARCHIVE LEGACY AGENT SYSTEM (10 minutes)

### Step 4: Archive claude-agents Directory (ENTIRE DIRECTORY)
```bash
# Move the entire legacy agent system
mv claude-agents archive/legacy-agents/

# Create note about replacement
cat > archive/legacy-agents/README.md << 'EOF'
# Legacy POWLAX Agent System (ARCHIVED)

**Archived:** $(date)
**Reason:** Replaced by Claude-to-Claude Sub Agent workflow
**Status:** Legacy system - do not use

## What Was Archived
- powlax-master-controller.md - Old master controller workflow
- powlax-ux-researcher.md - Legacy UX agent
- powlax-doc-specialist.md - Legacy documentation agent  
- powlax-backend-architect.md - Legacy backend agent
- powlax-frontend-developer.md - Legacy frontend agent
- powlax-integration-specialist.md - Legacy integration agent
- powlax-sprint-prioritizer.md - Legacy product agent
- powlax-qa-specialist.md - Legacy QA agent
- powlax-test-specialist.md - Legacy testing agent

## Replacement
Use the Claude-to-Claude Sub Agent Contract system:
- contracts/active/*.yaml for all development work
- Component MASTER_CONTRACT.md files for specific areas
- AI_FRAMEWORK_ERROR_PREVENTION.md for error prevention

## Recovery (if needed)
```bash
cp -r archive/legacy-agents/claude-agents ./
```
EOF
```

---

## 📦 PHASE 3: ARCHIVE HISTORICAL FIXES (10 minutes)

### Step 5: Archive Completed Fix Documents
```bash
# Historical authentication fixes
mv AUTH_RACE_CONDITION_FIX.md archive/historical-fixes/
mv AUTH_REDIRECT_FIX_SUMMARY.md archive/historical-fixes/
mv ADMIN_AUTH_FIX_SUMMARY.md archive/historical-fixes/

# Video and page fixes
mv VIDEO_FIX_SUMMARY.md archive/historical-fixes/
mv WORKOUT_PAGE_FIX.md archive/historical-fixes/

# Performance and integration fixes
mv PERFORMANCE_OPTIMIZATION_SUMMARY.md archive/historical-fixes/
mv USER_DRILLS_INTEGRATION_SUMMARY.md archive/historical-fixes/
mv MEMBERPRESS_INTEGRATION_TEST_REPORT.md archive/historical-fixes/

# Create index
cat > archive/historical-fixes/README.md << 'EOF'
# Historical Fixes (ARCHIVED)

**Archived:** $(date)
**Reason:** Completed fixes no longer needed for active development
**Status:** Historical reference only

## Archived Fixes
- AUTH_RACE_CONDITION_FIX.md - Authentication race condition (FIXED)
- AUTH_REDIRECT_FIX_SUMMARY.md - Authentication redirect issues (FIXED)
- ADMIN_AUTH_FIX_SUMMARY.md - Admin authentication problems (FIXED)
- VIDEO_FIX_SUMMARY.md - Video functionality issues (FIXED)
- WORKOUT_PAGE_FIX.md - Workout page problems (FIXED)
- PERFORMANCE_OPTIMIZATION_SUMMARY.md - Performance improvements (COMPLETED)
- USER_DRILLS_INTEGRATION_SUMMARY.md - User drills integration (COMPLETED)
- MEMBERPRESS_INTEGRATION_TEST_REPORT.md - MemberPress testing (COMPLETED)

## Recovery (if similar issue occurs)
```bash
cp archive/historical-fixes/[filename].md ./
```
EOF
```

---

## 📦 PHASE 4: ARCHIVE COMPLETED MIGRATIONS (10 minutes)

### Step 6: Archive Migration Documents
```bash
# GamiPress migration documents
mv docs/GAMIPRESS_MIGRATION_AND_SYNC_PLAN.md archive/completed-migrations/
mv docs/AGENT_2_BADGE_MIGRATION_COMPLETE.md archive/completed-migrations/
mv docs/AGENT_3_USER_MIGRATION_COMPLETE.md archive/completed-migrations/
mv contracts/GAMIPRESS-MIGRATION-START.md archive/completed-migrations/
mv contracts/GAMIPRESS-MIGRATION-CONTRACT.md archive/completed-migrations/
mv docs/GAMIPRESS_DATA_EXPORT_IMPORT_GUIDE.md archive/completed-migrations/
mv docs/GAMIPRESS_SYNC_SETUP_GUIDE.md archive/completed-migrations/
mv docs/MIGRATION_REPORT.md archive/completed-migrations/

# Create index
cat > archive/completed-migrations/README.md << 'EOF'
# Completed Migrations (ARCHIVED)

**Archived:** $(date)
**Reason:** Migration work completed successfully
**Status:** Historical reference only

## Archived Migrations
- GAMIPRESS_MIGRATION_AND_SYNC_PLAN.md - GamiPress migration plan (COMPLETED)
- AGENT_2_BADGE_MIGRATION_COMPLETE.md - Badge migration results (COMPLETED)
- AGENT_3_USER_MIGRATION_COMPLETE.md - User migration results (COMPLETED)
- GAMIPRESS-MIGRATION-START.md - Migration start contract (COMPLETED)
- GAMIPRESS-MIGRATION-CONTRACT.md - Migration contract (COMPLETED)
- GAMIPRESS_DATA_EXPORT_IMPORT_GUIDE.md - Import guide (USED)
- GAMIPRESS_SYNC_SETUP_GUIDE.md - Sync setup guide (COMPLETED)
- MIGRATION_REPORT.md - Migration summary (COMPLETED)

## Recovery (if migration issues occur)
```bash
cp archive/completed-migrations/[filename].md ./
```
EOF
```

---

## 📦 PHASE 5: ARCHIVE OUTDATED DATABASE DOCS (10 minutes)

### Step 7: Archive Superseded Database Documentation
```bash
# Database documents superseded by database-truth-sync-002.yaml
mv docs/database/TABLE_REALITY_VS_ASSUMPTIONS.md archive/outdated-database-docs/
mv docs/ACTUAL_VS_EXPECTED_SCHEMAS.md archive/outdated-database-docs/
mv docs/TABLE_MAPPING_FIX_PLAN.md archive/outdated-database-docs/
mv DATABASE_CLEANUP_EXECUTION_PLAN.md archive/outdated-database-docs/

# NOTE: Keep GAMIFICATION_TABLES_RESOLUTION.md - user will use it
# (Even though it's resolved, user specifically wants gamification docs)

# Create index
cat > archive/outdated-database-docs/README.md << 'EOF'
# Outdated Database Documentation (ARCHIVED)

**Archived:** $(date)
**Reason:** Superseded by contracts/active/database-truth-sync-002.yaml
**Status:** Historical reference only

## Archived Documents
- TABLE_REALITY_VS_ASSUMPTIONS.md - Database assumptions (NOW CORRECTED)
- ACTUAL_VS_EXPECTED_SCHEMAS.md - Schema comparison (NOW RESOLVED)
- TABLE_MAPPING_FIX_PLAN.md - Table mapping issues (NOW FIXED)
- DATABASE_CLEANUP_EXECUTION_PLAN.md - Cleanup plan (NOW EXECUTED)

## Current Truth
Use contracts/active/database-truth-sync-002.yaml for all database information.
This file contains the definitive list of 62 actual tables.

## Recovery (if needed)
```bash
cp archive/outdated-database-docs/[filename].md ./
```
EOF
```

---

## 📦 PHASE 6: ARCHIVE RESOLVED ISSUES (5 minutes)

### Step 8: Archive Resolved Implementation Plans
```bash
# Wall ball resolution documents
mv WALL_BALL_DUPLICATE_ANALYSIS_AND_PLAN.md archive/resolved-issues/
mv WALL_BALL_UPLOAD_VERIFICATION_PLAN.md archive/resolved-issues/
mv WALL_BALL_CORRECT_IMPLEMENTATION_PLAN.md archive/resolved-issues/

# Create index
cat > archive/resolved-issues/README.md << 'EOF'
# Resolved Issues (ARCHIVED)

**Archived:** $(date)
**Reason:** Implementation plans that have been completed
**Status:** Historical reference only

## Archived Plans
- WALL_BALL_DUPLICATE_ANALYSIS_AND_PLAN.md - Wall ball duplicates (RESOLVED)
- WALL_BALL_UPLOAD_VERIFICATION_PLAN.md - Wall ball uploads (COMPLETED)
- WALL_BALL_CORRECT_IMPLEMENTATION_PLAN.md - Wall ball implementation (COMPLETED)

## Current Status
Wall ball functionality is now properly integrated into Skills Academy.
See skills-academy components for current implementation.

## Recovery (if similar issues occur)
```bash
cp archive/resolved-issues/[filename].md ./
```
EOF
```

---

## 📦 PHASE 7: ARCHIVE LOGS AND TEMP FILES (10 minutes)

### Step 9: Archive Development Logs
```bash
# Development logs
mv logs archive/old-logs/
mv dev*.log archive/old-logs/
mv test-results archive/old-logs/
mv screenshots archive/old-logs/ 2>/dev/null || true

# Create index
cat > archive/old-logs/README.md << 'EOF'
# Development Logs (ARCHIVED)

**Archived:** $(date)
**Reason:** Historical development data no longer needed
**Status:** Historical reference only

## Archived Logs
- logs/ - Development server logs
- dev*.log - Development session logs  
- test-results/ - Old test results and screenshots
- screenshots/ - Historical screenshots

## Recovery (if needed)
```bash
cp -r archive/old-logs/[directory] ./
```
EOF
```

### Step 10: DELETE Temporary Files (PERMANENT DELETION)
```bash
# Delete temporary check scripts (these can be recreated if needed)
rm -f check-*.ts
rm -f test-*.js
rm -f test-*.html
rm -f test-performance-and-integrity.js
rm -f test-simple-webhook.js
rm -f test-webhook-db-functions.ts
rm -f verify-skills-academy-tables.ts
rm -f test-jwt.js
rm -f claude-tips-monitor.js

# Delete temporary directories
rm -rf tmp/

# Create note about deleted files
cat > archive/temp-files/DELETED_FILES.md << 'EOF'
# Temporary Files (DELETED)

**Deleted:** $(date)
**Reason:** Temporary scripts and test files no longer needed
**Status:** PERMANENTLY DELETED (can be recreated if needed)

## Deleted Files
- check-*.ts (13 files) - Temporary database check scripts
- test-*.js (4 files) - Temporary test files
- test-*.html (2 files) - Temporary test pages
- verify-skills-academy-tables.ts - Temporary verification script
- claude-tips-monitor.js - Temporary monitoring script
- tmp/ directory - Temporary CSV and JSON files

## Recovery
These were temporary files. If similar functionality is needed:
1. Check git history: `git log --follow -- [filename]`
2. Recreate using current database structure from database-truth-sync-002.yaml
3. Use scripts/ directory for permanent scripts
EOF
```

---

## 📦 PHASE 8: ARCHIVE OLD HANDOFFS (15 minutes)

### Step 11: Archive Outdated Handoff Documents (Keep Recent Valuable Ones)

**⚠️ IMPORTANT:** Keep these 10 MOST RECENT handoff documents:

**Practice Planner Handoffs (MOST RECENT):**
- `docs/handoff/practice-planner-surgical-enhancements-final-handoff.md` (Jan 10, 2025 - MOST RECENT)
- `docs/handoff/PRACTICE_PLANNER_STATUS_JAN_2025.md` (Jan 9, 2025 - CURRENT STATUS)
- `docs/handoff/practice-planner-final-enhancements-requirements.md` (Jan 10, 2025)
- `docs/handoff/PRACTICE_PLANNER_CONTEXT.md` (Context documentation)
- `docs/handoff/practice-planner-ui-redesign-handoff.md` (UI patterns)

**Skills Academy Handoffs (MOST RECENT):**
- `docs/handoff/skills-academy-complete-handoff.md` (Aug 10, 2025 - MOST RECENT)
- `docs/handoff/wall-ball-skills-academy-unification-handoff.md` (Aug 10, 2025)
- `docs/handoff/skills-academy-critical-fixes-handoff.md`
- `docs/handoff/skills-academy-video-fix-SUCCESS.md`

**Other Important Handoffs:**
- `docs/handoff/memberpress-security-integration-handoff.md`

```bash
# First, let's see what handoff files exist
ls -la docs/handoff/

# Archive the older/less relevant handoff documents
# KEEP the 10 most recent handoffs listed above, archive the rest
mv docs/handoff/skills-academy-feature-innovations.md archive/old-handoffs/ 2>/dev/null || true
mv docs/handoff/skills-academy-enhancement-plan-v3.md archive/old-handoffs/ 2>/dev/null || true
mv docs/handoff/skills-academy-contract-analysis.md archive/old-handoffs/ 2>/dev/null || true
mv docs/handoff/skills-academy-implementation-contract.md archive/old-handoffs/ 2>/dev/null || true
mv docs/handoff/strategies-library-alignment-issue-analysis.md archive/old-handoffs/ 2>/dev/null || true

# NOTE: The following are KEPT (most recent handoffs):
# practice-planner-surgical-enhancements-final-handoff.md (Jan 10, 2025)
# PRACTICE_PLANNER_STATUS_JAN_2025.md (Jan 9, 2025)
# practice-planner-final-enhancements-requirements.md (Jan 10, 2025)
# PRACTICE_PLANNER_CONTEXT.md
# practice-planner-ui-redesign-handoff.md
# skills-academy-complete-handoff.md (Aug 10, 2025)
# wall-ball-skills-academy-unification-handoff.md (Aug 10, 2025)
# skills-academy-critical-fixes-handoff.md
# skills-academy-video-fix-SUCCESS.md
# memberpress-security-integration-handoff.md

# Create index
cat > archive/old-handoffs/README.md << 'EOF'
# Old Handoff Documents (ARCHIVED)

**Archived:** $(date)
**Reason:** Superseded by more recent handoff documents
**Status:** Historical reference only

## Kept (Most Recent & Valuable - 10 files)
The following handoff documents were KEPT in docs/handoff/:

**Practice Planner (Most Recent):**
- practice-planner-surgical-enhancements-final-handoff.md (Jan 10, 2025 - MOST RECENT)
- PRACTICE_PLANNER_STATUS_JAN_2025.md (Jan 9, 2025 - CURRENT STATUS)
- practice-planner-final-enhancements-requirements.md (Jan 10, 2025)
- PRACTICE_PLANNER_CONTEXT.md (Context documentation)
- practice-planner-ui-redesign-handoff.md (UI patterns)

**Skills Academy (Most Recent):**
- skills-academy-complete-handoff.md (Aug 10, 2025 - MOST RECENT)
- wall-ball-skills-academy-unification-handoff.md (Aug 10, 2025)
- skills-academy-critical-fixes-handoff.md
- skills-academy-video-fix-SUCCESS.md

**Other Important:**
- memberpress-security-integration-handoff.md

## Archived (Older/Superseded)
- Various dated handoff documents
- Superseded enhancement plans
- Old contract analyses

## Recovery (if needed)
```bash
cp archive/old-handoffs/[filename].md docs/handoff/
```
EOF
```

---

## 📦 PHASE 9: CLEAN TASK MANAGEMENT (10 minutes)

### Step 12: Archive Completed Tasks
```bash
# Archive completed tasks (keep active ones)
mv tasks/completed archive/old-tasks/ 2>/dev/null || true

# Check what's in tasks/active and archive old ones
ls -la tasks/active/

# Archive old task files (keep recent ones)
# Note: Review tasks/active/ first and only archive clearly outdated ones

# Create index for archived tasks
cat > archive/old-tasks/README.md << 'EOF'
# Old Tasks (ARCHIVED)

**Archived:** $(date)
**Reason:** Completed or outdated tasks
**Status:** Historical reference only

## Kept (Current)
Current active tasks remain in tasks/active/
Current coordination files remain in tasks/coordination/

## Archived
- tasks/completed/ - All completed tasks
- Any outdated tasks from tasks/active/

## Recovery (if needed)
```bash
cp -r archive/old-tasks/[directory] tasks/
```
EOF
```

---

## 🔄 PHASE 10: CREATE NEW CLAUDE.MD (20 minutes)

### Step 13: Backup Current CLAUDE.md and Create New Version
```bash
# Backup current CLAUDE.md
cp CLAUDE.md archive/CLAUDE.md.backup

# Create new CLAUDE.md based on actual database structure
cat > CLAUDE.md << 'EOF'
# CLAUDE.md - POWLAX Project Context

**Last Updated:** $(date)  
**Purpose:** Focused context for Claude-to-Claude Sub Agent workflow  
**Database Truth:** contracts/active/database-truth-sync-002.yaml (62 actual tables)

---

## 🚨 MANDATORY READS

**Before ANY work, read these files in order:**
1. **`AI_FRAMEWORK_ERROR_PREVENTION.md`** - Critical error prevention for AI assistants
2. **`contracts/active/database-truth-sync-002.yaml`** - Database truth (62 actual tables)
3. **Component-specific claude.md files** for targeted work (see below)

---

## 🗄️ DATABASE ARCHITECTURE (ACTUAL - HOLY BIBLE)

**Source:** `contracts/active/database-truth-sync-002.yaml`

### ✅ Active Tables with Data
**Skills Academy (WORKING):**
- `skills_academy_series` (49 records) - Workout series definitions
- `skills_academy_workouts` (166 records) - Workout definitions with drill_ids column
- `skills_academy_drills` (167 records) - Skills Academy drill library
- `skills_academy_user_progress` (3 records) - User progress tracking
- `wall_ball_drill_library` (48 records) - Wall ball workout video segments

**Teams (WORKING):**
- `clubs` (2 records) - Organization level above teams
- `teams` (10 records) - Team entities
- `team_members` (25 records) - Team membership

**Practice Planning (ACTIVE):**
- `powlax_drills` - Main POWLAX drill library
- `powlax_strategies` - Strategy library  
- `practices` - THE REAL practice plans table
- `practice_drills` - Drill instances with notes and modifications
- `powlax_images` - Drill media images
- `user_drills` - User-created drills
- `user_strategies` - User-created strategies

**Gamification (PARTIALLY ACTIVE):**
- `powlax_points_currencies` - Point currency definitions
- `points_transactions_powlax` - Point transaction history
- `user_points_wallets` - User point balances
- `user_badges` - Earned badges
- `powlax_player_ranks` - Player ranking definitions

**Authentication (ACTIVE):**
- `users` - Main user table (NOT user_profiles!)
- `user_sessions` - Session management
- `magic_links` (10 records) - Magic link authentication
- `registration_links` (10 records) - Registration tokens

### ❌ DO NOT USE (Tables that don't exist)
- `drills`, `strategies`, `concepts`, `skills` - DO NOT EXIST
- `practice_plans` - Use `practices` instead
- `user_profiles` - Use `users` instead
- `organizations` - Use `clubs` instead
- `badges` - Use `user_badges` instead
- `drills_powlax`, `strategies_powlax` - NEVER EXISTED

---

## 📱 CURRENT PAGE STATUS

### ✅ WORKING PAGES
- **`/demo/*`** - All demo pages functional
- **`/skills-academy`** - Marketing page working
- **`/(authenticated)/strategies`** - Strategy browser working
- **`/(authenticated)/details/[type]/[id]`** - Detail pages working

### 🔧 NEEDS WORK (See MASTER_CONTRACTs)
- **`/(authenticated)/skills-academy/workouts`** - Enhancement needed (see MASTER_CONTRACT)
- **`/(authenticated)/skills-academy/workout/[id]`** - Quiz-style interface needed
- **`/(authenticated)/teams/[teamId]/practice-plans`** - Stability improvements needed

### 🚨 CRITICAL RELATIONSHIPS
**Skills Academy:** `skills_academy_workouts.drill_ids` → `skills_academy_drills.id`  
**Practice Planning:** `practices` → `practice_drills` → `powlax_drills`/`powlax_strategies`  
**Teams:** `clubs` → `teams` → `team_members` → `users`

---

## 🤖 CLAUDE-TO-CLAUDE SUB AGENT WORKFLOW

### Contract System
- **All development work** uses contracts in `contracts/active/`
- **Component work** uses `MASTER_CONTRACT.md` files in component directories
- **Error prevention** follows `AI_FRAMEWORK_ERROR_PREVENTION.md`

### Component Context Files
**For Skills Academy work:**
- `src/components/skills-academy/MASTER_CONTRACT.md` - Enhancement contract
- `src/components/skills-academy/README.md` - Component navigation
- `src/components/skills-academy/claude.md` - Local context

**For Practice Planner work:**
- `src/components/practice-planner/MASTER_CONTRACT.md` - Enhancement contract
- `src/components/practice-planner/README.md` - Component navigation
- `src/components/practice-planner/claude.md` - Local context

**For UI Components:**
- `src/components/claude.md` - General component overview
- `src/components/ui/claude.md` - Shadcn/UI component context

---

## 🔧 DEVELOPMENT COMMANDS

### Server Management (CRITICAL)
```bash
# Check if server running
lsof -ti:3000

# Start server (if not running)
npm run dev

# Server MUST be running on port 3000 when work complete
```

### Validation (REQUIRED)
```bash
npm run lint              # ESLint checks
npm run typecheck         # TypeScript checks  
npm run build             # Production build test
npx playwright test       # End-to-end tests
```

### Database Scripts
```bash
npx tsx scripts/check-actual-tables.ts        # Verify database tables
npx tsx scripts/check-supabase-auth.ts        # Check auth integration
```

---

## ⚠️ CRITICAL WARNINGS

1. **NEVER reference tables that don't exist** (see ❌ list above)
2. **ALWAYS use `powlax_` prefix** for content tables
3. **Wall Ball is part of Skills Academy**, not separate
4. **No 4-tier taxonomy** exists (no concepts/skills)
5. **Use `drill_ids` column**, not junction tables
6. **`users` table**, not `user_profiles`
7. **`practices` table**, not `practice_plans`

---

## 🎯 SUCCESS CRITERIA

### ✅ Sub Agent Work Complete When:
- [ ] All database queries use actual table names
- [ ] No references to non-existent tables
- [ ] Component changes follow MASTER_CONTRACT
- [ ] All tests pass (`npx playwright test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Server running on port 3000

---

## 📚 ARCHIVED DOCUMENTATION

**Archive Date:** $(date)  
**Archived Files:** ~227 files moved to `archive/` directory  
**Reason:** Clean environment for Claude Sub Agent workflow

**Archive Contents:**
- `archive/legacy-agents/` - Old claude-agents/ system
- `archive/historical-fixes/` - Completed fixes
- `archive/completed-migrations/` - Finished migrations
- `archive/outdated-database-docs/` - Superseded database docs
- `archive/resolved-issues/` - Completed implementation plans
- `archive/old-logs/` - Development logs
- `archive/old-handoffs/` - Outdated handoff documents

**Recovery:** See `archive/README.md` for recovery instructions

---

**Remember:** This file provides focused, accurate context for Claude Sub Agents. All legacy workflows and outdated information have been archived to prevent confusion.
EOF
```

---

## ✅ PHASE 11: VERIFICATION AND CLEANUP (10 minutes)

### Step 14: Verify Archive Results
```bash
# Count files before/after
echo "=== ARCHIVE VERIFICATION ==="
echo "Files in archive directory:"
find archive -type f | wc -l

echo "Remaining markdown files in root/docs:"
find . -name "*.md" -not -path "./archive/*" -not -path "./node_modules/*" | wc -l

echo "Remaining YAML files:"
find . -name "*.yaml" -not -path "./archive/*" -not -path "./node_modules/*" | wc -l

# Check that critical files remain
echo "=== CRITICAL FILES CHECK ==="
echo "AI_FRAMEWORK_ERROR_PREVENTION.md exists:" $(test -f AI_FRAMEWORK_ERROR_PREVENTION.md && echo "✅ YES" || echo "❌ NO")
echo "database-truth-sync-002.yaml exists:" $(test -f contracts/active/database-truth-sync-002.yaml && echo "✅ YES" || echo "❌ NO")
echo "CLAUDE.md exists:" $(test -f CLAUDE.md && echo "✅ YES" || echo "❌ NO")

# Check gamification files are preserved (user requested)
echo "=== GAMIFICATION FILES CHECK (USER REQUESTED) ==="
echo "GAMIFICATION_DESIGN_PROMPT.md:" $(test -f GAMIFICATION_DESIGN_PROMPT.md && echo "✅ KEPT" || echo "❌ MISSING")
echo "GAMIFICATION_SHOWCASE_DEMO.md:" $(test -f GAMIFICATION_SHOWCASE_DEMO.md && echo "✅ KEPT" || echo "❌ MISSING")
echo "GAMIFICATION_TABLE_ANALYSIS_AND_RESTORATION_PLAN.md:" $(test -f docs/GAMIFICATION_TABLE_ANALYSIS_AND_RESTORATION_PLAN.md && echo "✅ KEPT" || echo "❌ MISSING")
echo "docs/existing/Gamification/ directory:" $(test -d docs/existing/Gamification && echo "✅ KEPT" || echo "❌ MISSING")
```

### Step 15: Test Build and Lint
```bash
# Ensure the project still works after archive
echo "=== TESTING PROJECT FUNCTIONALITY ==="
npm run lint
npm run typecheck
npm run build

echo "=== ARCHIVE COMPLETE ==="
echo "If all tests pass, the archive was successful!"
```

### Step 16: Commit Archive Results
```bash
git add .
git commit -m "Archive legacy documentation - 80% reduction

- Archived claude-agents/ directory (legacy workflow)
- Archived historical fixes (AUTH_*, VIDEO_*, WORKOUT_*)
- Archived completed migrations (GAMIPRESS_*, AGENT_*)
- Archived outdated database docs (superseded by database-truth-sync-002)
- Archived resolved issues (WALL_BALL_* plans)
- Archived development logs and temp files
- Created new focused CLAUDE.md
- Preserved gamification analysis docs (user requested)
- Preserved 7 valuable handoff documents
- Preserved all active contracts and component documentation

Result: Clean environment for Claude-to-Claude Sub Agent workflow"
```

---

## 🎯 POST-ARCHIVE CHECKLIST

### ✅ Verify These Files Still Exist:
- [ ] `AI_FRAMEWORK_ERROR_PREVENTION.md`
- [ ] `contracts/active/database-truth-sync-002.yaml`
- [ ] `CLAUDE.md` (new version)
- [ ] `src/claude.md`
- [ ] `src/components/skills-academy/MASTER_CONTRACT.md`
- [ ] `src/components/skills-academy/README.md`
- [ ] `src/components/skills-academy/claude.md`
- [ ] `src/components/practice-planner/MASTER_CONTRACT.md`
- [ ] `src/components/practice-planner/README.md`
- [ ] `src/components/practice-planner/claude.md`
- [ ] `src/components/claude.md`
- [ ] `src/components/ui/claude.md`
- [ ] All 16 files in `contracts/active/`
- [ ] `GAMIFICATION_DESIGN_PROMPT.md` (user requested)
- [ ] `GAMIFICATION_SHOWCASE_DEMO.md` (user requested)
- [ ] `docs/GAMIFICATION_TABLE_ANALYSIS_AND_RESTORATION_PLAN.md` (user requested)
- [ ] `docs/existing/Gamification/` directory (user requested)
- [ ] **10 most recent handoff documents** (see list above)

### ✅ Verify These Are Archived:
- [ ] `claude-agents/` directory → `archive/legacy-agents/`
- [ ] `AUTH_*` files → `archive/historical-fixes/`
- [ ] `GAMIPRESS_*` files → `archive/completed-migrations/`
- [ ] `TABLE_REALITY_*` files → `archive/outdated-database-docs/`
- [ ] `WALL_BALL_*` files → `archive/resolved-issues/`
- [ ] `logs/` directory → `archive/old-logs/`
- [ ] Temp files deleted with note in `archive/temp-files/`

### ✅ Test Project Functionality:
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts server on port 3000
- [ ] Demo pages load correctly
- [ ] Skills Academy pages load
- [ ] Practice Planner loads

---

## 🚨 RECOVERY PROCEDURES

### If You Need to Recover Files:
```bash
# Recover specific file
cp archive/[category]/[filename] ./

# Recover entire directory
cp -r archive/[category]/[directory] ./

# Recover from git if needed
git checkout HEAD~1 -- [filename]
```

### If Archive Went Wrong:
```bash
# Reset to pre-archive state
git reset --hard HEAD~1

# Or restore from backup branch
git checkout [backup-branch-name]
```

---

## 📊 EXPECTED RESULTS

**Before Archive:**
- ~287 markdown files
- Conflicting database information
- Legacy workflows mixed with current
- Historical noise mixed with current needs

**After Archive:**
- ~60 essential files
- Single source of truth (database-truth-sync-002.yaml)
- Clear Claude-to-Claude Sub Agent workflow
- Only current, relevant documentation

**Productivity Gains:**
- Faster Claude Sub Agent onboarding
- Reduced confusion from outdated info
- Better development decisions
- Cleaner handoffs between agents

---

## 🎯 FINAL VALIDATION

Run this command to ensure archive success:
```bash
echo "=== FINAL ARCHIVE VALIDATION ==="
echo "Total files archived:" $(find archive -type f | wc -l)
echo "Essential docs remaining:" $(find . -name "*.md" -not -path "./archive/*" -not -path "./node_modules/*" | wc -l)
echo "Active contracts:" $(ls contracts/active/*.yaml | wc -l)
echo "Gamification docs preserved:" $(ls GAMIFICATION_*.md docs/GAMIFICATION_*.md docs/existing/Gamification/*.md 2>/dev/null | wc -l)
echo "Project builds:" $(npm run build > /dev/null 2>&1 && echo "✅ YES" || echo "❌ NO")

echo ""
echo "🎉 ARCHIVE COMPLETE!"
echo "Your POWLAX project now has a clean, focused documentation environment"
echo "optimized for Claude-to-Claude Sub Agent workflows."
```

---

**Total Time Required:** ~90 minutes  
**Files Preserved:** ~60 essential files  
**Files Archived:** ~227 files  
**Gamification Docs:** Preserved as requested  
**Project Status:** Fully functional with clean documentation
