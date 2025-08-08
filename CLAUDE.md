# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
npx tsx scripts/database/check-all-tables.ts  # Verify database tables
npx tsx scripts/check-existing-tables.ts      # Check table existence
npx tsx scripts/verify-tables.ts              # Validate table structure
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

### 4. Vendor Chunk Errors ❌
```typescript
// ❌ WRONG - Client library in server component
import { Toaster } from 'sonner'

// ✅ CORRECT - Use client wrapper
'use client'
export function ToasterProvider() {
  return <Toaster position="top-right" />
}
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
- All main pages working (Dashboard, Teams, Academy, etc.)

### 🚧 In Progress
- Skills Academy workout runner
- Team management system
- Gamification points system
- WordPress data migration

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

# Verify Supabase connection
npx tsx scripts/database/check-all-tables.ts

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

## WordPress Migration Notes

- Legacy data in `/csv-exports/` directory
- Import scripts in `/scripts/` transform to Supabase schema
- Import WordPress groups: `npx tsx scripts/imports/wordpress-groups-analyze-and-import.ts`
- Maintain backward compatibility during transition

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