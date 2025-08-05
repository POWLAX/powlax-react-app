# POWLAX React App - Agent Code Context (A4CC) Framework

---
**Description**: Agent-focused reference framework for POWLAX Practice Planner React application
**Version**: 1.0
**Updated**: January 2025
**Always Apply**: true
---

## 🎯 Framework Purpose

This A4CC framework provides agents with precise structural knowledge of the POWLAX React codebase. Use this document to understand exactly what elements to manipulate, where they are located, and which files to reference for consistent code changes. This framework emphasizes descriptive guidance over prescriptive code changes.

---

## 📁 Project Architecture Overview

### Core Technologies
- **Frontend**: Next.js 14.2.5 with TypeScript and Tailwind CSS
- **Authentication**: WordPress JWT + Supabase Auth (dual system)
- **Database**: Supabase (PostgreSQL) with 33+ tables
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **State Management**: React Context + TanStack Query patterns
- **Development**: Playwright for testing, ESLint for linting

### Project Structure Reference
```
powlax-react-app/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── (authenticated)/        # Protected routes with layout
│   │   ├── auth/login/             # Authentication pages
│   │   ├── layout.tsx              # Root layout with providers
│   │   └── page.tsx                # Home page
│   ├── components/                 # Reusable components
│   │   ├── navigation/             # Navigation components
│   │   ├── practice-planner/       # Core practice planning components
│   │   └── ui/                     # shadcn/ui component library
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utility functions and configurations
│   └── types/                      # TypeScript type definitions
├── supabase/                       # Database migrations and schema
├── tests/e2e/                      # Playwright end-to-end tests
└── docs/                           # Project documentation
```

---

## 🔧 Agent Task Categories

### 1. Authentication & User Management
**Key Files to Reference:**
- `src/hooks/useWordPressAuth.ts` - WordPress authentication hook (lines 6-222)
- `src/lib/wordpress-auth.ts` - WordPress API integration (lines 32-347)
- `src/app/(authenticated)/layout.tsx` - Protected route wrapper (lines 1-66)
- `src/app/auth/login/page.tsx` - Login page component

**Data Elements:**
- User context: `WordPressUser` interface with subscription data
- Auth state: localStorage token management, session validation
- Role validation: Admin, Coach, Player, Parent, Director roles
- Subscription status: MemberPress integration for access control

**Navigation Elements:**
- Authenticated layout: `SidebarNavigation` + `BottomNavigation`
- Route protection: Auth check in layout component (currently disabled for dev)

---

### 2. Practice Planning System
**Key Components to Reference:**
- `src/components/practice-planner/DrillLibrary.tsx` - Main drill browser (lines 13-431)
- `src/components/practice-planner/PracticeTimeline.tsx` - Linear drill timeline (lines 1-131)
- `src/components/practice-planner/PracticeTimelineWithParallel.tsx` - Advanced parallel drill timeline (lines 26-203)
- `src/components/practice-planner/DrillCard.tsx` - Individual drill display (lines 1-294)

**Data Structures:**
```typescript
// Core Drill Interface (used across components)
interface Drill {
  id: string
  name: string
  duration: number
  category: string
  subcategory?: string
  strategies?: string[]
  concepts?: string[]
  skills?: string[]
  videoUrl?: string
  drill_lab_url_1-5?: string  // Lacrosse Lab diagram URLs
  equipment_needed?: string[]
  notes?: string
}

// Time Slot Structure (for parallel drills)
interface TimeSlot {
  id: string
  drills: Drill[]      // 1-4 parallel activities
  duration: number     // Max duration of all drills
}
```

**Modal Components:**
- `AddCustomDrillModal.tsx` - Custom drill creation (lines 16-324)
- `ParallelDrillPicker.tsx` - Add parallel activities (lines 7-160)
- Modal system: VideoModal, LinksModal, StrategiesModal, LacrosseLabModal

---

### 3. Data Layer & API Integration
**Database Connection:**
- `src/lib/supabase.ts` - Supabase client configuration (6 lines)
- `src/hooks/useSupabaseDrills.ts` - Drill data fetching hook (lines 16-163)
- `src/hooks/useDrills.ts` - Mock data fallback system (lines 1-39)

**WordPress Integration:**
- `src/lib/wordpress-sync.ts` - Data synchronization (lines 16-229)
- `src/lib/wordpress-api.ts` - WordPress REST API wrapper (152 lines)
- User sync: WordPress → Supabase user data synchronization

