# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 **POWLAX INITIALIZATION WORKFLOW**

**Every session should begin with this systematic initialization:**

### **STEP 1: Agent & Context Verification**
**Check your identity and context:**
```
What agent am I using? Verify my complete POWLAX context including:
- Lacrosse platform philosophy: "Lacrosse is fun when you're good at it"
- Age bands: Do it (8-10), Coach it (11-14), Own it (15+) 
- Core features: Practice Planner, Skills Academy, Team HQ, Gamification
- Technical stack: Next.js 14, React 18, TypeScript, Tailwind, Shadcn/UI, Supabase
- Current development branch: powlax-sub-agent-system
```

### **STEP 2: Available POWLAX Sub Agents**
**5 Specialized Agents (install: `cp -r claude-agents/* ~/.claude/agents/`):**

- **🎮 powlax-master-controller** - Central orchestration, quality gates
- **⚡ powlax-frontend-developer** - React/Shadcn UI, mobile optimization  
- **🔍 powlax-ux-researcher** - Coaching workflows, age-appropriate UX
- **🏗️ powlax-backend-architect** - Database/API, performance optimization
- **📊 powlax-sprint-prioritizer** - Feature prioritization, impact assessment

### **STEP 3: Enhanced Prompt Commands**
**Use these suffixes for optimized responses:**

- **`-u`** → Ultra Think (maximum reasoning, complex problems)
- **`-e`** → Explain Logs (systematic error analysis, no assumptions)
- **`-d`** → Think Harder (concise, actionable responses)

**Examples:**
```
"Analyze the practice planner mobile responsiveness issues -u"
"Why is the build failing with these errors? [paste logs] -e"  
"How do I implement age-appropriate interfaces? -d"
```

### **STEP 4: Current Development Context**
**Always check these before starting work:**

**Branch Status:**
```bash
git status                    # Current files and changes
git branch -a                 # Confirm on powlax-sub-agent-system branch
npm run dev                   # Verify development server works
```

**Quality Gates:**
```bash  
npm run lint                  # Code quality check
npm run build                 # Build verification
npm run typecheck             # TypeScript validation
```

**Mobile Responsiveness:**
- Test on 375px (mobile), 768px (tablet), 1024px (desktop)
- Validate field usage (bright sunlight, gloves, battery efficiency)
- Confirm age-appropriate interfaces for all user types

### **STEP 5: Todo & Task Management**
**Check current priorities:**
```
Review docs/features/*.md files for active feature development
Check any TODO comments in codebase
Verify recent git commits for context on current work
```

**Feature Development Process:**
1. **Mandatory Planning:** 20+ minutes in feature.md before ANY coding
2. **Sub Agent Assignment:** Coordinate appropriate specialized agents
3. **Quality Gates:** Lint + build + mobile test every 15 minutes  
4. **Documentation:** Update architecture docs with all changes

---

## 🚀 **POWLAX Sub Agent System (Primary Development Method)**

### **Master Controller Orchestration**
**Use `powlax-master-controller` as single point of contact:**
```
"I need to [specific development task]. Please coordinate your specialized sub agents to handle this systematically with mobile-first, age-appropriate design."
```

### **Direct Sub Agent Usage**
**For focused work, use specific agents:**
- **Frontend Issues:** Use `powlax-frontend-developer`
- **User Experience:** Use `powlax-ux-researcher`  
- **Backend/Database:** Use `powlax-backend-architect`
- **Feature Planning:** Use `powlax-sprint-prioritizer`

### **Automated Development Features**
**Claude Code hooks active (.claude/hooks/):**
- **15-minute commit reminders** - Auto-generated commit messages
- **Quality prompts** - Enhanced responses with -u, -e, -d
- **Error analysis** - Systematic log interpretation

### **Workflow Documents**
- **Setup Guide:** `docs/Sub Agent Creation Instructions/POWLAX_CLAUDE_CODE_SETUP_GUIDE.md`
- **Branch Strategy:** `POWLAX_NEW_BRANCH_WORKFLOW_GUIDE.md`
- **Feature Template:** `docs/templates/FEATURE_TEMPLATE.md`
- **Development Plan:** `POWLAX_SYSTEMATIC_DEVELOPMENT_PLAN.md`

---

## 🔍 **CODEBASE ANALYSIS APPROACH**

