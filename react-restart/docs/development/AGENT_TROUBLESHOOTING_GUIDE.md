# Agent Troubleshooting Guide
## Common Issues & Prevention Strategies

*Created: 2025-01-15*  
*Purpose: Document recurring issues and solutions to prevent agent-caused breakage*

**📋 For Agent Creators**: Use the [A4CC Agent Builder Master Guide](../agent-instructions/A4CC_AGENT_BUILDER_MASTER_GUIDE.md) to contextualize these patterns for specific agent types.

---

## 🚨 CRITICAL PATTERNS TO AVOID

### 1. **Bad Imports - BREAKS ENTIRE APP** ⚠️ MOST CRITICAL

❌ **DON'T DO:**
```typescript
import { useAuthContext } from '@/hooks/useAuthContext' // This doesn't exist!
```

✅ **DO THIS:**
```typescript
import { useAuth } from '@/contexts/JWTAuthContext' // Use existing auth context
```

**Root Cause**: One bad import in ANY page breaks the ENTIRE Next.js app with 500 errors on ALL routes.

**Critical Check**: Always verify imports exist before creating new pages!

### 2. **useEffect Dependencies & Infinite Loops**

❌ **DON'T DO:**
```typescript
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchData()
}, [loading]) // This creates infinite loop if fetchData sets loading
```

✅ **DO THIS:**
```typescript
useEffect(() => {
  if (!authLoading && currentUser && isAdmin) {
    fetchAllContent()
  }
}, [authLoading, currentUser, isAdmin]) // Only depend on external state
```

**Root Cause**: Including state that gets modified inside the useEffect creates infinite re-renders.

### 2. **Auth State Management Issues**

❌ **DON'T DO:**
```typescript
// Multiple confusing useEffects with different logic
useEffect(() => { /* auth logic */ }, [currentUser])
useEffect(() => { /* loading logic */ }, [loading])
useEffect(() => { /* initialization */ }, [])
```

✅ **DO THIS:**
```typescript
// Single, clear useEffect with proper dependencies
useEffect(() => {
  if (!authLoading) {
    if (process.env.NODE_ENV === 'development' || (currentUser && isAdmin)) {
      fetchAllContent()
    } else {
      setLoading(false)
    }
  }
}, [authLoading, currentUser, isAdmin])
```

**Root Cause**: Multiple useEffects with overlapping logic create race conditions and inconsistent state.

### 3. **Console.log in Render Functions**

❌ **DON'T DO:**
```typescript
function MyComponent() {
  console.log('Debug info') // This runs on every render!
  
  return <div>...</div>
}
```

✅ **DO THIS:**
```typescript
function MyComponent() {
  useEffect(() => {
    console.log('Debug info') // Only runs when dependencies change
  }, [dependency])
  
  return <div>...</div>
}
```

**Root Cause**: Console.log in render functions can cause performance issues and interfere with React's reconciliation.

### 4. **Null Safety in Filter Functions**

❌ **DON'T DO:**
```typescript
const filterItems = () => {
  return items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) // Crashes if name is null
  )
}
```

✅ **DO THIS:**
```typescript
const filterItems = () => {
  return items.filter(item => 
    (item.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false)
  )
}
```

**Root Cause**: Database fields can be null, but JavaScript string methods throw errors on null values.

---

## 🔧 SYSTEMATIC DEBUGGING APPROACH

### Step 1: Identify the Error Type

| Error Pattern | Root Cause | Solution |
|---------------|------------|----------|
| `Module not found: Can't resolve '@/...'` | **BAD IMPORT - BREAKS ALL PAGES** | Fix import path + restart server |
| `ReferenceError: [function] is not defined` | **BAD IMPORT - BREAKS ALL PAGES** | Import correct function + restart |
| `500 Internal Server Error` on ALL pages | **BAD IMPORT in any page** | Find bad import + fix + restart |
| `Cannot read properties of undefined` | Null safety issue | Add optional chaining (`?.`) |
| `Maximum update depth exceeded` | useEffect infinite loop | Check dependencies |
| `Hydration failed` | Server/client mismatch | Check conditional rendering |
| `404 for _next/static/chunks` | Build cache corrupted OR port mismatch | `rm -rf .next && npm run dev` + check correct port |
| `Port 3000 is in use, trying 3001 instead` | Port conflict | Access app on the new port (3001) |
| `custom element...already been defined` | Duplicate component registration | Check for multiple instances of same library |
| `ERR_ABORTED 404 (Not Found)` for static files | Wrong port or missing files | Verify correct localhost port |

