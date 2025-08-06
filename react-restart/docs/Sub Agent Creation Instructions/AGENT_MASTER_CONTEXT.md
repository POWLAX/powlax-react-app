# POWLAX React App - Master Context Document for All Agents
*Generated: 2025-08-06*  
*Purpose: Complete context and current state for all development agents*

---

## 🎯 **PROJECT OVERVIEW**

### **What Is POWLAX?**
POWLAX is a comprehensive lacrosse training platform migrating from WordPress to a modern React/Next.js application. It serves coaches, players, and parents with practice planning, skills training, team management, and gamification features.

### **Current State**
- **Phase**: Active development, migrating from WordPress
- **Stack**: Next.js 14 (App Router), React 18, TypeScript, Supabase, Tailwind CSS
- **Users**: Coaches (primary), Players, Parents, Admins
- **Key Features**: Practice Planner, Skills Academy, Team Management, Gamification

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Tech Stack**
```yaml
Frontend:
  - Framework: Next.js 14 (App Router)
  - Language: TypeScript 5
  - Styling: Tailwind CSS + shadcn/ui (New York style)
  - State: TanStack React Query v5
  - Animations: Framer Motion, React Spring, Three.js

Backend:
  - Database: Supabase (PostgreSQL)
  - Auth: Dual system (Supabase + WordPress JWT)
  - API: Next.js API routes + Supabase client
  - Real-time: Supabase subscriptions

Testing:
  - E2E: Playwright
  - Unit: (To be implemented)

Deployment:
  - Platform: Vercel
  - Database: Supabase Cloud
  - Assets: Vimeo (videos)
```

### **Project Structure**
```
/src
├── app/                    # Next.js App Router pages
│   ├── (authenticated)/   # Protected routes
│   ├── api/               # API endpoints
│   └── demo/              # Public demo pages
├── components/            # Reusable components
│   ├── practice-planner/  # Practice planning features
│   ├── skills-academy/    # Skills training components
│   ├── navigation/        # Nav components
│   ├── team-dashboard/    # Team management
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and services
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
└── contexts/              # React contexts

/supabase
├── migrations/            # Database migrations
└── (schema files)

/docs
├── agent-instructions/    # A4CC agent definitions
├── development/          # Dev guidelines
├── database/             # Schema documentation
└── Wordpress CSV's/      # Migration data
```

---

## 💾 **DATABASE ARCHITECTURE**

### **Core Tables (33 total)**

#### **Content Tables**
- `drills_powlax` - Lacrosse drills library
- `strategies_powlax` - Strategy content (221 records imported)
- `concepts` - Training concepts
- `skills` - Individual skills tracking

#### **User & Team Management**
- `users` - User accounts (Supabase auth)
- `organizations` - Top-level org structure
- `teams` - Team entities
- `user_team_roles` - Role assignments (coach/player/parent)
- `team_invitations` - Pending invites

#### **Skills Academy**
- `skills_academy_powlax` - Academy content
- `workout_templates` - Predefined workouts
- `workout_completions` - Progress tracking
- `user_skill_progress` - Individual skill advancement

#### **Gamification**
- `achievements` - Available badges/achievements
- `user_achievements` - Earned achievements
- `points_ledger` - Point transactions
- `streaks` - Activity streaks
- `leaderboards` - Competitive rankings

#### **Practice Planning**
- `practice_plans` - Saved practice sessions
- `practice_plan_drills` - Drill assignments
- `practice_templates` - Reusable templates

### **4-Tier Taxonomy**
```
Drills ↔ Strategies ↔ Concepts ↔ Skills
(Complex relationships managed through junction tables)
```

---

## 🔐 **AUTHENTICATION SYSTEM**

### **Dual Auth Approach**
1. **Development**: Supabase auth (simplified)
2. **Production**: WordPress JWT integration
3. **Future**: Full migration to Supabase

### **User Roles**
- `admin` - Full system access
- `coach` - Team management, practice planning
- `player` - Skills academy, personal progress
- `parent` - View child progress, limited access

### **Current Auth Flow**
```typescript
// Development bypasses auth checks
if (process.env.NODE_ENV === 'development') {
  return true; // Auto-authenticated
}

// Production uses JWT validation
const token = jwtAuth.getToken();
const isValid = await jwtAuth.validateToken();
```

---

## 🚀 **KEY FEATURES STATUS**

### **✅ Working Features**
- Basic practice planner with drag-drop
- Drill library with search/filter
- Strategy viewer with video integration
- Navigation system (sidebar + mobile bottom nav)
- Registration flow
- Basic gamification animations

### **🔧 In Progress**
- Skills Academy workout builder
- Team HQ dashboard
- Admin content editor
- Print functionality for practice plans
- Complete gamification system

### **📋 Planned**
- MemberPress integration
- Club OS management
- Vimeo transcript integration
- Advanced analytics
- Mobile app wrapper

---

## 🎨 **BRAND & DESIGN**

### **POWLAX Colors**
```css
--powlax-blue: #003366;    /* Primary */
--powlax-orange: #FF6600;  /* Accent */
--powlax-gray: #4A4A4A;    /* Text */
```

### **Design Principles**
- Mobile-first responsive design
- Clean, sports-oriented aesthetic
- High contrast for outdoor viewing
- Intuitive coach-friendly interface

---

## 📁 **CURRENT WORK PRIORITIES**

### **Immediate (Next 2-3 Days)**
1. **Team Migrations Verification** - Ensure all team data migrated correctly
2. **Backend Drill/Strategy Editor** - Admin interface for content management
3. **Practice Planner Print** - Print-friendly CSS and PDF export
4. **Skills Academy Interface** - Complete workout selection and progress tracking
5. **Workouts Migration** - Import all legacy workout data

