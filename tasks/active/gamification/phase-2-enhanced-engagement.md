# Phase 2: Enhanced Engagement Implementation

**Timeline**: 1-2 months  
**Priority**: HIGH - Deepens engagement and social dynamics  
**Impact**: 8/10 - Critical for retention and mastery

## Overview
Building on Phase 1's foundation, this phase introduces tiered badges, visual player progression, team dynamics, and daily challenges to create deeper engagement loops.

## Prerequisites
- Phase 1 completed and stable
- Difficulty scoring system operational
- Basic streak mechanics working

## Tasks

### 1. Tiered Badge System ⏳

#### 1.1 Database Schema Updates
```sql
-- Migration: add_tiered_badges.sql
ALTER TABLE badges_powlax 
ADD COLUMN tier VARCHAR(20) CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum'));

-- Create tiered versions of existing badges
INSERT INTO badges_powlax (title, category, tier, points_required, description)
SELECT 
  title || ' - ' || INITCAP(tier),
  category,
  tier,
  CASE 
    WHEN tier = 'bronze' THEN 500
    WHEN tier = 'silver' THEN 2000
    WHEN tier = 'gold' THEN 5000
    WHEN tier = 'platinum' THEN 10000
  END,
  description || ' (' || INITCAP(tier) || ' tier)'
FROM badges_powlax, 
     UNNEST(ARRAY['bronze', 'silver', 'gold', 'platinum']) AS tier
WHERE tier IS NULL; -- Only base badges

-- Gatekeeper challenges table
CREATE TABLE gatekeeper_challenges (
  id SERIAL PRIMARY KEY,
  badge_id INTEGER REFERENCES badges_powlax(id),
  drill_id INTEGER REFERENCES drills_powlax(id),
  required_for_tier VARCHAR(20),
  description TEXT,
  UNIQUE(badge_id, required_for_tier)
);
```

#### 1.2 Badge Progress Tracking Enhancement
```sql
ALTER TABLE user_badge_progress_powlax
ADD COLUMN current_tier VARCHAR(20) DEFAULT 'none',
ADD COLUMN points_towards_next_tier INTEGER DEFAULT 0,
ADD COLUMN gatekeeper_completed BOOLEAN DEFAULT FALSE;
```

### 2. Player Attribute Visualization ("MyPlayer") ⏳

#### 2.1 Player Stats Calculation Service
**File**: `/src/lib/gamification/player-stats.ts`
```typescript
export interface PlayerAttributes {
  attack: number      // 0-99
  midfield: number    // 0-99
  defense: number     // 0-99
  wallBall: number    // 0-99
  laxIQ: number       // 0-99
  overall: number     // 0-99
}

export async function calculatePlayerAttributes(userId: string): Promise<PlayerAttributes> {
  const points = await getUserPointBalances(userId)
  
  // Logarithmic scaling for natural progression feel
  const scaleAttribute = (points: number): number => {
    const scaled = Math.min(99, Math.floor(Math.log10(points + 1) * 25))
    return scaled
  }
  
  const attributes = {
    attack: scaleAttribute(points.attack_tokens),
    midfield: scaleAttribute(points.midfield_medals),
    defense: scaleAttribute(points.defense_dollars),
    wallBall: scaleAttribute(points.rebound_rewards),
    laxIQ: scaleAttribute(points.lax_iq_points),
    overall: 0
  }
  
  attributes.overall = Math.floor(
    (attributes.attack + attributes.midfield + 
     attributes.defense + attributes.wallBall + attributes.laxIQ) / 5
  )
  
  return attributes
}
```