### Step 2: Check Common Problem Areas

1. **useEffect Dependencies**
   ```bash
   # Search for problematic patterns
   grep -n "useEffect.*\[.*loading\]" src/app/**/*.tsx
   ```

2. **Auth State Usage**
   ```bash
   # Find auth-dependent logic
   grep -n "currentUser.*null" src/app/**/*.tsx
   ```

3. **Filter Functions**
   ```bash
   # Find potentially unsafe string operations
   grep -n "\.toLowerCase()" src/app/**/*.tsx
   ```

### Step 3: Apply Systematic Fixes

1. **Clean useEffect dependencies**
2. **Add null safety everywhere**
3. **Remove console.log from renders**
4. **Test in both dev and production modes**

---

## 📋 CHECKLIST FOR AGENTS

### Before Making Changes:
- [ ] **VERIFY ALL IMPORTS EXIST** - Check every `@/...` import path
- [ ] Read the entire file first to understand context
- [ ] Identify all useEffect hooks and their dependencies
- [ ] Check for existing null safety patterns
- [ ] Look for any console.log statements in render functions

### When Writing useEffect:
- [ ] Only include external state in dependencies
- [ ] Don't include state that's modified inside the effect
- [ ] Use cleanup functions for subscriptions/timers
- [ ] Test that the effect doesn't run infinitely

### When Writing Filter Functions:
- [ ] Always use optional chaining (`?.`)
- [ ] Provide fallback values (`?? false`)
- [ ] Test with null/undefined data
- [ ] Handle empty arrays gracefully

### After Making Changes:
- [ ] Run `npm run build` to check for build errors
- [ ] **Check terminal output for the actual port** Next.js started on
- [ ] **Access app on correct port** (don't assume it's 3000)
- [ ] Test in development mode
- [ ] Check console for errors/warnings
- [ ] Verify no infinite loops in useEffect
- [ ] Look for any "custom element already defined" errors
- [ ] Verify static files load correctly (no 404s)

---

## 🚫 SPECIFIC ISSUES ENCOUNTERED

### Issue #1: Content Editor TypeError
**Date**: 2025-01-15  
**Error**: `Cannot read properties of undefined (reading 'toLowerCase')`  
**Cause**: Strategy records had null `name` fields  
**Solution**: Added null safety with optional chaining

```typescript
// Before (broken)
strategy.name.toLowerCase().includes(searchTerm.toLowerCase())

// After (fixed)
(strategy.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false)
```

### Issue #2: useEffect Infinite Loop
**Date**: 2025-01-15  
**Error**: Maximum update depth exceeded  
**Cause**: Including `loading` state in useEffect dependencies when fetchData modifies loading  
**Solution**: Remove state that gets modified inside the effect from dependencies

### Issue #3: Next.js Chunk Loading Failures
**Date**: 2025-01-15  
**Error**: 404 errors for `_next/static/chunks`  
**Cause**: Corrupted build cache OR accessing wrong port  
**Solution**: `rm -rf .next && npm run dev` + check correct port in browser

### Issue #4: Port Mismatch Problems
**Date**: 2025-01-15  
**Error**: `Port 3000 is in use, trying 3001 instead` + 404 errors for static files  
**Cause**: App running on different port than expected  
**Solution**: 
1. Note the port Next.js actually starts on (check terminal output)
2. Access app on correct port (e.g., `localhost:3001` instead of `localhost:3000`)
3. Or stop other processes using port 3000: `lsof -ti:3000 | xargs kill -9`

### Issue #5: Custom Element Already Defined
**Date**: 2025-01-15  
**Error**: `A custom element with name 'mce-autosize-textarea' has already been defined`  
**Cause**: TinyMCE or other rich text editor loaded multiple times  
**Solution**: 
1. Check for duplicate imports of rich text libraries
2. Ensure components using TinyMCE have proper cleanup
3. Use React.StrictMode conditionally in development

