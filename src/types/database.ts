// DATABASE TYPE DEFINITIONS - MATCHES ACTUAL SUPABASE TABLES
// 🚨 CRITICAL: These types match the ACTUAL database schema as verified in the database truth contract

// ============================================================================
// DRILL TYPES (powlax_drills table - ACTIVE)
// ============================================================================
export interface PowerlaxDrill {
  id: string // UUID
  title: string // Main drill name
  content: string
  category: string
  duration_minutes: number
  video_url: string | null
  notes: string | null
  lacrosse_lab_urls: any[] | null // JSON array
  min_players: number | null
  max_players: number | null
  tags: string | null
  game_states: any[] | null
  difficulty_level: string | null
  equipment: any[] | null
  space_needed: string | null
  status: string | null
  custom_url: string | null
  created_at: string
  updated_at: string
}

export interface UserDrill {
  id: string // UUID  
  user_id: string
  name: string // User drills use 'name'
  title?: string // Optional alias
  drill_duration: string | null // Duration as text
  drill_category: string | null
  drill_types: string | null
  vimeo_url: string | null
  drill_video_url: string | null
  content: string | null
  drill_notes: string | null
  game_states: any[] | null
  drill_emphasis: string | null
  game_phase: string | null
  do_it_ages: string | null
  coach_it_ages: string | null
  own_it_ages: string | null
  featured_image: string | null
  status: string | null
  is_public: boolean | null
  team_share: number[] | null
  club_share: number[] | null
  created_at: string
  updated_at: string
}

// ============================================================================
// STRATEGY TYPES (powlax_strategies table - ACTIVE)
// ============================================================================
export interface PowerlaxStrategy {
  id: number // Integer ID
  strategy_name: string
  strategy_categories: string | null
  description: string | null
  vimeo_link: string | null
  lacrosse_lab_links: any[] | null // JSON array
  thumbnail_urls: any | null // JSON
  embed_codes: any | null
  see_it_ages: string | null
  coach_it_ages: string | null
  own_it_ages: string | null
  has_pdf: boolean | null
  target_audience: string | null
  lesson_category: string | null
  master_pdf_url: string | null
  vimeo_id: number | null
  pdf_shortcode: string | null
  created_at: string
  updated_at: string
}

export interface UserStrategy {
  id: string // UUID
  user_id: string
  strategy_name: string
  strategy_categories: string | null
  description: string | null
  vimeo_link: string | null
  lacrosse_lab_links: any[] | null
  thumbnail_urls: any | null
  embed_codes: any | null
  see_it_ages: string | null
  coach_it_ages: string | null
  own_it_ages: string | null
  has_pdf: boolean | null
  target_audience: string | null
  lesson_category: string | null
  master_pdf_url: string | null
  vimeo_id: number | null
  pdf_shortcode: string | null
  team_share: number[] | null
  club_share: number[] | null
  is_public: boolean | null
  created_at: string
  updated_at: string
}

// ============================================================================
// USER TYPES (users table - ACTIVE, NOT user_profiles)
// ============================================================================
export interface DatabaseUser {
  id: string // UUID
  email: string
  display_name: string
  role: string
  roles: string[] // Often empty array
  wp_user_id: number | null
  avatar_url: string | null
  club_id: string | null // User's club association
  created_at: string
  updated_at: string
  last_login: string | null
  is_active: boolean | null
}

// ============================================================================
// TEAM TYPES (teams table - ACTIVE)
// ============================================================================
export interface DatabaseTeam {
  id: string // UUID
  club_id: string | null // References clubs table
  wp_group_id: number | null
  wp_buddyboss_group_id: number | null
  name: string
  slug: string | null
  team_type: string | null
  subscription_tier: string | null
  age_group: string | null
  season: string | null
  gender: 'boys' | 'girls' | 'mixed' | null
  level: string | null
  settings: any | null // JSON
  created_at: string
  updated_at: string
  wp_last_synced: string | null
}

// ============================================================================
// CLUB TYPES (clubs table - ACTIVE, NOT organizations)
// ============================================================================
export interface DatabaseClub {
  id: string // UUID
  name: string
  slug: string | null
  wp_group_id: number | null
  type: 'club_os' | 'club_team_os' | null
  parent_club_id: string | null
  tier: 'foundation' | 'growth' | 'command' | null
  settings: any | null // JSON
  branding: any | null // JSON
  created_at: string
  updated_at: string
}

