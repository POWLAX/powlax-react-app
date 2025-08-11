# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: Server Management Requirements

**MANDATORY FOR ALL WORK:**
- **ALWAYS run dev server on port 3000**: `npm run dev`
- **Check if running first**: `lsof -ti:3000`
- **Start if not running**: `npm run dev`
- **NEVER turn off server** - Leave running for user review
- **Reset during work if needed**, but **MUST be running after work**
- **Server accessible at http://localhost:3000** for user review

**⚠️ SERVER MUST BE RUNNING ON PORT 3000 WHEN WORK IS COMPLETE!**

## 🚨 Critical Error Prevention

**MUST READ BEFORE ANY WORK:**
- [`docs/development/PRACTICE_PLANNER_STABILITY_GUIDE.md`](docs/development/PRACTICE_PLANNER_STABILITY_GUIDE.md) - **⚠️ CRITICAL: Practice Planner stability rules**
- [`docs/development/POWLAX_PAGE_ERROR_PREVENTION_GUIDE.md`](docs/development/POWLAX_PAGE_ERROR_PREVENTION_GUIDE.md) - Prevents infinite loading spinners and page errors
- [`AI_FRAMEWORK_ERROR_PREVENTION.md`](./AI_FRAMEWORK_ERROR_PREVENTION.md) - Common AI assistant pitfalls

**Quick Validation:** `npm run lint && npm run typecheck`

**⚠️ PRACTICE PLANNER WARNING:** The Practice Planner will break if you add lazy loading, framer-motion, or remove 'use client' directives. See stability guide above.

## Commands

### Development
```bash
npm run dev              # Start Next.js development server on http://localhost:3000
npm run dev:mobile       # Start with mobile access (0.0.0.0)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint checks
npm run typecheck        # Run TypeScript type checking
npm run build:verify     # Full validation: lint + typecheck + build
```

### 🚨 CRITICAL: Server Management for Claude-to-Claude-Sub-Agent-Work-Flow Branch

**MANDATORY REQUIREMENTS:**
1. **ALWAYS run on port 3000**: `npm run dev` (default port)
2. **Check if server is running first**: `lsof -ti:3000`
3. **Start server if not running**: `npm run dev`
4. **NEVER turn off the server** - Leave it running for user review
5. **Reset during work if needed**, but **MUST be running after work**
6. **Server must be accessible at http://localhost:3000** for user to review

**Server Management Commands:**
```bash
# Check if server is running on 3000
lsof -ti:3000

# Start server on 3000 (if not running)
npm run dev

# Kill server on 3000 (only for reset during work)
kill $(lsof -ti:3000)

# Restart server on 3000 (after reset)
npm run dev
```

**⚠️ REMINDER: Server MUST be running on 3000 when work is complete for user review!**

### Testing
```bash
npx playwright test                           # Run all tests
npx playwright test tests/e2e/practice-planner   # Run specific test file
npx playwright test --ui                     # Run tests with UI mode
npx playwright test --debug                  # Debug tests interactively
npx playwright show-report                   # View test report

# Device-specific testing
npx playwright test --project=chromium      # Desktop Chrome
npx playwright test --project="Mobile Chrome"  # Mobile Chrome
npx playwright test --project=Tablet        # iPad Pro
```

### Pre-Commit Validation (REQUIRED)
```bash
npm run lint && npm run typecheck && npm run build && npx playwright test
```

### Database & Scripts
```bash
npm run db:migrate       # Run Supabase migrations
npm run import:csv       # Import CSV data to Supabase
npx tsx scripts/*.ts     # Run TypeScript scripts directly

# Common database scripts
npx tsx scripts/check-actual-tables.ts        # Verify ACTUAL database tables
npx tsx scripts/check-supabase-auth.ts        # Check auth integration
npx tsx scripts/check-wall-ball-tables.ts     # Validate Skills Academy tables
```

## 🤖 POWLAX Agent Usage Guidelines

**IMPORTANT: Claude should handle most tasks directly without specialized agents.**

### When to Use Specialized POWLAX Agents:
Only use specialized agents (`powlax-master-controller`, `powlax-frontend-developer`, etc.) when:
1. **Complex multi-system features** requiring coordination across UX, backend, and frontend
2. **Major architectural decisions** affecting the entire platform
3. **Large-scale refactoring** touching multiple subsystems
4. **User explicitly requests** agent assistance

