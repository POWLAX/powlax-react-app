# POWLAX Development Framework & Migration Strategy

## Executive Summary

POWLAX is evolving from a WordPress-based lacrosse platform to a modern React/Supabase ecosystem with **phased migration** over 6 months, maintaining parallel systems while progressively moving features. The enhanced practice planner with strategic depth will be the cornerstone, followed by a reimagined Skills Academy, all unified by a sophisticated registration system.

## 🎯 Core Vision

Transform POWLAX from WordPress constraints to a modern, scalable platform that serves the lacrosse community while maintaining business continuity throughout the transition.

## 👥 Primary Users & Priorities

1. **Coaches** (highest priority) - Need analytics, playbook building, practice planning with strategic depth
2. **Players** - Skills Academy with better UX, gamification, video analysis capabilities  
3. **Parents** - Full visibility into children's progress, real-time reporting
4. **Club Directors** - Team management, registration oversight

## 🏗️ Migration Strategy (5 Phases)

### Phase 1: Enhanced Practice Planner (Weeks 1-4) - *IMMEDIATE PRIORITY*

**Priority**: Immediate - No WordPress dependencies required

**Core Features**:
- Drag-and-drop practice builder with timeline view
- Strategic layer linking (drills → strategies → concepts → skills)
- Age-band aware drill filtering with spectrum progression
- Parallel drill support with field visualization
- Live practice execution mode with timer

**Data Migration**:

```sql
-- Core tables needed in Supabase
drills (
  id, title, description, duration_minutes, 
  category, age_bands[], game_states[], 
  video_url, diagram_urls[], equipment[],
  lacrosse_lab_urls JSONB -- Store as JSON array for 5 URLs
)

drill_strategies (
  drill_id, strategy_id, 
  primary_focus, age_band_modifier
)

drill_concepts (
  drill_id, concept_id, 
  coaching_points[], common_mistakes[]
)

drill_skills (
  drill_id, skill_id, 
  progression_level, focus_percentage
)

-- Age band spectrum support
age_bands_spectrum (
  base_level TEXT, -- '8U'
  can_access TEXT[], -- ['8U', '10U'] for advanced teams
  see_do_age INT, -- 6-8
  coach_it_age INT, -- 8-10
  own_it_age INT -- 10+
)
```

**Missing Elements to Add**:
- 5 Lacrosse Lab URL fields (currently only 1-2 in Supabase)
- Full age band taxonomy from CSV
- Strategic layer connections

### Phase 2: React Registration System (Weeks 3-6) - *CRITICAL*

**Priority**: Critical - Enables all subsequent features

**Key Solutions**:
- Unified Registration Form with role selection
- MemberPress API integration for payment processing
- Automatic BuddyBoss group assignment based on role
- Corporate account limit management (25 players, unlimited coaches/parents)

**Smart Account Hierarchy**:

```javascript
// Registration flow logic
if (role === 'player') {
  checkCorporateLimit(teamId, 'player', 25)
  assignToBuddyBossGroup(teamHQ)
} else if (role === 'parent') {
  linkToChildAccount(childEmail)
  assignToBuddyBossGroup(teamHQ, 'view_only')
  // Don't count against player limit
}

// Registration Flow for Club Directors
async function registerClubDirector(formData) {
  // 1. Create Club OS in BuddyBoss
  const clubOS = await createBuddyBossGroup({
    name: formData.clubName,
    type: 'club_os',
    parent: null
  });
  
  // 2. Create Team HQs as child groups
  for (const team of formData.teams) {
    await createBuddyBossGroup({
      name: team.name,
      type: 'team_hq',
      parent: clubOS.id,
      access_control: 'parent_group_members_only'
    });
  }
}

// User Registration validates Club OS membership
async function joinTeamHQ(userId, teamHQId) {
  const clubOS = await getParentGroup(teamHQId);
  if (!isUserInGroup(userId, clubOS.id)) {
    throw new Error('Must join Club OS first');
  }
  // Proceed with Team HQ assignment
}
```

**Coupon Integration**:
- Auto-apply first-year coupon for new Team HQ purchases
- Track evaluation period start from first player registration

