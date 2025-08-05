# POWLAX Data Sources Analysis

This document provides a comprehensive overview of the data sources used for the POWLAX Lacrosse Lab and Skills Academy integration, showing representative samples from each CSV with detailed context about their structure and purpose.

## 1. Video Sheet with Vimeo References (Strategies & Concepts)

### Source: `/docs/Wordpress CSV's/Strategies and Concepts to LL/Sheet 1-Video Sheet with Vimeo References for Supabase Upload 2.csv`

### Purpose
This is the master reference sheet containing all strategy and concept videos with unique IDs. These IDs are what we're mapping to the Lacrosse Lab URLs.

### CSV Structure (Headers)
```csv
name,type,Id,Content
```

### Representative Data Samples (10 rows we're actually using)

| name | type | Id | Content |
|------|------|-----|---------|
| 1-4-1 Offense vs Zone Defense | offense | 1 | We discuss the reasons why the 1-4-1 Offense is a great option to attack a zone defense with. |
| 1-4-1 Double Mumbo to Weave Set Play | offense;set-plays | 3 | The lacrosse strategy involves executing the 141 double Mumbo that everyone loves but adds a weave motion over the top... |
| 1-4-1 Wing Pairs Offense | offense | 6 | 1-4-1 Wing Pairs Offense. The first of 3 parts of the Penn State Offense |
| 2 Man Game - Ball Carrier Options | offense | 8 | 2 Man Games are all about decision making. In this video we discuss the decision making options from a ball carrier perspective. |
| 3 High Pairs Offense | offense | 15 | Penn State's 3 High Pairs Offense |
| 4 Man Rotation | defense;man-down | 20 | Offenses with a dangerous inside finisher can be deadly…Especially man down. The 4 Man Rotation is a Man Down Defensive Strategy... |
| 7v7 Up Pick Nations | offense;set-plays | 27 | Another great box play/concept to use in your 7v7 and 10v10 offenses. |
| Adjacent Slide Basics | defense | 30 | An introduction to the concepts of man to man defense and the basic philosophy of an adjacent slide defense. |
| Cuse Motion Offense | offense;motion-offense | 52 | An overview of the Cuse Motion Offense! |
| 2 Man Game | offense; 2-man-game | 67 | This is an in-depth hour and 50 minute video going over all of the ways to execute and defend two men games... |

