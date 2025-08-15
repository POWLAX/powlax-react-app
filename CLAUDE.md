# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: POWLAX - Modern Lacrosse Training Platform

**Last Updated:** January 16, 2025  
**Branch:** Claude-to-Claude-Sub-Agent-Work-Flow  
**Database Truth:** contracts/active/database-truth-sync-002.yaml (62 actual tables)

---

## 🚨 CRITICAL: NO MOCK DATA POLICY - PRODUCTION READY MVP

**ABSOLUTELY NO HARDCODED MOCK DATA IN THE CODEBASE!**

### MANDATORY DATA INTEGRITY RULES:
- **NO CREATION OF MOCK USERS, TEAMS, OR CLUBS** - All deleted, causes false positives
- **NO HARDCODED DATA** - Nothing that represents a "real" user but isn't
- **NO FAKE EXTERNAL ASSOCIATIONS** - Creates false positives for testing
- **REAL DATA ONLY** - Use actual Supabase data, actual team data, actual connections

### IF DATA IS NEEDED FOR TESTING:
1. **USE (MOCK) PREFIX/SUFFIX** - Clearly mark test data: "(MOCK) Team Alpha", "Test User (MOCK)"
2. **ADD TO ACTUAL TABLES** - Insert mock data into Supabase with (MOCK) labels
3. **REQUEST REAL DATA** - Ask user to create actual test scenarios in Supabase
4. **NO FRONTEND HARDCODING** - Never return fake data from hooks or components

### WHY THIS MATTERS:
- **False positives kill production readiness** - Can't trust what's working
- **MVP requires real data flow** - Supabase → Frontend (self-contained system)
- **Debugging becomes impossible** - Can't distinguish real issues from mock data issues

### EXAMPLES:
```typescript
// ❌ NEVER DO THIS
const mockTeams = [
  { id: 1, name: "Team Alpha", club: "Club OS" },
  { id: 2, name: "Team HQ", club: "POWLAX" }
];

// ✅ CORRECT - Query real data or clearly marked mock data
const { data: teams } = await supabase
  .from('teams')
  .select('*'); // Returns real teams or "(MOCK) Team Name" entries
```

---

## 🚨 CRITICAL: Server Management Requirements

**MANDATORY FOR ALL WORK ON THIS BRANCH:**
- **ALWAYS run dev server on port 3002**: `npm run dev -- -p 3002`
- **Check if running first**: `lsof -ti:3002`
- **Start if not running**: `npm run dev -- -p 3002`
- **NEVER turn off server** - Leave running for user review
- **Server MUST be running on port 3002 when work is complete!**

**BRANCH-SPECIFIC PORT:** Claude-to-Claude-Sub-Agent-Work-Flow branch uses port 3002 to avoid conflicts with other development branches.

## 🔐 Environment Variables

Required in `.env.local`:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://avvpyjwytcmtoiyrbibb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Direct Connection (for scripts)
SUPABASE_DB_PASSWORD=your_db_password

# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@powlax.com

# !IMPORTANT - NO WORDPRESS INTEGRATION!
# MemberPress Webhook Only (for membership status sync)
# Self-contained payment system with Stripe/PayPal planned
```

## 🔧 CRITICAL: Build Error Prevention

### Framer Motion Module Resolution Issue
**Problem:** Next.js cannot find `./vendor-chunks/framer-motion.js` during builds/compilation
**Symptoms:** "Cannot find module './vendor-chunks/framer-motion.js'" error in browser/terminal

**MANDATORY FIX SEQUENCE BEFORE COMPLETING ANY WORK:**
```bash
# 1. Clear Next.js cache
rm -rf .next

# 2. Start new dev server (will auto-select available port)
npm run dev
```

**Full Reset (if needed):**
```bash
# Only if quick fix doesn't work
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**When to Run:** Execute this sequence if you see:
- Framer motion module errors
- Vendor chunks missing errors  
- Build compilation failures
- Page loading with "missing required error components"

**Integration:** ALL Claude agents must run this sequence before marking work complete to prevent user-facing build errors.

---

## 🚨 MANDATORY READS BEFORE ANY WORK

1. **`AI_FRAMEWORK_ERROR_PREVENTION.md`** - Critical error prevention for AI assistants
2. **`contracts/active/database-truth-sync-002.yaml`** - Database truth (62 actual tables)
3. **Component-specific MASTER_CONTRACT.md and claude.md files** for targeted work

---

## 🔌 SUPABASE MCP (Model Context Protocol) INTEGRATION

