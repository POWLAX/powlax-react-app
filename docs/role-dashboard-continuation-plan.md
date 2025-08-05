# Role-Based Dashboard Implementation Plan

## 🎯 Current Status & Next Steps

### Completed Work
- ✅ WordPress Authentication Bridge with MemberPress
- ✅ User role detection (Coach/Player/Parent/Director)
- ✅ Protected routes with subscription checking
- ✅ Basic dashboard shells for each role
- ✅ Navigation with logout functionality

### Active Agent Handoff
**Last Active Agent:** 💻 Dev (James)
**Recommended Next Agent:** 🏗️ Architect (Winston) - to design the dashboard data architecture before implementation

## 📋 Implementation Plan

### Phase 1: Dashboard Data Architecture (🏗️ Architect)
Design the data flow and component architecture for role-based dashboards:
- Dashboard data fetching patterns
- State management approach
- Component hierarchy
- API endpoint design

### Phase 2: Database Queries & Hooks (💻 Dev)
Create the data layer:

```typescript
// New files to create:
src/hooks/useDashboardData.ts
src/lib/dashboard-queries.ts
src/types/dashboard.ts
```

### Phase 3: Role-Specific Dashboard Implementation

#### Coach Dashboard (🎨 UX + 💻 Dev)
- Practice plan management
- Team roster overview
- Drill usage statistics
- Quick action buttons

#### Player Dashboard (🎨 UX + 💻 Dev)
- Skills Academy progress
- Personal achievements
- Workout history
- Team schedule

#### Parent Dashboard (🎨 UX + 💻 Dev)
- Child account linking
- Progress monitoring
- Team communications
- Payment status

#### Director Dashboard (📊 Analyst + 💻 Dev)
- Program analytics
- Multi-team overview
- Coach performance
- Usage metrics

### Phase 4: Testing & Validation (🧪 QA)
- Role-based access testing
- Subscription gating verification
- Cross-browser compatibility
- Mobile responsiveness

## 🔧 Technical Details

### Key Files Created
```
/src/lib/wordpress-auth.ts              # WordPress authentication
/src/hooks/useWordPressAuth.ts          # Auth hooks and context
/src/app/auth/login/page.tsx            # Login page
/src/app/(authenticated)/dashboard/page.tsx  # Role-based dashboard
/supabase/migrations/002_wordpress_auth_tables.sql  # User tables
```

### Environment Variables Required
```env
WORDPRESS_API_URL=https://powlax.com/wp-json/wp/v2
WORDPRESS_USERNAME=powlax
WORDPRESS_APP_PASSWORD=0xDT JlPT JRHe jnXd lIkC e0zt
```

### New Package.json Scripts
```json
"import:csv": "tsx scripts/import-csv-to-supabase.ts"
"db:migrate": "supabase migration up"
```

## 🚀 Quick Start for Next Session

```bash
# 1. Start development server
npm run dev

# 2. Test authentication
# Navigate to: http://localhost:3000/auth/login
# Use WordPress credentials

# 3. Check role-based routing
# Dashboard will display based on user role
```

## 📊 Remaining Todo Items

1. **High Priority:**
   - 📊 + 💻 Connect Supabase staging tables to practice planner
   - 📊 Map drill→strategy relationships in Supabase

2. **Medium Priority:**
   - 🏗️ + 🎨 Design Skills Academy component architecture
   - 🏗️ + 📊 Plan point/badge system mechanics
   - All Agents: Build basic Skills Academy page

## 🤝 Agent Recommendations by Task

| Task | Primary Agent | Supporting Agents |
|------|--------------|-------------------|
| Dashboard Architecture | 🏗️ Architect | 📊 Analyst |
| UI Implementation | 🎨 UX Expert | 💻 Dev |
| Data Integration | 💻 Dev | 🏗️ Architect |
| Analytics Design | 📊 Analyst | 🏗️ Architect |
| Testing | 🧪 QA | 💻 Dev |
| Project Coordination | 🎭 Orchestrator | 🏃 SM |

## 📝 Notes for Orchestrator

When session is cleared or compacted, always include:
1. Last active agent and their completed work
2. Recommended next agent based on pending tasks
3. Current project phase
4. Any blockers or dependencies

Example handoff message:
"Last session completed WordPress Authentication (💻 Dev). Next recommended: 🏗️ Architect for dashboard data architecture design. Current phase: Role-based dashboard implementation."