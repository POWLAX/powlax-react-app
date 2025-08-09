# AI Framework Error Prevention Guide

## For ChatGPT, Cursor, and Other AI Code Assistants

This guide documents common errors that occur when AI assistants work with the POWLAX codebase and provides preventive measures.

## 🚨 Critical Pre-Flight Checklist

Before ANY code changes:
1. **Run ESLint**: `npm run lint`
2. **Run Build**: `npm run build`
3. **Run Tests**: `npx playwright test`
4. **Check for console.log statements**
5. **Verify no secrets in code**

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

# Common framer-motion imports that cause issues:
import { motion, AnimatePresence } from 'framer-motion'
```

**Solution**: Replace with CSS animations using Tailwind classes
```typescript
// ❌ WRONG - framer-motion causing vendor chunk errors
import { motion, AnimatePresence } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
>
  Content
</motion.div>

// ✅ CORRECT - CSS animations with Tailwind
<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
  Content
</div>
```

**Prevention**: Use CSS animations instead of framer-motion to avoid vendor chunk issues

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
```

## Report Issues

If AI consistently makes certain errors:
1. Document the pattern
2. Add to this guide
3. Update CLAUDE.md if needed
4. Share with team

---

**Remember**: AI is a tool, not a replacement for understanding the code. Always review and test AI-generated changes thoroughly.