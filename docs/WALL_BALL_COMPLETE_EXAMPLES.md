# 📊 WALL BALL COMPLETE WORKOUT EXAMPLES
*Real data from actual CSV files - NO abbreviations*

---

## 📁 SOURCE FILE LOCATION
```
/docs/Wordpress CSV's/2015 POWLAX Plan CSV's Skills Drills/Wall Ball-Wall Ball Skills Video and Which Workouts They Are In.csv
```

---

## 🎯 TWO COMPLETE WALL BALL WORKOUTS WITH DRILLS

### WORKOUT 1: "Master Fundamentals"
**Full Column Name in CSV:** `Master Fundamentals`

**Drills in this workout (in sequence order):**

| Sequence | Drill Name | CSV Row | Video URLs |
|----------|------------|---------|------------|
| 1 | Overhand | Row 4 | Strong: vimeo.com/997153686, Off: vimeo.com/997151828 |
| 2 | Quick Sticks | Row 5 | Strong: vimeo.com/997153630, Off: vimeo.com/997153513 |
| 3 | Near Side Fake | Row 10 | (URLs in columns AC-AG) |
| 8 | Turned Left | Row 7 | (URLs in columns AC-AG) |
| 9 | Turned Right | Row 6 | (URLs in columns AC-AG) |
| 10 | Catch and Switch | Row 8 | (URLs in columns AC-AG) |

**How to read this from CSV:**
- Row 4 (Overhand) has "1" in column E (Master Fundamentals) = First drill
- Row 5 (Quick Sticks) has "2" in column E = Second drill
- Row 10 (Near Side Fake) has "3" in column E = Third drill
- Row 7 (Turned Left) has "8" in column E = Eighth drill
- Row 6 (Turned Right) has "9" in column E = Ninth drill
- Row 8 (Catch and Switch) has "10" in column E = Tenth drill

### WORKOUT 2: "5 Minute Master Fundamentals"
**Full Column Name in CSV:** `5 Minute Master Fundamentals`

**Drills in this workout (in sequence order):**

| Sequence | Drill Name | CSV Row | Video URLs |
|----------|------------|---------|------------|
| 1 | Overhand | Row 4 | Strong: vimeo.com/997153686, Off: vimeo.com/997151828 |
| 2 | Quick Sticks | Row 5 | Strong: vimeo.com/997153630, Off: vimeo.com/997153513 |
| 3 | Turned Right | Row 6 | (URLs in columns AC-AG) |
| 4 | Turned Left | Row 7 | (URLs in columns AC-AG) |
| 5 | Catch and Switch | Row 8 | (URLs in columns AC-AG) |

**How to read this from CSV:**
- Row 4 (Overhand) has "1" in column G (5 Minute Master Fundamentals) = First drill
- Row 5 (Quick Sticks) has "2" in column G = Second drill
- Row 6 (Turned Right) has "3" in column G = Third drill
- Row 7 (Turned Left) has "4" in column G = Fourth drill
- Row 8 (Catch and Switch) has "5" in column G = Fifth drill

---

## 📋 CSV STRUCTURE EXPLANATION

### Column Headers (First Row):
The CSV has these exact column headers for workouts:

| Column | Header Text |
|--------|-------------|
| E | Master Fundamentals |
| F | 10 Master Fund |
| G | 5 Minute Master Fundamentals |
| H | Dodging |
| I | 10 Dodging |
| J | 5 Dodging |
| K | Conditioning |
| L | 10 Min Conditioning |
| M | 5 Min Conditioning |
| N | Faking and Inside Finishing |
| O | 10 Min Faking |
| P | 5 Minute Faking |
| Q | Shooting |
| R | 10 Shooting |
| S | 5 Shooting |
| T | Defensive Emphasis |
| U | 10 Defense |
| V | 5 Defense |
| W | Catch Everything |
| X | 10 Catch Everything |
| Y | 5 Catch Everything |
| Z | Advanced - Fun and Challenging |

### How Drill Assignment Works:
- **If a cell has a NUMBER**: That drill is in that workout at that sequence position
- **If a cell is EMPTY**: That drill is NOT in that workout
- **The NUMBER is the sequence order**: 1 = first, 2 = second, etc.

