# POWLAX Stage 2 Implementation Guide
## Skills Academy & Gamification System (Weeks 3-4)

### 🎯 Stage 2 Goals
1. Replace LearnDash with integrated understanding checks
2. Fix GamiPress point calculations (5-drill workout = 5x points)
3. Build Skills Academy with proper progress tracking
4. Enable coach-created quizzes from practice plans

---

## 📋 Database Tables to Create

### Section 1: Skills Academy Tables
*Reference: v3-complete-supabase-schema.md - Section 1 & Section 5*

#### 1.1 Academy-Specific Tables
```sql
-- 1. Academy Drills (individual skill development)
-- See v3 schema: Table 2 - Skills Academy Drills (academy_drills)
CREATE TABLE academy_drills (
  -- Copy full schema from v3 document, Section 1, Table 2
  -- This is separate from team drills!
);

-- 2. Workouts (drill collections)
-- See v3 schema: Table 20 - Workouts (workouts)
CREATE TABLE workouts (
  -- Copy full schema from v3 document, Section 5, Table 20
);

-- 3. User Progress Tracking
-- See v3 schema: Table 22 - User Progress (user_progress)
CREATE TABLE user_progress (
  -- Copy full schema from v3 document, Section 6, Table 22
  -- Include new columns: skill_mastery_level, concepts_understood, etc.
);
```

**Quick Setup Prompt for AI:**
> "Using the v3-complete-supabase-schema.md document, create the SQL for:
> 1. Table 2 (academy_drills) from Section 1
> 2. Table 20 (workouts) from Section 5  
> 3. Table 22 (user_progress) from Section 6
> Include all columns and constraints."

### Section 2: Gamification Tables
*Replacing GamiPress with proper system*

#### 2.1 Points and Badges System
```sql
-- 1. Points Ledger (complete history)
CREATE TABLE points_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES auth.users(id),
  
  -- Point details
  points INTEGER NOT NULL,
  point_type TEXT CHECK (point_type IN (
    'lax_credits', 'attack_tokens', 'defense_dollars',
    'midfield_medals', 'flex_points', 'rebound_rewards'
  )),
  
  -- What earned these points
  source_type TEXT NOT NULL, -- 'drill', 'workout', 'quiz', 'bonus'
  source_id UUID, -- drill_id, workout_id, etc.
  
  -- Multiplier tracking (fixes your problem!)
  base_points INTEGER,
  multiplier DECIMAL(3,2) DEFAULT 1.0,
  workout_length INTEGER, -- Number of drills in workout
  
  -- Metadata
  description TEXT,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Badges
CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  
  -- Earning criteria
  badge_type TEXT, -- 'workout_completion', 'skill_mastery', 'streak'
  required_count INTEGER DEFAULT 5, -- e.g., complete 5 attack workouts
  point_threshold INTEGER, -- Alternative: earn X points
  
  -- What triggers this badge
  workout_category TEXT, -- 'attack', 'defense', etc.
  skill_ids INTEGER[], -- Which skills must be mastered
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Player Badges (achievements)
CREATE TABLE player_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES auth.users(id),
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trigger_activity_id UUID, -- What specific activity earned this
  
  UNIQUE(player_id, badge_id)
);

-- 4. Player Ranks (based on total Lax Credits)
CREATE TABLE ranks (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  min_lax_credits INTEGER,
  max_lax_credits INTEGER,
  icon_url TEXT
);

-- Insert default ranks
INSERT INTO ranks (name, min_lax_credits, max_lax_credits) VALUES
('Rookie', 0, 99),
('Developing', 100, 249),
('Intermediate', 250, 499),
('Advanced', 500, 999),
('Elite', 1000, NULL);
```

**Migration Prompt for GamiPress Data:**
> "Create a SQL script to migrate existing GamiPress data:
> 1. Extract user points from wp_gamipress_user_earnings
> 2. Convert to new points_ledger format
> 3. Recalculate with proper workout multipliers
> 4. Preserve earned badges and ranks"

### Section 3: Assessment & Quiz Tables
*Replacing LearnDash quizzes*

