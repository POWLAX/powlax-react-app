# 🎯 **TEAMS MASTER CONTRACT - HANDOFF DOCUMENT**

*Created: 2025-01-17 | Status: IN PROGRESS | Priority: MVP CRITICAL*  
*Component Directory: `src/components/teams/`*  
*Main Pages: `src/app/(authenticated)/teams/page.tsx` & `src/app/(authenticated)/teams/[teamId]/dashboard/page.tsx`*

---

## 📊 **IMPLEMENTATION STATUS - JANUARY 17, 2025**

### **✅ COMPLETED PHASES (YOLO MODE SUCCESS)**

#### **Phase 1: Database Connection** - COMPLETE ✅
- Teams page shows 17 real teams from database
- Member counts pulled from `team_members` table
- Links use real team UUIDs
- useTeams hook properly restricts to user's teams only

#### **Phase 2: Player Stats Dashboard** - COMPLETE ✅
- PlayerStatsCard component created and integrated
- usePlayerStats hook aggregates from 4+ tables
- Real points, badges, ranks displayed
- WordPress Edit Profile integration working

#### **Phase 3: Team Playbook Integration** - COMPLETE ✅
- TeamPlaybookSection component created
- SaveToPlaybookModal integrated in practice planner
- useTeamPlaybook hook fully functional
- team_playbooks table ready (0 records but operational)

### **⚠️ CRITICAL ISSUE IDENTIFIED: HARDCODED DATA THROUGHOUT DASHBOARD**

While the main Teams list is connected, the Team Dashboard pages still contain extensive hardcoded/mock data that doesn't represent actual database content.

---

## 🚨 **PHASE 4: COMPLETE DATA REALITY IMPLEMENTATION**

### **ULTRATHINK ANALYSIS RESULTS**

#### **Components Requiring Real Data Connection:**

1. **TeamRoster Component**
   - Currently: May use mock data
   - Required: Pull from `team_members` + `users` tables
   - Show: Real names, positions, jersey numbers, roles

2. **UpcomingSchedule Component**
   - Currently: Likely hardcoded events
   - Required: Pull from `practices` table
   - Show: Real practice dates, times, durations

3. **RecentActivity Component**
   - Currently: Fake activity feed
   - Required: Aggregate from multiple tables:
     - `skills_academy_user_progress` for workout completions
     - `user_badges` for badge awards
     - `points_transactions_powlax` for point events

4. **ProgressOverview Component**
   - Currently: Mock statistics
   - Required: Real aggregated team stats:
     - Total points from `user_points_wallets`
     - Skills progress from `skills_academy_user_progress`
     - Badge counts from `user_badges`

5. **TeamHeader Component**
   - Currently: May have hardcoded values
   - Required: Real team name, member count, club name

6. **CoachQuickActions Component**
   - Currently: Generic actions
   - Required: Context-aware actions based on real data

### **DATA AUDIT PLAN**

```typescript
interface DataRealityPlan {
  phase: "4",
  title: "Complete Data Reality Implementation",
  objectives: [
    "Remove ALL hardcoded data from Team Dashboard",
    "Connect every component to real database tables",
    "Add MOCK-prefixed test data where needed",
    "Ensure Your Club OS teams show real members/data"
  ],
  
  components_to_fix: {
    TeamRoster: {
      current: "Possibly mock data",
      target: "Real team_members with user details",
      tables: ["team_members", "users"],
      priority: "CRITICAL"
    },
    UpcomingSchedule: {
      current: "Hardcoded events",
      target: "Real practices from database",
      tables: ["practices"],
      priority: "HIGH"
    },
    RecentActivity: {
      current: "Fake activity feed",
      target: "Real user activities",
      tables: ["skills_academy_user_progress", "user_badges"],
      priority: "HIGH"
    },
    ProgressOverview: {
      current: "Mock statistics",
      target: "Aggregated team stats",
      tables: ["user_points_wallets", "skills_academy_user_progress"],
      priority: "MEDIUM"
    }
  },
  
  test_teams: [
    "Your Club OS",
    "Your Varsity Team HQ",
    "Your JV Team HQ", 
    "Your 8th Grade Team HQ"
  ],
  
  validation: {
    no_hardcoded_names: true,
    no_fake_dates: true,
    no_mock_statistics: true,
    all_data_from_database: true
  }
}
```