### When NOT to Use Agents:
Claude should handle directly (without agents) when:
1. **Simple bug fixes** - Component errors, typos, small logic issues
2. **Single-file changes** - Adding/modifying individual components
3. **Database updates** - Table modifications, data corrections
4. **Documentation** - Creating or updating docs
5. **Straightforward features** - Single component or page additions
6. **Debugging** - Finding and fixing specific issues

### Decision Process:
Before using any specialized agent, Claude must evaluate:
- Can this be solved with direct implementation? ✅ Do it directly
- Is this a focused, single-concern task? ✅ Do it directly  
- Will agent coordination add unnecessary complexity? ✅ Do it directly
- Does this require specialized lacrosse domain expertise across multiple systems? ❓ Consider agents

**Default approach: Direct implementation by Claude**

## 🚀 Parallel Execution Strategy (Claude-to-Claude Multi-Agent)

### Overview
For large, multi-faceted tasks that can be parallelized, Claude can deploy multiple general-purpose agents to work simultaneously on different sections. This approach multiplies execution speed while maintaining full project context across all agents. These are NOT specialized agents - they are multiple instances of Claude working in parallel.

### When to Use Parallel Execution:
Use parallel general-purpose agents when:
1. **Task has 3+ independent sections** that can execute simultaneously
2. **Each section is substantial** (30+ minutes of work)
3. **Sections have clear boundaries** with minimal file overlap
4. **Time-critical delivery** requires faster completion
5. **Contract specifies** parallel execution approach

### When NOT to Use Parallel Execution:
Avoid parallel agents when:
1. **Sequential dependencies** exist between tasks
2. **File conflicts likely** (multiple agents editing same files)
3. **Task is simple** enough for single-threaded execution
4. **Coordination overhead** exceeds time savings

### Contract Requirements for Parallel Execution:
**ALL parallel execution MUST be specified in contract with:**

1. **Ultra Think Planning Phase** (MANDATORY):
   - Minimum 5 minutes of deep thinking
   - Evaluate all common errors from documentation
   - Identify file collision risks
   - Map clear agent boundaries

2. **Agent Distribution in Contract**:
   ```yaml
   executionStrategy:
     type: parallel  # or sequential (default)
     agentCount: 5
     ultraThinkCompleted: true  # REQUIRED
     
   parallelAgents:
     agent_1:
       type: general-purpose
       scope: "Page routing fixes"
       files: ["/app/skills-academy/workouts/page.tsx"]
       noTouch: ["database", "components"]
       
     agent_2:
       type: general-purpose
       scope: "Database migration"
       files: ["migrations/*.sql", "hooks/*.ts"]
       noTouch: ["pages", "navigation"]
   ```

3. **Progress Documentation**:
   - Each agent completion documented in contract
   - Timestamps for each phase
   - Blockers immediately reported
   - Integration status tracked

### Common Errors to Evaluate (Ultra Think):
Before launching parallel agents, MUST evaluate:
- **File collision risks** - Multiple agents editing same file
- **Import conflicts** - Duplicate or conflicting imports
- **State dependencies** - One agent needing another's output
- **Database conflicts** - Concurrent schema modifications
- **Git conflicts** - Merge conflicts from parallel commits
- **Type definition conflicts** - Multiple agents modifying types

### Testing Requirements:
- **Each agent** runs Playwright tests for their section
- **Claude** runs full Playwright suite after integration
- **No merge** until all tests pass
- **Document** any test failures in contract

### Best Practices:
1. **Clear boundaries** - Each agent gets exclusive file territories
2. **Atomic commits** - Each agent commits separately
3. **Error documentation** - Update common errors list
4. **Progress tracking** - Real-time updates in contract
5. **Final integration** - Claude reviews all outputs before merge

### Success Metrics:
- Time saved vs sequential execution
- Number of conflicts encountered
- Test pass rate after integration
- Zero regressions in existing functionality

**Remember:** Parallel execution is for BIG projects. Most tasks should still be handled directly by Claude without agents. The contract must specify if parallel execution is approved.

## Architecture Overview

This is a Next.js 14 App Router application for POWLAX, a comprehensive lacrosse training platform migrating from WordPress (BuddyBoss, LearnDash, GamiPress) to modern React/Supabase.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS
- **UI Components**: shadcn/ui (New York style), Radix UI, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: TanStack React Query v5
- **Testing**: Playwright for E2E tests (Desktop, Mobile, Tablet)
- **3D Graphics**: Three.js with React Three Fiber