### Why Use Supabase MCP?
The `database-truth-sync-002.yaml` file becomes outdated quickly. The MCP provides Claude Code with:
- **Live database schema** - Real-time table structures, not outdated migration files
- **Actual table inspection** - See what tables really exist vs. what's documented
- **Direct SQL queries** - Test queries and verify data structures
- **No more sync issues** - Eliminates discrepancies between documentation and reality

### Setup Instructions
The Supabase MCP has been configured to connect directly to the POWLAX database:

```bash
# Already configured for this project:
claude mcp add supabase -- npx -y @bytebase/dbhub \
--dsn "postgresql://postgres:[PASSWORD]@db.avvpyjwytcmtoiyrbibb.supabase.co:5432/postgres?sslmode=require"
```

### Connection Details
- **Host:** db.avvpyjwytcmtoiyrbibb.supabase.co
- **Port:** 5432
- **Database:** postgres
- **SSL:** Required

### Using the MCP
Once configured, Claude Code can:
- Query table schemas: `SELECT * FROM information_schema.tables WHERE table_schema = 'public'`
- Inspect table structures: `\d table_name`
- Verify relationships and constraints
- Check actual data counts and samples

### Troubleshooting
If MCP connection fails:
1. **Restart Claude Code** - MCPs often need a restart to initialize
2. **Check credentials** - Ensure password is URL-encoded (# = %23)
3. **Fallback to scripts** - Use `npx tsx scripts/check-actual-tables.ts` if MCP unavailable

### Alternative MCP Servers
- **@bytebase/dbhub** - Universal database gateway (currently configured)
- **@crystaldba/postgres-mcp** - PostgreSQL-specific with performance analysis
- Custom Supabase MCP can be built using MCP SDK for RLS-aware queries

---

## 🏗️ HIGH-LEVEL ARCHITECTURE

### Tech Stack
- **Framework**: Next.js 14.2.5 (App Router)
- **UI**: React 18.3, Tailwind CSS, Shadcn/UI components, Framer Motion
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **State Management**: React Query (TanStack Query) for server state
- **Authentication**: Supabase Auth with magic links
- **Deployment Target**: Vercel (optimized for edge functions)
- **Testing**: Playwright for E2E tests (runs on port 3002)

### Key Architectural Patterns

#### 1. App Router Structure
```
src/app/
├── (authenticated)/     # Protected routes with auth layout
│   ├── dashboard/       # Role-based dashboards
│   ├── teams/[teamId]/  # Dynamic team routes
│   └── skills-academy/  # Skills training system
├── api/                 # API routes for server-side operations
└── page.tsx            # Public landing page
```

#### 2. Data Fetching Pattern
- **Client Components**: Use custom hooks with React Query
- **Server Components**: Direct Supabase queries with `supabase-server.ts`
- **Real-time**: Supabase subscriptions for live updates
- **Caching**: React Query with 5-minute stale time

#### 3. Component Organization
```
src/components/
├── ui/                  # Shadcn/UI base components
├── dashboards/          # Role-specific dashboard components
├── practice-planner/    # Practice planning system
├── skills-academy/      # Skills training components
└── teams/              # Team management components
```

#### 4. Authentication Flow
- Magic link authentication via Supabase
- Role-based access control (admin, coach, player, parent)
- Session management with SupabaseAuthContext
- Protected routes via middleware and layout guards

#### 5. Database Query Pattern
```typescript
// Client-side with React Query
const { data, error, isLoading } = useQuery({
  queryKey: ['drills', teamId],
  queryFn: () => supabase.from('powlax_drills').select('*')
})

// Server-side in Server Components
const supabase = createServerClient()
const { data } = await supabase.from('powlax_drills').select('*')
```

---

## 🗄️ DATABASE ARCHITECTURE (ACTUAL - HOLY BIBLE)

**Source:** `contracts/active/database-truth-sync-002.yaml`

### ✅ Active Tables with Data (61 Total)

#### Skills Academy Core (WORKING)
- **skills_academy_series** (49 records) - Workout series definitions
- **skills_academy_workouts** (166 records) - Workout definitions with `drill_ids` column
- **skills_academy_drills** (167 records) - PRIMARY drill library (position_drills is DUPLICATE)
- **skills_academy_user_progress** (5 records) - User progress tracking
- **wall_ball_drill_library** (48 records) - Wall ball workout video segments

**Key Relationship:** Use `drill_ids` column in workouts, NOT junction tables

#### Practice Planning (VERIFIED WORKING)
- **powlax_drills** (135 records) - Main POWLAX drill library (NOT `drills`)
- **powlax_strategies** (220 records) - Strategy library (NOT `strategies`)
- **practices** (34 records) - THE REAL practice plans table (NOT `practice_plans`)
- **practice_drills** (32 records) - Drill instances with notes and modifications
- **powlax_images** (4 records) - Drill media images
- **user_drills** (6 records) - User-created drills with team_share/club_share arrays
- **user_strategies** (4 records) - User-created strategies with team_share/club_share arrays

#### Team Management (WORKING)
- **clubs** (3 records) - Organization level above teams (NOT `organizations`)
- **teams** (14 records) - Team entities
- **team_members** (26 records) - Team membership

#### User Management (ACTIVE)
- **users** (14 records) - Main user table (NOT `user_profiles`!)

#### Gamification (PARTIALLY ACTIVE)
- **powlax_points_currencies** (7 records) - Point currency definitions
- **points_transactions_powlax** (0 records) - Point transaction history (NOT `points_ledger`)
- **user_points_wallets** (1 records) - User point balances
- **user_badges** (3 records) - Earned badges (NOT `badges`)
- **powlax_player_ranks** (10 records) - Player ranking definitions
- **point_types_powlax** (9 records) - Point currency types
- **leaderboard** (14 records) - Leaderboard rankings

### ⚠️ LEGACY TABLES (STILL HAVE DATA - DO NOT DELETE)
- **drill_game_states** (214 records) - Legacy drill-gamestate relationships
- **game_states** (6 records) - Game state definitions
- **practice_summary** (34 records) - Practice summaries

### ❌ DEPRECATED TABLES (DO NOT USE)
- **position_drills** (167 records) - DUPLICATE of skills_academy_drills

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

### ✅ VERIFIED WORKING PAGES (CONFIRMED TABLE INTEGRATIONS)
- `/practiceplan` & `/teams/[teamId]/practiceplan` - Practice planner using powlax_drills, user_drills, powlax_strategies, practices tables
- `/skills-academy/workouts` - Workout browser using skills_academy_series, skills_academy_workouts tables
- `/skills-academy/workout/[id]` - Full workout player using skills_academy_drills, wall_ball_drill_library, RPC functions

### 🔧 NEEDS WORK (See MASTER_CONTRACTs)
- `/dashboard` - Currently shows fake data with no links to real data
- `/skills-academy/workouts` - Enhancement needed per MASTER_CONTRACT
- `/teams/[teamId]/practice-plans` - Stability improvements needed

---

## 🤖 CLAUDE-TO-CLAUDE SUB AGENT WORKFLOW

**🚨 CRITICAL: ONLY USE GENERAL SUB AGENTS - NO SPECIALIZED CONTROLLERS!**

### **MANDATORY DEVELOPMENT APPROACH**
**ALWAYS use `general-purpose` sub-agents with specific, focused contracts. NEVER use specialized master controllers or complex agent systems that cause implementation errors.**

### Active Contracts
Use contracts in `contracts/active/` for all development work:
- `database-truth-sync-002.yaml` - Database truth
- Component-specific MASTER_CONTRACTs for targeted work
- Other active contracts for specific features

### **Sub Agent Deployment Pattern**
```bash
# ✅ CORRECT - Use general-purpose agents with focused contracts
Task(subagent_type="general-purpose", description="Implement feature component", prompt="...")

# ❌ WRONG - Never use specialized controllers
# powlax-master-controller, powlax-frontend-developer, etc.
```

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
npm run dev:mobile       # Start with mobile network access (0.0.0.0)
npm run build            # Build for production
npm run start            # Start production server
```

### Validation (REQUIRED before commit)
```bash
npm run lint             # Run ESLint checks
npm run typecheck        # Run TypeScript type checking
npm run build            # Ensure build succeeds
npm run build:verify     # Run all checks: lint (no warnings), typecheck, build
npx playwright test      # Run E2E tests (uses port 3002 for tests)
```

### Database Scripts
```bash
npx tsx scripts/check-actual-tables.ts      # Verify database tables
npx tsx scripts/check-supabase-connection.ts # Check database connection
npm run db:migrate       # Run Supabase migrations
npm run import:csv       # Import CSV data to Supabase
```

### AI Assistant Helper Commands
```bash
npm run ai:check         # AI error prevention check with guidance
npm run ai:validate      # Run lint and build validation
npm run ai:init          # Initialize AI assistant with project context
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

## 💡 COMMON DEVELOPMENT PATTERNS

### Creating New Hooks
```typescript
// src/hooks/useExample.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useExample(teamId: string) {
  return useQuery({
    queryKey: ['example', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('powlax_drills')  // ALWAYS use actual table names
        .select('*')
        .eq('team_id', teamId)
      
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

### Role-Based Dashboard Components
```typescript
// Always check user role before rendering
const role = user?.role || 'player'

switch(role) {
  case 'admin':
    return <AdminDashboard />
  case 'coach':
    return <CoachDashboard />
  case 'parent':
    return <ParentDashboard />
  default:
    return <PlayerDashboard />
}
```

### Testing Patterns
```typescript
// E2E tests run on port 3002
test('feature works', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.getByRole('heading')).toContainText('Dashboard')
})
```

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

## 🔍 PROJECT INDEXER SYSTEM

**🚨 NEW: Use PROJECT_INDEX.json for complete codebase overview without context overload!**

### **What is the Project Indexer?**
The PROJECT_INDEX.json file provides a high-level, abstracted overview of the entire POWLAX codebase. It allows Claude to understand the full project structure and dependencies without consuming the limited context window by reading every file.

### **How to Use the Indexer**
```bash
# Generate/update the complete index
npm run index:generate

