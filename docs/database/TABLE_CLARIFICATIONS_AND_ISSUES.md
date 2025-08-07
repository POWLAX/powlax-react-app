# POWLAX Database Table Clarifications & Issues

**Generated:** 2025-01-15  
**Purpose:** Comprehensive analysis of table usage, naming conventions, and structural issues based on claude.md files and codebase evaluation

---

## 📊 **Table Usage Distinctions**

### 1. **`powlax_drills` - Standardized Table Name** ✅
**RESOLVED: Table naming standardized to powlax_[entity] convention**

**Final State:**
- **`powlax_drills`** - Standardized table name for practice planner drills
- **`powlax_strategies`** - Standardized table name for coaching strategies
- **Migration created** to rename existing tables and update references
- **All SQL scripts updated** to use correct naming convention

**Resolution Applied:**
```sql
-- Tables renamed to match code expectations
ALTER TABLE drills_powlax RENAME TO powlax_drills;
ALTER TABLE strategies_powlax RENAME TO powlax_strategies;
-- All indexes and foreign keys updated accordingly
```

### 2. **`powlax_drills` - Practice Planner Drills** ✅
**Purpose:** Core drill library for practice planning workflow
**Usage:** 
- Practice planner drag-and-drop interface
- 15-minute practice creation workflow  
- Mobile-first coaching interface
- Field usage optimization

**Key Columns:**
- `title`, `content`, `drill_types`, `drill_category`
- `drill_duration`, `drill_video_url`, `drill_notes`
- `game_states`, `drill_emphasis`, `game_phase`
- `do_it_ages`, `coach_it_ages`, `own_it_ages`
- `vimeo_url`, `featured_image`

**Current Data:** 167 items fully imported

### 3. **`skills_academy_drills` - Skills Academy Individual Drills** ✅
**Purpose:** Individual skill-building drills for Skills Academy workouts
**Usage:**
- Skills Academy educational content
- Position-specific training (Attack, Midfield, Defense)
- Gamification point system integration
- Age-appropriate skill progressions

**Key Columns:**
- `title`, `vimeo_id`, `drill_category[]`
- `equipment_needed[]`, `age_progressions` (JSONB)
- `complexity` (foundation/building/advanced)
- `point_values` (JSONB with lax_credit, attack_token, etc.)
- `attack_relevance`, `midfield_relevance`, `defense_relevance`

**Current Data:** 167 individual drills imported

### 4. **`skills_academy_workouts` - Skills Academy Workout Collections** ✅
**Purpose:** Workout collections/templates with drill arrays
**RESOLVED:** **Added drill_ids array column for actual drill content!**

**Updated Structure:**
```sql
CREATE TABLE skills_academy_workouts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    workout_type VARCHAR(50), -- wall_ball, attack, defense, midfield, flex, general
    duration_minutes INTEGER,
    point_values JSONB,
    tags TEXT[],
    description TEXT,
    drill_count INTEGER,
    drill_ids INTEGER[] DEFAULT '{}', -- ✅ ADDED: Array of skills_academy_drills.id values
);
```

**Resolution Applied:**
```sql
ALTER TABLE skills_academy_workouts 
ADD COLUMN drill_ids INTEGER[] DEFAULT '{}';
-- Helper functions created for workout-drill management
```

**Alternative Approach (Already Exists):**
- `workout_drill_relationships` table exists but is empty
- Could populate this instead of adding array column

**Current Data:** 192 workout frames (metadata only, no drill connections)

---

## 🔗 **Table Relationship Issues**

### 1. **Missing Drill-to-Workout Connections**
**Problem:** `skills_academy_workouts` has no actual drill data
**Impact:** Skills Academy workouts can't display actual drills
**Solutions:**
- **Option A:** Add `drill_ids INTEGER[]` column to `skills_academy_workouts`
- **Option B:** Populate existing `workout_drill_relationships` table

### 2. **Practice Planner Hook Confusion**
**Problem:** Multiple hooks trying different table names
**Current Hook Attempts:**
```typescript
// useDrills.ts tries: 'drills' (fails)
// useSupabaseDrills.ts tries: 'drills', 'staging_wp_drills', 'wp_drills'
// All fall back to mock data
```

**Resolution:** Standardize on correct table name throughout codebase

---

## 📋 **Other Table Structure Issues Identified**

### 1. **`strategies_powlax` vs `powlax_strategies`**
**Current:** `strategies_powlax` exists and is populated (221 items)
**Code References:** Some components may reference `powlax_strategies`
**Action Required:** Verify all code uses `strategies_powlax`

### 2. **Table Naming Convention Inconsistency**
**Established Convention:** `[entity]_powlax` (per POWLAX_TABLE_NAMING_CONVENTION.md)
**Code Expectations:** `powlax_[entity]`
**Resolution Required:** Choose one convention and update accordingly

### 3. **Missing User Tables Integration**
**Current:** `user_drills` and `user_strategies` tables created
**Issue:** No integration with existing practice planner workflows
**Action Required:** Update hooks to include user-generated content

---

## 🎯 **Immediate Actions Required**

### **HIGH PRIORITY**
1. **Fix Table Naming Inconsistency**
   - Decide: `powlax_drills` vs `drills_powlax`
   - Update either database schema or all code references
   - Test practice planner connectivity

2. **Add Drill Array to Skills Academy Workouts**
   ```sql
   ALTER TABLE skills_academy_workouts 
   ADD COLUMN drill_ids INTEGER[] DEFAULT '{}';
   ```

3. **Update Practice Planner Hooks**
   - Fix `useDrills.ts` to use correct table name
   - Remove fallback to mock data
   - Test real data connectivity

### **MEDIUM PRIORITY**
4. **Verify Strategy Table References**
   - Ensure all code uses `strategies_powlax`
   - Update any references to `powlax_strategies`

5. **Integrate User Tables**
   - Update hooks to include `user_drills` and `user_strategies`
   - Add sharing functionality to practice planner interface

### **LOW PRIORITY**
6. **Populate Workout-Drill Relationships**
   - Either use array column or relationship table
   - Connect actual drills to workout collections

---

## 🔍 **Claude.md Analysis Summary**

**Files Reviewed:**
- `src/claude.md` - General source code context
- `src/components/claude.md` - Component library context  
- `src/components/practice-planner/claude.md` - Practice planner specific context
- `CLAUDE.md` - Project-wide context

**Key Findings:**
1. **Practice planner expects `powlax_drills`** for core functionality
2. **Skills Academy uses separate `skills_academy_drills`** for educational content
3. **Mobile-first design** requires optimized data loading
4. **15-minute practice creation target** needs fast drill access
5. **Age band appropriateness** (Do it, Coach it, Own it) built into drill structure

**Integration Points Confirmed:**
- Practice planner → `powlax_drills` (core workflow)
- Skills Academy → `skills_academy_drills` (educational content)
- Gamification → Point system in both drill types
- Team Management → User sharing functionality (new tables)

---

## ✅ **Recommended Resolution Plan**

### **Phase 1: Critical Fixes**
1. Rename `drills_powlax` to `powlax_drills` (maintains code compatibility)
2. Add `drill_ids INTEGER[]` column to `skills_academy_workouts`
3. Update practice planner hooks to use real data

### **Phase 2: Integration**  
4. Integrate `user_drills` and `user_strategies` into existing workflows
5. Add sharing interface for team/club functionality
6. Test all connections end-to-end

### **Phase 3: Optimization**
7. Populate workout-drill relationships  
8. Optimize query performance for mobile usage
9. Add caching for 15-minute practice creation target

---

*This analysis ensures all table distinctions are properly understood and critical issues are identified for resolution.*
