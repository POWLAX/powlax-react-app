# 🎯 **Practice Planner Master Enhancement Contract**

*Created: 2025-01-16 | Status: AWAITING AGENT NEGOTIATION*  
*Component Directory: `src/components/practice-planner/`*  
*Main Page: `src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx`*

---

## ⚠️ **MANDATORY AGENT INSTRUCTIONS**

### **🔴 CRITICAL: READ BEFORE ANY CHANGES**
1. **NO FEATURE REMOVAL** - Everything in MVP must be enhanced, not stripped
2. **DIRECT NEGOTIATION REQUIRED** - Propose specific changes, get user approval
3. **POWLAX_DRILLS TABLE FOCUS** - Primary data source for all drill operations
4. **MOBILE-FIRST APPROACH** - All changes must work perfectly on mobile devices

### **📋 CONTRACT NEGOTIATION PROCESS**
1. **ANALYZE** current state of ALL components thoroughly
2. **PROPOSE** specific enhancement plan for each feature  
3. **NEGOTIATE** with user until contract is exactly what they want
4. **IMPLEMENT** only user-approved changes
5. **SUB-AGENT COORDINATION** - Control multiple specialized agents for complex tasks
6. **TESTING VALIDATION** - All sub-agents must test with Playwright before reporting
7. **MANDATORY CHECKOUT** - Get explicit user approval before exiting Claude

---

## 🎯 **MVP SCOPE: ALL FEATURES INCLUDED**

### **✅ FEATURES TO ENHANCE (NOT REMOVE)**
```
✅ Practice Timeline (drag-drop drills) - ENHANCE with better UX
✅ Real Drill Library (from powlax_drills table) - CONNECT to database
✅ Save/Load Practice Plans - ENHANCE with better UI
✅ Mobile-First Design - OPTIMIZE for field usage
✅ Print functionality - MAKE FUNCTIONAL (PDF generation)
✅ Refresh button - MAKE FUNCTIONAL (data sync)
✅ Complex filtering system - CONNECT to real data
✅ Strategy modals - CONNECT to strategies table
✅ Video modals - MAKE FUNCTIONAL with real videos
✅ Lacrosse Lab modals - CONNECT to real lab URLs
✅ Custom drill creation - SAVE to user_drills table
✅ Custom strategy creation - SAVE to user_strategies table
✅ Parallel drill system - ENHANCE functionality
✅ Favorites system - PERSIST to database
✅ All existing modal functionality - ENHANCE with real data
```

**KEY PRINCIPLE**: Nothing gets removed - everything gets connected to real data and made functional.

---

## 🗄️ **DATA INTEGRATION REQUIREMENTS**

### **Primary Data Source: `powlax_drills` Table**
```sql
-- Expected schema (verify before implementing)
powlax_drills {
  id, name, duration, category, 
  video_url, drill_lab_url_1-5,
  strategies[], concepts[], skills[],
  coach_instructions, notes, equipment[]
}
```

### **Secondary Data Sources**
- **`powlax_strategies`** - listing a spot to select each strategy under each gamephase
- **`practice_plans`** - Saved practice sessions (already working)
- **`user_favorites`** - Persistent favorites system
- **`teams`** - Team-specific drill access

### **Current Problems to Fix**
- ❌ `useDrills` hook falls back to mock data
- ❌ Video URLs not connected to real videos
- ❌ Strategy connections are coded
- ❌ Lacrosse Lab URLs are broken/outdated - most likely the method of extracting from the json and putting into iframe - correct iframe output is - <iframe width="500" height="500" src="https://lacrosse.labradorsports.com/play?l=PP4bb1KQCS6MdOxWMe4B" style="max-width: 100%"></iframe> must remain square, but can be manipulated otherwise.
- ❌ Print button does nothing
- ❌ Refresh button does nothing
- ❌ Favorites don't persist

---

## 🛠️ **COMPONENT-BY-COMPONENT ENHANCEMENT PLAN**

### **🎛️ Core Components**

