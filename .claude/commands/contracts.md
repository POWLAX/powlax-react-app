# Contract-Driven Development Workflow System
## Interactive Guide for Component and Page Changes

This enhanced command provides a complete interactive workflow for making changes to POWLAX components and pages using the contract system.

---

## 🎯 WORKFLOW ACTIVATION

When you express a desired change, Claude will:
1. **Analyze your request** against existing contracts
2. **Create a guided workflow** with checkboxes for you
3. **Generate a todo list** for Claude and sub-agents
4. **Track progress** through the entire change

---

## 📋 INTERACTIVE CHANGE WORKFLOW

### Step 1: Change Request Analysis
When you say "I want to [change something]", Claude will:

```markdown
## 📊 Change Analysis for: [Your Request]

**Affected Components:**
- [ ] Component: `PlayerDashboard` → Contract: `contracts/components/dashboards/component-playerdashboard-contract.yaml`
- [ ] Component: `PointCounter` → Contract: `contracts/components/skills-academy/component-pointcounter-contract.yaml`

**Affected Pages:**
- [ ] Page: `/dashboard` → Contract: `contracts/pages/core/page-dashboard-contract.yaml`

**Database Tables Involved:**
- [ ] `user_points_wallets` (1 record)
- [ ] `user_badges` (3 records)
- [ ] `points_transactions_powlax` (0 records - needs setup)

**Current State Summary:**
- PlayerDashboard: 100% mock data
- PointCounter: Ready but not persisting
- Database: Tables exist but not connected

**Proceed with change?** [Yes/No]
```

### Step 2: Workflow Generation
After confirmation, Claude generates:

```markdown
## 🚀 Development Workflow: [Change Title]

### YOUR TODO LIST:
- [ ] Review current component contract
- [ ] Approve enhancement notes
- [ ] Confirm database tables exist
- [ ] Test after implementation
- [ ] Approve contract updates

### CLAUDE'S TODO LIST:
- [ ] Analyze current contracts
- [ ] Create enhancement notes
- [ ] Deploy sub-agents if needed
- [ ] Implement changes
- [ ] Update contracts
- [ ] Run validation tests

### Timeline: [Estimated time]
```

### Step 3: Contract Enhancement
Claude adds enhancement notes:

```yaml
# Added to existing contract
enhancementRequest:
  id: "ER-2025-01-15-001"
  requestedBy: "User"
  analyzedBy: "Claude"
  
  changes:
    - component: "PlayerDashboard"
      from: "100% mock data"
      to: "Connected to user_points_wallets"
      priority: "CRITICAL - MVP Blocker"
      
  databaseRequirements:
    tables:
      - name: "user_points_wallets"
        operations: ["SELECT", "UPDATE"]
      - name: "user_badges"
        operations: ["SELECT"]
        
  acceptanceCriteria:
    - [ ] Mock data removed
    - [ ] Real points displayed
    - [ ] Loading states work
    - [ ] Error handling present
```

### Step 4: Implementation Guide
Claude provides step-by-step implementation:

```markdown
## 📝 Implementation Steps

### Step 1: Read Current State ✓
```bash
cat contracts/components/dashboards/component-playerdashboard-contract.yaml
```
**Finding:** 100% mock data, no database connection

### Step 2: Database Verification
```bash
# Claude will check these tables exist
- user_points_wallets ✓
- user_badges ✓
- points_transactions_powlax ⚠️ (empty)
```

### Step 3: Implementation
- [ ] Remove mock data from PlayerDashboard
- [ ] Add useSupabase hook
- [ ] Query user_points_wallets
- [ ] Add loading skeleton
- [ ] Add error boundary

### Step 4: Validation
- [ ] Run: `npm run lint`
- [ ] Run: `npm run typecheck`
- [ ] Run: `npm run build`
- [ ] Test in browser
```

### Step 5: Contract Update
After implementation:

```yaml
# Contract automatically updated
implementationHistory:
  - id: "ER-2025-01-15-001"
    completedAt: "2025-01-15T10:30:00Z"
    changes:
      - "Removed mock data"
      - "Connected to user_points_wallets"
      - "Added loading states"
    validation:
      - lintPassed: true
      - typecheckPassed: true
      - buildPassed: true
```

---

## 🏗️ MVP PLANNING WORKFLOW

### Express Your MVP Vision
When you say "I want to create an MVP with X pages", Claude will:

```markdown
## 🎯 MVP Configuration Analysis

### Current System Status:
- **Total Pages:** 40+
- **Total Components:** 122
- **Production Ready:** 75%

### Your MVP Requirements:
"I want 6-7 pages focused on [core features]"

### Recommended MVP Pages:
1. **Authentication** (Required)
   - `/auth/login` ✓ Ready
   - Contract: `contracts/pages/core/page-auth-login-contract.yaml`

2. **Dashboard** (Role-based)
   - `/dashboard` ⚠️ Needs work
   - Blocker: PlayerDashboard mock data
   - Contract: `contracts/pages/core/page-dashboard-contract.yaml`

3. **Practice Planner** ✓ Ready
   - `/teams/[teamId]/practiceplan`
   - 100% functional, no blockers
   - Contract: `contracts/pages/teams/page-team-practiceplan-contract.yaml`

4. **Skills Academy** ⚠️ Partial
   - `/skills-academy/workouts`
   - `/skills-academy/workout/[id]`
   - Blocker: Hub statistics hardcoded
   
5. **Team Management** ⚠️ Partial
   - `/teams/[teamId]/dashboard`
   - Blocker: ParentView mock data

6. **Resources** ✓ Ready
   - `/resources`
   - Fully functional

### Navigation Hiding Plan:
- [ ] Update `SidebarNavigation` component
- [ ] Update `BottomNavigation` component
- [ ] Comment out routes in navigation config
- [ ] Keep pages accessible via URL (not deleted)

### MVP Blockers to Fix:
1. [ ] PlayerDashboard - Connect to database
2. [ ] GlobalSearch - Wire to real content
3. [ ] RankDisplay - Use database ranks
4. [ ] Point persistence - Save to database

**Confirm MVP scope?** [Yes/No]
```

