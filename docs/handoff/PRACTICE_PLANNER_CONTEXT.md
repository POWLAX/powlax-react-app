# Practice Planner Context Handoff

**Trigger Phrase**: "Practice Planner"  
**Last Updated**: January 8, 2025  
**Status**: STABLE ✅ (After major fixes)

---

## 🎯 Quick Context

The POWLAX Practice Planner is the core feature for coaches to plan lacrosse practices. It was previously the most fragile component, breaking whenever ANY file was edited. On January 8, 2025, it was completely stabilized by removing all complexity.

---

## 📍 Current State (January 8, 2025)

### What Works
- ✅ Practice Planner loads reliably at `/teams/[teamId]/practice-plans`
- ✅ Drill Library displays on the right sidebar (desktop) or modal (mobile)
- ✅ Timeline component allows drag-and-drop drill sequencing
- ✅ All modals and interactions function properly
- ✅ No more "Element type is invalid" errors
- ✅ No more infinite loading spinners

### Architecture Changes Made
1. **Removed ALL lazy loading** - Direct imports only
2. **Removed framer-motion completely** - CSS transitions only
3. **Fixed all components** - All have 'use client' directive
4. **Simplified imports** - No dynamic import chains

---

## 🚨 CRITICAL STABILITY RULES

**These rules MUST be followed or the Practice Planner will break completely:**

### ❌ ABSOLUTELY FORBIDDEN
1. **NO LAZY LOADING**
   ```typescript
   // ❌ NEVER DO THIS
   const Component = dynamic(() => import('./Component'))
   const Component = lazy(() => import('./Component'))
   ```

2. **NO FRAMER-MOTION**
   ```typescript
   // ❌ NEVER DO THIS
   import { motion, AnimatePresence } from 'framer-motion'
   ```

3. **NO REMOVING 'use client'**
   ```typescript
   // ✅ EVERY component must start with
   'use client'
   ```

4. **NO COMPLEX DYNAMIC IMPORTS**
   ```typescript
   // ❌ NEVER DO THIS
   import().then(module => ...)
   ```

5. **NO SERVER-SIDE RENDERING**
   - All Practice Planner components must be client-side

### ✅ REQUIRED PATTERNS
1. **Direct Imports Only**
   ```typescript
   import DrillLibrary from '@/components/practice-planner/DrillLibrary'
   import PracticeTimelineWithParallel from '@/components/practice-planner/PracticeTimelineWithParallel'
   ```

2. **CSS Transitions for Animations**
   ```typescript
   className="transition-all duration-200 hover:scale-105"
   ```

3. **Client Components Always**
   ```typescript
   'use client'
   // at the top of EVERY file
   ```

---

## 📁 Key Files & Locations

### Main Components
- **Page**: `/src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx`
- **Drill Library**: `/src/components/practice-planner/DrillLibrary.tsx`
- **Timeline**: `/src/components/practice-planner/PracticeTimelineWithParallel.tsx`
- **Drill Card**: `/src/components/practice-planner/DrillCard.tsx`

### Data & Hooks
- **Drills Hook**: `/src/hooks/useDrills.ts`
- **Practice Plans Hook**: `/src/hooks/usePracticePlans.ts`
- **Favorites Hook**: `/src/hooks/useFavorites.ts`

### Modals (All in `/src/components/practice-planner/modals/`)
- `SavePracticeModal.tsx`
- `LoadPracticeModal.tsx`
- `VideoModal.tsx`
- `StrategiesModal.tsx`
- `LacrosseLabModal.tsx`
- `AddCustomDrillModal.tsx`
- `FilterDrillsModal.tsx`

### Documentation
- **Stability Guide**: `/docs/development/PRACTICE_PLANNER_STABILITY_GUIDE.md` ⚠️ MUST READ
- **Local Context**: `/src/components/practice-planner/CLAUDE.md`
- **Contract**: `/src/components/practice-planner/MASTER_CONTRACT.md`

---

## 🔧 Current Implementation Details

### Component Hierarchy
```
PracticePlansPage
├── Header (with toolbar buttons)
├── Practice Info Section
├── Practice Schedule Form
├── PracticeDurationBar
├── Field Mode Quick Actions
├── PracticeTimelineWithParallel (main timeline)
├── DrillLibrary (sidebar/modal)
└── Various Modals
```

