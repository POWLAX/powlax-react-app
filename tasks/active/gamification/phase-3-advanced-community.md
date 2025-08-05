# Phase 3: Advanced Community Features

**Timeline**: 3-6 months  
**Priority**: MEDIUM - Long-term retention and community building  
**Impact**: 9/10 - Critical for sustained engagement

## Overview
This phase introduces seasonal progression ("Lax Pass"), competitive leagues, and player-created content to maintain long-term engagement and build a thriving community.

## Prerequisites
- Phase 1 & 2 fully operational
- Strong user base (1000+ active users)
- Stable gamification foundation

## Tasks

### 1. Seasonal Content & "Lax Pass" System ⏳

#### 1.1 Season Infrastructure
```sql
-- Migration: create_season_system.sql
CREATE TABLE seasons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  theme VARCHAR(100),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT FALSE,
  season_data JSONB -- Theme colors, special rewards, etc
);

CREATE TABLE season_tiers (
  id SERIAL PRIMARY KEY,
  season_id INTEGER REFERENCES seasons(id),
  tier_number INTEGER,
  required_xp INTEGER,
  rewards JSONB, -- Badges, cosmetics, bonuses
  UNIQUE(season_id, tier_number)
);

CREATE TABLE user_season_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  season_id INTEGER REFERENCES seasons(id),
  current_xp INTEGER DEFAULT 0,
  current_tier INTEGER DEFAULT 0,
  premium_pass BOOLEAN DEFAULT FALSE,
  last_claim_tier INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, season_id)
);

-- Season-exclusive badges
CREATE TABLE season_rewards (
  id SERIAL PRIMARY KEY,
  season_id INTEGER REFERENCES seasons(id),
  reward_type VARCHAR(50), -- badge, cosmetic, boost
  reward_data JSONB,
  tier_required INTEGER,
  premium_only BOOLEAN DEFAULT FALSE
);
```

#### 1.2 XP Calculation System
**File**: `/src/lib/gamification/season-xp.ts`
```typescript
export interface SeasonXPSource {
  source: 'workout' | 'challenge' | 'streak' | 'achievement'
  baseXP: number
  multipliers: XPMultiplier[]
}

export function calculateSeasonXP(activity: Activity): number {
  const baseXP = getBaseXP(activity)
  
  // Apply multipliers
  const multipliers = [
    getDifficultyMultiplier(activity.avgDifficulty),
    getStreakMultiplier(activity.userStreak),
    getWeekendBonus(),
    getFirstWinOfDay(),
    getPremiumPassBonus(activity.hasPremium)
  ]
  
  const totalMultiplier = multipliers.reduce((acc, m) => acc * m, 1)
  
  return Math.floor(baseXP * totalMultiplier)
}

// XP sources
const XP_SOURCES = {
  workout_complete: 100,
  daily_challenge: 50,
  weekly_challenge: 200,
  badge_earned: 300,
  perfect_week: 500, // 7-day streak
}
```

#### 1.3 Lax Pass UI Component
**File**: `/src/components/gamification/LaxPass.tsx`
```typescript
export function LaxPass() {
  const { data: season } = useCurrentSeason()
  const { data: progress } = useSeasonProgress()
  const { data: tiers } = useSeasonTiers(season.id)
  
  return (
    <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6">
      <SeasonHeader season={season} daysLeft={getDaysLeft(season)} />
      
      <div className="mt-6">
        <ProgressBar
          current={progress.current_xp}
          target={tiers[progress.current_tier + 1]?.required_xp}
          label={`Tier ${progress.current_tier + 1}`}
        />
      </div>
      
      <div className="mt-8">
        <TierTrack
          tiers={tiers}
          currentTier={progress.current_tier}
          hasPremium={progress.premium_pass}
          onClaim={(tier) => claimReward(tier)}
        />
      </div>
      
      {!progress.premium_pass && (
        <PremiumUpsell 
          benefits={getPremiumBenefits(season)}
          price={season.premium_price}
        />
      )}
    </div>
  )
}
```