#### **DrillLibrary.tsx** - Priority: HIGH
**Current Issues:**
- Uses mock data from `useDrills` fallback - 
- Categories don't match real data
- Search/filter doesn't work with real database

**Enhancement Requirements:**
- Connect to `powlax_drills`and`user_drills` Supabase table - these are drills saved by the user, same structure as powlax drills
- Dynamic categories based on real data
- Functional search across all drill fields
- Working strategy/skill filters
- Persistent favorites system

#### **PracticeTimeline.tsx** - Priority: MEDIUM
**Current Status:** Working well
**Enhancement Requirements:**
- Better mobile drag-and-drop UX
- Improved time calculations display
- Better error handling for invalid drills

#### **DrillCard.tsx** - Priority: HIGH
**Current Issues:**
- Icon buttons don't connect to real data
- Video modal doesn't play real videos
- Strategy modal shows hardcoded data

**Enhancement Requirements:**
- Connect all icon buttons to real data
- Working video playback
- Real strategy connections
- Functional Lacrosse Lab links

### **🎭 Modal Components**

#### **VideoModal.tsx** - Priority: HIGH
**Current Issues:**
- Placeholder video player
- No connection to drill video URLs

**Enhancement Requirements:**
- Real video playback from video_url column of powlax_drills
- Fallback for missing videos
- Mobile-optimized video controls

#### **StrategiesModal.tsx** - Priority: HIGH
**Current Issues:**
- Hardcoded strategy data - data should come from powlax_strategies and user_strategies

**Enhancement Requirements:**
- Connect to `powlax_strategies` and `user_strategies` table

#### **LacrosseLabModal.tsx** - Priority: MEDIUM
**Current Issues:**
- Broken/outdated lab URLs
- No connection to drill lab fields

