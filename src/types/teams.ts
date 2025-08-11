// Club Types (ACTIVE TABLE - 'clubs', NOT 'organizations')
export interface Club {
  id: string
  wp_group_id?: number
  name: string
  slug: string
  type: 'club_os' | 'club_team_os'
  parent_club_id?: string // Updated from parent_org_id
  tier?: 'foundation' | 'growth' | 'command'
  settings: ClubSettings
  branding: ClubBranding
  created_at: string
  updated_at: string
  // Relations
  parent_club?: Club
  child_clubs?: Club[]
  teams?: Team[]
}

export interface ClubSettings {
  description?: string
  [key: string]: any
}

export interface ClubBranding {
  primary_color?: string
  secondary_color?: string
  logo_url?: string
}

// Legacy alias for backwards compatibility
export type Organization = Club
export type OrganizationSettings = ClubSettings
export type OrganizationBranding = ClubBranding

// Team Types (Team HQ) - CORRECTED to match actual database!
export interface Team {
  id: string
  club_id: string | null  // 🚨 CONFIRMED: This is the correct database column name
  organization_id?: string // Legacy compatibility alias
  wp_group_id?: number
  wp_buddyboss_group_id?: number
  name: string
  slug?: string
  team_type?: 'single_team_hq' | 'team_hq'
  subscription_tier?: 'structure' | 'leadership' | 'activated'
  age_group?: string
  season?: string
  gender?: 'boys' | 'girls' | 'mixed'
  level?: 'varsity' | 'jv' | 'freshman' | 'youth' | 'other'
  settings?: TeamSettings
  created_at: string
  wp_last_synced?: string
  // Relations
  club?: Club // Updated from organization
  organization?: Club // Legacy compatibility alias
  user_roles?: UserTeamRole[]
}

export interface TeamSettings {
  practice_duration_default?: number
  practice_start_time_default?: string
  field_type_default?: string
  [key: string]: any
}

// User Role Types
export interface UserClubRole {
  id: string
  user_id: string
  club_id: string // Updated from organization_id
  role: 'owner' | 'admin' | 'director'
  created_at: string
  // Relations
  user?: any // User type from your auth system
  club?: Club
}

// Legacy alias for backwards compatibility
export type UserOrganizationRole = UserClubRole

export interface UserTeamRole {
  id: string
  user_id: string
  team_id: string
  role: 'head_coach' | 'assistant_coach' | 'team_admin' | 'player' | 'parent'
  jersey_number?: string
  position?: string
  created_at: string
  // Relations
  user?: any // User type from your auth system
  team?: Team
}

// Composite Types for UI
export interface TeamWithHierarchy {
  team_id: string
  team_name: string
  team_slug?: string
  level?: string
  gender?: string
  age_group?: string
  subscription_tier?: string
  club_id?: string
  club_name?: string
  parent_club_id?: string
  parent_club_name?: string
}

export interface UserTeamAccess {
  team_id: string
  team_name: string
  team_slug: string
  user_role: string
  club_name: string // Updated from organization_name
  organization_name?: string // Legacy compatibility alias
}

// Form Types
export interface CreateClubInput {
  name: string
  type: 'club_os' | 'club_team_os'
  parent_club_id?: string // Updated from parent_org_id
  tier?: 'foundation' | 'growth' | 'command'
  settings?: ClubSettings
  branding?: ClubBranding
}

// Legacy alias for backwards compatibility
export type CreateOrganizationInput = CreateClubInput

export interface CreateTeamInput {
  club_id?: string  // 🚨 CONFIRMED: This is correct
  organization_id?: string // Legacy compatibility alias
  name: string
  team_type?: 'single_team_hq' | 'team_hq'
  subscription_tier?: 'structure' | 'leadership' | 'activated'
  age_group?: string
  season?: string
  gender?: 'boys' | 'girls' | 'mixed'
  level?: 'varsity' | 'jv' | 'freshman' | 'youth' | 'other'
  settings?: TeamSettings
}

export interface AddUserToTeamInput {
  user_id: string
  team_id: string
  role: 'head_coach' | 'assistant_coach' | 'team_admin' | 'player' | 'parent'
  jersey_number?: string
  position?: string
}

export interface AddUserToClubInput {
  user_id: string
  club_id: string // Updated from organization_id
  role: 'owner' | 'admin' | 'director'
}

// Legacy alias for backwards compatibility
export type AddUserToOrganizationInput = AddUserToClubInput