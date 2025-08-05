# TASK 002: Database Integration & Data Mapping

## Overview
Complete remaining database work including drill imports, strategy mappings, and data relationships.

## Agent Assignments

### Data Analyst (Primary)
**Immediate Tasks:**

1. **Update Table Naming Convention**
   - [ ] Rename `drills` table to `drills_powlax` for consistency
   - [ ] Update all foreign key references
   - [ ] Update application queries

2. **Parse Drill Game States**
   - [ ] Extract strategy mappings from `_drill_game_states` field
   - [ ] Parse serialized PHP arrays to JSON
   - [ ] Map game state codes to strategy IDs
   
   **Game State Mapping Reference:**
   ```javascript
   {
     'pp-settled-offense': 'Settled Offense',
     'pp-settled-defense': 'Settled Defense',
     'pp-offensive-transition': 'Transition Offense',
     'pp-transition-defense': 'Transition Defense',
     'pp-clearing': 'Clearing',
     'pp-ground-ball': 'Ground Ball',
     'pp-face-off': 'Face-off',
     'pp-riding': 'Riding',
     'pp-special-teams': 'Special Teams'
   }
   ```

3. **Create Drill-Strategy Mappings**
   - [ ] Populate `drill_strategy_map_powlax` table
   - [ ] Set initial confidence scores (0.9 for direct matches)
   - [ ] Document mapping logic for future updates

4. **Verify Data Relationships**
   - [ ] Check all foreign key constraints
   - [ ] Ensure referential integrity
   - [ ] Validate point type references
   - [ ] Verify badge-quest relationships

### Backend Developer (Supporting)
**Database Optimization:**

1. **Create Database Views**
   ```sql
   -- Drills with strategies
   CREATE VIEW drills_with_strategies AS
   SELECT d.*, array_agg(s.*) as strategies
   FROM drills_powlax d
   LEFT JOIN drill_strategy_map_powlax dsm ON d.id = dsm.drill_id
   LEFT JOIN strategies_powlax s ON dsm.strategy_id = s.id
   GROUP BY d.id;
   ```

2. **Add Missing Indexes**
   - [ ] Game states for fast filtering
   - [ ] User progress lookups
   - [ ] Point transaction queries

3. **Create Helper Functions**
   - [ ] `calculate_drill_points(drill_id, user_id)`
   - [ ] `update_user_streak(user_id)`
   - [ ] `check_badge_eligibility(user_id, badge_id)`

## Data Quality Tasks

### Validation Checks
1. **Drill Data:**
   - [ ] All drills have valid Vimeo URLs
   - [ ] Age progressions are properly formatted
   - [ ] Categories match expected values

2. **Strategy Data:**
   - [ ] All strategies have Lacrosse Lab URLs
   - [ ] Video IDs are unique
   - [ ] Categories are consistent

3. **Gamification Data:**
   - [ ] Point types match code expectations
   - [ ] Badge requirements are achievable
   - [ ] Rank progressions are logical

### Data Enrichment
1. **Add Difficulty Scores:**
   ```sql
   -- Add difficulty_score column
   ALTER TABLE drills_powlax 
   ADD COLUMN difficulty_score INTEGER DEFAULT 3;
   
   -- Update based on age progressions
   UPDATE drills_powlax
   SET difficulty_score = CASE
     WHEN own_it_ages LIKE '%18+%' THEN 5
     WHEN own_it_ages LIKE '%16%' THEN 4
     WHEN coach_it_ages LIKE '%14%' THEN 3
     WHEN do_it_ages LIKE '%12%' THEN 2
     ELSE 1
   END;
   ```

2. **Calculate Workout Durations:**
   - [ ] Parse duration strings to minutes
   - [ ] Store as integer for calculations
   - [ ] Handle edge cases

## Migration Scripts

### 1. Rename Tables Script (`/scripts/migrations/rename_drills_table.sql`)
```sql
-- Rename table
ALTER TABLE drills RENAME TO drills_powlax;

-- Update sequences
ALTER SEQUENCE drills_id_seq RENAME TO drills_powlax_id_seq;

-- Update any views or functions that reference the old name
```

### 2. Parse Game States Script (`/scripts/parse_game_states.ts`)
- Read `_drill_game_states` field
- Parse PHP serialized arrays
- Create mapping records
- Handle errors gracefully

### 3. Data Validation Script (`/scripts/validate_data.ts`)
- Check all required fields
- Validate relationships
- Generate report of issues

## Workspace Organization

### Proposed Structure
```
/tasks/
  /academy/        # Academy feature tasks
  /database/       # Database tasks
  /practice-plan/  # Practice planner tasks
  /gamification/  # Gamification tasks
  README.md        # Task organization guide

/docs/
  /architecture/   # System design docs
  /existing/       # Current documentation
  /api/           # API documentation
  /guides/        # User guides

/scripts/
  /migrations/    # Database migrations
  /imports/       # Data import scripts
  /utils/         # Utility scripts
```

### Cleanup Tasks
1. **Remove Deprecated Files:**
   - [ ] Old app structure files
   - [ ] Duplicate components
   - [ ] Test files in root

2. **Organize Imports:**
   - [ ] Consolidate SQL files
   - [ ] Group by functionality
   - [ ] Add README files

3. **Update Agent Guidelines:**
   - [ ] Require relative paths in references
   - [ ] Specify task file locations
   - [ ] Document naming conventions

## Progress Tracking
**IMPORTANT:** Update this file with:
- Completion status for each task
- Any blockers encountered
- Links to created scripts/files
- Test results

## Timeline
- Week 1: Complete all data mapping
- Week 2: Validation and optimization
- Week 3: Documentation and cleanup

## Dependencies
- Access to production database
- CSV source files
- Existing import scripts

## Notes
1. Always backup before migrations
2. Test on staging first
3. Document all mapping decisions
4. Keep audit trail of changes