### Phase 3: Skills Academy 2.0 (Weeks 5-10)

**Priority**: High - Major UX improvement for players

**New Features**:
- Rep requirements and success criteria ("do until 3 perfect")
- Challenge elements for drill completion
- Enhanced gamification with proper point weighting
- Video submission capability for future AI analysis

**Data Migration Strategy**:

```sql
-- Replace GamiPress with native Supabase
points_system (
  drill_id, base_points, 
  duration_multiplier, -- 5-drill workout = 5x points
  streak_bonus_percentage
)

player_progress (
  player_id, drill_id, completions, 
  best_streak, last_completed, 
  video_submission_url -- Future AI analysis
)

-- Rep requirements & success criteria
drill_requirements (
  drill_id,
  rep_count INTEGER, -- e.g., "Do 10 reps"
  success_criteria TEXT, -- e.g., "Complete 3 perfect in a row"
  challenge_mode BOOLEAN, -- True = keep going until criteria met
  criteria_type ENUM('count', 'perfect_streak', 'time_based', 'accuracy')
)
```

**Skill Categorization Enhancement**:
- **Primary**: Shooting, Dodging, Ground Balls, Passing, Defense
- **State-based**: With Ball, Without Ball, Transition
- **Development Focus**: Speed, Accuracy, Decision-Making, Endurance
- **Challenge Level**: Fundamental, Intermediate, Advanced, Elite

**GamiPress Integration**:

```javascript
// Short-term: WordPress REST endpoint
await fetch('/wp-json/powlax/v1/complete-drill', {
  method: 'POST',
  body: { drillId, userId, points }
});

// Long-term: Supabase function with enhanced logic
CREATE FUNCTION award_drill_points(
  player_id UUID,
  drill_id UUID,
  workout_length INT
) RETURNS INT AS $$
DECLARE
  base_points INT;
  total_points INT;
BEGIN
  SELECT points INTO base_points FROM drills WHERE id = drill_id;
  
  -- 5-drill workout gets 5x the points of a single drill
  total_points := base_points * workout_length;
  
  -- Add streak bonus if applicable
  -- Add challenge completion bonus
  
  INSERT INTO points_ledger (player_id, points, source, drill_id)
  VALUES (player_id, total_points, 'drill_completion', drill_id);
  
  RETURN total_points;
END;
```

### Phase 4: Team Analytics & Coach Tools (Weeks 9-14)

**Priority**: Medium - Builds on Academy data

**WordPress API References**:
- BuddyBoss activity feed (read-only embed)
- MemberPress subscription status (periodic sync)
- LearnDash Master Class progress (reference only)

**New Supabase Analytics**:

```typescript
// Analytics Dashboard Component
interface TeamAnalytics {
  teamId: string;
  coachId: string;
  analytics: {
    playerProgress: PlayerProgress[];
    teamAverages: TeamMetrics;
    drillCompletion: DrillStats[];
  }
}

// Replaces LearnDash group reports
const CoachDashboard = () => {
  const { data } = useQuery({
    queryKey: ['team-analytics', teamId],
    queryFn: async () => {
      // Direct Supabase query instead of LearnDash
      return supabase
        .from('team_analytics_view')
        .select('*')
        .eq('team_id', teamId);
    }
  });
};
```

- Real-time team leaderboards
- Individual player progress tracking
- Practice attendance and performance
- Parent visibility portal with weekly reports

### Phase 5: Complete Ecosystem Integration (Weeks 13-18)

**Priority**: Lower - Polish and optimization

**Final Migrations**:
- Club OS management tools
- Director oversight dashboards
- Advanced reporting and exports
- Mobile app optimization

## 🔧 Critical Data Mapping Decisions

### Migrate to Supabase NOW:
- All drill data and relationships
- User profiles with role management
- Skills Academy videos and categorization
- Points/badges/gamification logic
- Team rosters and hierarchies

### Keep as WordPress API Reference:
- Payment processing (MemberPress)
- Community forums (BuddyBoss)
- Master Class content (LearnDash)
- Marketing pages and blog

