# V3 Supabase Schema - Complete Table Reference

## Overview
This is the complete reference for the POWLAX V3 Supabase schema, including all table structures with field definitions and example data.

## Table Structure with Field Details

### SECTION 1: CORE CONTENT TABLES

#### 1. drills - Team practice drills with skill/concept associations
```
id | drill_id | name | description | category | subcategory | duration_min | skill_focus | intensity_level | min_players | max_players | equipment_needed | drill_video_url | drill_lab_url_1 | drill_lab_url_2 | drill_lab_url_3 | drill_lab_url_4 | drill_lab_url_5 | notes | setup_requirements | age_adaptations | scoring_system | progressions | coach_instructions | wp_post_id | created_at | do_it | coach_it | own_it | skill_ids | concept_ids | game_phase_ids | applicable_situations | communication_focus | movement_principle_ids

LEAVE EMPTY | D001 | 2v1 Ground Ball Battle | Full description here | Ground Balls | Competitive | 5 | Ground ball technique | High | 3 | 6 | {balls,cones} | https://vimeo.com/123 | https://url1.com | https://url2.com | OPTIONAL | OPTIONAL | OPTIONAL | OPTIONAL notes | {"field_size": "20x20"} | {"8U": "smaller area"} | {"type": "points"} | {"level1": "easy"} | Keep instructions brief | 12345 | 2024-01-15T10:30:00Z | 6-10 | 8-12 | 10-14 | {1,2,3} | {4,5} | {GP001,GP002} | {1,2} | {"primary": "ball down"} | {MP001,MP002}
```

#### 2. academy_drills - Individual skill development drills for Skills Academy
```
id | drill_id | workout_category | primary_skill_ids | meta_skill_ids | skill_mastery_focus | understanding_check_type | understanding_check_questions | drill_flow | progressions_by_age | scoring_criteria | bonus_challenge | created_at

LEAVE EMPTY | AD001 | Ground Balls | {1,2,3} | {10,11} | Body positioning | quiz | [{"question": "What matters most?", "answer": "Low hips"}] | {"warmup": 2, "instruction": 3} | {"8U": "focus on fun"} | {"technique": 40, "success": 60} | Win 5 in a row | 2024-01-15T10:30:00Z
```

#### 3. strategies - Game strategies linked to phases and concepts
```
id | strategy_id | name | type | category | game_phase_ids | key_concepts | execution_steps | diagram_url | video_url | when_to_use | advantages | disadvantages | counter_strategies | common_mistakes | variation_options | practice_requirements | communication_calls | created_at

LEAVE EMPTY | S001 | 2-3-1 Motion Offense | Offensive | Motion | {GP003,GP004} | {spacing,ball_movement} | ["Step 1", "Step 2"] | https://diagram.com | https://video.com | Against zone defense | {"creates_space": true} | {"energy_intensive": true} | {pack_it_in,doubles} | {standing_still} | {"inverted": "description"} | {"min_players": 7} | {"motion": "call motion"} | 2024-01-15T10:30:00Z
```

#### 4. concepts - Teaching concepts with age-based progression
```
id | concept_id | name | description | concept_type | related_skill_ids | teaching_progression | visual_aids | key_phrases | common_misconceptions | assessment_criteria | created_at

LEAVE EMPTY | C001 | Triple Threat | Offensive stance for 3 options | Fundamental | {1,5,8} | ["Athletic stance", "Hands apart"] | ["diagram.png", "video.mp4"] | {"coach": "hands apart"} | ["hands too close"] | {"can_identify": "names options"} | 2024-01-15T10:30:00Z
```

### SECTION 2: TAXONOMY FOUNDATION TABLES

#### 5. lacrosse_terms - Universal lacrosse terminology dictionary
```
id | term_id | term | definition | category | related_terms | see_also | usage_notes | created_at

LEAVE EMPTY | T001 | Crease | Circular area around goal | Field Areas | {goal,goalie} | {goalie_rules} | 18-foot diameter | 2024-01-15T10:30:00Z
```

#### 6. game_phases - Game phase definitions (settled offense, transition, etc.)
```
id | phase_id | phase_name | category | description | parent_phase_id | common_situations | key_objectives | typical_duration | transition_triggers | success_metrics | created_at

LEAVE EMPTY | GP001 | Settled Offense | Offensive | 6v6 in offensive half | OPTIONAL | {man_up,motion} | {score,possess} | 30-60 seconds | {shot,turnover} | {shooting_pct} | 2024-01-15T10:30:00Z
```

