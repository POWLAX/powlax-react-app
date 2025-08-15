# POWLAX - Modern Lacrosse Training Platform

## 🚨 CRITICAL: NO MOCK DATA POLICY - PRODUCTION READY MVP

**ABSOLUTELY NO HARDCODED MOCK DATA ALLOWED!**

### Data Integrity Requirements:
- ❌ **NO** hardcoded users, teams, or clubs in the codebase
- ❌ **NO** fake external associations or connections
- ❌ **NO** returning mock data from hooks or components
- ✅ **ONLY** real data from actual database tables
- ✅ **IF NEEDED**: Use "(MOCK)" prefix/suffix in actual Supabase tables
- ✅ **REAL FLOW**: Supabase → Frontend (self-contained system)

### Why This Matters:
Mock data creates false positives that destroy production readiness. We need to see actual data flow to trust what's working.

---

## 🚨 BRANCH-SPECIFIC REQUIREMENTS

**Claude-to-Claude-Sub-Agent-Work-Flow Branch**: This branch must be run exclusively on port 3002 to avoid conflicts with other development branches.

```bash
npm run dev -- -p 3002
```

## 🤖 AI Assistant Users - START HERE

**CRITICAL**: If you're using ChatGPT, Cursor, GitHub Copilot, Claude Code, or any AI assistant:

1. **Read First**: [AI_FRAMEWORK_ERROR_PREVENTION.md](./AI_FRAMEWORK_ERROR_PREVENTION.md)
2. **Project Guide**: [CLAUDE.md](./CLAUDE.md)  
3. **Quick Start**: [AI_INIT_PROMPT.md](./AI_INIT_PROMPT.md)

### For Claude Code Users
- **Supabase MCP Integration**: Direct database access configured (see below)
- `.claude.json` contains MCP server configuration
- Use `CLAUDE.md` for project-specific instructions

### For Cursor Users
- `.cursorrules` file is configured with project rules
- Use `@AI_FRAMEWORK_ERROR_PREVENTION.md` to reference guidelines

### For GitHub Copilot Users
- Check `.github/copilot-instructions.md` for patterns

### Quick Validation
```bash
npm run lint  # Run this before AND after AI changes
```

## 🔌 Claude Code MCP (Model Context Protocol) Integration

### Direct Database Access
Claude Code has been configured with direct Supabase database access via MCP, eliminating reliance on potentially outdated migration files or documentation.

**Benefits:**
- Live schema inspection - see actual table structures in real-time
- Direct SQL queries - verify data and relationships
- No sync issues - always working with current database state
- Faster development - no guessing about table names or structures

**Configuration:**
```bash
# MCP server configured for POWLAX Supabase database
claude mcp add supabase -- npx -y @bytebase/dbhub \
--dsn "postgresql://postgres:[PASSWORD]@db.avvpyjwytcmtoiyrbibb.supabase.co:5432/postgres?sslmode=require"
```

**Usage:** When using Claude Code, it can directly query your database to:
- Verify table existence before writing queries
- Check column names and types
- Understand relationships and constraints
- Test queries before implementing them in code

**Fallback:** If MCP is unavailable, use: `npx tsx scripts/check-actual-tables.ts`

## Overview
POWLAX is a comprehensive lacrosse training ecosystem built on modern React/Next.js with Supabase backend. The platform features a complete Skills Academy system with 49 workout series, 166 workouts, and 167 drills, plus integrated team management, practice planning, and gamification systems. All data is stored in a robust 62-table PostgreSQL database providing real-time performance and scalability.

## 🏑 Key Features

### For Coaches
- **Strategic Practice Planner**: 
  - Drag-and-drop interface using `practices` and `practice_drills` tables
  - Access to `powlax_drills` and `powlax_strategies` libraries
  - Custom drill creation with `user_drills` and `user_strategies`
  - Age-appropriate filtering and drill modifications
  - Practice timing and sequencing tools
  - Save as template functionality
  - Live practice mode with timer
- **Team Management**: 
  - Roster tracking, player assessments, progress monitoring
  - Calendar integration (Google Calendar) for easy scheduling
- **Team Playbook**:
  - Mix POWLAX content with custom plays
  - External video links (HUDL, Vimeo, YouTube)
  - Lacrosse Lab diagram integration
- **Coaching Resources**: Master classes, video library, printable materials
- **Analytics Dashboard**: Team performance metrics and engagement tracking
- **Professional Development**:
  - Youth Lacrosse Coaching Master Class modules
  - Strategy and drill master class content
  - Understanding checks and certifications
  - Progress tracking for coaching education

### For Players  
- **Skills Academy**: 
  - **49 workout series** with structured progressions
  - **166 individual workouts** covering all lacrosse fundamentals
  - **167 drill definitions** with video tutorials and instructions
  - **Wall Ball system** with 48 specialized drill segments
  - Progress tracking via `skills_academy_user_progress`