### **This Week**
- Complete navigation documentation
- Fix any authentication issues
- Implement missing RLS policies
- Test on multiple devices

### **This Sprint**
- Launch Skills Academy MVP
- Complete Team HQ features
- Integrate gamification fully
- Begin MemberPress integration

---

## ⚠️ **CRITICAL WARNINGS FOR AGENTS**

### **Database Operations**
- **NEVER** modify migration files after deployment
- **ALWAYS** check for existing data before creating tables
- **RLS policies** must be added for all new tables
- **Foreign keys** must reference existing tables

### **Import/Module Issues**
- **VERIFY** all imports exist before using
- **CHECK** `@/hooks/useAuthContext` doesn't exist (use `@/contexts/AuthContext`)
- **AVOID** circular dependencies
- **USE** absolute imports with `@/` prefix

### **Authentication**
- **DEV MODE** auto-authenticates (don't test auth in dev)
- **PRODUCTION** requires valid JWT token
- **SUPABASE** client must be created correctly (server vs client)

### **Component Patterns**
- **DEFAULT** to server components
- **CLIENT** components only when needed (interactivity)
- **HYDRATION** errors from server/client mismatch
- **MOBILE** test all features on small screens

---

## 🛠️ **AGENT SYSTEM**

### **A4CC Standards**
All agents follow the A4CC (AI for Code Collaboration) standards with:
- Clear scope definition
- Self-updating documentation
- Error prevention guidelines
- Success criteria

### **Active Agents**
1. **Skills Academy Workout Builder** - Building workout creation interface
2. **Practice Planner Enhancement** - Improving planner features
3. **Team HQ Management** - Team dashboard development
4. **Navigation Enhancement** - Improving navigation UX
5. **Admin Content Management** - Backend editing tools

### **Agent Documentation**
- **Master Guide**: `/docs/agent-instructions/A4CC_AGENT_BUILDER_MASTER_GUIDE.md`
- **Troubleshooting**: `/docs/development/AGENT_TROUBLESHOOTING_GUIDE.md`
- **Self-Update Protocol**: `/docs/agent-instructions/AGENT_SELF_UPDATE_PROTOCOL.md`

---

## 📊 **MIGRATION STATUS**

### **From WordPress**
- ✅ Drills data structure defined
- ✅ Strategies imported (221 records)
- ✅ User roles mapped
- 🔧 Teams/organizations in progress
- 🔧 Gamification data importing
- 📋 MemberPress subscriptions pending
- 📋 LearnDash courses pending

### **Data Sources**
- CSV exports in `/docs/Wordpress CSV's/`
- Import scripts in `/scripts/imports/`
- Transformation utilities in `/scripts/transforms/`

---

## 🔧 **DEVELOPMENT GUIDELINES**

### **Commit Process**
```bash
# Before EVERY commit
npm run lint && npm run build && npx playwright test

# Commit with clear message
git add .
git commit -m "feat: [component] - description"
```

### **Testing Requirements**
- E2E tests for critical paths
- Mobile + desktop testing
- Multiple browser testing
- Accessibility checks

### **Code Standards**
- TypeScript for all new code
- Follow existing patterns
- Mobile-first development
- Document complex logic
- No console.logs in production

---

## 🚨 **EMERGENCY PROCEDURES**

### **App Won't Load**
1. Check terminal for import errors
2. Run `npm run dev` and check for module errors
3. Review recent changes in git
4. Check `/docs/development/IMMEDIATE_FIX_CHECKLIST.md`

### **Database Issues**
1. Check Supabase dashboard for errors
2. Verify RLS policies aren't blocking
3. Check migration status
4. Review service role key configuration

### **Auth Problems**
1. Check if in dev mode (should bypass)
2. Verify JWT token in localStorage
3. Check WordPress API connectivity
4. Review auth context initialization

---

## 📞 **SUPPORT & RESOURCES**

### **Documentation**
- GitHub Issues: Report bugs and request features
- CLAUDE.md: AI assistant guidelines
- README.md: Project overview

### **External Resources**
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

### **Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WORDPRESS_API_URL=
WORDPRESS_JWT_SECRET=
```

---

## 📈 **PROJECT METRICS**

- **Tables**: 33 defined
- **Components**: 50+ created
- **Pages**: 25+ routes
- **Migrations**: 9 completed
- **Test Coverage**: E2E for critical paths
- **Active Development**: Daily updates

---

## 🎯 **SUCCESS CRITERIA**

### **MVP Launch Ready When:**
- ✅ Practice planner fully functional
- ✅ Basic Skills Academy working
- 🔧 Team management complete
- 🔧 Gamification integrated
- 📋 Print functionality working
- 📋 Mobile experience polished
- 📋 Auth flow seamless

### **Production Ready When:**
- All MVP features complete
- WordPress migration finished
- Performance optimized
- Security audited
- Documentation complete
- Support system in place

---

## 📝 **NOTES FOR ALL AGENTS**

1. **This document is your source of truth** - Reference it before making architectural decisions
2. **Update this document** - When major changes occur, update relevant sections
3. **Check existing code** - Always verify patterns in existing code before implementing new features
4. **Mobile-first** - Every feature must work on mobile devices
5. **Test your changes** - Run tests before considering work complete
6. **Document complex logic** - Future agents need to understand your implementation
7. **Follow A4CC standards** - Use the agent builder guide for consistency
8. **Report issues** - Update troubleshooting guide when encountering new problems

---

*End of Master Context Document*