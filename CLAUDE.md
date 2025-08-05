# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- Use agent-based development approach (see /docs/agent-specifications/)
- Follow A4CC Standards for AI-assisted development
- Implement features in phases as documented in /docs/implementation-phases/
- Reference /tasks/ directory for current sprint planning

### Testing Strategy
- E2E tests cover critical user journeys
- Test on multiple devices (Desktop, Mobile, iPad)
- Screenshots and traces captured on failures
- Run tests before pushing major changes

### WordPress Migration
- Legacy data exported as CSVs in /csv-exports/
- Import scripts transform WordPress data to Supabase schema
- Maintain backward compatibility during transition period