#### 2.2 Player Card Component
**File**: `/src/components/gamification/PlayerAttributeCard.tsx`
```typescript
export function PlayerAttributeCard({ userId }: Props) {
  const { data: attributes } = usePlayerAttributes(userId)
  
  return (
    <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold">MyPlayer</h3>
            <p className="text-blue-100">Overall: {attributes.overall}</p>
          </div>
          <Badge variant="secondary" className="bg-white/20">
            {getUserRank(attributes.overall)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AttributeBar 
            label="Attack" 
            value={attributes.attack} 
            color="red"
            icon={<Swords />}
          />
          <AttributeBar 
            label="Midfield" 
            value={attributes.midfield} 
            color="green"
            icon={<Activity />}
          />
          <AttributeBar 
            label="Defense" 
            value={attributes.defense} 
            color="blue"
            icon={<Shield />}
          />
          <AttributeBar 
            label="Wall Ball" 
            value={attributes.wallBall} 
            color="orange"
            icon={<Target />}
          />
          <AttributeBar 
            label="Lax IQ" 
            value={attributes.laxIQ} 
            color="purple"
            icon={<Brain />}
          />
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. Team Leaderboards & Coach Dashboard ⏳

#### 3.1 Leaderboard Database Structure
```sql
-- Migration: create_team_leaderboards.sql
CREATE TABLE team_memberships (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  team_id INTEGER,
  role VARCHAR(20) DEFAULT 'player',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);

CREATE TABLE weekly_team_stats (
  id SERIAL PRIMARY KEY,
  team_id INTEGER,
  week_start DATE,
  user_id UUID REFERENCES auth.users,
  total_points INTEGER DEFAULT 0,
  workouts_completed INTEGER DEFAULT 0,
  average_difficulty DECIMAL(3,2),
  current_streak INTEGER,
  UNIQUE(team_id, week_start, user_id)
);

-- Materialized view for fast leaderboard queries
CREATE MATERIALIZED VIEW team_leaderboard_current AS
SELECT 
  ts.*,
  u.display_name,
  u.avatar_url,
  RANK() OVER (
    PARTITION BY ts.team_id 
    ORDER BY ts.total_points DESC
  ) as team_rank
