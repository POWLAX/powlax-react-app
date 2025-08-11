# 🎮 **POWLAX Gamification Implementation Contract**

*Created: 2025-01-11 | Last Updated: 2025-01-11 | Status: READY FOR IMPLEMENTATION*  
*Contract Owner: Patrick Chapla | Phase: 001 - Core Gamification Setup*  
*Scope: Complete gamification system for Skills Academy*  
*Dev Server: KEEP RUNNING on port 3000*

--- This has nothing to do with badges, once implemented, lets do the badges.

## 🚨 **CRITICAL: THIS BLOCKS 80% OF SKILLS ACADEMY FEATURES**

Gamification MUST be implemented before:
- Timer enforcement (needs points to matter)
- Track system (needs point bonuses)
- Streak tracking (needs point persistence)
- Multipliers (needs base system)
- Progress tracking (needs data to show)

---

## 🗄️ **EXISTING SUPABASE TABLES (VERIFIED FROM SCREENSHOTS)**

### **1. `user_points_wallets` TABLE (EXISTS - EMPTY)**
```sql
Columns:
- id (uuid) - Primary key
- user_id (uuid) - References users.id
- currency (text) - Point type name
- balance (int8) - Current point balance
- updated_at (timestamp) - Last update time

Purpose: Stores current point balances per user per currency type
Status: Table exists but empty - needs initial records
```

### **2. `user_badge_progress_powlax` TABLE (EXISTS - EMPTY)**
```sql
Columns:
- id (int4) - Primary key
- user_id (uuid) - References users.id
- badge_id (int4) - References badges_powlax.id
- progress (int4) - Current progress toward badge
- earned_count (int4) - Times badge has been earned
- first_earned_at (timestamp) - First time earned

Purpose: Tracks progress toward earning badges
Status: Table exists but empty - needs integration
```

### **3. `webhook_events` TABLE (EXISTS - EMPTY)** (We are going to migrate data from Wordpress into the new Supabase structure and house all of the data in supabase, so this won't be needed.  Please make sure to update yourself on the new Authorization flow.  It has been essential in creating perminance within the practice planner.  The hybrid Auth was creating way to many issues)
```sql
Columns:
- id (uuid) - Primary key
- user_id (uuid) - References users.id
- auth_token (text) - Authentication token
- refresh_token (text) - Refresh token for re-auth

Purpose: Webhook event tracking for external integrations
Status: Table exists but may not be needed for MVP
```

### **4. `user_rank_progress_powlax` TABLE (EXISTS - EMPTY)**
```sql
Columns:
- id (int4) - Primary key
- user_id (uuid) - References users.id
- current_rank_id (int4) - References powlax_player_ranks.id
- previous_rank_id (int4) - Previous rank ID
- rank_achieved_at (timestamp) - When rank was achieved
- created_at (timestamp) - Record creation time

Purpose: Tracks user rank progression over time
Status: Table exists but empty - needs rank calculation logic
```

### **5. `skills_academy_user_progress` TABLE (EXISTS - 0 RECORDS)**
```sql
Columns:
- id (uuid) - Primary key
- user_id (uuid) - References users.id
- action (text) - Type of action taken
- entity_type (text) - What entity (drill, workout, etc.)

Purpose: Tracks user progress through Skills Academy
Status: Table exists, confirmed working per your note
```

### **6. Supporting Tables (ALREADY POPULATED)**
```sql
✅ badges_powlax - Badge definitions (populated)
✅ point_types_powlax - Point currency definitions (populated)
✅ powlax_player_ranks - Rank tiers (populated)
✅ skills_academy_drills - Has point_values JSONB column
✅ skills_academy_workouts - Has point_values JSONB column
✅ skills_academy_series - Series definitions
✅ wall_ball_drill_library - Has point values
```

---

## 📊 **POINT SYSTEM ARCHITECTURE**

