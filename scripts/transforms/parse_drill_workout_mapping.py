#!/usr/bin/env python3
"""
Parse CSV files to extract drill-to-workout mappings and generate SQL
Analyzes the matrix-style CSVs where drill names are in rows and workout columns contain sequence numbers
"""

import csv
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# File paths
WALL_BALL_CSV = "docs/Wordpress CSV's/2015 POWLAX Plan CSV's Skills Drills/Wall Ball-Wall Ball Skills Video and Which Workouts They Are In.csv"
SKILLS_ACADEMY_CSV = "docs/Wordpress CSV's/2015 POWLAX Plan CSV's Skills Drills/POWLAX Online Skills Academy Initial workout layout.csv"
OUTPUT_SQL = "supabase/migrations/populate_drill_workout_mappings.sql"
OUTPUT_ANALYSIS = "scripts/transforms/drill_workout_mapping_analysis.json"

def parse_wall_ball_csv() -> List[Tuple[str, str, int]]:
    """
    Parse Wall Ball CSV to extract drill-to-workout mappings
    Returns: List of (drill_name, workout_name, sequence_order) tuples
    """
    mappings = []
    
    with open(WALL_BALL_CSV, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    # Header row is row 0, workout names are in row 0
    header_row = rows[0]
    
    # Extract workout column names (columns E onwards, index 4+)
    workout_columns = {}
    for col_idx, header in enumerate(header_row):
        if col_idx >= 4 and header.strip():  # Skip first 4 columns, only process non-empty headers
            # Clean up workout names
            workout_name = header.strip()
            if workout_name and workout_name not in ['Coaching', 'No Coaching', 'Strong Hand', 'Off Hand', 'Alternating']:
                workout_columns[col_idx] = workout_name
    
    print(f"Found {len(workout_columns)} workout columns in Wall Ball CSV")
    
    # Process data rows (starting from row 3, index 3)
    for row_idx in range(3, len(rows)):
        row = rows[row_idx]
        if len(row) < 2:
            continue
            
        # Column B (index 1) contains drill name
        drill_name = row[1].strip() if len(row) > 1 else ""
        if not drill_name:
            continue
            
        # Check each workout column for sequence numbers
        for col_idx, workout_name in workout_columns.items():
            if col_idx < len(row):
                cell_value = row[col_idx].strip()
                # Check if cell contains a number (sequence order)
                if cell_value and cell_value.isdigit():
                    sequence_order = int(cell_value)
                    mappings.append((drill_name, workout_name, sequence_order))
    
    print(f"Extracted {len(mappings)} Wall Ball drill-workout mappings")
    return mappings

def parse_skills_academy_csv() -> List[Tuple[str, str, int]]:
    """
    Parse Skills Academy CSV to extract drill-to-workout mappings
    Returns: List of (drill_name, workout_name, sequence_order) tuples
    """
    mappings = []
    
    with open(SKILLS_ACADEMY_CSV, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    # Header row is row 0, workout names are in row 0
    header_row = rows[0]
    
    # Extract workout column names - looking for Attack 1-12, Midfield 1-12, Defense 1-12
    workout_columns = {}
    for col_idx, header in enumerate(header_row):
        if col_idx >= 10:  # Workout columns start around column K (index 10)
            header = header.strip()
            # Match patterns like "Attack 1", "Midfield 5", "Defense 12"
            if re.match(r'^(Attack|Midfield|Defense)\s+\d+$', header):
                workout_columns[col_idx] = header
    
    print(f"Found {len(workout_columns)} workout columns in Skills Academy CSV")
    
    # Process data rows (starting from row 19, index 19 - after header explanations)
    for row_idx in range(19, len(rows)):
        row = rows[row_idx]
        if len(row) < 2:
            continue
            
        # Column B (index 1) contains drill name
        drill_name = row[1].strip() if len(row) > 1 else ""
        if not drill_name:
            continue
            
        # Check each workout column for sequence numbers
        for col_idx, workout_name in workout_columns.items():
            if col_idx < len(row):
                cell_value = row[col_idx].strip()
                # Check if cell contains a number (sequence order)
                if cell_value and cell_value.isdigit():
                    sequence_order = int(cell_value)
                    mappings.append((drill_name, workout_name, sequence_order))
    
    print(f"Extracted {len(mappings)} Skills Academy drill-workout mappings")
    return mappings

def generate_sql_script(wall_ball_mappings: List[Tuple[str, str, int]], 
                       skills_academy_mappings: List[Tuple[str, str, int]]) -> str:
    """
    Generate SQL script to populate drill_ids arrays in skills_academy_workouts
    """
    
    # Group mappings by workout
    workout_drills = {}
    
    # Process Wall Ball mappings
    for drill_name, workout_name, sequence_order in wall_ball_mappings:
        if workout_name not in workout_drills:
            workout_drills[workout_name] = []
        workout_drills[workout_name].append((drill_name, sequence_order))
    
    # Process Skills Academy mappings
    for drill_name, workout_name, sequence_order in skills_academy_mappings:
        # Convert "Attack 1" to "Attack Practice 1" format
        if re.match(r'^(Attack|Midfield|Defense)\s+\d+$', workout_name):
            parts = workout_name.split()
            workout_name = f"{parts[0]} Practice {parts[1]}"
        
        if workout_name not in workout_drills:
            workout_drills[workout_name] = []
        workout_drills[workout_name].append((drill_name, sequence_order))
    
    # Sort drills within each workout by sequence order
    for workout_name in workout_drills:
        workout_drills[workout_name].sort(key=lambda x: x[1])  # Sort by sequence_order
    
    # Generate SQL
    sql_parts = [
        "-- Populate drill_ids arrays in skills_academy_workouts",
        "-- Generated from CSV drill-workout mapping analysis",
        "-- Generated: 2025-01-15",
        "",
        "-- Create temporary mapping table",
        "CREATE TEMP TABLE drill_workout_mapping (",
        "    drill_name TEXT,",
        "    workout_name TEXT,", 
        "    sequence_order INTEGER",
        ");",
        "",
        "-- Insert all drill-workout mappings"
    ]
    
    # Add INSERT statements
    all_mappings = wall_ball_mappings + skills_academy_mappings
    for i, (drill_name, workout_name, sequence_order) in enumerate(all_mappings):
        # Escape single quotes in drill names
        drill_name_escaped = drill_name.replace("'", "''")
        workout_name_escaped = workout_name.replace("'", "''")
        
        if i == 0:
            sql_parts.append("INSERT INTO drill_workout_mapping (drill_name, workout_name, sequence_order) VALUES")
        
        comma = "," if i < len(all_mappings) - 1 else ";"
        sql_parts.append(f"('{drill_name_escaped}', '{workout_name_escaped}', {sequence_order}){comma}")
    
    sql_parts.extend([
        "",
        "-- Update skills_academy_workouts with drill_ids arrays",
        "-- This matches drill names and builds ordered arrays",
        "",
        "DO $$",
        "DECLARE",
        "    workout_record RECORD;",
        "    drill_ids_array INTEGER[];",
        "BEGIN",
        "    -- Process each workout",
        "    FOR workout_record IN",
        "        SELECT DISTINCT workout_name FROM drill_workout_mapping",
        "    LOOP",
        "        -- Build drill_ids array for this workout",
        "        SELECT ARRAY_AGG(sad.id ORDER BY dwm.sequence_order)",
        "        INTO drill_ids_array",
        "        FROM drill_workout_mapping dwm",
        "        JOIN skills_academy_drills sad ON LOWER(TRIM(sad.title)) = LOWER(TRIM(dwm.drill_name))",
        "        WHERE dwm.workout_name = workout_record.workout_name;",
        "",
        "        -- Update workout with drill_ids array (try multiple title matching strategies)",
        "        UPDATE skills_academy_workouts",
        "        SET drill_ids = drill_ids_array,",
        "            updated_at = NOW()",
        "        WHERE (",
        "            LOWER(TRIM(title)) = LOWER(TRIM(workout_record.workout_name))",
        "            OR LOWER(TRIM(title)) LIKE LOWER(TRIM(workout_record.workout_name)) || '%'",
        "            OR LOWER(TRIM(workout_record.workout_name)) LIKE LOWER(TRIM(title)) || '%'",
        "        );",
        "",
        "        RAISE NOTICE 'Updated workout: % with % drills', workout_record.workout_name, array_length(drill_ids_array, 1);",
        "    END LOOP;",
        "END$$;",
        "",
        "-- Clean up temporary table",
        "DROP TABLE drill_workout_mapping;",
        "",
        "-- Verification query",
        "SELECT ",
        "    title,",
        "    workout_type,",
        "    array_length(drill_ids, 1) as drill_count,",
        "    drill_ids",
        "FROM skills_academy_workouts",
        "WHERE drill_ids IS NOT NULL AND array_length(drill_ids, 1) > 0",
        "ORDER BY workout_type, title;",
        "",
        "-- Success message",
        "DO $$ ",
        "BEGIN ",
        "    RAISE NOTICE 'Drill-Workout Mapping Complete! 🚀';",
        f"    RAISE NOTICE 'Processed {len(workout_drills)} workouts with drill mappings';",
        f"    RAISE NOTICE 'Total drill-workout relationships: {len(all_mappings)}';",
        "    RAISE NOTICE 'Skills Academy workouts now contain actual drill sequences!';",
        "END $$;"
    ])
    
    return "\n".join(sql_parts)

def create_analysis_report(wall_ball_mappings: List[Tuple[str, str, int]], 
                          skills_academy_mappings: List[Tuple[str, str, int]]) -> dict:
    """
    Create analysis report of the mapping data
    """
    
    # Count unique drills and workouts
    all_drills = set()
    all_workouts = set()
    
    for drill_name, workout_name, _ in wall_ball_mappings + skills_academy_mappings:
        all_drills.add(drill_name)
        all_workouts.add(workout_name)
    
    # Group by workout type
    workout_types = {
        'wall_ball': [],
        'attack': [],
        'midfield': [],
        'defense': [],
        'other': []
    }
    
    for workout_name in all_workouts:
        if any(wb_name in workout_name.lower() for wb_name in ['fundamentals', 'dodging', 'shooting', 'conditioning', 'faking', 'defense']):
            workout_types['wall_ball'].append(workout_name)
        elif 'attack' in workout_name.lower():
            workout_types['attack'].append(workout_name)
        elif 'midfield' in workout_name.lower():
            workout_types['midfield'].append(workout_name)
        elif 'defense' in workout_name.lower():
            workout_types['defense'].append(workout_name)
        else:
            workout_types['other'].append(workout_name)
    
    return {
        'summary': {
            'total_mappings': len(wall_ball_mappings) + len(skills_academy_mappings),
            'wall_ball_mappings': len(wall_ball_mappings),
            'skills_academy_mappings': len(skills_academy_mappings),
            'unique_drills': len(all_drills),
            'unique_workouts': len(all_workouts)
        },
        'workout_types': {k: len(v) for k, v in workout_types.items()},
        'sample_mappings': {
            'wall_ball': wall_ball_mappings[:10],
            'skills_academy': skills_academy_mappings[:10]
        },
        'drill_names': sorted(list(all_drills)),
        'workout_names': sorted(list(all_workouts))
    }

def main():
    """
    Main execution function
    """
    print("🎯 Parsing CSV files for drill-workout mappings...")
    
    # Parse CSV files
    wall_ball_mappings = parse_wall_ball_csv()
    skills_academy_mappings = parse_skills_academy_csv()
    
    # Generate SQL script
    print(f"\n📝 Generating SQL script...")
    sql_script = generate_sql_script(wall_ball_mappings, skills_academy_mappings)
    
    # Write SQL file
    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
        f.write(sql_script)
    print(f"✅ SQL script written to: {OUTPUT_SQL}")
    
    # Create analysis report
    analysis = create_analysis_report(wall_ball_mappings, skills_academy_mappings)
    
    # Write analysis file
    with open(OUTPUT_ANALYSIS, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, indent=2)
    print(f"✅ Analysis report written to: {OUTPUT_ANALYSIS}")
    
    # Print summary
    print(f"\n📊 Summary:")
    print(f"   • Total mappings: {analysis['summary']['total_mappings']}")
    print(f"   • Wall Ball mappings: {analysis['summary']['wall_ball_mappings']}")
    print(f"   • Skills Academy mappings: {analysis['summary']['skills_academy_mappings']}")
    print(f"   • Unique drills: {analysis['summary']['unique_drills']}")
    print(f"   • Unique workouts: {analysis['summary']['unique_workouts']}")
    print(f"\n🚀 Ready to run SQL migration to populate drill_ids arrays!")

if __name__ == "__main__":
    main()
