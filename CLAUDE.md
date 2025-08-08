# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 Critical Error Prevention References

**MUST READ BEFORE ANY PAGE WORK:**
- [`docs/development/POWLAX_PAGE_ERROR_PREVENTION_GUIDE.md`](docs/development/POWLAX_PAGE_ERROR_PREVENTION_GUIDE.md) - **Prevents infinite loading spinners**
- [`AI_FRAMEWORK_ERROR_PREVENTION.md`](./AI_FRAMEWORK_ERROR_PREVENTION.md) - Common AI assistant pitfalls

**Quick Validation:** Always run `npm run lint && npm run typecheck` before and after changes.

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

### Testing
```bash
npx playwright test                           # Run all tests
npx playwright test tests/practice-planner   # Run specific test file
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
npx tsx scripts/database/check-all-tables.ts  # Verify database tables
npx tsx scripts/check-existing-tables.ts      # Check table existence
npx tsx scripts/verify-tables.ts              # Validate table structure
```

### Task Completion Notifications
```bash
# Notify on task completion (macOS/Linux)
./scripts/notify-completion.sh SUCCESS "powlax-agent" "Feature complete" 95 "CONTRACT-001"
```

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

### Loading State Management
```typescript
// Avoid infinite loading spinners
const [loading, setLoading] = useState(false) // Start false
const [data, setData] = useState(mockData)     // Use mock data initially

// Implement gradual data loading
useEffect(() => {
  // Start with mock data, then fetch real data
  fetchRealData().then(setData).finally(() => setLoading(false))
}, [])
```

## Database Architecture

### Core Tables (33 Total)
- **Practice Planning**: `drills`, `strategies`, `concepts`, `skills`, `practice_plans`
- **Skills Academy**: `academy_drills`, `workouts`, `powlax_wall_ball_*` tables
- **User Management**: `user_profiles`, `teams`, `team_members`
- **Gamification**: `points_ledger`, `badges`, `user_badges`
- **Assessments**: `quizzes`, `quiz_questions`, `quiz_responses`

### Taxonomy System
4-tier bidirectional relationship:
```
Drills ↔ Strategies ↔ Concepts ↔ Skills
```

### Wall Ball System (Working)
- `powlax_wall_ball_collections` - Workout collections
- `powlax_wall_ball_collection_drills` - Junction table
- `powlax_wall_ball_drill_library` - Individual drills

## Common Errors & Prevention

### 1. Infinite Loading Spinners ❌
```typescript
// ❌ WRONG - Blocks on auth
const { user, loading } = useAuth()
if (loading || !user) return <LoadingSpinner />

// ✅ CORRECT - Non-blocking
const [loading, setLoading] = useState(false)
return loading ? <LoadingSpinner /> : <Content />
```

### 2. Missing Imports ❌
```typescript
// ❌ WRONG - Trophy not imported
<Trophy className="w-5 h-5" />

// ✅ CORRECT - Import first
import { Trophy } from 'lucide-react'
```

### 3. Unescaped Quotes ❌
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
- Practice Planner core functionality
- Drill library with search and filtering
- Wall Ball workouts UI
- Mobile-responsive navigation
- Basic authentication flow

### 🚧 In Progress
- Skills Academy workout runner
- Team management system
- Gamification points system
- WordPress data migration

## Commit & Production Guidelines

### Required Before Every Commit
1. **Run validation**: `npm run lint && npm run build && npx playwright test`
2. **Fix all ESLint errors** - No errors should remain:
   - Missing imports (especially lucide-react icons like Trophy, Play, etc.)
   - Unescaped quotes in JSX (use `&apos;` for apostrophes, `&quot;` for quotes)
   - Missing hook dependencies in useEffect/useCallback
   - Type safety issues (never use `any` type)
3. **Check for console.log statements** - Remove from production code
4. **Verify no secrets** in code (API keys, tokens)
5. **Update documentation** if features changed
6. **Review [AI_FRAMEWORK_ERROR_PREVENTION.md](./AI_FRAMEWORK_ERROR_PREVENTION.md)** if using AI assistance

### Commit Message Format
```bash
type(scope): description

# Types: feat, fix, docs, style, refactor, test, chore
# Examples:
feat(practice-planner): add drill filtering by age band
fix(auth): resolve JWT token expiration handling
docs(api): update authentication endpoint documentation
```

### Branch Strategy
- Feature branches: `feature/description` or `fix/description`
- All commits to `main` must pass CI/CD
- Require pull request reviews for production

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

## Agent-Based Development

### Active Agents
- **powlax-master-controller** - Orchestrates all POWLAX development
- **powlax-backend-architect** - Database and API design
- **powlax-frontend-developer** - React/Next.js implementation
- **powlax-ux-researcher** - User experience validation
- **powlax-sprint-prioritizer** - Feature prioritization

### Agent Instructions Location
- `/claude-agents/` - POWLAX-specific agents
- `/docs/agent-instructions/` - Workflow protocols
- `/.bmad-core/agents/` - BMad methodology agents

## Quick Debug Commands

```bash
# Check if page loads
curl -s "http://localhost:3000/dashboard" | head -20

# Find loading spinners (indicates stuck state)
curl -s "http://localhost:3000/dashboard" | grep -i "loading"

# Verify Supabase connection
npx tsx scripts/database/check-all-tables.ts

# Check for TypeScript errors
npm run typecheck

# Find console.log statements
grep -r "console.log" src/ --exclude-dir=node_modules

# Check for secrets in code
grep -r "SUPABASE_SERVICE_ROLE_KEY" src/

# Audit dependencies
npm audit
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For scripts only
```

## WordPress Migration Notes

- Legacy data in `/csv-exports/` directory
- Import scripts in `/scripts/` transform to Supabase schema
- Import WordPress groups: `npx tsx scripts/imports/wordpress-groups-analyze-and-import.ts`
- Maintain backward compatibility during transition
- User accounts will sync with WordPress authentication

## Cursor & Copilot Integration

### Cursor Users
- Rules configured in `.cursorrules`
- Reference with `@AI_FRAMEWORK_ERROR_PREVENTION.md`
- Check existing files with `ls` before creating

### GitHub Copilot Users
- Instructions in `.github/copilot-instructions.md`
- Complete imports before writing JSX
- Always escape quotes in JSX strings