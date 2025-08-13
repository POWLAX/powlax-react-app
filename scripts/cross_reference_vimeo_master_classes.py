#!/usr/bin/env python3
"""
Script to cross-reference the extracted Vimeo lessons CSV with the Master Classes CSV.
Matches by Title and combines the data into a final CSV.
"""

import csv
import os
from typing import List, Dict, Optional
from difflib import SequenceMatcher

def similarity(a: str, b: str) -> float:
    """Calculate similarity between two strings."""
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()

def find_best_match(target_title: str, master_classes: List[Dict], threshold: float = 0.8) -> Optional[Dict]:
    """
    Find the best matching master class by title similarity.
    Returns the best match if similarity is above threshold, otherwise None.
    """
    best_match = None
    best_similarity = 0.0
    
    for master_class in master_classes:
        sim = similarity(target_title, master_class['Title'])
        if sim > best_similarity and sim >= threshold:
            best_similarity = sim
            best_match = master_class
    
    return best_match, best_similarity if best_match else (None, 0.0)

def cross_reference_data(vimeo_file: str, master_classes_file: str, output_file: str) -> None:
    """
    Cross-reference the Vimeo lessons with Master Classes data.
    """
    print(f"Cross-referencing {vimeo_file} with {master_classes_file}...")
    
    # Load master classes data
    master_classes = []
    try:
        with open(master_classes_file, 'r', encoding='utf-8', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            master_classes = list(reader)
            print(f"Loaded {len(master_classes)} master classes")
    except Exception as e:
        print(f"Error reading master classes file: {e}")
        return
    
    # Load Vimeo lessons data and cross-reference
    final_data = []
    exact_matches = 0
    fuzzy_matches = 0
    no_matches = 0
    
    try:
        with open(vimeo_file, 'r', encoding='utf-8', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row_num, vimeo_lesson in enumerate(reader, start=1):
                title = vimeo_lesson['Title']
                
                # Try to find exact match first
                exact_match = None
                for master_class in master_classes:
                    if master_class['Title'].strip().lower() == title.strip().lower():
                        exact_match = master_class
                        break
                
                if exact_match:
                    # Exact match found
                    exact_matches += 1
                    match_type = "Exact"
                    match_similarity = 1.0
                    matched_class = exact_match
                else:
                    # Try fuzzy matching
                    matched_class, match_similarity = find_best_match(title, master_classes, threshold=0.7)
                    if matched_class:
                        fuzzy_matches += 1
                        match_type = "Fuzzy"
                    else:
                        no_matches += 1
                        match_type = "No Match"
                
                # Create the final row
                final_row = {
                    'Title': title,
                    'Vimeo URL from the Python': vimeo_lesson['Vimeo URL from the Python'],
                    'Own It Ages': vimeo_lesson['Own It Ages'],
                    'Coach It Ages': vimeo_lesson['Coach It Ages'],
                    'See & Do It Ages': vimeo_lesson['See & Do It Ages'],
                    'Featured': matched_class['Featured'] if matched_class else '',
                    'Master Class Categories': matched_class['Master Class Categories'] if matched_class else '',
                    'Master Class Tags': matched_class['Master Class Tags'] if matched_class else '',
                    'Match Type': match_type,
                    'Match Similarity': f"{match_similarity:.2f}" if matched_class else "0.00",
                    'Matched Title': matched_class['Title'] if matched_class else ''
                }
                
                final_data.append(final_row)
                
                # Print matching details
                if matched_class:
                    print(f"Row {row_num}: '{title}' -> {match_type} match ({match_similarity:.2f}) with '{matched_class['Title']}'")
                else:
                    print(f"Row {row_num}: '{title}' -> No match found")
    
    except Exception as e:
        print(f"Error reading Vimeo lessons file: {e}")
        return
    
    # Write the final cross-referenced data
    if final_data:
        try:
            with open(output_file, 'w', encoding='utf-8', newline='') as csvfile:
                fieldnames = [
                    'Title', 
                    'Vimeo URL from the Python', 
                    'Own It Ages', 
                    'Coach It Ages', 
                    'See & Do It Ages',
                    'Featured', 
                    'Master Class Categories', 
                    'Master Class Tags',
                    'Match Type',
                    'Match Similarity',
                    'Matched Title'
                ]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                writer.writerows(final_data)
                
            print(f"\n✅ Successfully created {output_file}")
            print(f"📊 Cross-reference Statistics:")
            print(f"   - Total Vimeo lessons processed: {len(final_data)}")
            print(f"   - Exact matches: {exact_matches}")
            print(f"   - Fuzzy matches: {fuzzy_matches}")
            print(f"   - No matches: {no_matches}")
            print(f"   - Match rate: {((exact_matches + fuzzy_matches) / len(final_data) * 100):.1f}%")
            print(f"   - Output file: {output_file}")
            
        except Exception as e:
            print(f"Error writing output CSV: {e}")
    else:
        print("❌ No data to cross-reference.")

def main():
    """Main function to run the script."""
    # Define file paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    vimeo_file = os.path.join(project_root, "docs/Wordpress CSV's/extracted_vimeo_lessons.csv")
    master_classes_file = os.path.join(project_root, "docs/Wordpress CSV's/extracted_master_classes.csv")
    output_file = os.path.join(project_root, "docs/Wordpress CSV's/final_vimeo_master_classes_cross_reference.csv")
    
    # Check if input files exist
    if not os.path.exists(vimeo_file):
        print(f"❌ Vimeo lessons file not found: {vimeo_file}")
        print("Please run extract_vimeo_links.py first.")
        return
        
    if not os.path.exists(master_classes_file):
        print(f"❌ Master classes file not found: {master_classes_file}")
        print("Please run extract_master_class_data.py first.")
        return
    
    # Cross-reference the data
    cross_reference_data(vimeo_file, master_classes_file, output_file)

if __name__ == "__main__":
    main()
