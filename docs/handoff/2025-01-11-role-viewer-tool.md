# Admin Role Viewer Tool - Quick Reference
**Date:** January 11, 2025  
**Feature:** View As Role Switcher

---

## What It Does
Allows admins to view the app as different user roles (Player, Coach, Parent, Director) without logging out.

## How to Use
1. **Log in as admin**
2. **Look for dropdown** in top-right corner (orange when active)
3. **Select a role** to view as that user type
4. **Exit anytime** with X button or Ctrl+Shift+R

## Files Created
```
src/contexts/RoleViewerContext.tsx       # State management
src/hooks/useViewAsAuth.ts              # Auth wrapper hook
src/components/admin/RoleViewerSelector.tsx  # UI component
```

## Integration Points
- Added `<RoleViewerProvider>` to `src/app/ClientProviders.tsx`
- Added `<RoleViewerSelector>` to `src/app/(authenticated)/layout.tsx`
- Dashboard uses `useViewAsAuth()` instead of `useAuth()`
- Navigation hides admin items when viewing as other roles

## Key Features
- **Non-destructive** - Doesn't change actual authentication
- **Visual indicators** - Orange border when active
- **Admin only** - Hidden for non-admin users
- **Session-based** - Clears on browser close

## Code Usage
```typescript
// Replace useAuth with useViewAsAuth in components
import { useViewAsAuth } from '@/hooks/useViewAsAuth'

const { user, loading } = useViewAsAuth()
// user.role will be the viewing role when active
```

## Security
- Only admins can see/use the tool
- Actual auth session unchanged
- Can only view as lower privilege roles
- API calls still use real credentials

---

**Note:** Tool is complete and working. Auth loading issues are separate and need fixing.