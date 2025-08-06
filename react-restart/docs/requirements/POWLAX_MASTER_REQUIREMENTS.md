# POWLAX Master Requirements Document

**Version:** 1.0  
**Last Updated:** 2025-08-04  
**Status:** Active Development

---

## Table of Contents
1. [Executive Overview](#executive-overview)
2. [Vision & Mission](#vision--mission)
3. [Core User Personas](#core-user-personas)
4. [Functional Requirements](#functional-requirements)
5. [Technical Requirements](#technical-requirements)
6. [Data Architecture](#data-architecture)
7. [Success Criteria](#success-criteria)
8. [Constraints & Dependencies](#constraints--dependencies)
9. [Glossary](#glossary)

---

## Executive Overview

POWLAX is a mobile-first platform that transforms youth lacrosse by creating a positive feedback loop: players improve at home through the Skills Academy → arrive at practice ready → coaches run engaging team sessions → everyone experiences success → motivation increases.

### The Core Problem We Solve
- **Players** arrive at practice without basic skills, making drills frustrating
- **Coaches** attempt to teach beyond players' cognitive capabilities
- **Parents** want to help but lack structured methods
- **Result**: Lacrosse becomes punishment instead of passion

### Our Solution
A comprehensive ecosystem that connects individual skill development with team practice effectiveness through age-appropriate intelligence and gamification.

---

## Vision & Mission

### Vision
"Playmakers aren't born. They're built." - Transform youth lacrosse from a source of frustration into a pathway for growth, confidence, and lasting passion.

### Mission
Empower every lacrosse player to reach their potential by providing:
- Structured skill development pathways (Skills Academy)
- Age-appropriate practice planning tools
- Clear progress tracking and motivation systems
- Connected ecosystem for players, coaches, and parents

### Core Philosophy
"Lacrosse is fun when you're good at it." - We make players good at it.

---

## Core User Personas

### 1. Players (Ages 8-18)
**Needs:**
- Clear improvement pathways
- Motivation through visible progress
- Connection between practice and game success
- Fun, engaging experiences

**Pain Points:**
- "No one passes to me"
- "Practice is boring"
- "I don't know what to work on"

### 2. Coaches
**Types:** Volunteer parents, experienced coaches, program directors

**Needs:**
- 15-minute practice planning (not 45)
- Age-appropriate drill selection
- Strategy-aligned activities
- Player development tracking

**Pain Points:**
- "Half my team can't catch"
- "I spend hours planning practices"
- "Players don't understand concepts"

### 3. Parents
**Needs:**
- Ways to support without being "that parent"
- Clear communication from coaches
- Visible progress for their investment
- Structured home practice options

**Pain Points:**
- "$3,000-$10,000 spent, kid barely plays"
- "Don't know how to help"
- "Nagging creates rebellion"

### 4. Program Directors
**Needs:**
- Program-wide consistency
- Coach training tools
- Player retention metrics
- Budget-friendly solutions

**Pain Points:**
- "Losing players to other sports"
- "Volunteer coaches need support"
- "No unified development system"

---

## Functional Requirements

### 1. Skills Academy (Core Feature)

#### 1.1 Individual Skill Development
- **Wall Ball Workouts**: 3 durations (5/10/15min) × 2 modes (coached/uncoached)
- **Position-Specific Drills**: Attack, Midfield, Defense progressions
- **Equipment-Based Filtering**: Show only drills player can do with available equipment
- **Progress Tracking**: Reps, streaks, improvement metrics

#### 1.2 Badge System
- **6 Badge Categories**: Attack, Defense, Midfield, Wall Ball, Lacrosse IQ, Team Player
- **Clear Pathways**: Specific drills → skills → badges
- **Visual Progress**: Percentage complete, next steps clear
- **Coach Integration**: "Go earn the Ground Ball Guru badge"

#### 1.3 Workout Builder
- **Smart Recommendations**: Based on position, skill level, time available
- **Custom Workouts**: Save and share combinations
- **Video Integration**: Embedded Vimeo demonstrations
- **Offline Mode**: Download workouts for field use

### 2. Practice Planner

#### 2.1 Drill Library
- **500+ Drills**: Team and individual activities
- **Strategy Filtering**: Show only drills supporting selected strategy
- **Age Intelligence**: "Do it, Coach it, Own it" framework
- **Multi-Select**: Build practice from filtered results

#### 2.2 Practice Builder
- **Drag-and-Drop Interface**: Visual timeline
- **Time Management**: Auto-calculate transitions
- **Template Library**: Common practice structures
- **Sharing**: Send to assistant coaches

#### 2.3 Game Phase Organization
- Face-off
- Transition Offense/Defense
- Settled Offense/Defense
- Clearing/Riding
- Special Teams

### 3. Team HQ

#### 3.1 Playbook Management
- **Strategy Library**: Offensive/defensive systems
- **Video Prescriptions**: Assign film study
- **Formation Diagrams**: Visual play representation
- **Progress Tracking**: Who watched what

#### 3.2 Communication Hub
- **Parent Updates**: Auto-populated templates
- **Practice Summaries**: What we worked on, why
- **Homework Assignments**: Specific badge targets
- **Schedule Integration**: Practice/game calendar

### 4. Progress Analytics

#### 4.1 Individual Metrics
- **Skill Progression**: Charts showing improvement
- **Badge Progress**: Visual achievement system
- **Workout Streaks**: Motivation through consistency
- **Comparison**: Age-group benchmarks

#### 4.2 Team Analytics
- **Skill Distribution**: Team strengths/weaknesses
- **Practice Participation**: Attendance + engagement
- **Strategy Readiness**: Which plays team can execute
- **Development Velocity**: Improvement rates

---

## Technical Requirements

### 1. Platform Requirements

#### 1.1 Client Applications
- **Mobile-First Web App**: React/Next.js PWA
- **Responsive Design**: Phone → Tablet → Desktop
- **Offline Capability**: Service workers for field use
- **Performance**: <3s load time, smooth animations

#### 1.2 Backend Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Video Hosting**: Vimeo integration
- **File Storage**: Supabase Storage for diagrams/PDFs

### 2. Key Technical Features

#### 2.1 Search & Discovery
- **Full-Text Search**: Drill names, descriptions, strategies
- **Smart Filters**: Multi-faceted filtering system
- **AI Recommendations**: Future - suggest drills based on team needs
- **Related Content**: "Players who did this also..."

#### 2.2 Real-Time Features
- **Collaborative Planning**: Multiple coaches edit together
- **Live Practice Mode**: Timer, current drill display
- **Progress Sync**: Instant badge updates
- **Notifications**: Achievement unlocks, coach assignments

#### 2.3 Data Management
- **Import System**: CSV migration from WordPress
- **Export Options**: Practice plans as PDF
- **Backup/Restore**: User data protection
- **Analytics Pipeline**: Usage tracking for insights

### 3. Integration Requirements

#### 3.1 Third-Party Services
- **Vimeo**: Video playback, bandwidth management
- **Email**: Transactional and communication
- **Payment**: Stripe for subscriptions
- **Analytics**: Usage tracking, feature adoption

#### 3.2 Future Integrations
- **Game Film**: Hudl integration
- **Team Management**: SportsEngine sync
- **Wearables**: Track practice participation
- **AI Coaching**: GPT-powered recommendations

---

## Data Architecture

### 1. Core Entities

#### 1.1 Drill Ecosystem
```
Drills (500+)
├── Team Drills (276)
├── Academy Drills (150+)
└── Wall Ball Skills (50+)

Each Drill Contains:
- Basic Info (name, duration, equipment)
- Age Bands (do_it, coach_it, own_it)
- Strategy Connections (via game_states)
- Skill Mappings
- Video Resources
```

#### 1.2 Relationship Model
```
Drill ←→ Strategy (many-to-many)
Drill ←→ Skill (many-to-many)
Drill ←→ Concept (many-to-many)
Skill ←→ Badge (many-to-one)
Player ←→ Badge (progress tracking)
```

### 2. Key Data Flows

#### 2.1 Practice Planning Flow
1. Coach selects strategy/focus
2. System filters applicable drills
3. Coach builds practice timeline
4. System calculates transitions
5. Practice plan saved/shared

#### 2.2 Skill Development Flow
1. Player selects badge target
2. System shows required drills
3. Player completes workouts
4. Progress tracked/validated
5. Badge awarded at threshold

---

## Success Criteria

### 1. User Success Metrics

#### 1.1 Coaches
- **Practice Planning Time**: 45min → 15min (66% reduction)
- **Practice Quality**: Player engagement scores >8/10
- **Feature Adoption**: 80% use strategy filtering
- **Retention**: 90% monthly active after 6 months

#### 1.2 Players
- **Skill Improvement**: Measurable progress within 30 days
- **Engagement**: 3+ workouts/week average
- **Badge Completion**: 1+ badge earned in first month
- **Retention**: 70% active after 3 months

#### 1.3 Parents
- **Communication Satisfaction**: 90% feel informed
- **Value Perception**: Clear ROI on investment
- **Support Tools**: 60% help with home practice
- **Recommendation**: 70% NPS score

### 2. Business Success Metrics

- **User Acquisition**: 1,000 teams in Year 1
- **Revenue Growth**: $2M ARR by Year 2
- **Churn Rate**: <10% annual
- **Viral Coefficient**: >1.2 (referral growth)

---

## Constraints & Dependencies

### 1. Technical Constraints
- **Mobile Performance**: Must work on 3-year-old devices
- **Offline Usage**: Core features without internet
- **Video Bandwidth**: Optimize for cellular data
- **Browser Support**: Chrome, Safari, Edge (latest 2 versions)

### 2. Business Constraints
- **Pricing Sensitivity**: <$10/player/year for teams
- **Onboarding**: <10 minutes to first value
- **Migration**: Support existing WordPress users
- **Compliance**: COPPA for under-13 users

### 3. Dependencies
- **Vimeo API**: Video playback availability
- **Supabase**: Database and auth services
- **Content**: 500+ drill videos ready
- **Partnerships**: USA Lacrosse consideration

---

## Glossary

### POWLAX-Specific Terms

**Age Bands Framework**
- **Do it (8-10)**: Players execute without complex instruction
- **Coach it (11-14)**: Concepts within teaching capability
- **Own it (15+)**: Advanced ideas learned through play

**Badge System**
- Digital achievements marking skill milestones
- 6 categories: Attack, Defense, Midfield, Wall Ball, Lacrosse IQ, Team Player

**Skills Academy**
- Core individual development system
- Structured workouts for home practice
- Position-specific progressions

**Team HQ**
- Coach's command center for team management
- Playbook + communication + prescriptions

### Lacrosse Terms

**Game Phases**
- **Settled**: 6v6 organized play
- **Transition**: Fast break opportunities
- **Clearing**: Moving ball from defense to offense
- **Riding**: Preventing the clear

**Positions**
- **Attack**: Offensive players (3)
- **Midfield**: Two-way players (3)
- **Defense**: Defensive players (3)
- **Goalie**: Protects the goal (1)

**Common Strategies**
- **Motion Offense**: Continuous movement patterns
- **Zone Defense**: Area-based defensive system
- **Man-to-Man**: Individual defensive assignments

---

*This document serves as the single source of truth for POWLAX development. All features, decisions, and implementations should align with these requirements.*