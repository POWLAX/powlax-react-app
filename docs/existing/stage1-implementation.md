# POWLAX Stage 1 Implementation Guide
## Core User System & Practice Planner (Weeks 1-2)

### 🎯 Stage 1 Goals
1. Replace BuddyBoss with proper team management
2. Fix family account issues (parents counting against player limits)
3. Get basic practice planner functional with drills and strategies
4. Enable coach content creation

---

## 📋 Database Tables to Create

### Section 1: User Management Tables
*Reference: v3-complete-supabase-schema.md - Section 4: User & Team Management Tables*

#### 1.1 Create Core User Tables
```sql
-- Run these in order in your Supabase SQL editor

-- 1. User Profiles (extends Supabase Auth)
-- See v3 schema: Table 17 - User Profiles (user_profiles)
CREATE TABLE user_profiles (
  -- Copy full schema from v3 document, Section 4, Table 17
);

-- 2. Teams 
-- See v3 schema: Table 18 - Teams (teams)
CREATE TABLE teams (
  -- Copy full schema from v3 document, Section 4, Table 18
);

-- 3. Practice Plans
-- See v3 schema: Table 19 - Practice Plans (practice_plans)
CREATE TABLE practice_plans (
  -- Copy full schema from v3 document, Section 4, Table 19
);

-- 4. Age Bands
-- See v3 schema: Table 21 - Age Bands (age_bands)
CREATE TABLE age_bands (
  -- Copy full schema from v3 document, Section 4, Table 21
);
```

**Quick Setup Prompt for AI:**
> "Using the v3-complete-supabase-schema.md document, create the SQL for tables 17, 18, 19, and 21 from Section 4. Include all columns, constraints, and the CHECK constraints for age band validation."

### Section 2: Core Content Tables
*Reference: v3-complete-supabase-schema.md - Section 1: Core Content Tables*

#### 2.1 Update Existing Drills Table
```sql
-- Your drills table exists, but needs new columns
-- See v3 schema: Table 1 - Drills enhancement
ALTER TABLE drills 
ADD COLUMN do_it TEXT CHECK (do_it ~ '^\d{1,2}-\d{1,2}$'),
-- Add all columns from v3 document, Section 1, Table 1
```

**Migration Prompt for AI:**
> "I have an existing drills table. Using v3-complete-supabase-schema.md Table 1, generate the ALTER TABLE statements to add the missing columns: do_it, coach_it, own_it, skill_ids, concept_ids, game_phase_ids, applicable_situations, communication_focus, and movement_principle_ids with proper CHECK constraints."

#### 2.2 Create New Content Tables
```sql
-- 1. Strategies (for practice planning)
-- See v3 schema: Table 3 - Strategies (strategies)
CREATE TABLE strategies (
  -- Copy from v3 document, Section 1, Table 3
);

-- 2. Teaching Concepts 
-- See v3 schema: Table 4 - Teaching Concepts (concepts)
CREATE TABLE concepts (
  -- Copy from v3 document, Section 1, Table 4
);

-- 3. Skills (basic version for now)
-- See v3 schema: Table 7 - Skills (skills)
CREATE TABLE skills (
  -- Copy from v3 document, Section 2, Table 7
  -- Include meta skill columns!
);
```

---

## 🔄 Data Migration Steps

### Step 1: Export WordPress Data
**WordPress API Prompt:**
> "Generate a Node.js script that connects to WordPress REST API and exports:
> 1. All drills from custom post type 'powlax_drill' with meta fields
> 2. All practice plans from 'powlax_practice' post type
> 3. All users with their MemberPress subscription data
> Export as CSV files for Supabase import"

### Step 2: Import CSV Data to Supabase

**CSV Import Prompt for Drills:**
> "I have a CSV export from WordPress with these columns: [ID, post_title, post_content, _drill_category, _drill_duration, _drill_video_url, _drill_lab_url_1-5, _drill_notes]. Generate a PostgreSQL script to import this into my drills table, transforming the WordPress meta fields to the new schema format."

**CSV Import Prompt for Skills/Concepts:**
> "Using the taxonomy CSV files provided, generate PostgreSQL COPY commands to import:
> 1. skills.csv into the skills table
> 2. concepts.csv into the concepts table
> 3. Handle the do_it, coach_it, own_it age band format (e.g., '6-10')"

### Step 3: Create Essential Functions

```sql
-- Family Account Creation
-- This solves the parent/child account problem
CREATE OR REPLACE FUNCTION create_family_with_children(
  p_parent_email TEXT,
  p_parent_name TEXT,
  p_children JSONB -- Array of {name, birth_date, team_code}
) RETURNS JSONB AS $$
-- Implementation creates parent and all children at once
-- No email needed for children!
$$ LANGUAGE plpgsql;

-- Practice Plan Builder Function
CREATE OR REPLACE FUNCTION create_practice_from_template(
  p_coach_id UUID,
  p_team_id UUID,
  p_template_id UUID
) RETURNS UUID AS $$
-- Copies a practice template with all drill relationships
$$ LANGUAGE plpgsql;
```