- **Personal Progress Tracking**: 
  - Achievement system with `user_badges` and `user_points_wallets`
  - Point currencies: Multiple types via `powlax_points_currencies`
  - Ranking system with `powlax_player_ranks` and progression tracking
- **Team Integration**: 
  - Access to team practices via `team_members` relationship
  - Family account support through `family_accounts` system

### For Parents
- **Child Progress Monitoring**: View achievements via `family_accounts` and `parent_child_relationships`
- **Skills Academy Access**: Monitor workout completion and drill progress
- **Team Integration**: Access team information through family account system
- **Progress Analytics**: Track skill development and achievement milestones

### For Club Directors
- **Multi-Team Overview**: Manage multiple teams via `clubs` → `teams` hierarchy
- **Member Management**: Full roster control through `team_members` system
- **Resource Distribution**: Centralized access to Skills Academy and practice content
- **Analytics Dashboard**: Club-wide performance metrics and engagement tracking

## 🚀 Technical Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage for media files
- **Deployment**: Vercel (recommended)

## 📊 Database Architecture (ACTUAL)

**🚨 CRITICAL: This reflects the REAL database schema. See `/contracts/active/database-truth-sync-002.yaml` for complete verification.**

### Active Database Tables (62 Total)

The platform operates on a modern Supabase PostgreSQL database with 62 active tables organized into functional domains:

#### ✅ Skills Academy System (WORKING)
- **skills_academy_series** (49 records) - Workout series definitions including Wall Ball series
- **skills_academy_workouts** (166 records) - Workout definitions with `drill_ids` column linking to drills
- **skills_academy_drills** (167 records) - Individual drill definitions with video URLs and instructions
- **skills_academy_user_progress** (3 records) - User progress tracking through workouts
- **wall_ball_drill_library** (48 records) - Bite-sized segments of wall ball workout videos

#### 🏑 Practice Planning System
- **powlax_drills** - Main POWLAX drill library (NOT `drills`)
- **powlax_strategies** - Strategy library (NOT `strategies`)
- **practices** - Practice plans (NOT `practice_plans`)
- **practice_drills** - Drill instances with notes and timing modifications
- **powlax_images** - Drill media and visual assets
- **user_drills** - User-created custom drills
- **user_strategies** - User-created custom strategies

#### 👥 Team & Organization Management
- **clubs** (2 records) - Organization level above teams (NOT `organizations`)
- **teams** (10 records) - Team entities with coaching assignments
- **team_members** (25 records) - Team membership and roster management
- **family_accounts** (1 record) - Family account management
- **family_members** - Family member relationships
- **parent_child_relationships** - Parent-child user links

#### 👥 User Management
- **users** - Main user table with basic user information
- **user_onboarding** - Step-by-step onboarding flow

#### 🎮 Gamification System
- **user_points_wallets** - User point balances per currency type
- **user_badges** - User badge awards (NOT `badges`)
- **powlax_points_currencies** - Point currency definitions
- **points_transactions_powlax** - Point transaction history (NOT `points_ledger`)
- **powlax_player_ranks** - Player ranking system definitions
- **user_badge_progress_powlax** - Badge progress tracking
- **user_rank_progress_powlax** - Rank progression tracking
- **point_types_powlax** - Point currency type definitions
- **leaderboard** - Leaderboard rankings and competition data

#### 🔗 Integration & Webhooks
- **webhook_queue** - Webhook processing queue with retry logic
- **webhook_events** - Complete audit trail of webhook events
- **membership_products** - Membership product definitions
- **membership_entitlements** - User access rights and permissions
- **user_subscriptions** - Subscription data and status

### Key System Relationships

#### Skills Academy Data Flow
```
skills_academy_series (49) 
    ↓
skills_academy_workouts (166) [drill_ids column]
    ↓
skills_academy_drills (167) [referenced by drill_ids]

wall_ball_drill_library (48) [integrated segments]
```

#### Practice Planning Structure
```
practices [main practice plans]
    ↓
practice_drills [instances with modifications]
    ↓
powlax_drills / user_drills [drill definitions]
powlax_strategies / user_strategies [strategy definitions]
```

#### Team Hierarchy
```
clubs (2) [organization level]
    ↓
teams (10) [team entities]
    ↓
team_members (25) [roster management]
    ↓
users [individual user accounts]
```

### 🚨 IMPORTANT: Tables That DO NOT EXIST