### **IMPLEMENTATION STEPS**

#### **Step 1: Component Audit**
```bash
# Check each component for hardcoded data
grep -r "John Doe\|Sample\|Mock\|Fake\|TODO" src/components/teams/
grep -r "22\|18\|20" src/components/teams/ # Hardcoded player counts
grep -r "Spring 2025" src/components/teams/ # Hardcoded seasons
```

#### **Step 2: Database Queries Required**

```sql
-- Get real roster for a team
SELECT 
  tm.*, 
  u.first_name, 
  u.last_name, 
  u.email,
  u.player_position,
  u.wordpress_username
FROM team_members tm
JOIN users u ON tm.user_id = u.id
WHERE tm.team_id = $1
ORDER BY tm.role, u.last_name;

-- Get upcoming practices for a team
SELECT * FROM practices
WHERE team_id = $1
  AND practice_date >= CURRENT_DATE
ORDER BY practice_date, start_time
LIMIT 5;

-- Get recent activity for team members
SELECT 
  'skill_completed' as type,
  saup.completed_at as timestamp,
  u.display_name,
  saup.points_earned
FROM skills_academy_user_progress saup
JOIN users u ON saup.user_id = u.id
JOIN team_members tm ON tm.user_id = u.id
WHERE tm.team_id = $1
  AND saup.completed_at IS NOT NULL
ORDER BY saup.completed_at DESC
LIMIT 10;
```

#### **Step 3: Mock Data Strategy**

For demo purposes where real data doesn't exist yet:
```typescript
// Add to database with MOCK prefix
const mockPractice = {
  name: "MOCK - Team Practice",
  team_id: "your-varsity-team-id",
  practice_date: "2025-01-20",
  start_time: "15:30",
  duration_minutes: 90,
  coach_id: "test-coach-id"
}

// Component identifies mock data
const isMockData = (item: any) => {
  return item.name?.startsWith("MOCK") || 
         item.title?.startsWith("MOCK")
}

// Visual indicator for mock data
{isMockData(practice) && (
  <Badge variant="outline" className="ml-2">DEMO</Badge>
)}
```

#### **Step 4: Remove Hardcoded Values**

```typescript
// ❌ REMOVE THIS
const teamStats = {
  totalPlayers: 22,
  averagePoints: 1250,
  practicesCompleted: 15
}

// ✅ REPLACE WITH THIS
const teamStats = await calculateTeamStats(teamId)

async function calculateTeamStats(teamId: string) {
  const members = await getTeamMembers(teamId)
  const points = await getTeamPoints(members)
  const practices = await getTeamPractices(teamId)
  
  return {
    totalPlayers: members.length,
    averagePoints: points.total / members.length,
    practicesCompleted: practices.filter(p => p.completed).length
  }
}
```

### **VALIDATION CHECKLIST**

- [ ] TeamRoster shows real team members from database
- [ ] No hardcoded player names (John Doe, Jane Smith, etc.)
- [ ] UpcomingSchedule shows real practices or MOCK-prefixed demos
- [ ] RecentActivity shows real user progress or is removed
- [ ] ProgressOverview calculates real statistics
- [ ] TeamHeader displays actual team/club names
- [ ] All "Spring 2025" hardcoded seasons removed
- [ ] All components handle empty data gracefully
- [ ] MOCK data clearly labeled with badges/prefixes
- [ ] Your Club OS teams show their actual members

---

## 🚨🚨🚨 **ULTRATHINK CLAUSE - MANDATORY FOR ALL IMPLEMENTATIONS** 🚨🚨🚨

### **BEFORE ANY CODE IS WRITTEN - ULTRATHINK ANALYSIS REQUIRED**