### Issue #6: Bad Import Breaks Entire App ⚠️ CRITICAL
**Date**: 2025-01-15  
**Error**: `Module not found: Can't resolve '@/hooks/useAuthContext'` + 500 errors on ALL pages  
**Cause**: Agent created page with import that doesn't exist  
**Solution**: 
1. **Immediate**: Find the bad import in terminal error
2. **Fix**: Change to correct import path (e.g., `@/contexts/JWTAuthContext`)
3. **Restart**: `rm -rf .next && npm run dev`
4. **Prevention**: Always verify import paths exist before creating pages

**Example Fix**:
```typescript
// BAD (breaks everything)
import { useAuthContext } from '@/hooks/useAuthContext'

// GOOD (works)
import { useAuth } from '@/contexts/JWTAuthContext'
```

---

## 🎯 PREVENTION STRATEGIES

### 1. **Use TypeScript Strictly**
```typescript
// Always define proper interfaces
interface Strategy {
  id: string
  name?: string  // Mark optional fields as optional
  description?: string
  game_phase: string
}
```

### 2. **Implement Safe Filtering Pattern**
```typescript
// Create a reusable safe filter utility
const safeStringIncludes = (str?: string, searchTerm: string): boolean => {
  return str?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false
}

// Use in filters
const filterStrategies = () => {
  return strategies.filter(strategy => 
    safeStringIncludes(strategy.name, searchTerm) ||
    safeStringIncludes(strategy.description, searchTerm)
  )
}
```

### 3. **Standard useEffect Pattern**
```typescript
// Template for data-loading useEffect
useEffect(() => {
  if (!authLoading) {
    if (hasPermission) {
      fetchData()
    } else {
      setLoading(false)
    }
  }
}, [authLoading, hasPermission]) // Only external state
```

### 4. **Debug Without Breaking Renders**
```typescript
// Use useEffect for debugging, not render-time console.log
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Debug state:', { user, loading, isAdmin })
  }
}, [user, loading, isAdmin])
```

---

## 📚 REFERENCE PATTERNS

### Safe Auth Check
```typescript
const isAdmin = useMemo(() => 
  process.env.NODE_ENV === 'development' || 
  currentUser?.roles?.some(role => 
    ['administrator', 'admin', 'club_director', 'super_admin'].includes(role)
  ), 
  [currentUser]
)
```

### Safe Data Loading
```typescript
useEffect(() => {
  if (!authLoading && !loading) {
    if (isAdmin) {
      fetchAllContent()
    }
  }
}, [authLoading, loading, isAdmin])
```

### Safe String Filtering
```typescript
const matchesSearch = (item: any, fields: string[], searchTerm: string): boolean => {
  return fields.some(field => 
    item[field]?.toString()?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false
  )
}
```

---

## 🔥 EMERGENCY FIXES

### When App Shows 500 Errors on ALL Pages:
🚨 **FIRST CHECK: BAD IMPORTS** (Most likely cause)
1. **Look for terminal error**: `Module not found: Can't resolve '@/...'`
2. **Find the bad import** in the error message 
3. **Fix the import path** to use existing file/function
4. **Restart server**: `rm -rf .next && npm run dev`

### When App Won't Load:
1. **Check the terminal output** - Note what port Next.js actually started on
2. **Access correct port** - If terminal shows port 3001, go to `localhost:3001`
3. `rm -rf .next && npm run dev`
4. Check for console.log in render functions
5. Check for useEffect infinite loops
6. **VERIFY ALL IMPORTS ARE CORRECT** (check file paths exist)

### When Getting 404 Errors for Static Files:
1. **Verify port match** - Terminal port must match browser URL
2. **Kill conflicting processes**: `lsof -ti:3000 | xargs kill -9`
3. **Force port 3000**: `npm run dev -- --port 3000`
4. Clear build cache: `rm -rf .next`

### When Filters Crash:
1. Add null safety (`?.` and `?? false`)
2. Check database for null values
3. Test with empty data arrays

### When Auth Breaks:
1. Check useEffect dependencies
2. Verify auth context is properly provided
3. Test in both dev and production modes

### When Getting "Custom Element Already Defined":
1. **Check for duplicate rich text editors** (TinyMCE, etc.)
2. **Remove React.StrictMode temporarily** in development
3. **Check for multiple component instances** loading the same library
4. **Clear browser cache** and restart dev server

---

**Remember**: The goal is to write defensive code that handles edge cases gracefully rather than crashing the entire application. Always assume data might be null/undefined and handle it appropriately.