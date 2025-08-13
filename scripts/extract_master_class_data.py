#!/usr/bin/env python3
"""
Script to extract relevant columns from the Master Classes Export CSV.
Extracts: Title, Featured, Master Class Categories, Master Class Tags
"""

import csv
import os
from typing import List, Dict

def process_master_classes_csv(input_file: str, output_file: str) -> None:
    """
    Process the master classes CSV file and extract relevant columns.
    """
    print(f"Processing {input_file}...")
    
    master_class_data = []
    processed_count = 0
    
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
                featured = row.get('Featured', '').strip()
                master_class_categories = row.get('Master Class Categories', '').strip()
                master_class_tags = row.get('Master Class Tags', '').strip()
                
                # Only include rows with a title
                if title:
                    master_class_data.append({
                        'Title': title,
                        'Featured': featured,
                        'Master Class Categories': master_class_categories,
                        'Master Class Tags': master_class_tags
                    })
                    
                    if row_num <= 10:  # Print first 10 rows for debugging
                        print(f"Row {row_num}: '{title}' - Featured: '{featured}' - Categories: '{master_class_categories}' - Tags: '{master_class_tags}'")
    
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return
    
    # Write the results to a new CSV
    if master_class_data:
        try:
            with open(output_file, 'w', encoding='utf-8', newline='') as csvfile:
                fieldnames = ['Title', 'Featured', 'Master Class Categories', 'Master Class Tags']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                writer.writerows(master_class_data)
                
            print(f"\n✅ Successfully created {output_file}")
            print(f"📊 Statistics:")
            print(f"   - Total rows processed: {processed_count}")
            print(f"   - Rows with titles: {len(master_class_data)}")
            print(f"   - Output file: {output_file}")
            
        except Exception as e:
            print(f"Error writing output CSV: {e}")
    else:
        print("❌ No data found in the CSV file.")

def main():
    """Main function to run the script."""
    # Define file paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    input_file = os.path.join(project_root, "docs/Wordpress CSV's/Master-Classes-Export-2025-July-31-0929.csv")
    output_file = os.path.join(project_root, "docs/Wordpress CSV's/extracted_master_classes.csv")
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        return
    
    # Process the CSV
    process_master_classes_csv(input_file, output_file)

if __name__ == "__main__":
    main()