#### 7. skills - Complete skill taxonomy with meta-skill support
```
id | skill_id | skill_name | skill_type | base_description | is_meta_skill | parent_skill_id | child_skill_ids | primary_components | prerequisite_skills | related_skills | movement_pattern | created_at

LEAVE EMPTY | SK001 | Scooping | Fundamental | Picking up ground ball | false | OPTIONAL | {SK002,SK003} | {bend_knees,low_hips} | {} | {SK004,SK005} | linear_forward | 2024-01-15T10:30:00Z
LEAVE EMPTY | SK010 | Ball Control | Meta | Overall possession ability | true | OPTIONAL | {SK001,SK004} | {awareness,hands} | OPTIONAL | {SK020,SK021} | dynamic | 2024-01-15T10:30:00Z
```

#### 8. player_situations - Player situation categories (1-5)
```
id | situation_id | situation_name | category | base_description | field_context | typical_phases | is_meta_situation | child_situations | decision_tree | created_at

LEAVE EMPTY | PS001 | Ball Carrier | Offensive | Player with ball | Anywhere | {settled,transition} | false | {dodge,pass,shoot} | {"primary": "evaluate"} | 2024-01-15T10:30:00Z
```

#### 9. communication_terms - On-field communication terminology
```
id | term_id | term | urgency_level | typical_phase | term_type | definition | usage_context | response_required | created_at

LEAVE EMPTY | CT001 | Ball Down | High | Unsettled | Alert | Ground ball loose | Any loose ball | true | 2024-01-15T10:30:00Z
```

#### 10. movement_principles - Biomechanical movement patterns
```
id | principle_id | principle_name | category | description | biomechanics | application_examples | common_errors | coaching_cues | created_at

LEAVE EMPTY | MP001 | Athletic Stance | Foundation | Base position for movement | {"knees_bent": "45_degrees"} | {"defending": "stay low"} | {standing_upright} | {bend_knees,chest_up} | 2024-01-15T10:30:00Z
```

#### 11. term_variations - Context-specific term variations
```
id | variation_id | base_term_id | game_phase_id | contextual_meaning | usage_example | urgency_level | communication_type | typical_sequence | created_at

LEAVE EMPTY | TV001 | T001 | GP001 | Clear crease for shot | Yell 'Clear!' when driving | Medium | Verbal | {clear,drive,shoot} | 2024-01-15T10:30:00Z
```

### SECTION 3: RELATIONSHIP & MAPPING TABLES

#### 12. skill_phase_applications - How skills apply in different game phases
```
id | cross_ref_id | skill_id | game_phase_id | phase_specific_technique | key_differences | emphasis_points | common_mistakes | drill_variations | created_at

LEAVE EMPTY | SCR001 | SK001 | GP001 | Quick scoop under pressure | Less time, more pressure | {protect_stick,quick_feet} | {taking_too_long} | {add_defender,time_limit} | 2024-01-15T10:30:00Z
```

#### 13. skill_development_stages - Age-based skill progression (do it/coach it/own it)
```
id | progression_id | skill_id | age_band_id | do_it_focus | coach_it_focus | own_it_focus | success_criteria | common_errors | progression_triggers | created_at

LEAVE EMPTY | SDS001 | SK001 | AB001 | Basic technique | Form and consistency | When to use | {"success_rate": 80} | {bending_at_waist} | {consistent_success} | 2024-01-15T10:30:00Z
```

#### 14. phase_situation_scenarios - Common scenarios by phase and situation
```
id | integration_id | game_phase_id | primary_situation_ids | secondary_situation_ids | scenario_name | scenario_description | situation_distribution | key_decisions | success_metrics | coaching_points | recommended_drill_ids | created_at

LEAVE EMPTY | PSI001 | GP001 | {PS001,PS002} | {PS003} | 2v1 Break | Fast break advantage | {"carrier": 0.5, "support": 0.5} | {when_to_pass} | {conversion_rate} | {timing,communication} | {D001,D002} | 2024-01-15T10:30:00Z
```

#### 15. skill_progression_pathways - Logical skill learning sequences
```
id | pathway_name | base_skill_id | skill_sequence | age_band_progressions | situation_applications | phase_applications | decision_points | created_at

LEAVE EMPTY | Inside Finishing | SK020 | {SK020,SK021,SK022} | {"8U": ["SK020"], "10U": ["SK020","SK021"]} | {PS001,PS004} | {GP001,GP002} | {"can_finish": "advance"} | 2024-01-15T10:30:00Z
```

