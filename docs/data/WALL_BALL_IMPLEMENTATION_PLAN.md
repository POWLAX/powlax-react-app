# Wall Ball System Implementation Plan

## Overview
The Wall Ball system consists of:
1. **Individual Wall Ball Drills** - 46 unique drills with Vimeo videos
2. **Wall Ball Workouts** - Composite videos that combine drills in specific sequences
3. **Drill-to-Workout Mapping** - CSV defines which drills appear in which workouts and in what order

## Data Sources

### 1. Wall Ball Drills and Workouts.csv
- **Location**: `/docs/existing/json Academy Workouts./Wall Ball Drills and Workouts.csv`
- **Structure**:
  - Column A: Helper number (used for your mapping, not a database ID)
  - Column B: Another helper number (used for your mapping, not a database ID)
  - Column C: Drill name (e.g., "3 Steps Up and Back")
  - Column D: Strong hand Vimeo URL
  - Column E: Off hand Vimeo URL  
  - Column F: Both hands Vimeo URL
  - Columns G-AD: Sequence numbers for each workout (1 = first drill, 2 = second, etc.)

### 2. JSON Files (3 files with Wall Ball workouts)
- `ldqie_export_1754548751.json` - 13 Wall Ball workouts
- `ldqie_export_1754548784.json` - 21 Wall Ball workouts
- `ldqie_export_1754548869.json` - 18 Wall Ball workouts

## Database Schema Design

### Table: wall_ball_drills
```sql
CREATE TABLE wall_ball_drills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    strong_hand_video_url TEXT,
    off_hand_video_url TEXT,
    both_hands_video_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: wall_ball_workouts
```sql
CREATE TABLE wall_ball_workouts (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,  -- From JSON _id
    name VARCHAR(255) NOT NULL,
    workout_type VARCHAR(100),  -- e.g., "Master Fundamentals", "Dodging"
    duration_minutes INTEGER,    -- e.g., 5, 10, 17
    has_coaching BOOLEAN DEFAULT true,
    wp_post_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: wall_ball_workout_drills (Junction table)
```sql
CREATE TABLE wall_ball_workout_drills (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES wall_ball_workouts(id),
    drill_id INTEGER REFERENCES wall_ball_drills(id),
    sequence_order INTEGER NOT NULL,  -- 1, 2, 3, etc.
    video_type VARCHAR(20),  -- 'strong_hand', 'off_hand', 'both_hands'
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(workout_id, sequence_order)
);
```

## Import Process

### Phase 1: Import Wall Ball Drills
1. Parse `Wall Ball Drills and Workouts.csv`
2. Extract drill information (columns C-F, ignoring helper columns A-B)
3. Create records in `wall_ball_drills` table
4. Map drill names to IDs for Phase 2

### Phase 2: Import Wall Ball Workouts from JSON
1. Process each JSON file
2. Extract workout information from "master" section
3. Parse workout names to extract:
   - Workout type (e.g., "Master Fundamentals")
   - Duration (5, 10, 17 minutes)
   - Coaching flag (has "(No Coaching)" or not)
4. Create records in `wall_ball_workouts` table

### Phase 3: Create Drill-to-Workout Mappings
1. Parse columns G-AD from CSV
2. Match column headers to workout names
3. For each workout column:
   - Find matching workout in `wall_ball_workouts` by name
   - For each drill row with a sequence number:
     - Find drill in `wall_ball_drills` by name
     - Create junction record with sequence order
     - Determine video_type based on available URLs

## Workout Name Mapping

### CSV Column Headers → Database Names
The CSV has variations like:
- "Master Fundamentals Wall Ball Routine" → Maps to ID 150 (5 min)
- "Master Fundamentals Wall Ball Workout" (appears twice) → Maps to IDs 127 (10 min) and 128 (17 min)

### Workout Categories and Their Durations
| Category | 5 min | 10 min | 14-18 min |
|----------|-------|--------|-----------|
| Master Fundamentals | ✓ | ✓ | ✓ (17) |
| Dodging | ✓ | ✓ | ✓ (16) |
| Conditioning | ✓ | ✓ | ✓ (14) |
| Faking and Inside Finishing | ✓ | ✓ | ✓ (15) |
| Shooting | ✓ | ✓ | ✓ (18) |
| Long Pole Skills | ✓ | ✓ | ✓ (17) |
| Catch Everything | ✓ | ✓ | ✓ (14) |
| Advanced Fun and Challenging | ✓ | ✓ | ✓ (18) |
| Self-Guided | ✓ | ✓ | ✓ (15) |

## Implementation Steps

### Step 1: Create Database Tables
```sql
-- Run migrations to create all three tables
-- Include proper indexes and constraints
```

### Step 2: Import Script for Drills
```python
# Parse CSV
# Extract drills (rows with drill names)
# Insert into wall_ball_drills table
# Return mapping of drill_name → drill_id
```

### Step 3: Import Script for Workouts
```python
# Process each JSON file
# Extract master records with "Wall Ball" in name
# Parse workout details
# Insert into wall_ball_workouts table
# Return mapping of workout_name → workout_id
```

### Step 4: Create Mappings Script
```python
# Parse CSV columns G-AD
# For each workout column:
#   - Match to workout_id
#   - For each drill with sequence number:
#     - Match to drill_id
#     - Insert junction record
```

## Data Validation Points

1. **Drill Names**: Ensure CSV drill names match exactly when creating mappings
2. **Workout Names**: Handle variations (e.g., "Routine" vs "Workout")
3. **Sequence Numbers**: Validate no duplicate sequences per workout
4. **Video URLs**: Verify Vimeo URLs are properly formatted
5. **Duration Matching**: Ensure JSON workout durations match CSV column headers

## Special Considerations

### Video Type Logic
- If drill has only `strong_hand_video`: use 'strong_hand'
- If drill has only `off_hand_video`: use 'off_hand'
- If drill has only `both_hands_video`: use 'both_hands'
- If drill has multiple videos: determine based on workout context

### Missing Data Handling
- Some drills may not have all video types
- Some workouts in JSON may not have CSV mappings
- Handle gracefully with NULL values and logging

## Success Metrics
- All 46 drills imported with at least one video URL
- All 52 Wall Ball workouts imported from JSON
- Drill-to-workout mappings created for all CSV columns
- Each workout has correct sequence of drills
- No duplicate sequences within a workout

## Next Steps
1. Review and approve this plan
2. Create database migrations
3. Write import scripts
4. Test with sample data
5. Run full import
6. Validate results
7. Create UI to display Wall Ball workouts with drill sequences