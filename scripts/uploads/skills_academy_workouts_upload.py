#!/usr/bin/env python3
"""
Skills Academy Workouts Upload Script
Processes Skills Academy workout collections (Wall Ball, Attack, Midfield, Defense)
and generates SQL for Supabase upload
"""

import csv
import re
import json
from datetime import datetime

def extract_workout_type(title, categories):
    """Determine workout type from title and categories"""
    title_lower = title.lower()
    
    # Wall Ball workouts
    if 'wall ball' in title_lower:
        return 'wall_ball'
    # Attack workouts
    elif 'attack' in title_lower or 'Attack Drills>Attack' in categories:
        return 'attack'
    # Defense workouts
    elif 'defense' in title_lower:
        return 'defense'
    # Midfield workouts
    elif 'midfield' in title_lower or 'midfielder' in title_lower:
        return 'midfield'
    # Self-guided/Flex workouts
    elif 'self-guided' in title_lower:
        return 'flex'
    else:
        return 'general'

def parse_workout_duration(title):
    """Extract duration from workout title"""
    # Look for patterns like "10 Minutes", "5 Minute", "17 Minutes"
    match = re.search(r'(\d+)\s*[Mm]inute', title)
    if match:
        return int(match.group(1))
    return None

def parse_workout_points(categories_str, workout_type, duration):
    """Parse workout point values"""
    points = {}
    
    if categories_str:
        # Parse Flex Points
        if 'Flex Points' in categories_str:
            match = re.search(r'Flex Points[>\s]*(\d+)', categories_str)
            points['flex_points'] = int(match.group(1)) if match else 0
        
        # Parse Lax Credits
        if 'Lax Credits' in categories_str or 'Lacrosse Player Points' in categories_str:
            match = re.search(r'(\d+)\s*Lax Credits?', categories_str)
            points['lax_credit'] = int(match.group(1)) if match else 0
        
        # Parse Wall Ball points (Rebound Rewards)
        if 'Wall Ball' in categories_str:
            match = re.search(r'Wall Ball\s*(\d+)', categories_str)
            points['rebound_reward'] = int(match.group(1)) if match else (duration or 0)
        
        # Parse Attack points
        if 'Attack' in categories_str:
            match = re.search(r'Attack\s*(\d+)', categories_str)
            if match:
                points['attack_token'] = int(match.group(1)) // 5  # Typically 5 drills = 1 token
    
    # Apply defaults based on workout type and duration
    if workout_type == 'wall_ball' and 'rebound_reward' not in points:
        points['rebound_reward'] = duration or 5
    
    return points

def parse_workout_tags(tags_str, categories_str, title):
    """Extract tags from workout"""
    tags = []
    
    # From tags field
    if tags_str:
        tags.extend([t.strip() for t in tags_str.split('|')])
    
    # From categories
    if categories_str:
        # Extract workout badges/achievements
        badge_patterns = [
            'Foundation Ace', 'Dominant Dodger', 'Stamina Star', 'Finishing Phenom',
            'Bullet Snatcher', 'Long Pole Lizard', 'Wall Ball Hawk', 'The Wall Wizard',
            'Independent Improver'
        ]
        for badge in badge_patterns:
            if badge in categories_str:
                tags.append(badge.lower().replace(' ', '-'))
        
        # Extract workout length tags
        if 'Long Workout' in categories_str:
            tags.append('long-workout')
        elif '10 Drill Workout' in categories_str:
            tags.append('10-drill-workout')
        elif '5 Drill Workout' in categories_str:
            tags.append('5-drill-workout')
    
    # Ensure Skills-Academy tag
    if 'Skills-Academy' not in tags:
        tags.append('Skills-Academy')
    
    return list(set(tags))  # Remove duplicates

def create_workout_sql(workout_data):
    """Create SQL insert for a workout"""
    sql = f"""
INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    {workout_data['id']},
    '{workout_data['title'].replace("'", "''")}',
    '{workout_data['workout_type']}',
    {workout_data['duration'] or 'NULL'},
    '{json.dumps(workout_data['point_values'])}'::jsonb,
    ARRAY{workout_data['tags']}::text[],
    {f"'{workout_data['description'].replace("'", "''")}'" if workout_data['description'] else 'NULL'},
    {workout_data['drill_count'] or 'NULL'},
    NOW()
);"""
    return sql