### Data Flow
1. **Drills** loaded via `useDrills()` hook from Supabase
2. **TimeSlots** managed in page state
3. **Drill Selection** via DrillLibrary `onAddDrill` callback
4. **Practice Saving** via `usePracticePlans()` hook

### Mobile Considerations
- Drill Library appears as bottom sheet modal on mobile
- Floating action button for adding drills
- Touch-optimized controls (44px+ targets)

---

## 🐛 Common Issues & Solutions

### Issue: Page Not Loading
**Solution**: Check for:
1. Dynamic imports (remove them)
2. Missing 'use client' directives
3. Framer-motion imports (remove them)

### Issue: "Element type is invalid" Error
**Cause**: Dynamic import or lazy loading
**Solution**: Convert to direct import

### Issue: Infinite Loading Spinner
**Cause**: Authentication hook blocking
**Solution**: Check `useRequireAuth()` usage

### Recovery Steps
```bash
# If Practice Planner breaks:
1. rm -rf .next
2. git checkout HEAD~1 src/components/practice-planner/
3. npm run dev
4. Check http://localhost:3000/teams/1/practice-plans
```

---

## 📋 Testing Checklist

After ANY modification:
```bash
# 1. Clear cache
rm -rf .next

# 2. Restart server
npm run dev

# 3. Test page loads
curl -I http://localhost:3000/teams/1/practice-plans
# Should return: HTTP/1.1 200 OK

# 4. Open in browser and verify:
- [ ] Page loads without spinner
- [ ] Drill Library visible
- [ ] Can add drills
- [ ] Timeline works
- [ ] No console errors
```

---

## 🎯 User Requirements

### Original Request (January 8, 2025)
"I want to refine the look, feel, and elements of the Practice Planner"

### Current Status
- Fixed stability issues first (completed)
- Ready for UI/UX refinements
- Awaiting specific design requirements

### Key Features Working
1. Practice scheduling with date/time/field
2. Drill library with search and filtering
3. Drag-and-drop timeline
4. Practice save/load functionality
5. Print practice plans
6. Mobile responsive design

---

## ⚡ Quick Start for New Session

When user mentions "Practice Planner":

1. **Acknowledge stability requirements**
   - Confirm understanding of NO lazy loading rule
   - Confirm understanding of NO framer-motion rule
   - Confirm all components need 'use client'

2. **Check current status**
   ```bash
   # Verify it's working
   curl -I http://localhost:3000/teams/1/practice-plans
   ```

3. **Review key files**
   - Read `/docs/development/PRACTICE_PLANNER_STABILITY_GUIDE.md`
   - Check recent changes in `/src/components/practice-planner/`

4. **Ask for specific requirements**
   - What UI/UX changes are needed?
   - Any new features to add?
   - Performance requirements?

---

## 🔴 Red Flags to Watch For

If you see ANY of these, STOP immediately:
- `dynamic(() => import(...))`
- `lazy(() => import(...))`
- `import('framer-motion')`
- Missing 'use client' at top of file
- Server-side data fetching in components
- Complex async patterns in components

---

## 📊 Performance Baseline

Current metrics (stable):
- **Initial Load**: ~3.3 seconds
- **Bundle Size**: 27.9 kB
- **Stability**: 100% (no crashes)
- **Mobile Performance**: Good
- **User Experience**: Functional

Trade-off: Stability > Performance optimizations

---

## 🚀 Next Steps

1. **UI Refinements** (pending user requirements)
   - Visual design improvements
   - Better mobile experience
   - Enhanced drag-and-drop

2. **Feature Additions** (if requested)
   - Parallel drills support
   - Advanced filtering
   - Team templates

3. **DO NOT**
   - Add performance optimizations
   - Implement code splitting
   - Add animation libraries

---

## 📝 Session Handoff Checklist

When starting work on Practice Planner:
- [ ] Read PRACTICE_PLANNER_STABILITY_GUIDE.md
- [ ] Verify page currently loads
- [ ] Review forbidden patterns
- [ ] Understand current architecture
- [ ] Ask user for specific requirements
- [ ] Test after EVERY change

---

**Remember**: The Practice Planner is stable. Keep it that way. Stability > Features > Performance.

**Contact**: If Practice Planner breaks, revert immediately and review stability guide.

---

*This document should be referenced whenever "Practice Planner" is mentioned in a new Claude session.*