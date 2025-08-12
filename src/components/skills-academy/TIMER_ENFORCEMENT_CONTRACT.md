# ⏱️ **Skills Academy Timer Enforcement Contract - Parallel Implementation**

*Created: 2025-01-11 | Status: READY FOR PARALLEL DEPLOYMENT*  
*Contract Owner: Patrick Chapla | Phase: 002 - Timer Enforcement*  
*Dependencies: ✅ Gamification Complete | Target: 3x Parallel Sub-Agents*  
*Dev Server: KEEP RUNNING on port 3000*

---

## 🚀 **PARALLEL DEPLOYMENT STRATEGY**

### **Why Multiple Agents Work Now:**
- ✅ **Phase 001 Complete** - Gamification foundation working
- ✅ **No Blocking Dependencies** - Timer components can develop independently  
- ✅ **Clear Separation** - UI, Logic, and Database can work in parallel
- ✅ **Fast Integration** - All pieces designed to merge seamlessly

### **3-Agent Concurrent Deployment:**
```javascript
// Deploy ALL 3 agents simultaneously in one message
Agent_1: Timer Logic Implementation  
Agent_2: Time Breakdown UI Components
Agent_3: Database Schema Extensions
```

---

## 🎯 **AGENT 1: TIMER LOGIC IMPLEMENTATION**

### **Scope:** Add timer system to workout/[id]/page.tsx
### **Files:** `src/app/(authenticated)/skills-academy/workout/[id]/page.tsx`

### **Requirements:**
```javascript
// Timer Logic Requirements
const regularDrillMinTime = (drill.duration_minutes - 1) * 60;
const wallBallMinTime = workout.estimated_duration_minutes * 60;

const isWallBall = workout.series?.series_type === 'wall_ball';
const minTimeSeconds = isWallBall ? wallBallMinTime : regularDrillMinTime;
const canMarkComplete = timeElapsed >= minTimeSeconds;

// State Management
const [drillTimer, setDrillTimer] = useState(0);
const [drillStartTime, setDrillStartTime] = useState(null);
const [drillTimes, setDrillTimes] = useState({});

// Timer Effect
useEffect(() => {
  if (drillStartTime && !completedDrills.has(currentDrillIndex)) {
    const interval = setInterval(() => {
      setDrillTimer(Date.now() - drillStartTime);
    }, 1000);
    return () => clearInterval(interval);
  }
}, [drillStartTime, currentDrillIndex, completedDrills]);

// "Did It" Button Logic
<Button 
  onClick={handleMarkComplete}
  disabled={drillTimer < minTimeSeconds}
  className={`w-full h-12 ${
    drillTimer >= minTimeSeconds 
      ? 'bg-powlax-blue hover:bg-powlax-blue/90' 
      : 'bg-gray-400 cursor-not-allowed'
  }`}
>
  {drillTimer >= minTimeSeconds ? 'Did It!' : `Wait ${Math.ceil((minTimeSeconds - drillTimer) / 1000)}s`}
</Button>
```

### **Testing Requirements:**
```javascript
// Playwright test for Agent 1
test('Timer prevents early completion', async ({ page }) => {
  await page.goto('/skills-academy/workout/1');
  
  // "Did It" should be disabled initially
  const button = page.locator('text=Did It!');
  await expect(button).toBeDisabled();
  
  // Should show countdown
  await expect(page.locator('text=Wait')).toBeVisible();
  
  // After timer expires, button should be enabled
  await page.waitForSelector('button:not([disabled])', { timeout: 30000 });
  await expect(button).toBeEnabled();
});
```

---

## 🎯 **AGENT 2: TIME BREAKDOWN UI COMPONENTS**

### **Scope:** Create completion screen with time breakdown
### **Files:** `src/app/(authenticated)/skills-academy/workout/[id]/page.tsx` (completion section)

### **Requirements:**
```javascript
// Time Breakdown Display Component
const TimeBreakdownModal = ({ drillTimes, totalTime }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-bold">Workout Time Breakdown</h3>
    
    {Object.entries(drillTimes).map(([drillId, time], index) => (
      <div key={drillId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
        <span className="font-medium">Drill {index + 1}: {time.drill_name}</span>
        <div className="text-right">
          <div className="font-bold">{formatTime(time.actual_seconds)}</div>
          <div className="text-sm text-gray-500">
            (required: {formatTime(time.required_seconds)})
          </div>
        </div>
      </div>
    ))}
    
    <div className="border-t pt-4">
      <div className="flex justify-between items-center font-bold text-lg">
        <span>Total Workout Time:</span>
        <span className="text-powlax-blue">{formatTime(totalTime)}</span>
      </div>
    </div>
  </div>
);

// Integration into completion screen
{isCompleted && (
  <div className="completion-screen">
    <TimeBreakdownModal drillTimes={drillTimes} totalTime={totalWorkoutTime} />
    <div className="mt-6">
      <h2>Points Earned: {finalPoints}</h2>
      {/* Existing completion content */}
    </div>
  </div>
)}
```

