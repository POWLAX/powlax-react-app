# Database Truth Quick Reference

Instant access to actual POWLAX database structure. Source: `contracts/active/database-truth-sync-002.yaml`

## ✅ ACTIVE TABLES (Use These!)

### Skills Academy (WORKING)
```sql
skills_academy_series       -- 49 records - Workout series
skills_academy_workouts     -- 166 records - Has drill_ids column
skills_academy_drills        -- 167 records - Main drill library
skills_academy_user_progress -- 5 records - Progress tracking
wall_ball_drill_library      -- 48 records - Wall ball videos
```

### Practice Planning (VERIFIED)
```sql
powlax_drills     -- 135 records - Main drill library (NOT 'drills')
powlax_strategies -- 220 records - Strategy library (NOT 'strategies')
practices         -- 34 records - Practice plans (NOT 'practice_plans')
practice_drills   -- 32 records - Drill instances with notes
powlax_images     -- 4 records - Drill media
user_drills       -- 6 records - Custom drills with team_share arrays
user_strategies   -- 4 records - Custom strategies with team_share arrays
```

### Team Management
```sql
clubs         -- 3 records - Organizations (NOT 'organizations')
teams         -- 14 records - Team entities
team_members  -- 26 records - Membership roster
```

### Users & Auth
```sql
users              -- 14 records - Main users (NOT 'user_profiles')
user_sessions      -- 0 records - Session management
magic_links        -- 16 records - Passwordless auth
registration_links -- 10 records - Registration tokens
```

### Gamification (PARTIAL)
```sql
powlax_points_currencies     -- 7 records - Point types
points_transactions_powlax   -- 0 records - Transactions (NOT 'points_ledger')
user_points_wallets          -- 1 record - User balances
user_badges                  -- 3 records - Earned badges (NOT 'badges')
powlax_player_ranks          -- 10 records - Rank definitions
point_types_powlax           -- 9 records - Currency types
leaderboard                  -- 14 records - Rankings
```

## ❌ TABLES THAT DON'T EXIST (NEVER USE!)
```sql
-- These will cause errors - they don't exist!
drills            -- Use powlax_drills
strategies        -- Use powlax_strategies  
concepts          -- Doesn't exist
skills            -- Doesn't exist
practice_plans    -- Use practices
practice_plan_drills -- Use practice_drills
user_profiles     -- Use users
organizations     -- Use clubs
badges            -- Use user_badges
points_ledger     -- Use points_transactions_powlax
```

## 🔑 KEY RELATIONSHIPS

### Skills Academy
```typescript
// Workouts have drill_ids column (array)
const workout = await supabase
  .from('skills_academy_workouts')
  .select('*, skills_academy_series(*)')
  .single();

// Get drills for workout
const drills = await supabase
  .from('skills_academy_drills')
  .select('*')
  .in('id', workout.drill_ids);
```

### Practice Planning
```typescript
// Practices with drills
const practice = await supabase
  .from('practices')
  .select(`
    *,
    practice_drills(
      *,
      powlax_drills(*)
    )
  `);
```

### User Custom Content
```typescript
// User drills shared with teams
const userDrills = await supabase
  .from('user_drills')
  .select('*')
  .contains('team_share', [teamId]);
```

## 📝 COMMON MISTAKES

### Wrong Table Names
```typescript
// ❌ WRONG
await supabase.from('drills').select('*')
await supabase.from('practice_plans').select('*')
await supabase.from('user_profiles').select('*')

// ✅ CORRECT
await supabase.from('powlax_drills').select('*')
await supabase.from('practices').select('*')
await supabase.from('users').select('*')
```

### Junction Tables
```typescript
// ❌ WRONG - No junction tables exist
await supabase.from('workout_drills').select('*')

// ✅ CORRECT - Use drill_ids column
const workout = await supabase
  .from('skills_academy_workouts')
  .select('drill_ids')
  .single();
```

## 🔍 VERIFICATION SCRIPTS

Check what's really in database:
```bash
# See all tables with counts
npx tsx scripts/check-actual-tables.ts

# Test specific table
npx tsx -e "
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const { count } = await supabase
  .from('TABLE_NAME')
  .select('*', { count: 'exact', head: true })
console.log('Records:', count)
"
```

## 🚨 CRITICAL REMINDERS

1. **NO MOCK DATA** - All data must be real or clearly marked (MOCK)
2. **Use actual table names** - Check this reference before querying
3. **drill_ids column** - Workouts use array column, not junction tables
4. **users not user_profiles** - Main user table is 'users'
5. **practices not practice_plans** - Practice table is 'practices'
6. **powlax_ prefix** - Most content tables have this prefix

## 📊 Table Count Summary
- **Total Active Tables:** 61
- **Skills Academy:** 5 tables
- **Practice Planning:** 7 tables  
- **Team Management:** 3 tables
- **Users & Auth:** 4 tables
- **Gamification:** 7 tables (partial data)
- **Legacy (has data):** 3 tables
- **Deprecated:** Several duplicate tables

Always verify with `database-truth-sync-002.yaml` for latest counts!