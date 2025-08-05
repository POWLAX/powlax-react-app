# POWLAX Community Group Structure & Data Architecture

## Overview

This document outlines the hierarchical structure of POWLAX community groups, their relationships, and the data synchronization strategy between WordPress/BuddyBoss and the React application.

## Community Group Types

### 1. Club OS (Top Level - Organization)
**Purpose**: Unified system for entire lacrosse programs/clubs  
**WordPress Type**: BuddyBoss Group with special designation  
**Key Features**:
- Manages multiple teams under one organization
- Club-wide settings and branding
- Centralized billing and administration
- Cross-team analytics and leaderboards

**Tiers Identified**:
- **Club OS Foundation** ($897 for 3 teams minimum)
- **Club OS Growth** ($1,497)
- **Club OS Command** ($5,997)

### 2. Club Team OS (Mid Level - Multi-Team Organization)
**Purpose**: Parent container for related teams within a club  
**WordPress Type**: BuddyBoss Group with parent-child relationships  
**Key Features**:
- Groups related teams (e.g., all boys teams, all grade levels)
- Shared resources across subset of teams
- Sub-organization within larger Club OS

### 3. Team HQ (Team Level)
**Purpose**: Individual team management hub  
**WordPress Type**: LearnDash Group / BuddyBoss Group  
**Key Features**:
- Practice planning and playbooks
- Team-specific rosters and communications
- Individual team gamification
- Direct coach-player-parent interactions

**Variants Identified**:
- Single Team HQ (standalone teams)
- Team HQ Structure ($349/year)
- Team HQ Leadership ($599/year)
- Team HQ Activated ($2,499/year)

## Hierarchical Structure

```
Club OS (Organization)
├── Club Team OS (Boys Program)
│   ├── Your Varsity Team HQ
│   ├── Your JV Team HQ
│   └── Your 8th Grade Team HQ
├── Club Team OS (Girls Program)
│   ├── Girls Varsity Team HQ
│   ├── Girls JV Team HQ
│   └── Girls 8th Grade Team HQ
└── Club Team OS (Youth Program)
    ├── U14 Team HQ
    ├── U12 Team HQ
    └── U10 Team HQ
```

## Specific Groups Found in WordPress Data

### From Teams Export (Teams-Export-2025-July-31-1922.csv):

1. **Cedar Reds Lacrosse Group**
   - Type: Team HQ
   - Status: Published
   - Users: Multiple user IDs in learndash_group_users array

2. **Your Club OS**
   - Type: Club OS (Organization level)
   - Status: Draft
   - Description: "This is the TEAM for the POWLAX Lacrosse Club"

3. **Your 8th Grade Team HQ**
   - Type: Team HQ
   - Status: Published
   - Parent: Implied Club Team OS

4. **Your JV Team HQ**
   - Type: Team HQ
   - Status: Published
   - Parent: Implied Club Team OS

5. **Your Varsity Team HQ**
   - Type: Team HQ
   - Status: Published
   - Parent: Implied Club Team OS

## Database Schema Design

