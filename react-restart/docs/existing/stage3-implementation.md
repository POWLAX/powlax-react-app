# POWLAX Stage 3 Implementation Guide
## Complete Taxonomy System & Advanced Analytics (Weeks 5-6)

### 🎯 Stage 3 Goals
1. Implement the complete lacrosse taxonomy (13 foundation tables)
2. Enable meta skills and contextual skill progressions
3. Build comprehensive analytics for all user roles
4. Create advanced assessment tools with Do/Coach/Own framework

---

## 📋 Database Tables to Create

### Section 1: Core Taxonomy Tables
*Reference: v3-complete-supabase-schema.md - Section 2: Taxonomy Foundation Tables*

#### 1.1 Foundation Tables (Tables 5-11)
```sql
-- 1. Lacrosse Terms (universal language)
-- See v3 schema: Table 5 - Lacrosse Terms (lacrosse_terms)
CREATE TABLE lacrosse_terms (
  -- Copy full schema from v3 document, Section 2, Table 5
);

-- 2. Game Phases (strategic chapters)
-- See v3 schema: Table 6 - Game Phases (game_phases)
CREATE TABLE game_phases (
  -- Copy full schema from v3 document, Section 2, Table 6
);

-- 3. Skills with Meta Support (Already created in Stage 1, but add meta columns)
-- See v3 schema: Table 7 - Skills (skills)
ALTER TABLE skills
ADD COLUMN is_meta_skill BOOLEAN DEFAULT false,
ADD COLUMN parent_skill_id INTEGER REFERENCES skills(id),
ADD COLUMN child_skill_ids INTEGER[];

-- 4. Player Situations
-- See v3 schema: Table 8 - Player Situations (player_situations)
CREATE TABLE player_situations (
  -- Copy full schema from v3 document, Section 2, Table 8
  -- Include meta situation support!
);

-- 5. Communication Terms
-- See v3 schema: Table 9 - Communication Terms (communication_terms)
CREATE TABLE communication_terms (
  -- Copy full schema from v3 document, Section 2, Table 9
);

-- 6. Movement Principles
-- See v3 schema: Table 10 - Movement Principles (movement_principles)
CREATE TABLE movement_principles (
  -- Copy full schema from v3 document, Section 2, Table 10
);

-- 7. Term Variations
-- See v3 schema: Table 11 - Term Variations (term_variations)
CREATE TABLE term_variations (
  -- Copy full schema from v3 document, Section 2, Table 11
);
```

**Quick Setup Prompt for AI:**
> "Using the v3-complete-supabase-schema.md document, create the SQL for Tables 5 through 11 from Section 2. Include all columns, constraints, and ensure proper foreign key relationships between tables."

### Section 2: Relationship & Mapping Tables
*Reference: v3-complete-supabase-schema.md - Section 3: Relationship & Mapping Tables*

#### 2.1 Cross-Reference Tables (Tables 12-16)
```sql
-- 1. Skill Phase Applications
-- See v3 schema: Table 12 - Skill Phase Applications
CREATE TABLE skill_phase_applications (
  -- Copy from v3 document, Section 3, Table 12
);

-- 2. Skill Development Stages
-- See v3 schema: Table 13 - Skill Development Stages
CREATE TABLE skill_development_stages (
  -- Copy from v3 document, Section 3, Table 13
);

-- 3. Phase Situation Scenarios
-- See v3 schema: Table 14 - Phase Situation Scenarios
CREATE TABLE phase_situation_scenarios (
  -- Copy from v3 document, Section 3, Table 14
);

-- 4. Skill Progression Pathways
-- See v3 schema: Table 15 - Skill Progression Pathways
CREATE TABLE skill_progression_pathways (
  -- Copy from v3 document, Section 3, Table 15
);

-- 5. Situation Skill Options
-- See v3 schema: Table 16 - Situation Skill Options
CREATE TABLE situation_skill_options (
  -- Copy from v3 document, Section 3, Table 16
);
```

**Relationship Setup Prompt:**
> "Create SQL to establish all foreign key relationships between the taxonomy tables. Ensure that skills reference game phases, drills reference skills and concepts, and all term variations link back to base terms."

---

