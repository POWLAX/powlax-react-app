#!/usr/bin/env python3
"""
Skills Academy Drills Upload Script
Processes Skills Academy individual drills from Quizzes-Workouts-Export CSV
and generates SQL for Supabase upload
"""

import csv
import re
import json
from datetime import datetime

def extract_vimeo_id(content):
    """Extract Vimeo ID from embedded content"""
    match = re.search(r'vimeo\.com/(\d+)', content)
    return match.group(1) if match else None

def parse_age_range(age_str):
    """Convert age range string to structured format"""
    if not age_str:
        return None
    # Handle ranges like "6-8" or single ages
    if '-' in age_str:
        parts = age_str.split('-')
        return {
            'min': int(parts[0]),
            'max': int(parts[1])
        }
    else:
        age = int(age_str) if age_str.isdigit() else None
        return {'min': age, 'max': age} if age else None

def parse_drill_category(category_str):
    """Parse JetSmart filter hierarchy"""
    if not category_str:
        return []
    # Split by > for hierarchy
    parts = [p.strip() for p in category_str.split('>')]
    return parts

def parse_equipment(equipment_str):
    """Parse equipment needed into array"""
    if not equipment_str:
        return []
    # Split by pipe or comma
    items = re.split(r'[|,]', equipment_str)
    return [item.strip() for item in items if item.strip()]

def parse_complexity(complexity_str):
    """Normalize complexity level"""
    complexity_map = {
        'building': 'building',
        'foundation': 'foundation',
        'advanced': 'advanced'
    }
    return complexity_map.get(complexity_str.lower(), 'foundation')

def parse_duration(duration_str):
    """Convert duration string to minutes integer"""
    if not duration_str:
        return None
    # Extract number from strings like "3 Minutes"
    match = re.search(r'(\d+)\s*[Mm]inute', duration_str)
    return int(match.group(1)) if match else None

def parse_points_and_tags(categories_str, tags_str):
    """Parse quiz/workout categories and tags"""
    points = {}
    tags = []
    
    # Parse categories for point values
    if categories_str:
        parts = categories_str.split('|')
        for part in parts:
            part = part.strip()
            # Extract point values
            if 'Lax Credit' in part:
                match = re.search(r'(\w+)\s+Lax Credits?', part, re.IGNORECASE)
                if match:
                    points['lax_credit'] = 1 if match.group(1).lower() == 'one' else int(match.group(1)) if match.group(1).isdigit() else 0
                else:
                    # Handle numeric prefix
                    match = re.search(r'(\d+)\s+Lax Credits?', part, re.IGNORECASE)
                    points['lax_credit'] = int(match.group(1)) if match else 1
            elif 'Midfield Medal' in part:
                match = re.search(r'(\w+)\s+Midfield Medal', part)
                points['midfield_medal'] = 1 if match and match.group(1).lower() == 'one' else 0
            elif 'Defense Dollar' in part:
                match = re.search(r'(\w+)\s+Defense Dollar', part)
                points['defense_dollar'] = 1 if match and match.group(1).lower() == 'one' else 0
            elif 'Attack Token' in part:
                match = re.search(r'(\w+)\s+Attack Token', part)
                points['attack_token'] = 1 if match and match.group(1).lower() == 'one' else 0
            elif 'Rebound Reward' in part:
                match = re.search(r'(\w+)\s+Rebound Reward', part)
                points['rebound_reward'] = 1 if match and match.group(1).lower() == 'one' else 0
            elif 'Wall Ball' in part:
                # Handle Wall Ball point values (e.g., "Wall Ball 5", "Wall Ball 10")
                match = re.search(r'Wall Ball\s*(\d+)', part)
                if match:
                    points['rebound_reward'] = int(match.group(1))
                    tags.append('wall-ball')
            elif 'Flex Points' in part:
                match = re.search(r'Flex Points.*?(\d+)', part)
                points['flex_points'] = int(match.group(1)) if match else 0
            else:
                # Other categories become tags
                tags.append(part)
    
    # Parse tags
    if tags_str:
        tag_parts = [t.strip() for t in tags_str.split('|')]
        tags.extend(tag_parts)
    
    # Ensure Skills-Academy tag is present
    if 'Skills-Academy' not in tags:
        tags.append('Skills-Academy')
    
    return points, tags

def create_sql_insert(drill_data):
    """Create SQL insert statement for a drill"""
    # Prepare JSON fields
    age_progressions = {
        'do_it': drill_data['age_do_it'],
        'coach_it': drill_data['age_coach_it'],
        'own_it': drill_data['age_own_it']
    }
    
    # Build the SQL
    sql = f"""
INSERT INTO skills_academy_drills (
    original_id,
    title,
    vimeo_id,
    drill_category,
    equipment_needed,
    age_progressions,
    space_needed,
    complexity,
    sets_and_reps,
    duration_minutes,
    point_values,
    tags,
    created_at
) VALUES (
    {drill_data['id']},
    '{drill_data['title'].replace("'", "''")}',
    '{drill_data['vimeo_id']}',
    ARRAY{drill_data['drill_category']}::text[],
    ARRAY{drill_data['equipment']}::text[],
    '{json.dumps(age_progressions)}'::jsonb,
    '{drill_data['space_needed'].replace("'", "''")}',
    '{drill_data['complexity']}',
    '{drill_data['sets_and_reps'].replace("'", "''")}',
    {drill_data['duration_minutes'] or 'NULL'},
    '{json.dumps(drill_data['point_values'])}'::jsonb,
    ARRAY{drill_data['tags']}::text[],
    NOW()
);"""
    return sql

