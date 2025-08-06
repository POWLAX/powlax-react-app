#!/usr/bin/env python3
"""
POWLAX Badges and Achievements Upload Script
Processes all badge/achievement CSV exports from GamiPress
and generates SQL for Supabase upload
"""

import csv
import re
import json
import os
from datetime import datetime

# Badge categories and their corresponding CSV files
BADGE_CATEGORIES = {
    'attack': 'Attack-Badges-Export-2025-July-31-1836.csv',
    'defense': 'Defense-Badges-Export-2025-July-31-1855.csv',
    'midfield': 'Midfield-Badges-Export-2025-July-31-1903.csv',
    'wall_ball': 'Wall-Ball-Badges-Export-2025-July-31-1925.csv',
    'lacrosse_iq': 'Lacrosse-IQ-Badges-Export-2025-July-31-1858.csv',
    'solid_start': 'Solid-Start-Badges-Export-2025-July-31-1920.csv',
    'completed_workouts': 'Completed-Workouts-Export-2025-July-31-1849.csv'
}

# Point type mappings
POINT_TYPE_MAP = {
    'lax-credit': 'lax_credit',
    'attack-token': 'attack_token',
    'midfield-metal': 'midfield_medal',
    'midfield-medal': 'midfield_medal',
    'defense-dollar': 'defense_dollar',
    'rebound-rewards': 'rebound_reward',
    'lax-iq-point': 'lax_iq_point',
    'flex-point': 'flex_point'
}

def clean_html(text):
    """Remove HTML tags and WordPress shortcodes"""
    if not text:
        return ""
    # Remove HTML comments
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Remove WordPress shortcodes
    text = re.sub(r'\[.*?\]', '', text)
    # Clean up whitespace
    text = ' '.join(text.split())
    return text.strip()

def extract_image_url(url_field):
    """Extract the first image URL from pipe-separated list"""
    if not url_field:
        return None
    urls = url_field.split('|')
    if urls:
        return urls[0].strip()
    return None

def parse_earned_by(earned_by_str):
    """Parse the earned_by field to extract requirements"""
    if not earned_by_str:
        return 'admin_award', {}
    
    earned_by_str = earned_by_str.lower()
    
    # Common patterns
    if 'completing a specific number of steps' in earned_by_str:
        return 'steps', {'type': 'achievement_steps'}
    elif 'earn by points' in earned_by_str:
        return 'points', {'type': 'points_threshold'}
    elif 'completing all' in earned_by_str:
        return 'all_steps', {'type': 'complete_all'}
    elif 'admin' in earned_by_str:
        return 'admin_award', {}
    else:
        return 'custom', {'description': earned_by_str}

def parse_badge_data(row, category):
    """Parse a badge row into structured data"""
    badge_data = {
        'id': int(row['ID']),
        'title': row['Title'].strip(),
        'category': category,
        'description': clean_html(row.get('Content', '')),
        'excerpt': row.get('Excerpt', '').strip(),
        'slug': row.get('Slug', '').strip(),
        'image_url': extract_image_url(row.get('URL', '')),
        'earned_by_type': None,
        'earned_by_config': {},
        'points_required': None,
        'points_type_required': None,
        'maximum_earnings': None,
        'hidden': False,
        'sequential': False,
        'congratulations_text': None,
        'metadata': {}
    }
    
    # Parse earned_by
    earned_by_type, earned_by_config = parse_earned_by(row.get('_gamipress_earned_by', ''))
    badge_data['earned_by_type'] = earned_by_type
    badge_data['earned_by_config'] = earned_by_config
    
    # Parse points requirements
    if row.get('_gamipress_points_required'):
        try:
            badge_data['points_required'] = int(row['_gamipress_points_required'])
        except:
            pass
    
    # Parse points type
    points_type = row.get('_gamipress_points_type_required', '').strip()
    if points_type and points_type in POINT_TYPE_MAP:
        badge_data['points_type_required'] = POINT_TYPE_MAP[points_type]
    
    # Parse other fields
    if row.get('_gamipress_maximum_earnings'):
        try:
            badge_data['maximum_earnings'] = int(row['_gamipress_maximum_earnings'])
        except:
            badge_data['maximum_earnings'] = 1
    
    badge_data['hidden'] = row.get('_gamipress_hidden') == 'yes'
    badge_data['sequential'] = row.get('_gamipress_sequential') == 'yes'
    badge_data['congratulations_text'] = row.get('_gamipress_congratulations_text', '').strip()
    
    # Store additional metadata
    metadata_fields = [
        '_gamipress_layout', '_gamipress_align', 
        '_gamipress_show_times_earned', '_gamipress_points'
    ]
    for field in metadata_fields:
        if row.get(field):
            badge_data['metadata'][field.replace('_gamipress_', '')] = row[field]
    
    return badge_data

def create_badge_sql(badge):
    """Generate SQL insert for a badge"""
    sql = f"""
INSERT INTO badges (
    original_id,
    title,
    category,
    description,
    excerpt,
    slug,
    image_url,
    earned_by_type,
    earned_by_config,
    points_required,
    points_type_required,
    maximum_earnings,
    is_hidden,
    is_sequential,
    congratulations_text,
    metadata,
    created_at
) VALUES (
    {badge['id']},
    '{badge['title'].replace("'", "''")}',
    '{badge['category']}',
    {f"'{badge['description'].replace("'", "''")}'" if badge['description'] else 'NULL'},
    {f"'{badge['excerpt'].replace("'", "''")}'" if badge['excerpt'] else 'NULL'},
    '{badge['slug']}',
    {f"'{badge['image_url']}'" if badge['image_url'] else 'NULL'},
    '{badge['earned_by_type']}',
    '{json.dumps(badge['earned_by_config'])}'::jsonb,
    {badge['points_required'] or 'NULL'},
    {f"'{badge['points_type_required']}'" if badge['points_type_required'] else 'NULL'},
    {badge['maximum_earnings'] or 1},
    {str(badge['hidden']).lower()},
    {str(badge['sequential']).lower()},
    {f"'{badge['congratulations_text'].replace("'", "''")}'" if badge['congratulations_text'] else 'NULL'},
    '{json.dumps(badge['metadata'])}'::jsonb,
    NOW()
) ON CONFLICT (original_id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    updated_at = NOW();"""
    return sql