## 🎯 Meta Skills Implementation

### Creating the Meta Skill Hierarchy
```sql
-- Function to manage meta skills
CREATE OR REPLACE FUNCTION create_meta_skill_hierarchy(
  p_meta_skill_name TEXT,
  p_child_skills TEXT[], -- Array of skill names to group
  p_do_it TEXT,
  p_coach_it TEXT,
  p_own_it TEXT
) RETURNS UUID AS $$
DECLARE
  v_meta_skill_id INTEGER;
  v_child_id INTEGER;
BEGIN
  -- Create the meta skill
  INSERT INTO skills (
    skill_name, 
    category, 
    is_meta_skill,
    do_it, 
    coach_it, 
    own_it,
    description
  ) VALUES (
    p_meta_skill_name,
    'meta',
    true,
    p_do_it,
    p_coach_it,
    p_own_it,
    'Meta skill containing: ' || array_to_string(p_child_skills, ', ')
  ) RETURNING id INTO v_meta_skill_id;
  
  -- Link existing skills as children
  FOR v_child_id IN 
    SELECT id FROM skills WHERE skill_name = ANY(p_child_skills)
  LOOP
    UPDATE skills 
    SET parent_skill_id = v_meta_skill_id
    WHERE id = v_child_id;
  END LOOP;
  
  -- Update meta skill's child array
  UPDATE skills
  SET child_skill_ids = (
    SELECT array_agg(id) 
    FROM skills 
    WHERE parent_skill_id = v_meta_skill_id
  )
  WHERE id = v_meta_skill_id;
  
  RETURN v_meta_skill_id;
END;
$$ LANGUAGE plpgsql;

-- Example: Create Defensive Fundamentals hierarchy
SELECT create_meta_skill_hierarchy(
  'Defensive Fundamentals',
  ARRAY['Positioning', 'Checking Fundamentals', 'Footwork Fundamentals'],
  '8-12',  -- do_it
  '10-14', -- coach_it
  '13-17'  -- own_it
);
```

### Meta Skill Drill Finder
```sql
-- Function to find drills by meta skill (with expansion)
CREATE OR REPLACE FUNCTION find_drills_by_skill(
  p_skill_id INTEGER,
  p_expand_meta BOOLEAN DEFAULT true
) RETURNS TABLE (
  drill_id INTEGER,
  drill_title TEXT,
  matched_skills INTEGER[],
  relevance_score INTEGER
) AS $$
BEGIN
  IF p_expand_meta AND EXISTS (
    SELECT 1 FROM skills WHERE id = p_skill_id AND is_meta_skill = true
  ) THEN
    -- Expand meta skill to include all children
    RETURN QUERY
    WITH RECURSIVE skill_tree AS (
      SELECT id FROM skills WHERE id = p_skill_id
      UNION ALL
      SELECT s.id 
      FROM skills s
      JOIN skill_tree st ON s.parent_skill_id = st.id
    )
    SELECT 
      d.id,
      d.title,
      array_agg(DISTINCT st.id) FILTER (WHERE st.id = ANY(d.skill_ids)),
      count(DISTINCT st.id) as relevance
    FROM drills d
    CROSS JOIN skill_tree st
    WHERE d.skill_ids && ARRAY(SELECT id FROM skill_tree)
    GROUP BY d.id, d.title
    ORDER BY relevance DESC;
  ELSE
    -- Just match the specific skill
    RETURN QUERY
    SELECT 
      d.id,
      d.title,
      ARRAY[p_skill_id],
      1
    FROM drills d
    WHERE p_skill_id = ANY(d.skill_ids);
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Advanced Analytics Implementation

### Director Analytics Dashboard
```sql
-- Club-wide development metrics
CREATE MATERIALIZED VIEW club_analytics AS
WITH player_metrics AS (
  SELECT 
    t.id as team_id,
    t.team_name,
    t.age_band_id,
    count(DISTINCT tm.user_id) as player_count,
    avg(pas.total_lax_credits) as avg_player_points,
    count(DISTINCT up.content_id) as unique_drills_completed
  FROM teams t
  JOIN team_members tm ON t.id = tm.team_id AND tm.role = 'player'
  LEFT JOIN player_academy_stats pas ON tm.user_id = pas.player_id
  LEFT JOIN user_progress up ON tm.user_id = up.user_id
  GROUP BY t.id, t.team_name, t.age_band_id
),
skill_coverage AS (
  SELECT 
    t.id as team_id,
    count(DISTINCT s.id) FILTER (WHERE up.skill_mastery_level = 'do_it') as skills_at_do,
    count(DISTINCT s.id) FILTER (WHERE up.skill_mastery_level = 'coach_it') as skills_at_coach,
    count(DISTINCT s.id) FILTER (WHERE up.skill_mastery_level = 'own_it') as skills_at_own
  FROM teams t
  JOIN team_members tm ON t.id = tm.team_id
  JOIN user_progress up ON tm.user_id = up.user_id
  JOIN skills s ON s.id = ANY(up.skill_ids)
  GROUP BY t.id
)
SELECT 
  pm.*,
  sc.skills_at_do,
  sc.skills_at_coach,
  sc.skills_at_own,
  NOW() as last_updated
