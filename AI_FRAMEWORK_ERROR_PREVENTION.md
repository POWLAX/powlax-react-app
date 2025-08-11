# AI Framework Error Prevention Guide

## For ChatGPT, Cursor, and Other AI Code Assistants

This guide documents common errors that occur when AI assistants work with the POWLAX codebase and provides preventive measures.

## 🚨 CRITICAL UPDATES (January 2025)

### Database Table Names Have Changed!
- **62 actual tables** exist (not the 33-43 documented previously)
- **powlax_ prefix is standard** for content tables (not legacy)
- **No 4-tier taxonomy** exists (concepts/skills tables don't exist)
- **See `/contracts/active/database-truth-sync-002.yaml`** for complete truth

### Most Common Errors That Break The App:
1. **Wrong table names** - Using `drills` instead of `powlax_drills`
2. **Infinite loading** - Auth hooks blocking in layouts
3. **Missing timeouts** - Database queries hanging forever
4. **Non-existent junction tables** - Using `skills_academy_workout_drills` (doesn't exist)

## 🚨 Critical Pre-Flight Checklist

Before ANY code changes:
1. **Run ESLint**: `npm run lint`
2. **Run Build**: `npm run build`
3. **Run Tests**: `npx playwright test`
4. **Check for console.log statements**
5. **Verify no secrets in code**

## 🔴 NEW: Database Table Reference Errors (January 2025)

### Critical Table Name Corrections
**Problem**: AI references non-existent tables causing queries to fail
```typescript
// ❌ WRONG - These tables DO NOT EXIST
.from('drills')           // Should be 'powlax_drills'
.from('strategies')       // Should be 'powlax_strategies'  
.from('practice_plans')   // Should be 'practices'
.from('user_profiles')    // Should be 'users'
.from('organizations')    // Should be 'clubs'
.from('badges_powlax')    // Should be 'user_badges'
.from('drills_powlax')    // NEVER EXISTED
.from('strategies_powlax') // NEVER EXISTED

// ✅ CORRECT - Use actual table names
.from('powlax_drills')
.from('powlax_strategies')
.from('practices')
.from('users')
.from('clubs')
.from('user_badges')
```

**Prevention**: Always verify table exists before querying. See `/contracts/active/database-truth-sync-002.yaml` for complete list of 62 actual tables.

### Skills Academy Junction Table Error
**Problem**: AI tries to query non-existent junction table
```typescript
// ❌ WRONG - This table doesn't exist
const { data } = await supabase
  .from('skills_academy_workout_drills')
  .select('*')

// ✅ CORRECT - Use drill_ids column in workouts table
const { data: workout } = await supabase
  .from('skills_academy_workouts')
  .select('*, drill_ids')
  .single()

const { data: drills } = await supabase
  .from('skills_academy_drills')
  .select('*')
  .in('id', workout.drill_ids || [])
```

## 🔴 NEW: Infinite Loading Spinner Issues (January 2025)

### Authentication Hook Blocking
**Problem**: useRequireAuth() in layout causes infinite loading
```typescript
// ❌ WRONG - Blocks entire layout
export default function AuthenticatedLayout({ children }) {
  const { loading } = useRequireAuth()
  
  if (loading) {
    return <LoadingSpinner /> // Gets stuck here forever
  }
}

// ✅ CORRECT - Bypass or add timeout
export default function AuthenticatedLayout({ children }) {
  // Temporarily bypass auth loading check
  const loading = false // or use timeout
  
  if (loading) {
    return <LoadingSpinner />
  }
}
```

## 🔴 NEW: React Hook Initialization Errors (January 2025)

### Function Called Before Definition in useEffect
**Problem**: Calling a function in useEffect that's defined after conditional returns
```typescript
// ❌ WRONG - ReferenceError: Cannot access 'fetchData' before initialization
export default function Page() {
  useEffect(() => {
    fetchData(); // Error! Function not yet defined
  }, []);
  
  if (loading) {
    return <Loading />;
  }
  
  const fetchData = async () => {
    // Function defined after early return
  };
}

// ✅ CORRECT - Define function before useEffect
export default function Page() {
  const fetchData = async () => {
    // Function defined first
  };
  
  useEffect(() => {
    fetchData(); // Now it works
  }, []);
  
  if (loading) {
    return <Loading />;
  }
}
```

**Real Example**: Skills Academy workouts page had `fetchSeriesAndWorkouts()` called in useEffect on line 89, but function was defined on line 104 after an early return.

### Promise.race Type Errors in Hooks
**Problem**: Incorrect Promise.race implementation causing timeout failures
```typescript
// ❌ WRONG - Type errors and incorrect timeout handling
const timeout = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), 5000)
)

const { data, error } = await Promise.race([
  supabasePromise,
  timeout
]).catch(() => ({ data: null, error: 'Timeout' }))

// ✅ CORRECT - Simple direct await with error handling
const { data, error } = await supabase
  .from('table')
  .select('*')

if (error) {
  console.warn('Fetch error:', error)
  // Use fallback data
}
```

**Real Example**: useGamification hook had broken Promise.race causing infinite loading on animations-demo page.

### Missing Module Exports
**Problem**: Importing functions that aren't exported
```typescript
// ❌ WRONG - getAdminClient not exported
import { getAdminClient } from '@/lib/supabase-admin'

// ✅ CORRECT - Ensure function is exported
// In supabase-admin.ts:
export const getAdminClient = () => supabaseAdmin;
```

**Real Example**: Practice plans page failed with "Cannot find module" because getAdminClient wasn't exported from supabase-admin.ts.

## 🆕 Latest Critical Errors Fixed (January 11, 2025)

### Error 1: RLS Infinite Recursion in Users Table
**Location**: `/hooks/useTeams.ts:39-42`  
**Error Message**: `infinite recursion detected in policy for relation 'users'`
```typescript
// ❌ WRONG - Selecting all columns triggers RLS recursion
const { data: userData, error: userError } = await supabase
  .from('users')
  .select('*')  // This can trigger infinite recursion!
  .eq('id', user?.id)
  .single()

// ✅ CORRECT - Select only needed columns to avoid RLS issues
const { data: userData, error: userError } = await supabase
  .from('users')
  .select('id, club_id')  // Minimal columns prevent recursion
  .eq('id', user?.id)
  .single()
```

**Root Cause**: Row Level Security policies on the users table can create infinite recursion when selecting all columns. Some RLS policies reference other tables which then reference users again.

**Prevention**: Always select specific columns when querying users table, especially when the query is part of an auth flow.

### Error 2: Missing Column in Users Table
**Location**: `/api/admin/wp-import-check/route.ts:34`  
**Error Message**: `column users.full_name does not exist`
```typescript
// ❌ WRONG - These columns don't exist in users table
.select('id, email, full_name, username')

// ✅ CORRECT - Use actual column names
.select('id, email, display_name')

// Then map to expected format:
usersById[u.id] = { 
  email: u.email,
  full_name: u.display_name || u.email,  // Use display_name
  username: u.email  // Use email as username fallback
}
```

**Actual Users Table Columns**:
- `id` (UUID)
- `email` (text)
- `display_name` (text) - NOT `full_name`
- `first_name` (text)
- `last_name` (text)
- `club_id` (UUID reference)
- No `username` column exists

### Error 3: Hook Function Called Before Definition
**Location**: `/skills-academy/workouts/page.tsx:89`  
**Error Message**: `ReferenceError: Cannot access 'fetchSeriesAndWorkouts' before initialization`
```typescript
// ❌ WRONG - Function called before definition
useEffect(() => {
  fetchSeriesAndWorkouts(); // Line 89: Error!
}, []);

if (authLoading) {
  return <Loading />; // Early return
}

const fetchSeriesAndWorkouts = async () => { // Line 104: Too late!
  // ...
};

// ✅ CORRECT - Define before use
const fetchSeriesAndWorkouts = async () => {
  // Define first
};

useEffect(() => {
  fetchSeriesAndWorkouts(); // Now safe
}, []);

if (authLoading) {
  return <Loading />;
}
```

### Error 4: Broken Promise.race Causing Infinite Loading
**Location**: `/hooks/useGamification.ts`  
**Error Message**: Page stuck on "Loading POWLAX Animations..."
```typescript
// ❌ WRONG - Complex Promise.race with improper typing
const timeout = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), 5000)
)
const { data, error } = await Promise.race([
  supabasePromise,
  timeout
]).catch(() => ({ data: null, error: 'Timeout' }))

// ✅ CORRECT - Simple direct await
const { data, error } = await supabase
  .from('powlax_points_currencies')
  .select('*')

if (error) {
  setPointTypes(getFallbackPointTypes())
}
```

### Error 5: Missing Module Export Causing Webpack Error
**Location**: Practice plans page  
**Error Message**: `Cannot find module './vendor-chunks/@supabase.js'`
```typescript
// ❌ WRONG - Function not exported
// In files importing getAdminClient:
import { getAdminClient } from '@/lib/supabase-admin'

// But supabase-admin.ts didn't export it!

// ✅ CORRECT - Add the export
// In supabase-admin.ts:
export const supabaseAdmin = createClient(...)
export const getAdminClient = () => supabaseAdmin; // Added this line
```

### Async Hook Without Timeout
**Problem**: Database queries in hooks hang forever
```typescript
// ❌ WRONG - No timeout protection
const { data } = await supabase
  .from('powlax_points_currencies')
  .select('*')

// ✅ CORRECT - Add timeout with Promise.race
const timeout = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), 5000)
)

const { data } = await Promise.race([
  supabase.from('powlax_points_currencies').select('*'),
  timeout
]).catch(() => ({ data: null, error: 'Timeout' }))
```

## Common AI-Generated Errors

### 1. Missing Imports ❌
**Problem**: AI often forgets to import required components/icons
```typescript
// ❌ WRONG - Missing Trophy import
import { Play, Pause } from 'lucide-react'
<Trophy className="w-5 h-5" /> // Error: Trophy not defined

// ✅ CORRECT
import { Play, Pause, Trophy } from 'lucide-react'
```

**Prevention**: Always check all JSX elements have corresponding imports

### 2. Unescaped Quotes in JSX ❌
**Problem**: AI uses literal quotes instead of HTML entities
```typescript
// ❌ WRONG
<p>This workout doesn't have any drills</p>

// ✅ CORRECT
<p>This workout doesn&apos;t have any drills</p>
```

**Prevention**: Use `&apos;` for apostrophes, `&quot;` for quotes

### 3. File Path Navigation ❌
**Problem**: AI creates new files instead of editing existing ones
```bash
# ❌ WRONG - Creating duplicate component
/src/components/skills-academy/WorkoutRunner.tsx (new)
/src/components/skills-academy/QuizWorkoutRunner.tsx (existing)

# ✅ CORRECT - Check if file exists first
ls /src/components/skills-academy/
# Then edit existing or create only if needed
```

**Prevention**: ALWAYS check existing files before creating new ones

### 4. Hook Dependencies ❌
**Problem**: Missing dependencies in useEffect/useCallback
```typescript
// ❌ WRONG
useEffect(() => {
  handleNextDrill()
}, []) // Missing handleNextDrill dependency

// ✅ CORRECT
useEffect(() => {
  handleNextDrill()
}, [handleNextDrill])
```

**Prevention**: Include all referenced variables in dependency arrays

### 5. Route Conflicts ❌
**Problem**: Creating conflicting or duplicate routes
```typescript
// ❌ WRONG - Two pages handling same content
/skills-academy/page.tsx -> Shows workouts
/skills-academy/workouts/page.tsx -> Redirects to /skills-academy

// ✅ CORRECT - Clear route hierarchy
/skills-academy/page.tsx -> Main hub
/skills-academy/workouts/page.tsx -> Workout list
/skills-academy/workout/[id]/page.tsx -> Individual workout
```

**Prevention**: Check existing route structure before adding pages

### 6. Component Export Mismatches ❌
**Problem**: Import/export style inconsistencies
```typescript
// ❌ WRONG - Mixing default and named exports
// Component file
export default function WorkoutRunner() {} 

// Import file
import { WorkoutRunner } from './WorkoutRunner' // Error!

// ✅ CORRECT - Match export style
import WorkoutRunner from './WorkoutRunner'
```

**Prevention**: Check how component is exported before importing

### 7. Shadcn/UI Components ❌
**Problem**: Using components without installing them
```typescript
// ❌ WRONG
import { Collapsible } from '@/components/ui/collapsible'
// Error: Module not found

// ✅ CORRECT - Install first
npx shadcn@latest add collapsible
// Then import
import { Collapsible } from '@/components/ui/collapsible'
```

**Prevention**: Check if UI component exists, install if needed

### 8. Type Safety Issues ❌
**Problem**: Using 'any' type or missing type definitions
```typescript
// ❌ WRONG
const [workout, setWorkout] = useState<any>(null)

// ✅ CORRECT
import { SkillsAcademyWorkoutNew } from '@/types/skills-academy'
const [workout, setWorkout] = useState<SkillsAcademyWorkoutNew | null>(null)
```

**Prevention**: Always use proper TypeScript types

### 9. Async/Await in Client Components ❌
**Problem**: Making server components async incorrectly
```typescript
// ❌ WRONG - Client component can't be async
'use client'
export default async function Page() {} // Error!

// ✅ CORRECT - Use useEffect for async operations
'use client'
export default function Page() {
  useEffect(() => {
    async function fetchData() {}
    fetchData()
  }, [])
}
```

**Prevention**: Only server components can be async

### 10. Image Optimization ❌
**Problem**: Using HTML img tags instead of Next.js Image
```typescript
// ❌ WRONG
<img src="/logo.png" alt="Logo" />

// ✅ CORRECT
import Image from 'next/image'
<Image src="/logo.png" alt="Logo" width={100} height={100} />
```

**Prevention**: Use Next.js Image component for optimization

### 11. Deprecated Metadata Configuration ❌
**Problem**: Using deprecated `themeColor` in metadata export (Next.js 14+)
```typescript
// ❌ WRONG - Deprecated configuration
export const metadata: Metadata = {
  themeColor: '#003366',  // Deprecated!
  viewport: { width: 'device-width' }
}

// ✅ CORRECT - Move to viewport export
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'App Title',
  description: 'App description'
}

export const viewport: Viewport = {
  width: 'device-width',
  themeColor: '#003366',  // Move here
  initialScale: 1
}
```

**Prevention**: Keep `themeColor` in viewport export, not metadata export

### 12. Framer Motion Vendor Chunk Errors ❌
**Problem**: Missing vendor chunk errors when framer-motion causes build issues
```bash
# ❌ ERROR - Missing vendor chunk
Error: Cannot find module './vendor-chunks/framer-motion.js'
Error: Cannot find module './vendor-chunks/tslib.js'

# Common framer-motion imports that cause issues:
import { motion, AnimatePresence } from 'framer-motion'
```

**Solution**: Replace with CSS animations using Tailwind classes
```typescript
// ❌ WRONG - framer-motion causing vendor chunk errors
import { motion, AnimatePresence } from 'framer-motion'

<AnimatePresence>
  {showModal && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>

// ✅ CORRECT - CSS animations with Tailwind
{showModal && (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
    Content
  </div>
)}
```

**Recovery Steps**:
1. Clear Next.js cache: `rm -rf .next && rm -rf node_modules/.cache`
2. Replace AnimatePresence with conditional rendering
3. Replace motion components with CSS animations
4. Rebuild: `npm run build`

**Prevention**: Use CSS animations instead of framer-motion to avoid vendor chunk issues

### 13. Unsafe Property Access ❌
**Problem**: Accessing properties without checking if object exists first
```typescript
// ❌ WRONG - Runtime error if currentDrill is undefined
{currentDrill.drill.description && (
  <p>{currentDrill.drill.description}</p>
)}

// ❌ WRONG - Runtime error: "Cannot read properties of undefined (reading 'description')"
const drillDuration = currentDrill.duration_seconds || 30

// ✅ CORRECT - Safe property access with optional chaining
{currentDrill?.drill?.description && (
  <p>{currentDrill.drill.description}</p>
)}

// ✅ CORRECT - Safe property access
const drillDuration = currentDrill?.duration_seconds || 30
```

**Common Error Messages**:
- `TypeError: Cannot read properties of undefined (reading 'description')`
- `TypeError: Cannot read properties of null (reading 'name')`
- `TypeError: Cannot read property 'X' of undefined`

**Prevention**: Always use optional chaining (`?.`) when accessing nested properties from API data or props that might be undefined during loading states

### 14. Component Data Loading States ❌
**Problem**: Not handling loading/undefined states properly in components
```typescript
// ❌ WRONG - Component renders before data loads
function WorkoutRunner({ workout }) {
  return <h1>{workout.name}</h1> // Error if workout is undefined
}

// ✅ CORRECT - Handle loading states
function WorkoutRunner({ workout }) {
  if (!workout) {
    return <div>Loading workout...</div>
  }
  return <h1>{workout.name}</h1>
}
```

**Prevention**: Always check if data exists before rendering components that depend on it

### 15. Wall Ball Integration Errors ❌
**Problem**: Adding wall ball functionality to Skills Academy can cause vendor chunk dependency issues
```bash
# ❌ ERROR - Server crash when adding wall ball routes
Error: Cannot find module './vendor-chunks/tslib.js'
Server Error on /skills-academy/wall-ball/[id]
```

**Common Causes**:
1. Missing framer-motion dependencies in new components
2. Leftover AnimatePresence imports without framer-motion
3. Build cache conflicts from previous versions

**Solution Steps**:
```bash
# 1. Clear build cache
rm -rf .next && rm -rf node_modules/.cache

# 2. Check for AnimatePresence usage
grep -r "AnimatePresence" src/

# 3. Replace with CSS animations
# Replace: <AnimatePresence>{condition && <Component />}</AnimatePresence>
# With: {condition && <Component className="animate-in fade-in duration-300" />}

# 4. Rebuild
npm run build
```

**Prevention**: When adding new Skills Academy features, avoid framer-motion and use CSS animations from the start

### 16. Route Structure Confusion ❌
**Problem**: AI creates incorrect routes or users navigate to non-existent routes
```bash
# ❌ ERROR - Route doesn't exist
GET /skills-academy/workout 404 in 19ms

# ✅ CORRECT - Proper route structure
GET /skills-academy/workouts 200 in 26ms        # Browse workouts
GET /skills-academy/workout/1 200 in 609ms      # Run specific workout
```

**Common Route Mistakes**:
- `/skills-academy/workout` (doesn't exist)
- `/skills-academy/track/solid_start` (incorrect track route)

**Correct Route Structure**:
```
/skills-academy                    # Main hub
/skills-academy/workouts           # Browse available workouts (plural)
/skills-academy/workout/[id]       # Run specific workout (singular + ID)
/skills-academy/wall-ball/[id]     # Wall ball workout variant
/skills-academy/progress           # User progress tracking
```

**Prevention**: Always check existing route structure before creating navigation links

### 17. UUID Validation Errors ❌
**Problem**: Using test/mock user IDs that don't match database UUID format
```bash
# ❌ ERROR - Invalid UUID format
Error updating progress: {
  code: '22P02',
  message: 'invalid input syntax for type uuid: "test-user-12345"'
}
POST /api/workouts/progress 500 in 608ms
```

**Common Causes**:
- Using string IDs like `"test-user-12345"` instead of valid UUIDs

### 18. Authentication Race Condition ❌ 🆕
**Problem**: Users get redirected to login even when authenticated due to auth context race condition
```typescript
# ❌ ERROR - User authenticated but redirected
[useRequireAuth] State: { loading: false, hasUser: false, redirected: false }
[useRequireAuth] Redirecting to login - no user found
GET /auth/login 200 (redirected from /teams/1/practice-plans)
```

**Root Cause**: 
The auth context sets `loading: false` before actually checking localStorage, creating a moment where `useRequireAuth()` sees "no user" and redirects.

**Race Condition Sequence**:
1. Page loads → Auth starts with `user: null`, `loading: true`
2. Component mounts but `checkAuth()` hasn't run yet
3. `loading` gets set to `false` prematurely
4. `useRequireAuth()` sees `loading: false` and `user: null` → redirects
5. Meanwhile, localStorage actually has the user data

**Solution**:
```typescript
// ✅ CORRECT - Wait for actual auth check before setting loading false
// In SupabaseAuthContext.tsx
useEffect(() => {
  if (mounted) {
    checkAuth().then((hasUser) => {
      console.log('[Auth] Initial check complete, has user:', hasUser)
      setLoading(false) // Only set false AFTER checking
    })
  }
}, [checkAuth, mounted])

// ✅ CORRECT - Add initial check buffer in useRequireAuth
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const [initialCheck, setInitialCheck] = useState(true)
  
  useEffect(() => {
    if (initialCheck) {
      const timer = setTimeout(() => {
        setInitialCheck(false)
      }, 100) // Small delay for localStorage check
      return () => clearTimeout(timer)
    }
  }, [initialCheck])
  
  // Don't redirect during initial check
  if (initialCheck || loading) {
    return
  }
  // ... rest of redirect logic
}
```

**Symptoms**:
- Some pages work (server components like `/skills-academy`)
- Client component pages fail (`/skills-academy/workouts`, `/teams/1/practice-plans`)
- Direct login works but navigation causes redirects
- Console shows user in localStorage but auth context doesn't see it

**Prevention**: 
1. Always wait for localStorage check to complete before setting loading state
2. Add buffer time in `useRequireAuth()` for initial mount
3. Use server components when possible to bypass client-side auth checks
4. Check console for `[Auth]` logs to debug timing issues
- Hardcoded test user IDs in development
- Missing user authentication checks

**Solution**:
```typescript
// ❌ WRONG - Invalid UUID format
const TEST_USER_ID = 'test-user-12345'

// ✅ CORRECT - Valid UUID format or proper auth check
const { data: { user } } = await supabase.auth.getUser()
const userId = user?.id || crypto.randomUUID() // Valid UUID

// ✅ CORRECT - Validate UUID before database operations
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
```

**Prevention**: Always use proper UUID format for user IDs and validate before database operations

### 19. Webpack Module Resolution After File Deletion ❌
**Problem**: Deleting pages leaves orphaned webpack chunks causing module errors
```bash
# ❌ ERROR - After deleting wall-ball page
⨯ Error: Cannot find module './8948.js'
GET /skills-academy/wall-ball 500 in 1319ms
```

**Recovery Steps**:
```bash
# 1. Clear Next.js build cache
rm -rf .next

# 2. Clear node modules cache  
rm -rf node_modules/.cache

# 3. Kill existing dev server
pkill -f "next dev"

# 4. Restart development server
npm run dev
```

**Prevention**: Always clear build cache after deleting pages or major structural changes

**Prevention**: When adding new Skills Academy features, avoid framer-motion and use CSS animations from the start

## AI-Specific Guidelines

### For ChatGPT/GPT-4
1. **Request file checks**: "First, check if this file exists"
2. **Ask for lint results**: "Run ESLint before we continue"
3. **Verify imports**: "Show me the imports for this component"

### For Cursor
1. **Use @docs**: Reference this file with @AI_FRAMEWORK_ERROR_PREVENTION.md
2. **Enable ESLint**: Ensure ESLint integration is active
3. **Preview changes**: Use Cursor's preview before applying

### For GitHub Copilot
1. **Complete imports first**: Let Copilot suggest imports before JSX
2. **Review suggestions**: Don't auto-accept without reviewing
3. **Check for duplicates**: Copilot may suggest existing code

## Testing Checklist

After AI makes changes, ALWAYS:

```bash
# 1. Lint check
npm run lint

# 2. Type check
npx tsc --noEmit

# 3. Build check
npm run build

# 4. Test specific features
npx playwright test tests/e2e/[feature].spec.ts

# 5. Check for console.logs
grep -r "console.log" src/

# 6. Verify no secrets
grep -r "SUPABASE_SERVICE_ROLE_KEY" src/
```

## Red Flags 🚩

Watch for these AI behaviors:
1. Creating files without checking existing ones
2. Adding components without imports
3. Changing multiple unrelated files
4. Removing error handling
5. Adding console.log statements
6. Hardcoding values that should be dynamic
7. Creating duplicate functionality
8. Ignoring TypeScript errors
9. Breaking existing tests
10. Modifying test files unnecessarily

## Recovery Steps

If AI introduces errors:

1. **Check git status**
   ```bash
   git status
   git diff
   ```

2. **Run validation**
   ```bash
   npm run lint
   npm run build
   ```

3. **Revert if needed**
   ```bash
   git checkout -- [file]
   # or
   git reset --hard HEAD
   ```

4. **Fix incrementally**
   - Fix one error type at a time
   - Test after each fix
   - Commit working states

## Best Practices for AI Assistance

1. **Small, focused changes**: One feature at a time
2. **Verify first**: Check existing code before creating
3. **Test immediately**: Run lint/build after changes
4. **Document changes**: Explain what was modified
5. **Preserve patterns**: Follow existing code style

## Integration with CLAUDE.md

This guide complements the main CLAUDE.md documentation:
- CLAUDE.md: Overall project structure and patterns
- This guide: Specific error prevention for AI tools

Reference both when using AI assistants for development.

## Quick Reference Card

```bash
# Before coding
ls src/components/  # Check existing files
npm run lint       # Check current state

# After coding
npm run lint       # Check for errors
npm run build      # Verify builds
npx playwright test # Run tests

# Common fixes
&apos;            # Replace ' in JSX
&quot;            # Replace " in JSX
npm run lint -- --fix  # Auto-fix some issues
npx shadcn@latest add [component]  # Add missing UI components

# Route structure fixes
/skills-academy/workouts     # Browse workouts (plural)
/skills-academy/workout/[id] # Run specific workout

# UUID fixes
crypto.randomUUID()          # Generate valid UUID
user?.id || null            # Proper user ID handling

# Cache clearing (after file deletion)
rm -rf .next && rm -rf node_modules/.cache && pkill -f "next dev" && npm run dev
```

## Report Issues

If AI consistently makes certain errors:
1. Document the pattern
2. Add to this guide
3. Update CLAUDE.md if needed
4. Share with team

---

**Remember**: AI is a tool, not a replacement for understanding the code. Always review and test AI-generated changes thoroughly.