**Enhancement Requirements:**
- Connect to lab_urls fields on `powlax_drills'
- Update URLs to current Lacrosse Lab format
- Handle missing diagrams by eliminating the icon on that drill. No url = no displayed icon

#### **SavePracticeModal.tsx** - Status: ✅ WORKING
**No changes needed** - Already connects to Supabase properly

#### **LoadPracticeModal.tsx** - Status: ✅ WORKING  
**No changes needed** - Already connects to Supabase properly

### **📱 UI Components**

#### **PrintablePracticePlan.tsx** - Priority: HIGH
**Current Issues:**
- Print button doesn't work
- Basic layout needs enhancement

**Enhancement Requirements:**
- Functional print/PDF generation
- Professional practice plan layout
- Include team/coach information
- Mobile print optimization
- Optional display of added notes

#### **FilterDrillsModal.tsx** - Priority: MEDIUM
**Current Issues:**
- Filters don't connect to real data

**Enhancement Requirements:**
- Dynamic filter options from database
- Link to powlax_drills game_states column
- Persistent filter preferences

#### **AddCustomDrillModal.tsx** - Priority: MEDIUM
**Current Issues:**
- Doesn't save to database

**Enhancement Requirements:**
- Save custom drills to `user_drills` table
- Full drill property support
- Columns have been added to link to clubs and teams.

#### **AddCustomStrategiesModal.tsx** - Priority: MEDIUM - Must create .tsx new, follow same requirements of Custom Drill Creation but for strategies.  No current data - NO FALL BACK
**Current Issues:**
- No .tsx created yet

**Enhancement Requirements:**
- Save custom strategies to `user_strategies` table
- Full strategy property support

---

## 🎯 **SUCCESS CRITERIA**

### **Functional Requirements**
1. ✅ All drill data comes from `powlax_drills` and `user_drills` Supabase table
2. ✅ All modal buttons work with real data
3. ✅ Print button generates professional PDF
4. ✅ Refresh button syncs latest data
5. ✅ Video modals play actual drill videos
6. ✅ Favorites persist to database
7. ✅ Custom drills save to database

### **User Experience Requirements**
1. ✅ Mobile-first design maintained
2. ✅ Fast loading (< 2 seconds)
3. ✅ Intuitive drag-and-drop
4. ✅ Clear visual feedback
5. ✅ Graceful error handling
6. ✅ Works offline after initial load
7. ✅ Optomize UI for Text contrast and visibility

### **Code Quality Requirements**
1. ✅ Zero mock/fake data in production
2. ✅ All buttons functional or clearly disabled
3. ✅ Proper TypeScript interfaces
4. ✅ Error boundaries for modals
5. ✅ Consistent loading states

---

## 🤖 **AGENT NEGOTIATION TEMPLATE**

### **Phase 1: Analysis & Proposal**
```markdown
## Component Analysis Report
- Current State: [Detailed analysis of each component]
- Data Connections: [What works vs. what's broken]
- Enhancement Priorities: [High/Medium/Low for each component]

## Proposed Enhancement Plan
- Database Schema Requirements: [Any table changes needed]
- Component Modifications: [Specific changes per component]
- New Functionality: [What gets added]
- Risk Assessment: [Potential breaking changes]

## Implementation Timeline
- Phase 1: [Core data connections]
- Phase 2: [Modal enhancements] 
- Phase 3: [Advanced features]
```

### **Phase 2: User Negotiation**
- Present specific proposals for each component
- Get explicit approval for each enhancement
- Adjust based on user feedback
- Finalize implementation contract

### **Phase 3: Implementation**
- Execute only user-approved changes
- Test each component thoroughly
- Provide progress updates
- Document all changes made

---

## 📞 **READY FOR DEPLOYMENT**

### **Master Agent Deployment Command:**
```
"Deploy Master Practice Planner Enhancement Agent with full component analysis and contract negotiation"
```

### **Agent Success Metrics:**
- ✅ Comprehensive analysis of all 15+ components
- ✅ Specific enhancement proposal for each feature
- ✅ User approval for all changes before implementation
- ✅ Zero feature removal (only enhancement)
- ✅ Full connection to `powlax_drills` database table

**The agent must negotiate this contract directly with the user before making any code changes.**

---

## 🔒 **MANDATORY USER CHECKOUT PROTOCOL**

### **🚨 CRITICAL: NO EXIT WITHOUT APPROVAL**
The Master Agent **CANNOT EXIT CLAUDE** until the user explicitly approves completion.

### **Checkout Process Requirements:**
```markdown
## 📋 CONTRACT COMPLETION CHECKLIST

### **Implementation Status**
- [ ] All negotiated features implemented
- [ ] All sub-agent tasks completed and tested
- [ ] Playwright tests passing for all changes
- [ ] Mobile responsiveness verified
- [ ] Database connections working
- [ ] Error handling implemented

### **User Approval Required**
- [ ] User has tested the implementation
- [ ] User approves all changes made
- [ ] User confirms contract requirements met
- [ ] User grants permission to exit

### **Final Actions**
- [ ] Update component documentation
- [ ] Log all changes made
- [ ] Provide deployment instructions
- [ ] Archive completed contract
```

### **Exit Protocol:**
1. **Present Completion Summary** - Show all work completed
2. **Request User Testing** - Ask user to verify implementation
3. **Discuss Any Issues** - Address user concerns or modifications
4. **Get Explicit Approval** - "Do you approve contract completion and grant permission to exit?"
5. **Only Exit After "YES"** - Must receive explicit user approval

### **Multi-Agent Coordination Protocol:**
```markdown
## 🤖 SUB-AGENT MANAGEMENT

### **Sub-Agent Deployment:**
- Master Agent identifies complex tasks requiring specialization
- Deploys focused sub-agents for specific components
- Provides each sub-agent with specific contract requirements
- Monitors sub-agent progress and quality

### **Sub-Agent Testing Requirements:**
- All sub-agents must write Playwright tests for their changes
- Tests must pass before reporting completion to Master Agent
- Mobile responsiveness tests required for UI changes
- Database integration tests for data-related changes

### **Sub-Agent Reporting:**
- Sub-agents report completion with test results
- Master Agent validates sub-agent work before integration
- Master Agent coordinates between multiple sub-agents
- Master Agent presents unified results to user
```
