# POWLAX Supabase Table Usage Mapping

**Generated:** January 8, 2025  
**Status:** Complete analysis of 38 tables

## Executive Summary

The POWLAX database consists of 38 tables organized into 8 functional categories. Currently, only 3 tables contain data (Wall Ball system), while the remaining 35 tables are prepared but empty, awaiting data migration or feature implementation.

## Table Categories & Usage

### 1. 🏐 Wall Ball System (ACTIVE - Contains Data)

**Purpose:** Manages wall ball training workouts and drills  
**Status:** ✅ Fully functional with sample data

| Table | Records | Purpose | Relationships |
|-------|---------|---------|--------------|
| `powlax_wall_ball_drill_library` | 5 | Individual wall ball drills with videos | Referenced by collection_drills |
| `powlax_wall_ball_collections` | 4 | Workout collections/routines | Parent to collection_drills |
| `powlax_wall_ball_collection_drills` | 3 | Links drills to collections (junction) | Joins collections ↔ drill_library |

**Key Columns:**
- drill_library: `id`, `name`, `strong_hand_video_url`, `off_hand_video_url`, `duration_seconds`
- collections: `id`, `name`, `workout_type`, `duration_minutes`, `difficulty_level`
- collection_drills: `collection_id`, `drill_id`, `sequence_order`, `video_type`

---

### 2. 📋 Practice Planning System (PREPARED - No Data)

**Purpose:** Core practice planning and drill management  
**Status:** ⭕ Schema ready, awaiting data population

| Table | Purpose | Relationships |
|-------|---------|--------------|
| `drills` | Main drill library for practice planning | Links to strategies via drill_strategies |
| `strategies` | Team strategies and plays | Links to concepts via strategy_concepts |
| `concepts` | Lacrosse concepts and principles | Links to skills via concept_skills |
| `skills` | Individual player skills | End of taxonomy chain |
| `practice_plans` | Saved practice plans | Parent to segments |
| `practice_plan_segments` | Time segments within plans | Parent to plan_drills |
| `practice_plan_drills` | Drills assigned to segments | References drills table |

**Taxonomy Flow:** Drills ↔ Strategies ↔ Concepts ↔ Skills (4-tier bidirectional)

---

### 3. 🎓 Skills Academy (PREPARED - No Data)

**Purpose:** Structured skill development and training programs  
**Status:** ⭕ Tables created, implementation pending

| Table | Purpose | Future Use |
|-------|---------|------------|
| `academy_drills` | Skills-specific drill variations | Different from practice drills |
| `workouts` | Structured workout programs | Skill progression paths |
| `workout_drills` | Drills within workouts | Sequenced learning |
| `powlax_skills_academy_workouts` | New academy workout structure | Replacing legacy system |
| `powlax_skills_academy_drills` | Academy-specific drills | Enhanced drill metadata |
| `powlax_skills_academy_questions` | Assessment questions | Knowledge validation |
| `powlax_skills_academy_answers` | Answer tracking | Progress monitoring |

---

### 4. 👥 User & Team Management (PREPARED - No Data)

**Purpose:** User profiles, team organization, and membership  
**Status:** ⭕ Schema ready for WordPress migration

| Table | Purpose | Integration |
|-------|---------|-------------|
| `user_profiles` | Extended user information | Links to WordPress users |
| `teams` | Team/organization entities | Parent to team_members |
| `team_members` | Team membership records | User ↔ Team junction |
| `team_invitations` | Pending team invites | Temporary until accepted |

---

### 5. 🏆 Gamification System (PREPARED - No Data)

**Purpose:** Points, badges, and achievement tracking  
**Status:** ⭕ Ready for implementation

| Table | Purpose | Functionality |
|-------|---------|--------------|
| `points_ledger` | Point transaction history | Track all point changes |
| `badges` | Available badge definitions | Achievement templates |
| `user_badges` | Earned badges per user | User ↔ Badge junction |
| `achievements` | Achievement definitions | Milestone tracking |

---

### 6. 📝 Assessment System (PREPARED - No Data)

**Purpose:** Quizzes and knowledge assessments  
**Status:** ⭕ Schema defined, content needed