#### 3.1 Understanding Checks System
```sql
-- 1. Understanding Checks (quiz definitions)
CREATE TABLE understanding_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id), -- NULL for POWLAX official
  
  -- Quiz details
  title TEXT NOT NULL,
  description TEXT,
  
  -- What it tests
  drill_ids UUID[], -- Related drills
  workout_ids UUID[], -- Related workouts
  skill_ids INTEGER[], -- Skills being tested
  
  -- Settings
  passing_score INTEGER DEFAULT 80,
  points_awarded INTEGER DEFAULT 10,
  attempts_allowed INTEGER DEFAULT 3,
  
  -- Permissions
  is_official BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Check Questions
CREATE TABLE check_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  check_id UUID REFERENCES understanding_checks(id) ON DELETE CASCADE,
  
  -- Question content
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  media_url TEXT, -- Video or image for question
  
  -- Answer options
  options JSONB, -- [{id: 1, text: "Answer", correct: true}, ...]
  correct_answer_ids INTEGER[],
  
  -- Feedback
  explanation TEXT,
  hint TEXT,
  
  order_index INTEGER
);

-- 3. Player Attempts
CREATE TABLE check_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES auth.users(id),
  check_id UUID REFERENCES understanding_checks(id),
  
  -- Results
  score INTEGER,
  passed BOOLEAN,
  time_taken_seconds INTEGER,
  
  -- Detailed results
  answers JSONB, -- [{question_id: uuid, selected: [1,2], correct: true}, ...]
  
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Coach Quiz Creation Prompt:**
> "Create a PostgreSQL function that:
> 1. Takes a practice_plan_id and coach_id
> 2. Auto-generates an understanding check from the practice drills
> 3. Creates starter questions based on drill content
> 4. Returns the new check_id for coach to customize"

---

## 🎮 Gamification Implementation

### Point Calculation Functions
```sql
-- Proper workout point calculation
CREATE OR REPLACE FUNCTION calculate_workout_points(
  p_player_id UUID,
  p_workout_id UUID,
  p_drills_completed INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_base_points INTEGER;
  v_total_points INTEGER;
  v_point_type TEXT;
BEGIN
  -- Get workout details
  SELECT 
    point_value,
    CASE 
      WHEN category = 'attack' THEN 'attack_tokens'
      WHEN category = 'defense' THEN 'defense_dollars'
      WHEN category = 'midfield' THEN 'midfield_medals'
      WHEN category = 'goalie' THEN 'rebound_rewards'
      ELSE 'lax_credits'
    END
  INTO v_base_points, v_point_type
  FROM workouts
  WHERE id = p_workout_id;
  
  -- Calculate with multiplier (fixes 5-drill = 5x points)
  v_total_points := v_base_points * p_drills_completed;
  
  -- Award points
  INSERT INTO points_ledger (
    player_id, points, point_type, source_type, source_id,
    base_points, multiplier, workout_length
  ) VALUES (
    p_player_id, v_total_points, v_point_type, 'workout', p_workout_id,
    v_base_points, p_drills_completed::DECIMAL, p_drills_completed
  );
  
  -- Also award Lax Credits (universal currency)
  INSERT INTO points_ledger (
    player_id, points, point_type, source_type, source_id
  ) VALUES (
    p_player_id, v_total_points, 'lax_credits', 'workout', p_workout_id
  );
  
  -- Check for badges
  PERFORM check_badge_completion(p_player_id, p_workout_id);
  
  RETURN v_total_points;
END;
$$ LANGUAGE plpgsql;

-- Badge checking
CREATE OR REPLACE FUNCTION check_badge_completion(
  p_player_id UUID,
  p_workout_id UUID
) RETURNS VOID AS $$
DECLARE
  v_workout_category TEXT;
  v_completion_count INTEGER;
BEGIN
  -- Get workout category
  SELECT category INTO v_workout_category
  FROM workouts WHERE id = p_workout_id;
  
  -- Count completions in this category
  SELECT COUNT(DISTINCT source_id) INTO v_completion_count
  FROM points_ledger
  WHERE player_id = p_player_id
    AND source_type = 'workout'
    AND source_id IN (
      SELECT id FROM workouts WHERE category = v_workout_category
    );
  
  -- Award badge if threshold met (5 completions)
  IF v_completion_count >= 5 THEN
    INSERT INTO player_badges (player_id, badge_id, trigger_activity_id)
    SELECT 
      p_player_id, 
      b.id,
      p_workout_id
    FROM badges b
    WHERE b.workout_category = v_workout_category
      AND b.required_count = 5
    ON CONFLICT (player_id, badge_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 🖥️ Required React Pages for Stage 2

### Skills Academy Pages
1. **Academy Home** (`app/academy/page.tsx`)
   - Personalized workout recommendations
   - Continue training button
   - Progress snapshot

2. **Workout Browser** (`app/academy/workouts/page.tsx`)
   - Categories: Attack, Midfield, Defense, Goalie
   - Difficulty levels
   - Point values displayed

3. **Drill Player** (`app/academy/drill/[id]/page.tsx`)
   - Video player (Vimeo/YouTube)
   - Instructions
   - Mark complete button
   - Points animation

4. **Progress Dashboard** (`app/academy/progress/page.tsx`)
   - All 6 point types displayed
   - Badge collection
   - Skill mastery levels
   - Workout history

5. **Team Leaderboard** (`app/academy/leaderboard/page.tsx`)
   - Team rankings by Lax Credits
   - Individual achievements
   - Recent activity feed

### Assessment Pages
6. **Lax Skill Check** (`app/academy/skill-check/page.tsx`)
   - 6-question initial assessment
   - Personalized recommendations
   - Re-take option

7. **Understanding Check** (`app/academy/quiz/[id]/page.tsx`)
   - Multiple choice questions
   - 80% passing requirement
   - Immediate feedback
   - Retry logic

**Page Generation Prompt:**
> "Create a Next.js 13+ page for the Drill Player that:
> 1. Embeds Vimeo/YouTube videos responsively
> 2. Tracks video completion (not just page visit)
> 3. Awards points with animation on completion
> 4. Shows related drills from same workout
> 5. Updates team activity feed automatically"

---

## 📊 Progress Tracking Queries

### Player Analytics Views
```sql
-- Create materialized view for performance
CREATE MATERIALIZED VIEW player_academy_stats AS
SELECT 
  p.id as player_id,
  p.full_name,
  p.team_ids[1] as primary_team_id,
  
  -- Point totals by type
  COALESCE(SUM(pl.points) FILTER (WHERE pl.point_type = 'lax_credits'), 0) as total_lax_credits,
  COALESCE(SUM(pl.points) FILTER (WHERE pl.point_type = 'attack_tokens'), 0) as attack_tokens,
  COALESCE(SUM(pl.points) FILTER (WHERE pl.point_type = 'defense_dollars'), 0) as defense_dollars,
  -- ... other point types
  
  -- Activity metrics
  COUNT(DISTINCT pl.source_id) FILTER (WHERE pl.source_type = 'drill') as drills_completed,
  COUNT(DISTINCT pl.source_id) FILTER (WHERE pl.source_type = 'workout') as workouts_completed,
  
  -- Current rank
  r.name as current_rank,
  
  -- Badge count
  COUNT(DISTINCT pb.badge_id) as badges_earned,
  
  -- Last activity
  MAX(pl.awarded_at) as last_active_at
  
FROM user_profiles p
LEFT JOIN points_ledger pl ON p.id = pl.player_id
LEFT JOIN player_badges pb ON p.id = pb.player_id
LEFT JOIN ranks r ON pl.points BETWEEN r.min_lax_credits AND COALESCE(r.max_lax_credits, 999999)
WHERE p.role = 'player'
GROUP BY p.id, p.full_name, p.team_ids[1], r.name;

-- Refresh periodically
CREATE OR REPLACE FUNCTION refresh_player_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY player_academy_stats;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔄 Data Migration from WordPress

### LearnDash Quiz Migration
**Migration Prompt:**
> "Create a Node.js script that:
> 1. Exports LearnDash quizzes via WordPress REST API
> 2. Maps quiz questions to new understanding_checks format
> 3. Preserves the 80% passing requirement
> 4. Links quizzes to appropriate drills/workouts"

### Video Tracking Migration
```javascript
// Migrate from basic completion to actual viewing
async function migrateVideoProgress() {
  // Get LearnDash lesson completions
  const completions = await wordpress.get('/ldlms/v2/users/{id}/course-progress');
  
  // Convert to new progress format
  for (const completion of completions) {
    await supabase.from('user_progress').insert({
      user_id: mapWordPressToSupabase(completion.user_id),
      content_id: mapLessonToDrill(completion.lesson_id),
      content_type: 'drill',
      status: 'completed',
      completion_percentage: 100,
      completed_at: completion.completed_date
    });
  }
}
```

---

## 🚀 Implementation Checklist

### Week 3: Academy Foundation
- [ ] Create academy_drills and workouts tables
- [ ] Set up points_ledger with proper multipliers
- [ ] Implement badge system
- [ ] Create understanding_checks tables
- [ ] Build point calculation functions

### Week 4: Academy Interface
- [ ] Academy home with recommendations
- [ ] Drill player with video tracking
- [ ] Progress dashboard with all metrics
- [ ] Team leaderboard
- [ ] Understanding check interface
- [ ] Integrate with team activity feed

---

## 🎯 Testing Scenarios

### Verify Point Calculations
```sql
-- Test: 5-drill workout should give 5x base points
INSERT INTO points_ledger (player_id, points, point_type, workout_length, base_points)
VALUES 
  ('test-player-id', 50, 'lax_credits', 5, 10);

-- Verify correct calculation
SELECT 
  workout_length,
  base_points,
  points,
  points = (base_points * workout_length) as calculation_correct
FROM points_ledger
WHERE player_id = 'test-player-id';
```

### Badge Award Testing
```sql
-- Check if player should have earned badge
WITH workout_completions AS (
  SELECT 
    player_id,
    COUNT(DISTINCT source_id) as completion_count
  FROM points_ledger
  WHERE source_type = 'workout'
    AND source_id IN (SELECT id FROM workouts WHERE category = 'attack')
  GROUP BY player_id
)
SELECT 
  wc.*,
  CASE WHEN wc.completion_count >= 5 THEN 'Should have badge' ELSE 'Not yet' END as badge_status
FROM workout_completions wc;
```

---

## 🔐 Security Considerations

**RLS Policies for Academy:**
```sql
-- Players can only see their own progress
CREATE POLICY "Players view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Coaches can view their team's progress
CREATE POLICY "Coaches view team progress" ON user_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = user_progress.user_id
        AND tm.team_id IN (
          SELECT team_id FROM team_members 
          WHERE user_id = auth.uid() AND role = 'coach'
        )
    )
  );

