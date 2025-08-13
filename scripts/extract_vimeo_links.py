#!/usr/bin/env python3
"""
Script to extract Vimeo links from the Lessons Export CSV.
Looks for Vimeo player URLs in the Content column and creates a new CSV with:
- Title
- Vimeo URL from the Python
- Own It Ages
- Coach It Ages
- See & Do It Ages
"""

import csv
import re
import os
from typing import List, Dict, Optional

def extract_vimeo_id_from_content(content: str) -> Optional[str]:
    """
    Extract Vimeo video ID from HTML content.
    Looks for patterns like: https://player.vimeo.com/video/1081205199
    """
    if not content:
        return None
    
    # Pattern to match Vimeo player URLs
    vimeo_pattern = r'https://player\.vimeo\.com/video/(\d+)'
    
    matches = re.findall(vimeo_pattern, content)
    if matches:
        # Return the first Vimeo ID found
        return f"https://player.vimeo.com/video/{matches[0]}"
    
    return None

def process_lessons_csv(input_file: str, output_file: str) -> None:
    """
    Process the lessons CSV file and extract Vimeo links.
    """
    print(f"Processing {input_file}...")
    
    vimeo_data = []
    processed_count = 0
    vimeo_found_count = 0
    
    try:
        with open(input_file, 'r', encoding='utf-8', newline='') as csvfile:
            # Use csv.Sniffer to detect delimiter
            sample = csvfile.read(1024)
            csvfile.seek(0)
            sniffer = csv.Sniffer()
            delimiter = sniffer.sniff(sample).delimiter
            
            reader = csv.DictReader(csvfile, delimiter=delimiter)
            
            print(f"CSV columns found: {reader.fieldnames}")
            print(f"Using delimiter: '{delimiter}'")
            
            for row_num, row in enumerate(reader, start=2):  # Start at 2 because row 1 is headers
                processed_count += 1
                
                title = row.get('Title', '').strip()
                content = row.get('Content', '')
                own_it_ages = row.get('Own It Ages', '').strip()
                coach_it_ages = row.get('Coach It Ages', '').strip()
                see_do_it_ages = row.get('See & Do It Ages', '').strip()
                
                # Extract Vimeo URL from content
                vimeo_url = extract_vimeo_id_from_content(content)
                
                if vimeo_url and title:  # Only include rows with both title and Vimeo URL
                    vimeo_found_count += 1
                    vimeo_data.append({
                        'Title': title,
                        'Vimeo URL from the Python': vimeo_url,
                        'Own It Ages': own_it_ages,
                        'Coach It Ages': coach_it_ages,
                        'See & Do It Ages': see_do_it_ages
                    })
                    print(f"Row {row_num}: Found Vimeo URL in '{title}': {vimeo_url}")
    
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return
    
    # Write the results to a new CSV
    if vimeo_data:
        try:
            with open(output_file, 'w', encoding='utf-8', newline='') as csvfile:
                fieldnames = ['Title', 'Vimeo URL from the Python', 'Own It Ages', 'Coach It Ages', 'See & Do It Ages']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                writer.writerows(vimeo_data)
                
            print(f"\n✅ Successfully created {output_file}")
            print(f"📊 Statistics:")
            print(f"   - Total rows processed: {processed_count}")
            print(f"   - Rows with Vimeo URLs: {vimeo_found_count}")
            print(f"   - Output file: {output_file}")
            
        except Exception as e:
            print(f"Error writing output CSV: {e}")
    else:
        print("❌ No Vimeo URLs found in the CSV file.")

def main():
    """Main function to run the script."""
    # Define file paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    input_file = os.path.join(project_root, "docs/Wordpress CSV's/Lessons-Export-2025-July-31-0933.csv")
    output_file = os.path.join(project_root, "docs/Wordpress CSV's/extracted_vimeo_lessons.csv")
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        return
    
    # Process the CSV
    process_lessons_csv(input_file, output_file)

if __name__ == "__main__":
    main()