**Every sub-agent MUST perform comprehensive ultrathink analysis:**
1. **Database Schema Verification** - Test ALL columns exist before assuming limitations
2. **Migration History Review** - Check all 119+ migrations for actual schema
3. **Pattern Application** - Use SUPABASE_PERMANENCE_PATTERN for all persistence
4. **Real Data Testing** - Query actual tables to verify structure
5. **Gold Standard Pattern** - Apply exact patterns from working features

**REMEMBER:** After 119+ migrations, tables often have MORE columns than expected. The problem is usually in the JavaScript/TypeScript code, not the database!

---

## 📋 **MVP SCOPE DEFINITION - USER'S EXACT REQUIREMENTS**

### **✅ FEATURES TO KEEP WORKING**
1. **Role-based dashboard routing** - Already functional
2. **Role switcher for admins** - Working per Dashboard Master Plan
3. **Basic stat cards and metrics** - Existing components work
4. **Mock data system for testing** - Keep for development

### **🎯 CRITICAL MVP FEATURES TO IMPLEMENT**

#### **1. Connect Real Data (MANDATORY)**
- **Skills Academy Progress** → `skills_academy_user_progress` table
- **Team Rosters** → `teams` and `team_members` tables  
- **Practice Schedules** → `practices` table (PRIVATE - owner view only)
- **Points Display** → `user_points_wallets` table
- **Rank Mapping** → `powlax_player_ranks` table
- **Player Card Component** - Similar to screenshot (no avatar yet)
- **EDIT PROFILE BUTTON** → Link to `https://powlax.com/members/[wordpress_username]/profile/`
  - WordPress username linked through email field

#### **2. Dynamic Team Loading (MUST BE DONE)**
- Replace hardcoded teams with database query
- Load from `teams` table with proper relationships
- Show user's actual teams based on `team_members`

#### **3. Basic Roster Management**
- **Send Invite Link** for app registration
- **Must connect to WordPress** for user creation
- Add/remove players from `team_members` table
- Role-based permissions (coach can manage, players view only)

#### **4. Player Stats Dashboard (MANDATORY FOR MVP)**
- **Skills Completed** from `skills_academy_user_progress`
- **Badges Earned** from `user_badges` table
- **Ranks Display** from rank system being implemented
- **Points Balance** from `user_points_wallets`

#### **5. Team Playbook Integration (MANDATORY FOR MVP)**
- **Coach Marking System** - Like "Favorites" but for teams
- **Strategy Collection** - Marked strategies from practice planner
- **Player Study Portal** - Direct access to team's required strategies
- **Custom Names/Notes** - Team-specific strategy adaptations
- **Study Modal Integration** - Opens StudyStrategyModal for each strategy

### **❌ FEATURES TO DEFER (NOT FOR MVP)**
- Practice schedule calendar display
- Attendance tracking
- Team communication/messaging
- Parent portal
- Team document sharing
- Event calendar integration
- WebSocket real-time updates
- Advanced analytics
- Export functionality
- Financial metrics

### **🔮 POST-MVP FEATURES**
- Advanced statistics and analytics
- Video analysis tools
- Tournament management
- Equipment tracking
- Fundraising tools

---

## 🗄️ **DATABASE INTEGRATION REQUIREMENTS**

### **PRIMARY TABLES FOR TEAMS MVP**