def main():
    base_dir = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/docs/Wordpress CSV\'s/Gamipress Gamification Exports'
    output_sql = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/badges_import.sql'
    output_summary = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/badges_summary.json'
    
    all_badges = []
    sql_statements = []
    
    # Create table definition
    table_sql = """
-- POWLAX Badges and Achievements Table
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    excerpt TEXT,
    slug VARCHAR(255) UNIQUE,
    image_url TEXT,
    earned_by_type VARCHAR(50),
    earned_by_config JSONB DEFAULT '{}'::jsonb,
    points_required INTEGER,
    points_type_required VARCHAR(50),
    maximum_earnings INTEGER DEFAULT 1,
    is_hidden BOOLEAN DEFAULT FALSE,
    is_sequential BOOLEAN DEFAULT FALSE,
    congratulations_text TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_badge_category ON badges(category);
CREATE INDEX idx_badge_earned_by ON badges(earned_by_type);
CREATE INDEX idx_badge_points_type ON badges(points_type_required);
CREATE INDEX idx_badge_hidden ON badges(is_hidden);

-- Badge progress tracking table
CREATE TABLE IF NOT EXISTS user_badge_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    badge_id INTEGER REFERENCES badges(id),
    progress INTEGER DEFAULT 0,
    earned_count INTEGER DEFAULT 0,
    first_earned_at TIMESTAMP,
    last_earned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Badge requirements table (for complex multi-step badges)
CREATE TABLE IF NOT EXISTS badge_requirements (
    id SERIAL PRIMARY KEY,
    badge_id INTEGER REFERENCES badges(id),
    requirement_type VARCHAR(50),
    requirement_config JSONB,
    sequence_order INTEGER,
    is_optional BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
"""
    
    sql_statements.append(table_sql)
    
    # Process each badge category
    for category, filename in BADGE_CATEGORIES.items():
        file_path = os.path.join(base_dir, filename)
        if not os.path.exists(file_path):
            print(f"⚠️  Skipping {category} - file not found: {filename}")
            continue
        
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            category_badges = []
            
            for row in reader:
                if row.get('ID') and row.get('Title'):
                    try:
                        badge = parse_badge_data(row, category)
                        category_badges.append(badge)
                        all_badges.append(badge)
                        sql_statements.append(create_badge_sql(badge))
                    except Exception as e:
                        print(f"Error processing badge {row.get('ID', 'unknown')}: {e}")
            
            print(f"✅ Processed {len(category_badges)} badges from {category}")
    
    # Write SQL file
    with open(output_sql, 'w', encoding='utf-8') as f:
        f.write('-- POWLAX Badges and Achievements Import\n')
        f.write(f'-- Generated: {datetime.now().isoformat()}\n')
        f.write(f'-- Total Badges: {len(all_badges)}\n\n')
        f.write('\n'.join(sql_statements))
    
    # Generate summary
    summary = {
        'total_badges': len(all_badges),
        'by_category': {},
        'by_earned_type': {},
        'by_points_type': {},
        'point_requirements': {
            'min': None,
            'max': None,
            'average': 0
        },
        'hidden_badges': 0,
        'sequential_badges': 0
    }
    
    # Analyze badges
    point_values = []
    for badge in all_badges:
        # Count by category
        cat = badge['category']
        summary['by_category'][cat] = summary['by_category'].get(cat, 0) + 1
        
        # Count by earned type
        etype = badge['earned_by_type']
        summary['by_earned_type'][etype] = summary['by_earned_type'].get(etype, 0) + 1
        
        # Count by points type
        if badge['points_type_required']:
            ptype = badge['points_type_required']
            summary['by_points_type'][ptype] = summary['by_points_type'].get(ptype, 0) + 1
        
        # Track point requirements
        if badge['points_required']:
            point_values.append(badge['points_required'])
        
        # Count special flags
        if badge['hidden']:
            summary['hidden_badges'] += 1
        if badge['sequential']:
            summary['sequential_badges'] += 1
    
    # Calculate point statistics
    if point_values:
        summary['point_requirements']['min'] = min(point_values)
        summary['point_requirements']['max'] = max(point_values)
        summary['point_requirements']['average'] = sum(point_values) / len(point_values)
    
    # Write summary
    with open(output_summary, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n✅ Processed {len(all_badges)} total badges")
    print(f"📄 SQL file: {output_sql}")
    print(f"📊 Summary file: {output_summary}")
    
    # Print summary stats
    print("\n📈 Badge Statistics:")
    print("  By Category:")
    for cat, count in summary['by_category'].items():
        print(f"    - {cat}: {count}")
    print("\n  By Earn Type:")
    for etype, count in summary['by_earned_type'].items():
        print(f"    - {etype}: {count}")
    print(f"\n  Special Badges:")
    print(f"    - Hidden: {summary['hidden_badges']}")
    print(f"    - Sequential: {summary['sequential_badges']}")

if __name__ == "__main__":
    main()