**Key Database Tables (Reference: `docs/existing/v3-supabase-tables-list.md`):**
- `drills` - 30+ fields including videos, diagrams, age progressions
- `academy_drills` - Individual skill development content
- `strategies` - Phase-specific game plans (9 game phases)
- `concepts` - Teaching concepts with visual aids
- `users` - User profiles with WordPress integration
- `teams` - Team management and roster data

---

### 4. Navigation & Layout System
**Navigation Components:**
- `src/components/navigation/SidebarNavigation.tsx` - Desktop sidebar (lines 1-102)
- `src/components/navigation/BottomNavigation.tsx` - Mobile bottom nav (lines 1-63)

**Navigation Structure:**
```typescript
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Teams', href: '/teams', icon: Users },
  { name: 'Academy', href: '/academy', icon: GraduationCap },
  { name: 'Resources', href: '/resources', icon: BookOpen },
  { name: 'Community', href: '/community', icon: MessageCircle },
]
```

**Layout Elements:**
- Root layout: `src/app/layout.tsx` - Global providers and Toaster
- Authenticated layout: Sidebar + main content + bottom nav
- Responsive design: md:hidden for mobile, hidden md:flex for desktop

---

### 5. UI Component System
**Base Components (shadcn/ui):**
- `src/components/ui/button.tsx` - Button variants and sizes (lines 1-57)
- `src/components/ui/card.tsx` - Card components with header/content/footer (lines 1-76)
- `src/components/ui/dialog.tsx` - Modal dialogs with overlay (lines 1-65)
- Additional: badge.tsx, accordion.tsx, select.tsx, checkbox.tsx, table.tsx

**Styling System:**
- Tailwind CSS with custom configuration
- CSS variables for theming
- Class variance authority (cva) for component variants
- Radix UI primitives for accessibility

---

## 🚀 Page Structure Reference

### Current Application Pages
1. **Root Level:**
   - `/` - Home page (`src/app/page.tsx`)

2. **Authentication:**
   - `/auth/login` - Login page (`src/app/auth/login/page.tsx`)

3. **Authenticated Routes:**
   - `/dashboard` - Main dashboard (`src/app/(authenticated)/dashboard/page.tsx`)
   - `/admin/role-management` - Admin role management (`src/app/(authenticated)/admin/role-management/page.tsx`)
   - `/teams/[teamId]/practice-plans` - Team-specific practice plans (`src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx`)

4. **Development/Testing:**
   - `/test-supabase` - Database connection test
   - `/test-wordpress` - WordPress integration test

### Missing Routes (Navigation References)
These routes exist in navigation but don't have corresponding pages yet:
- `/teams` (without teamId)
- `/academy`
- `/resources`
- `/community`

---

## 🔄 Data Flow Patterns

### Authentication Flow
1. **Login Process**: WordPress JWT validation → Supabase user sync → Local storage token
2. **Session Management**: Token validation on protected routes
3. **Role-Based Access**: User roles determine available features/pages

### Drill Management Flow
1. **Data Source**: Supabase drills table → useSupabaseDrills hook
2. **Fallback**: Mock data if Supabase unavailable → useDrills hook
3. **Practice Building**: DrillLibrary → Timeline components → DrillCard display
4. **Modal System**: VideoModal, LinksModal for additional content

### State Management Pattern
- **Global Auth**: React Context (WordPressAuthProvider)
- **Data Fetching**: React Query patterns (planned, currently basic hooks)
- **Local State**: useState for component-specific state
- **Form State**: Standard React form handling

---

## 🎨 Styling & Theme System

### Tailwind Configuration
- Custom color scheme with CSS variables
- Responsive breakpoints: sm, md, lg, xl
- Dark mode support (theme-based)

### Component Styling Patterns
- **Base styles**: Defined in component variants (cva)
- **State styles**: Conditional classes based on props/state
- **Responsive**: Mobile-first with md: prefixes for desktop
- **Interactive states**: hover:, focus:, active: states

---

## 🧪 Testing Architecture

### Test Structure
- **E2E Tests**: `tests/e2e/` - Playwright test files
- **Test Commands**: `npm run test` (not configured), Playwright for E2E
- **Test Patterns**: Page object model, component testing

### Key Test Files
- `check-modals.spec.ts` - Modal functionality testing
- `complete-workflow.spec.ts` - End-to-end user workflows
- Configuration: `playwright.config.ts`