```sql
-- Teams Core (VERIFIED ACTUAL SCHEMA)
teams {
  id UUID PRIMARY KEY,
  club_id UUID REFERENCES clubs(id),
  name TEXT NOT NULL,
  age_group TEXT,
  season TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
}

-- Team Membership (VERIFIED)
team_members {
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES users(id),
  role TEXT, -- 'player', 'head_coach', 'assistant_coach', 'parent'
  jersey_number TEXT,
  position TEXT,
  status TEXT, -- 'active', 'inactive'
  joined_at TIMESTAMP
}

-- User Profiles (ACTUAL TABLE - NOT user_profiles!)
users {
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  roles TEXT[],
  club_id UUID,
  age_group TEXT,
  player_position TEXT,
  wordpress_username TEXT, -- For profile link
  auth_user_id UUID -- Links to Supabase Auth
}

-- Skills Academy Progress (WORKING)
skills_academy_user_progress {
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  workout_id INTEGER,
  drill_id INTEGER,
  status TEXT,
  points_earned INTEGER,
  completed_at TIMESTAMP,
  time_spent_seconds INTEGER
}

-- Gamification Tables (MANDATORY FOR MVP)
user_points_wallets {
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  currency_id TEXT,
  balance INTEGER DEFAULT 0,
  last_updated TIMESTAMP
}

user_badges {
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  badge_id TEXT,
  badge_name TEXT,
  earned_at TIMESTAMP,
  points_awarded INTEGER
}

powlax_player_ranks {
  id SERIAL PRIMARY KEY,
  rank_name TEXT,
  min_points INTEGER,
  max_points INTEGER,
  level INTEGER,
  badge_url TEXT
}

-- Clubs (Organization Level)
clubs {
  id UUID PRIMARY KEY,
  name TEXT,
  admin_ids UUID[],
  created_at TIMESTAMP
}

-- Practice Plans (PRIVATE TO OWNER)
practices {
  id UUID PRIMARY KEY,
  coach_id UUID REFERENCES users(id),
  team_id UUID REFERENCES teams(id),
  name TEXT,
  practice_date DATE,
  start_time TIME,
  duration_minutes INTEGER,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP
}

-- Team Playbooks (✅ AVAILABLE - MIGRATION COMPLETED)
team_playbooks {
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  strategy_id TEXT NOT NULL,  -- References strategy IDs
  strategy_source TEXT DEFAULT 'powlax',  -- 'powlax' or 'user'
  custom_name TEXT,  -- Team-specific name override
  team_notes TEXT,  -- Team-specific execution notes
  added_by UUID REFERENCES users(id),  -- Coach who added it
  created_at TIMESTAMP,
  updated_at TIMESTAMP
}
-- ✅ TABLE NOW EXISTS - Migration completed and ready for use
```

### **⚠️ CRITICAL: TABLES THAT DO NOT EXIST**
- ❌ `organizations` - Use `clubs` instead
- ❌ `user_profiles` - Use `users` table
- ❌ `practice_plans` - Use `practices` table
- ❌ `badges` - Use `user_badges` table
- ❌ `points_ledger` - Use `points_transactions_powlax`

---

## 🏗️ **COMPONENT ARCHITECTURE**

### **Teams List Page (`/teams/page.tsx`)**
```typescript
interface TeamsPageRequirements {
  // Data Requirements
  dataSource: 'teams table via useTeams hook',
  relationships: ['team_members', 'clubs'],
  
  // UI Components Needed
  components: {
    TeamCard: 'Display team info with player count',
    QuickActions: 'Links to key features',
    CreateTeamModal: 'For coaches/directors to create teams',
    JoinTeamModal: 'For players to join via invite code'
  },
  
  // Permissions
  permissions: {
    viewTeams: 'all authenticated users',
    createTeam: ['coach', 'director', 'admin'],
    joinTeam: ['player', 'parent'],
    manageTeam: ['coach', 'director', 'admin']
  }
}
```

### **Team Dashboard (`/teams/[teamId]/dashboard/page.tsx`)**
```typescript
interface TeamDashboardRequirements {
  // Role-Based Views
  views: {
    coach: 'Full management capabilities',
    player: 'Stats, progress, team info',
    parent: 'Child progress view (POST-MVP)',
    director: 'Overview and management'
  },
  
  // Core Components
  components: {
    TeamHeader: 'Team name, season, quick stats',
    PlayerStatsCard: 'Individual player statistics',
    TeamRoster: 'List of team members with roles',
    PointsDisplay: 'Current points and rank',
    BadgesDisplay: 'Earned badges grid',
    EditProfileButton: 'Link to WordPress profile'
  },
  
  // Data Integration
  dataHooks: {
    useTeam: 'Fetch team details',
    useTeamMembers: 'Get roster with user details',
    usePlayerStats: 'Aggregate skills/points/badges',
    usePlayerRank: 'Calculate current rank from points'
  }
}
```