### **Before Making Changes - ALWAYS:**
1. **Understand the full context** - Read relevant components and their relationships
2. **Identify ALL affected files** - Components, types, tests, documentation  
3. **Check mobile responsiveness** - How changes affect different screen sizes
4. **Validate age appropriateness** - Interface suitable for target age bands
5. **Review integration points** - How changes affect existing functionality

### **Standard Analysis Pattern:**
```
1. Read existing component/feature structure
2. Identify patterns used in similar POWLAX features  
3. Check mobile-first implementation approach
4. Validate against Shadcn/UI component usage
5. Confirm age-band appropriate interface design
6. Plan implementation with sub agent coordination
```

### **Quality Verification:**
- **TypeScript strict mode** - All code properly typed
- **Mobile-first responsive** - Works on 375px+ screens
- **POWLAX brand colors** - #003366 (blue), #FF6600 (orange)
- **Accessibility compliance** - 44px+ touch targets, high contrast
- **Performance targets** - <3 second loads on 3G networks

---

## ⚠️ **DEPRECATED SYSTEMS (DO NOT USE)**
- ❌ BMad agents (archived - use sub agents instead)
- ❌ A4CC agents (archived - use sub agents instead) 
- ❌ Direct main branch commits (use feature branches only)

---

## Commands

### Development
```bash
npm run dev          # Start Next.js development server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint checks
```

### Testing
```bash
npx playwright test                           # Run all tests
npx playwright test tests/practice-planner   # Run specific test file
npx playwright test --ui                     # Run tests with UI mode
npx playwright test --debug                  # Debug tests interactively
npx playwright show-report                   # View test report
```

### Database & Scripts
```bash
npm run db:migrate                                                          # Run Supabase migrations
npm run import:csv                                                          # Import CSV data to Supabase
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY npx tsx scripts/import-csv-to-supabase.ts  # Import with service role
```

## Architecture Overview

This is a Next.js 14 App Router application for POWLAX, a lacrosse training platform migrating from WordPress to modern React/Supabase.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS
- **UI Components**: shadcn/ui (New York style), Radix UI, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: TanStack React Query v5
- **Testing**: Playwright for E2E tests

### Key Directories
- `/src/app/` - Next.js pages and API routes
- `/src/components/` - Reusable components organized by domain (drill-library/, practice-planner/, etc.)
- `/src/lib/supabase/` - Supabase client setup and utilities
- `/src/hooks/` - Custom React hooks (useSupabase, useAuthContext, etc.)
- `/src/types/` - TypeScript type definitions matching Supabase schema
- `/supabase/migrations/` - Database schema migrations
- `/scripts/` - Data import and transformation scripts

### Database Architecture
The Supabase database uses a sophisticated 4-tier taxonomy system:
- **Drills** ↔ **Strategies** ↔ **Concepts** ↔ **Skills**
- 33 tables total including gamification, teams, practice plans, and analytics
- Complex relationships managed through junction tables

### Component Patterns
1. **Server Components by default** - Use client components only when needed
2. **Supabase SSR** - Server-side data fetching with proper auth context
3. **shadcn/ui components** - Customized with POWLAX brand colors
4. **Mobile-first design** - Bottom navigation on mobile, sidebar on desktop

### POWLAX Brand Colors
```typescript
// tailwind.config.ts extensions
powlax: {
  blue: '#003366',    // Primary brand color
  orange: '#FF6600',  // Accent color
  gray: '#4A4A4A'     // Text color
}
```

### Authentication Pattern
```typescript
// Always use server-side auth for initial page loads
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // ...
}
```

### Key Features
- **Practice Planner**: Drag-and-drop interface for creating practice sessions
- **Drill Library**: Searchable database with videos, diagrams, and categorization
- **Skills Academy**: Educational content with quizzes and certifications
- **Gamification**: Points, badges, and progress tracking system
- **Team Management**: Multi-role support (coaches, players, parents)

### Development Workflow
- **NEW**: Use POWLAX Master Controller for all development (see top of file)
- Reference complete system architecture in `/docs/development/`
- Follow progress tracking in coordination logs
- Quality gates: lint, build, mobile testing required

### Commit & Production Guidelines
- **REQUIRED**: Follow [GitHub Commit & Production Guidelines](docs/development/GITHUB_COMMIT_AND_PRODUCTION_GUIDELINES.md)
- **Quick Reference**: [Quick Commit Checklist](docs/development/QUICK_COMMIT_CHECKLIST.md)

## Notes
- This is a TypeScript project with strict type checking enabled
- All components should be mobile-first and responsive
- Use Supabase RLS policies for data security
- Follow existing patterns in the codebase for consistency