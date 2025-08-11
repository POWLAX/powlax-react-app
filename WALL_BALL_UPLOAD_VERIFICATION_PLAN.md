# Wall Ball Drill Upload & Mapping Verification Plan

**Generated:** January 10, 2025  
**Status:** Ready for User Verification  
**Purpose:** Upload 38 missing Wall Ball drills and establish proper drill-to-variant mappings

## 📊 Current State Analysis

### Database Status
- **Current drills in wall_ball_drill_library:** 9 drills
- **Current workout variants:** 48 variants across 8 series
- **Current drill-to-variant mappings:** None (all drill_ids arrays are empty)

### CSV Analysis  
- **Total drills in CSV:** 45 drills
- **Missing from database:** 38 drills
- **Already uploaded:** 7 drills (Overhand, Quick Sticks, Turned Right/Left, Catch and Switch, Twister, Near Side Fake)

## 🎯 Upload Plan

### Phase 1: Upload Missing Drills (READY FOR EXECUTION)

**File:** `scripts/upload-missing-wall-ball-drills.sql`

**What it does:**
- Inserts 38 missing drills into `wall_ball_drill_library`
- Extracts Vimeo IDs from video URLs automatically
- Sets proper difficulty levels (1-3) from CSV
- Includes skill focus arrays based on workout series participation
- Adds proper descriptions and metadata

**Video URL Coverage:**
- 18 drills with strong hand videos
- 18 drills with off hand videos  
- 6 drills with alternating/both hands videos

### Phase 2: Map Drills to Workout Variants (READY FOR EXECUTION)

**File:** `scripts/update-variant-drill-mappings.sql`

**What it does:**
- Updates all 48 workout variants with correct drill_ids arrays
- Maps drills to variants based on sequence numbers from CSV
- Maintains proper drill ordering within each workout
- Updates total_drills count for each variant

## 🔍 Key Mapping Insights

### Workout Series Structure
1. **Master Fundamentals** (3 variants: Complete/10min/5min)
   - Complete: 17 drills
   - 10 minutes: 10 drills  
   - 5 minutes: 5 drills

2. **Dodging** (3 variants: Complete/10min/5min)
   - Complete: 16 drills
   - 10 minutes: 10 drills
   - 5 minutes: 5 drills

3. **Conditioning** (3 variants: Complete/10min/5min)
   - Complete: 14 drills
   - 10 minutes: 10 drills
   - 5 minutes: 5 drills

4. **Faking and Inside Finishing** (3 variants: Complete/10min/5min)
   - Complete: 15 drills
   - 10 minutes: 10 drills
   - 5 minutes: 5 drills

5. **Shooting** (3 variants: Complete/10min/5min)
   - Complete: 18 drills
   - 10 minutes: 10 drills
   - 5 minutes: 5 drills

6. **Defensive Emphasis** (3 variants: Complete/10min/5min)
   - Complete: 17 drills
   - 10 minutes: 10 drills
   - 5 minutes: 5 drills

7. **Catch Everything** (3 variants: Complete/10min/5min)
   - Complete: 14 drills
   - 10 minutes: 20 drills (note: some duplicates in CSV)
   - 5 minutes: 10 drills

8. **Advanced - Fun and Challenging** (1 variant: Complete)
   - Complete: 18 drills

### Sequence Number Logic
- Each number in the CSV represents the drill's position in that specific workout
- Empty cells mean the drill is NOT included in that workout variant
- The sequence determines the order for points/completion tracking

## 🚀 Execution Steps

### Step 1: Upload Missing Drills
```bash
# Execute the drill upload SQL
psql "$(grep 'DATABASE_URL' .env.local | cut -d'=' -f2-)" -f scripts/upload-missing-wall-ball-drills.sql
```

**Expected Result:** 38 new drills added to wall_ball_drill_library (total becomes 47)

### Step 2: Map Drills to Variants  
```bash
# Execute the variant mapping SQL
psql "$(grep 'DATABASE_URL' .env.local | cut -d'=' -f2-)" -f scripts/update-variant-drill-mappings.sql
```

**Expected Result:** All 48 workout variants have populated drill_ids arrays

### Step 3: Verification
```bash
# Run verification script
npx tsx scripts/check-correct-wall-ball-tables.ts
```

**Expected Result:** 
- 47 total drills in wall_ball_drill_library
- All workout variants have drill_ids arrays populated
- Sequence ordering matches CSV structure

## 🎮 Gamification Impact

### Points & Progression
- Each drill completion can award points based on difficulty level
- Workout variant completion requires all drills in sequence
- Progressive difficulty: Basic (5min) → Intermediate (10min) → Advanced (Complete)

### Badge Eligibility  
- Series completion badges (complete all variants in a series)
- Difficulty progression badges (complete all drills of a difficulty level)
- Video completion badges (complete drills with video demonstrations)

## ⚠️ Important Notes

1. **Duplicate Handling:** Some CSV columns appear to have duplicate mappings (10 Catch Everything appears twice)
2. **Video Quality:** Not all drills have videos for all hand variations
3. **Sequence Gaps:** Some workout sequences have gaps in numbering - this is intentional
4. **Coaching Variants:** Currently only mapping coaching versions; no-coaching versions need separate analysis

## 🔍 Files Generated

1. **`scripts/upload-missing-wall-ball-drills.sql`** - Ready to execute drill uploads
2. **`scripts/update-variant-drill-mappings.sql`** - Ready to execute variant mappings  
3. **`scripts/WALL_BALL_UPLOAD_AND_MAPPING_PLAN.md`** - Detailed technical documentation
4. **`scripts/analyze-wall-ball-csv-mapping.ts`** - Analysis script (can be rerun anytime)
5. **`scripts/generate-variant-drill-mapping.ts`** - Mapping generation script

## ✅ Ready for Verification

**Please review and approve:**
1. The 38 missing drills list (shown in analysis output above)
2. The drill-to-variant mapping strategy
3. The SQL execution plan

**Once approved, execute in order:**
1. `scripts/upload-missing-wall-ball-drills.sql`
2. `scripts/update-variant-drill-mappings.sql`
3. Run verification checks

This will complete the Wall Ball system and enable proper points/gamification tracking based on drill and workout completion.
