# Team HQ + BuddyBoss Integration Project

**Agent**: Database Integration Architect  
**Priority**: High  
**Duration**: 4-6 hours  
**Parallel With**: Gamification Implementation  
**Dependencies**: Infrastructure fixes must complete first

---

## 🎯 **Project Goal**

Create dedicated Team HQ functionality that integrates with existing BuddyBoss groups while maintaining web community features.

### **Success Vision**:
- Each team gets dedicated HQ workspace
- BuddyBoss groups map to teams seamlessly  
- Practice planner becomes team-specific
- Community features remain for web users

---

## 📊 **Data Analysis Foundation**

### **Existing WordPress Team Structure** (From our analysis)
```csv
# Teams-Export-2025-July-31-1922.csv shows:
- 144 teams/groups with hierarchical user relationships
- LearnDash groups with specific user assignments
- Team-based course access control
- Price type: "closed" indicates controlled access
```

### **BuddyBoss Profile Integration** (From Profile-Tabs-Export)
```csv
# Profile-Tabs-Export-2025-July-31-1915.csv shows:
- Role-based profile tab visibility
- Academy integration with points tracking
- Progress tracker with gamification
- Team-specific workout content
```

---

## 🗄️ **Database Schema Design**

### **Phase 1: Team HQ Tables** (Create/Enhance)

```sql
-- Enhance existing teams table for HQ functionality
ALTER TABLE teams ADD COLUMN IF NOT EXISTS:
  - hq_settings JSONB DEFAULT '{}',
  - buddyboss_group_id INTEGER,
  - hq_active BOOLEAN DEFAULT true,
  - team_color VARCHAR(7), -- Hex color
  - team_logo_url TEXT,
  - practice_day_preferences TEXT[],
  - season_dates JSONB;

-- Create team_hq_permissions table
CREATE TABLE team_hq_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES users(id),
  permission_level TEXT CHECK (permission_level IN ('owner', 'coach', 'assistant', 'member')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES users(id)
);

-- Create team_practice_plans table (enhance existing)
CREATE TABLE team_practice_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  created_by UUID REFERENCES users(id),
  title TEXT NOT NULL,
  practice_date DATE,
  duration_minutes INTEGER,
  drill_sequence JSONB, -- Array of drill objects
  notes TEXT,
  is_template BOOLEAN DEFAULT false,
  shared_with_team BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Phase 2: BuddyBoss Integration Mapping**

```sql
-- Create buddyboss_team_mapping table
CREATE TABLE buddyboss_team_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  wordpress_group_id INTEGER NOT NULL, -- From Teams-Export CSV
  buddyboss_group_slug VARCHAR(255),
  sync_enabled BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_settings JSONB DEFAULT '{}'
);

-- Create team_activity_feed table
CREATE TABLE team_activity_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES users(id),
  activity_type VARCHAR(50), -- 'practice_created', 'achievement_earned', 'workout_completed'
  content JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔧 **Implementation Tasks**

### **Task 1: Database Migration (1 hour)**

**Files to Create**:
- `supabase/migrations/015_team_hq_foundation.sql`
- `supabase/migrations/016_buddyboss_integration.sql`

**Actions**:
1. Run migrations to create Team HQ tables
2. Import existing team data from WordPress CSV
3. Create BuddyBoss group mappings
4. Set up proper RLS policies

### **Task 2: Data Access Layer (2 hours)**

**Files to Create/Modify**:
- `src/lib/team-hq-queries.ts` (new)
- `src/hooks/useTeamData.ts` (new)
- `src/hooks/useTeamMembers.ts` (new)

**Key Functions**:
```typescript
// Team HQ data access
export async function getTeamHQData(teamId: string, userId: string)
export async function getTeamPracticePlans(teamId: string)
export async function getTeamActivityFeed(teamId: string)
export async function updateTeamSettings(teamId: string, settings: any)

// BuddyBoss integration
export async function syncBuddyBossGroup(teamId: string)
export async function getTeamFromBuddyBossGroup(groupId: number)
```

### **Task 3: Team HQ Components (2-3 hours)**

**Files to Create**:
- `src/app/(authenticated)/teams/[teamId]/hq/page.tsx` (new)
- `src/components/team-hq/TeamDashboard.tsx` (new)
- `src/components/team-hq/TeamActivityFeed.tsx` (new)
- `src/components/team-hq/TeamSettings.tsx` (new)
- `src/components/team-hq/PracticeCalendar.tsx` (new)

**Component Structure**:
```tsx
// Team HQ Dashboard Layout
<TeamHQLayout teamId={teamId}>
  <TeamHeader team={teamData} />
  <TeamNavigation />
  
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">
      <PracticeCalendar teamId={teamId} />
      <RecentPractices teamId={teamId} />
    </div>
    
    <div>
      <TeamActivityFeed teamId={teamId} />
      <TeamMembers teamId={teamId} />
    </div>
  </div>
</TeamHQLayout>
```

---

## 🔗 **BuddyBoss Integration Points**

### **Data Sync Strategy**
1. **One-Way Sync**: React app reads WordPress/BuddyBoss data
2. **Activity Feed**: Team actions create BuddyBoss activity posts
3. **Member Management**: Use existing WordPress user/group relationships
4. **Achievement Sharing**: Gamification achievements post to group feed

### **Integration Files to Modify**:
- `src/lib/wordpress-auth.ts` (add group data fetching)
- `src/hooks/useWordPressAuth.tsx` (include team context)
- `src/lib/buddyboss-sync.ts` (new - sync utilities)

---

## 📱 **Team-Specific Practice Planner**

### **Modifications Required**:
- `src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx` (existing)
- Add team context to practice creation
- Team-specific drill libraries
- Save practices to team_practice_plans table
- Team member visibility settings

---

## ✅ **Acceptance Criteria**

### **Must Have**:
- [ ] Team HQ dashboard loads with team-specific data
- [ ] BuddyBoss groups map correctly to teams
- [ ] Practice planner saves to team-specific tables
- [ ] Team members can view team activity

### **Should Have**:
- [ ] Team settings page functional
- [ ] Activity feed shows team actions
- [ ] Practice calendar displays team practices
- [ ] Team-specific gamification points

### **Could Have**:
- [ ] Real-time activity updates
- [ ] Team chat integration
- [ ] Advanced permission management
- [ ] Team analytics dashboard

---

## 🚀 **Getting Started**

**Prerequisites**: Infrastructure fixes complete  
**First Task**: Create database migrations  
**Parallel Work**: Coordinate with Gamification agent for team-level points  
**Estimated Duration**: 4-6 hours total

**Ready to build the ultimate Team HQ experience!** 🏆