### **Point Types (From point_types_powlax)**
```javascript
{
  "lax_credits": "Universal currency for all activities", - These will be earned for every drill a player does within an actual online skills academy workout.  I have have renamed them "Academy Points" in the supabase database.  Please create a SQL for adding a column to the point_types_powlax that has a legacy slug with "lax-credits" listed for Academy Points.
  "attack_tokens": "Earned from attack-focused drills", - These will be earned for every drill completed within workout within the skills_academy_series with the `attack' series type. 
  "defense_dollars": "Earned from defense drills", - These will be earned for every drill completed within workout within the skills_academy_series with the `defense' series type.
  "midfield_medals": "Earned from midfield drills", - These will be earned for every drill completed within workout within the skills_academy_series with the `midfield' series type.
  "rebound_rewards": "Wall ball specific points", - These will be earned for every drill completed within workout within the skills_academy_series with the `wall_ball' series type.
  "flex_points": "Bonus/special event points" - These are replacements for the lax_credits for workouts that players do outside of the academy, - So, if a player does a private lesson with a coach, or does their own wall ball workout, they will get these by logging what they did in their workout on their own.  The logging of workouts with the skills_academy_series tag of 'self_guided' with Attack, Defense, Midfield, and Wall Ball associations. that is not yet in the system.  These should have 5, 10, and 15 drill variants where the users will earn exactly as many points as there are drills or minutes of wall ball.  The question should be "How many drills did you do during your focused practice session"
}
```

### **Point Values in Drills/Workouts (JSONB Structure)**
```javascript
// In skills_academy_drills.point_values
{
  "lax_credit": 10,
  "attack_token": 10,    
  "defense_dollar": 10,  
  "midfield_medal": 10,   
  "rebound_reward": 10, 
  "flex_points": 10, - needs to be added if not there
}

// Multipliers apply to base values:
// - Completion of drills: 1x for 1-4, 1.2x 5-9, 1.5x 10+.
// - Streak: 1.15x (3+ days of Completed Workouts NOT INCLUDING FLEX POINTS) or 1.3x (7+ days with completed workouts)
// - Track bonus: 1.25x (in active track)
```

---

## 🎯 **PHASE 001: CORE GAMIFICATION SETUP**

### **Objectives:** (Don't need API End Points Now Use Supabase Only)
1. Create API endpoints for point/progress persistence
2. Initialize user_points_wallets for all users
3. Connect drill completion to point awards
4. Implement point calculation from drill/workout JSONB
5. Create transaction logging for audit trail

### **Tasks:**

#### **Task 1: Database Setup**
```sql
-- 1. Create points_transactions_powlax table (if not exists)
CREATE TABLE IF NOT EXISTS points_transactions_powlax (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  currency TEXT NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earned', 'spent', 'bonus'
  source_type TEXT, -- 'workout', 'drill', 'streak', 'achievement'
  source_id TEXT, -- workout_id or drill_id
  multipliers_applied JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create workout_completions table (if not exists)
CREATE TABLE IF NOT EXISTS workout_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  workout_id INTEGER REFERENCES skills_academy_workouts(id),
  series_id INTEGER REFERENCES skills_academy_series(id),
  drill_ids INTEGER[],
  drills_completed INTEGER,
  total_drills INTEGER,
  completion_percentage DECIMAL(5,2),
  points_earned JSONB,
  time_taken_seconds INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Initialize user_points_wallets for existing users
INSERT INTO user_points_wallets (user_id, currency, balance)
SELECT 
  u.id,
  pt.currency_code,
  0
FROM users u
CROSS JOIN point_types_powlax pt
ON CONFLICT DO NOTHING;
```

#### **Task 2: API Endpoint Creation**
```typescript
// /src/app/api/workouts/progress/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const { 
    user_id, 
    workout_id, 
    drills_completed, 
    total_drills,
    completion_percentage,
    time_taken_seconds 
  } = body;

  // 1. Get workout and drill point values
  const workout = await getWorkoutWithDrills(workout_id);
  
  // 2. Calculate base points from JSONB
  const basePoints = calculateBasePoints(workout, completion_percentage);
  
  // 3. Apply multipliers
  const multipliers = getMultipliers(user_id, completion_percentage);
  const finalPoints = applyMultipliers(basePoints, multipliers);
  
  // 4. Save in transaction
  await supabase.rpc('award_points_transaction', {
    p_user_id: user_id,
    p_points: finalPoints,
    p_workout_id: workout_id,
    p_completion: completion_percentage
  });
  
  return NextResponse.json({ 
    success: true, 
    points: finalPoints 
  });
}
```