### Key Directories
- `/src/app/(authenticated)/` - Protected routes with auth layout
- `/src/components/` - Domain-organized components:
  - `practice-planner/` - Practice planning UI components
  - `skills-academy/` - Wall ball and workout components
  - `ui/` - shadcn/ui base components
- `/src/lib/` - Core utilities:
  - `supabase.ts` - Client-side Supabase client
  - `supabase-server.ts` - Server-side Supabase with SSR
- `/src/hooks/` - Custom React hooks for data fetching and state
- `/src/types/` - TypeScript definitions matching Supabase schema
- `/scripts/` - Database and data transformation scripts
- `/docs/` - Comprehensive documentation:
  - `development/` - Development guides and standards
  - `agent-instructions/` - AI agent workflows
  - `data/` - Database schema documentation

## Critical Development Patterns

### Authentication Pattern (Server Components)
```typescript
// Use server-side auth in app directory pages
import { createServerClient } from '@/lib/supabase-server'

export default async function Page() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Don't block on auth - let page render
  return (
    <div>
      {user ? <AuthenticatedContent /> : <PublicContent />}
    </div>
  )
}
```

### Dynamic Routes Pattern
```typescript
// Always use client components for dynamic routes
'use client'
import { useParams } from 'next/navigation'

export default function WorkoutPage() {
  const params = useParams()
  const id = params?.id as string
  
  // Start with mock data, add real data later
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Workout {id}</h1>
      <p>Page is working!</p>
    </div>
  )
}
```

### Loading State Management
```typescript
// Avoid infinite loading spinners
const [loading, setLoading] = useState(false) // Start false
const [data, setData] = useState(mockData)     // Use mock data initially

// Implement gradual data loading
useEffect(() => {
  fetchRealData().then(setData).finally(() => setLoading(false))
}, [])
```

## Database Architecture (ACTUAL - HOLY BIBLE)

**🚨 CRITICAL: This is the definitive database schema. Reference /contracts/active/database-truth-sync-002.yaml for complete details.**

### ✅ Active Tables with Data (62 Tables Total)

#### **Skills Academy Core (WORKING)**
- **skills_academy_drills** (167 records) - Skills Academy drill library
- **skills_academy_series** (49 records) - Workout series definitions (includes Wall Ball series)
- **skills_academy_workouts** (166 records) - Workout definitions with `drill_ids` column linking to drills
- **skills_academy_user_progress** (3 records) - User progress tracking
- **wall_ball_drill_library** (48 records) - Bite-sized segments of wall ball workout videos

#### **Practice Planning (ACTIVE)**
- **powlax_drills** - Main POWLAX drill library (NOT `drills`)
- **powlax_strategies** - Strategy library (NOT `strategies`)
- **practices** - THE REAL practice plans table (NOT `practice_plans`)
- **practice_drills** - Drill instances with notes and modifications
- **powlax_images** - Drill media images
- **user_drills** - User-created drills
- **user_strategies** - User-created strategies

#### **Team Management (WORKING)**
- **clubs** (2 records) - Organization level above teams (NOT `organizations`)
- **teams** (10 records) - Team entities
- **team_members** (25 records) - Team membership

#### **User & Auth (ACTIVE)**
- **users** - Main user table (NOT `user_profiles`)
- **user_sessions** - Session management
- **user_auth_status** - User authentication state
- **magic_links** (10 records) - Magic link authentication
- **registration_links** (10 records) - Registration tokens
- **registration_sessions** - Registration process tracking

#### **Family Management (ACTIVE)**
- **family_accounts** (1 record) - Family account management
- **family_members** - Family member relationships
- **parent_child_relationships** - Parent-child user links

#### **Gamification (PARTIALLY ACTIVE)**
- **powlax_points_currencies** - Point currency definitions
- **points_transactions_powlax** - Point transaction history (NOT `points_ledger`)
- **powlax_player_ranks** - Player ranking definitions
- **user_badges** - Earned badges (NOT `badges`)
- **user_badge_progress_powlax** - Badge progress tracking
- **user_rank_progress_powlax** - Rank progression
- **user_points_wallets** - User point balances
- **point_types_powlax** - Point currency types
- **leaderboard** - Leaderboard rankings

