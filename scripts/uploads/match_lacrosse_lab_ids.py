#!/usr/bin/env python3
"""
Match Lacrosse Lab URLs with Video Sheet IDs based on content and terminology
"""

import csv
import re
from difflib import SequenceMatcher

def normalize_text(text):
    """Normalize text for better matching"""
    if not text:
        return ""
    # Convert to lowercase and remove extra spaces
    text = re.sub(r'\s+', ' ', text.lower().strip())
    # Remove punctuation
    text = re.sub(r'[^\w\s]', '', text)
    return text

def extract_key_terms(text):
    """Extract key lacrosse terms from text"""
    key_terms = []
    term_patterns = [
        r'\b\d{1}-\d{1}-\d{1}\b',  # Formations like 1-4-1, 2-3-1
        r'\bman up\b', r'\bman down\b', r'\bzone\b', r'\bdefense\b', r'\boffense\b',
        r'\bclear\b', r'\bmotion\b', r'\bdodge\b', r'\bpick\b', r'\bwheel\b',
        r'\brotation\b', r'\bswing\b', r'\btransition\b', r'\bfast break\b',
        r'\bride\b', r'\bface off\b', r'\bfaceoff\b', r'\bset play\b',
        r'\bpairs\b', r'\bgears\b', r'\bmumbo\b', r'\bweave\b', r'\bcuse\b',
        r'\bduke\b', r'\bvirginia\b', r'\bpenn state\b', r'\bhopkins\b',
        r'\brutgers\b', r'\bsalisbury\b', r'\bdenver\b', r'\bunc\b',
        r'\bberkman\b', r'\bament\b', r'\bokeefe\b'
    ]
    
    text_lower = text.lower()
    for pattern in term_patterns:
        matches = re.findall(pattern, text_lower)
        key_terms.extend(matches)
    
    return set(key_terms)

def calculate_similarity(video_row, lab_row):
    """Calculate similarity score between video and lab entries"""
    score = 0.0
    
    # Extract data
    video_name = video_row.get('name', '')
    video_type = video_row.get('type', '')
    video_content = video_row.get('Content', '')
    
    lab_name = lab_row.get('name', '')
    lab_folder = lab_row.get('folderPath', '')
    lab_desc = lab_row.get('description', '')
    
    # Exact name match (highest priority)
    if normalize_text(video_name) == normalize_text(lab_name):
        return 100.0
    
    # Extract key terms
    video_terms = extract_key_terms(f"{video_name} {video_type} {video_content}")
    lab_terms = extract_key_terms(f"{lab_name} {lab_folder} {lab_desc}")
    
    # Term overlap score
    if video_terms and lab_terms:
        overlap = len(video_terms.intersection(lab_terms))
        total = len(video_terms.union(lab_terms))
        if total > 0:
            score += (overlap / total) * 40
    
    # Name similarity
    name_sim = SequenceMatcher(None, normalize_text(video_name), normalize_text(lab_name)).ratio()
    score += name_sim * 30
    
    # Type matching from folder path
    type_mappings = {
        'offense': ['offense/', 'motion offense/', 'set plays/'],
        'defense': ['defense/', 'man-to-man/', 'zone defense/'],
        'man-up': ['man up/', 'man up & man down/', 'man up/'],
        'man-down': ['man down/', 'man up & man down/', 'man down/'],
        'clearing': ['clearing/', 'clear/'],
        'transition-o-d': ['transition/', 'fast break/', 'slow break/'],
        'riding': ['riding/', 'ride/'],
        'face-offs': ['face off/', 'faceoff/', 'face-off/'],
        'set-plays': ['set plays/', 'set play/'],
        '2-man-game': ['2 man game/', 'two man game/']
    }
    
    # Check type matches
    if video_type:
        video_types = [t.strip() for t in video_type.split(';')]
        lab_folder_lower = lab_folder.lower()
        for vtype in video_types:
            if vtype in type_mappings:
                for folder_pattern in type_mappings[vtype]:
                    if folder_pattern in lab_folder_lower:
                        score += 15
                        break
    
    # Content/description similarity
    if video_content and lab_desc:
        content_sim = SequenceMatcher(None, normalize_text(video_content), normalize_text(lab_desc)).ratio()
        score += content_sim * 15
    
    return score

def main():
    # Read video sheet
    video_data = []
    with open('/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/docs/Wordpress CSV\'s/Strategies and Concepts to LL/Sheet 1-Video Sheet with Vimeo References for Supabase Upload 2.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('Id'):  # Only include rows with IDs
                video_data.append(row)
    
    # Read Lacrosse Lab URLs
    lab_data = []
    with open('/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/docs/Wordpress CSV\'s/Strategies and Concepts to LL/Sheet 1-1-1-POWLAX Lacrosse Lab URLS - Strategies and Concepts.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('name'):  # Only include rows with names
                lab_data.append(row)
    
    # Match entries
    matches = []
    unmatched = []
    
    for lab_row in lab_data:
        best_match = None
        best_score = 0
        best_video = None
        
        for video_row in video_data:
            score = calculate_similarity(video_row, lab_row)
            if score > best_score:
                best_score = score
                best_match = video_row.get('Id')
                best_video = video_row
        
        # Only accept matches with high confidence
        if best_score >= 50:
            matches.append({
                'name': lab_row['name'],
                'Id': best_match,
                'confidence': best_score,
                'video_name': best_video.get('name', ''),
                'folder': lab_row.get('folderPath', '')
            })
        else:
            unmatched.append({
                'name': lab_row['name'],
                'Id': '',
                'folder': lab_row.get('folderPath', ''),
                'best_score': best_score
            })
    
    # Sort by confidence
    matches.sort(key=lambda x: x['confidence'], reverse=True)
    
    # Write results
    print(f"Total video entries: {len(video_data)}")
    print(f"Total lab entries: {len(lab_data)}")
    print(f"Matched: {len(matches)}")
    print(f"Unmatched: {len(unmatched)}")
    
    # Create output CSV data
    output_rows = []
    
    # Create ID to video name mapping
    id_to_video_name = {}
    for video in video_data:
        if video.get('Id'):
            id_to_video_name[video['Id']] = video.get('name', '')
    
    # Add matched entries with video names
    for match in matches:
        video_name = id_to_video_name.get(match['Id'], '')
        # Escape any commas in names
        lab_name = match['name'].replace(',', ';')
        video_name = video_name.replace(',', ';')
        output_rows.append(f'"{match["name"]}",{match["Id"]},"{video_name}"')
    
    # Add unmatched entries
    for unmatch in unmatched:
        lab_name = unmatch['name'].replace(',', ';')
        output_rows.append(f'"{unmatch["name"]}",,')
    
    # Write to file
    with open('/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/lacrosse_lab_id_mapping.csv', 'w', encoding='utf-8') as f:
        f.write("Lacrosse Lab Name,ID,Video Sheet Name\n")
        f.write("\n".join(output_rows))
    
    print(f"\nOutput written to lacrosse_lab_id_mapping.csv")
    
    # Show some examples
    print("\nTop confident matches:")
    for match in matches[:5]:
        print(f"  {match['name']} => ID {match['Id']} (confidence: {match['confidence']:.1f}%)")
        print(f"    Video: {match['video_name']}")
        print(f"    Folder: {match['folder']}")

if __name__ == "__main__":
    main()