# Start watch mode (auto-updates on file changes)
npm run index:watch

# Update index for specific file
npm run index:update path/to/file.tsx
```

### **When to Use the Indexer**
- **Before starting any work**: Run `/fresh` command and read PROJECT_INDEX.json
- **For complex refactoring**: Understand all dependencies and relationships
- **When adding new features**: See existing patterns and avoid duplication
- **For debugging**: Trace component relationships and data flow

### **Indexer Benefits**
- **No context overload**: Single file contains entire project overview
- **Prevents code duplication**: See existing components before creating new ones
- **Better architecture decisions**: Understand relationships between files
- **Faster development**: Know exactly where to make changes

### **Index Structure**
- `components`: All React components with props, hooks, and database tables used
- `api_routes`: API endpoints with methods, auth requirements, and database access
- `hooks`: Custom hooks with return values and database dependencies
- `pages`: Page components with routes and authentication requirements
- `database`: Critical table information and relationships
- `contracts`: Active contracts and master documentation

## 🚀 QUICK START FOR CLAUDE GENERAL SUB AGENTS

**🚨 MANDATORY: Only use `general-purpose` sub-agents with focused, specific tasks!**

### **Enhanced Sub Agent Workflow with Indexer**
1. **Read this file completely**
2. **Read `PROJECT_INDEX.json`** ← **NEW: Get complete codebase overview**
3. **Read `AI_FRAMEWORK_ERROR_PREVENTION.md`**
4. **Find your specific contract in `contracts/active/`**
5. **Read component-specific MASTER_CONTRACT.md if applicable**
6. **Start dev server:** `npm run dev -- -p 3002`
7. **Make changes following the contract EXACTLY**
8. **Update index if needed:** `npm run index:generate`
9. **Validate:** `npm run lint && npm run typecheck && npm run build`
10. **Leave server running for user review**

### **Contract Orchestration Integration**
The indexer now integrates with your Claude-to-Claude Sub Agent Workflow:

- **Contract Creation:** Uses PROJECT_INDEX.json to analyze requirements and create detailed component specifications
- **Sub-Agent Deployment:** Provides complete technical context including existing components, database tables, and relationships
- **Quality Gates:** Validates against project-specific requirements from the index
- **State Management:** Tracks component lifecycle from draft to completion
- **Database Validation:** Ensures correct table names and relationships

**Key Commands:**
```bash
npm run contract:status     # System status and component overview
npm run contract:create     # Generate contracts from requirements
npm run state:report       # Component quality and status tracking
```

### **Sub Agent Best Practices**
- ✅ **Focused Tasks**: One specific feature or component per agent
- ✅ **Contract-Driven**: Follow contracts exactly, no improvisation
- ✅ **Database Truth**: Always use actual table names from `database-truth-sync-002.yaml`
- ✅ **Server Maintenance**: Keep dev server running on port 3000
- ❌ **No Specialized Controllers**: Never use powlax-master-controller or similar
- ❌ **No Complex Workflows**: Avoid multi-agent orchestration systems

### **Deployment Command Pattern**
```javascript
// ✅ CORRECT - Simple, focused sub-agent deployment
Task({
  subagent_type: "general-purpose",
  description: "Implement feature modal",
  prompt: "Create modal component following project patterns..."
})

// ❌ NEVER USE - Specialized controller agents
// powlax-master-controller, powlax-frontend-developer, etc.
```

---

**Remember:** Simple, focused general-purpose sub-agents with specific contracts produce the best results. Complex agent systems cause implementation errors and confusion.