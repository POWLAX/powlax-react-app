# 🏆 **Gamification Master Contract - POWLAX Skills Academy**

*Created: August 13, 2025*  
*Status: ACTIVE DEVELOPMENT CONTRACT*  
*Priority: CRITICAL - Foundation for User Engagement*  
*Contract Owner: Patrick Chapla*  
*Implementation Pattern: Supabase Permanence Pattern*

---

## 🚨 **CRITICAL: MAXIMUM ULTRATHINK ANALYSIS APPLIED**

This contract represents a complete analysis of the existing POWLAX gamification system based on ACTUAL database tables and CSV data. Every requirement has been cross-referenced with existing data structures and the Skills Academy Master Contract to ensure seamless integration.

---

## 📊 **EXISTING DATABASE ANALYSIS (VERIFIED)**

### **✅ Current Badges System (54 Total Badges)**
**Source:** `src/components/gamification/Badges_POWLAX_Rows.csv`

#### **Attack Badges (IDs 89-98):**
- **89**: Crease Crawler - Finishing around the crease with finesse
- **90**: Wing Wizard - Master of wing play and creating opportunities  
- **91**: Ankle Breaker - Mastery of dodges and shaking defenders
- **92**: Seasoned Sniper - Expert marksman from any angle
- **93**: Time and Room Terror - Perfect shooting stroke with time and room
- **94**: On the Run Rocketeer - On-the-run shooting drills completion
- **95**: Island Isolator - Taking man to island and dominating under pressure
- **96**: Goalies Nightmare - Ultimate achievement for mastering every aspect of attack
- **97**: Rough Rider - Fierce commitment to defensive side of game
- **98**: Fast Break Finisher - Excellence in fast-break situations

#### **Defense Badges (IDs 99-107):**
- **99**: Hip Hitter - Mastery of body positioning drills
- **100**: Footwork Fortress - Master of defensive footwork and positioning
- **101**: Slide Master - Expert at team defense and slide recovery
- **102**: Close Quarters Crusher - Dominates tight defensive situations
- **103**: Ground Ball Gladiator - Wins majority of ground ball battles
- **104**: Consistent Clear - Reliable clearing from defensive zone
- **105**: Turnover Titan - Forces turnovers and disrupts offensive plays
- **106**: The Great Wall - Impenetrable defensive presence
- **107**: Silky Smooth - Effortless and smooth defensive play

#### **Midfield Badges (IDs 108-117):**
- **108**: Ground Ball Guru - Master of ground ball recovery in midfield
- **109**: 2 Way Tornado - Excellence at both offensive and defensive midfield play
- **110**: Wing Man Warrior - Dominates wing play and face-off situations
- **111**: Dodging Dynamo - Master of midfield dodging and ball movement
- **112**: Fast Break Starter - Initiates fast breaks and transition opportunities
- **113**: Shooting Sharp Shooter - Accurate shooter from midfield range
- **114**: Clearing Commander - Leads team in clearing ball upfield
- **115**: Middie Machine - Complete midfielder who excels in all aspects
- **116**: Determined D-Mid - Defensive midfielder with determination and grit
- **117**: Inside Man - Excellence at inside midfield play and ball control

#### **Wall Ball Badges (IDs 118-126):**
- **118**: Foundation Ace - Master of fundamental wall ball techniques
- **119**: Dominant Dodger - Uses wall ball to perfect dodging techniques
- **120**: Stamina Star - Demonstrates endurance in wall ball training
- **121**: Finishing Phenom - Perfects finishing skills through wall ball practice
- **122**: Bullet Snatcher - Quick hands and reflexes in wall ball drills
- **123**: Long Pole Lizard - Defensive players who excel at wall ball training
- **124**: Ball Hawk - Aggressive pursuit of loose balls in wall ball drills
- **125**: Wall Ball Wizard - Master of all wall ball techniques and variations
- **126**: Independent Improver - Self-motivated wall ball training and improvement

#### **Solid Start Badges (IDs 136-141):**
- **137**: Ball Mover - Learns to move ball effectively
- **138**: Dual Threat - Develops both offensive and defensive skills
- **139**: Sure Hands - Reliable catching and ball handling
- **140**: The Great Deceiver - Learns to fake and deceive opponents
- **141**: Both Badge - Competent in multiple areas of play

