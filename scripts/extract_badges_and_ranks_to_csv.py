#!/usr/bin/env python3
"""
Extract clean badge and rank data from GamiPress CSV exports
Creates structured CSV files for easy import
"""

import csv
import re
import json
import os
from pathlib import Path

# Base directory for CSV files
BASE_DIR = Path(__file__).parent.parent / "docs" / "Wordpress CSV's" / "Gamipress Gamification Exports"

# Badge categories and their corresponding CSV files
BADGE_FILES = {
    'attack': 'Attack-Badges-Export-2025-July-31-1836.csv',
    'defense': 'Defense-Badges-Export-2025-July-31-1855.csv',
    'midfield': 'Midfield-Badges-Export-2025-July-31-1903.csv',
    'wall_ball': 'Wall-Ball-Badges-Export-2025-July-31-1925.csv',
    'lacrosse_iq': 'Lacrosse-IQ-Badges-Export-2025-July-31-1858.csv',
    'solid_start': 'Solid-Start-Badges-Export-2025-July-31-1920.csv'
}

# Rank files
RANK_FILES = {
    'ranks': 'Lacrosse-Player-Ranks-Export-2025-July-31-1859.csv'
}

def clean_html(text):
    """Remove HTML tags, WordPress shortcodes, and clean text"""
    if not text:
        return ""
    
    # Remove HTML comments
    text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove WordPress shortcodes
    text = re.sub(r'\[.*?\]', '', text)
    
    # Remove CSS and JavaScript
    text = re.sub(r'\.[\w-]+\s*\{[^}]*\}', '', text)
    text = re.sub(r'function\s+\w+\([^)]*\)\s*\{[^}]*\}', '', text)
    text = re.sub(r'document\.[^;]+;', '', text)
    
    # Clean up entities
    text = text.replace('&nbsp;', ' ')
    text = text.replace('&quot;', '"')
    text = text.replace('&amp;', '&')
    text = text.replace('&lt;', '<')
    text = text.replace('&gt;', '>')
    
    # Clean up whitespace
    text = ' '.join(text.split())
    
    return text.strip()

def extract_image_url(url_field):
    """Extract the first image URL from pipe-separated list"""
    if not url_field:
        return ""
    
    urls = url_field.split('|')
    return urls[0].strip() if urls else ""

def extract_badge_code(title):
    """Extract badge code from title (e.g., 'A1 - Crease Crawler' -> 'A1')"""
    if not title:
        return ""
    
    # Look for pattern like "A1 -", "D2 -", "M3 -", etc.
    match = re.match(r'^([A-Z]+\d+)\s*-', title)
    if match:
        return match.group(1)
    
    # Look for other patterns
    if 'Solid Start' in title:
        return 'SS'
    if 'IQ' in title or 'Quiz' in title:
        return 'IQ'
    
    return ""

def clean_badge_title(title):
    """Clean badge title by removing code prefix"""
    if not title:
        return ""
    
    # Remove pattern like "A1 - " from beginning
    cleaned = re.sub(r'^[A-Z]+\d+\s*-\s*', '', title)
    
    # Clean up any remaining HTML
    cleaned = clean_html(cleaned)
    
    return cleaned.strip()

