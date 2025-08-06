# EXAMPLE: A4CC - Content Editor Enhancement Architect
## Contextual Instructions Based on Master Builder Guide

*This example demonstrates how to apply the A4CC Agent Builder Master Guide*

---

## AUTHORIZATION & SCOPE

**Target System**: POWLAX Admin Content Editor Enhancement  
**Authorization Level**: Frontend UI modifications and content filtering  
**Primary Focus**: Fix content editor filtering and improve admin interface  
**Scope Boundaries**: UI components, content filtering logic, admin interface improvements

---

## 🚨 CRITICAL ERROR PREVENTION
*[Contextualized based on agent scope: UI/Frontend + Content filtering]*

### **Import Verification (BREAKS ENTIRE APP)**
**BEFORE creating or modifying any file, verify these imports exist:**

✅ **Working Imports for This Project:**
- `import { useAuth } from '@/contexts/JWTAuthContext'` ← **Use this for auth**
- `import { supabase } from '@/lib/supabase'` ← **Use this for database**
- `import { Button } from '@/components/ui/button'` ← **Use this for UI**
- `import { Card, CardContent } from '@/components/ui/card'` ← **Use this for cards**

❌ **NEVER Import (These don't exist):**
- `import { useAuthContext } from '@/hooks/useAuthContext'` ← **This breaks everything!**
- `import { auth } from '@/lib/auth'` ← **This doesn't exist!**

### **Content Filtering Safety (Prevents UI Crashes)**
When working with content filtering, always use null safety:

```typescript
// ✅ SAFE - Won't crash if name is null
const filterStrategies = () => {
  return strategies.filter(strategy => 
    (strategy.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false) ||
    (strategy.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false)
  )
}

// ❌ DANGEROUS - Crashes if name is null  
const filterStrategies = () => {
  return strategies.filter(strategy => 
    strategy.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
}
```

### **useEffect Dependencies (Frontend Components)**
Only include external state in dependencies:

```typescript
// ✅ CORRECT
useEffect(() => {
  if (!authLoading && isAdmin) {
    fetchContent()
  }
}, [authLoading, isAdmin]) // Only external state

// ❌ CREATES INFINITE LOOP
useEffect(() => {
  setLoading(true)
  fetchContent()
}, [loading]) // Don't include state you modify!
```

### **After Making Changes**
1. **Check terminal for errors** - Look for `Module not found` messages
2. **If you see import errors** - Fix them immediately before continuing
3. **Restart if creating new files**: `rm -rf .next && npm run dev`
4. **Verify port**: Use the port shown in terminal output

---

## ASSESSMENT - Current State Analysis
*[Rest of standard A4CC content...]*

### Current Content Editor Issues
**File**: `src/app/(authenticated)/admin/content-editor/page.tsx`
- ✅ Basic structure exists
- ❌ Null safety issues in filter functions  
- ❌ Multiple useEffect conflicts causing loading issues

---

## ARCHITECTURE - Technical Design
*[Standard A4CC architecture section...]*

### Required Modifications
1. **Fix Filter Functions** - Add null safety to all content filtering
2. **Cleanup useEffect Logic** - Consolidate auth and loading logic  
3. **Improve Error Handling** - Add graceful fallbacks for missing data

---

## COORDINATION - Implementation Phases
*[Standard A4CC coordination section...]*

---

## 💡 **Why This Works Better**

### **Traditional Approach (Overwhelming):**
- 50+ warnings about every possible error
- Agent gets confused by irrelevant information
- Takes longer to find relevant guidance

### **Contextual Approach (Focused):**
- Only 3-4 warnings relevant to this agent's work
- Clear examples specific to content editor
- Faster implementation with fewer mistakes

### **What Was Excluded (Not Relevant Here):**
- Database RLS policies (not modifying)
- API creation patterns (not building APIs)
- Auth system modifications (using existing auth)
- Port configuration (handled in setup)

---

**Result**: Agent has exactly the information needed to succeed, without cognitive overload from irrelevant warnings.