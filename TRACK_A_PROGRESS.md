# Track A: Data Integration Progress

## Status Overview
- **Current Task**: Creating comprehensive data integration plan
- **Token Usage**: ~15% used
- **Started**: 2025-08-04

## Progress Log

### ✅ Task 1: Analyze CSV documentation and current data structure
**Completed**: 2025-08-04

**Key Findings:**
1. **Drills CSV Structure** (Drills-Export-2025-July-31-1656.csv):
   - Contains 276+ team drills with metadata
   - Key field: `_drill_game_states` - contains strategy mappings like "pp-settled-offense", "pp-clearing"
   - Has drill categories, durations, video URLs, and age progressions
   - Some drills already have multiple game state associations

2. **Data Architecture** (powlax-data-architecture-explained.md):
   - Comprehensive relationship model: Drills ↔ Strategies ↔ Skills ↔ Concepts
   - Game phases: Face-off, Transition, Settled Offense/Defense, Clearing, Riding
   - Age progressions: "Do it", "Coach it", "Own it" ages
   - Player situations: Ball Carrier, Support, Off-Ball, etc.

3. **Existing Infrastructure**:
   - Staging tables already created in `001_staging_tables.sql`
   - CSV import utilities exist in `src/lib/csv-import.ts`
   - Basic keyword mapping function for drill→strategy relationships

### ✅ Task 2: Create comprehensive data integration plan
**Status**: Completed

### ✅ Task 3: Import CSV data into Supabase staging tables
**Status**: Completed

**Implementation**:
1. Created `scripts/import-csv-to-supabase.ts` - Enhanced import script with:
   - Team drills import (276+ records)
   - Skills Academy drills with position-specific data
   - Wall Ball skills with workout mappings
   - Master Classes/Strategies
   - Lessons import
   
2. Database migrations:
   - `002_update_staging_tables.sql` - Added columns for CSV data
   - `003_paid_features_enhancements.sql` - Leveraging paid features:
     - Materialized views for drill→strategy connections
     - Full-text search with pg_trgm
     - Custom functions for smart queries
     - Real-time collaboration tables
     - Position-specific drill recommendations

3. Added npm scripts: `npm run import:csv`

**Paid Supabase Features Utilized**:
- Larger batch inserts (100 rows)
- JSONB storage for flexible data
- Materialized views for performance
- Full-text search indexes
- Database functions for complex queries
- Real-time enabled tables
- Row Level Security for multi-tenant

### ⏳ Task 4: Run import script and verify data
**Status**: Ready to Execute

**Commands to Run**:
```bash
# 1. Run migrations
npx supabase migration up

# 2. Run import
npm run import:csv
```

**Import will include**:
- Team Drills (276+ records with game states)
- Skills Academy Drills (position-specific with workout mappings)
- Wall Ball Skills (with workout inclusions)
- Strategies from Master Classes
- All Lessons

**Token Usage**: ~25%

## CSV Data Sources & Field Mappings Reference

### 1. Team Practice Drills
- **Source**: `Drills-Export-2025-July-31-1656.csv` (Rows 1-276)
- **Target**: `staging_wp_drills`
- **Key Field Mappings**:
  ```
  ID → wp_id
  Title → title
  Content → content
  Drill Types → drill_types
  _drill_category → drill_category
  _drill_duration → drill_duration
  _drill_video_url → drill_video_url
  _drill_notes → drill_notes
  _drill_game_states → game_states (contains strategy mappings like "pp-settled-offense")
  _drill_lab_url_1-5 → store in raw_data
  ```

### 2. Skills Academy Individual Drills
- **Source**: `Drills-Export-2025-July-31-1656.csv` (Rows 277-443)
- **Target**: `staging_wp_academy_drills`
- **Additional Fields**: Equipment needed, Space required, Complexity, Sets/Reps

### 3. Skills Academy Position-Specific Drills
- **Source**: `Online Skills Academy Drills-POWLAX Online Skills Academy Drills and I Frames.csv`
- **Target**: `staging_wp_academy_drills`
- **Special Processing**:
  - Position relevance codes (F=Foundation, B=Basics, S=Supplementary, X=Advanced)
  - Workout inclusions (which drill appears in which numbered workout)
  - Equipment requirements as JSONB

### 4. Strategies
- **Source**: `Master-Classes-Export-2025-July-31-0929.csv`
- **Filter**: Category = "coaches corner" AND no "Drill Types" column value
- **Target**: `staging_wp_strategies`
- **Age Progressions**:
  - "See & Do It Ages" → do_it_ages
  - "Coach It Ages" → coach_it_ages
  - "Own It Ages" → own_it_ages