| Table | Purpose | Relationships |
|-------|---------|--------------|
| `quizzes` | Quiz definitions | Parent to questions |
| `quiz_questions` | Individual questions | Parent to responses |
| `quiz_responses` | User answers | Tracks user progress |

---

### 7. 🔗 Taxonomy Junction Tables (PREPARED - No Data)

**Purpose:** Links between drill taxonomy levels  
**Status:** ⭕ Awaiting taxonomy data

| Table | Purpose |
|-------|---------|
| `drill_strategies` | Links drills ↔ strategies |
| `strategy_concepts` | Links strategies ↔ concepts |
| `concept_skills` | Links concepts ↔ skills |

---

### 8. 🔄 Migration & Legacy Tables (MIXED)

**Purpose:** WordPress data migration and legacy support  
**Status:** ⚠️ Some may contain migration data

| Table | Purpose | Status |
|-------|---------|---------|
| `drills_powlax` | Legacy drill data | ⭕ Empty |
| `strategies_powlax` | Legacy strategy data | ⭕ Empty |
| `skills_academy_powlax` | Legacy academy data | ⭕ Empty |
| `wordpress_groups` | WordPress group data | ⭕ Empty |
| `wordpress_group_members` | Group membership | ⭕ Empty |

---

### 9. 🔐 Authentication & Registration (PREPARED - No Data)

**Purpose:** User registration and webhook handling  
**Status:** ⭕ Ready for implementation

| Table | Purpose |
|-------|---------|
| `registration_links` | Registration tracking |
| `webhook_events` | Event logging |

---

## Implementation Priority

### Phase 1: Immediate (Currently Active)
✅ **Wall Ball System** - Already functional with data

### Phase 2: High Priority (Next Sprint)
1. **Practice Planning Tables** - Core functionality
   - Populate `drills`, `strategies`, `concepts`, `skills`
   - Enable practice plan creation

2. **User Management** - Essential for teams
   - Activate `user_profiles`
   - Enable `teams` and `team_members`

### Phase 3: Medium Priority
1. **Skills Academy** - Extended learning
   - Populate `academy_drills` and `workouts`
   - Enable progression tracking

2. **Gamification** - User engagement
   - Activate `points_ledger` and `badges`
   - Enable achievement tracking

### Phase 4: Future Enhancement
1. **Assessments** - Knowledge validation
2. **Legacy Migration** - WordPress data import

---

## Data Flow Architecture

```
User Registration
    ↓
user_profiles → teams → team_members
    ↓
Practice Planning:
  drills ↔ strategies ↔ concepts ↔ skills
    ↓
  practice_plans → segments → plan_drills
    ↓
Skills Academy:
  academy_drills → workouts → workout_drills
  wall_ball_collections → collection_drills → drill_library
    ↓
Gamification:
  points_ledger → badges → user_badges
    ↓
Assessments:
  quizzes → questions → responses
```

---

## Current System Status

### Working Features
- ✅ Wall Ball workout system (3 tables, 12 records total)
- ✅ Database schema fully defined
- ✅ RLS policies configured

### Pending Implementation
- ⏳ Practice planning data population
- ⏳ User profile activation
- ⏳ Skills academy content
- ⏳ Gamification rules
- ⏳ WordPress data migration

### Migration Notes
- Legacy `_powlax` tables exist for data preservation
- WordPress integration tables ready for user sync
- Registration system prepared for activation

---

## Recommendations

1. **Immediate Action:** Populate practice planning tables (`drills`, `strategies`) to enable core functionality

2. **Data Migration:** Import existing drill data from CSV exports or WordPress

3. **User Activation:** Enable user_profiles to support team features

4. **Testing Strategy:** Use wall ball tables as reference implementation

5. **Documentation:** Update as tables are populated and features activated

---

## Technical Notes

- All tables use PostgreSQL via Supabase
- RLS (Row Level Security) enabled on all tables
- JSONB columns used for flexible data (coaching_points, skill_focus, etc.)
- Timestamp tracking on all tables (created_at, updated_at)
- Soft delete pattern available (is_active flags)

---

## Contact & Updates

This document reflects the database state as of January 8, 2025. For updates or questions about table usage, consult the development team or check the latest migration files in `/supabase/migrations/`.