FROM weekly_team_stats ts
JOIN auth.users u ON ts.user_id = u.id
WHERE ts.week_start = date_trunc('week', CURRENT_DATE);
```

#### 3.2 Team Leaderboard Component
**File**: `/src/components/gamification/TeamLeaderboard.tsx`
```typescript
export function TeamLeaderboard({ teamId }: Props) {
  const { data: players } = useTeamLeaderboard(teamId)
  const currentUserId = useCurrentUser().id
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Team Rankings</h3>
        <p className="text-sm text-muted-foreground">
          This week's effort leaders
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {players.map((player, index) => (
            <LeaderboardRow
              key={player.user_id}
              rank={index + 1}
              player={player}
              isCurrentUser={player.user_id === currentUserId}
              showChange={index < 3}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

#### 3.3 Coach Dashboard
**File**: `/src/app/(authenticated)/coach/dashboard/page.tsx`
```typescript
export default function CoachDashboard() {
  const { teamId } = useCoachTeam()
  const { data: teamStats } = useTeamStats(teamId)
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Team Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Team Effort Score"
          value={teamStats.weeklyPoints}
          change={teamStats.pointsChange}
          icon={<TrendingUp />}
        />
        <StatCard
          title="Active Players"
          value={`${teamStats.activePlayers}/${teamStats.totalPlayers}`}
          subtitle="This week"
          icon={<Users />}
        />
        <StatCard
          title="Avg Workout Difficulty"
          value={teamStats.avgDifficulty.toFixed(1)}
          change={teamStats.difficultyChange}
          icon={<BarChart />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlayerActivityHeatmap players={teamStats.players} />
        <TopPerformers players={teamStats.topPerformers} />
      </div>
      
      <div className="mt-6">
        <PlayerProgressTable players={teamStats.players} />
      </div>
    </div>
  )
}
```

### 4. Daily & Weekly Challenges ⏳

#### 4.1 Challenge System Database
```sql
-- Migration: create_challenge_system.sql
CREATE TABLE challenge_templates (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) CHECK (type IN ('daily', 'weekly')),
  title VARCHAR(255),
  description TEXT,
  requirements JSONB,
  reward_points JSONB,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE active_challenges (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES challenge_templates(id),
  start_date DATE,
  end_date DATE,
  type VARCHAR(20),
  UNIQUE(start_date, type)
);

CREATE TABLE user_challenge_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  challenge_id INTEGER REFERENCES active_challenges(id),
  progress JSONB DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  UNIQUE(user_id, challenge_id)
);

-- Sample challenge templates
INSERT INTO challenge_templates (type, title, description, requirements, reward_points) VALUES
('daily', 'Defensive Duo', 'Complete 1 defensive drill and 1 wall ball drill', 
 '{"drills": [{"category": "defense", "count": 1}, {"category": "wall_ball", "count": 1}]}',
 '{"lax_credit": 50}'),
('weekly', 'Midfield Master', 'Earn 200 Midfield Medals this week',
 '{"points": {"midfield_medal": 200}}',
 '{"lax_credit": 200, "midfield_medal": 50}');
```

#### 4.2 Challenge Display Component
**File**: `/src/components/gamification/DailyChallengeCard.tsx`
```typescript
export function DailyChallengeCard() {
  const { data: challenge } = useDailyChallenge()
  const { data: progress } = useChallengeProgress(challenge?.id)
  
  if (!challenge) return null
  
  const progressPercent = calculateProgress(
    challenge.requirements, 
    progress
  )
  
  return (
    <Card className={cn(
      "border-2",
      progress?.completed 
        ? "border-green-500 bg-green-50" 
        : "border-purple-500"
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">Daily Challenge</h3>
            <p className="text-sm text-muted-foreground">
              {challenge.title}
            </p>
          </div>
          <Badge variant={progress?.completed ? "success" : "secondary"}>
            {progress?.completed ? "Complete!" : "In Progress"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">{challenge.description}</p>
        
        <div className="space-y-2">
          <Progress value={progressPercent} />
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-2 text-sm">
          <Gift className="w-4 h-4" />
          <span>Reward: {formatRewards(challenge.reward_points)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 5. Age Band UI Adaptations ⏳

#### 5.1 Age-Appropriate Component Variants
**File**: `/src/components/gamification/BadgeDisplay.tsx`
```typescript
export function BadgeDisplay({ badge, userAge }: Props) {
  const ageGroup = getAgeGroup(userAge) // 'do_it' | 'coach_it' | 'own_it'
  
  if (ageGroup === 'do_it') {
    return <BadgeDisplayYoung badge={badge} /> // Colorful, animated
  }
  
  if (ageGroup === 'coach_it') {
    return <BadgeDisplayTeen badge={badge} /> // Social features prominent
  }
  
  return <BadgeDisplayAdvanced badge={badge} /> // Detailed stats, optimization
}
```

## Testing Requirements

### Integration Tests
- [ ] Badge tier progression flow
- [ ] Gatekeeper challenge requirements
- [ ] Team leaderboard updates
- [ ] Challenge completion and rewards

### Performance Tests
- [ ] Leaderboard query performance with 1000+ users
- [ ] Player stats calculation speed
- [ ] Real-time updates for team rankings

### User Acceptance Tests
- [ ] Coach dashboard usability
- [ ] Challenge clarity and achievability
- [ ] Visual appeal across age groups

## Success Metrics

- 40% of users achieve at least Bronze tier badges
- 15% reach Silver tier within 3 months
- Daily challenge completion rate > 30%
- Team leaderboard views per week > 5 per active user
- Coach dashboard usage at least weekly

## Dependencies

- Phase 1 completion
- Team structure in place
- Coach accounts configured
- Real-time database capabilities

## Notes

- Consider soft-launch with subset of teams
- A/B test challenge difficulty levels
- Monitor for negative competition dynamics
- Prepare moderation tools for leaderboards

## Progress Log

- 2025-01-15: Task document created
- [Date]: [Update]