#### **Task 3: Point Calculation Logic**
```typescript
// /src/lib/gamification/point-calculator.ts
interface DrillPoints {
  lax_credit: number;
  attack_token?: number;
  defense_dollar?: number;
  midfield_medal?: number;
  rebound_reward?: number;
}

export function calculateWorkoutPoints(
  workout: Workout,
  drills: Drill[],
  completionPercentage: number
): PointBreakdown {
  // 1. Sum base points from all completed drills
  const basePoints = drills.reduce((acc, drill) => {
    const drillPoints = drill.point_values as DrillPoints;
    return {
      lax_credit: acc.lax_credit + (drillPoints.lax_credit || 0),
      attack_token: acc.attack_token + (drillPoints.attack_token || 0),
      defense_dollar: acc.defense_dollar + (drillPoints.defense_dollar || 0),
      midfield_medal: acc.midfield_medal + (drillPoints.midfield_medal || 0),
      rebound_reward: acc.rebound_reward + (drillPoints.rebound_reward || 0)
    };
  }, {
    lax_credit: 0,
    attack_token: 0,
    defense_dollar: 0,
    midfield_medal: 0,
    rebound_reward: 0
  });

  // 2. Apply completion multiplier
  const completionMultiplier = completionPercentage === 100 ? 2.0 : 1.0;
  
  // 3. Return calculated points
  return Object.entries(basePoints).reduce((acc, [key, value]) => {
    acc[key] = Math.floor(value * completionMultiplier);
    return acc;
  }, {} as PointBreakdown);
}
```

#### **Task 4: Update Skills Academy Pages**
```typescript
// In workout/[id]/page.tsx - Replace TEST_USER_ID section
const { user } = useAuth();
const userId = user?.id;

// In handleMarkComplete function
const saveProgress = async (isComplete = false) => {
  if (!userId || !workout) return;
  
  const response = await fetch('/api/workouts/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      workout_id: workoutId,
      drills_completed: completedDrills.size,
      total_drills: drills.length,
      completion_percentage: (completedDrills.size / drills.length) * 100,
      time_taken_seconds: drillTimer
    })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('Points awarded:', data.points);
    // Update UI with points
  }
};
```

---

## 🔧 **DATABASE FUNCTIONS NEEDED**

