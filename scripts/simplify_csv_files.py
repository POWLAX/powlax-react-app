#!/usr/bin/env python3
"""
Simplify CSV files to include only specified columns
"""

import csv
from pathlib import Path

def simplify_badges_csv():
    """Simplify badges CSV to only include specified columns"""
    input_file = Path(__file__).parent.parent / "docs" / "data" / "extracted" / "powlax_badges_final.csv"
    output_file = Path(__file__).parent.parent / "docs" / "data" / "extracted" / "powlax_badges_simplified.csv"
    
    # Columns to keep
    keep_columns = ['title', 'category', 'description', 'image_url', 'congratulations_text']
    
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        
        with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=keep_columns)
            writer.writeheader()
            
            for row in reader:
                # Only write the specified columns
                simplified_row = {col: row.get(col, '') for col in keep_columns}
                writer.writerow(simplified_row)
    
    print(f"Simplified badges CSV written to: {output_file}")
    return output_file

def simplify_ranks_csv():
    """Simplify ranks CSV to only include specified columns"""
    input_file = Path(__file__).parent.parent / "docs" / "data" / "extracted" / "powlax_ranks_final.csv"
    output_file = Path(__file__).parent.parent / "docs" / "data" / "extracted" / "powlax_ranks_simplified.csv"
    
    # For ranks, we'll include title, description, image_url, congratulations_text
    # Note: ranks don't have a 'category' field, so we'll add it as 'rank'
    keep_columns = ['title', 'category', 'description', 'image_url', 'congratulations_text']
    
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        
        with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=keep_columns)
            writer.writeheader()
            
            for row in reader:
                # Create simplified row with category set to 'rank'
                simplified_row = {
                    'title': row.get('title', ''),
                    'category': 'rank',  # All ranks have category 'rank'
                    'description': row.get('description', ''),
                    'image_url': row.get('image_url', ''),
                    'congratulations_text': row.get('congratulations_text', '')
                }
                writer.writerow(simplified_row)
    
    print(f"Simplified ranks CSV written to: {output_file}")
    return output_file

def main():
    """Main function to simplify both CSV files"""
    print("Simplifying CSV files to include only: title, category, description, image_url, congratulations_text")
    
    badges_file = simplify_badges_csv()
    ranks_file = simplify_ranks_csv()
    
    print(f"\n=== SIMPLIFICATION COMPLETE ===")
    print(f"Output files:")
    print(f"  - Badges: {badges_file}")
    print(f"  - Ranks: {ranks_file}")
    
    # Count records
    with open(badges_file, 'r') as f:
        badge_count = sum(1 for line in f) - 1  # Subtract header
    
    with open(ranks_file, 'r') as f:
        rank_count = sum(1 for line in f) - 1  # Subtract header
    
    print(f"\nRecord counts:")
    print(f"  - Badges: {badge_count}")
    print(f"  - Ranks: {rank_count}")

if __name__ == "__main__":
    main()