**NEVER reference these non-existent tables:**
- `drills`, `strategies`, `concepts`, `skills` (without powlax_ prefix)
- `practice_plans` (use `practices`)
- `user_profiles` (use `users`)
- `organizations` (use `clubs`)
- `badges` (use `user_badges`)
- `points_ledger` (use `points_transactions_powlax`)
- `skills_academy_workout_drills` (use `drill_ids` column)
- `quizzes`, `quiz_questions`, `quiz_responses` (do not exist)
- Any complex taxonomy tables (concepts, skills hierarchies)

### Data Integration Status

- ✅ **Skills Academy**: Fully operational with 49 series, 166 workouts, 167 drills
- ✅ **Wall Ball**: Integrated as part of Skills Academy (48 drill segments)
- ✅ **Teams**: Active with 2 clubs, 10 teams, 25 members
- ✅ **Authentication**: Supabase Auth + custom users table + magic links
- 🔄 **Practice Planning**: Tables ready, integration in progress
- 🔄 **Gamification**: Tables created, point system activation pending
- 🔄 **Family Accounts**: Structure ready, full implementation pending

## 🚀 Current Implementation Status

### ✅ Fully Operational Systems

#### Skills Academy (Complete)
- **49 workout series** covering all lacrosse fundamentals
- **166 individual workouts** with structured progressions
- **167 drill definitions** with video tutorials and instructions
- **Wall Ball integration** with 48 specialized drill segments
- **User progress tracking** system operational
- **Series-to-workout-to-drill** relationships via `drill_ids` column

#### Team Management (Active)
- **2 clubs** with organizational structure
- **10 teams** with coaching assignments
- **25 team members** with roster management
- **Family account system** supporting parent-child relationships

#### User System (Live)
- **User management** with basic user profiles
- **Onboarding system** for new users

### 🔄 Systems in Development

#### Practice Planning System
- **Database ready**: `practices`, `practice_drills`, `powlax_drills`, `powlax_strategies`
- **UI components**: Practice planner interface operational
- **Integration pending**: Connecting UI to actual database tables

#### Gamification System
- **Tables created**: Point wallets, badges, rankings, transactions
- **Structure ready**: Currency types, player ranks, leaderboard
- **Activation needed**: Connect to Skills Academy progress system

#### Family Account Management
- **Database schema**: Family accounts, member relationships established
- **Parent-child links**: Relationship structure operational
- **UI implementation**: Family dashboard and controls pending

### 📈 Development Priorities

1. **Practice Planner Integration**: Connect existing UI to `powlax_drills` and `powlax_strategies` tables
2. **Gamification Activation**: Link Skills Academy progress to point system
3. **Team Dashboard Enhancement**: Full team management interface
4. **Family Account UI**: Parent oversight and child management features
5. **Advanced Skills Academy**: Add quiz system and certification tracking

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/powlax-react.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## 🏗️ Current Implementation Status

### ✅ Completed Features (MVP Practice Planner)
- **Navigation**: Mobile-first bottom navigation + desktop sidebar
- **Practice Planner Core**:
  - Practice schedule with date/time/field selection
  - Auto-time calculations (all drills update when start time changes)
  - Setup time feature with arrival time display
  - Duration progress bar (blue→green→red)
  - Drill cards with editable duration and notes
  - Icon-based modals (video, lab, links, images, strategies)
  - Move up/down drill ordering
  - Drill library with categories and search
  - Favorites system with star icons
  - Mobile-optimized with floating action button

### 🔄 Active Development Areas
- **Gamification Integration**: Connecting Skills Academy progress to point rewards
- **Practice Planner Database**: Linking UI components to `powlax_drills` and `powlax_strategies`  
- **Team Management Enhancement**: Full roster and family account management
- **Advanced Skills Academy**: Quiz system and progress certifications
- **Mobile Optimization**: Enhanced mobile experience for all systems

### 📁 Key Implementation Files

#### Skills Academy System
- `/src/app/(authenticated)/skills-academy/` - Skills Academy pages
- `/src/components/skills-academy/` - Workout and drill components
- `/src/hooks/useSkillsAcademy.ts` - Skills Academy data hooks

#### Practice Planning System  
- `/src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx` - Main practice planner
- `/src/components/practice-planner/` - All planner components
- `/src/hooks/usePracticePlans.ts` - Practice data management

#### Database Integration
- `/src/lib/supabase.ts` - Client-side database connection
- `/src/lib/supabase-server.ts` - Server-side database operations
- `/src/types/database.ts` - TypeScript definitions for all 62 tables

#### User System
- `/src/contexts/SupabaseAuthContext.tsx` - User context provider

### 📊 Database Verification Scripts
- `/scripts/check-actual-tables.ts` - Verify all 62 tables exist
- `/scripts/check-skills-academy-data.ts` - Validate Skills Academy connections
- `/scripts/check-gamification-tables.ts` - Verify gamification system
- `/contracts/active/database-truth-sync-002.yaml` - Complete database truth reference