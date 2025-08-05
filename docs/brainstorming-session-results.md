# POWLAX Brainstorming Session Results

**Date:** 2025-08-03
**Topic:** CSV Data Migration & Practice Planner Launch Strategy
**Facilitator:** Mary (Business Analyst)

## Session Context

### Focus Areas:
1. Migrating data from multiple CSVs into Supabase tables
2. Launching practice planner today with full specifications
3. Transitioning to Skills Academy development

### Constraints:
- Timeline: Practice planner must go live today
- Technical: Moving from constrained third-party tools to custom build
- Data: Multiple CSV sources need correct formatting for Supabase

### Goal: 
Focused problem-solving for immediate implementation

---

## Technique Sessions

### Technique 1: Morphological Analysis - CSV to Supabase Migration
**Start Time:** [In Progress]

#### Parameters Identified:

**User's Key Parameters:**
1. **Data Locations** - Data lives in multiple places from various iterations
2. **Data Completeness** - Some data incomplete (was formatted for proof of concept)
3. **WordPress API** - Existing data accessible via WordPress API
4. **Format Preservation** - Want to upload "as is" without reformatting
5. **Progress Tracking** - Need to itemize and track completion status

#### Ideas Generated:
- Use WordPress API to pull data directly instead of manual CSV reformatting
- Upload data in current form first, then iterate
- Create completion tracking system for data migration

**Data Types Identified:**
1. Drill information
2. Strategy information  
3. User data
4. Badges (gamification)
5. Game modifications
6. Points system
7. Ranks
8. Skills Academy tagging system (drill categorization)
9. Quizzes and lesson structures (LearnDash format)
10. Youth Lacrosse Coaching Masterclass data
11. Vimeo video timestamps/sections

**Key Insight:** Video lesson structure can be simplified - instead of multiple lessons per video, use Vimeo's editing to mark sections within single videos

**Existing Assets:**
- WP All Import Pro exports (CSV format)
- Supabase table schemas already created (in docs/existing)
- Vimeo videos with timestamp data

### Morphological Analysis Matrix - CSV to Supabase Mapping

**Mapping Challenge Parameters:**
1. **Source Format** (WP Export) → **Target Format** (Supabase Schema)
2. **Data Completeness** → **Migration Strategy**
3. **Format Preservation** → **Progressive Enhancement**

**Key Mappings Identified:**

| WP Export Data | Maps To Supabase Table | Key Challenges |
|----------------|------------------------|----------------|
| Drill information | drills (team) & academy_drills (individual) | Need to split based on type |
| Strategy information | strategies | Link to game_phases & concepts |
| User data | user_profiles | Preserve WP user IDs |
| Badges | badges & user_badges | Split definitions from achievements |
| Game modifications | Unclear - need clarification | |
| Points | points_ledger | Transaction history format |
| Ranks | badges (rank-type badges) | Another badge type for academy |
| Skills Academy tags | skill_ids, concept_ids in drills | Many-to-many relationships |
| LearnDash quizzes | quizzes, quiz_questions | Complex nested structure |
| LearnDash lessons | master_class_modules | Video timestamp preservation |
| Vimeo timestamps | video_url + timestamp fields | Simplify to single video approach |

**Migration Strategy:**
1. Upload CSVs as-is to staging tables
2. Create transformation queries in Supabase
3. Maintain mapping of old IDs to new IDs
4. Progressive enhancement approach

### Why Staging Tables Are Ideal:

**Immediate Benefits:**
- Upload NOW, transform LATER
- See all your data in Supabase today
- No reformatting needed before upload
- Track completion status per table
- Test transformations without losing original data

**Staging Table Approach:**
1. Create `staging_wp_drills`, `staging_wp_users`, etc.
2. Import CSVs directly (preserving WP structure)
3. Write SQL views/functions to transform
4. Validate before inserting to production tables
5. Keep staging tables as reference/backup

**Today's Action Plan:**
1. Create staging tables matching CSV columns
2. Import all CSVs immediately
3. Build practice planner using staging data
4. Transform to production tables progressively

### Resource Constraints Analysis - Practice Planner Launch

**Key Insights:**
- Has working v1.4.2 (plugin-based, not mobile-first)
- Already built basic practice planner in React in 30 minutes
- Real goal: Build it RIGHT this time with proper data structure
- 14 years of lacrosse content to integrate properly

**Critical Difference from v1.4.2:**
- Connect drills → strategies (NEW!)
- Reference skills & concepts within drills
- Mobile-first approach
- No plugin constraints
- Proper data relationships for AI integrations

**The Real Vision:**
Not just a practice planner, but a complete lacrosse training ecosystem with:
- Drill-strategy-skill relationships
- AI-powered recommendations
- Proper data structure for future features
- Transform the lacrosse landscape

**Minimum Viable Product Today:**
Use existing React practice planner + properly structured data relationships

### WordPress Data Structure Analysis

**Current WP Structure (v1.4.2):**
- Post Type: `powlax_drill`
- Categories: Skill/1v1/Concept/Team/Live Play/Admin
- Game States: 11 predefined (face-off, transitions, etc.)
- Duration, notes, videos, Lab URLs
- **MISSING: Strategy connections, skill IDs, concept IDs!**