---

## 🔄 COMPONENT SELECTION WORKFLOW

When you say "I want to use component X on page Y":

```markdown
## 🧩 Component Integration Analysis

### Request: Add `PointCounter` to `TeamDashboard`

**Component Analysis:**
- Component: `PointCounter`
- Contract: `contracts/components/skills-academy/component-pointcounter-contract.yaml`
- Current Usage: Skills Academy workout page
- Database: Ready for points_transactions_powlax

**Target Page Analysis:**
- Page: `/teams/[teamId]/dashboard`
- Contract: `contracts/pages/teams/page-team-dashboard-contract.yaml`
- Current Components: 8 components
- Role-based views: Coach, Parent, Player

**Integration Plan:**
- [ ] Add to Player view only
- [ ] Pass teamId context
- [ ] Connect to team points leaderboard
- [ ] Add to component imports

**Dependency Check:**
- [ ] usePointTypes hook available ✓
- [ ] Gamification context available ✓
- [ ] Animation components available ✓

**Proceed?** [Yes/No]
```

---

## 🗄️ DATABASE VERIFICATION WORKFLOW

### Automatic Supabase Verification
For every change, Claude will:

```markdown
## 🔍 Database Verification

### Required Tables:
checking: user_points_wallets
```sql
-- Claude executes:
SELECT table_name, 
       (SELECT COUNT(*) FROM user_points_wallets) as record_count
FROM information_schema.tables 
WHERE table_name = 'user_points_wallets';
```
Result: ✓ Table exists, 1 record

checking: points_transactions_powlax
```sql
-- Claude executes:
SELECT COUNT(*) FROM points_transactions_powlax;
```
Result: ⚠️ Table exists, 0 records

### Schema Verification:
```sql
-- Get actual columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_points_wallets';
```

### Contract vs Reality:
- Contract says: 5 tables needed
- Database has: 4 tables ✓, 1 empty ⚠️
- Action: Seed points_transactions_powlax
```

---

## 📊 PROGRESS TRACKING

### Real-time Progress Dashboard
```markdown
## 🎯 Current Sprint Progress

### This Session:
**Change Request:** Fix PlayerDashboard
**Started:** 10:00 AM
**Estimated:** 2 hours

### Progress:
- [x] Contract analysis (10 min)
- [x] Enhancement notes added (5 min)
- [x] Database verified (5 min)
- [ ] Implementation (45 min) ← IN PROGRESS
- [ ] Testing (15 min)
- [ ] Contract update (10 min)

### Blockers Found:
- ⚠️ points_transactions_powlax empty
- Resolution: Create seed data first

### Sub-agent Status:
- Agent 1: Implementing PlayerDashboard ⏳
- Agent 2: Creating seed data ⏳
```

---

## 🤖 SUB-AGENT DEPLOYMENT PATTERN

When changes require multiple components:

```javascript
// Claude automatically generates:
const workflow = {
  mainTask: "Fix PlayerDashboard MVP Blocker",
  
  subTasks: [
    {
      agent: 1,
      task: "Remove mock data from PlayerDashboard",
      contract: "contracts/components/dashboards/component-playerdashboard-contract.yaml",
      enhancementNotes: "ER-2025-01-15-001"
    },
    {
      agent: 2,
      task: "Create point transaction seeder",
      target: "scripts/seed-points.ts",
      tables: ["points_transactions_powlax", "user_points_wallets"]
    },
    {
      agent: 3,
      task: "Update navigation to show only MVP pages",
      contracts: [
        "contracts/components/navigation/component-sidebar-contract.yaml",
        "contracts/components/navigation/component-bottomnav-contract.yaml"
      ]
    }
  ]
};

// Deploy all agents in parallel
deployAgents(workflow);
```

---

## 🎮 QUICK COMMANDS

### Check Component Status
```bash
# Find all mock data components
grep -l "mockDataUsage" contracts/components/**/*.yaml

# Find MVP blockers
grep -l "MVP Blocker" contracts/components/**/*.yaml

# Check database connections
grep "supabaseTables:" contracts/components/**/*.yaml | wc -l
```

### Verify Database
```bash
# Check if tables exist (via Claude MCP or script)
npx tsx scripts/check-actual-tables.ts

# Count records in key tables
npx tsx scripts/check-table-counts.ts
```

### Track Changes
```bash
# See all enhancement requests
grep -l "enhancementRequest" contracts/**/*.yaml

# View implementation history
grep -A5 "implementationHistory" contracts/**/*.yaml
```

---

## 📝 WORKFLOW CONFIGURATION

### Your Preferences (Set in CLAUDE.md)
```yaml
workflowPreferences:
  alwaysCreateTodos: true
  requireDatabaseCheck: true
  autoDeploySubAgents: false  # Ask first
  updateContractsAfter: true
  validateBeforeComplete: true
  
mvpConfiguration:
  targetPages: 7
  hiddenButNotDeleted: true
  prioritizeMVPBlockers: true
  
changeTracking:
  useEnhancementNotes: true  # vs new contracts
  keepHistory: true
  requireAcceptanceCriteria: true
```

---

## 🚀 ACTIVATION PHRASE

To activate this workflow, say:
- "I want to change [component/page]"
- "Help me fix [MVP blocker]"
- "Guide me through updating [feature]"
- "I want to build an MVP with [requirements]"

Claude will immediately start the interactive workflow!