#### 16. situation_skill_options - Available skills for specific situations
```
id | player_situation_id | game_phase_id | field_location | context_description | applicable_skill_ids | skill_categories | decision_factors | created_at

LEAVE EMPTY | PS001 | GP001 | X Behind Goal | Ball carrier at X | {SK030,SK031,SK032} | {"dodges": [30,31]} | {defender_position} | 2024-01-15T10:30:00Z
```

### SECTION 4: USER & TEAM MANAGEMENT TABLES

#### 17. user_profiles - Extended user data beyond Supabase Auth
```
id | email | full_name | avatar_url | role | age_group | is_child | birth_date | can_use_forums | can_message | wp_user_id | created_at

UUID or EMPTY | coach@email.com | John Smith | https://avatar.jpg | coach | EMPTY for adults | false | 1985-03-15 | true | true | 12345 | 2024-01-15T10:30:00Z
LEAVE EMPTY | OPTIONAL for kids | Tommy Jones | OPTIONAL | player | 10U | true | 2014-06-20 | false | false | OPTIONAL | 2024-01-15T10:30:00Z
```

#### 18. teams - Team management and roster information
```
id | team_name | organization_id | age_band_id | season | head_coach_id | assistant_coach_ids | roster_size | practice_schedule | home_field | team_color | logo_url | created_at

LEAVE EMPTY | Lightning 10U Blue | ORG001 | AB002 | Spring 2024 | UUID-HERE | {UUID1,UUID2} | 18 | {"tuesday": "6pm"} | Main Field | Blue | https://logo.png | 2024-01-15T10:30:00Z
```

#### 19. practice_plans - Practice planning with drill sequences
```
id | coach_id | team_id | practice_date | duration_min | theme | objectives | drill_ids | drill_durations | drill_notes | equipment_list | notes | is_template | template_name | created_at

LEAVE EMPTY | UUID-COACH | TEAM001 | 2024-02-15T18:00:00Z | 90 | Ground Balls | {improve_gb,transitions} | {D001,D002,D003} | {15,20,25} | {focus_exits,communicate} | {balls:30,cones:20} | Hydrate often | false | EMPTY unless template | 2024-01-15T10:30:00Z
```

#### 20. workouts - Skill Academy workout sequences
```
id | workout_id | name | description | category | skill_focus_ids | meta_skill_focus_ids | drill_sequence | total_duration | difficulty_level | age_bands | prerequisites | bonus_challenges | understanding_checks | created_at

LEAVE EMPTY | W001 | Ground Ball Mastery | Full GB workout | Ground Balls | {SK001,SK002} | {SK010} | {AD001,AD002} | 30 | Intermediate | {10U,12U} | {"can_scoop": true} | {"win_10": 50} | {"quiz_each": true} | 2024-01-15T10:30:00Z
```

#### 21. age_bands - Age group definitions (8U, 10U, 12U, etc.)
```
id | name | min_age | max_age | description | skill_focus | tactical_focus | created_at

AB001 | 8U | 6 | 8 | Intro fundamentals | {"primary": "basics"} | {"concepts": "spacing"} | 2024-01-15T10:30:00Z
```

### SECTION 5: ANALYTICS & TRACKING TABLES

#### 22. user_progress - Comprehensive progress tracking
```
id | user_id | content_type | content_id | completion_date | completion_status | time_spent_min | performance_score | understanding_score | notes | skill_improvements | created_at | skill_mastery_level | concepts_understood | struggles_identified | coach_feedback

LEAVE EMPTY | UUID-USER | drill | D001 | 2024-02-15T19:30:00Z | completed | 15 | 85 | 90 | Great effort | {"SK001": "+10"} | 2024-02-15T19:30:00Z | {"SK001": "proficient"} | {C001,C002} | {weak_hand} | Keep working
```

### SECTION 6: GAMIFICATION TABLES

#### 23. points_ledger - Point transaction history
```
id | player_id | points | point_type | source_type | source_id | base_points | multiplier | workout_length | description | awarded_at

LEAVE EMPTY | UUID-PLAYER | 50 | lax_credits | workout | W001 | 10 | 5.0 | 5 | Completed 5-drill workout | 2024-02-15T19:45:00Z
```

#### 24. badges - Badge definitions and requirements
```
id | name | description | icon_url | badge_type | required_count | point_threshold | workout_category | skill_ids | created_at

LEAVE EMPTY | Ground Ball Guru | Master of ground balls | https://icon.png | skill_mastery | 10 | 500 | Ground Balls | {SK001,SK002} | 2024-01-15T10:30:00Z
```

