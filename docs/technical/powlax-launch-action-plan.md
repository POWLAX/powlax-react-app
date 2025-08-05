# POWLAX Launch Action Plan - Compact Version

## Quick Reference for Tonight's Build

### 🎯 The Breakthrough
**Connect Drills → Strategies** (Never done before in v1.4.2!)

### 📊 Data Sources Located
1. **Drills**: `Drills-Export-2025-July-31-1656.csv`
   - Rows 1-276: Team drills
   - Rows 277-443: Academy drills
2. **Strategies**: `Master-Classes-Export` (Coaches Corner, no Drill Type)
3. **Skills**: `2015 Terminology List` + `Online Skills Academy`
4. **PDFs**: `IMPORT DOC WITH PDF URL.csv` (Column S)

### 🚀 3-Step Launch Plan

#### Step 1: Create Staging Tables (1 hour)
```sql
-- Core tables with relationship columns
staging_wp_drills (+ strategy_ids, skill_ids, concept_ids)
staging_wp_strategies
staging_wp_skills
staging_wp_academy_drills
staging_wp_wall_ball
```

#### Step 2: Import & Connect (2 hours)
- Import CSVs as-is
- Add obvious connections:
  - "3 Man Passing" → "Clearing"
  - "+1 Ground Ball" → "Ground Ball" phase
  - "10 Man Ride" → "Riding" strategy

#### Step 3: Launch Practice Planner (1-2 hours)
- Show drill→strategy relationships
- Display by age progression (do it/coach it/own it)
- Mobile-first design
- Prove the vision works!

### 💡 Key Mappings
- See & Do It Ages → do_it
- Coach It Ages → coach_it_focus
- Own It Ages → own_it_focus
- Coaches Corner (no Drill Type) = Strategy
- Coaches Corner (with Drill Type) = Drill

### 🔥 Why This Matters
After 14 years, coaches can finally see which drills support which strategies. This is the foundation for AI-powered recommendations and transforms how lacrosse is taught.

---
**Start Time**: After dinner
**Goal**: Live practice planner with drill→strategy connections
**Success**: Coaches say "Finally, I can see how drills connect to game strategy!"