### **New Components to Create**

#### **TeamPlaybookSection Component**
```typescript
interface TeamPlaybookSectionProps {
  teamId: string
  isCoach: boolean  // Show add/remove controls for coaches
}

// Features:
// - Display team's marked strategies from team_playbooks
// - Group by strategy category (game phase)
// - Custom names and team notes visible
// - Study button opens StudyStrategyModal
// - Coach can add/remove strategies
// - Players have read-only view
```

#### **PlayerStatsCard Component**
```typescript
interface PlayerStatsCardProps {
  userId: string
  teamId: string
  showEditProfile: boolean
}

// Features:
// - Points balance from user_points_wallets
// - Current rank from powlax_player_ranks
// - Badges earned from user_badges
// - Skills completed from skills_academy_user_progress
// - Edit Profile button linking to WordPress
```

#### **TeamInviteModal Component**
```typescript
interface TeamInviteModalProps {
  teamId: string
  isOpen: boolean
  onClose: () => void
}

// Features:
// - Generate invite link
// - Connect to WordPress API for user creation
// - Send via email option
// - Copy to clipboard
// - QR code generation (future)
```

---

## 🔧 **HOOKS IMPLEMENTATION PLAN**

### **useTeams Hook (Enhanced)**
```typescript
// Current: Basic team fetching
// Enhancement needed:
export function useTeams() {
  // Fetch from teams table with relationships
  // Include member counts
  // Filter by user's club_id if applicable
  // Apply proper RLS policies
}
```

### **usePlayerStats Hook (NEW)**
```typescript
export function usePlayerStats(userId: string) {
  // Aggregate data from multiple tables:
  // - skills_academy_user_progress (workouts completed)
  // - user_points_wallets (current balance)
  // - user_badges (earned badges)
  // - powlax_player_ranks (current rank)
  
  // Return formatted stats object
  return {
    skillsCompleted: number,
    totalPoints: number,
    currentRank: string,
    badges: Badge[],
    recentActivity: Activity[]
  }
}
```

### **useWordPressIntegration Hook (NEW)**
```typescript
export function useWordPressIntegration() {
  // Handle WordPress API calls
  // User creation for invites
  // Profile link generation
  // MemberPress integration
  
  return {
    createWordPressUser: async (email: string) => {},
    getProfileUrl: (email: string) => string,
    syncMembership: async (userId: string) => {}
  }
}
```

---

## 🎨 **UI/UX SPECIFICATIONS**

### **Player Stats Card Design (Based on Screenshot)**
```
┌─────────────────────────────────────┐
│  Player Name            [Edit Profile]│
│  Team: Varsity Boys                   │
│                                       │
│  ┌──────────┐  ┌──────────┐         │
│  │ POINTS   │  │  RANK    │         │
│  │  1,250   │  │ ELITE    │         │
│  └──────────┘  └──────────┘         │
│                                       │
│  Recent Badges:                      │
│  🏆 🎯 ⚡ 🔥                         │
│                                       │
│  Skills Completed: 45/100            │
│  ▓▓▓▓▓▓▓▓▓░░░░░░░░░  45%           │
└─────────────────────────────────────┘
```

### **Mobile Responsiveness Requirements**
- Minimum 375px width support
- Touch targets 44px minimum (field use with gloves)
- High contrast for outdoor visibility
- Single column layout on mobile
- Swipe gestures for navigation

---

## 💾 **SUPABASE PERMANENCE PATTERN APPLICATION**

### **Critical Pattern for Team Data Persistence**

