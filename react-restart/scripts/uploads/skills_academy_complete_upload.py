#!/usr/bin/env python3
"""
Complete Skills Academy Upload Script
Combines all Skills Academy components into a single SQL file for Supabase upload
"""

import os
from datetime import datetime

def combine_sql_files():
    """Combine individual SQL files into one comprehensive upload file"""
    
    base_dir = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app'
    
    # Files to combine
    sql_files = [
        'skills_academy_drills_import.sql',
        'skills_academy_workouts_import.sql'
    ]
    
    output_file = os.path.join(base_dir, 'skills_academy_complete_import.sql')
    
    # Header
    header = f"""-- POWLAX Skills Academy Complete Import
-- Generated: {datetime.now().isoformat()}
-- This file contains all Skills Academy data for Supabase import
-- 
-- Contents:
-- 1. Skills Academy Drills (167 individual drills)
-- 2. Skills Academy Workouts (192 workout collections)
-- 3. Point Attribution System:
--    - Lax Credits (Academy Points) - Universal currency
--    - Attack Tokens - Attack position specific
--    - Midfield Medals - Midfield position specific
--    - Defense Dollars - Defense position specific
--    - Rebound Rewards - Wall Ball specific
--    - Flex Points - Self-guided workouts

-- ============================================
-- SECTION 1: DATABASE SETUP
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

"""

    # Additional relationship tables and views
    additional_sql = """
-- ============================================
-- SECTION 4: RELATIONSHIP TABLES
-- ============================================

-- Link workouts to their component drills (to be populated separately)
CREATE TABLE IF NOT EXISTS workout_drill_mapping (
    id SERIAL PRIMARY KEY,
    workout_original_id INTEGER,
    drill_original_id INTEGER,
    sequence_order INTEGER,
    is_optional BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(workout_original_id, drill_original_id)
);

-- ============================================
-- SECTION 5: USEFUL VIEWS
-- ============================================

-- View for drill point values
CREATE OR REPLACE VIEW drill_point_summary AS
SELECT 
    d.id,
    d.title,
    d.complexity,
    (d.point_values->>'lax_credit')::INT as lax_credits,
    (d.point_values->>'attack_token')::INT as attack_tokens,
    (d.point_values->>'midfield_medal')::INT as midfield_medals,
    (d.point_values->>'defense_dollar')::INT as defense_dollars,
    array_length(d.tags, 1) as tag_count
FROM skills_academy_drills d
ORDER BY d.complexity, d.title;

-- View for workout point values
CREATE OR REPLACE VIEW workout_point_summary AS
SELECT 
    w.id,
    w.title,
    w.workout_type,
    w.duration_minutes,
    (w.point_values->>'lax_credit')::INT as lax_credits,
    (w.point_values->>'attack_token')::INT as attack_tokens,
    (w.point_values->>'rebound_reward')::INT as rebound_rewards,
    (w.point_values->>'flex_points')::INT as flex_points
FROM skills_academy_workouts w
ORDER BY w.workout_type, w.duration_minutes;

-- View for position-specific drills
CREATE OR REPLACE VIEW position_drills AS
SELECT 
    d.*,
    CASE 
        WHEN (d.point_values->>'attack_token')::INT > 0 THEN 'Attack'
        WHEN (d.point_values->>'midfield_medal')::INT > 0 THEN 'Midfield'
        WHEN (d.point_values->>'defense_dollar')::INT > 0 THEN 'Defense'
        ELSE 'General'
    END as primary_position
FROM skills_academy_drills d;

-- ============================================
-- SECTION 6: INDEXES FOR PERFORMANCE
-- ============================================

-- Additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_drill_vimeo ON skills_academy_drills(vimeo_id);
CREATE INDEX IF NOT EXISTS idx_drill_complexity ON skills_academy_drills(complexity);
CREATE INDEX IF NOT EXISTS idx_workout_duration ON skills_academy_workouts(duration_minutes);
CREATE INDEX IF NOT EXISTS idx_workout_type ON skills_academy_workouts(workout_type);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_drill_title_search ON skills_academy_drills USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_workout_title_search ON skills_academy_workouts USING gin(to_tsvector('english', title));

"""

    # Footer with summary
    footer = """
-- ============================================
-- IMPORT COMPLETE
-- ============================================
-- 
-- Summary:
-- - 167 individual Skills Academy drills imported
-- - 192 Skills Academy workouts imported
-- - Point attribution system configured
-- - Relationship tables created
-- - Performance indexes added
-- - Helper views created
--
-- Next Steps:
-- 1. Populate workout_drill_mapping table
-- 2. Link to user progress tracking
-- 3. Configure gamification triggers
-- 4. Set up achievement unlocks
"""

    # Combine all parts
    with open(output_file, 'w', encoding='utf-8') as outfile:
        # Write header
        outfile.write(header)
        
        # Write each SQL file
        for i, sql_file in enumerate(sql_files, 1):
            file_path = os.path.join(base_dir, sql_file)
            if os.path.exists(file_path):
                outfile.write(f"\n-- ============================================\n")
                outfile.write(f"-- SECTION {i+1}: {sql_file.replace('_', ' ').replace('.sql', '').upper()}\n")
                outfile.write(f"-- ============================================\n\n")
                
                with open(file_path, 'r', encoding='utf-8') as infile:
                    # Skip the file headers
                    content = infile.read()
                    # Remove individual file headers
                    content = '\n'.join(line for line in content.split('\n') 
                                      if not line.startswith('--') or 'CREATE' in line or 'INSERT' in line)
                    outfile.write(content)
                    outfile.write('\n\n')
        
        # Write additional SQL
        outfile.write(additional_sql)
        
        # Write footer
        outfile.write(footer)
    
    return output_file

