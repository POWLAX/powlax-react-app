# CLAUDE.md - POWLAX Project Context

**Last Updated:** January 11, 2025  
**Branch:** Claude-to-Claude-Sub-Agent-Work-Flow  
**Database Truth:** contracts/active/database-truth-sync-002.yaml (62 actual tables)

---

## 🚨 CRITICAL: Server Management Requirements

**MANDATORY FOR ALL WORK:**
- **ALWAYS run dev server on port 3000**: `npm run dev`
- **Check if running first**: `lsof -ti:3000`
- **Start if not running**: `npm run dev`
- **NEVER turn off server** - Leave running for user review
- **Server MUST be running on port 3000 when work is complete!**

---

## 🚨 MANDATORY READS BEFORE ANY WORK

1. **`AI_FRAMEWORK_ERROR_PREVENTION.md`** - Critical error prevention for AI assistants
2. **`contracts/active/database-truth-sync-002.yaml`** - Database truth (62 actual tables)
3. **Component-specific MASTER_CONTRACT.md and claude.md files** for targeted work

---

## 🗄️ DATABASE ARCHITECTURE (ACTUAL - HOLY BIBLE)

**Source:** `contracts/active/database-truth-sync-002.yaml`

### ✅ Active Tables with Data (62 Total)

#### Skills Academy Core (WORKING)
- **skills_academy_series** (49 records) - Workout series definitions
- **skills_academy_workouts** (166 records) - Workout definitions with `drill_ids` column
- **skills_academy_drills** (167 records) - Skills Academy drill library
- **skills_academy_user_progress** (3 records) - User progress tracking
- **wall_ball_drill_library** (48 records) - Wall ball workout video segments

**Key Relationship:** Use `drill_ids` column in workouts, NOT junction tables

#### Practice Planning (ACTIVE)
- **powlax_drills** - Main POWLAX drill library (NOT `drills`)
- **powlax_strategies** - Strategy library (NOT `strategies`)
- **practices** - THE REAL practice plans table (NOT `practice_plans`)
- **practice_drills** - Drill instances with notes and modifications
- **powlax_images** - Drill media images
- **user_drills** - User-created drills
- **user_strategies** - User-created strategies

#### Team Management (WORKING)
- **clubs** (2 records) - Organization level above teams (NOT `organizations`)
- **teams** (10 records) - Team entities
- **team_members** (25 records) - Team membership

#### User & Auth (ACTIVE)
- **users** - Main user table (NOT `user_profiles`!)
- **user_sessions** - Session management
- **magic_links** (10 records) - Magic link authentication
- **registration_links** (10 records) - Registration tokens

#### Gamification (PARTIALLY ACTIVE)
- **powlax_points_currencies** - Point currency definitions
- **points_transactions_powlax** - Point transaction history (NOT `points_ledger`)
- **user_points_wallets** - User point balances
- **user_badges** - Earned badges (NOT `badges`)
- **powlax_player_ranks** - Player ranking definitions

### ❌ TABLES THAT DO NOT EXIST (NEVER REFERENCE THESE!)
- `drills`, `strategies`, `concepts`, `skills` - DO NOT EXIST
- `practice_plans`, `practice_plan_drills` - Use `practices` and `practice_drills`
- `user_profiles` - Use `users` instead
- `organizations` - Use `clubs` instead
- `badges` - Use `user_badges` instead
- `points_ledger` - Use `points_transactions_powlax`
- Any junction tables - Use `drill_ids` column instead

---

## 📱 CURRENT PAGE STATUS

### ✅ WORKING PAGES
- `/demo/*` - All demo pages functional
- `/skills-academy` - Marketing page with position tracks
- `/(authenticated)/strategies` - Strategy browser working
- `/(authenticated)/details/[type]/[id]` - Detail pages working
- `/dashboard` - Dashboard (may show loading spinner - data issue)

### 🔧 NEEDS WORK (See MASTER_CONTRACTs)
- `/(authenticated)/skills-academy/workouts` - Enhancement needed per MASTER_CONTRACT
- `/(authenticated)/skills-academy/workout/[id]` - Quiz-style interface needed
- `/(authenticated)/teams/[teamId]/practice-plans` - Stability improvements needed