### 5. Wall Ball Content
- **Sources**: 
  - `Wall Ball-Wall Ball Skills Video and Which Workouts They Are In.csv` - Individual skills
  - Wall Ball workouts with 6 variations (3 durations × 2 coaching options)
- **Target**: `staging_wp_wall_ball`

## Game State to Strategy Mapping Key

Found in `_drill_game_states` field (serialized PHP arrays):
```javascript
const gameStateToStrategy = {
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

## Database Features Available

### Materialized Views
- `drill_strategy_connections` - Pre-computed drill→strategy relationships

### Custom Functions
- `search_drills_by_strategy(strategy_filter, search_term)` - Smart drill search
- `get_position_drills(position, workout_number)` - Position-specific recommendations
- `refresh_drill_connections()` - Refresh materialized views

### Performance Enhancements
- Full-text search indexes with pg_trgm
- JSONB storage for flexible data
- Real-time collaboration tables
- Row Level Security ready

## Questions to Verify Before Import
1. Confirm row 276/277 split for team vs academy drills
2. Any additional game state values beyond those listed?
3. Custom drill→strategy mappings to pre-populate?
4. Video timestamp handling for lessons?

## Data Integration Plan

### Phase 1: CSV Data Import & Mapping (Week 1)

#### 1.1 Import WordPress CSV Data
- [ ] Import team drills (rows 1-276) into `staging_wp_drills`
- [ ] Parse `_drill_game_states` field to extract strategy connections
- [ ] Import strategies from Master Classes CSV into `staging_wp_strategies`
- [ ] Import academy drills (rows 277-443) into `staging_wp_academy_drills`

#### 1.2 Parse & Map Game States
```typescript
// Game state mappings found in CSV:
const gameStateToStrategy = {
  'pp-settled-offense': 'Settled Offense',
  'pp-settled-defense': 'Settled Defense',
  'pp-offensive-transition': 'Transition Offense',
  'pp-transition-defense': 'Transition Defense',
  'pp-clearing': 'Clearing',
  'pp-ground-ball': 'Ground Ball',
  // Add more as discovered
}
```

#### 1.3 Create Initial Mappings
- [ ] Parse serialized PHP arrays in `_drill_game_states` column
- [ ] Generate drill→strategy mappings with high confidence (0.9+)
- [ ] Store in `staging_drill_strategy_map` table

### Phase 2: Connect to Practice Planner (Week 1-2)

#### 2.1 Update Hooks & Data Flow
- [ ] Modify `useSupabaseDrills.ts` to join with strategy mappings
- [ ] Add strategy filtering to drill queries
- [ ] Update drill cards to display associated strategies

#### 2.2 UI Integration
- [ ] Add strategy badges to DrillCard components
- [ ] Update FilterDrillsModal to include strategy filters
- [ ] Enhance drill selection to show strategy relevance

### Phase 3: Enrich & Validate (Week 2)

#### 3.1 Manual Review & Enhancement
- [ ] Review auto-generated mappings for accuracy
- [ ] Add missing drill→strategy connections
- [ ] Validate age progressions align with strategies

#### 3.2 Advanced Relationships
- [ ] Map skills to drills based on content analysis
- [ ] Connect concepts to strategies
- [ ] Build game phase associations

### Technical Implementation Details

#### Import Script Structure
```typescript
// src/scripts/import-powlax-data.ts
async function importPowlaxData() {
  // 1. Import drills with game state parsing
  await importDrillsWithStrategies()
  
  // 2. Import strategies from Master Classes
  await importStrategiesFromMasterClasses()
  
  // 3. Create mappings from game states
  await createGameStateMappings()
  
  // 4. Validate and report
  await validateImportedData()
}
```

#### Database Query Pattern
```sql
-- Get drills with their strategies for practice planner
SELECT 
  d.*,
  array_agg(
    json_build_object(
      'id', s.id,
      'title', s.title,
      'game_phase', s.game_phase
    )
  ) as strategies
FROM staging_wp_drills d
LEFT JOIN staging_drill_strategy_map dsm ON d.id = dsm.drill_id
LEFT JOIN staging_wp_strategies s ON dsm.strategy_id = s.id
WHERE dsm.confidence_score > 0.7
GROUP BY d.id;
```

### Next Steps
1. Set up Supabase connection with credentials
2. Run initial CSV import
3. Parse game states and create mappings
4. Test data flow in practice planner

## Notes & Observations
- The `_drill_game_states` field is key - it contains PHP serialized arrays with strategy connections
- Many drills map to multiple strategies (e.g., "3 Man Passing" → Clearing, Settled Offense, Transition)
- Confidence scoring will help prioritize which mappings to show users

## Token Usage Tracking
- Task 1 (Analysis): ~10%
- Task 2 (Planning): ~5%
- Remaining: ~85%