### **✅ Current Ranks System (10 Total Ranks)**
**Sources:** `src/components/gamification/POWLAX_player_ranks_rows.csv` & `rank_Academy_points_requirements.CSV`

#### **Current Academy Points Requirements (10x Multiplier Applied):**
1. **Lacrosse Bot** - 0 academy_points (Entry level)
2. **2nd Bar Syndrome** - 250 academy_points (25 × 10)
3. **Left Bench Hero** - 600 academy_points (60 × 10)  
4. **Celly King** - 1,000 academy_points (100 × 10)
5. **D-Mid Rising** - 1,400 academy_points (140 × 10)
6. **Lacrosse Utility** - 2,000 academy_points (200 × 10)
7. **Flow Bro** - 3,000 academy_points (300 × 10)
8. **Lax Beast** - 4,500 academy_points (450 × 10)
9. **Lax Ninja** - 6,000 academy_points (600 × 10)
10. **Lax God** - 10,000 academy_points (1,000 × 10)

### **✅ Series-to-Badge Mapping System**
**Source:** `docs/existing/Gamification/series_badges_link.csv`

#### **Series Completion Requirements:**
- **Solid Start Series**: 20 drills completion required
- **Attack/Defense/Midfield/Wall Ball Series**: 50 drills completion required

#### **Series Badge Linkages (Verified):**
**Attack Series → Badges:**
- A10 (Ladder Drills and North South Dodging) → Badge 91 (Ankle Breaker)
- A11 (Time and Room Out of a Dodge) → Badge 93 (Time and Room Terror)
- A12 (Ride Angles and Dodging Favorites) → Badge 97 (Rough Rider)
- A2 (Split Dodge and Shooting on the Run) → Badge 94 (On the Run Rocketeer)
- A3 (Finishing From X) → Badge 95 (Island Isolator)
- A4 (Catching, Faking, Crease Play) → Badge 89 (Crease Crawler)
- A5 (Running A Fast Break) → Badge 98 (Fast Break Finisher)
- A6 (Time and Room Shooting & Wind Up Dodging) → Badge 93 (Time and Room Terror)
- A7 (Wing Hesitation Dodges) → Badge 91 (Ankle Breaker)
- A8 (Shooting on the Run & Slide Em Dodging) → Badge 94 (On the Run Rocketeer)
- A9 (Inside Finishing & Roll Dodge) → Badge 91 (Ankle Breaker)

**Combination Badge:**
- **Badge 96 (Goalies Worst Nightmare)** = Seasoned Sniper + Crease Crawler + On the Run Rocketeer

**Defense Series → Badges:**
- D10 (4 Cone Series 3 & Defending at X) → Badge 102 (Close Quarters Crusher)
- D11 (Approach and Recover Top) → Badge 104 (Consistent Clear)
- D12 (Ladder Set 3 & Checking) → Badge 105 (Turnover Titan)
- D2 (4 Cone Footwork & Fast Break Defense) → Badge 101 (Slide Master)
- D3 (Approach and Recover Low Positions) → Badge 100 (Footwork Fortress)
- D4 (Ladder Drills & Defending at X) → Badge 102 (Close Quarters Crusher)
- D5 (Pipe Approaches & Stick Checks) → Badge 105 (Turnover Titan)
- D6 (4 Cone Series 2 & Sliding) → Badge 103 (Ground Ball Gladiator) + Badge 101 (Slide Master)
- D7 (Approach and Recover Sides) → Badge 100 (Footwork Fortress)
- D8 (Ladder Set 2 & Fast Break Defense) → Badge 107 (Silky Smooth)
- D9 (Pipe Approaches Group 3) → Badge 99 (Hip Hitter)

**Combination Badge:**
- **Badge 106 (The Great Wall)** = Footwork Fortress + Slide Master + Close Quarters Crusher

