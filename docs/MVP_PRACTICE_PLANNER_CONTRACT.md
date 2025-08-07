# 🎯 **MVP Practice Planner Master Contract**

*Created: 2025-01-16 | Status: READY FOR AGENT DEPLOYMENT*  
*Target Location: `src/components/practice-planner/MASTER_CONTRACT.md`*

## 📋 **Executive Summary**

**Goal**: Strip the Practice Planner to its essential MVP functionality, connecting it to real Supabase data and removing all fake/mock elements that distract from core value.

**Current State**: Feature-rich but cluttered with mock data, non-functional buttons, and disconnected from real drill/strategy data.

**Target State**: Clean, focused practice builder that works with real drills and strategies, ready for standalone deployment.

---

## 🔍 **Current State Analysis**

### ✅ **What's Working (Keep These)**
1. **Core Timeline Interface**: `LazyPracticeTimeline` - drag-drop functionality
2. **Practice Info Header**: Date, time, duration, field selection
3. **Duration Progress Bar**: Visual feedback for practice timing
4. **Save/Load Functionality**: `SavePracticeModal` and `LoadPracticeModal` 
5. **Mobile Responsive Design**: Bottom sheet drill library, FAB button
6. **Practice Plan Persistence**: Supabase integration via `usePracticePlans`

### ❌ **What's Broken/Fake (Strip These)**
1. **Mock Drill Data**: `useDrills` hook falls back to hardcoded `mockDrills`
2. **Non-Functional Buttons**: Print, Refresh buttons do nothing
3. **No Strategy System**: No real strategies linked to plan
4. **Fake Categories**: "Admin", "Skill", "1v1", "Concept" don't match real data
5. **Missing Lacrosse Lab Integration**: Drill lab URLs not displaying properly
6. **Excessive Modal System**: 6+ modals for features not in MVP scope

---

## 🗄️ **Data Integration Audit**

### **Current Database Reality**
- ✅ **POWLAX Drills Data**: `powlax_drills` (167 items) **FULLY IMPORTED**
- ✅ **POWLAX Strategies**: - `powlax_strategies` (221 items) - **FULLY IMPORTED**
- ❌ **User Drills**: `user_drills` table is non existant must be created for saving user drills and favorites.
- ❌ **Team Drills**: `team_drills` table is non existant must be created for sharing to teams.
- ❌ **Club Drills**: `club_drills` table is non existant must be created for saving user drills and favorites.

### **What useDrills Hook Actually Does**
```typescript
// Current behavior in src/hooks/useDrills.ts
1. Tries to fetch from 'drills' table (fails) - wrong table.
2. Falls back to mockDrills array (25 hardcoded drills) - Get rid of this completely
3. Returns fake data: "2 Ball Reaction Drill", "Star Drill", etc.
```

### **Data Sources Available**
- ✅ **POWLAX Drills Data**: `powlax_drills` (167 items) **FULLY IMPORTED**
- ✅ **POWLAX Strategies**: - `powlax_strategies` (221 items) - **FULLY IMPORTED**

---

## 🎯 **MVP Scope Definition - EVERYTHING INCLUDED**

### **MVP Features - ALL REQUIRED**
```
✅ Practice Timeline (drag-drop drills)
✅ Real Drill Library (from powlax_drills Supabase table)
✅ Save/Load Practice Plans
✅ Mobile-First Design
✅ Basic Practice Info (date, time, duration)
✅ Print functionality
✅ Refresh button
✅ Complex filtering system
✅ Strategy modals
✅ Video modals
✅ Lacrosse Lab modals
✅ Custom drill creation
✅ Parallel drill system
✅ Favorites system
✅ All existing modal functionality
✅ All current UI components
```

**KEY CHANGE**: Nothing gets removed - everything gets **connected to real data** and **made functional**.

---

## 🛠️ **Surgical Cleanup Plan**

### **NEW APPROACH: MASTER AGENT CONTRACT NEGOTIATION**

**Step 1: Deploy Master Practice Planner Agent**
- Agent analyzes current state vs. your requirements
- Agent proposes specific implementation plan
- You negotiate directly with agent until contract is perfect

