import json
import os

# Read the JSON file
with open('/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/docs/existing/json Academy Workouts./ldqie_export_1754547992.json', 'r') as f:
    data = json.load(f)

# Create markdown content
md_content = '''# POWLAX Academy Workouts JSON Structure Mapping Guide

## Overview
This document explains the JSON structure from LearnDash quiz exports and how to map them to POWLAX database tables.

## JSON File Information
- **Version**: ''' + str(data.get('version')) + '''
- **Export Version**: ''' + str(data.get('exportVersion')) + '''
- **LearnDash Version**: ''' + str(data.get('ld_version')) + '''
- **Export Date**: ''' + str(data.get('date')) + '''

## Main Data Sections

### 1. Master Table (Workouts/Quizzes)
This represents the main workout/quiz entities.

'''

# Get sample master data
if data.get('master'):
    master_sample = data['master'][0]
    
    md_content += '''| Field Name | Data Type | Example Value | Description | Suggested DB Column |
|------------|-----------|---------------|-------------|-------------------|
| _id | integer | ''' + str(master_sample.get('_id')) + ''' | Unique identifier | id (PRIMARY KEY) |
| _name | string | ''' + str(master_sample.get('_name')) + ''' | Workout name | name |
| _quiz_post_id | integer | ''' + str(master_sample.get('_quiz_post_id')) + ''' | WordPress post ID | wp_post_id |
| _titleHidden | boolean | ''' + str(master_sample.get('_titleHidden')) + ''' | Hide title flag | show_title |
| _questionRandom | boolean | ''' + str(master_sample.get('_questionRandom')) + ''' | Randomize questions | randomize_questions |
| _answerRandom | boolean | ''' + str(master_sample.get('_answerRandom')) + ''' | Randomize answers | randomize_answers |
| _timeLimit | integer | ''' + str(master_sample.get('_timeLimit')) + ''' | Time limit in seconds | time_limit |
| _statisticsOn | boolean | ''' + str(master_sample.get('_statisticsOn')) + ''' | Track statistics | track_stats |
| _showPoints | boolean | ''' + str(master_sample.get('_showPoints')) + ''' | Show points to user | show_points |
| _quizRunOnce | boolean | ''' + str(master_sample.get('_quizRunOnce')) + ''' | Allow only one attempt | single_attempt |
| _autostart | boolean | ''' + str(master_sample.get('_autostart')) + ''' | Auto-start workout | auto_start |
| _questionsPerPage | integer | ''' + str(master_sample.get('_questionsPerPage')) + ''' | Questions per page | questions_per_page |
| _showCategory | boolean | ''' + str(master_sample.get('_showCategory')) + ''' | Show category | show_category |

### All Master Records (Workouts) in this file:
'''
    
    # List all master records
    md_content += '''
| ID | Workout Name |
|----|--------------|
'''
    for master in data.get('master', []):
        md_content += '| ' + str(master.get('_id')) + ' | ' + str(master.get('_name')) + ' |\n'

# Get question structure
md_content += '''

### 2. Questions Table
Questions are stored in a nested dictionary structure: question[quiz_id][question_id]

'''

questions = data.get('question', {})
question_sample = None

if questions:
    # Navigate the nested structure
    for quiz_id, quiz_questions in questions.items():
        if isinstance(quiz_questions, dict) and quiz_questions:
            # Get first question from this quiz
            first_question_id = list(quiz_questions.keys())[0]
            question_sample = quiz_questions[first_question_id]
            break
    
    if question_sample:
        md_content += '''| Field Name | Data Type | Example Value | Description | Suggested DB Column |
|------------|-----------|---------------|-------------|-------------------|
| _id | integer | ''' + str(question_sample.get('_id', '')) + ''' | Question ID | id (PRIMARY KEY) |
| _quizId | integer | ''' + str(question_sample.get('_quizId', '')) + ''' | Parent quiz/workout ID | workout_id (FOREIGN KEY) |
| _sort | integer | ''' + str(question_sample.get('_sort', '')) + ''' | Sort order | sort_order |
| _title | string | ''' + (question_sample.get('_title', '')[:50] + '...' if question_sample.get('_title') else 'null') + ''' | Question title | title |
| _points | integer | ''' + str(question_sample.get('_points', '')) + ''' | Points value | points |
| _question | html/text | (HTML content) | Question content | question_text |
| _correctMsg | text | ''' + (str(question_sample.get('_correctMsg', ''))[:30] + '...' if question_sample.get('_correctMsg') else 'null') + ''' | Correct answer message | correct_message |
| _incorrectMsg | text | ''' + (str(question_sample.get('_incorrectMsg', ''))[:30] + '...' if question_sample.get('_incorrectMsg') else 'null') + ''' | Incorrect answer message | incorrect_message |
| _answerType | string | ''' + str(question_sample.get('_answerType', '')) + ''' | Answer type | answer_type |
| _correctSame | boolean | ''' + str(question_sample.get('_correctSame', '')) + ''' | Same correct message | use_same_correct_msg |
| _tipEnabled | boolean | ''' + str(question_sample.get('_tipEnabled', '')) + ''' | Show tips | show_tips |
| _tipMsg | text | ''' + (str(question_sample.get('_tipMsg', ''))[:30] + '...' if question_sample.get('_tipMsg') else 'null') + ''' | Tip message | tip_message |
| _answerPointsActivated | boolean | ''' + str(question_sample.get('_answerPointsActivated', '')) + ''' | Use answer points | use_answer_points |
| _showPointsInBox | boolean | ''' + str(question_sample.get('_showPointsInBox', '')) + ''' | Show points in box | show_points_in_box |
| _answerData | array | (see below) | Answer options | (separate table) |
| _category | string | ''' + str(question_sample.get('_category', '')) + ''' | Category | category |

'''