**Midfield Series → Badges:**
- M10 (Face Dodge Mastery) → Badge 112 (Fast Break Starter)
- M11 (Shooting on the Run & Slide Em) → Badge 113 (Shooting Sharp Shooter)
- M12 (Defensive Approaches & Fast Break) → Badge 116 (Determined D-Mid)
- M2 (Shooting Progression) → Badge 113 (Shooting Sharp Shooter)
- M3 (Catching, Faking, Inside Finishing) → Badge 117 (Inside Man)
- M4 (Defensive Footwork) → Badge 116 (Determined D-Mid)
- M5 (Wing Dodging) → Badge 110 (Wing Man Warrior)
- M6 (Time and Room & Wind Up Dodging) → Badge 111 (Dodging Dynamo)
- M7 (Split Dodge and Shoot on the Run) → Badge 111 (Dodging Dynamo)
- M8 (Ladder Footwork & Creative Dodging) → Badge 109 (2 Way Tornado)
- M9 (Inside Finishing & Hesitations) → Badge 117 (Inside Man)

**Combination Badge:**
- **Badge 115 (Middie Machine)** = Dodging Dynamo + Inside Man + Shooting Sharp Shooter

**Solid Start Series → Badges:**
- SS1 (Picking Up and Passing) → Badge 137 (Ball Mover)
- SS2 (Defense and Shooting) → Badge 138 (Dual Threat)
- SS3 (Catching and Hesitation) → Badge 139 (Sure Hands)
- SS4 (Wind Up Dodging) → Badge 140 (The Great Deceiver)
- SS5 (Switching Hands) → Badge 141 (Both Badge)

**Combination Badge:**
- **Badge 138 (Dual Threat)** = All 5 Solid Start badges

**Wall Ball Series → Badges:**
- WB1 (Master Fundamentals) → Badge 118 (Foundation Ace)
- WB2 (Dodging) → Badge 119 (Dominant Dodger)
- WB3 (Shooting) → Badge 122 (Bullet Snatcher)
- WB4 (Conditioning) → Badge 120 (Stamina Star)
- WB5 (Faking and Finishing) → Badge 121 (Finishing Phenom)
- WB6 (Catching Everything) → Badge 124 (Ball Hawk)
- WB7 (Long Pole) → Badge 123 (Long Pole Lizard)
- WB8 (Advanced and Fun) → Badge 125 (Wall Ball Wizard)

---

## 🎯 **NEW GAMIFICATION REQUIREMENTS**

### **1. Drill Completion Tracking System**

#### **A. Drill Counting Logic (Supabase Permanence Pattern)**
```sql
-- Direct column counting, no nested JSON extraction
SELECT 
  user_id,
  series_id,
  COUNT(DISTINCT drill_id) as drills_completed,
  array_agg(DISTINCT drill_id) as completed_drill_ids
FROM skills_academy_user_progress 
WHERE status = 'completed'
GROUP BY user_id, series_id;
```

#### **B. Series-Based Badge Eligibility**
```typescript
// Supabase Permanence Pattern - Direct column reads
interface BadgeEligibility {
  user_id: string;
  series_type: 'solid_start' | 'attack' | 'defense' | 'midfield' | 'wall_ball';
  drills_completed: number;
  drills_required: number; // 20 for solid_start, 50 for others
  is_eligible: boolean;
  badge_ids: number[];
  combination_eligible: boolean;
}

const checkBadgeEligibility = async (userId: string, seriesType: string) => {
  // Direct database column reads - no JSON extraction
  const { data: userProgress } = await supabase
    .from('skills_academy_user_progress')
    .select('drill_id, series_id, status')
    .eq('user_id', userId)
    .eq('status', 'completed');
  
  // Filter by series type from skills_academy_series table
  const { data: seriesData } = await supabase
    .from('skills_academy_series')
    .select('id, series_type')
    .eq('series_type', seriesType);
  
  const seriesIds = seriesData?.map(s => s.id) || [];
  const completedDrills = userProgress?.filter(p => 
    seriesIds.includes(p.series_id)
  ) || [];
  
  const drillsCompleted = completedDrills.length;
  const drillsRequired = seriesType === 'solid_start' ? 20 : 50;
  
  return {
    drills_completed: drillsCompleted,
    drills_required: drillsRequired,
    is_eligible: drillsCompleted >= drillsRequired
  };
};
```