### Column Explanations
- **name**: The display name of the strategy/concept
- **type**: Categories separated by semicolons (offense, defense, man-up, etc.)
- **Id**: Unique identifier for Supabase (this is what we're mapping)
- **Content**: Description of the strategy/concept

---

## 2. POWLAX Lacrosse Lab URLs - Strategies and Concepts

### Source: `/docs/Wordpress CSV's/Strategies and Concepts to LL/Sheet 1-1-1-POWLAX Lacrosse Lab URLS - Strategies and Concepts.csv`

### Purpose
Contains all the Lacrosse Lab diagram URLs that need to be linked to the video content. The challenge is matching these entries to the correct video IDs.

### CSV Structure (Headers)
```csv
folderPath,name,Id,description
```

### Representative Data Samples (10 rows showing variety)

| folderPath | name | Id | description |
|------------|------|-----|-------------|
| Offense/How to Beat a Zone/1-4-1 Carry Step Off Offense/ | 1-4-1 Picks Inside | 1 | This is a play in the 1-4–1 carry step off offense. |
| Offense/21-12 Motion Offense/1-4-1 Shifted Triangles Offense/ | 1-4-1 Base | 4 | This is the base for the 21-12 - 1-4-1 shifted triangles offense... |
| Offense/Penn State Offense/1-4-1 Wing Pairs/Off Ball/ | PSO - 14 - Backside Cut and Separate | | The 3 variations of the Penn State Offense use a Man Game and Off Ball Movement... |
| Man Up & Man Down /Man Up/Quick Hitters/ | 2-2-2 Quick | | 2-2-2 Quick is Quick passing + off-ball seal + timed cut = Lots of goals. |
| Defense/RIT House and 1 Zone/ | RIT House and 1 Zone Idea | | RIT's House and 1 Zone combines a House Man Down Defense with a single crease player inside. |
| Offense/Set Plays/ | 1-4-1 Double Mumbo | | This play is designed to give your best shooters a step-down shot from 8-10 yards |
| Transition/Transition Offense/6v6)/Slow Break (6v5/ | UNC's 3 Man Slow Break - X Cut | | |
| Defense/Man to Man/Slides/ | Adjacent Slide Basics | | |
| Offense/2 Man Game/Pick/ | 2 Man Game - Pick | | |
| Offense/Motion Offense/Cuse Motion/ | Cuse Motion - Alley Throw Forward | | |

### Column Explanations
- **folderPath**: Hierarchical location in Lacrosse Lab (helps identify category/type)
- **name**: The specific play/concept name in Lacrosse Lab
- **Id**: Currently empty in source data - this is what we're populating
- **description**: Detailed explanation of the play/concept

### Matching Logic
The folderPath provides context clues:
- `Offense/` → matches to offense type
- `Defense/` → matches to defense type
- `Man Up & Man Down/` → matches to man-up/man-down types
- Team names (Penn State, Duke, Virginia) help identify specific plays

---

## 3. Skills Academy Data

### Source: `/docs/Wordpress CSV's/2015 POWLAX Plan CSV's Skills Drills/`

These are separate from strategies/concepts and focus on individual skill development.

### A. Online Skills Academy Drills

#### Source: `Online Skills Academy Drills-POWLAX Online Skills Academy Drills and I Frames.csv`

#### CSV Structure (Key Headers)
```csv
Category,Name,VIMEO URL,Location or Setup,Balls,Goal Needed,Attack[1-12],Midfield[1-12],Defense[1-12]
```

#### Representative Data Samples

| Category | Name | VIMEO URL | Location or Setup | Attack Relevance | Midfield Relevance | Defense Relevance |
|----------|------|-----------|-------------------|------------------|--------------------|--------------------|
| Catching Drills | Cross Body Catch and Pause Drill | https://vimeo.com/1005106024 | Bounce Back or Partner | F | F | F |
| Shooting Drills | Time and Room Shooting | https://vimeo.com/[id] | Goal | F | F | S |
| Dodging Drills | Split Dodge Progression | https://vimeo.com/[id] | Cones | F | F | B |
| Defensive Drills | Approach and Recovery | https://vimeo.com/[id] | Partner | S | F | F |
| Ground Ball Drills | Competitive Ground Balls | https://vimeo.com/[id] | Open Space | F | F | F |
| Wall Ball | Basic Wall Ball Routine | https://vimeo.com/[id] | Wall | F | F | F |
| Footwork | Ladder Drills | https://vimeo.com/[id] | Speed Ladder | S | F | F |
| Passing Drills | Quick Stick Passing | https://vimeo.com/[id] | Partner | F | F | S |
| Face-Off | Face-Off Technique | https://vimeo.com/[id] | X | N/A | X | N/A |
| Stick Protection | Cradling Through Pressure | https://vimeo.com/[id] | Cones | F | F | B |

#### Column Key
- **F** = Foundational (essential for position)
- **S** = Supplementary (useful but not core)
- **B** = Basic (should know but use sparingly)
- **N/A** = Not applicable to position
- **X** = Advanced (optional/fun)

### B. Wall Ball Workouts

#### Source: `Wall Ball Workouts and URL's-POWLAX Wall Ball Workouts and Vimeo URL's.csv`

This contains structured wall ball workout progressions with specific drills and durations.

---

## Data Integration Strategy

### 1. **Strategies & Concepts Integration**
- Video Sheet provides the master IDs (1-186)
- Lacrosse Lab URLs need these IDs mapped based on:
  - Name matching (exact or fuzzy)
  - Type/category alignment
  - Content/description correlation
  - Folder path context

### 2. **Skills Academy Integration** (Separate System)
- Individual skill drills with position-specific relevance
- Vimeo URLs for each drill
- Practice plan integration based on:
  - Position (Attack, Midfield, Defense)
  - Skill level (Beginner → Advanced)
  - Equipment requirements
  - Location/setup needs

### 3. **Key Differences**
- **Strategies/Concepts**: Team-level plays and systems
- **Skills Academy**: Individual player development
- Different ID systems (numeric for strategies, Vimeo URLs for skills)
- Different categorization methods

### 4. **Mapping Challenges**
- Name variations (e.g., "14" vs "1-4-1", "PSO" vs "Penn State Offense")
- Multiple entries for similar concepts
- Some Lacrosse Lab entries have no clear video match
- Need to preserve exact names while maintaining accurate linkages

This structure allows for:
- Flexible practice plan creation combining team strategies and individual skills
- Position-specific training recommendations
- Progressive skill development paths
- Equipment and space planning for practices