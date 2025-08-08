# POWLAX - Modern Lacrosse Training Platform

## 🤖 AI Assistant Users - START HERE

**CRITICAL**: If you're using ChatGPT, Cursor, GitHub Copilot, or any AI assistant:

1. **Read First**: [AI_FRAMEWORK_ERROR_PREVENTION.md](./AI_FRAMEWORK_ERROR_PREVENTION.md)
2. **Project Guide**: [CLAUDE.md](./CLAUDE.md)  
3. **Quick Start**: [AI_INIT_PROMPT.md](./AI_INIT_PROMPT.md)

### For Cursor Users
- `.cursorrules` file is configured with project rules
- Use `@AI_FRAMEWORK_ERROR_PREVENTION.md` to reference guidelines

### For GitHub Copilot Users
- Check `.github/copilot-instructions.md` for patterns

### Quick Validation
```bash
npm run lint  # Run this before AND after AI changes
```

## Overview
POWLAX is a comprehensive lacrosse training ecosystem designed to revolutionize how coaches plan practices, how players develop skills, and how clubs manage their programs. This React-based platform is the evolution of a successful WordPress plugin system with integrations from BuddyBoss, LearnDash, and GamiPress, bringing modern performance and enhanced strategic depth to lacrosse training.

## 🏑 Key Features

### For Coaches
- **Strategic Practice Planner**: 
  - Click to add / drag-and-drop interface with bidirectional linking:
    - drills → strategies → concepts → skills
    - skills → concepts → strategies → drills
  - Strategy, Drill Type, Game Phase, and Age-appropriate filtering
  - Create custom drills, concepts, skills, and strategies
  - Submit finalized practices for team visibility
  - PDF printables for strategies, drills, concepts, and skills (Currently accessible through URL links guarded by Memberpress rules)
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
  - Structured skill development with video tutorials
  - Two tiers: Basic (5 workouts) and Complete (all content)
- **Challenge Mode**:
  - Skill challenges after workouts (game-relevant tasks)
  - Lacrosse tricks for fun and coordination (always available)
- **Personal Progress Tracking**: 
  - Skill assessments and achievement system
  - Gamification points: Lax Credits, Lax IQ points, Rebound Rewards, Defense Dollars, Midfield Medals, Attack Tokens
- **Team Integration**: 
  - Access to team practices and playbooks
  - Understanding checks for playbook knowledge
  - Badge system for achievements

### For Parents
- **Child Progress Monitoring**: View achievements and skill development
- **Support Resources**: "Support My Player" quiz with personalized tips
- **Event Calendar**: Team schedules and important dates
- **Secure Communication**: Age-appropriate messaging controls

### For Club Directors
- **Multi-Team Overview**: Club-wide analytics and metrics
- **Resource Management**: Centralized content distribution
- **Registration Tools**: Team activation and member management
- **Coach Assessment Creation**: Build understanding checks for coaches

## 🚀 Technical Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with custom roles
- **Storage**: Supabase Storage for media files
- **Deployment**: Vercel (recommended)

## 📊 Database Architecture

### Sophisticated Taxonomy System
The platform uses a comprehensive data model that captures the relationships between:

1. **Drills** ↔ **Strategies** ↔ **Concepts** ↔ **Skills**
2. **Player Situations** (5 universal scenarios with phase-specific variations)
3. **Game Phases** (Face Off, Transition, Settled Offense/Defense, Special Teams)
4. **Age-Based Progression**: Overlapping developmental ranges where skills progress from introduction (do_it: 6-10), through competitive application (coach_it: 8-12), to mastery (own_it: 10-14)

### Key Tables
- `drills`: Core drill library with video URLs, Lacrosse Lab diagrams, image carousels, PDF links
- `academy_drills`: Skill-focused training content
- `strategies`: Phase-specific game plans:
  - Face Off
  - Transition Offense
  - Transition Defense  
  - Settled Offense
  - Settled Defense
  - Man Up
  - Man Down
  - Ride
  - Clear