### **2. Badge Award System Implementation**

#### **A. Database Schema (Following Permanence Pattern)**
```sql
-- Direct column mapping, no nested JSON
CREATE TABLE user_badge_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  badge_id INTEGER REFERENCES badge_powlax(id),
  series_type TEXT NOT NULL,
  drills_completed INTEGER DEFAULT 0,
  drills_required INTEGER NOT NULL,
  earned_at TIMESTAMP NULL,
  is_combination_badge BOOLEAN DEFAULT FALSE,
  required_badge_ids INTEGER[] DEFAULT '{}', -- For combination badges
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Track user badge awards
CREATE TABLE user_badge_awards (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  badge_id INTEGER REFERENCES badge_powlax(id),
  awarded_at TIMESTAMP DEFAULT NOW(),
  academy_points_earned INTEGER DEFAULT 0,
  drill_count_at_award INTEGER DEFAULT 0
);
```

#### **B. Badge Award Logic (Supabase RPC Functions)**
```sql
-- RPC function following permanence pattern
CREATE OR REPLACE FUNCTION award_series_badges(
  p_user_id UUID,
  p_series_type TEXT
) RETURNS JSON AS $$
DECLARE
  drills_completed INTEGER;
  drills_required INTEGER;
  eligible_badges INTEGER[];
  awarded_badges INTEGER[];
  badge_record RECORD;
BEGIN
  -- Get drill count for series type
  SELECT COUNT(DISTINCT sup.drill_id) INTO drills_completed
  FROM skills_academy_user_progress sup
  JOIN skills_academy_series sas ON sup.series_id = sas.id
  WHERE sup.user_id = p_user_id 
    AND sas.series_type = p_series_type
    AND sup.status = 'completed';
  
  -- Set requirements based on series type
  drills_required := CASE 
    WHEN p_series_type = 'solid_start' THEN 20
    ELSE 50
  END;
  
  -- Check if eligible
  IF drills_completed >= drills_required THEN
    -- Get badges for this series from series_badges_link
    SELECT array_agg(DISTINCT sbl.badge_id) INTO eligible_badges
    FROM series_badges_link sbl
    JOIN skills_academy_series sas ON sbl.series_id = sas.id
    WHERE sas.series_type = p_series_type
      AND sbl.combination_badges IS NULL; -- Not combination badges
    
    -- Award individual badges
    FOR badge_record IN 
      SELECT badge_id FROM unnest(eligible_badges) AS badge_id
      WHERE badge_id NOT IN (
        SELECT badge_id FROM user_badge_awards 
        WHERE user_id = p_user_id
      )
    LOOP
      INSERT INTO user_badge_awards (user_id, badge_id, academy_points_earned, drill_count_at_award)
      VALUES (p_user_id, badge_record.badge_id, 100, drills_completed);
      
      awarded_badges := array_append(awarded_badges, badge_record.badge_id);
    END LOOP;
    
    -- Check combination badges
    PERFORM check_combination_badges(p_user_id, p_series_type);
  END IF;
  
  RETURN json_build_object(
    'drills_completed', drills_completed,
    'drills_required', drills_required,
    'eligible', drills_completed >= drills_required,
    'awarded_badges', awarded_badges
  );
END;
$$ LANGUAGE plpgsql;
```

### **3. Combination Badge System**