#### **Team Sharing Arrays (MUST FOLLOW)**
```typescript
// UI State (checkboxes)
const [shareWithClub, setShareWithClub] = useState(false)
const [shareWithTeams, setShareWithTeams] = useState(false)

// Data State (arrays for database)
const [clubShareIds, setClubShareIds] = useState<number[]>([])
const [teamShareIds, setTeamShareIds] = useState<number[]>([])

// Transform at save boundary
const saveTeamData = {
  club_share: shareWithClub ? clubShareIds : [],
  team_share: shareWithTeams ? teamShareIds : []
}

// NEVER send booleans to INTEGER[] columns!
```

#### **User Authentication Pattern**
```typescript
// ALWAYS validate user before operations
const { user } = useAuth()
if (!user?.id) {
  throw new Error('User not authenticated')
}

// Use user.id for all foreign key references
const teamMember = {
  user_id: user.id,  // NOT user?.id which could be undefined
  team_id: teamId,
  role: 'player'
}
```

#### **Direct Column Mapping**
```typescript
// ✅ CORRECT - Direct mapping
const playerStats = {
  user_id: userId,
  points: data.points,
  badges: data.badges,
  rank: data.rank
}

// ❌ WRONG - Complex transformations
const stats = {
  data: JSON.stringify({
    nested: {
      points: data.points
    }
  })
}
```

---

## 🤖 **CLAUDE-TO-CLAUDE SUB-AGENT DEPLOYMENT PLAN**

### **MANDATORY: GENERAL-PURPOSE SUB-AGENTS ONLY**

#### **✅ Phase 0: Database Migration (COMPLETED)**
```typescript
// ✅ COMPLETED: team_playbooks table migration has been run
// Table is now available with all columns and RLS policies
// Ready for Team Playbook feature implementation
```

#### **✅ Phase 1: Database Connection (COMPLETED)**
```typescript
// ✅ COMPLETED: Teams page connected to database
// Shows 17 real teams with member counts
// User security properly restricts access
```

#### **✅ Phase 2: Player Stats Implementation (COMPLETED)**
```typescript
// ✅ COMPLETED: PlayerStatsCard created
// usePlayerStats hook aggregates from 4+ tables
// WordPress Edit Profile integration working
```

#### **✅ Phase 3: Team Playbook Integration (COMPLETED)**
```typescript
// ✅ COMPLETED: TeamPlaybookSection component created
// SaveToPlaybookModal integrated
// useTeamPlaybook hook functional
```

#### **🚨 Phase 4: Complete Data Reality (IN PROGRESS)**
```typescript
Task({
  subagent_type: "general-purpose",
  description: "Remove all hardcoded data from team dashboard",
  prompt: `
    Read TEAMS_MASTER_CONTRACT.md Phase 4 section.
    
    ULTRATHINK ANALYSIS REQUIRED:
    1. Audit ALL team dashboard components for hardcoded data
    2. Identify every mock value, fake name, hardcoded stat
    3. Connect each component to real database tables
    4. Add MOCK-prefixed test data to database where needed
    
    Implementation tasks:
    - Fix TeamRoster to show real team_members
    - Fix UpcomingSchedule to show real practices
    - Fix RecentActivity to show real user progress
    - Fix ProgressOverview to calculate real stats
    - Remove ALL hardcoded "Spring 2025", player counts, etc.
    - Ensure "Your Club OS" teams show actual members
    
    Validation:
    - No hardcoded names remain
    - All data comes from database
    - MOCK data clearly labeled
    - Empty states handled gracefully
  `
})
```

#### **Phase 5: Testing & Validation (Priority: CRITICAL)**
```typescript
Task({
  subagent_type: "general-purpose",
  description: "Test teams functionality",
  prompt: `
    Comprehensive testing required:
    - All database connections working
    - Player stats loading correctly
    - Invite system creates WordPress users
    - Mobile responsive at 375px
    - Build passes without errors
    - No console errors
    
    Run Playwright tests before completion.
  `
})
```

---

## 🧪 **TESTING REQUIREMENTS**