---

## 📋 Agent Implementation Guidelines

### When Working on Authentication
1. **Reference Files**: Always check `useWordPressAuth.ts` for current auth patterns
2. **State Management**: Use existing WordPressAuthProvider context
3. **Route Protection**: Follow pattern in `(authenticated)/layout.tsx`
4. **User Data**: Sync between WordPress and Supabase using existing patterns

### When Working on Practice Planning
1. **Component Structure**: Follow DrillCard → Timeline → Library hierarchy
2. **Data Types**: Use established Drill interface and TimeSlot structure
3. **Modal System**: Reference existing modal components for consistency
4. **State Patterns**: Local state for UI, hooks for data fetching

### When Working on Navigation
1. **Route Structure**: Follow Next.js App Router conventions
2. **Navigation Items**: Update both SidebarNavigation and BottomNavigation
3. **Active States**: Use usePathname for route highlighting
4. **Responsive Design**: Maintain mobile/desktop navigation split

### When Working on UI Components
1. **Base Components**: Extend shadcn/ui components, don't replace
2. **Styling**: Use Tailwind classes with cva for variants
3. **Accessibility**: Maintain Radix UI accessibility features
4. **Consistency**: Follow established component patterns

---

## 🎯 Agent Task Templates

### Adding New Page
**Elements to Check:**
- Navigation items in both SidebarNavigation and BottomNavigation
- Route structure in `src/app/` directory
- Authentication requirements (authenticated vs public)
- Required data fetching hooks
- Page-specific components needed

### Modifying Drill System
**Elements to Reference:**
- Drill interface definition across multiple files
- Supabase table structure in docs/existing/v3-supabase-tables-list.md
- DrillCard props and modal system
- Timeline component structure (linear vs parallel)

### Working with Authentication
**Elements to Check:**
- WordPressAuthProvider context usage
- Token management in localStorage
- Route protection patterns
- User role validation middleware

### UI Component Changes
**Elements to Reference:**
- shadcn/ui base component structure
- Tailwind configuration and theme variables
- Component variant patterns using cva
- Responsive design breakpoints

---

## 📚 Quick Reference Commands

### Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Database
```bash
npm run db:migrate   # Run Supabase migrations
npm run import:csv   # Import CSV data to Supabase
```

### Testing
```bash
npx playwright test  # Run E2E tests
```

---

## 🔍 Debugging & Investigation Tools

### When Components Don't Load
1. **Check Auth State**: Is user properly authenticated?
2. **Check Data Hooks**: Are useSupabaseDrills/useDrills returning data?
3. **Check Route Protection**: Is route properly wrapped in authenticated layout?
4. **Check Import Paths**: Are all imports using correct relative/absolute paths?

### When Data Doesn't Display
1. **Check Supabase Connection**: Review test-supabase page for connection status
2. **Check Table Structure**: Reference v3-supabase-tables-list.md for correct field names
3. **Check Hook Implementation**: Review useSupabaseDrills for query patterns
4. **Check Interface Matching**: Ensure component props match data structure

---

## 🤖 Agent Coordination Guidelines

### Agent Selection Decision Tree
**Use this decision tree to select the optimal agent for any task:**

1. **React Component Work** → `*agent dev` (James) + always reference C4A
   - Creating new components, modifying existing components
   - shadcn/ui integration, TypeScript development
   - Next.js page creation and routing

2. **System Architecture & Practice Planner Features** → `*agent architect` (Winston)
   - POWLAX system design and practice planner component architecture
   - DrillLibrary, Timeline, DrillCard architectural decisions
   - Lacrosse domain expertise and gamification architecture
   - Modal system design and component relationships

3. **Data Integration Work** → `*agent dev` (James) 
   - Supabase hooks and queries implementation
   - WordPress authentication and sync
   - API patterns and React component data integration

4. **UI/UX Design** → `*agent ux-expert` (Sally) + lacrosse context
   - Age-appropriate interfaces using "do it, coach it, own it"
   - Coach workflow optimization and mobile-first design
   - Youth sports psychology and lacrosse-specific UX patterns

5. **Architecture Decisions** → `*agent architect` (Winston) + current system context
   - System design and technical planning
   - Technology selection and infrastructure decisions

6. **Story Creation** → `*agent sm` (Bob) with POWLAX user stories
   - Breaking down features into development tasks
   - Creating detailed user stories with acceptance criteria

