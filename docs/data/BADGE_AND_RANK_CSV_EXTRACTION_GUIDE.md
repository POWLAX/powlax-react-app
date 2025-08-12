# POWLAX Badge and Rank CSV Extraction Guide

## 📋 Overview

This document provides a comprehensive guide for extracting badge titles, URLs, and other critical data from the GamiPress CSV exports located in `docs/Wordpress CSV's/Gamipress Gamification Exports/`.

## 🏆 Badge CSV Files Structure

### Available Badge Categories

| Category | CSV File | Description |
|----------|----------|-------------|
| Attack | `Attack-Badges-Export-2025-July-31-1836.csv` | Attack position badges |
| Defense | `Defense-Badges-Export-2025-July-31-1855.csv` | Defense position badges |
| Midfield | `Midfield-Badges-Export-2025-July-31-1903.csv` | Midfield position badges |
| Wall Ball | `Wall-Ball-Badges-Export-2025-July-31-1925.csv` | Wall ball drill badges |
| Lacrosse IQ | `Lacrosse-IQ-Badges-Export-2025-July-31-1858.csv` | Knowledge/quiz badges |
| Solid Start | `Solid-Start-Badges-Export-2025-July-31-1920.csv` | Beginner badges |
| Completed Workouts | `Completed-Workouts-Export-2025-July-31-1849.csv` | Workout completion badges |

### Critical CSV Columns for Badge Extraction

#### Primary Data Fields
```
Column B: Title - Badge name/title (REQUIRED)
Column D: Excerpt - Badge description (REQUIRED)
Column H: URL - Primary badge image URL (REQUIRED)
Column M: Featured - Secondary/featured image URL (OPTIONAL)
```

#### GamiPress Metadata Fields
```
_gamipress_congratulations_text - Award message text
_gamipress_points_required - Points needed to earn badge
_gamipress_points_type_required - Type of points required
_gamipress_earned_by - How badge is earned
_gamipress_maximum_earnings - Max times badge can be earned
_gamipress_hidden - Whether badge is hidden (yes/no)
_gamipress_sequential - Whether badge requires sequential completion
```

### Badge Data Extraction Template

For each badge row in CSV, extract:

```json
{
  "id": "CSV_Row_ID",
  "title": "Badge Title from Column B",
  "description": "Cleaned text from Excerpt/Content columns",
  "category": "badge_category_from_filename",
  "image_url": "Primary URL from Column H",
  "featured_image_url": "Secondary URL from Column M",
  "congratulations_text": "Text from _gamipress_congratulations_text",
}
```

## 👑 Rank CSV Files Structure

### Available Rank Files

| File | Description |
|------|-------------|
| `Lacrosse-Player-Ranks-Export-2025-July-31-1859.csv` | Main rank definitions |


### Critical CSV Columns for Rank Extraction

#### Primary Data Fields
```
Title - Rank name (often includes credit requirements in parentheses)
Excerpt - Rank description
URL - Rank badge/image URL
Content - Detailed rank description (may contain HTML - Please remove and leave only text)
Order - Rank progression order
```

#### GamiPress Metadata Fields
```
_gamipress_congratulations_text - Rank achievement message
_gamipress_points_required - Points needed for rank
_gamipress_rank_type_required - Type of rank system
```

### Rank Data Extraction Template

For each rank row in CSV, extract:

```json
{
  "id": "CSV_Row_ID",
  "title": "Rank Title",
  "description": "Cleaned text from Excerpt/Content",
  "image_url": "URL from URL column",
  "order": "Progression order number",
  "congratulations_text": "Text from _gamipress_congratulations_text",
}
```

## 🔧 Data Processing Instructions

### 1. URL Extraction
- URLs may be **pipe-separated** (`|`) - take the **first URL** for primary image
- Example: `https://image1.jpg|https://image2.jpg` → use `https://image1.jpg`

### 2. Text Cleaning
Remove HTML tags and WordPress shortcodes:
- Remove: `<!-- comments -->`, `<html tags>`, `[shortcodes]`
- Clean whitespace and normalize text