# Show question counts per workout
md_content += '''### Question Distribution by Workout:

| Workout ID | Workout Name | Number of Questions |
|------------|--------------|-------------------|
'''
for master in data.get('master', []):
    quiz_id = str(master.get('_id'))
    quiz_questions = questions.get(quiz_id, {})
    question_count = len(quiz_questions) if isinstance(quiz_questions, dict) else 0
    md_content += '| ' + quiz_id + ' | ' + master.get('_name', '') + ' | ' + str(question_count) + ' |\n'

# Show answer data structure
if question_sample and question_sample.get('_answerData'):
    md_content += '''

### 3. Answers Table
Each question can have multiple answer options.

| Field Name | Data Type | Example Value | Description | Suggested DB Column |
|------------|-----------|---------------|-------------|-------------------|
| question_id | integer | (from parent) | Parent question ID | question_id (FOREIGN KEY) |
| _pos | integer | ''' + str(question_sample['_answerData'][0].get('_pos', '') if question_sample['_answerData'] else '') + ''' | Position/order | position |
| _answer | text | (answer text) | Answer content | answer_text |
| _html | boolean | ''' + str(question_sample['_answerData'][0].get('_html', '') if question_sample['_answerData'] else '') + ''' | HTML content flag | is_html |
| _points | integer | ''' + str(question_sample['_answerData'][0].get('_points', '') if question_sample['_answerData'] else '') + ''' | Points for this answer | points |
| _correct | boolean | ''' + str(question_sample['_answerData'][0].get('_correct', '') if question_sample['_answerData'] else '') + ''' | Correct answer flag | is_correct |
| _sortString | string | ''' + str(question_sample['_answerData'][0].get('_sortString', '') if question_sample['_answerData'] else '') + ''' | Sort string | sort_string |
| _sortStringHtml | boolean | ''' + str(question_sample['_answerData'][0].get('_sortStringHtml', '') if question_sample['_answerData'] else '') + ''' | Sort string HTML flag | sort_string_html |
| _graded | boolean | ''' + str(question_sample['_answerData'][0].get('_graded', '') if question_sample['_answerData'] else '') + ''' | Graded flag | is_graded |
'''

# Add sample question content
if question_sample:
    md_content += '''

## Sample Question Content

Here's an actual question from the data to show the content structure:

**Question ID:** ''' + str(question_sample.get('_id', '')) + '''
**Quiz/Workout ID:** ''' + str(question_sample.get('_quizId', '')) + '''
**Title:** ''' + str(question_sample.get('_title', 'No title'))[:200] + '''
**Question HTML (first 500 chars):**
```html
''' + str(question_sample.get('_question', ''))[:500] + '''...
```

'''
    
    if question_sample.get('_answerData'):
        md_content += '''**Answer Options:**
'''
        for i, answer in enumerate(question_sample.get('_answerData', [])[:3]):
            md_content += f'''
Answer {i+1}:
- Text: {str(answer.get('_answer', ''))[:100]}...
- Correct: {answer.get('_correct', False)}
- Points: {answer.get('_points', 0)}
'''

# Add database schema recommendation
md_content += '''

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

'''

# Calculate statistics
total_workouts = len(data.get('master', []))
total_questions = sum(len(quiz_q) for quiz_q in questions.values() if isinstance(quiz_q, dict))
total_files = 11  # As seen in the directory listing

md_content += f'''- Total JSON files to process: {total_files}
- Workouts in this file: {total_workouts}
- Questions in this file: {total_questions}
- Average questions per workout: {total_questions/total_workouts:.1f} if total_workouts > 0 else 0

## Next Steps

1. Review this mapping document
2. Confirm the database column names match your Supabase schema
3. Create an import script that processes all 11 JSON files
4. Handle HTML content properly (many fields contain embedded HTML)
5. Maintain referential integrity between tables

'''

# Write the file
output_path = '/Users/patrickchapla/Development/POWLAX React App/React Code/powlax-react-app/docs/data/ACADEMY_WORKOUTS_JSON_MAPPING.md'
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, 'w') as f:
    f.write(md_content)

print('Mapping document created at:', output_path)
print('Total workouts found:', total_workouts)
print('Total questions found:', total_questions)