# POWLAX Data Source Mapping Document

## Overview
This document maps all WordPress CSV exports to their target Supabase tables, documenting the complex relationships between drills, strategies, skills, and learning content.

## Key Data Sources

### 1. STRATEGIES Data
**Primary Source:** `Master-Classes-Export-2025-July-31-0929.csv`
- **Filter:** Column AA = "coaches corner"
- **Strategy Identification:** No entry in "Drill Types" column = Strategy
- **Drill Identification:** Has entry in "Drill Types" column = Drill
- **Featured Image:** Column H contains thumbnail URL
- **Age Progressions:**
  - "See & Do It Ages" → "Do it" (Supabase)
  - "Do It Ages" → do_it_focus
  - "Coach It Ages" → coach_it_focus
  - "Own It Ages" → own_it_focus
- **PDF Playbooks:** Column W = "Includes Printable Playbook"

**Secondary Source:** `IMPORT DOC WITH PDF URL.csv`
- **PDF Links:** Column S "File URL" contains protected PDF documents
- **Relationship:** Matches by lesson name = masterclass name

**Combining Rule:** If title matches entries in rows 2-90, combine without data loss

### 2. DRILLS Data

#### Team Practice Drills
**Source:** `Drills-Export-2025-July-31-1656.csv` (Rows 1-276)
- Standard team practice drills
- Contains game states but NO strategy/skill connections

#### Skills Academy Individual Drills
**Source:** `Drills-Export-2025-July-31-1656.csv` (Rows 277-443)
- **Title:** Drill name
- **Content:** Embedded Vimeo ID
- **Academy Single Drills:** JetSmart filter hierarchy (preserve as reference)
- **Academy Drill Equipment:** Equipment needed
- **Age Progressions:**
  - "Players See & Do The Skills" → do_it
  - "Coach the Skills" → coach_it
  - "Players Own the Skills" → own_it
- **Space Needed:** Required space
- **Complexity:** Building/Foundation/Advanced
- **Sets and Reps:** Exercise prescription
- **Drill Length in Minutes:** Duration
- **Quiz/Workout Categories:** Point attribution category
- **Quiz/Workout Tags:** Point values + technique emphasis + Skills-Academy tag

#### Wall Ball Drills
**Two Components:**

1. **Individual Wall Ball Drills**
   - **Source:** `Wall Ball HTML.md`
   - Structure: Toggle mechanic (see Wall Ball Drill Image)
   - Contains individual drill Vimeo URLs

2. **Wall Ball Workouts** (Composite Videos)
   - **Source:** `Wall Ball Workouts.csv`
   - **Variations:** 6 per workout
     - Time: 5 min (short), 10 min (medium), 14-18 min (long)
     - Coaching: With coaching, Without coaching (append "No Coaching")

### 3. QUIZZES & QUESTIONS

**Quiz Structure:**
- LearnDash quizzes used as containers for academy drill questions
- Each drill = individual quiz for point assignment flexibility

**Sources:**
- `Quizzes-Workouts-Export-2025-July-31-0920.csv` - Quiz definitions
- `Questions-Export-2025-July-31-0931.csv` - Individual questions
- Links to strategies via quiz associations

### 4. SKILLS & CONCEPTS

**Sources:**
1. `2015 Terminology List.csv`
   - Type="Terminology", Type 2="Skill" = Skills
   - Type="Complete Sets" = Strategies/Formations

2. `Online Skills Academy Drills-POWLAX Online Skills Academy Drills and I Frames.csv`
   - Position-based skill progressions (Attack/Midfield/Defense)
   - Drill progressions by skill level

### 5. GAMIFICATION

**Badges:**
- `Attack-Badges-Export-2025-July-31-1836.csv`
- `Defense-Badges-Export-2025-July-31-1855.csv`
- `Midfield-Badges-Export-2025-July-31-1903.csv`
- `Lacrosse-IQ-Badges-Export-2025-July-31-1858.csv`
- `Wall-Ball-Badges-Export-2025-July-31-1925.csv`
- `Solid-Start-Badges-Export-2025-July-31-1920.csv`

**Ranks:**
- `Lacrosse-Player-Ranks-Export-2025-July-31-1859.csv`
- `Rank-Requirements-Export-2025-July-31-1917.csv`
- `Rank-Types-Export-2025-July-31-1918.csv`

**Points:**
- `Lax-IQ-Points-Export-2025-July-31-1900.csv`
- `Points-Types-Export-2025-July-31-1904.csv`
- `Completed-Workouts-Export-2025-July-31-1849.csv`

### 6. LEARNING CONTENT

**Master Classes:**
- `Master-Classes-Export-2025-July-31-0929.csv`
- Youth Lacrosse Coaching content

**Lessons:**
- `Lessons-Export-2025-July-31-0933.csv`
- Contains video timestamps for sectioned content

## Data Transformation Requirements

### 1. Strategy Extraction
```sql
-- Extract strategies from Master Classes where category = 'coaches corner' AND no drill type
SELECT * FROM staging_master_classes 
WHERE category = 'coaches corner' 
AND (drill_types IS NULL OR drill_types = '');
```

### 2. Drill Categorization
```sql
-- Team drills (rows 1-276)
-- Academy drills (rows 277-443)
-- Wall ball drills (separate sources)
```

### 3. Relationship Building
- **NEW:** Create drill_strategy_mapping table
- **NEW:** Create drill_skill_mapping table
- **NEW:** Create drill_concept_mapping table

### 4. Age Band Mapping
- See & Do It → 8U/10U (do_it)
- Coach It → 10U/12U (coach_it)
- Own It → 12U/14U+ (own_it)

## Missing Connections (To Be Created)
1. Drill → Strategy relationships
2. Drill → Skill IDs
3. Drill → Concept IDs
4. Strategy → Game Phase mappings
5. Skill progression pathways

## Migration Priority
1. **Phase 1:** Basic data import (drills, strategies, skills)
2. **Phase 2:** Create relationship mappings
3. **Phase 3:** Import quiz/lesson content
4. **Phase 4:** Gamification elements
5. **Phase 5:** User progress data

## Notes
- Preserve all WordPress post IDs for reference
- Maintain JetSmart filter hierarchies as metadata
- Protected PDFs require MemberPress integration consideration
- Wall ball variations need special handling for coaching/no-coaching versions