### **Database Verification Tests**
```typescript
// Test script to run BEFORE implementation
async function verifyDatabaseSchema() {
  // Test teams table columns
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .limit(1)
  
  console.log('Teams columns:', Object.keys(teams[0]))
  
  // Test relationships
  const { data: withMembers } = await supabase
    .from('teams')
    .select(`
      *,
      team_members (
        *,
        users (*)
      )
    `)
    .limit(1)
  
  console.log('Relationships work:', !!withMembers)
}
```

### **Component Testing Matrix**
| Component | Render | Data Load | Interactions | Mobile | Build |
|-----------|--------|-----------|--------------|--------|-------|
| TeamsPage | ✅ | ✅ | ✅ | ✅ | ✅ |
| TeamDashboard | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |
| PlayerStatsCard | ✅ | ✅ | ✅ | ✅ | ✅ |
| TeamInviteModal | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| TeamRoster | 🟡 | 🔴 | 🟡 | 🟡 | 🟡 |
| TeamPlaybookSection | ✅ | ✅ | ✅ | ✅ | ✅ |

**Legend:** ✅ Complete | 🟡 Partial | 🔴 Not Started

### **Playwright Test Requirements**
```typescript
test.describe('Teams MVP Features', () => {
  test('loads teams from database', async ({ page }) => {
    // Must show real teams, not hardcoded
  })
  
  test('displays player stats correctly', async ({ page }) => {
    // Points, badges, rank all visible
  })
  
  test('edit profile button links to WordPress', async ({ page }) => {
    // Correct URL format with username
  })
  
  test('invite modal creates WordPress user', async ({ page }) => {
    // Integration test with API
  })
  
  test('mobile responsive at 375px', async ({ page }) => {
    // All features work on mobile
  })
})
```

---

## 📊 **SUCCESS CRITERIA**

### **MVP Completion Checklist**
- [x] Teams page loads from `teams` table
- [x] No hardcoded team data remains (on teams list)
- [x] Player stats show real data from 4+ tables
- [x] Edit Profile button links to WordPress
- [x] Team Playbook section displays marked strategies
- [x] Coaches can add/remove strategies to/from playbook
- [x] Players can study team's playbook strategies
- [x] StudyStrategyModal opens from playbook
- [ ] Invite system creates WordPress users
- [x] Points and ranks display correctly
- [x] Badges earned are visible
- [x] Skills progress tracked
- [ ] **Team Dashboard shows ONLY real data**
- [ ] **All hardcoded values removed from dashboard**
- [ ] Mobile responsive at 375px
- [ ] All tests passing
- [ ] Build succeeds
- [ ] No console errors

### **Performance Targets**
- Page load: < 2 seconds
- Data queries: < 500ms
- Mobile performance score: > 90
- Accessibility score: > 85

### **Data Freshness**
- Player stats: 5 minute cache
- Team rosters: 2 minute cache
- Points/badges: Real-time (no cache)

---

## 🚨 **CRITICAL WARNINGS**

### **Common Pitfalls to Avoid**
1. **DO NOT** assume database columns don't exist - TEST FIRST
2. **DO NOT** send booleans to INTEGER[] columns
3. **DO NOT** use `user_profiles` table - use `users`
4. **DO NOT** use `organizations` table - use `clubs`
5. **DO NOT** create complex data transformations
6. **DO NOT** skip WordPress integration for invites
7. **DO NOT** leave hardcoded values in components

### **Required Patterns**
1. **ALWAYS** use SUPABASE_PERMANENCE_PATTERN for arrays
2. **ALWAYS** apply Gold Standard Pattern from custom drills
3. **ALWAYS** validate user authentication before operations
4. **ALWAYS** test with real database data
5. **ALWAYS** run Playwright tests before marking complete
6. **ALWAYS** label MOCK data clearly

---

## 📝 **IMPLEMENTATION PHASES**

### **Phase 1: Foundation (COMPLETE ✅)**
1. ✅ Connect teams page to database
2. ✅ Remove all hardcoded data (from teams list)
3. ✅ Basic team display with real data
4. ✅ Verify all relationships work