### ⚠️ DEPRECATED/NOT IN USE (DO NOT REFERENCE)
- **drill_game_states** - Old WordPress backend connections (DEPRECATED)
- **position_drills** - Duplicate of skills_academy_drills (DO NOT USE)
- **powlax_academy_workout_collections** - NOT IN USE
- **workout_drill_mapping** - NOT IN USE (use skills_academy_workouts.drill_ids)
- **workout_drill_relationships** - NOT IN USE (use skills_academy_workouts.drill_ids)

### ❌ TABLES THAT DO NOT EXIST (NEVER REFERENCE THESE)
- **drills**, **strategies**, **concepts**, **skills** (use `powlax_` prefix versions)
- **practice_plans** (use `practices`)
- **practice_plan_drills** (use `practice_drills`)
- **powlax_wall_ball_collections** (wall ball is part of skills academy)
- **organizations** (use `clubs`)
- **badges** (use `user_badges`)
- **points_ledger** (use `points_transactions_powlax`)
- **user_profiles** (use `users`)
- **skills_academy_workout_drills** (use `drill_ids` column in workouts)
- **quizzes**, **quiz_questions**, **quiz_responses** (do not exist)

### 🔑 Key Relationships

#### Skills Academy Structure
```
skills_academy_series (49) 
    ↓
skills_academy_workouts (166) [contains drill_ids array]
    ↓
skills_academy_drills (167) [referenced by drill_ids]

wall_ball_drill_library (48) - Segments of wall ball workout videos
```

#### Practice Planning Structure
```
practices (main practice plans)
    ↓
practice_drills (instances with notes/modifications)
    ↓
powlax_drills / user_drills (drill definitions)
powlax_strategies / user_strategies (strategy definitions)
```

#### User Hierarchy
```
clubs (2)
    ↓
teams (10)
    ↓
team_members (25)
    ↓
users (main user table)
```

### 🚨 CRITICAL DATABASE WARNINGS

1. **NEVER** reference tables that don't exist
2. **ALWAYS** use `powlax_` prefix for content tables
3. **Wall Ball is part of Skills Academy**, not separate
4. **NO 4-tier taxonomy** exists (no concepts/skills tables)
5. **Use `drill_ids` column**, not junction tables
6. **`users` table**, not `user_profiles`
7. **`practices` table**, not `practice_plans`
8. **`clubs` table**, not `organizations`

## Common Errors & Prevention

### 1. Database Table Reference Errors ❌
```typescript
// ❌ WRONG - Non-existent tables
const { data } = useQuery('drills', () => supabase.from('drills').select('*'))
const { data } = useQuery('strategies', () => supabase.from('strategies').select('*'))

// ✅ CORRECT - Actual table names
const { data } = useQuery('powlax_drills', () => supabase.from('powlax_drills').select('*'))
const { data } = useQuery('powlax_strategies', () => supabase.from('powlax_strategies').select('*'))
```

### 2. Skills Academy Connection Errors ❌
```typescript
// ❌ WRONG - Looking for junction table
const { data } = useQuery('workout_drills', () => 
  supabase.from('skills_academy_workout_drills').select('*')
)

// ✅ CORRECT - Use drill_ids column
const { data } = useQuery('workout', () => 
  supabase.from('skills_academy_workouts').select('*, drill_ids')
)
```

### 3. Infinite Loading Spinners ❌
```typescript
// ❌ WRONG - Blocks on auth
const { user, loading } = useAuth()
if (loading || !user) return <LoadingSpinner />

// ✅ CORRECT - Non-blocking
const [loading, setLoading] = useState(false)
return loading ? <LoadingSpinner /> : <Content />
```

### 4. Missing Imports ❌
```typescript
// ❌ WRONG - Trophy not imported
<Trophy className="w-5 h-5" />

// ✅ CORRECT - Import first
import { Trophy } from 'lucide-react'
```

### 5. Unescaped Quotes ❌
```typescript
// ❌ WRONG
<p>doesn't work</p>

// ✅ CORRECT
<p>doesn&apos;t work</p>
```

## Component Patterns

### shadcn/ui Usage
```typescript
// Import from @/components/ui
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Use with POWLAX brand colors
<Button className="bg-powlax-blue hover:bg-powlax-blue/90">
  Practice Planner
</Button>
```

### POWLAX Brand Colors
```typescript
// Defined in tailwind.config.ts
powlax: {
  blue: '#003366',    // Primary brand color
  orange: '#FF6600',  // Accent color  
  gray: '#4A4A4A'     // Text color
}
```

## Key Features Status

