# POWLAX General Use Handoff Document

**Date:** January 11, 2025  
**Branch:** Claude-to-Claude-Sub-Agent-Work-Flow  
**Server Status:** Running on port 3000  
**Documentation Status:** Cleaned and archived (80% reduction)

---

## 🎯 Executive Summary

POWLAX is a comprehensive lacrosse coaching platform built with Next.js 14, React, and Supabase. After extensive documentation cleanup and archive work today, the project now has:
- **Clean documentation structure** with single source of truth
- **62 actual database tables** properly documented
- **Working application** with Skills Academy, Practice Planner, and Teams
- **Claude-to-Claude Sub Agent workflow** for development

### What Was Accomplished Today
1. **Archived 47+ legacy documents** into organized archive folders
2. **Removed entire legacy agent system** (old POWLAX Master Controller)
3. **Created streamlined CLAUDE.md** with accurate database references
4. **Fixed practice-plans page error** (vendor chunks issue)
5. **Created comprehensive navigation and components inventory**
6. **Updated page status** with current working/needs-work items

---

## 📊 Current Project State

### ✅ What's Working
- **Skills Academy** - 166 workouts, 167 drills, quiz-style interface (needs refinement)
- **Practice Planner** - Full interface at `/teams/[teamId]/practice-plans`
- **Navigation** - Desktop sidebar and mobile bottom nav
- **Demo Pages** - All `/demo/*` pages functional
- **Authentication** - Supabase Auth with magic links
- **Database** - 62 tables properly configured

### 🔧 What Needs Work
- **Dashboard** - Shows fake data with no real data connections
- **Gamification** - Tables exist but not connected to user actions
- **Team HQ** - Needs BuddyBoss integration
- **Practice Planner** - Stability improvements needed

### 🚫 What Doesn't Exist (Common Misconceptions)
- **No 4-tier taxonomy** - The drills→strategies→concepts→skills hierarchy never existed
- **No generic tables** - It's `powlax_drills` not `drills`, `practices` not `practice_plans`
- **No user_profiles** - Just `users` table
- **No organizations** - It's `clubs` at the top level

---

## 🗄️ Database Architecture (THE TRUTH)

**Source:** `contracts/active/database-truth-sync-002.yaml` (Holy Bible)

### Core Structure (62 Tables Total)

#### Skills Academy (WORKING - Has Data)
```
skills_academy_series (49) 
    ↓
skills_academy_workouts (166) [uses drill_ids column]
    ↓
skills_academy_drills (167)

wall_ball_drill_library (48) - Video segments, part of Skills Academy
```

#### Practice Planning (ACTIVE - Ready for Data)
```
practices (main practice plans)
    ↓
practice_drills (instances with modifications)
    ↓
powlax_drills / user_drills (drill definitions)
powlax_strategies / user_strategies (strategy definitions)
```

#### Team Hierarchy (WORKING - Has Data)
```
clubs (2)
    ↓
teams (10)
    ↓
team_members (25)
    ↓
users (main user table)
```

#### Key Naming Patterns
- **Content tables** use `powlax_` prefix: `powlax_drills`, `powlax_strategies`
- **User content** uses `user_` prefix: `user_drills`, `user_strategies`
- **Skills Academy** uses full prefix: `skills_academy_workouts`, `skills_academy_drills`
- **Relationships** use `drill_ids` column, NOT junction tables

---

## 🧭 Navigation Structure

### Desktop (≥768px)
**Main Nav:** Dashboard → Teams → Academy → Achievements → Resources → Community  
**Admin Nav:** Role Management → Drill Editor → WP Import → Sync Data

### Mobile (<768px)
**Bottom Nav:** Dashboard → Teams → Academy → Rewards → Resources  
**Special Mode:** Collapsible menu on Practice Planner and Workout pages

---

## 📁 Documentation Structure (Post-Archive)

### Essential Documents (~60 files preserved)
```
/
├── CLAUDE.md                          # Main context (updated today)
├── AI_FRAMEWORK_ERROR_PREVENTION.md   # Error prevention guide
├── contracts/
│   └── active/
│       ├── database-truth-sync-002.yaml  # Database truth (62 tables)
│       └── [15 other active contracts]
├── src/
│   └── components/
│       ├── skills-academy/
│       │   ├── MASTER_CONTRACT.md     # Skills Academy requirements
│       │   └── README.md              # Component guide
│       └── practice-planner/
│           ├── MASTER_CONTRACT.md     # Practice Planner requirements
│           └── README.md              # Component guide
└── docs/
    └── handoff/
        └── [10 most recent handoffs preserved]
```