### 2. Competitive Leagues System ⏳

#### 2.1 League Structure
```sql
-- Migration: create_league_system.sql
CREATE TABLE league_divisions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50), -- Bronze, Silver, Gold, Diamond, Champion
  tier_order INTEGER,
  min_rating INTEGER,
  icon_url TEXT,
  color VARCHAR(7)
);

CREATE TABLE league_seasons (
  id SERIAL PRIMARY KEY,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE league_groups (
  id SERIAL PRIMARY KEY,
  league_season_id INTEGER REFERENCES league_seasons(id),
  division_id INTEGER REFERENCES league_divisions(id),
  group_number INTEGER,
  UNIQUE(league_season_id, division_id, group_number)
);

CREATE TABLE league_participants (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  league_group_id INTEGER REFERENCES league_groups(id),
  current_points INTEGER DEFAULT 0,
  rank_in_group INTEGER,
  promoted BOOLEAN DEFAULT FALSE,
  relegated BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, league_group_id)
);

-- Weekly snapshots for progression
CREATE TABLE league_weekly_results (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER REFERENCES league_participants(id),
  week_number INTEGER,
  points_earned INTEGER,
  final_rank INTEGER,
  UNIQUE(participant_id, week_number)
);
```

#### 2.2 League Matchmaking Service
**File**: `/src/lib/gamification/league-matchmaking.ts`
```typescript
export async function assignToLeagueGroup(userId: string) {
  const userRating = await calculateUserRating(userId)
  const division = getDivisionByRating(userRating)
  
  // Find group with space (max 30 players)
  let group = await findAvailableGroup(division.id)
  
  if (!group) {
    group = await createNewGroup(division.id)
  }
  
  await assignUserToGroup(userId, group.id)
  
  // Send notification
  await notifyLeagueAssignment(userId, division, group)
}

export async function processWeeklyLeagueResults() {
  const activeGroups = await getActiveLeagueGroups()
  
  for (const group of activeGroups) {
    const participants = await getGroupParticipants(group.id)
    
    // Calculate rankings based on week's points
    const rankings = calculateWeeklyRankings(participants)
    
    // Store weekly results
    await storeWeeklyResults(rankings)
    
    // Process promotions/relegations (end of 4-week cycle)
    if (isEndOfCycle()) {
      await processPromotionsAndRelegations(rankings)
    }
  }
}
```

#### 2.3 League UI Components
**File**: `/src/components/gamification/LeagueStandings.tsx`
```typescript
export function LeagueStandings() {
  const { data: myGroup } = useMyLeagueGroup()
  const { data: standings } = useLeagueStandings(myGroup.id)
  const userId = useCurrentUser().id
  
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{myGroup.division.name} League</h2>
            <p className="text-sm opacity-90">Group {myGroup.group_number}</p>
          </div>
          <DivisionBadge division={myGroup.division} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <LeagueTable
          standings={standings}
          currentUserId={userId}
          promotionZone={3}
          relegationZone={3}
        />
      </CardContent>
      <CardFooter>
        <TimeRemaining until={myGroup.week_end_date} />
      </CardFooter>
    </Card>
  )
}
```

### 3. Player-Created Challenges ⏳

#### 3.1 Challenge Creation System
```sql
-- Migration: player_created_challenges.sql
CREATE TABLE custom_challenges (
  id SERIAL PRIMARY KEY,
  creator_id UUID REFERENCES auth.users,
  title VARCHAR(255),
  description TEXT,
  drill_sequence JSONB, -- Array of drill IDs with order
  target_time INTEGER, -- Minutes to complete
  difficulty_rating DECIMAL(3,2),
  is_public BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  times_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE challenge_attempts (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER REFERENCES custom_challenges(id),
  user_id UUID REFERENCES auth.users,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  time_taken INTEGER, -- seconds
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT
);

CREATE TABLE challenge_favorites (
  user_id UUID REFERENCES auth.users,
  challenge_id INTEGER REFERENCES custom_challenges(id),
  PRIMARY KEY (user_id, challenge_id)
);
```

