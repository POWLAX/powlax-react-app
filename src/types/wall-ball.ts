// Wall Ball Workout Types

export interface WallBallSeries {
  id: number;
  series_name: string;
  series_slug: string;
  description: string | null;
  skill_focus: string[] | null;
  difficulty_level: number | null;
  target_audience: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  is_featured: boolean;
  display_order: number | null;
  available_durations: number[] | null;
  has_coaching_version: boolean;
  has_no_coaching_version: boolean;
  total_variants: number;
  times_accessed: number;
  average_rating: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WallBallVariant {
  id: number;
  series_id: number;
  variant_name: string;
  duration_minutes: number;
  has_coaching: boolean;
  full_workout_video_url: string;
  full_workout_vimeo_id: string | null;
  drill_sequence: any; // JSONB
  drill_ids: number[];
  total_drills: number;
  wp_post_id: number | null;
  original_csv_column: string | null;
  times_completed: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Join data
  series?: WallBallSeries;
}

export interface WallBallDrill {
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
  coaching_points: string[] | null;
  common_mistakes: string[] | null;
  difficulty_level: number | null;
  skill_focus: string[] | null;
  drill_type: string | null;
  equipment_needed: string[] | null;
  wall_distance_feet: number | null;
  recommended_reps: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Helper type for grouped variants by duration
export interface GroupedVariants {
  duration: number;
  withCoaching: WallBallVariant | null;
  withoutCoaching: WallBallVariant | null;
}