-- Parents can view their children's progress
CREATE POLICY "Parents view children progress" ON user_progress
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE parent_id = auth.uid()
    )
  );
```

---

## 📱 Mobile Considerations

### Video Player Optimization
```typescript
// Responsive video component
function DrillVideo({ videoUrl, onComplete }: Props) {
  // Detect platform and optimize
  const isVimeo = videoUrl.includes('vimeo');
  const isYouTube = videoUrl.includes('youtube');
  
  // Track actual viewing, not just page load
  const handleVideoEnd = () => {
    trackVideoCompletion();
    onComplete();
  };
  
  return (
    <div className="aspect-video w-full">
      {isVimeo && <VimeoPlayer onEnd={handleVideoEnd} />}
      {isYouTube && <YouTubePlayer onEnd={handleVideoEnd} />}
    </div>
  );
}
```

---

## 🆘 Common Issues & Solutions

**Issue: Points not calculating correctly**
> Check: workout_length field in points_ledger
> Solution: Ensure multiplier logic in calculate_workout_points()

**Issue: Badges not awarding**
> Check: badge criteria matches workout categories
> Solution: Run check_badge_completion() manually

**Issue: Videos not tracking completion**
> Check: Video player event handlers
> Solution: Use platform-specific APIs (Vimeo Player API, YouTube IFrame API)

---

## Next Stage Preview
Stage 3 will add:
- Complete taxonomy system (13 tables)
- Advanced skill progressions
- Meta skills and situations
- Comprehensive analytics
- Assessment tools

Save this document as `powlax-stage2-implementation.md` for reference during weeks 3-4 of development.