### ✅ Completed
- Practice Planner core functionality using `practices` and `practice_drills` tables
- Skills Academy with 49 series, 166 workouts, 167 drills
- Wall Ball integrated into Skills Academy (48 drill segments)
- Mobile-responsive navigation
- Supabase Auth integration with `users`, `user_sessions`, and `magic_links`
- All main pages working (Dashboard, Teams, Academy, etc.)

### 🚧 In Progress  
- Connecting gamification system (`user_points_wallets`, `user_badges`)
- Team management using `clubs`, `teams`, `team_members`
- Family account system (`family_accounts`, `parent_child_relationships`)
- Practice planner integration with `powlax_drills` and `powlax_strategies`

## Commit & Production Guidelines

### Required Before Every Commit
1. **Run validation**: `npm run lint && npm run typecheck && npm run build`
2. **Fix all ESLint errors**:
   - Missing imports (especially lucide-react icons)
   - Unescaped quotes in JSX
   - Missing hook dependencies
   - Type safety issues (never use `any`)
3. **Remove console.log statements** from production code
4. **Verify no secrets** in code
5. **Run tests**: `npx playwright test`

### Commit Message Format
```bash
type(scope): description

# Types: feat, fix, docs, style, refactor, test, chore
# Examples:
feat(practice-planner): add drill filtering by age band
fix(auth): resolve JWT token expiration handling
```

## Testing Requirements

### Playwright E2E Tests
- Test on 3 devices: Desktop Chrome, Mobile (Pixel 5), Tablet (iPad Pro)
- Screenshots on failure in `/test-results/`
- Run before pushing: `npx playwright test`
- Test reports: `npx playwright show-report`

### Critical User Flows to Test
- [ ] Dashboard loads without infinite spinner
- [ ] Practice Planner allows drill selection
- [ ] Skills Academy shows workouts
- [ ] Navigation works on mobile and desktop
- [ ] Authentication doesn't block page rendering

## Development Workflow

### Adding New Pages
1. Create page with static content first
2. Add mock data for dynamic sections
3. Test page loads without auth blocking
4. Implement real data fetching
5. Add authentication last (non-blocking)

### Fixing Loading Issues
1. Check for `useRequireAuth()` blocking
2. Look for hanging Supabase queries
3. Replace with mock data temporarily
4. Verify page renders completely
5. Re-implement features incrementally

### Dynamic Route Pages
1. Always use `'use client'` directive
2. Use `useParams()` hook for route params
3. Start with minimal "Page is working!" message
4. Test routing immediately with curl
5. Clear `.next` cache if 500 errors persist

## Quick Debug Commands

```bash
# Check if page loads
curl -s "http://localhost:3000/dashboard" | head -20

# Find loading spinners (indicates stuck state)
curl -s "http://localhost:3000/dashboard" | grep -i "loading"

# Verify ACTUAL database tables
npx tsx scripts/check-actual-tables.ts

# Check Skills Academy connections
npx tsx scripts/check-wall-ball-tables.ts

# Verify gamification tables
npx tsx scripts/check-gamification-tables.ts

# Check for incorrect table references
grep -r "skills_academy_workout_drills\|drills_powlax\|practice_plans" src/

# Check for TypeScript errors
npm run typecheck

# Find console.log statements
grep -r "console.log" src/ --exclude-dir=node_modules

# Clear cache for 500 errors
rm -rf .next && npm run dev
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For scripts only
```

## Data Migration Notes

- Legacy data in `/docs/Wordpress CSV's/` directory
- Import scripts in `/scripts/` transform to Supabase schema  
- Skills Academy data successfully migrated to `skills_academy_*` tables
- Wall Ball data integrated as part of Skills Academy system
- Team data in `clubs` (2), `teams` (10), `team_members` (25)
- Auth system uses Supabase Auth with custom `users` table
- Gamification tables ready for point system activation

## Performance Benchmarks

All POWLAX pages meet excellent performance standards:
- ✅ All pages load under 1 second
- ✅ Average load time: 0.274s
- ✅ Mobile-first optimized
- ✅ 3G network friendly

## Cursor & Copilot Integration

### Cursor Users
- Rules configured in `.cursorrules`
- Reference with `@AI_FRAMEWORK_ERROR_PREVENTION.md`
- Check existing files with `ls` before creating

### GitHub Copilot Users
- Instructions in `.github/copilot-instructions.md`
- Complete imports before writing JSX
- Always escape quotes in JSX strings