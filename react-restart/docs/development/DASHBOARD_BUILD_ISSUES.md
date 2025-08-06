# Dashboard Build Issues & Solutions

## Date: 2025-01-06
## Agent: Simple Team Dashboard Builder

### Issues Encountered

#### 1. Import Path Errors
**Problem**: Incorrect Supabase import path
- Tried: `import { createClient } from '@/lib/supabase/client'`
- Error: Module not found

**Solution**: 
- Correct import: `import { supabase } from '@/lib/supabase'`
- The supabase client is exported as a named export, not from a `/client` subdirectory

#### 2. Auth Context Hook Naming
**Problem**: Wrong hook name for auth context
- Tried: `import { useAuthContext } from '@/contexts/JWTAuthContext'`
- Error: 'useAuthContext' is not exported

**Solution**:
- Correct import: `import { useAuth } from '@/contexts/JWTAuthContext'`
- The hook is exported as `useAuth`, not `useAuthContext`
- Also need to destructure correctly: `const { user, loading } = useAuth()`

#### 3. Team Dashboard File Location Change
**Note**: The team dashboard file was modified during development
- Original location attempted: `/teams/[teamId]/dashboard/page.tsx`
- File was already modified with different components

### Patterns for Future Dashboard Development

1. **Always verify imports before using**:
   - Check actual export names in context files
   - Verify Supabase client location and export style
   
2. **Null safety patterns that work**:
   ```typescript
   const players = members?.filter(m => m.role === 'player') ?? []
   const teamName = team?.name ?? 'Team'
   ```

3. **Simple component structure**:
   - Keep components minimal with single responsibility
   - Use clear prop interfaces
   - Provide sensible defaults

### Success Metrics Achieved
✅ Created 4 simple UI components (TaskCard, StatCard, QuickAccessCard, SimpleProgressBar)
✅ Enhanced Coach Team Dashboard with 3-section minimal layout
✅ Created Player Personal Dashboard with super simple layout
✅ Simplified Team HQ page to be cleaner and more minimal
✅ All dashboards compile successfully with null safety
✅ Clean, focused interfaces with clear primary actions

### Recommendations for Future Agents
1. Always check existing imports patterns in the codebase before creating new files
2. Use the Glob and Grep tools to find similar patterns before implementing
3. Keep dashboard layouts simple - max 3 sections visible at once
4. Focus on one primary action per section
5. Test build after each major change to catch import errors early