def main():
    input_file = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/docs/Wordpress CSV\'s/Quizzes-Workouts-Export-2025-July-31-0920.csv'
    output_sql = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/skills_academy_drills_import.sql'
    output_summary = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/skills_academy_drills_summary.json'
    
    drills = []
    sql_statements = []
    
    # Create table definition
    table_sql = """
-- Skills Academy Drills Table
CREATE TABLE IF NOT EXISTS skills_academy_drills (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    vimeo_id VARCHAR(50),
    drill_category TEXT[],
    equipment_needed TEXT[],
    age_progressions JSONB,
    space_needed VARCHAR(255),
    complexity VARCHAR(50) CHECK (complexity IN ('building', 'foundation', 'advanced')),
    sets_and_reps TEXT,
    duration_minutes INTEGER,
    point_values JSONB,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_vimeo_id ON skills_academy_drills(vimeo_id);
CREATE INDEX idx_complexity ON skills_academy_drills(complexity);
CREATE INDEX idx_tags ON skills_academy_drills USING GIN(tags);
CREATE INDEX idx_drill_category ON skills_academy_drills USING GIN(drill_category);
"""
    
    sql_statements.append(table_sql)
    
    with open(input_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            # Skip rows without Vimeo content
            if not row.get('Content') or 'vimeo.com' not in row['Content']:
                continue
            
            vimeo_id = extract_vimeo_id(row['Content'])
            if not vimeo_id:
                continue
            
            # Parse all fields
            drill_category = parse_drill_category(row.get('Academy Single Drills', ''))
            equipment = parse_equipment(row.get('Academy Drill Equipment', ''))
            
            # Age progressions
            age_do_it = parse_age_range(row.get('Players See & Do The Skills', ''))
            age_coach_it = parse_age_range(row.get('Coach the Skills', ''))
            age_own_it = parse_age_range(row.get('Players Own the Skills', ''))
            
            # Other fields
            space_needed = row.get('Space Needed', '').strip()
            complexity = parse_complexity(row.get('Complexity', ''))
            sets_and_reps = row.get('Sets and Reps', '').strip()
            duration = parse_duration(row.get('Drill Length in Minutes', ''))
            
            # Points and tags
            point_values, tags = parse_points_and_tags(
                row.get('Quiz / Workout Categories', ''),
                row.get('Quiz / Workout Tags', '')
            )
            
            drill_data = {
                'id': int(row['ID']),
                'title': row['Title'].strip(),
                'vimeo_id': vimeo_id,
                'drill_category': drill_category,
                'equipment': equipment,
                'age_do_it': age_do_it,
                'age_coach_it': age_coach_it,
                'age_own_it': age_own_it,
                'space_needed': space_needed,
                'complexity': complexity,
                'sets_and_reps': sets_and_reps,
                'duration_minutes': duration,
                'point_values': point_values,
                'tags': tags
            }
            
            drills.append(drill_data)
            sql_statements.append(create_sql_insert(drill_data))
    
    # Write SQL file
    with open(output_sql, 'w', encoding='utf-8') as f:
        f.write('-- Skills Academy Drills Import\n')
        f.write(f'-- Generated: {datetime.now().isoformat()}\n')
        f.write(f'-- Total Drills: {len(drills)}\n\n')
        f.write('\n'.join(sql_statements))
    
    # Write summary JSON
    summary = {
        'total_drills': len(drills),
        'complexities': {},
        'equipment_types': set(),
        'space_types': set(),
        'tag_counts': {},
        'point_types': {
            'lax_credit': 0,
            'midfield_medal': 0,
            'defense_dollar': 0,
            'attack_token': 0,
            'rebound_reward': 0,
            'flex_points': 0
        }
    }
    
    for drill in drills:
        # Count complexities
        complexity = drill['complexity']
        summary['complexities'][complexity] = summary['complexities'].get(complexity, 0) + 1
        
        # Collect equipment types
        summary['equipment_types'].update(drill['equipment'])
        
        # Collect space types
        if drill['space_needed']:
            summary['space_types'].add(drill['space_needed'])
        
        # Count tags
        for tag in drill['tags']:
            summary['tag_counts'][tag] = summary['tag_counts'].get(tag, 0) + 1
        
        # Count point types
        for point_type, value in drill['point_values'].items():
            if value > 0:
                summary['point_types'][point_type] += 1
    
    # Convert sets to lists for JSON serialization
    summary['equipment_types'] = sorted(list(summary['equipment_types']))
    summary['space_types'] = sorted(list(summary['space_types']))
    
    with open(output_summary, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    
    print(f"✅ Processed {len(drills)} Skills Academy drills")
    print(f"📄 SQL file: {output_sql}")
    print(f"📊 Summary file: {output_summary}")
    
    # Print summary stats
    print("\n📈 Summary Statistics:")
    print(f"  Complexity breakdown:")
    for complexity, count in summary['complexities'].items():
        print(f"    - {complexity}: {count}")
    print(f"  Equipment types: {len(summary['equipment_types'])}")
    print(f"  Space types: {len(summary['space_types'])}")
    print(f"  Unique tags: {len(summary['tag_counts'])}")
    print(f"  Point attribution:")
    for point_type, count in summary['point_types'].items():
        if count > 0:
            print(f"    - {point_type}: {count} drills")

if __name__ == "__main__":
    main()