def main():
    input_file = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/docs/Wordpress CSV\'s/Quizzes-Workouts-Export-2025-July-31-0920.csv'
    output_sql = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/skills_academy_workouts_import.sql'
    output_summary = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/skills_academy_workouts_summary.json'
    
    workouts = []
    sql_statements = []
    
    # Create table definition
    table_sql = """
-- Skills Academy Workouts Table
CREATE TABLE IF NOT EXISTS skills_academy_workouts (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    workout_type VARCHAR(50) CHECK (workout_type IN ('wall_ball', 'attack', 'defense', 'midfield', 'flex', 'general')),
    duration_minutes INTEGER,
    point_values JSONB,
    tags TEXT[],
    description TEXT,
    drill_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_workout_type ON skills_academy_workouts(workout_type);
CREATE INDEX idx_workout_tags ON skills_academy_workouts USING GIN(tags);

-- Create workout-to-drills relationship table
CREATE TABLE IF NOT EXISTS workout_drill_relationships (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES skills_academy_workouts(id),
    drill_id INTEGER REFERENCES skills_academy_drills(id),
    sequence_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
"""
    
    sql_statements.append(table_sql)
    
    with open(input_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            title = row.get('Title', '').strip()
            
            # Skip individual drills (those with Vimeo embeds)
            if row.get('Content') and 'vimeo.com' in row.get('Content', ''):
                continue
            
            # Identify workouts
            is_workout = False
            if any(keyword in title.lower() for keyword in ['workout', 'practice', 'maintenance']):
                is_workout = True
            
            # Check categories for workout indicators
            categories = row.get('Quiz / Workout Categories', '')
            if any(indicator in categories for indicator in ['Workout Length>', 'Wall Ball', 'Attack Drills>Attack']):
                is_workout = True
            
            if not is_workout:
                continue
            
            # Parse workout data
            workout_type = extract_workout_type(title, categories)
            duration = parse_workout_duration(title)
            point_values = parse_workout_points(categories, workout_type, duration)
            tags = parse_workout_tags(row.get('Quiz / Workout Tags', ''), categories, title)
            
            # Extract drill count from title if available
            drill_count = None
            count_match = re.search(r'(\d+)\s*Drill', title)
            if count_match:
                drill_count = int(count_match.group(1))
            
            # Clean content for description
            content = row.get('Content', '')
            if content:
                # Remove WordPress shortcodes and HTML
                content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
                content = re.sub(r'<[^>]+>', '', content)
                content = content.strip()
            
            workout_data = {
                'id': int(row['ID']),
                'title': title,
                'workout_type': workout_type,
                'duration': duration,
                'point_values': point_values,
                'tags': tags,
                'description': content,
                'drill_count': drill_count
            }
            
            workouts.append(workout_data)
            sql_statements.append(create_workout_sql(workout_data))
    
    # Write SQL file
    with open(output_sql, 'w', encoding='utf-8') as f:
        f.write('-- Skills Academy Workouts Import\n')
        f.write(f'-- Generated: {datetime.now().isoformat()}\n')
        f.write(f'-- Total Workouts: {len(workouts)}\n\n')
        f.write('\n'.join(sql_statements))
    
    # Generate summary
    summary = {
        'total_workouts': len(workouts),
        'workout_types': {},
        'duration_ranges': {
            '5_min': 0,
            '10_min': 0,
            '15_plus': 0,
            'unspecified': 0
        },
        'point_distribution': {
            'lax_credit': 0,
            'attack_token': 0,
            'rebound_reward': 0,
            'flex_points': 0
        },
        'tag_frequency': {}
    }
    
    for workout in workouts:
        # Count workout types
        wtype = workout['workout_type']
        summary['workout_types'][wtype] = summary['workout_types'].get(wtype, 0) + 1
        
        # Count duration ranges
        duration = workout['duration']
        if duration:
            if duration <= 5:
                summary['duration_ranges']['5_min'] += 1
            elif duration <= 10:
                summary['duration_ranges']['10_min'] += 1
            else:
                summary['duration_ranges']['15_plus'] += 1
        else:
            summary['duration_ranges']['unspecified'] += 1
        
        # Count point distributions
        for point_type, value in workout['point_values'].items():
            if value > 0:
                summary['point_distribution'][point_type] += 1
        
        # Count tags
        for tag in workout['tags']:
            summary['tag_frequency'][tag] = summary['tag_frequency'].get(tag, 0) + 1
    
    # Sort tags by frequency
    summary['tag_frequency'] = dict(sorted(summary['tag_frequency'].items(), 
                                          key=lambda x: x[1], reverse=True))
    
    with open(output_summary, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    
    print(f"✅ Processed {len(workouts)} Skills Academy workouts")
    print(f"📄 SQL file: {output_sql}")
    print(f"📊 Summary file: {output_summary}")
    
    # Print summary stats
    print("\n📈 Summary Statistics:")
    print("  Workout types:")
    for wtype, count in summary['workout_types'].items():
        print(f"    - {wtype}: {count}")
    print(f"\n  Duration distribution:")
    print(f"    - 5 minutes: {summary['duration_ranges']['5_min']}")
    print(f"    - 10 minutes: {summary['duration_ranges']['10_min']}")
    print(f"    - 15+ minutes: {summary['duration_ranges']['15_plus']}")
    print(f"    - Unspecified: {summary['duration_ranges']['unspecified']}")
    print(f"\n  Point types awarded:")
    for ptype, count in summary['point_distribution'].items():
        if count > 0:
            print(f"    - {ptype}: {count} workouts")

if __name__ == "__main__":
    main()