7. **Quality Assurance** → `*agent qa` (Quinn) with React/Playwright focus
   - Test planning and automation strategy
   - Code review and quality standards

8. **Project Coordination** → `*agent bmad-orchestrator` (BMad Orchestrator)
   - Multi-agent coordination and workflow management
   - When unsure which agent to use

### Agent Handoff Protocol
**When agents need to collaborate, follow this protocol:**

#### **Context Preservation Requirements:**
1. **Component Location Sharing**: Always reference exact file paths and line numbers
   - Example: "Working on DrillCard.tsx lines 45-67 for modal integration"
   
2. **POWLAX Domain Knowledge Transfer**: Include relevant context
   - Age bands: do it (8-10), coach it (11-14), own it (15+)
   - Game phases: Face-off, Transition, Settled, Special teams
   - User roles: Admin, Coach, Player, Parent, Director
   
3. **Technical State Sharing**: Current system status
   - Localhost server status and current page implementations
   - Component hierarchy position in practice planner system
   - Data integration patterns and authentication state

4. **C4A Section Reference**: Always mention which C4A section is being worked on
   - Navigation & Layout System, Practice Planning System, etc.

#### **Handoff Message Format:**
```
Handing off to [Agent Name] for [specific task].

Context:
• Current Component: [file path and lines]
• POWLAX Domain: [age band/game phase/user role considerations]
• Technical State: [localhost status, authentication, data hooks]
• C4A Section: [relevant framework section]
• Completed: [what was accomplished]
• Next Steps: [what the receiving agent should focus on]

- [Current Agent Name]
```

### Common Agent Workflows

#### **New Page Creation Workflow:**
1. **architect** (Winston) → Define page structure and data requirements
2. **ux-expert** (Sally) → Design age-appropriate interface and coach workflow
3. **dev** (James) → Implement React component with shadcn/ui patterns
4. **qa** (Quinn) → Create test strategy and quality validation

#### **Practice Planner Enhancement Workflow:**
1. **architect** (Winston) → Define lacrosse requirements and component architecture changes
2. **ux-expert** (Sally) → Design interface improvements with age-band considerations
3. **dev** (James) → Implement React component modifications and data integration
4. **qa** (Quinn) → Test functionality and user experience

#### **Data Integration Workflow:**
1. **architect** (Winston) → Design API patterns and database architecture changes  
2. **dev** (James) → Implement Supabase hooks, WordPress sync, and React component integration
3. **qa** (Quinn) → Test data flows, authentication, and error handling

#### **Bug Fix Workflow:**
1. **qa** (Quinn) → Identify issue scope and component location
2. **dev** (James) → Implement fix with component-specific and data integration context
3. **architect** (Winston) → Review for architectural implications if needed
4. **qa** (Quinn) → Validate fix and regression testing

### Agent Specialization Quick Reference

| Agent | Icon | Primary Focus | Key Files/Components |
|-------|------|---------------|---------------------|
| **dev (James)** | 💻 | React/Next.js + Data Integration | All `src/` files, Supabase hooks, WordPress sync |
| **architect (Winston)** | 🏗️ | POWLAX System Architecture | Practice planner design, lacrosse domain, gamification |
| **ux-expert (Sally)** | 🎨 | Lacrosse UX Design | Age-appropriate UI, coach workflows, youth sports UX |
| **analyst (Mary)** | 📊 | Research & Analysis | Requirements, gamification research, data modeling |
| **qa (Quinn)** | 🧪 | Quality Assurance | Testing strategy, code review |
| **sm (Bob)** | 🏃 | Story Management | User stories, task breakdown |
| **bmad-orchestrator** | 🎭 | Coordination | Agent selection, workflow management |

### POWLAX-Specific Agent Commands

#### **BMad Orchestrator Commands:**
- `*component-help` - Guide to correct agent for React component work
- `*page-status` - Show current page status (7 exist, 4 missing)
- `*drill-system-help` - Explain practice planner architecture
- `*powlax-context` - Load current project context and localhost status

#### **Dev Agent Commands:**
- `*component-create` - Create new React component using shadcn/ui patterns
- `*page-create` - Create new Next.js page following established patterns  
- `*drill-component` - Work specifically with practice planner components
- `*test-component` - Run React component tests with Playwright
- `*supabase-integration` - Implement Supabase client, hooks, and database patterns
- `*wordpress-sync` - Handle WordPress authentication and user synchronization
- `*data-hooks` - Create or modify React data fetching hooks
- `*auth-system` - Work with dual authentication system
- `*api-patterns` - Implement or modify API integration patterns

