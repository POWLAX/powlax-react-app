# 🏟️ **POWLAX Practice Planner Components**

*Component Directory: `src/components/practice-planner/`*  
*Page Location: `src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx`*

## 📋 **Quick Reference**

### **🎯 Master Agent Instructions**
> **CRITICAL**: Before making ANY changes, read `MASTER_CONTRACT.md` in this directory.
> All modifications must align with the user-approved enhancement contract.

### **📁 File Structure Overview**
```
practice-planner/
├── 📄 MASTER_CONTRACT.md           # ← USER-APPROVED ENHANCEMENT PLAN
├── 📄 claude.md                   # ← Current context file
├── 📄 README.md                   # ← This file (navigation guide)
│
├── 🎛️ CORE COMPONENTS/
│   ├── DrillLibrary.tsx           # Main drill browser & search
│   ├── PracticeTimeline.tsx       # Linear drill timeline
│   ├── PracticeTimelineWithParallel.tsx  # Advanced parallel timeline
│   └── DrillCard.tsx              # Individual drill display
│
├── 📱 UI COMPONENTS/
│   ├── PracticeDurationBar.tsx    # Progress bar for practice timing
│   ├── DrillSelectionAccordion.tsx # Categorized drill browsing
│   ├── AddCustomDrillModal.tsx    # Custom drill creation
│   ├── FilterDrillsModal.tsx      # Advanced drill filtering
│   ├── ParallelDrillPicker.tsx    # Multi-drill selection
│   ├── PracticeTemplateSelector.tsx # Pre-built practice templates
│   └── PrintablePracticePlan.tsx  # PDF-ready practice output
│
├── 🎭 MODALS/
│   ├── SavePracticeModal.tsx      # Practice plan persistence
│   ├── LoadPracticeModal.tsx      # Practice plan retrieval
│   ├── VideoModal.tsx             # Drill video playback
│   ├── StrategiesModal.tsx        # Strategy-drill connections
│   ├── LinksModal.tsx             # External resource links
│   └── LacrosseLabModal.tsx       # Lacrosse Lab diagram viewer
│
└── ⚡ LAZY LOADING/
    ├── LazyDrillLibrary.tsx       # Optimized drill library loading
    └── LazyPracticeTimeline.tsx   # Optimized timeline loading
```

---

## 🔗 **Component Relationships**

### **Data Flow**
```
team_drills (Supabase) 
    ↓
useDrills hook 
    ↓
DrillLibrary → PracticeTimeline → SavePracticeModal
    ↓              ↓                    ↓
DrillCard     TimeSlots           practice_plans (Supabase)
```

### **Modal Integration**
- **DrillCard** triggers → VideoModal, StrategiesModal, LinksModal, LacrosseLabModal
- **DrillLibrary** triggers → FilterDrillsModal, AddCustomDrillModal
- **Main Page** triggers → SavePracticeModal, LoadPracticeModal, PracticeTemplateSelector

---

## 🎯 **Current Enhancement Status**

| Component | Status | Data Source | Enhancement Needed |
|-----------|--------|-------------|-------------------|
| **DrillLibrary** | ⚠️ Mock Data | `mockDrills` array | Connect to `team_drills` table |
| **VideoModal** | ⚠️ Placeholder | Static URLs | Connect to real drill videos |
| **StrategiesModal** | ⚠️ Mock Data | Hardcoded strategies | Connect to `strategies` table |
| **LacrosseLabModal** | ⚠️ Broken Links | Old URLs | Update drill lab URL fields |
| **PrintablePracticePlan** | ⚠️ Basic | Simple layout | Enhance PDF generation |
| **SavePracticeModal** | ✅ Working | Supabase | No changes needed |
| **LoadPracticeModal** | ✅ Working | Supabase | No changes needed |
| **PracticeTimeline** | ✅ Working | Props-based | No changes needed |

---

## 🛠️ **Key Integration Points**

### **Database Tables**
- **Primary**: `team_drills` - Main drill library
- **Secondary**: `strategies` - Strategy-drill relationships  
- **Persistence**: `practice_plans` - Saved practice sessions
- **Users**: `teams`, `user_team_roles` - Access control

### **Hooks & Utilities**
- **`useDrills()`** - `src/hooks/useDrills.ts` - Main drill data fetching
- **`usePracticePlans()`** - `src/hooks/usePracticePlans.ts` - Practice persistence

### **External Dependencies**
- **Supabase** - Database operations
- **Framer Motion** - Drag-and-drop animations
- **Lucide React** - Icons throughout interface
- **Date-fns** - Time calculations and formatting

---

## ⚠️ **Critical Notes for Agents**

### **Before Making Changes**
1. ✅ **Read MASTER_CONTRACT.md** - User-approved enhancement plan
2. ✅ **Check Data Dependencies** - Verify table schemas match expectations
3. ✅ **Test Mobile First** - All changes must work on mobile devices
4. ✅ **Preserve Existing Functionality** - Enhance, don't break

### **Common Gotchas**
- **Drag-and-drop** can break on mobile if not handled carefully
- **Time calculations** must account for practice duration limits
- **Video loading** needs fallback for poor connectivity
- **Database queries** should handle empty results gracefully

### **Testing Requirements**
- Mobile responsiveness (375px minimum)
- Drag-and-drop functionality
- Data persistence (save/load)
- Video modal playback
- Print functionality

---

## 📞 **Quick Help**

### **Need to understand a component?**
1. Check the component's TypeScript interfaces
2. Look for related hooks in `src/hooks/`
3. Check database schema in migration files

### **Need to add new functionality?**
1. Read `MASTER_CONTRACT.md` first
2. Follow existing patterns in similar components
3. Add appropriate error handling
4. Test on mobile devices

### **Need to debug data issues?**
1. Check `useDrills.ts` for data fetching logic
2. Verify Supabase table schemas
3. Look for console errors in browser dev tools

---

**🎯 Remember: This is a coaching tool used on the field. Every change should make coaches' lives easier, not harder.**