**Critical Gap:**
Old system has drills and game states, but NO WAY to connect:
- Which strategies work with which drills
- Which skills are developed
- Which concepts are taught

**This is why staging tables are PERFECT:**
1. Import WP data as-is
2. Add strategy_ids, skill_ids, concept_ids columns
3. Build these connections progressively
4. Transform to final schema when ready

### Strategic Launch Plan (Option B - 4-6 hours)

**CRITICAL REQUIREMENT:** Everything must align with the complete vision
- Not just a practice planner, but foundation for entire ecosystem
- Every data relationship must support future AI features
- No shortcuts that compromise the 14-year vision

**Implementation Steps:**
1. Create staging tables WITH all relationship columns
2. Import CSVs with initial relationship mappings
3. Launch practice planner showcasing drill→strategy connections
4. Demonstrate the breakthrough v1.4.2 never achieved

**Key Differentiators from v1.4.2:**
- Drill → Strategy relationships (NEW!)
- Drill → Skill progression tracking (NEW!)
- Drill → Concept teaching points (NEW!)
- Foundation for AI recommendations
- Mobile-first from the ground up

### CSV Data Analysis

**Available Data Files:**
1. **Drills-Export** - Main drill data with categories, videos, lab URLs
2. **2015 Terminology List** - Contains strategies (42 Zone, 13 Zone, etc.), skills, and complete sets
3. **Online Skills Academy Drills** - Skills progression by position (Attack/Midfield/Defense)
4. **Badges/Ranks** - Gamification elements
5. **Quizzes/Lessons** - Learning content

**Key Discoveries:**
- Strategies exist in Terminology file (Motion Offense, Zone Defense, etc.)
- Skills are categorized by position and progression level
- Drills have game states but NO strategy/skill connections
- Rich position-based training progressions available

### Additional Data Discovery - Coaches Corner

**Strategy Identification from Master Classes:**
- Master Classes with category "Coaches Corner" contain strategies AND drills
- Column O "Drill Types": Empty = Strategy, Has value = Drill
- Examples found:
  - "1-4-1 Shifted Triangles Motion Offense" (Strategy)
  - "10 Man Ride" (Strategy)
  - "+1 Ground Ball Drill" (Drill)
  - "14 Carry Step off Man Up" (Strategy)

**Rich Metadata Available:**
- See & Do It Ages → do_it
- Coach It Ages → coach_it_focus  
- Own It Ages → own_it_focus
- Includes Printable Playbook indicator
- Featured image URLs in Column H
- Coaching Strategies column contains strategy type tags

## Action Planning

### Top 3 Priority Actions for Today's Launch

**1. Create Comprehensive Staging Tables (1 hour)**
- staging_wp_drills (with added strategy_ids, skill_ids, concept_ids columns)
- staging_wp_strategies (from Master Classes + Terminology)
- staging_wp_skills (from Terminology + Online Skills Academy)
- staging_wp_academy_drills (rows 277-443 from Drills export)
- staging_wp_wall_ball (separate handling for variations)

**2. Import All Data with Initial Relationships (2 hours)**
- Import CSVs directly to staging tables
- Create initial drill→strategy mappings for obvious connections
- Example: "3 Man Passing" drill → "Clearing" strategy
- Build lookup tables for ID mappings

**3. Launch Enhanced Practice Planner (1-2 hours)**
- Connect to staging tables
- Show drill→strategy relationships in UI
- Display skill progressions by age/position
- Mobile-first responsive design
- Demonstrate the breakthrough capability

### Resources Needed
- Supabase table creation scripts
- CSV import tool/process
- Initial relationship mapping logic
- React components for relationship display

### Timeline
- Hour 1: Create all staging tables
- Hour 2-3: Import data and create initial mappings
- Hour 4-5: Connect practice planner to new data
- Hour 6: Test and refine

## Reflection & Follow-up

### What Worked Well
- Discovered multiple data sources for strategies
- Found rich progression data in Skills Academy
- Identified clear path to connect disconnected data

### Areas for Further Exploration
- AI-powered drill→strategy recommendations
- Automated skill progression pathways
- Integration with video timestamps
- Gamification point calculations

### Recommended Next Steps
1. Execute staging table creation
2. Build transformation queries
3. Create AI recommendation engine
4. Implement skill progression tracking

### Questions for Future Sessions
- How should wall ball variations be structured?
- What AI models best match drills to strategies?
- How to handle video timestamp integration?
- Gamification point calculation rules?

## Executive Summary

**Session Topic:** CSV to Supabase Migration & Practice Planner Launch

**Techniques Used:**
1. Morphological Analysis (30 min) - Data mapping
2. Resource Constraints (20 min) - Launch strategy
3. First Principles (15 min) - Understanding core requirements

**Total Ideas Generated:** 25+ actionable insights

**Key Themes:**
- Staging tables enable immediate progress
- Drill→Strategy connections are the breakthrough
- 14 years of content finally properly connected
- Foundation for AI-powered future

**Breakthrough Discovery:**
Your existing data has strategies hidden in multiple places (Master Classes, Terminology) that were never connected to drills. This connection is what will transform the lacrosse training landscape - coaches can finally see which drills support which strategies!