### 3. Point Type Mapping
Convert GamiPress point types to standardized format:
```
'lax-credit' → 'lax_credit'
'attack-token' → 'attack_token'
'midfield-metal' → 'midfield_medal'
'midfield-medal' → 'midfield_medal'
'defense-dollar' → 'defense_dollar'
'rebound-rewards' → 'rebound_reward'
'lax-iq-point' → 'lax_iq_point'
'flex-point' → 'flex_point'
```

### 4. Category Assignment
Derive badge category from CSV filename:
```
'Attack-Badges-Export-*' → 'attack'
'Defense-Badges-Export-*' → 'defense'
'Midfield-Badges-Export-*' → 'midfield'
'Wall-Ball-Badges-Export-*' → 'wall_ball'
'Lacrosse-IQ-Badges-Export-*' → 'lacrosse_iq'
'Solid-Start-Badges-Export-*' → 'solid_start'
'Completed-Workouts-Export-*' → 'completed_workouts'
```

## 📊 Example Extraction Process

### Step 1: Load CSV File
```
File: Attack-Badges-Export-2025-July-31-1836.csv
Category: attack
```

### Step 2: For Each Row, Extract Core Data
```
Title: "Crease Crawler Badge"
Excerpt: "Awarded for completing drills focused on finishing around the crease with finesse."
URL: "https://powlax.com/wp-content/uploads/2023/08/crease-crawler-badge.png"
Featured: "https://powlax.com/wp-content/uploads/2023/08/crease-crawler-featured.png"
```

### Step 3: Extract Metadata
```
_gamipress_congratulations_text: "Congratulations! You've earned the Crease Crawler Badge!"
_gamipress_points_required: "5"
_gamipress_points_type_required: "attack-token"
_gamipress_earned_by: "Completing 5 attack workouts"
```

### Step 4: Generate Structured Output
```json
{
  "title": "Crease Crawler Badge",
  "description": "Awarded for completing drills focused on finishing around the crease with finesse.",
  "category": "attack",
  "image_url": "https://powlax.com/wp-content/uploads/2023/08/crease-crawler-badge.png",
  "featured_image_url": "https://powlax.com/wp-content/uploads/2023/08/crease-crawler-featured.png",
  "congratulations_text": "Congratulations! You've earned the Crease Crawler Badge!",
  "points_required": 5,
  "points_type_required": "attack_token",
  "earning_mechanism": "Completing 5 attack workouts"
}
```

## 🎯 Implementation Notes

### Required Processing
1. **HTML Cleaning**: Remove all HTML tags and WordPress shortcodes
2. **URL Parsing**: Handle pipe-separated URLs correctly
3. **Data Type Conversion**: Convert strings to appropriate data types (integers, booleans)
4. **Category Mapping**: Derive category from filename
5. **Point Type Standardization**: Map to consistent naming convention

### Validation Checks
- Ensure all badges have titles and descriptions
- Verify image URLs are valid
- Check that point requirements are numeric
- Validate category assignments

### Output Format
Generate structured JSON or SQL INSERT statements for database import.

## 📁 File Locations

### CSV Source Files
```
docs/Wordpress CSV's/Gamipress Gamification Exports/
├── Attack-Badges-Export-2025-July-31-1836.csv
├── Defense-Badges-Export-2025-July-31-1855.csv
├── Midfield-Badges-Export-2025-July-31-1903.csv
├── Wall-Ball-Badges-Export-2025-July-31-1925.csv
├── Lacrosse-IQ-Badges-Export-2025-July-31-1858.csv
├── Solid-Start-Badges-Export-2025-July-31-1920.csv
├── Completed-Workouts-Export-2025-July-31-1849.csv
├── Lacrosse-Player-Ranks-Export-2025-July-31-1859.csv
├── Rank-Requirements-Export-2025-July-31-1917.csv
└── Rank-Types-Export-2025-July-31-1918.csv
```

### Reference Implementation
```
scripts/uploads/badges_upload.py - Complete badge processing example
scripts/uploads/ranks_upload.py - Complete rank processing example
```

## 🔄 Migration Target

### Supabase Tables
- **badges**: Store all badge definitions
- **powlax_ranks**: Store rank definitions  
- **user_badges**: Track user badge achievements
- **user_ranks**: Track user rank progression

This guide provides everything needed to extract badge titles, URLs, and all associated metadata from the GamiPress CSV exports for migration to the POWLAX React application.