#### **A. Combination Badge Logic**
```sql
CREATE OR REPLACE FUNCTION check_combination_badges(
  p_user_id UUID,
  p_series_type TEXT
) RETURNS VOID AS $$
DECLARE
  combo_badge_id INTEGER;
  required_badges INTEGER[];
  user_badges INTEGER[];
  has_all_required BOOLEAN;
BEGIN
  -- Get combination badges for series type
  FOR combo_badge_id, required_badges IN
    SELECT 
      sbl.badge_id,
      string_to_array(sbl.combination_badges, ' + ')::INTEGER[]
    FROM series_badges_link sbl
    JOIN skills_academy_series sas ON sbl.series_id = sas.id
    WHERE sas.series_type = p_series_type
      AND sbl.combination_badges IS NOT NULL
  LOOP
    -- Get user's current badges
    SELECT array_agg(badge_id) INTO user_badges
    FROM user_badge_awards
    WHERE user_id = p_user_id;
    
    -- Check if user has all required badges
    has_all_required := required_badges <@ user_badges;
    
    -- Award combination badge if eligible and not already awarded
    IF has_all_required AND combo_badge_id NOT IN (
      SELECT badge_id FROM user_badge_awards WHERE user_id = p_user_id
    ) THEN
      INSERT INTO user_badge_awards (user_id, badge_id, academy_points_earned)
      VALUES (p_user_id, combo_badge_id, 250); -- Higher points for combination
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### **4. Rank Advancement System**

#### **A. Real-Time Rank Calculation**
```typescript
// Following Supabase Permanence Pattern
interface UserRank {
  user_id: string;
  current_rank_id: number;
  current_rank_title: string;
  current_points: number;
  next_rank_id: number | null;
  next_rank_title: string | null;
  points_to_next_rank: number;
  rank_progress_percentage: number;
}

const calculateUserRank = async (userId: string): Promise<UserRank> => {
  // Direct column reads from user_points_wallets
  const { data: userPoints } = await supabase
    .from('user_points_wallets')
    .select('academy_points')
    .eq('user_id', userId)
    .single();
  
  const totalPoints = userPoints?.academy_points || 0;
  
  // Get rank thresholds (direct column mapping)
  const { data: ranks } = await supabase
    .from('powlax_player_ranks')
    .select('id, title, lax_credits_required')
    .order('rank_order');
  
  // Convert lax_credits to academy_points (10x multiplier)
  const rankThresholds = ranks?.map(rank => ({
    ...rank,
    academy_points_required: rank.lax_credits_required * 10
  })) || [];
  
  // Find current rank
  let currentRank = rankThresholds[0];
  let nextRank = null;
  
  for (let i = rankThresholds.length - 1; i >= 0; i--) {
    if (totalPoints >= rankThresholds[i].academy_points_required) {
      currentRank = rankThresholds[i];
      nextRank = rankThresholds[i + 1] || null;
      break;
    }
  }
  
  const pointsToNext = nextRank 
    ? nextRank.academy_points_required - totalPoints 
    : 0;
  
  const progressPercentage = nextRank
    ? ((totalPoints - currentRank.academy_points_required) / 
       (nextRank.academy_points_required - currentRank.academy_points_required)) * 100
    : 100;
  
  return {
    user_id: userId,
    current_rank_id: currentRank.id,
    current_rank_title: currentRank.title,
    current_points: totalPoints,
    next_rank_id: nextRank?.id || null,
    next_rank_title: nextRank?.title || null,
    points_to_next_rank: pointsToNext,
    rank_progress_percentage: Math.max(0, Math.min(100, progressPercentage))
  };
};
```

---

## 🔗 **SKILLS ACADEMY MASTER CONTRACT INTEGRATION**

### **Seamless Integration Points**

#### **A. Workout Completion Hook Integration**
```typescript
// Integration with existing Skills Academy workout completion
// File: src/app/(authenticated)/skills-academy/workout/[id]/page.tsx
const handleDrillComplete = async () => {
  // Existing point award logic...
  
  // NEW: Check for badge eligibility after each drill
  const seriesType = workout?.series?.series_type;
  if (seriesType && userId) {
    const badgeCheck = await supabase.rpc('award_series_badges', {
      p_user_id: userId,
      p_series_type: seriesType
    });
    
    // Trigger badge celebration if new badges earned
    if (badgeCheck.awarded_badges?.length > 0) {
      setBadgeEarned(badgeCheck.awarded_badges);
      triggerBadgeCelebration();
    }
  }
  
  // NEW: Check for rank advancement
  const newRank = await calculateUserRank(userId);
  if (newRank.current_rank_id > previousRankId) {
    triggerRankUpCelebration(newRank);
  }
};
```

#### **B. Point Counter Enhancement**
```typescript
// Enhancement to existing PointCounter component
// File: src/components/skills-academy/PointCounter.tsx
interface EnhancedPointCounterProps {
  points: Record<string, number>;
  seriesType?: string;
  userRank?: UserRank;
  userBadges?: BadgeProgress[];
  animate?: boolean;
}