- `concepts`: Teaching points that can span multiple phases
- `skills`: Granular player abilities
- `player_situations`: 5 core situations with phase-based variations
- `user_profiles`: Extended user data with family relationships
- `teams`: Organization and roster management (replaces BuddyBoss Groups)
- `quizzes`: Understanding checks for strategies, drills, and master classes
- `quiz_questions`: Question bank with multiple choice/true-false options
- `quiz_responses`: Track player and coach quiz attempts
- `coach_certifications`: Track coach education progress and achievements
- `master_class_modules`: Youth Lacrosse Coaching Master Class content structure

### Complete Schema Tables (33 Total)

#### Core Content (4 tables)
- `drills`: Team practice drills with 30+ fields including video URLs, Lacrosse Lab diagrams (5 URLs), age progressions, skill/concept/strategy associations
- `academy_drills`: Skills Academy individual training with workout categories, skill mastery focus, understanding checks, and age-based progressions
- `strategies`: Phase-specific game plans with execution steps, diagrams, counter-strategies, and practice requirements
- `concepts`: Teaching concepts with visual aids, assessment criteria, and age-appropriate progressions

#### Taxonomy Foundation (7 tables)
- `lacrosse_terms`: Universal terminology dictionary
- `game_phases`: 9 distinct phases (Face Off, Transition Offense/Defense, Settled Offense/Defense, Man Up/Down, Ride, Clear)
- `skills`: 100+ skills with meta-skill hierarchy and movement patterns
- `player_situations`: 5 universal scenarios with decision trees
- `communication_terms`: On-field calls with urgency levels
- `movement_principles`: Biomechanical patterns with coaching cues
- `term_variations`: Context-specific terminology by game phase

#### Relationships & Progressions (5 tables)
- `skill_phase_applications`: How skills adapt across game phases
- `skill_development_stages`: Age-based progressions (do_it/coach_it/own_it)
- `phase_situation_scenarios`: Common game scenarios mapped to phases
- `skill_progression_pathways`: Logical skill learning sequences
- `situation_skill_options`: Available skills for specific field contexts

#### Team & User Management (5 tables)
- `user_profiles`: Extended profiles with parent-child relationships
- `teams`: Full team management replacing BuddyBoss
- `practice_plans`: Practice builder with drill sequences and templates
- `workouts`: Skills Academy structured workouts
- `age_bands`: 8U through 18U definitions

#### Analytics & Gamification (3 tables)
- `user_progress`: Comprehensive tracking with skill mastery levels
- `points_ledger`: 6 point types (Lax Credits, Attack Tokens, Defense Dollars, Midfield Medals, Flex Points, Rebound Rewards)
- `badges` & `user_badges`: Achievement system

#### Quiz & Certification System (9 tables)
- `master_class_modules`: Youth Lacrosse Coaching Master Class content
- `quizzes`: Understanding checks for strategies, drills, and modules
- `quiz_questions`: Media-rich questions with explanations
- `quiz_responses`: Detailed attempt tracking
- `coach_certifications`: Professional development tracking
- Plus supporting tables for prerequisites and requirements

## 📋 Existing Development Plans

### Phase-Based Implementation Strategy
Following 8 hours of intensive brainstorming, the project has three detailed phase plans:

- **Phase 1**: Core System & Practice Planner (see `[stage1-implementation.md]`)
  - Enhanced practice planning with strategic depth
  - Drill-Strategy-Concept-Skill relationships
  - Core user management
  
- **Phase 2**: Skills Academy & Gamification (see `[stage2-implementation.md]`)
  - LearnDash migration to modern React
  - 6-tier gamification system
  - Progress tracking and achievements
  
- **Phase 3**: Team Management & Community (see `[stage3-implementation.md]`)
  - BuddyBoss replacement
  - Advanced registration system
  - Community features

These plans provide the strategic foundation but will be validated and enhanced through the BMad method's systematic approach to ensure nothing is missed and all components integrate properly.

### Next Steps
1. Use BMad Analyst to validate existing plans
2. Create formal BMad documentation structure
3. Generate PRD incorporating all phase elements
4. Begin systematic implementation

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
- **Authentication System**: Login page with Supabase Auth integration
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

### 🚧 In Progress
- Modal implementations for video/lab/strategies
- Parallel drills (up to 4 concurrent activities)
- Supabase data integration
- Practice plan saving/loading

### 📁 Key Files
- `/src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx` - Main practice planner
- `/src/components/practice-planner/` - All planner components
- `/docs/technical/practice-planner-implementation-status.md` - Detailed implementation guide