def create_upload_documentation():
    """Create documentation for the upload process"""
    
    doc_content = """# Skills Academy Data Upload Guide

## Overview
This guide documents the complete process for uploading POWLAX Skills Academy data to Supabase.

## Data Components

### 1. Individual Drills (167 items)
- **Table**: `skills_academy_drills`
- **Key Fields**:
  - `vimeo_id`: Video identifier
  - `drill_category`: Hierarchical categorization
  - `age_progressions`: JSONB with do_it, coach_it, own_it ranges
  - `point_values`: JSONB with earned points by type
  - `complexity`: foundation/building/advanced

### 2. Workout Collections (192 items)
- **Table**: `skills_academy_workouts`
- **Key Fields**:
  - `workout_type`: wall_ball/attack/defense/midfield/flex/general
  - `duration_minutes`: Workout length
  - `point_values`: JSONB with earned points
  - `drill_count`: Number of drills in workout

## Point System

### Point Types
1. **Lax Credits** - Universal currency (all drills/workouts)
2. **Attack Tokens** - Attack-specific drills (28 drills)
3. **Midfield Medals** - Midfield-specific drills (80 drills)
4. **Defense Dollars** - Defense-specific drills (59 drills)
5. **Rebound Rewards** - Wall Ball workouts (53 workouts)
6. **Flex Points** - Self-guided workouts

### Point Attribution Rules
- Individual drills: Usually 1 point per type
- Wall Ball workouts: Points equal duration (5 min = 5 Rebound Rewards)
- Multi-position drills: Can award multiple point types

## Upload Process

### Prerequisites
1. PostgreSQL database with JSONB support
2. Supabase project configured
3. Appropriate permissions for table creation

### Step 1: Prepare Database
```sql
-- Run this first to ensure clean state
DROP TABLE IF EXISTS workout_drill_relationships CASCADE;
DROP TABLE IF EXISTS skills_academy_workouts CASCADE;
DROP TABLE IF EXISTS skills_academy_drills CASCADE;
```

### Step 2: Execute Main Import
```bash
# From Supabase SQL Editor or psql
# Upload the complete import file
psql -h [your-supabase-host] -U [username] -d [database] -f skills_academy_complete_import.sql
```

### Step 3: Verify Import
```sql
-- Check drill counts
SELECT complexity, COUNT(*) FROM skills_academy_drills GROUP BY complexity;

-- Check workout counts
SELECT workout_type, COUNT(*) FROM skills_academy_workouts GROUP BY workout_type;

-- Verify point distributions
SELECT 
    SUM((point_values->>'lax_credit')::INT) as total_lax_credits,
    SUM((point_values->>'attack_token')::INT) as total_attack_tokens,
    SUM((point_values->>'midfield_medal')::INT) as total_midfield_medals,
    SUM((point_values->>'defense_dollar')::INT) as total_defense_dollars
FROM skills_academy_drills;
```

### Step 4: Link Workouts to Drills
This requires manual mapping or additional data processing to connect workouts with their component drills.

## Troubleshooting

### Common Issues
1. **Duplicate key errors**: Run cleanup SQL from Step 1
2. **JSONB syntax errors**: Ensure PostgreSQL version supports JSONB
3. **Permission denied**: Check Supabase role permissions

### Data Validation
- All drills should have Vimeo IDs
- All workouts should have point values
- Age progressions should have valid ranges

## Integration Points

### User Progress Tracking
```sql
CREATE TABLE user_drill_progress (
    user_id UUID REFERENCES auth.users,
    drill_id INTEGER REFERENCES skills_academy_drills(id),
    completed_at TIMESTAMP,
    points_earned JSONB,
    PRIMARY KEY (user_id, drill_id, completed_at)
);
```

### Achievement System
Link to existing gamification tables for badge/achievement unlocks based on accumulated points.

## Maintenance

### Adding New Drills
1. Update source CSV
2. Run drill import script
3. Execute incremental SQL

### Updating Point Values
```sql
UPDATE skills_academy_drills 
SET point_values = jsonb_set(point_values, '{attack_token}', '2')
WHERE id = [drill_id];
```
"""
    
    doc_path = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/SKILLS_ACADEMY_UPLOAD_GUIDE.md'
    with open(doc_path, 'w', encoding='utf-8') as f:
        f.write(doc_content)
    
    return doc_path

def main():
    print("🔄 Combining Skills Academy SQL files...")
    
    # Combine SQL files
    combined_file = combine_sql_files()
    print(f"✅ Created combined SQL file: {combined_file}")
    
    # Create documentation
    doc_file = create_upload_documentation()
    print(f"📚 Created upload documentation: {doc_file}")
    
    # Summary
    print("\n📊 Skills Academy Upload Summary:")
    print("  - 167 individual drills with Vimeo IDs")
    print("  - 192 workout collections")
    print("  - 5 point types configured:")
    print("    • Lax Credits (universal)")
    print("    • Attack Tokens (28 drills)")
    print("    • Midfield Medals (80 drills)")
    print("    • Defense Dollars (59 drills)")
    print("    • Rebound Rewards (53 wall ball workouts)")
    print("    • Flex Points (self-guided)")
    print("\n✨ Ready for Supabase upload!")

if __name__ == "__main__":
    main()