#### 25. user_badges - User badge achievements
```
id | user_id | badge_id | earned_at | progress_count | progress_percentage

LEAVE EMPTY | UUID-USER | BADGE001 | 2024-02-20T10:00:00Z | 10 | 100
LEAVE EMPTY | UUID-USER2 | BADGE001 | EMPTY if not earned | 7 | 70
```

### SECTION 7: QUIZ & CERTIFICATION TABLES

#### 26. master_class_modules - Youth Lacrosse Coaching Master Class content
```
id | module_id | title | description | module_type | video_url | video_duration_minutes | reading_materials | downloadable_resources | prerequisites | required_role | estimated_hours | course_id | sequence_order | is_required | created_by | is_active | created_at | updated_at

LEAVE EMPTY | MCM001 | Youth Coaching Fundamentals | Introduction to youth lacrosse coaching | youth_coaching | https://vimeo.com/123456 | 45 | [{"title": "Coaching Guide", "url": "https://pdf.com/guide", "type": "pdf"}] | [{"name": "Practice Plan Template", "url": "https://download.com/template", "type": "docx"}] | {} | coach | 2.5 | YLC001 | 1 | true | UUID-DIRECTOR | true | 2024-01-15T10:30:00Z | 2024-01-15T10:30:00Z
```

#### 27. quizzes - Core quiz table (links to strategies/drills/modules)
```
id | quiz_id | title | description | strategy_id | drill_id | master_class_module_id | passing_score | time_limit_minutes | max_attempts | randomize_questions | randomize_answers | show_correct_answers | required_role | age_bands | skill_level | created_by | created_by_role | tags | is_active | created_at | updated_at

LEAVE EMPTY | Q001 | 2-3-1 Motion Strategy Quiz | Test your understanding of motion offense | UUID-STRATEGY | EMPTY | EMPTY | 80 | 15 | 3 | false | true | true | {player,coach} | {AB002,AB003} | intermediate | UUID-COACH | coach | {strategy,offense,motion} | true | 2024-01-15T10:30:00Z | 2024-01-15T10:30:00Z
LEAVE EMPTY | Q002 | Ground Ball Fundamentals | Test ground ball technique knowledge | EMPTY | UUID-DRILL | EMPTY | 70 | 10 | EMPTY | true | true | true | {player} | {AB001,AB002} | beginner | UUID-COACH | coach | {groundballs,fundamentals} | true | 2024-01-15T10:30:00Z | 2024-01-15T10:30:00Z
```

#### 28. quiz_questions - Individual quiz questions with media support
```
id | quiz_id | question_text | question_type | image_url | video_url | video_timestamp | diagram_url | answer_options | correct_answer_explanation | difficulty_level | points | skill_ids | concept_ids | game_phase_ids | sequence_order | is_required | created_at | updated_at

LEAVE EMPTY | UUID-QUIZ | What is the primary purpose of motion offense? | multiple_choice | OPTIONAL | OPTIONAL | OPTIONAL | https://diagram.com/motion.png | [{"id": "a", "text": "Create space through movement", "is_correct": true}, {"id": "b", "text": "Stand still and pass", "is_correct": false}, {"id": "c", "text": "Only dodge to cage", "is_correct": false}] | Motion offense creates space through continuous player movement | medium | 2 | {SK200,SK201} | {C001,C002} | {GP001} | 1 | true | 2024-01-15T10:30:00Z | 2024-01-15T10:30:00Z
LEAVE EMPTY | UUID-QUIZ | True or False: Players should call for the ball when cutting | true_false | OPTIONAL | OPTIONAL | OPTIONAL | OPTIONAL | [{"id": "true", "text": "True", "is_correct": false}, {"id": "false", "text": "False", "is_correct": true}] | Players should cut silently to maintain the element of surprise | easy | 1 | {SK202} | {C003} | {GP001} | 2 | true | 2024-01-15T10:30:00Z | 2024-01-15T10:30:00Z
```

#### 29. quiz_responses - User quiz attempts and scores
```
id | user_id | quiz_id | attempt_number | started_at | completed_at | time_spent_seconds | question_responses | total_questions | correct_answers | skills_demonstrated | concepts_understood | status | device_info | created_at

LEAVE EMPTY | UUID-USER | UUID-QUIZ | 1 | 2024-02-15T10:00:00Z | 2024-02-15T10:12:30Z | 750 | [{"question_id": "UUID-Q1", "selected_answer_id": "a", "is_correct": true, "time_spent_seconds": 45}] | 10 | 8 | {SK200,SK201,SK202} | {C001,C002,C003} | completed | {"platform": "web", "browser": "Chrome"} | 2024-02-15T10:00:00Z
```