const EnhancedPointCounter = ({ points, seriesType, userRank, userBadges }: EnhancedPointCounterProps) => {
  return (
    <div className="enhanced-point-counter">
      {/* Existing point display */}
      <div className="points-display">
        {/* Current point counter implementation */}
      </div>
      
      {/* NEW: Rank display */}
      <div className="rank-display">
        <img src={userRank?.icon_url} className="w-8 h-8" />
        <span>{userRank?.current_rank_title}</span>
        <Progress value={userRank?.rank_progress_percentage} />
      </div>
      
      {/* NEW: Badge progress */}
      <div className="badge-progress">
        {userBadges?.map(badge => (
          <div key={badge.badge_id} className="badge-progress-item">
            <img src={badge.icon_url} className="w-6 h-6" />
            <span>{badge.drills_completed}/{badge.drills_required}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🎯 **IMPLEMENTATION ROADMAP**

### **Phase 1: Database Foundation (Week 1)**
1. **Create Tables**: `user_badge_progress`, `user_badge_awards`
2. **Import Data**: Series-badge mappings from CSV
3. **Create RPC Functions**: `award_series_badges`, `check_combination_badges`
4. **Apply Permanence Pattern**: Direct column mapping throughout

### **Phase 2: Badge System Integration (Week 2)**
1. **Workout Completion Hooks**: Integrate badge checking with existing workout flow
2. **Badge Progress Tracking**: Real-time progress updates per series
3. **Combination Badge Logic**: Implement 3-badge combination requirements
4. **Badge Celebration Animations**: Enhanced point explosions for badges

### **Phase 3: Rank System Implementation (Week 3)**
1. **Rank Calculation Engine**: Real-time rank determination
2. **Rank Progress Display**: Integration with point counter
3. **Rank Up Celebrations**: Special animations for rank advancement
4. **Leaderboard Integration**: Rank-based user comparisons

### **Phase 4: UI Enhancement (Week 4)**
1. **Enhanced Point Counter**: Rank and badge progress display
2. **Badge Gallery**: User badge collection view
3. **Progress Dashboard**: Comprehensive gamification overview
4. **Mobile Optimization**: Touch-friendly badge and rank interfaces

---

## ✅ **SUCCESS CRITERIA**

### **Badge System**
- [ ] Solid Start badges awarded after 20 drills completed
- [ ] Attack/Defense/Midfield/Wall Ball badges awarded after 50 drills completed
- [ ] Combination badges awarded when 3 required badges earned
- [ ] Badge progress tracked in real-time during workouts
- [ ] Badge celebrations trigger on award

### **Rank System**
- [ ] Ranks calculated based on 10x multiplier (250, 600, 1000, etc. points)
- [ ] Rank progress displayed in point counter
- [ ] Rank up celebrations trigger on advancement
- [ ] All 10 ranks properly mapped and functional

### **Integration Quality**
- [ ] Seamless integration with existing Skills Academy workflow
- [ ] No disruption to current point system
- [ ] Supabase Permanence Pattern applied throughout
- [ ] Mobile-optimized badge and rank displays
- [ ] Real-time updates without performance impact

### **Data Integrity**
- [ ] All 54 existing badges properly mapped to series
- [ ] All 10 existing ranks properly configured
- [ ] Combination badge logic working for 4 special badges
- [ ] Progress tracking accurate across all series types
- [ ] Database operations atomic and consistent

---

## 🔔 **NOTIFICATION REQUIREMENTS**

Following the Claude-to-Claude Sub Agents Work Flow, all implementations must:

1. **Return structured JSON responses** with quality metrics
2. **Apply Supabase Permanence Pattern** for all database operations
3. **Integrate seamlessly** with existing Skills Academy Master Contract
4. **Provide real-time updates** without performance degradation
5. **Include comprehensive testing** for all badge and rank logic
6. **Maintain mobile-first design** principles throughout
7. **Execute completion notifications** when implementation ready

---

**This contract serves as the definitive specification for implementing the complete POWLAX gamification system based on actual existing data structures and proven patterns. All development must follow this contract exactly to ensure successful integration with the current Skills Academy system.**