### **Testing Requirements:**
```javascript
// Playwright test for Agent 2
test('Time breakdown displays correctly', async ({ page }) => {
  // Complete a workout
  await completeWorkout(page);
  
  // Check time breakdown appears
  await expect(page.locator('text=Workout Time Breakdown')).toBeVisible();
  await expect(page.locator('text=Drill 1:')).toBeVisible();
  await expect(page.locator('text=required:')).toBeVisible();
  await expect(page.locator('text=Total Workout Time:')).toBeVisible();
});
```

---

## 🎯 **AGENT 3: DATABASE SCHEMA EXTENSIONS**

### **Scope:** Extend database to store timing data
### **Files:** New migration + RPC function updates

### **Requirements:**
```sql
-- Migration: ###_timer_enforcement_schema.sql

-- Extend workout_completions table
ALTER TABLE workout_completions 
ADD COLUMN IF NOT EXISTS drill_times JSONB,
ADD COLUMN IF NOT EXISTS required_times JSONB,
ADD COLUMN IF NOT EXISTS timer_enforced BOOLEAN DEFAULT true;

-- Update award_drill_points function to include timing
CREATE OR REPLACE FUNCTION award_drill_points_with_timing(
  p_user_id UUID,
  p_drill_id INTEGER,
  p_drill_count INTEGER,
  p_actual_time INTEGER,
  p_required_time INTEGER,
  p_workout_id INTEGER DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Call existing award_drill_points
  SELECT award_drill_points(p_user_id, p_drill_id, p_drill_count, p_workout_id) INTO v_result;
  
  -- Log timing data in points_transactions_powlax
  UPDATE points_transactions_powlax 
  SET multipliers_applied = multipliers_applied || 
    jsonb_build_object(
      'actual_time', p_actual_time,
      'required_time', p_required_time,
      'time_compliance', p_actual_time >= p_required_time
    )
  WHERE user_id = p_user_id 
    AND source_id = p_drill_id::TEXT 
    AND created_at > NOW() - INTERVAL '1 minute';
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to save workout timing data
CREATE OR REPLACE FUNCTION save_workout_timing(
  p_user_id UUID,
  p_workout_id INTEGER,
  p_drill_times JSONB,
  p_total_time INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE workout_completions 
  SET 
    drill_times = p_drill_times,
    time_taken_seconds = p_total_time,
    timer_enforced = true
  WHERE user_id = p_user_id 
    AND workout_id = p_workout_id 
    AND completed_at > NOW() - INTERVAL '1 hour';
    
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Testing Requirements:**
```sql
-- Database test queries for Agent 3
-- Test timing data storage
SELECT drill_times, required_times, timer_enforced 
FROM workout_completions 
WHERE user_id = (SELECT id FROM users WHERE email = 'patrick@powlax.com')
ORDER BY completed_at DESC LIMIT 1;

-- Test timing in transactions
SELECT multipliers_applied->'actual_time', multipliers_applied->'required_time'
FROM points_transactions_powlax 
WHERE user_id = (SELECT id FROM users WHERE email = 'patrick@powlax.com')
ORDER BY created_at DESC LIMIT 5;
```

---

## 🔧 **INTEGRATION PROTOCOL**

### **Step 1: Parallel Development (Agents work simultaneously)**
- Agent 1 implements timer logic in workout page
- Agent 2 builds time breakdown UI components  
- Agent 3 extends database schema and functions

### **Step 2: Integration Points (Designed to merge easily)**
```javascript
// Agent 1 provides this data structure:
const drillTimes = {
  [drillId]: {
    drill_name: "Wall Ball Basics",
    started_at: timestamp,
    completed_at: timestamp,
    actual_seconds: 165,
    required_seconds: 120
  }
};

// Agent 2 consumes this structure:
<TimeBreakdownModal drillTimes={drillTimes} />

// Agent 3 stores this structure:
await supabase.rpc('save_workout_timing', {
  p_drill_times: drillTimes,
  p_total_time: totalSeconds
});
```

### **Step 3: Final Integration Test**
```javascript
// Complete end-to-end test
test('Timer enforcement works end-to-end', async ({ page }) => {
  // 1. Timer prevents early clicking (Agent 1)
  // 2. Time breakdown shows on completion (Agent 2)  
  // 3. Data persists to database (Agent 3)
});
```

---

## 📋 **PARALLEL SUB-AGENT DEPLOYMENT**

```javascript
// Deploy all 3 agents in one message for maximum speed