---

## 🔄 DATABASE MAPPING FOR THESE WORKOUTS

### For "Master Fundamentals" Workout:
```sql
INSERT INTO wall_ball_workout_system (
  workout_name,
  total_duration_minutes,
  full_workout_video_url,
  drill_sequence
) VALUES (
  'Master Fundamentals',  -- Exact name from column header
  15,  -- Estimated duration
  'https://vimeo.com/MASTER_FUND_VIDEO',  -- Single complete workout video
  '[
    {
      "drill_id": 1,
      "drill_name": "Overhand",
      "sequence_order": 1,
      "duration_seconds": 90
    },
    {
      "drill_id": 2,
      "drill_name": "Quick Sticks",
      "sequence_order": 2,
      "duration_seconds": 90
    },
    {
      "drill_id": 10,
      "drill_name": "Near Side Fake",
      "sequence_order": 3,
      "duration_seconds": 90
    },
    {
      "drill_id": 7,
      "drill_name": "Turned Left",
      "sequence_order": 8,
      "duration_seconds": 90
    },
    {
      "drill_id": 6,
      "drill_name": "Turned Right",
      "sequence_order": 9,
      "duration_seconds": 90
    },
    {
      "drill_id": 8,
      "drill_name": "Catch and Switch",
      "sequence_order": 10,
      "duration_seconds": 90
    }
  ]'::jsonb
);
```

### For "5 Minute Master Fundamentals" Workout:
```sql
INSERT INTO wall_ball_workout_system (
  workout_name,
  total_duration_minutes,
  full_workout_video_url,
  drill_sequence
) VALUES (
  '5 Minute Master Fundamentals',  -- Exact name from column header
  5,  -- Duration from name
  'https://vimeo.com/5MIN_MASTER_FUND_VIDEO',  -- Single complete workout video
  '[
    {
      "drill_id": 1,
      "drill_name": "Overhand",
      "sequence_order": 1,
      "duration_seconds": 60
    },
    {
      "drill_id": 2,
      "drill_name": "Quick Sticks",
      "sequence_order": 2,
      "duration_seconds": 60
    },
    {
      "drill_id": 6,
      "drill_name": "Turned Right",
      "sequence_order": 3,
      "duration_seconds": 60
    },
    {
      "drill_id": 7,
      "drill_name": "Turned Left",
      "sequence_order": 4,
      "duration_seconds": 60
    },
    {
      "drill_id": 8,
      "drill_name": "Catch and Switch",
      "sequence_order": 5,
      "duration_seconds": 60
    }
  ]'::jsonb
);
```

---

## ⚠️ IMPORTANT CLARIFICATIONS

### About "Master Fund" Question:
You asked where I was seeing "Master Fund" - I was incorrectly abbreviating the column header. The ACTUAL column headers are:
- **Column E**: "Master Fundamentals" (NOT "Master Fund")
- **Column F**: "10 Master Fund" (this one IS abbreviated in the CSV)
- **Column G**: "5 Minute Master Fundamentals" (full name)

### Key Points:
1. **Each workout is a SINGLE VIDEO** - The drill sequence just shows what's demonstrated in that video
2. **The numbers in cells are sequence positions** - Not drill IDs
3. **Empty cells mean that drill is NOT in that workout**
4. **Column headers are the exact workout names** - Use them as-is for database

---

## 📊 ALL WORKOUT NAMES FROM CSV

Here are ALL the workout names exactly as they appear in the column headers:

1. Master Fundamentals
2. 10 Master Fund
3. 5 Minute Master Fundamentals
4. Dodging
5. 10 Dodging
6. 5 Dodging
7. Conditioning
8. 10 Min Conditioning
9. 5 Min Conditioning
10. Faking and Inside Finishing
11. 10 Min Faking
12. 5 Minute Faking
13. Shooting
14. 10 Shooting
15. 5 Shooting
16. Defensive Emphasis
17. 10 Defense
18. 5 Defense
19. Catch Everything
20. 10 Catch Everything
21. 5 Catch Everything
22. Advanced - Fun and Challenging

Each of these is a complete workout video that demonstrates various drills in sequence.