### Archived Documents (~280 files)
```
archive/
├── legacy-agents/          # Old POWLAX Master Controller system
├── historical-fixes/       # Completed fixes (AUTH_*, VIDEO_*, etc.)
├── completed-migrations/   # GAMIPRESS migrations
├── outdated-database-docs/ # Superseded by database-truth-sync-002.yaml
├── resolved-issues/        # WALL_BALL plans
└── old-logs/              # Development logs
```

---

## 🧩 Component Library

### Shadcn/UI Components (19 total)
All standard UI components with POWLAX brand colors:
- **Colors:** Blue (#003366), Orange (#FF6600), Gray (#4A4A4A)
- **Style:** New York variant
- **Location:** `src/components/ui/`

### Domain Components
- **Practice Planner:** Timeline, drill selector, schedule
- **Skills Academy:** Workout cards, completion animations, progress
- **Teams:** Team cards, member lists, coach actions
- **Gamification:** Points, badges, leaderboards
- **Dashboard:** StatCard, TaskCard, widgets

---

## 🚀 Development Workflow

### Claude-to-Claude Sub Agent Pattern
Instead of one master controller, use parallel specialized agents:
1. Each component has its own MASTER_CONTRACT
2. Multiple agents can work simultaneously
3. Clear file boundaries prevent conflicts
4. Database truth in single YAML file

### Daily Development Flow
```bash
# 1. Start server (MUST be port 3000)
npm run dev

# 2. Make changes
# 3. Validate
npm run lint && npm run typecheck && npm run build

# 4. Leave server running for review
```

### Common Commands
```bash
# Server management
lsof -ti:3000              # Check if running
npm run dev                 # Start on port 3000

# Validation
npm run lint                # ESLint checks
npm run typecheck          # TypeScript validation
npm run build              # Production build test
npx playwright test        # E2E tests

# Cache issues
rm -rf .next               # Clear Next.js cache
```

---

## 🎯 Page Inventory

### Main Sections (50+ pages total)
- **Public:** Landing, auth flows, demos
- **Authenticated:** Dashboard, teams, academy, resources
- **Team-specific:** Practice plans, playbook, team HQ
- **Skills Academy:** Workouts, individual drills, progress, wall ball
- **Admin:** Role management, drill editor, sync tools
- **Demo:** Full demo versions of all features

### Current Status
- **Working:** Skills Academy, Practice Planner interface, all demos
- **Needs data:** Dashboard (shows fake data)
- **Needs refinement:** Quiz-style workout interface
- **Needs stability:** Practice Planner under heavy use

---

## ⚠️ Critical Warnings

### Database References
**NEVER use these (they don't exist):**
- `drills` → use `powlax_drills`
- `strategies` → use `powlax_strategies`
- `practice_plans` → use `practices`
- `user_profiles` → use `users`
- `organizations` → use `clubs`

### Common Pitfalls
1. **Wrong table names** - Always check database-truth-sync-002.yaml
2. **Junction tables** - Use `drill_ids` column instead
3. **4-tier taxonomy** - Doesn't exist, don't reference it
4. **Loading spinners** - Often caused by auth checks, use mock data
5. **Server port** - MUST be 3000, not 3001

---

## 📈 Metrics

### Documentation Cleanup Results
- **Before:** 350+ documents with conflicts
- **After:** ~60 essential documents
- **Reduction:** 80% less documentation noise
- **Benefit:** Single source of truth, no conflicts

### Database Reality
- **Actual tables:** 62
- **Tables with data:** ~20
- **Skills Academy content:** 166 workouts, 167 drills
- **Team structure:** 2 clubs, 10 teams, 25 members

### Component Inventory
- **UI components:** 19 Shadcn/UI
- **Custom components:** ~50 domain-specific
- **Pages:** 50+ routes
- **Reusability:** High for UI, medium for domain components

---

## 🔄 Next Steps & Priorities

### Immediate (This Week)
1. **Connect Dashboard to real data** - Replace mock data
2. **Stabilize Practice Planner** - Fix performance issues
3. **Refine quiz interface** - Polish Skills Academy workouts

### Short Term (Next 2 Weeks)
1. **Connect gamification** - Link points to user actions
2. **Team HQ integration** - Connect to BuddyBoss
3. **Complete test coverage** - Playwright tests for all pages

### Medium Term (Next Month)
1. **Production deployment** - Prepare for launch
2. **Performance optimization** - Code splitting, lazy loading
3. **Mobile app consideration** - PWA or native app decision

---

## 🤝 Handoff Notes

### For New Developers
1. **Start with CLAUDE.md** - It's your single source of truth
2. **Check database-truth-sync-002.yaml** - For any table questions
3. **Use existing patterns** - Don't create new ones
4. **Mock data first** - Get pages working before database
5. **Server on 3000** - Always, no exceptions

### For AI Agents
1. **Read AI_FRAMEWORK_ERROR_PREVENTION.md** first
2. **Use component MASTER_CONTRACTs** for specific work
3. **Never reference non-existent tables**
4. **Follow Claude-to-Claude Sub Agent workflow**
5. **Leave server running after work**

### For Project Managers
1. **Skills Academy is furthest along** - 166 workouts ready
2. **Practice Planner needs stability** - Core features work
3. **Dashboard needs data connections** - UI complete
4. **Gamification ready but disconnected** - Tables exist
5. **50+ pages built** - Most UI complete

---

## 📞 Contact & Resources

### Key Files
- **Main Context:** `/CLAUDE.md`
- **Database Truth:** `/contracts/active/database-truth-sync-002.yaml`
- **Error Prevention:** `/AI_FRAMEWORK_ERROR_PREVENTION.md`
- **Navigation/Components:** `/POWLAX_NAVIGATION_AND_COMPONENTS_INVENTORY.md`

### Recent Handoffs
- **Practice Planner:** `practice-planner-surgical-enhancements-final-handoff.md` (Jan 10)
- **Skills Academy:** `skills-academy-complete-handoff.md` (Aug 10)
- **This Document:** `docs/handoff/overview/GENERAL_USE_HANDOFF_JAN_2025.md`

### Archive Recovery
If you need any archived documents:
```bash
# List archive contents
ls -la archive/

# Restore specific file
cp archive/[category]/[filename] ./
```

---

## ✅ Summary

POWLAX is a working lacrosse coaching platform with:
- **Clean documentation** after 80% archive
- **Clear database structure** with 62 actual tables
- **Working features** in Skills Academy and Practice Planner
- **50+ pages** built and ready
- **Component library** with 19 UI + 50 custom components
- **Clear development workflow** using Claude-to-Claude Sub Agents

The main work remaining is connecting existing UI to real data, stabilizing the Practice Planner for production use, and activating the gamification system. The foundation is solid and well-documented.

---

## 🔐 **AUTHENTICATION SYSTEM UPDATE** *(January 11, 2025)*

### **Critical Authentication Findings**

#### **Current Role System Analysis**
- **Database**: Both `role` (string) and `roles` (TEXT[] array) columns exist
- **Mapping Issue**: Frontend maps database roles to application roles unnecessarily
- **Complexity**: Role mapping happens client-side creating confusion

**Database → Application Mapping (Currently):**
```
'admin' → 'administrator'
'director' → 'club_director'  
'coach' → 'team_coach'
'player' → 'player'
'parent' → 'parent'
```

#### **Magic Link System Status**
- ✅ **Fully Functional**: Magic link authentication working
- ✅ **Passwordless**: No passwords required - email-only login
- ✅ **WordPress Independence**: Can access all data without WordPress
- ❌ **User Experience**: Redirects instead of modal login

#### **WordPress Migration Path**
- **Existing Users**: Can migrate via magic links, preserving all role data
- **Role Assignment**: Roles transferred from WordPress data during migration
- **New Users**: Assigned roles via admin invitation system
- **Phase-out Complete**: WordPress sync can be fully disabled

#### **User Experience Issues Identified**
1. **Login Flow**: Full-page redirects disrupt user experience
2. **Role Confusion**: Dual role systems create unnecessary complexity  
3. **Auth Enforcement**: Currently disabled on authenticated routes

#### **Planned Improvements** *(Contract Pending)*
1. **Modal Login System**: Overlay login without page redirects
2. **Role Standardization**: Single consistent role naming system
3. **WordPress Data Migration**: Complete user/role data transfer
4. **Auth Enforcement**: Re-enable proper authentication protection

---

*Generated: January 11, 2025*  
*Updated: January 11, 2025 - Authentication Analysis*  
*Server: Running on port 3000*  
*Branch: Claude-to-Claude-Sub-Agent-Work-Flow*