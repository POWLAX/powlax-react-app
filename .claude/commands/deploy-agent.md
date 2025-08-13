# Deploy Sub-Agent Command

Quick reference for deploying Claude-to-Claude sub-agents using contract-based development.

## Quick Deploy Template
```javascript
Task({
  subagent_type: "general-purpose",
  description: "[Brief 3-5 word task]",
  prompt: `
    You are a POWLAX development sub-agent. Your task is to [specific objective].
    
    MANDATORY READS:
    1. CLAUDE.md - Project context and rules
    2. AI_FRAMEWORK_ERROR_PREVENTION.md - Critical error prevention
    3. contracts/active/database-truth-sync-002.yaml - Database truth (61 tables)
    4. [Specific contract file] - Your implementation contract
    
    TASK: [Detailed task description]
    
    CONTRACT REQUIREMENTS:
    [Copy key requirements from contract]
    
    DATABASE TABLES TO USE:
    - [List actual tables from database-truth-sync-002.yaml]
    
    SUCCESS CRITERIA:
    - [ ] All database queries use actual table names
    - [ ] No mock data (use (MOCK) prefix if test data needed)
    - [ ] npm run lint passes
    - [ ] npm run typecheck passes
    - [ ] npm run build succeeds
    - [ ] Dev server running on port 3000
    
    DELIVERABLES:
    [List specific files/components to create/modify]
    
    DO NOT:
    - Create mock users, teams, or clubs
    - Reference non-existent tables
    - Use specialized controller agents
    - Turn off the dev server
  `
})
```

## Common Sub-Agent Tasks

### Skills Academy Enhancement
```javascript
Task({
  subagent_type: "general-purpose",
  description: "Enhance Skills Academy",
  prompt: `
    Follow src/components/skills-academy/MASTER_CONTRACT.md to enhance Skills Academy.
    
    Key tables: skills_academy_series, skills_academy_workouts, skills_academy_drills
    Use drill_ids column in workouts, NOT junction tables.
    
    [Add specific enhancement details]
  `
})
```

### Practice Planner Fix
```javascript
Task({
  subagent_type: "general-purpose",
  description: "Fix practice planner",
  prompt: `
    Follow src/components/practice-planner/MASTER_CONTRACT.md.
    
    Use these tables:
    - powlax_drills (NOT 'drills')
    - powlax_strategies (NOT 'strategies')  
    - practices (NOT 'practice_plans')
    - practice_drills
    
    [Add specific fix details]
  `
})
```

### Authentication Modal
```javascript
Task({
  subagent_type: "general-purpose",
  description: "Add auth modal",
  prompt: `
    Follow contracts/active/authentication-enhancement-system-001.yaml.
    
    Create modal login/signup flow using:
    - users table (NOT user_profiles)
    - magic_links for passwordless auth
    - Shadcn/UI Dialog component
    
    [Add implementation details]
  `
})
```

### Database Migration
```javascript
Task({
  subagent_type: "general-purpose",
  description: "Apply database migration",
  prompt: `
    Apply migration from supabase/migrations/[migration_file].sql.
    
    Steps:
    1. Check current table structure with scripts/check-actual-tables.ts
    2. Review migration SQL for conflicts
    3. Apply using PGPASSWORD=$SUPABASE_DB_PASSWORD psql command
    4. Verify with database-truth-sync-002.yaml
    
    [Add specific migration details]
  `
})
```

## Contract Locations Quick Reference

### Active Contracts
- `contracts/active/` - All active development contracts
- `contracts/active/database-truth-sync-002.yaml` - Database truth

### Component Contracts
- `src/components/skills-academy/MASTER_CONTRACT.md`
- `src/components/practice-planner/MASTER_CONTRACT.md`
- `src/components/teams/MASTER_CONTRACT.md`
- `src/components/gamification/MASTER_CONTRACT.md`

### Page Contracts
- `contracts/pages/` - Page-specific contracts
- `contracts/pages/admin/` - Admin page contracts
- `contracts/pages/skills-academy/` - Skills Academy pages
- `contracts/pages/teams/` - Team management pages

## Pre-Flight Checklist
Before deploying any sub-agent:

1. **Identify the contract** - Which contract governs this work?
2. **Check database tables** - What tables actually exist?
3. **Review component state** - What's currently working/broken?
4. **Define success criteria** - How will we verify completion?
5. **Plan validation** - What tests need to pass?

## Post-Deployment Verification
After sub-agent completes:

1. **Check dev server** - Is it running on port 3000?
2. **Run validation** - `npm run lint && npm run typecheck && npm run build`
3. **Test functionality** - Does the feature work as expected?
4. **Review database queries** - Are all tables correct?
5. **Check for mock data** - No hardcoded fake data?

## Common Pitfalls to Avoid
- ❌ Using `powlax-master-controller` or specialized agents
- ❌ Referencing tables that don't exist (drills, strategies, user_profiles)
- ❌ Creating mock data without (MOCK) prefix
- ❌ Turning off the dev server
- ❌ Skipping validation commands
- ❌ Ignoring contract requirements

## Emergency Recovery
If sub-agent fails or causes issues:

```bash
# Clear Next.js cache for build errors
rm -rf .next
npm run dev

# Full reset if needed
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run dev

# Check what's actually in database
npx tsx scripts/check-actual-tables.ts
```