## 💡 Strategic Enhancement Layer (Practice Planner)

The key differentiator - linking strategies, concepts, and skills to drills:

```typescript
// When coach selects a drill
interface DrillEnhancement {
  drill: {
    id: string
    title: string
    baseInfo: DrillData
  }
  strategies: [
    {
      name: "2-3-1 Motion Offense"
      relevance: "primary" | "secondary"
      ageAdaptation: "Full complexity for 14U+"
    }
  ]
  concepts: [
    {
      name: "Off-ball movement"
      coachingPoints: ["Create space", "Time your cuts"]
      videoReference: "strategy_video_id"
    }
  ]
  skillsToLayer: [
    {
      name: "Dodging"
      integrationTips: "Add defender after 5 min"
      progressionPath: "Static → Dynamic → Live"
    }
  ]
}
```

**This creates a complete learning ecosystem where**:
- Coaches understand **WHY** they're running each drill
- Drills connect to broader strategic goals
- Skills development is intentional, not accidental
- Age-appropriate progressions are built-in

## 🗄️ Database Schema Highlights

### Parent-Child Visibility:

```sql
-- Full parent access to child data
CREATE VIEW parent_child_dashboard AS
SELECT 
  c.*, 
  p.points_total,
  p.badges_earned,
  p.last_workout,
  m.recent_messages
FROM users c
JOIN parent_child_links pcl ON c.id = pcl.child_id
JOIN player_progress p ON c.id = p.player_id
LEFT JOIN messages m ON c.id = m.recipient_id
WHERE pcl.parent_id = auth.uid();
```

### Registration Intelligence:

```sql
-- Smart limits and role assignment
CREATE FUNCTION register_team_member(
  team_id UUID,
  role TEXT,
  corporate_account_id UUID
) RETURNS UUID AS $$
DECLARE
  current_player_count INT;
BEGIN
  IF role = 'player' THEN
    SELECT COUNT(*) INTO current_player_count
    FROM team_members
    WHERE team_id = $1 AND role = 'player';
    
    IF current_player_count >= 25 THEN
      RAISE EXCEPTION 'Team player limit reached';
    END IF;
  END IF;
  
  -- Insert logic with proper group assignment
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;
```

## 🚨 Critical Pain Points Being Solved

1. **Registration Complexity**: Currently requires 4 separate registrations per team
2. **Role Assignment**: No way to distinguish parents/coaches/players in same corporate account
3. **Player Limits**: Parents count against 25-player limit incorrectly
4. **Strategic Depth**: Drills lack connection to broader coaching concepts
5. **Gamification**: Same points for 1-drill vs 5-drill workouts

## 📅 Implementation Timeline

- **Month 1**: Practice Planner + Registration System
- **Month 2**: Skills Academy Migration + Gamification
- **Month 3**: Analytics + Parent Portals
- **Month 4**: Polish + Mobile Optimization
- **Month 5**: Advanced Features + AI Integration prep
- **Month 6**: Full ecosystem running in parallel

## 🎯 Key Success Metrics

- **Practice Planner**: Coaches save 30+ min per plan with strategic clarity
- **Skills Academy**: 50%+ increase in player engagement
- **Registration**: 90% reduction in setup time per team
- **Parent Portal**: 80% of parents actively checking progress

## 🔄 Immediate Actions Required

### Immediate Actions:
1. Expand Supabase drill schema for 5 Lacrosse Lab URLs
2. Create age_bands table with full taxonomy
3. Design parent-child group hierarchy for BuddyBoss

### API Integrations:
1. Build WordPress REST endpoint for GamiPress point tracking (temporary)
2. Create MemberPress webhook handlers for registration flow
3. Set up BuddyBoss API calls for group management

### New Features:
1. Rep counting and success criteria system
2. Challenge mode for drills
3. Proper point weighting (workout length multiplier)
4. Parent visibility dashboard

---

This framework provides a clear roadmap from WordPress constraints to a modern, scalable React/Supabase ecosystem that truly serves the lacrosse community's needs while maintaining business continuity throughout the transition.