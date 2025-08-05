#!/usr/bin/env python3
"""
POWLAX Player Ranks Upload Script
Processes player rank data and requirements from GamiPress exports
"""

import csv
import re
import json
import os
from datetime import datetime

def clean_text(text):
    """Clean text from HTML and special characters"""
    if not text:
        return ""
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', '', text)
    text = ' '.join(text.split())
    return text.strip()

def parse_rank_data(row):
    """Parse rank data from CSV row"""
    rank_data = {
        'id': int(row['ID']),
        'title': row['Title'].strip(),
        'slug': row.get('Slug', '').strip(),
        'description': clean_text(row.get('Content', '')),
        'excerpt': row.get('Excerpt', '').strip(),
        'order': 0,  # Will be set based on rank progression
        'image_url': None,
        'next_rank_id': None,
        'requirements': [],
        'metadata': {}
    }
    
    # Extract image URL
    if row.get('URL'):
        urls = row['URL'].split('|')
        if urls:
            rank_data['image_url'] = urls[0].strip()
    
    # Parse order from various fields
    if row.get('Order'):
        try:
            rank_data['order'] = int(row['Order'])
        except:
            pass
    
    # Extract metadata
    for key, value in row.items():
        if key.startswith('_gamipress_') and value:
            clean_key = key.replace('_gamipress_', '')
            rank_data['metadata'][clean_key] = value
    
    return rank_data

def parse_rank_requirements(req_row):
    """Parse rank requirement data"""
    requirement = {
        'rank_id': None,  # Will be mapped later
        'requirement_type': 'points',  # Default
        'requirement_config': {},
        'sequence_order': 1,
        'is_optional': False
    }
    
    # Parse the requirement details from content or other fields
    if req_row.get('Content'):
        content = clean_text(req_row['Content'])
        
        # Look for point requirements
        point_match = re.search(r'(\d+)\s*(Lax Credits?|Attack Tokens?|Defense Dollars?|Midfield Medals?|Rebound Rewards?)', content, re.IGNORECASE)
        if point_match:
            amount = int(point_match.group(1))
            point_type = point_match.group(2).lower()
            
            # Map to standardized point types
            if 'lax credit' in point_type:
                requirement['requirement_config'] = {
                    'points_type': 'lax_credit',
                    'points_required': amount
                }
            elif 'attack token' in point_type:
                requirement['requirement_config'] = {
                    'points_type': 'attack_token',
                    'points_required': amount
                }
            elif 'defense dollar' in point_type:
                requirement['requirement_config'] = {
                    'points_type': 'defense_dollar',
                    'points_required': amount
                }
            elif 'midfield medal' in point_type:
                requirement['requirement_config'] = {
                    'points_type': 'midfield_medal',
                    'points_required': amount
                }
            elif 'rebound reward' in point_type:
                requirement['requirement_config'] = {
                    'points_type': 'rebound_reward',
                    'points_required': amount
                }
    
    return requirement

def create_ranks_sql(ranks):
    """Generate SQL for ranks"""
    sql_statements = []
    
    # Table creation
    table_sql = """
-- Player Ranks Table
CREATE TABLE IF NOT EXISTS player_ranks (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    excerpt TEXT,
    rank_order INTEGER NOT NULL,
    image_url TEXT,
    next_rank_id INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Rank Requirements Table
CREATE TABLE IF NOT EXISTS rank_requirements (
    id SERIAL PRIMARY KEY,
    rank_id INTEGER REFERENCES player_ranks(id),
    requirement_type VARCHAR(50),
    requirement_config JSONB,
    sequence_order INTEGER,
    is_optional BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Rank Progress Table
CREATE TABLE IF NOT EXISTS user_rank_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    current_rank_id INTEGER REFERENCES player_ranks(id),
    points_progress JSONB DEFAULT '{}'::jsonb,
    rank_achieved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_rank_order ON player_ranks(rank_order);
CREATE INDEX idx_user_rank ON user_rank_progress(user_id, current_rank_id);
"""
    
    sql_statements.append(table_sql)
    
    # Insert ranks
    for rank in ranks:
        sql = f"""
INSERT INTO player_ranks (
    original_id,
    title,
    slug,
    description,
    excerpt,
    rank_order,
    image_url,
    metadata,
    created_at
) VALUES (
    {rank['id']},
    '{rank['title'].replace("'", "''")}',
    '{rank['slug']}',
    {f"'{rank['description'].replace("'", "''")}'" if rank['description'] else 'NULL'},
    {f"'{rank['excerpt'].replace("'", "''")}'" if rank['excerpt'] else 'NULL'},
    {rank['order']},
    {f"'{rank['image_url']}'" if rank['image_url'] else 'NULL'},
    '{json.dumps(rank['metadata'])}'::jsonb,
    NOW()
) ON CONFLICT (original_id) DO UPDATE SET
    title = EXCLUDED.title,
    rank_order = EXCLUDED.rank_order,
    updated_at = NOW();"""
        sql_statements.append(sql)
    
    return sql_statements

def main():
    base_dir = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/docs/Wordpress CSV\'s/Gamipress Gamification Exports'
    
    # Input files
    ranks_file = os.path.join(base_dir, 'Lacrosse-Player-Ranks-Export-2025-July-31-1859.csv')
    requirements_file = os.path.join(base_dir, 'Rank-Requirements-Export-2025-July-31-1917.csv')
    
    # Output files
    output_sql = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/ranks_import.sql'
    output_summary = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/ranks_summary.json'
    
    ranks = []
    requirements = []
    
    # Process ranks
    if os.path.exists(ranks_file):
        with open(ranks_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('ID') and row.get('Title'):
                    rank = parse_rank_data(row)
                    ranks.append(rank)
        print(f"✅ Processed {len(ranks)} player ranks")
    
    # Process rank requirements if available
    if os.path.exists(requirements_file):
        with open(requirements_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('ID'):
                    req = parse_rank_requirements(row)
                    requirements.append(req)
        print(f"✅ Processed {len(requirements)} rank requirements")
    
    # Sort ranks by order
    ranks.sort(key=lambda x: x['order'])
    
    # Set next_rank_id based on order
    for i in range(len(ranks) - 1):
        ranks[i]['next_rank_id'] = ranks[i + 1]['id']
    
    # Generate SQL
    sql_statements = create_ranks_sql(ranks)
    
    # Write SQL file
    with open(output_sql, 'w', encoding='utf-8') as f:
        f.write('-- POWLAX Player Ranks Import\n')
        f.write(f'-- Generated: {datetime.now().isoformat()}\n')
        f.write(f'-- Total Ranks: {len(ranks)}\n\n')
        f.write('\n'.join(sql_statements))
    
    # Generate summary
    summary = {
        'total_ranks': len(ranks),
        'rank_progression': [
            {
                'order': rank['order'],
                'title': rank['title'],
                'id': rank['id']
            } for rank in ranks
        ],
        'total_requirements': len(requirements)
    }
    
    with open(output_summary, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n📄 SQL file: {output_sql}")
    print(f"📊 Summary file: {output_summary}")
    print(f"\n📈 Rank Progression:")
    for rank in ranks[:5]:  # Show first 5 ranks
        print(f"  {rank['order']}. {rank['title']}")
    if len(ranks) > 5:
        print(f"  ... and {len(ranks) - 5} more ranks")

if __name__ == "__main__":
    main()