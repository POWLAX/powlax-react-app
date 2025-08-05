# Skills Academy Data Upload Guide

## Overview
This guide documents the complete process for uploading POWLAX Skills Academy data to Supabase.

## Data Components

### 1. Individual Drills (167 items)
- **Table**: `skills_academy_drills`
- **Key Fields**:
  - `vimeo_id`: Video identifier
  - `drill_category`: Hierarchical categorization
  - `age_progressions`: JSONB with do_it, coach_it, own_it ranges
  - `point_values`: JSONB with earned points by type
  - `complexity`: foundation/building/advanced

### 2. Workout Collections (192 items)
- **Table**: `skills_academy_workouts`
- **Key Fields**:
  - `workout_type`: wall_ball/attack/defense/midfield/flex/general
  - `duration_minutes`: Workout length
  - `point_values`: JSONB with earned points
  - `drill_count`: Number of drills in workout

## Point System

### Point Types
1. **Lax Credits** - Universal currency (all drills/workouts)
2. **Attack Tokens** - Attack-specific drills (28 drills)
3. **Midfield Medals** - Midfield-specific drills (80 drills)
4. **Defense Dollars** - Defense-specific drills (59 drills)
5. **Rebound Rewards** - Wall Ball workouts (53 workouts)
6. **Flex Points** - Self-guided workouts

### Point Attribution Rules
- Individual drills: Usually 1 point per type
- Wall Ball workouts: Points equal duration (5 min = 5 Rebound Rewards)
- Multi-position drills: Can award multiple point types

## Upload Process

### Prerequisites
1. PostgreSQL database with JSONB support
2. Supabase project configured
3. Appropriate permissions for table creation

### Step 1: Prepare Database
```sql
-- Run this first to ensure clean state
DROP TABLE IF EXISTS workout_drill_relationships CASCADE;
DROP TABLE IF EXISTS skills_academy_workouts CASCADE;
DROP TABLE IF EXISTS skills_academy_drills CASCADE;
```

### Step 2: Execute Main Import
```bash
# From Supabase SQL Editor or psql
# Upload the complete import file
psql -h [your-supabase-host] -U [username] -d [database] -f skills_academy_complete_import.sql
```

### Step 3: Verify Import
```sql
-- Check drill counts
SELECT complexity, COUNT(*) FROM skills_academy_drills GROUP BY complexity;

-- Check workout counts
SELECT workout_type, COUNT(*) FROM skills_academy_workouts GROUP BY workout_type;

-- Verify point distributions
SELECT 
    SUM((point_values->>'lax_credit')::INT) as total_lax_credits,
    SUM((point_values->>'attack_token')::INT) as total_attack_tokens,
    SUM((point_values->>'midfield_medal')::INT) as total_midfield_medals,
    SUM((point_values->>'defense_dollar')::INT) as total_defense_dollars
FROM skills_academy_drills;
```

### Step 4: Link Workouts to Drills
This requires manual mapping or additional data processing to connect workouts with their component drills.

## Troubleshooting

### Common Issues
1. **Duplicate key errors**: Run cleanup SQL from Step 1
2. **JSONB syntax errors**: Ensure PostgreSQL version supports JSONB
3. **Permission denied**: Check Supabase role permissions

### Data Validation
- All drills should have Vimeo IDs
- All workouts should have point values
- Age progressions should have valid ranges

## Integration Points

### User Progress Tracking
```sql
CREATE TABLE user_drill_progress (
    user_id UUID REFERENCES auth.users,
    drill_id INTEGER REFERENCES skills_academy_drills(id),
    completed_at TIMESTAMP,
    points_earned JSONB,
    PRIMARY KEY (user_id, drill_id, completed_at)
);
```

### Achievement System
Link to existing gamification tables for badge/achievement unlocks based on accumulated points.

## Maintenance

### Adding New Drills
1. Update source CSV
2. Run drill import script
3. Execute incremental SQL

### Updating Point Values
```sql
UPDATE skills_academy_drills 
SET point_values = jsonb_set(point_values, '{attack_token}', '2')
WHERE id = [drill_id];
```