#### **Architect Commands:**
- `*drill-system-architecture` - Design practice planner component architecture
- `*lacrosse-system-design` - Apply lacrosse domain knowledge to system architecture
- `*practice-workflow-architecture` - Design coach workflow systems
- `*gamification-architecture` - Design badge, point, and ranking system architecture
- `*age-appropriate-architecture` - Apply age band framework to system design

#### **UX Expert Commands:**
- `*design-drill-component` - Design drill-related UI components
- `*age-appropriate-ui` - Create age-band specific interfaces
- `*coach-workflow` - Design coach-focused user experiences
- `*mobile-practice-ui` - Design field-optimized mobile interfaces

### Debugging Agent Issues

#### **When Components Don't Load:**
1. **Check with dev (James)**: Is user properly authenticated? Are data hooks working?
2. **Check with architect (Winston)**: Is route properly wrapped in authenticated layout?
3. **Reference C4A**: Are all imports using correct relative/absolute paths?
4. **Check with qa (Quinn)**: Are there any linting or testing errors?

#### **When Data Doesn't Display:**
1. **Check with dev (James)**: Review test-supabase page for connection status and data hook implementation
2. **Reference C4A**: Check v3-supabase-tables-list.md for correct field names
3. **Check with architect (Winston)**: Ensure component architecture and data flow design is correct
4. **Check with qa (Quinn)**: Validate data integration testing

#### **When UX Doesn't Match Requirements:**
1. **Check with ux-expert (Sally)**: Are age bands and lacrosse workflows properly applied?
2. **Check with architect (Winston)**: Does system design match lacrosse coaching workflow requirements?
3. **Reference C4A**: Are mobile-first principles being followed?
4. **Check with dev (James)**: Are shadcn/ui patterns consistently implemented?

---

## 📊 Agent Task Status Reporting

### **Mandatory Status Updates**
**All agents MUST include status updates in the following format when working on any task:**

#### **Status Format Requirements:**
```
[Acknowledged - "Short sentence confirming it has been put into their task list."]
[In Progress - "Short sentence about what comes next."]
[Complete - "Short sentence about what they changed."]
```

#### **Status Update Guidelines:**
1. **Acknowledged Status**: 
   - Use when first receiving a task
   - Confirm understanding and add to task queue
   - Example: `[Acknowledged - "Added practice planner modal enhancement to task list."]`

2. **In Progress Status**:
   - Use when actively working on a task
   - Describe the next immediate action
   - Example: `[In Progress - "Implementing DrillCard modal integration, adding VideoModal component next."]`

3. **Complete Status**:
   - Use when finishing a task or subtask
   - Briefly describe what was accomplished
   - Example: `[Complete - "VideoModal component integrated with DrillCard, tested with 3 sample videos."]`

#### **Task File Organization:**
- **Regular tasks must be created in `/tasks/` folder**
- **Regular task naming convention**: `YYYY-MM-DD-agent-name-task-description.md`
- **Example**: `2025-01-15-dev-drill-card-modal-enhancement.md`

#### **C4A Instruction File Organization:**
- **C4A instruction files for agents** (prompts, specialized instructions, research tasks)
- **C4A file naming convention**: `C4A - Agent Name/s - Date - Task.md`
- **Examples**: 
  - `C4A - Analyst - 2025-01-15 - Gamification Research.md`
  - `C4A - Dev Architect - 2025-01-15 - Practice Planner Enhancement.md`
  - `C4A - UX Expert - 2025-01-15 - Age Appropriate Interface Design.md`

#### **Status Update Frequency:**
- **Every message** when working on assigned tasks
- **At handoff points** between agents
- **When requesting help or clarification**
- **Before ending work session**

#### **Multi-Agent Task Coordination:**
When multiple agents work on related tasks:
1. **Reference related task files** in status updates
2. **Cross-reference progress** in related tasks
3. **Update dependent agents** on completion status

**Example Multi-Agent Status:**
```
[In Progress - "Implementing Supabase drill hooks, architect's gamification-schema.md task dependency met."]
```

---

**Remember**: This framework provides structure and reference points. Always examine the specific files mentioned to understand the current implementation before making changes. Use the agent coordination guidelines to ensure smooth collaboration and consistent POWLAX domain expertise across all development work.