#### 3.2 Challenge Builder Component
**File**: `/src/components/gamification/ChallengeBuilder.tsx`
```typescript
export function ChallengeBuilder() {
  const [challenge, setChallenge] = useState<ChallengeData>({
    title: '',
    description: '',
    drills: [],
    targetTime: 30
  })
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Create Custom Challenge</h2>
          <p className="text-muted-foreground">
            Design a drill sequence for others to master
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Challenge Name"
            value={challenge.title}
            onChange={(e) => setChallenge({
              ...challenge,
              title: e.target.value
            })}
            placeholder="e.g., Elite Stick Skills Gauntlet"
          />
          
          <Textarea
            label="Description"
            value={challenge.description}
            onChange={(e) => setChallenge({
              ...challenge,
              description: e.target.value
            })}
            placeholder="Describe what makes this challenge unique..."
          />
          
          <DrillSequenceBuilder
            drills={challenge.drills}
            onChange={(drills) => setChallenge({
              ...challenge,
              drills
            })}
          />
          
          <TimeTargetSelector
            value={challenge.targetTime}
            onChange={(time) => setChallenge({
              ...challenge,
              targetTime: time
            })}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={() => publishChallenge(challenge)}>
            Publish Challenge
          </Button>
        </CardFooter>
      </Card>
      
      <ChallengePreview challenge={challenge} />
    </div>
  )
}
```

### 4. Advanced Analytics & Insights ⏳

#### 4.1 Personal Analytics Dashboard
**File**: `/src/components/gamification/PersonalAnalytics.tsx`
```typescript
export function PersonalAnalytics() {
  const { data: stats } = usePersonalStats()
  
  return (
    <div className="space-y-6">
      <ProgressionChart
        data={stats.attributeHistory}
        title="Attribute Growth Over Time"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <HeatmapCalendar
          data={stats.activityHistory}
          title="Training Consistency"
        />
        
        <DifficultyProgression
          data={stats.difficultyHistory}
          title="Challenge Level Progress"
        />
      </div>
      
      <CategoryBreakdown
        data={stats.categoryDistribution}
        title="Training Focus Areas"
      />
      
      <PeerComparison
        myStats={stats}
        peerGroup={stats.ageGroup}
        title="How You Compare"
      />
    </div>
  )
}
```

## Testing Requirements

### Load Testing
- [ ] Season tier calculations with 10,000+ users
- [ ] League matchmaking performance
- [ ] Challenge search and filtering

### Feature Testing
- [ ] Season progression and reward claiming
- [ ] League promotion/relegation logic
- [ ] Challenge creation and sharing flow

### Community Testing
- [ ] Beta test with power users
- [ ] Gather feedback on challenge difficulty
- [ ] Monitor for exploits or gaming

## Success Metrics

- 60% of users engage with seasonal content
- 40% participate in leagues regularly
- 100+ player-created challenges in first month
- 25% increase in 90-day retention
- Premium pass conversion rate > 15%

## Implementation Strategy

1. **Soft Launch Seasons**: Start with simple 4-week seasons
2. **League Beta**: Test with opt-in users first
3. **Challenge Moderation**: Manual approval initially
4. **Analytics Rollout**: Start with basic metrics, expand based on usage

## Risk Mitigation

- **Burnout**: Implement rest weeks between seasons
- **Toxicity**: Strong moderation tools for challenges
- **Complexity**: Progressive disclosure of features
- **Technical**: Caching strategy for leaderboards

## Notes

- Consider partnerships for season themes
- Plan for international time zones in leagues
- Prepare content pipeline for seasonal rewards
- Build admin tools for challenge moderation

## Progress Log

- 2025-01-15: Task document created
- [Date]: [Update]