FROM player_metrics pm
LEFT JOIN skill_coverage sc ON pm.team_id = sc.team_id;
```

### Coach Analytics - Practice Effectiveness
```sql
-- Track which drills lead to skill mastery
CREATE OR REPLACE VIEW practice_effectiveness AS
SELECT 
  pp.coach_id,
  pp.plan_name,
  pp.date as practice_date,
  d.title as drill_title,
  s.skill_name,
  count(DISTINCT up.user_id) as players_who_progressed,
  avg(
    CASE up.skill_mastery_level
      WHEN 'do_it' THEN 1
      WHEN 'coach_it' THEN 2
      WHEN 'own_it' THEN 3
      ELSE 0
    END
  ) as avg_mastery_level
FROM practice_plans pp
JOIN unnest(pp.drill_ids) AS drill_id ON true
JOIN drills d ON d.id = drill_id
JOIN unnest(d.skill_ids) AS skill_id ON true
JOIN skills s ON s.id = skill_id
LEFT JOIN user_progress up ON 
  up.content_id = d.id AND
  up.content_type = 'drill' AND
  up.completed_at > pp.date AND
  up.completed_at < pp.date + INTERVAL '7 days'
GROUP BY pp.coach_id, pp.plan_name, pp.date, d.title, s.skill_name;
```

### Player Development Pathways
```sql
-- Personalized skill progression recommendations
CREATE OR REPLACE FUNCTION get_player_next_skills(
  p_player_id UUID,
  p_age INTEGER
) RETURNS TABLE (
  skill_id INTEGER,
  skill_name TEXT,
  recommendation_reason TEXT,
  readiness_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH current_skills AS (
    -- Skills player has worked on
    SELECT DISTINCT unnest(skill_ids) as skill_id
    FROM user_progress
    WHERE user_id = p_player_id
  ),
  age_appropriate AS (
    -- Skills appropriate for player's age
    SELECT 
      id,
      skill_name,
      CASE 
        WHEN p_age BETWEEN split_part(coach_it, '-', 1)::int 
             AND split_part(coach_it, '-', 2)::int 
        THEN 'Ready for coaching'
        WHEN p_age BETWEEN split_part(do_it, '-', 1)::int 
             AND split_part(do_it, '-', 2)::int 
        THEN 'Can practice basics'
        ELSE 'Save for later'
      END as readiness
    FROM skills
    WHERE NOT is_meta_skill
  )
  SELECT 
    aa.id,
    aa.skill_name,
    aa.readiness || ' - Prerequisites met' as recommendation_reason,
    CASE aa.readiness
      WHEN 'Ready for coaching' THEN 100
      WHEN 'Can practice basics' THEN 75
      ELSE 25
    END as readiness_score
  FROM age_appropriate aa
  WHERE aa.id NOT IN (SELECT skill_id FROM current_skills)
    AND aa.readiness != 'Save for later'
    -- Check prerequisites
    AND NOT EXISTS (
      SELECT 1 FROM unnest(
        (SELECT prerequisite_skill_ids FROM skills WHERE id = aa.id)
      ) AS prereq_id
      WHERE prereq_id NOT IN (SELECT skill_id FROM current_skills)
    )
  ORDER BY readiness_score DESC, aa.skill_name
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;
```

---

## 🖥️ Required React Pages for Stage 3

### Analytics Pages
1. **Club Analytics Dashboard** (`app/director/analytics/page.tsx`)
   - Team comparison charts
   - Skill coverage heatmaps
   - Player development trends
   - Engagement metrics

2. **Coach Analytics** (`app/coach/analytics/page.tsx`)
   - Practice effectiveness metrics
   - Player progression tracking
   - Skill development by position
   - Team strengths/weaknesses

3. **Advanced Player Profile** (`app/player/[id]/profile/page.tsx`)
   - Skill mastery visualization
   - Development pathway
   - Contextual recommendations
   - Achievement timeline

### Assessment Tools
4. **Comprehensive Assessment** (`app/coach/assess/[playerId]/page.tsx`)
   - Position-specific evaluations
   - Do/Coach/Own skill ratings
   - Video upload for analysis
   - Progress comparison

5. **Skill Progression Planner** (`app/coach/progression/page.tsx`)
   - Age-based skill recommendations
   - Meta skill breakdown
   - Custom pathways by position
   - Season planning tools

### Taxonomy Browsers
6. **Skill Explorer** (`app/skills/explorer/page.tsx`)
   - Interactive skill tree
   - Meta skill relationships
   - Age band filtering
   - Drill connections

7. **Game Phase Analyzer** (`app/coach/phases/page.tsx`)
   - Phase breakdown visualizations
   - Situation distributions
   - Strategy connections
   - Communication priorities

**Page Generation Prompt:**
> "Create a React component for the Skill Explorer that:
> 1. Visualizes the meta skill hierarchy as an interactive tree
> 2. Shows do_it/coach_it/own_it age bands for each skill
> 3. Filters by player age and position
> 4. Links to relevant drills and concepts
> 5. Allows coaches to build custom skill pathways"

---

## 📊 Advanced Queries & Reports

### Team Skill Gap Analysis
```sql
-- Identify what skills a team needs to work on
CREATE OR REPLACE FUNCTION analyze_team_skill_gaps(
  p_team_id UUID
) RETURNS TABLE (
  skill_name TEXT,
  skill_category TEXT,
  players_need_work INTEGER,
  avg_mastery_level NUMERIC,
  recommended_drills TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH team_players AS (
    SELECT user_id, ab.band_name, ab.min_age, ab.max_age
    FROM team_members tm
    JOIN teams t ON tm.team_id = t.id
    JOIN age_bands ab ON t.age_band_id = ab.id
    WHERE tm.team_id = p_team_id AND tm.role = 'player'
  ),
  skill_analysis AS (
    SELECT 
      s.id,
      s.skill_name,
      s.category,
      count(DISTINCT tp.user_id) - count(DISTINCT up.user_id) as players_missing,
      avg(CASE 
        WHEN up.skill_mastery_level = 'do_it' THEN 1
        WHEN up.skill_mastery_level = 'coach_it' THEN 2
        WHEN up.skill_mastery_level = 'own_it' THEN 3
        ELSE 0
      END) as avg_level
    FROM skills s
    CROSS JOIN team_players tp
    LEFT JOIN user_progress up ON 
      up.user_id = tp.user_id AND 
      s.id = ANY(up.skill_ids)
    WHERE 
      -- Age appropriate skills only
      (tp.min_age + tp.max_age) / 2 BETWEEN 
        split_part(s.do_it, '-', 1)::int AND 
        split_part(s.own_it, '-', 2)::int
    GROUP BY s.id, s.skill_name, s.category
  )
  SELECT 
    sa.skill_name,
    sa.category,
    sa.players_missing,
    ROUND(sa.avg_level, 2),
    array_agg(DISTINCT d.title) FILTER (WHERE d.id IS NOT NULL)
  FROM skill_analysis sa
  LEFT JOIN drills d ON sa.id = ANY(d.skill_ids)
  WHERE sa.players_missing > 0 OR sa.avg_level < 2
  GROUP BY sa.skill_name, sa.category, sa.players_missing, sa.avg_level
  ORDER BY sa.players_missing DESC, sa.avg_level ASC;
END;
$$ LANGUAGE plpgsql;
```

### Context-Aware Practice Recommendations
```sql
-- Suggest drills based on game phase focus
CREATE OR REPLACE FUNCTION recommend_phase_drills(
  p_team_id UUID,
  p_phase_name TEXT,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  drill_id INTEGER,
  drill_title TEXT,
  relevance_score INTEGER,
  skills_developed TEXT[],
  situations_practiced TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH team_info AS (
    SELECT age_band_id, 
           (SELECT AVG(age) FROM user_profiles WHERE id IN 
            (SELECT user_id FROM team_members WHERE team_id = p_team_id)
           ) as avg_age
    FROM teams WHERE id = p_team_id
  ),
  phase_drills AS (
    SELECT 
      d.id,
      d.title,
      COUNT(DISTINCT s.id) as skill_count,
      array_agg(DISTINCT s.skill_name) as skills,
      array_agg(DISTINCT ps.situation_name) as situations
    FROM drills d
    JOIN game_phases gp ON gp.id = ANY(d.game_phase_ids)
    LEFT JOIN skills s ON s.id = ANY(d.skill_ids)
    LEFT JOIN player_situations ps ON ps.id = ANY(d.applicable_situations)
    CROSS JOIN team_info ti
    WHERE 
      gp.phase_name = p_phase_name
      AND ti.avg_age BETWEEN 
        split_part(d.do_it, '-', 1)::int AND 
        split_part(d.own_it, '-', 2)::int
    GROUP BY d.id, d.title
  )
  SELECT 
    id,
    title,
    skill_count,
    skills,
    situations
  FROM phase_drills
  ORDER BY skill_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔄 CSV Data Import for Taxonomy

### Import Scripts
**Taxonomy Import Prompt:**
> "Create a PostgreSQL script that:
> 1. Imports game_phases.csv with proper ID mapping
> 2. Imports skills.csv preserving the skill hierarchy
> 3. Imports communication_terms.csv with context variations
> 4. Creates all relationships between tables
> 5. Validates age band formats (XX-XX) during import"

### Data Validation
```sql
-- Validate imported taxonomy data
CREATE OR REPLACE FUNCTION validate_taxonomy_import()
RETURNS TABLE (
  table_name TEXT,
  issue TEXT,
  count INTEGER
) AS $$
BEGIN
  -- Check for orphaned skills
  RETURN QUERY
  SELECT 'skills', 'Missing parent skill', COUNT(*)::INTEGER
  FROM skills
  WHERE parent_skill_id IS NOT NULL 
    AND parent_skill_id NOT IN (SELECT id FROM skills);
  
  -- Check age band format
  RETURN QUERY
  SELECT 'skills', 'Invalid age band format', COUNT(*)::INTEGER
  FROM skills
  WHERE do_it !~ '^\d{1,2}-\d{1,2}$'
    OR coach_it !~ '^\d{1,2}-\d{1,2}$'
    OR own_it !~ '^\d{1,2}-\d{1,2}$';
  
  -- Check drill skill references
  RETURN QUERY
  SELECT 'drills', 'References non-existent skills', COUNT(*)::INTEGER
  FROM drills d
  WHERE EXISTS (
    SELECT 1 FROM unnest(d.skill_ids) sid
    WHERE sid NOT IN (SELECT id FROM skills)
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 Implementation Checklist

### Week 5: Taxonomy Foundation
- [ ] Create all 13 taxonomy tables
- [ ] Import CSV data with proper relationships
- [ ] Implement meta skill functions
- [ ] Create skill progression pathways
- [ ] Build context-aware queries

### Week 6: Analytics & Assessment
- [ ] Create materialized views for performance
- [ ] Build director analytics dashboard
- [ ] Implement coach effectiveness metrics
- [ ] Create player development pathways
- [ ] Add comprehensive assessment tools
- [ ] Test all role-based analytics

---

## 🔐 Performance Optimization

### Indexes for Common Queries
```sql
-- Skill lookups
CREATE INDEX idx_skills_meta ON skills(is_meta_skill, parent_skill_id);
CREATE INDEX idx_skills_age_bands ON skills(do_it, coach_it, own_it);

-- Drill relationships
CREATE INDEX idx_drills_skills ON drills USING GIN(skill_ids);
CREATE INDEX idx_drills_phases ON drills USING GIN(game_phase_ids);

-- Progress tracking
CREATE INDEX idx_progress_player_skill ON user_progress(user_id, skill_mastery_level);
CREATE INDEX idx_progress_date ON user_progress(completed_at);

-- Analytics queries
CREATE INDEX idx_team_members_role ON team_members(team_id, role);
```

### Materialized View Refresh Strategy
```sql
-- Schedule periodic refreshes
CREATE OR REPLACE FUNCTION refresh_all_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY player_academy_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY club_analytics;
  -- Add other views as needed
END;
$$ LANGUAGE plpgsql;

-- Call this via cron job or after major data changes
```

---

## 🎯 Testing Complex Relationships

### Verify Meta Skill Expansion
```sql
-- Test finding all drills for "Defensive Fundamentals" meta skill
WITH RECURSIVE skill_tree AS (
  SELECT id, skill_name, 0 as level
  FROM skills 
  WHERE skill_name = 'Defensive Fundamentals'
  
  UNION ALL
  
  SELECT s.id, s.skill_name, st.level + 1
  FROM skills s
  JOIN skill_tree st ON s.parent_skill_id = st.id
)
SELECT 
  level,
  skill_name,
  (SELECT COUNT(*) FROM drills WHERE skill_tree.id = ANY(skill_ids)) as drill_count
FROM skill_tree
ORDER BY level, skill_name;
```

### Test Age-Appropriate Recommendations
```sql
-- For a 10-year-old player
SELECT 
  s.skill_name,
  s.do_it,
  s.coach_it,
  s.own_it,
  CASE 
    WHEN 10 BETWEEN split_part(s.coach_it, '-', 1)::int 
         AND split_part(s.coach_it, '-', 2)::int 
    THEN 'Perfect - Ready for coaching'
    WHEN 10 BETWEEN split_part(s.do_it, '-', 1)::int 
         AND split_part(s.do_it, '-', 2)::int 
    THEN 'Good - Can practice basics'
    WHEN 10 < split_part(s.do_it, '-', 1)::int
    THEN 'Too Advanced - Save for later'
    ELSE 'Check age bands'
  END as recommendation
FROM skills s
WHERE NOT is_meta_skill
ORDER BY 
  CASE 
    WHEN 10 BETWEEN split_part(s.coach_it, '-', 1)::int 
         AND split_part(s.coach_it, '-', 2)::int 
    THEN 1 
    WHEN 10 BETWEEN split_part(s.do_it, '-', 1)::int 
         AND split_part(s.do_it, '-', 2)::int 
    THEN 2
    ELSE 3
  END,
  s.skill_name;
```

---

## 🆘 Common Issues & Solutions

**Issue: Circular references in meta skills**
> Solution: Add CHECK constraint preventing self-reference
> `CHECK (parent_skill_id != id)`

**Issue: Analytics queries too slow**
> Solution: Use materialized views with scheduled refresh
> Consider partitioning user_progress by date

**Issue: Age band calculations complex**
> Solution: Create helper function for age band checks
> Consider computed columns for performance

---

## 🎉 Completion Checklist

By the end of Stage 3, you should have:
- [ ] Complete taxonomy system with all relationships
- [ ] Meta skills organizing your content hierarchically  
- [ ] Context-aware drill recommendations
- [ ] Analytics dashboards for all user roles
- [ ] Age-appropriate skill progressions
- [ ] Performance optimizations in place
- [ ] Comprehensive assessment tools

Save this document as `powlax-stage3-implementation.md` for reference during weeks 5-6 of development.

## 🚀 Full System Integration

With all three stages complete, your POWLAX system will have:
1. **Proper family accounts** without email requirements for children
2. **Team limits** that don't count parents
3. **Automated Club OS** provisioning
4. **Correct point calculations** with workout multipliers
5. **Integrated assessments** that coaches can create
6. **Contextual skill development** based on age and game situations
7. **Comprehensive analytics** showing real player development

The WordPress plugins are fully replaced with purpose-built systems designed specifically for youth lacrosse development!