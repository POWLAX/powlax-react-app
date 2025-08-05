# POWLAX Project Context for BMad Agents

**IMPORTANT**: All agents should load this file on activation to maintain consistent project understanding.

---

## Quick Project Overview

POWLAX is a mobile-first platform transforming youth lacrosse by solving the fundamental problem: players arrive at practice unprepared, making drills frustrating for everyone. We create a positive feedback loop where players improve at home through our Skills Academy, arrive ready for practice, and coaches can run engaging team-focused sessions.

**Core Philosophy**: "Lacrosse is fun when you're good at it." We make players good at it.

**Current Phase**: Building MVP with focus on Practice Planner and initial Skills Academy features.

---

## Key Concepts Every Agent Must Know

### 1. The Age Bands Framework ("Do it, Coach it, Own it")
- **Do it (ages 8-10)**: Players simply execute without complex instruction
- **Coach it (ages 11-14)**: Concepts appropriate for teaching at this cognitive level
- **Own it (ages 15+)**: Advanced ideas learned through gameplay experience

This framework prevents coaches from teaching concepts beyond players' mental development.

### 2. Core Features
1. **Skills Academy**: Individual skill development system with badges
2. **Practice Planner**: 15-minute planning with strategy-based drill filtering
3. **Team HQ**: Playbook management and communication hub
4. **Badge System**: Gamification across 6 categories (Attack, Defense, Midfield, Wall Ball, Lacrosse IQ, Team Player)

### 3. User Personas
- **Players**: Need clear paths to improve and have fun
- **Coaches**: Need quick planning and age-appropriate activities
- **Parents**: Need ways to support without being "that parent"
- **Directors**: Need program-wide consistency and retention

---

## Technical Architecture Overview

### Stack
- **Frontend**: Next.js 14.2.5, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: React hooks + Context API
- **Video**: Vimeo integration for drill demonstrations

### Key Technical Decisions
1. **Mobile-First PWA**: Must work perfectly on phones
2. **Offline Capability**: Core features work without internet
3. **Real-time Collaboration**: Multiple coaches can plan together
4. **Performance Target**: <3 second load times

---

## Current Development Status

### Completed ✅
- Basic project structure and UI components
- Supabase integration setup
- Initial practice planner UI
- CSV data import infrastructure
- Mobile-responsive design system

### In Progress 🚧
- Track A: Data Integration (importing WordPress CSVs)
- Track B: UI/UX Fixes (modal functionality, drill filtering)
- Drill→Strategy relationship mapping
- Badge system implementation

### Upcoming 📋
- Skills Academy workout builder
- Team HQ features
- Parent communication templates
- Analytics dashboard

---

## Important File Locations

### Documentation
- `/docs/requirements/POWLAX_MASTER_REQUIREMENTS.md` - Complete requirements
- `/docs/brief.md` - Original project brief
- `/TRACK_A_PROGRESS.md` - Data integration progress
- `/TRACK_B_PROGRESS.md` - UI/UX progress

### Source Code
- `/src/components/practice-planner/` - Main app components
- `/src/hooks/` - React hooks (useSupabaseDrills, etc.)
- `/src/lib/` - Utilities and Supabase client
- `/supabase/migrations/` - Database schema

### Data
- `/docs/Wordpress CSV's/` - Source data for import
- `/scripts/import-csv-to-supabase.ts` - Import script

---

## Key Terminology

### POWLAX-Specific
- **Skills Academy**: Individual development system
- **Badge**: Achievement marking skill milestone
- **Team HQ**: Coach's command center
- **Game States**: Drill categorization (e.g., "pp-settled-offense")

### Lacrosse Terms
- **Settled**: 6v6 organized play
- **Transition**: Fast break situations
- **Clearing**: Moving ball from defense to offense
- **Ground Ball**: Loose ball recovery

---

## Communication Standards

1. **Always sign messages** with "- [Agent Name]"
2. **Reference file locations** using format: `file_path:line_number`
3. **Use consistent terminology** from this document
4. **Check requirements** before implementing features
5. **Update progress tracking** (TodoWrite tool) regularly

---

## Current Priorities

1. **Get data imported** from WordPress CSVs
2. **Connect drills to strategies** for intelligent filtering
3. **Fix UI/UX issues** (especially mobile modals)
4. **Launch practice planner** as primary hook
5. **Build Skills Academy** as the retention driver

---

## Questions? Need Context?

- Check `/docs/requirements/POWLAX_MASTER_REQUIREMENTS.md` for detailed requirements
- Review `/docs/technical/` folder for architecture decisions
- Ask BMad Orchestrator for clarification or agent switching

---

*Last Updated: 2025-08-04*