// ============================================================================
// PRACTICE TYPES (practices table - ACTIVE, NOT practice_plans)
// ============================================================================
export interface DatabasePractice {
  id: string // UUID
  coach_id: string // References users table
  team_id: string | null // Can be null
  name: string
  duration_minutes: number
  practice_date: string | null
  location: string | null
  notes: string | null
  drill_sequence: any[] | null // JSON array
  status: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// PRACTICE DRILL TYPES (practice_drills table - ACTIVE, NOT practice_plan_drills)
// ============================================================================
export interface DatabasePracticeDrill {
  id: string // UUID
  practice_id: string // References practices table
  drill_id: string // References powlax_drills or user_drills
  sequence_order: number
  duration_override: number | null
  notes: string | null
  modifications: any | null // JSON
  created_at: string
}

// ============================================================================
// MEDIA TYPES (powlax_images table - ACTIVE, NOT drill_media)
// ============================================================================
export interface DatabaseMedia {
  id: string // UUID
  drill_id: string | null
  strategy_id: string | null
  image_url: string
  thumbnail_url: string | null
  alt_text: string | null
  file_size: number | null
  mime_type: string | null
  created_at: string
}

// ============================================================================
// SKILLS ACADEMY TYPES (ACTIVE WORKING SYSTEM)
// ============================================================================
export interface SkillsAcademySeries {
  id: string // UUID
  series_name: string
  description: string | null
  workout_count: number | null
  difficulty_level: string | null
  age_group: string | null
  created_at: string
  updated_at: string
}

export interface SkillsAcademyWorkout {
  id: string // UUID
  series_id: string
  title: string
  description: string | null
  drill_count: number | null
  estimated_duration_minutes: number | null
  difficulty_level: string | null
  thumbnail_url: string | null
  video_url: string | null
  sequence_order: number | null
  // 🚨 CRITICAL: This column contains the drill relationships, NOT a junction table
  drill_ids: string[] | null // JSON array of drill IDs
  created_at: string
  updated_at: string
}

export interface SkillsAcademyDrill {
  id: string // UUID
  title: string
  description: string | null
  duration_minutes: number | null
  video_url: string | null
  thumbnail_url: string | null
  equipment_needed: any[] | null // JSON array
  space_requirements: string | null
  coaching_points: string | null
  variations: any[] | null // JSON array
  created_at: string
  updated_at: string
}

export interface SkillsAcademyUserProgress {
  id: string // UUID
  user_id: string
  workout_id: string
  current_drill_index: number
  drills_completed: number
  total_drills: number
  started_at: string
  last_activity_at: string
  completed_at: string | null
  total_time_seconds: number
  status: 'in_progress' | 'completed' | 'abandoned'
  points_earned: number
  created_at: string
}

// ============================================================================
// WALL BALL TYPES (ACTIVE WORKING SYSTEM)
// ============================================================================
export interface WallBallDrillLibrary {
  id: string // UUID
  title: string
  description: string | null
  duration_minutes: number | null
  video_url: string | null
  coaching_points: string | null
  series_name: string | null // Wall Ball series grouping
  created_at: string
  updated_at: string
}

// ============================================================================
// GAMIFICATION TYPES (PARTIALLY ACTIVE)
// ============================================================================
export interface DatabaseUserPointsWallet {
  id: string // UUID
  user_id: string
  point_type_id: string
  balance: number
  lifetime_earned: number
  lifetime_spent: number
  created_at: string
  updated_at: string
}

export interface DatabasePointTransaction {
  id: string // UUID
  user_id: string
  point_type_id: string
  amount: number
  transaction_type: 'earned' | 'spent' | 'bonus' | 'penalty'
  source: string // What earned/spent the points
  source_id: string | null // ID of the source (drill, workout, etc)
  description: string | null
  created_at: string
}

export interface DatabaseUserBadge {
  id: string // UUID
  user_id: string
  badge_slug: string
  badge_name: string
  earned_at: string
  points_earned: number | null
  metadata: any | null // JSON
}

export interface DatabasePlayerRank {
  id: string // UUID
  rank_name: string
  min_points: number
  badge_image_url: string | null
  description: string | null
  created_at: string
}

// ============================================================================
// TEAM MEMBER TYPES (ACTIVE)
// ============================================================================
export interface DatabaseTeamMember {
  id: string // UUID
  team_id: string // References teams table
  user_id: string // References users table
  role: 'head_coach' | 'assistant_coach' | 'player' | 'parent' | 'admin'
  jersey_number: string | null
  position: string | null
  status: 'active' | 'inactive' | 'pending'
  joined_at: string
  created_at: string
}

// ============================================================================
// FAMILY MANAGEMENT TYPES (ACTIVE)
// ============================================================================
export interface DatabaseFamilyAccount {
  id: string // UUID
  primary_email: string
  family_name: string | null
  created_at: string
  updated_at: string
}

export interface DatabaseFamilyMember {
  id: string // UUID
  family_account_id: string
  user_id: string
  relationship: 'parent' | 'child' | 'guardian' | 'other'
  is_primary: boolean
  created_at: string
}

// ============================================================================
// DEPRECATED/NON-EXISTENT TABLES - DO NOT USE
// ============================================================================
// The following tables DO NOT EXIST in the database:
// - practice_plans (use 'practices')
// - practice_plan_drills (use 'practice_drills') 
// - organizations (use 'clubs')
// - user_profiles (use 'users')
// - badges (use 'user_badges')
// - points_ledger (use 'points_transactions_powlax')
// - skills_academy_workout_drills (use drill_ids column)
// - concepts, skills, drill_strategies, strategy_concepts, concept_skills
// - Any 4-tier taxonomy tables
// - drills, strategies (use powlax_drills, powlax_strategies)
// - powlax_wall_ball_collections, powlax_wall_ball_drill_library


// ============================================================================
// UTILITY TYPES FOR LEGACY COMPATIBILITY
// ============================================================================
// These provide backwards compatibility for components that haven't been updated yet
export type Organization = DatabaseClub // Legacy alias
export type UserProfile = DatabaseUser // Legacy alias
export type PracticePlan = DatabasePractice // Legacy alias
export type PracticePlanDrill = DatabasePracticeDrill // Legacy alias