### **Phase 2: Player Features (COMPLETE ✅)**
1. ✅ Create PlayerStatsCard component
2. ✅ Implement usePlayerStats hook
3. ✅ Connect to gamification tables
4. ✅ Add Edit Profile button

### **Phase 3: Management (PARTIALLY COMPLETE)**
1. ✅ Team Playbook system
2. ⏳ Team invite system
3. ⏳ WordPress user creation
4. ⏳ Roster management UI
5. ✅ Permission-based features

### **Phase 4: Data Reality (IN PROGRESS 🚨)**
1. ⏳ Remove ALL hardcoded data from dashboard
2. ⏳ Connect ALL components to real data
3. ⏳ Add MOCK-prefixed test data
4. ⏳ Comprehensive testing

---

## 🎯 **CONTRACT VALIDATION**

### **Pre-Implementation Checklist**
- [x] Database schema documented
- [x] User requirements clear
- [x] Component architecture defined
- [x] Hooks planned
- [x] Testing requirements specified
- [x] Success criteria established
- [x] Warnings documented
- [x] Sub-agent deployment ready
- [x] **team_playbooks migration completed**
- [x] **Team Playbook components identified and ready**

### **Post-Implementation Validation**
- [ ] All MVP features working
- [x] Database connections verified (partial)
- [ ] WordPress integration functional
- [ ] Mobile responsive confirmed
- [ ] Tests passing
- [ ] Performance targets met
- [ ] User approval received
- [ ] **NO HARDCODED DATA REMAINS**

---

## 🔄 **LIVING DOCUMENT PROTOCOL**

This contract serves as the SINGLE SOURCE OF TRUTH for Teams page development:
- **UPDATE** after each work session
- **REFERENCE** before any implementation
- **TRACK** progress in status section
- **HANDOFF** to next session via this document

### **Status Tracking**
- 🔴 **Not Started** - No work begun
- 🟡 **In Progress** - Active development
- 🟢 **Complete** - Implementation done
- ✅ **Approved** - User validated

### **Current Overall Status: 🟡 IN PROGRESS**
**Critical Issue:** Team Dashboard contains extensive hardcoded data that needs immediate replacement with real database connections.

---

## 📞 **SUPPORT & ESCALATION**

For Teams-related issues:
1. Check this master contract
2. Review CLAUDE.md for system context
3. Verify database schema in database-truth-sync-002.yaml
4. Apply SUPABASE_PERMANENCE_PATTERN
5. Use Gold Standard Pattern from working features
6. Run comprehensive tests
7. Update this document with findings

---

## 🏆 **THE GOLD STANDARD PATTERN - TEAMS IMPLEMENTATION**

### **Apply Exact Pattern from Custom Drills/Strategies**

```typescript
// 🎯 PATTERN 1: AUTHENTICATION
const { user } = useAuth()
if (!user?.id) {
  throw new Error('User not authenticated')
}

// 🎯 PATTERN 2: ARRAY HANDLING
team_share: Array.isArray(data.team_share) 
  ? data.team_share 
  : (data.team_share === true ? [] : [])

// 🎯 PATTERN 3: DIRECT COLUMN MAPPING
const teamData = {
  name: data.name,           // Direct
  club_id: data.club_id,     // Direct
  age_group: data.age_group  // Direct
  // NO nested JSON, NO transformations
}

// 🎯 PATTERN 4: ERROR HANDLING
if (error) {
  throw new Error(`Failed to save team: ${error.message}`)
}

// 🎯 PATTERN 5: STATE REFRESH
await fetchTeams()  // After successful operation
```

### **This Pattern Guarantees Success**
When applied exactly as shown, this pattern ensures:
- ✅ Data persistence works first time
- ✅ No type mismatch errors
- ✅ Relationships maintained
- ✅ RLS policies respected
- ✅ User experience seamless

---

**End of Teams Master Contract**

**REMEMBER: ULTRATHINK BEFORE IMPLEMENTATION!**