Task({
  subagent_type: "general-purpose",
  description: "Timer logic implementation",
  prompt: `
    CONTRACT: src/components/skills-academy/TIMER_ENFORCEMENT_CONTRACT.md
    FOCUS: AGENT 1 - Timer Logic Implementation
    
    TASKS:
    1. Add timer state to workout/[id]/page.tsx
    2. Implement (duration_minutes - 1) × 60 logic for regular drills
    3. Implement full estimated_duration_minutes for Wall Ball
    4. Disable "Did It" until timer expires
    5. Show countdown on button
    6. Test with Playwright
    
    FILES TO MODIFY:
    - src/app/(authenticated)/skills-academy/workout/[id]/page.tsx (timer logic only)
    
    CRITICAL:
    - Regular drills: (duration_minutes - 1) × 60 seconds
    - Wall Ball: FULL estimated_duration_minutes × 60 seconds
    - No database changes (Agent 3 handles that)
    - Keep dev server running on port 3000
  `
})

Task({
  subagent_type: "general-purpose", 
  description: "Time breakdown UI components",
  prompt: `
    CONTRACT: src/components/skills-academy/TIMER_ENFORCEMENT_CONTRACT.md
    FOCUS: AGENT 2 - Time Breakdown UI Components
    
    TASKS:
    1. Create TimeBreakdownModal component
    2. Show drill-by-drill time breakdown
    3. Display required vs actual time
    4. Add to completion screen
    5. Test with Playwright
    
    FILES TO MODIFY:
    - src/app/(authenticated)/skills-academy/workout/[id]/page.tsx (completion section only)
    
    CRITICAL:
    - Format: "Drill 1: 2:45 (required: 2:00)"
    - Show total workout time
    - Integrate into existing completion screen
    - Mobile-responsive design
  `
})

Task({
  subagent_type: "general-purpose",
  description: "Timer database schema",  
  prompt: `
    CONTRACT: src/components/skills-academy/TIMER_ENFORCEMENT_CONTRACT.md
    FOCUS: AGENT 3 - Database Schema Extensions
    
    TASKS:
    1. Create migration to add drill_times JSONB column
    2. Update award_drill_points to include timing
    3. Create save_workout_timing RPC function
    4. Test database functions
    5. Verify timing data persists
    
    FILES TO CREATE/MODIFY:
    - supabase/migrations/###_timer_enforcement_schema.sql
    - Update existing RPC functions
    
    CRITICAL:
    - Extend existing tables, don't recreate
    - Store timing data as JSONB
    - Maintain backward compatibility
    - Test with SQL queries
  `
})
```

---

## ✅ **SUCCESS CRITERIA**

### **All 3 Agents Must Achieve:**
- [ ] **Agent 1**: Timer prevents early completion, shows countdown
- [ ] **Agent 2**: Time breakdown displays on completion  
- [ ] **Agent 3**: Timing data persists to database
- [ ] **Integration**: All pieces work together seamlessly
- [ ] **Testing**: Playwright tests pass for each component
- [ ] **Performance**: Timer updates smoothly, no lag

### **Patrick's Testing Checklist:**
1. **Timer Test**: Try clicking "Did It" before time expires (should be disabled)
2. **Wall Ball Test**: Wall Ball requires full time (no -1 minute reduction)
3. **Breakdown Test**: See detailed time breakdown after completion
4. **Database Test**: Check timing data in workout_completions table
5. **Integration Test**: Complete workflow works end-to-end

---

## 🚀 **DEPLOYMENT ADVANTAGES**

### **Speed Benefits:**
- ⚡ **3x Faster** - Parallel development instead of sequential
- ⚡ **No Waiting** - Agents work simultaneously on different areas
- ⚡ **Quick Integration** - Designed components merge easily

### **Quality Benefits:**
- 🎯 **Focused Expertise** - Each agent masters one specific area
- 🎯 **Reduced Conflicts** - Clear separation of concerns
- 🎯 **Better Testing** - Each agent tests their own component thoroughly

### **Risk Mitigation:**
- 🛡️ **No Blocking** - If one agent has issues, others continue
- 🛡️ **Easy Rollback** - Each component can be reverted independently  
- 🛡️ **Gradual Integration** - Merge components one at a time if needed

---

**Ready for 3x parallel sub-agent deployment! This approach will complete Phase 002 Timer Enforcement significantly faster than sequential implementation.**

*END OF CONTRACT - Deploy All 3 Agents Simultaneously*