#### 30. coach_certifications - Coaching certification progress tracking
```
id | coach_id | certification_type | certification_level | modules_completed | quizzes_passed | total_modules_required | total_modules_completed | practice_plans_submitted | drills_created | team_seasons_completed | status | started_at | completed_at | expires_at | renewed_at | average_quiz_score | total_points_earned | badge_id | certificate_url | certificate_number | created_at | updated_at

LEAVE EMPTY | UUID-COACH | youth_lacrosse_coaching | intermediate | {MCM001,MCM002,MCM003} | {Q001,Q002,Q003} | 10 | 3 | 5 | 12 | 1 | in_progress | 2024-01-01T10:00:00Z | EMPTY | EMPTY | EMPTY | 85.5 | 250 | EMPTY | EMPTY | EMPTY | 2024-01-01T10:00:00Z | 2024-02-15T10:00:00Z
```

#### 31. quiz_prerequisites - Quiz dependency relationships
```
quiz_id | prerequisite_quiz_id | min_score_required | created_at

UUID-QUIZ2 | UUID-QUIZ1 | 80 | 2024-01-15T10:30:00Z
```

#### 32. module_quiz_requirements - Required quizzes for module completion
```
module_id | quiz_id | is_required | sequence_order | created_at

UUID-MODULE | UUID-QUIZ | true | 1 | 2024-01-15T10:30:00Z
```

#### 33. certification_requirements - Requirements for each certification type
```
certification_type | requirement_type | requirement_id | requirement_details | is_required | created_at

youth_lacrosse_coaching | module | UUID-MODULE | {"min_score": 80, "time_limit": "30 days"} | true | 2024-01-15T10:30:00Z
youth_lacrosse_coaching | quiz | UUID-QUIZ | {"passing_score": 85} | true | 2024-01-15T10:30:00Z
youth_lacrosse_coaching | practical | EMPTY | {"practice_plans": 5, "video_submission": true} | true | 2024-01-15T10:30:00Z
```

## Key Connection Points

### ID Reference Patterns
- **D###** - Drills (D001, D002)
- **AD###** - Academy Drills (AD001, AD002)
- **S###** - Strategies (S001, S002)
- **C###** - Concepts (C001, C002)
- **SK###** - Skills (SK001, SK100 for meta)
- **GP###** - Game Phases (GP001, GP002)
- **PS###** - Player Situations (PS001, PS002)
- **T###** - Terms (T001, T002)
- **CT###** - Communication Terms (CT001)
- **MP###** - Movement Principles (MP001)
- **W###** - Workouts (W001)
- **AB###** - Age Bands (AB001 = 8U)
- **Q###** - Quizzes (Q001, Q002)
- **MCM###** - Master Class Modules (MCM001)

### Foreign Key Relationships
- `skill_ids[]` in drills → references skills table
- `game_phase_ids[]` in drills → references game_phases table
- `concept_ids[]` in drills → references concepts table
- `strategy_id` in quizzes → references strategies table
- `drill_id` in quizzes → references drills table
- `master_class_module_id` in quizzes → references master_class_modules table
- `user_id` in all user-related tables → references auth.users (Supabase Auth)
- `coach_id`, `created_by` → references auth.users
- `age_band_id` → references age_bands table

### Array Field Formats
- PostgreSQL arrays: `{value1,value2,value3}`
- Empty arrays: `{}` or leave blank
- No spaces after commas

### JSONB Field Examples
- Objects: `{"key": "value", "key2": "value2"}`
- Arrays in JSON: `["item1", "item2"]`
- Quiz answer options: `[{"id": "a", "text": "Answer text", "is_correct": true}]`

### CHECK Constraint Values
- **role**: player, coach, parent, director
- **intensity_level**: High, Medium, Low
- **question_type**: multiple_choice, true_false
- **difficulty_level**: easy, medium, hard
- **skill_level**: beginner, intermediate, advanced, all
- **module_type**: youth_coaching, strategy_mastery, drill_mastery, skills_development, team_management
- **certification_type**: youth_lacrosse_coaching, strategy_master, drill_design, skills_development, team_management, safety_certified
- **status** (quiz responses): in_progress, completed, abandoned
- **status** (certifications): in_progress, completed, expired, renewed
- **point_type**: lax_credits, attack_tokens, defense_dollars, midfield_medals, flex_points, rebound_rewards