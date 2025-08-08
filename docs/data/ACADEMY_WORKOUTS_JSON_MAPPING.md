# POWLAX Academy Workouts JSON Structure Mapping Guide

## Overview
This document explains the JSON structure from LearnDash quiz exports and how to map them to POWLAX database tables.

## JSON File Information
- **Version**: 0.29
- **Export Version**: 4
- **LearnDash Version**: 4.23.2.1
- **Export Date**: 1754547992

## Main Data Sections

### 1. Master Table (Workouts/Quizzes)
This represents the main workout/quiz entities.

| Field Name | Data Type | Example Value | Description | Suggested DB Column |
|------------|-----------|---------------|-------------|-------------------|
| _id | integer | 312 | Unique identifier | id (PRIMARY KEY) |
| _name | string | Solid Start 5 - Switching Hands Workout - More | Workout name | name | [THIS IS THE NAME OF THE WORKOUT - [Solid Start 5 - Switching Hands Workout] The number corresponds to the number in that series, these are Solid Start Workouts, this is the 5th, there is a Mini (5 drill workout), More(10 drill workout), There is no Complete in this, but there will be in others. (13-19 drill workout)
| _quiz_post_id | integer | 0 | WordPress post ID | wp_post_id |
| _titleHidden | boolean | True | Hide title flag | show_title |
| _questionRandom | boolean | False | Randomize questions | randomize_questions |
| _answerRandom | boolean | False | Randomize answers | randomize_answers |
| _timeLimit | integer | 0 | Time limit in seconds | time_limit |
| _statisticsOn | boolean | True | Track statistics | track_stats |
| _showPoints | boolean | False | Show points to user | show_points |
| _quizRunOnce | boolean | False | Allow only one attempt | single_attempt |
| _autostart | boolean | False | Auto-start workout | auto_start |
| _questionsPerPage | integer | 0 | Questions per page | questions_per_page |
| _showCategory | boolean | False | Show category | show_category |

### All Master Records (Workouts) in this file:

| ID | Workout Name |
|----|--------------|
| 312 | Solid Start 5 - Switching Hands Workout - More | 
| 311 | Solid Start 5 - Switching Hands Workout - Mini |
| 310 | Solid Start 4 - Wind Up Dodging Workout - More |
| 309 | Solid Start 4 - Wind Up Dodging Workout - Mini |
| 308 | Solid Start 3 - Catching and Hesitation Workout - More |
| 307 | Solid Start 3 - Catching and Hesitation Workout - Mini |
| 306 | Solid Start 2 - Defense and Shooting Workout - More |
| 305 | Solid Start 2 - Defense and Shooting Workout - Mini |


### 2. Questions Table
Questions are stored in a nested dictionary structure: question[quiz_id][question_id]

| Field Name | Data Type | Example Value | Description | Suggested DB Column |
|------------|-----------|---------------|-------------|-------------------|
| _id | integer | 2261 | Question ID | id (PRIMARY KEY) |
| _quizId | integer | 312 | Parent quiz/workout ID | workout_id (FOREIGN KEY) |
| _sort | integer | 12 | Sort order | sort_order |
| _title | string | Shoulder to Nose Cradle... | Question title | title | - !IMPORTANT THIS VALUE WILL MAP TO THE `title` column in the skills_academy-drills table - which will create the mapping of the drills to these workots,
| _points | integer | 1 | Points value | points |
| _question | html/text | (HTML content) | Question content | question_text |
| _correctMsg | text | <p>Keep the Heat Coming!</p>... | Correct answer message | correct_message |
| _incorrectMsg | text | <p>Keep the Heat Coming!</p>... | Incorrect answer message | incorrect_message |
| _answerType | string | single | Answer type | answer_type |
| _correctSame | boolean |  | Same correct message | use_same_correct_msg |
| _tipEnabled | boolean | False | Show tips | show_tips |
| _tipMsg | text | null | Tip message | tip_message |
| _answerPointsActivated | boolean | False | Use answer points | use_answer_points |
| _showPointsInBox | boolean | False | Show points in box | show_points_in_box |
| _answerData | array | (see below) | Answer options | (separate table) |
| _category | string |  | Category | category |

### Question Distribution by Workout:

| Workout ID | Workout Name | Number of Questions |
|------------|--------------|-------------------|
| 312 | Solid Start 5 - Switching Hands Workout - More | 10 |
| 311 | Solid Start 5 - Switching Hands Workout - Mini | 5 |
| 310 | Solid Start 4 - Wind Up Dodging Workout - More | 10 |
| 309 | Solid Start 4 - Wind Up Dodging Workout - Mini | 5 |
| 308 | Solid Start 3 - Catching and Hesitation Workout - More | 10 |
| 307 | Solid Start 3 - Catching and Hesitation Workout - Mini | 5 |
| 306 | Solid Start 2 - Defense and Shooting Workout - More | 10 |
| 305 | Solid Start 2 - Defense and Shooting Workout - Mini | 5 |


### 3. Answers Table
Each question can have multiple answer options.

| Field Name | Data Type | Example Value | Description | Suggested DB Column |
|------------|-----------|---------------|-------------|-------------------|
| question_id | integer | (from parent) | Parent question ID | question_id (FOREIGN KEY) |
| _pos | integer |  | Position/order | position |
| _answer | text | (answer text) | Answer content | answer_text |
| _html | boolean | False | HTML content flag | is_html |
| _points | integer | 1 | Points for this answer | points |
| _correct | boolean | True | Correct answer flag | is_correct |
| _sortString | string |  | Sort string | sort_string |
| _sortStringHtml | boolean | False | Sort string HTML flag | sort_string_html |
| _graded | boolean | False | Graded flag | is_graded |


## Sample Question Content

Here's an actual question from the data to show the content structure:

**Question ID:** 2261
**Quiz/Workout ID:** 312
**Title:** Shoulder to Nose Cradle
**Question HTML (first 500 chars):**
```html
Shoulder to Nose Cradle

<iframe src="https://player.vimeo.com/video/1000143366" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>...
```

**Answer Options:**

Answer 1:
- Text: Boom! Nailed It!...
- Correct: True
- Points: 1

Answer 2:
- Text: I’m skipping that episode....
- Correct: False
- Points: 0


## Recommended Database Schema

### Table: skills_academy_workouts
```sql
CREATE TABLE skills_academy_workouts (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,  -- Maps to _id from JSON
    name VARCHAR(255) NOT NULL,
    wp_post_id INTEGER,
    show_title BOOLEAN DEFAULT true,
    randomize_questions BOOLEAN DEFAULT false,
    randomize_answers BOOLEAN DEFAULT false,
    time_limit INTEGER DEFAULT 0,
    track_stats BOOLEAN DEFAULT true,
    show_points BOOLEAN DEFAULT false,
    single_attempt BOOLEAN DEFAULT false,
    auto_start BOOLEAN DEFAULT false,
    questions_per_page INTEGER DEFAULT 0,
    show_category BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: skills_academy_questions
```sql
CREATE TABLE skills_academy_questions (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,  -- Maps to _id from JSON
    workout_id INTEGER REFERENCES skills_academy_workouts(id),
    sort_order INTEGER,
    title VARCHAR(500),
    question_text TEXT,
    points INTEGER DEFAULT 0,
    correct_message TEXT,
    incorrect_message TEXT,
    answer_type VARCHAR(50),
    use_same_correct_msg BOOLEAN DEFAULT true,
    show_tips BOOLEAN DEFAULT false,
    tip_message TEXT,
    use_answer_points BOOLEAN DEFAULT false,
    show_points_in_box BOOLEAN DEFAULT false,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: skills_academy_answers
```sql
CREATE TABLE skills_academy_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES skills_academy_questions(id),
    position INTEGER,
    answer_text TEXT,
    is_html BOOLEAN DEFAULT false,
    points INTEGER DEFAULT 0,
    is_correct BOOLEAN DEFAULT false,
    sort_string VARCHAR(255),
    sort_string_html BOOLEAN DEFAULT false,
    is_graded BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Import Process Notes

1. **Import Order**: 
   - First import workouts (master records)
   - Then import questions (linked by workout_id)
   - Finally import answers (linked by question_id)

2. **ID Mapping**: Keep original IDs in separate columns for reference

3. **HTML Content**: Many fields contain HTML that needs to be preserved

4. **Nested Structure**: Questions are stored as question[quiz_id][question_id]

5. **Answer Types**: Check _answerType field to understand question format

## Data Statistics

- Total JSON files to process: 11
- Workouts in this file: 8
- Questions in this file: 60
- Average questions per workout: 7.5 if total_workouts > 0 else 0

## Next Steps

1. Review this mapping document
2. Confirm the database column names match your Supabase schema
3. Create an import script that processes all 11 JSON files
4. Handle HTML content properly (many fields contain embedded HTML)
5. Maintain referential integrity between tables