**Step 2: Contract Negotiation Topics**
```
🔍 Data Integration:
- Connect useDrills to powlax_drills and user_drills to Supabase table
- Ensure all drill properties (video, lab URLs, images) work
- Fix any missing database connections
- Build user_strategies supabase table for user strategies with all current powlax_drills columns + a column for the teams and clubs for the user to share to if they are connected.

🎨 UI/UX Functionality:
- Make Print button actually print practice plans with formatting.
- Make Refresh button reload/sync data
- Ensure all modals work with real data
- Fix modal text visibility with background and text color checks for contrast.

📱 Feature Completeness:
- All filtering options work with real data
- Favorites system persists to database for specific user
- Custom drill creation saves to user_drills for that specific user.
- Custom strategy creation saves to user_strategies for that specific user.
- Parallel drill system functions correctly

🔧 Integration Points:
- Lacrosse Lab URLs display properly
- Video modals play actual videos
- Most current features enhanced, only removal is the strategy to drill links.
```

**Step 3: Agent Executes Approved Contract**
- Master agent coordinates any needed sub-agents
- All changes based on your direct approval
- Nothing, other than the strategy to drill removed unless you explicitly agree

---

## 📐 **Success Criteria**

### **Functional Requirements**
1. ✅ Coach can browse powlax_drills from database
2. ✅ Coach can drag drills to timeline
3. ✅ Coach can save practice plan to Supabase
4. ✅ Coach can load their previous practice plans
5. ✅ Timeline shows accurate duration calculations
6. ✅ Add setup time and length can be edited.
7. ✅ Mobile interface works on phone

### **Code Quality Requirements**
1. ✅ Zero mock/fake data in production code
2. ✅ All buttons either work or are removed
3. ✅ Clean component structure (< 200 lines per component)
4. ✅ Real database queries (no hardcoded arrays)
5. ✅ Error handling for empty states

### **User Experience Requirements**
1. ✅ Fast loading (< 2 seconds)
2. ✅ Intuitive drill selection
3. ✅ Clear visual feedback
4. ✅ Works offline after initial load
5. ✅ No confusing/broken features

---

## 🤖 **Master Agent Instructions Template**

```markdown
# Practice Planner Master Enhancement Agent

## Primary Objective
Enhance ALL existing Practice Planner features and connect to real powlax_drills data.
ONLY the connections between strategies and drills gets removed - everything gets made functional.

## Files to Analyze & Enhance
1. src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx
2. src/components/practice-planner/DrillLibrary.tsx  
3. src/hooks/useDrills.ts
4. All modal components (VideoModal, LinksModal, StrategiesModal, etc.)

## Contract Negotiation Process
1. ANALYZE: Current state of all components and features
2. PROPOSE: Specific enhancement plan for each feature
3. NEGOTIATE: Get user approval for each enhancement
4. IMPLEMENT: Only execute user-approved changes

## Enhancement Areas (ALL REQUIRED)
1. CONNECT: useDrills to powlax_drills Supabase table
2. ENHANCE: Print button to generate PDF practice plans
3. ENHANCE: Refresh button to sync latest drill data
4. ENHANCE: All modals to work with real data
6. ENHANCE: Lacrosse Lab URL integration
7. ENHANCE: Video modal functionality
8. ENHANCE: Favorites persistence to database
9. ENHANCE: Custom drill creation workflow
9. BUILD: Strategies interface for every game phase (Face Off,Transition Offense,Transition Defense,Ride,Clear,Settled Offense,Settled Defense,Man Up,Man Down)

## Success Metrics
- All existing and added features functional with real data
- Zero mock/fake data in final code
- Enhanced user experience across all features
- Mobile-responsive and fast performance
``

---

## 📝 **Next Steps - REVISED PROCESS**

1. **Deploy Master Practice Planner Enhancement Agent**
2. **Agent Analyzes Current State** - Comprehensive audit of all features
3. **Agent Proposes Enhancement Contract** - Specific plan for each feature
4. **You Negotiate Contract Details** - Direct back-and-forth until perfect
5. **Agent Executes Approved Contract** - Only implements what you approve

## 🚀 **Ready to Deploy Master Agent?**

The Master Agent will:
- ✅ Analyze all current Practice Planner components
- ✅ Identify what's working vs. what needs real data connections  
- ✅ Propose specific enhancement plan for EVERY feature
- ✅ Negotiate with you until the contract is exactly what you want
- ✅ Focus on `powlax_drills` table and `powlax_strategies` as primary data sources
- ✅ Enhance everything, remove nothing (unless you specifically request)

**Say "Deploy Master Agent" and I'll create the specialized Practice Planner Enhancement Agent for direct contract negotiation.**