### **1. Award Points Transaction (RPC Function)**
```sql
CREATE OR REPLACE FUNCTION award_points_transaction(
  p_user_id UUID,
  p_points JSONB,
  p_workout_id INTEGER,
  p_completion DECIMAL
) RETURNS JSONB AS $$
DECLARE
  v_currency TEXT;
  v_amount INTEGER;
  v_result JSONB = '{}';
BEGIN
  -- Loop through each point type
  FOR v_currency, v_amount IN 
    SELECT key, value::INTEGER 
    FROM jsonb_each_text(p_points)
  LOOP
    -- Update wallet balance
    INSERT INTO user_points_wallets (user_id, currency, balance)
    VALUES (p_user_id, v_currency, v_amount)
    ON CONFLICT (user_id, currency) 
    DO UPDATE SET 
      balance = user_points_wallets.balance + v_amount,
      updated_at = NOW();
    
    -- Log transaction
    INSERT INTO points_transactions_powlax (
      user_id, currency, amount, 
      transaction_type, source_type, source_id
    ) VALUES (
      p_user_id, v_currency, v_amount,
      'earned', 'workout', p_workout_id::TEXT
    );
  END LOOP;
  
  -- Check badge eligibility
  PERFORM check_badge_eligibility(p_user_id);
  
  RETURN p_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **2. Get User Point Balances**
```sql
CREATE OR REPLACE FUNCTION get_user_points(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_object_agg(currency, balance)
  FROM user_points_wallets
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 🧪 **TESTING CHECKLIST**

### **Phase 001 Tests:**
- [ ] User completes workout → points saved to user_points_wallets
- [ ] Points transaction logged in points_transactions_powlax
- [ ] Partial completion (50%) → 1x multiplier applied
- [ ] Full completion (100%) → 2x multiplier applied
- [ ] API endpoint returns correct point breakdown
- [ ] Database functions execute without errors
- [ ] RLS policies allow user to read own points
- [ ] Patrick@powlax.com authentication works

### **Playwright Test Suite:**
```javascript
// tests/e2e/gamification.spec.ts
test('Points persist after workout completion', async ({ page }) => {
  // 1. Login as patrick@powlax.com
  // 2. Complete a workout
  // 3. Check points displayed
  // 4. Refresh page
  // 5. Verify points still show
  // 6. Check database for records
});
```

---

## 📝 **MIGRATION LOGGING**

### **Required Migrations:**
```sql
-- 085_gamification_point_persistence.sql
-- Creates points_transactions_powlax table
-- Creates workout_completions table
-- Adds RPC functions for point awards

-- 086_initialize_user_wallets.sql  
-- Populates user_points_wallets for all users
-- Sets initial balances to 0

-- 087_gamification_rls_policies.sql
-- Users can read own point balances
-- Users can read own transactions
-- Service role can update all
```

---

## ✅ **SUCCESS CRITERIA**

### **MVP Requirements:**
- [ ] Points persist to database after workout
- [ ] User can see point balances on workout page
- [ ] Transaction history is logged
- [ ] Completion percentage affects points correctly
- [ ] Authentication works (no TEST_USER_ID)
- [ ] API endpoints return correct data

### **Post-MVP Enhancements:**
- [ ] Streak tracking and bonuses
- [ ] Badge progress calculation
- [ ] Rank progression
- [ ] Leaderboards
- [ ] Team competitions

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Before Deployment:**
1. Run all migrations in order
2. Verify tables have correct columns
3. Test with patrick@powlax.com account
4. Check RLS policies work
5. Confirm API endpoints accessible

### **Deployment Steps:**
```bash
# 1. Apply migrations
npx supabase db push

# 2. Initialize wallets
npx tsx scripts/initialize-user-wallets.ts

# 3. Test API endpoint
curl -X POST http://localhost:3000/api/workouts/progress \
  -H "Content-Type: application/json" \
  -d '{"user_id": "...", "workout_id": 1, ...}'

# 4. Run Playwright tests
npx playwright test gamification.spec.ts
```

---

## 📊 **EVALUATION CRITERIA FOR PATRICK**

After implementation, test these specific scenarios:

1. **Basic Point Award:**
   - Complete 3 drills in a workout
   - See points displayed immediately
   - Check `user_points_wallets` table for balance

2. **Multiplier Test:**
   - Complete 50% of workout → get base points
   - Complete 100% of workout → get 2x points
   - Verify in `points_transactions_powlax`

3. **Point Type Distribution:**
   - Do attack workout → get attack_tokens
   - Do defense workout → get defense_dollars
   - Do wall ball → get rebound_rewards
   - All should also get lax_credits

4. **Persistence Test:**
   - Complete workout
   - Close browser completely
   - Reopen and login
   - Points should still be there

---

## 🔄 **HANDOFF NOTES**

### **For Sub-Agents:**
1. This contract is CRITICAL - blocks most Skills Academy features
2. Test EVERY database operation before marking complete
3. Use patrick@powlax.com for testing (not TEST_USER_ID)
4. Update this document with any changes made
5. Run Playwright tests before handoff

### **Next Steps After Gamification:**
1. Timer enforcement (Phase 002 of Skills Academy)
2. Streak tracking system
3. Track system (ELITE/EXPERIENCE)
4. Badge eligibility checking
5. Rank progression calculation

---

*END OF CONTRACT - Ready for Phase 001 Implementation*