def process_badge_file(category, filename):
    """Process a single badge CSV file"""
    file_path = BASE_DIR / filename
    badges = []
    
    if not file_path.exists():
        print(f"Warning: File not found: {file_path}")
        return badges
    
    print(f"Processing {category} badges from {filename}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            # Skip the first row which seems to be a number
            first_line = f.readline()
            if first_line.strip().isdigit():
                # Skip this line and read the actual header
                pass
            else:
                # Reset file pointer if first line is the header
                f.seek(0)
            
            reader = csv.DictReader(f)
            
            for row_num, row in enumerate(reader, 1):
                try:
                    # Extract basic info
                    raw_title = row.get('Title', '').strip()
                    if not raw_title:
                        continue
                    
                    badge_code = extract_badge_code(raw_title)
                    clean_title = clean_badge_title(raw_title)
                    
                    # Skip if we can't extract a proper title
                    if not clean_title:
                        continue
                    
                    description = clean_html(row.get('Excerpt', '') or row.get('Content', ''))
                    image_url = extract_image_url(row.get('URL', ''))
                    featured_url = extract_image_url(row.get('Featured', ''))
                    
                    # Extract GamiPress metadata
                    congratulations_text = clean_html(row.get('_gamipress_congratulations_text', ''))
                    points_required = row.get('_gamipress_points_required', '')
                    points_type = row.get('_gamipress_points_type_required', '')
                    earned_by = row.get('_gamipress_earned_by', '')
                    max_earnings = row.get('_gamipress_maximum_earnings', '1')
                    is_hidden = row.get('_gamipress_hidden', '') == 'yes'
                    
                    badge = {
                        'id': row.get('ID', ''),
                        'title': clean_title,
                        'badge_code': badge_code,
                        'category': category,
                        'description': description[:500] if description else '',  # Limit length
                        'image_url': image_url,
                        'featured_image_url': featured_url,
                        'congratulations_text': congratulations_text[:200] if congratulations_text else '',
                        'points_required': points_required,
                        'points_type_required': points_type,
                        'earned_by': earned_by,
                        'maximum_earnings': max_earnings,
                        'is_hidden': str(is_hidden).lower(),
                        'sort_order': len(badges) + 1
                    }
                    
                    badges.append(badge)
                    print(f"  Extracted: {badge_code} - {clean_title}")
                    
                except Exception as e:
                    print(f"  Error processing row {row_num}: {e}")
                    continue
    
    except Exception as e:
        print(f"Error reading file {filename}: {e}")
    
    return badges

def process_rank_file(filename):
    """Process the ranks CSV file"""
    file_path = BASE_DIR / filename
    ranks = []
    
    if not file_path.exists():
        print(f"Warning: File not found: {file_path}")
        return ranks
    
    print(f"Processing ranks from {filename}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row_num, row in enumerate(reader, 1):
                try:
                    title = row.get('Title', '').strip()
                    if not title:
                        continue
                    
                    # Extract credit requirement from title if present
                    lax_credits_required = 0
                    credit_match = re.search(r'\((\d+)\+?\s*(?:Lax\s*)?Credits?\)', title)
                    if credit_match:
                        lax_credits_required = int(credit_match.group(1))
                    
                    # Clean title by removing credit info
                    clean_title = re.sub(r'\s*\([^)]*Credits?\)', '', title).strip()
                    
                    description = clean_html(row.get('Excerpt', '') or row.get('Content', ''))
                    image_url = extract_image_url(row.get('URL', ''))
                    congratulations_text = clean_html(row.get('_gamipress_congratulations_text', ''))
                    
                    rank = {
                        'id': row.get('ID', ''),
                        'title': clean_title,
                        'description': description[:500] if description else '',
                        'image_url': image_url,
                        'lax_credits_required': lax_credits_required,
                        'congratulations_text': congratulations_text[:200] if congratulations_text else '',
                        'rank_order': len(ranks) + 1
                    }
                    
                    ranks.append(rank)
                    print(f"  Extracted: {clean_title} ({lax_credits_required} credits)")
                    
                except Exception as e:
                    print(f"  Error processing row {row_num}: {e}")
                    continue
    
    except Exception as e:
        print(f"Error reading file {filename}: {e}")
    
    return ranks

def write_badges_csv(badges, output_file):
    """Write badges to CSV file"""
    if not badges:
        print("No badges to write")
        return
    
    fieldnames = [
        'id', 'title', 'badge_code', 'category', 'description', 
        'image_url', 'featured_image_url', 'congratulations_text',
        'points_required', 'points_type_required', 'earned_by',
        'maximum_earnings', 'is_hidden', 'sort_order'
    ]
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(badges)
    
    print(f"Wrote {len(badges)} badges to {output_file}")

def write_ranks_csv(ranks, output_file):
    """Write ranks to CSV file"""
    if not ranks:
        print("No ranks to write")
        return
    
    fieldnames = [
        'id', 'title', 'description', 'image_url', 
        'lax_credits_required', 'congratulations_text', 'rank_order'
    ]
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(ranks)
    
    print(f"Wrote {len(ranks)} ranks to {output_file}")

def main():
    """Main processing function"""
    print("Starting badge and rank extraction...")
    
    # Process all badge files
    all_badges = []
    for category, filename in BADGE_FILES.items():
        badges = process_badge_file(category, filename)
        all_badges.extend(badges)
    
    # Process rank files
    all_ranks = []
    for rank_type, filename in RANK_FILES.items():
        ranks = process_rank_file(filename)
        all_ranks.extend(ranks)
    
    # Create output directory
    output_dir = Path(__file__).parent.parent / "docs" / "data" / "extracted"
    output_dir.mkdir(exist_ok=True)
    
    # Write output files
    badges_output = output_dir / "powlax_badges_clean.csv"
    ranks_output = output_dir / "powlax_ranks_clean.csv"
    
    write_badges_csv(all_badges, badges_output)
    write_ranks_csv(all_ranks, ranks_output)
    
    # Summary
    print(f"\n=== EXTRACTION COMPLETE ===")
    print(f"Total badges extracted: {len(all_badges)}")
    print(f"Total ranks extracted: {len(all_ranks)}")
    print(f"Output files:")
    print(f"  - {badges_output}")
    print(f"  - {ranks_output}")
    
    # Category breakdown
    print(f"\nBadge breakdown by category:")
    category_counts = {}
    for badge in all_badges:
        cat = badge['category']
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    for category, count in sorted(category_counts.items()):
        print(f"  {category}: {count} badges")

if __name__ == "__main__":
    main()