---

## 🤖 CLAUDE-TO-CLAUDE SUB AGENT WORKFLOW

### Active Contracts
Use contracts in `contracts/active/` for all development work:
- `database-truth-sync-002.yaml` - Database truth
- `practice-planner-*.yaml` - Practice Planner contracts
- `skills-academy-*.yaml` - Skills Academy contracts
- Other active contracts for specific features

### Component Documentation
**Skills Academy:**
- `src/components/skills-academy/MASTER_CONTRACT.md` - Enhancement contract
- `src/components/skills-academy/README.md` - Component navigation
- `src/components/skills-academy/claude.md` - Local context

**Practice Planner:**
- `src/components/practice-planner/MASTER_CONTRACT.md` - Enhancement contract
- `src/components/practice-planner/README.md` - Component navigation
- `src/components/practice-planner/claude.md` - Local context

**UI Components:**
- `src/components/claude.md` - General component overview
- `src/components/ui/claude.md` - Shadcn/UI component context

---

## 🔧 CRITICAL COMMANDS

### Development
```bash
npm run dev              # Start Next.js dev server on port 3000
npm run build            # Build for production
npm run start            # Start production server
```

### Validation (REQUIRED before commit)
```bash
npm run lint             # Run ESLint checks
npm run typecheck        # Run TypeScript type checking
npm run build            # Ensure build succeeds
npx playwright test      # Run E2E tests
```

### Database Scripts
```bash
npx tsx scripts/check-actual-tables.ts      # Verify database tables
npx tsx scripts/check-supabase-auth.ts      # Check auth integration
```

---

## ⚠️ CRITICAL WARNINGS

### Database References
1. **NEVER** reference tables that don't exist (see ❌ list above)
2. **ALWAYS** use `powlax_` prefix for content tables
3. **Wall Ball is part of Skills Academy**, not separate
4. **No 4-tier taxonomy** exists (no concepts/skills tables)
5. **Use `drill_ids` column**, not junction tables
6. **`users` table**, not `user_profiles`
7. **`practices` table**, not `practice_plans`
8. **`clubs` table**, not `organizations`

### Common Errors to Avoid
```typescript
// ❌ WRONG - Non-existent tables
const { data } = await supabase.from('drills').select('*')
const { data } = await supabase.from('strategies').select('*')

// ✅ CORRECT - Actual table names
const { data } = await supabase.from('powlax_drills').select('*')
const { data } = await supabase.from('powlax_strategies').select('*')
```

---

## 🎯 SUCCESS CRITERIA

### Sub Agent Work Complete When:
- [ ] All database queries use actual table names
- [ ] No references to non-existent tables
- [ ] Component changes follow MASTER_CONTRACT
- [ ] All tests pass (`npx playwright test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Server running on port 3000 for user review

---

## 📚 DOCUMENTATION STRUCTURE

### Essential Documents Preserved
- **Core Framework:** AI_FRAMEWORK_ERROR_PREVENTION.md, database-truth-sync-002.yaml
- **Active Contracts:** All files in contracts/active/
- **Component Docs:** MASTER_CONTRACT.md, README.md, claude.md files
- **Recent Handoffs:** 10 most recent handoff documents preserved
- **Gamification:** All gamification analysis docs (user requested)

### Archived Documentation
**Archive Date:** January 11, 2025  
**Location:** `archive/` directory  
**Contents:** ~280 files archived including legacy agent system, historical fixes, completed migrations

**Recovery:** Files can be restored from `archive/` directory if needed

---

## 🚀 QUICK START FOR CLAUDE SUB AGENTS

1. **Read this file completely**
2. **Read `AI_FRAMEWORK_ERROR_PREVENTION.md`**
3. **Read `contracts/active/database-truth-sync-002.yaml`**
4. **Find your specific contract in `contracts/active/`**
5. **Read component-specific MASTER_CONTRACT.md**
6. **Start dev server:** `npm run dev`
7. **Make changes following the contract**
8. **Validate:** `npm run lint && npm run typecheck && npm run build`
9. **Leave server running for user review**

---

**Remember:** This clean, focused documentation environment is optimized for Claude-to-Claude Sub Agent workflows. All legacy information has been archived to prevent confusion.