### Organizations Table (Club OS Level)
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wp_group_id INTEGER UNIQUE, -- BuddyBoss Group ID
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('club_os', 'club_team_os')),
  parent_org_id UUID REFERENCES organizations(id),
  tier TEXT CHECK (tier IN ('foundation', 'growth', 'command')),
  settings JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Teams Table (Team HQ Level)
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  wp_group_id INTEGER UNIQUE, -- LearnDash Group ID
  wp_buddyboss_group_id INTEGER, -- BuddyBoss Group ID
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  team_type TEXT CHECK (team_type IN ('single_team_hq', 'team_hq')),
  subscription_tier TEXT CHECK (subscription_tier IN ('structure', 'leadership', 'activated')),
  age_group TEXT,
  gender TEXT CHECK (gender IN ('boys', 'girls', 'mixed')),
  level TEXT CHECK (level IN ('varsity', 'jv', 'freshman', 'youth')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### User-Organization-Team Relationships
```sql
CREATE TABLE user_organization_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  role TEXT CHECK (role IN ('owner', 'admin', 'director')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_team_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  team_id UUID REFERENCES teams(id),
  role TEXT CHECK (role IN ('head_coach', 'assistant_coach', 'team_admin', 'player', 'parent')),
  jersey_number TEXT,
  position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Data Synchronization Strategy

### What Syncs from WordPress (Read-Only)

1. **Organization/Team Structure**
   - BuddyBoss group hierarchies → Organizations table
   - LearnDash groups → Teams table
   - Group metadata → Settings JSONB

2. **User Assignments**
   - learndash_group_users_* → user_team_roles
   - BuddyBoss group members → user_organization_roles
   - WordPress user roles → role mappings

3. **Subscription Status**
   - MemberPress subscriptions → subscription_tier
   - Group price types → access control

### What Does NOT Sync (React App Owns)

1. **Practice Plans**
   - Created and stored only in React app
   - Never pushed back to WordPress
   - Associated with team_id

2. **Gamification Data**
   - Points, badges, progress
   - Stored in React app tables
   - Aggregated at team/organization level

3. **Playbooks & Strategies**
   - Created in React app
   - Enhanced functionality beyond WordPress
   - Version controlled in React

4. **Real-time Communications**
   - Chat, notifications
   - Handled by React app
   - No WordPress integration

### Sync Mechanism

```typescript
// One-way sync from WordPress to React
interface SyncStrategy {
  // Full sync on initial setup
  initialSync: {
    organizations: 'wp_buddyboss_groups → organizations',
    teams: 'wp_learndash_groups → teams',
    users: 'wp_users → users',
    memberships: 'wp_group_users → user_team_roles'
  },
  
  // Periodic sync (webhook or cron)
  periodicSync: {
    frequency: 'hourly',
    entities: ['new_users', 'membership_changes', 'subscription_updates']
  },
  
  // Never sync back
  neverSyncToWordPress: [
    'practice_plans',
    'gamification_data',
    'playbooks',
    'team_communications'
  ]
}
```

## Navigation Structure

For user 'powlax' (Patrick Chapla - Admin):

```
/admin/organizations
  └── /admin/organizations/[orgId]
      └── /admin/organizations/[orgId]/teams
          └── /teams/[teamId]
              ├── /teams/[teamId]/practice-plans
              ├── /teams/[teamId]/playbooks
              ├── /teams/[teamId]/roster
              └── /teams/[teamId]/hq
```

For coaches:
```
/teams/[teamId]/hq (Team HQ Dashboard)
  ├── /teams/[teamId]/practice-plans
  ├── /teams/[teamId]/playbooks
  └── /teams/[teamId]/communications
```

## WordPress User Mapping

```typescript
// Example: How 'powlax' maps to teams
const userTeamAccess = {
  username: 'powlax',
  wordpress_id: 1,
  supabase_id: 'uuid-here',
  organizations: [
    {
      id: 'club-os-uuid',
      name: 'Your Club OS',
      role: 'owner',
      teams: [
        { id: 'varsity-uuid', name: 'Your Varsity Team HQ', role: 'admin' },
        { id: 'jv-uuid', name: 'Your JV Team HQ', role: 'admin' },
        { id: '8th-uuid', name: 'Your 8th Grade Team HQ', role: 'admin' }
      ]
    }
  ]
}
```

## Implementation Priority

1. **Phase 1**: Import Organizations (Club OS)
2. **Phase 2**: Import Teams (Team HQ)
3. **Phase 3**: Map User Relationships
4. **Phase 4**: Implement Access Control
5. **Phase 5**: Build Navigation Structure

## Notes for Patrick

- The "Club Team OS" concept appears to be an intermediate grouping level not explicitly in the WordPress data but implied by the structure
- All teams marked as "closed" price type indicate controlled access
- The learndash_group_users arrays contain the actual membership data
- BuddyBoss group tabs will need custom React components to replicate