**Function Generation Prompt:**
> "Create the complete PostgreSQL functions for family account creation and practice plan templates. The family function should create a parent account and multiple child accounts without requiring emails for children. Children should have restricted access (no forums, no messaging)."

---

## 🔌 WordPress Integration

### MemberPress Webhook Handler
Create file: `app/api/memberpress-webhook/route.ts`

**Integration Prompt:**
> "Create a Next.js 13+ API route that:
> 1. Receives MemberPress webhook events
> 2. On 'subscription-created', creates appropriate Supabase records
> 3. For Club OS purchases, automatically creates 3 teams
> 4. For Team HQ purchases, creates one team with activation code
> Include proper error handling and webhook signature verification"

### WordPress REST API Connection
Create file: `lib/wordpress-sync.ts`

**Sync Prompt:**
> "Create a TypeScript module that:
> 1. Connects to WordPress REST API with authentication
> 2. Fetches drill content and syncs to Supabase
> 3. Handles custom meta fields from WordPress
> 4. Provides functions to sync on-demand or via cron"

---

## 🖥️ Required React Pages for Stage 1

### Authentication Pages
1. **Multi-Role Registration** (`app/register/page.tsx`)
   - Role selection: Director, Coach, Parent, Player
   - Different forms based on role
   - Parent can add multiple children

2. **Team Join Page** (`app/team/join/page.tsx`)
   - Coach enters activation code
   - Player/Parent enters team code
   - Auto-assigns to correct team

### Dashboard Pages
3. **Coach Dashboard** (`app/coach/dashboard/page.tsx`)
   - Team overview
   - Recent activities
   - Quick links to practice planner

4. **Parent Dashboard** (`app/parent/dashboard/page.tsx`)
   - All children in one view
   - Progress for each child
   - Team announcements

### Practice Planning Pages
5. **Practice Planner** (`app/coach/practice/page.tsx`)
   - Drag-drop drill selection
   - Time management
   - Save as template option

6. **Drill Library** (`app/drills/page.tsx`)
   - Browse by category
   - Filter by age band (do_it, coach_it, own_it)
   - Video previews

**Page Generation Prompt:**
> "Create a Next.js 13+ page component for the Practice Planner that:
> 1. Uses drag-and-drop (dnd-kit library)
> 2. Shows drills filtered by team's age band
> 3. Calculates total practice time
> 4. Links drills to strategies and concepts
> 5. Can save as template for reuse"

---

## 🚀 Implementation Checklist

### Week 1: Database & Core Functions
- [ ] Create all user management tables
- [ ] Create content tables (drills, strategies, concepts, skills)
- [ ] Set up Row Level Security policies
- [ ] Create family account functions
- [ ] Test WordPress webhook integration

### Week 2: Pages & Features
- [ ] Build registration flow with role selection
- [ ] Create parent dashboard with child management
- [ ] Implement practice planner with drag-drop
- [ ] Add drill library with age-appropriate filtering
- [ ] Test team creation and activation codes

---

## 🔐 Security Setup

**RLS Policy Prompt:**
> "Generate Row Level Security policies for:
> 1. user_profiles - users can only see/edit their own
> 2. teams - members can view, coaches can edit
> 3. practice_plans - coaches can CRUD their own, team can view
> 4. Children can never access communication features"

---

## 📊 Quick Test Queries

```sql
-- Verify family accounts work
SELECT 
  p.full_name as parent_name,
  array_agg(c.full_name) as children
FROM user_profiles p
JOIN user_profiles c ON c.parent_id = p.id
GROUP BY p.id, p.full_name;

-- Check practice plans with drills
SELECT 
  pp.plan_name,
  pp.duration_minutes,
  count(d.id) as drill_count,
  array_agg(d.title) as drills
FROM practice_plans pp
JOIN drills d ON d.id = ANY(pp.drill_ids)
GROUP BY pp.id, pp.plan_name, pp.duration_minutes;
```

---

## 🆘 Common Issues & Solutions

**Issue: Parents still counting against team limit**
> Solution: Check team_members table has proper role constraints

**Issue: Children can access forums**
> Solution: Verify user_metadata.can_use_forums = false in auth.users

**Issue: Practice planner not showing age-appropriate drills**
> Solution: Ensure do_it, coach_it, own_it fields are populated correctly

---

## Next Stage Preview
Stage 2 will add:
- Skills Academy with proper gamification
- Video tracking and analytics
- Advanced taxonomy relationships
- Progress tracking system

Save this document as `powlax-stage1-implementation.md` and use it as your checklist for the first two weeks of development.