// Legacy interfaces (keeping for compatibility)
export interface SkillsAcademyWorkout {
  id: number;
  original_id?: number;
  name: string;
  workout_series?: string;
  series_number?: number;
  workout_size?: string;
  wp_post_id?: number;
  show_title?: boolean;
  randomize_questions?: boolean;
  randomize_answers?: boolean;
  time_limit?: number;
  track_stats?: boolean;
  show_points?: boolean;
  single_attempt?: boolean;
  auto_start?: boolean;
  questions_per_page?: number;
  show_category?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SkillsAcademyDrill {
  id: number;
  title: string;
  description?: string;
  video_url?: string;
  vimeo_id?: string;
  duration_seconds?: number;
  difficulty_level?: number;
  equipment_needed?: string[];
  skill_categories?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface SkillsAcademyQuestion {
  id: number;
  original_id?: number;
  workout_id: number;
  drill_id?: number;
  sort_order?: number;
  title?: string;
  question_text?: string;
  points?: number;
  correct_message?: string;
  incorrect_message?: string;
  answer_type?: string;
  use_same_correct_msg?: boolean;
  show_tips?: boolean;
  tip_message?: string;
  use_answer_points?: boolean;
  show_points_in_box?: boolean;
  category?: string;
  created_at?: string;
}

export interface SkillsAcademyAnswer {
  id: number;
  question_id: number;
  position?: number;
  answer_text?: string;
  is_html?: boolean;
  points?: number;
  is_correct?: boolean;
  sort_string?: string;
  sort_string_html?: boolean;
  is_graded?: boolean;
  created_at?: string;
}

// New comprehensive types for Skills Academy
export interface SkillsAcademySeries {
  id: number;
  series_name: string;
  series_slug: string;
  series_type: 'solid_start' | 'attack' | 'midfield' | 'defense';
  description: string | null;
  skill_focus: string[] | null;
  position_focus: string | null;
  difficulty_level: number | null;
  target_age_group: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  icon_name: string | null;
  color_scheme: string | null;
  is_featured: boolean;
  display_order: number | null;
  total_workouts: number;
  total_drills: number;
  times_started: number;
  times_completed: number;
  average_rating: number | null;
  is_active: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillsAcademyWorkoutNew {
  id: number;
  series_id: number;
  workout_name: string;
  workout_number: number | null;
  workout_size: 'mini' | 'more' | 'complete';
  drill_count: number;
  description: string | null;
  estimated_duration_minutes: number | null;
  difficulty_modifier: number;
  wp_quiz_id: number | null;
  wp_post_id: number | null;
  original_json_id: number | null;
  times_started: number;
  times_completed: number;
  average_completion_time: number | null;
  completion_rate: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Join data
  series?: SkillsAcademySeries;
  drills?: SkillsAcademyWorkoutDrill[];
}

export interface SkillsAcademyDrillNew {
  id: number;
  drill_name: string;
  drill_slug: string | null;
  strong_hand_video_url: string | null;
  strong_hand_vimeo_id: string | null;
  off_hand_video_url: string | null;
  off_hand_vimeo_id: string | null;
  both_hands_video_url: string | null;
  both_hands_vimeo_id: string | null;
  description: string | null;
  instructions: string | null;
  coaching_points: string[] | null;
  common_mistakes: string[] | null;
  difficulty_level: number | null;
  drill_category: string | null;
  skill_focus: string[] | null;
  position_relevance: string[] | null;
  equipment_needed: string[] | null;
  space_required: string | null;
  players_required: number;
  default_reps: number | null;
  default_duration_seconds: number | null;
  rest_between_reps: number | null;
  times_viewed: number;
  times_completed: number;
  average_rating: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillsAcademyWorkoutDrill {
  id: number;
  workout_id: number;
  drill_id: number;
  sequence_order: number;
  drill_duration_seconds: number | null;
  rest_duration_seconds: number;
  workout_specific_instructions: string | null;
  repetitions: number | null;
  video_type: 'strong_hand' | 'off_hand' | 'both_hands';
  is_optional: boolean;
  points_value: number;
  // Join data
  drill?: SkillsAcademyDrillNew;
}

export interface SkillsAcademyUserProgress {
  id: number;
  user_id: string;
  workout_id: number;
  current_drill_index: number;
  drills_completed: number;
  total_drills: number;
  started_at: string;
  last_activity_at: string;
  completed_at: string | null;
  total_time_seconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  completion_percentage: number;
  points_earned: number;
  perfect_drills: number;
  // Join data
  workout?: SkillsAcademyWorkoutNew;
}

// Helper types
export interface DrillWithProgress extends SkillsAcademyWorkoutDrill {
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
}

export interface WorkoutSession {
  workout: SkillsAcademyWorkoutNew;
  drills: DrillWithProgress[];
  progress: SkillsAcademyUserProgress | null;
  currentDrillIndex: number;
}

// Grouped workouts by size
export interface GroupedWorkouts {
  mini: SkillsAcademyWorkoutNew | null;
  more: SkillsAcademyWorkoutNew | null;
  complete: SkillsAcademyWorkoutNew | null;
}

export interface WallBallWorkout {
  id: number;
  original_id?: number;
  name: string;
  workout_type?: string;
  duration_minutes?: number;
  has_coaching?: boolean;
  video_url?: string;
  vimeo_id?: string;
  wp_post_id?: number;
  difficulty_level?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WallBallDrill {
  id: number;
  name: string;
  strong_hand_video_url?: string;
  strong_hand_vimeo_id?: string;
  off_hand_video_url?: string;
  off_hand_vimeo_id?: string;
  both_hands_video_url?: string;
  both_hands_vimeo_id?: string;
  description?: string;
  difficulty_level?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutProgress {
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
  answers: Record<number, number[]>;
  startTime: Date;
  completedAt?: Date;
}

export interface QuestionWithAnswers extends SkillsAcademyQuestion {
  answers: SkillsAcademyAnswer[];
  drill?: SkillsAcademyDrill;
}

export interface WorkoutWithQuestions extends SkillsAcademyWorkout {
  questions: QuestionWithAnswers[];
}