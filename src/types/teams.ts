// Organization Types (Club OS and Club Team OS)
export interface Organization {
  id: string
  wp_group_id?: number
  name: string
  slug: string
  type: 'club_os' | 'club_team_os'
  parent_org_id?: string
  tier?: 'foundation' | 'growth' | 'command'
  settings: OrganizationSettings
  branding: OrganizationBranding
  created_at: string
  updated_at: string
  // Relations
  parent_org?: Organization
  child_orgs?: Organization[]
  teams?: Team[]
}

export interface OrganizationSettings {
  description?: string
  [key: string]: any
}

export interface OrganizationBranding {
  primary_color?: string
  secondary_color?: string
  logo_url?: string
}

// Team Types (Team HQ)
export interface Team {
  id: string
  club_id?: string  // Changed from organization_id
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
  organization?: Organization
  user_roles?: UserTeamRole[]
}

export interface TeamSettings {
  practice_duration_default?: number
  practice_start_time_default?: string
  field_type_default?: string
  [key: string]: any
}

// User Role Types
export interface UserOrganizationRole {
  id: string
  user_id: string
  organization_id: string
  role: 'owner' | 'admin' | 'director'
  created_at: string
  // Relations
  user?: any // User type from your auth system
  organization?: Organization
}

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
  organization_name: string
  club_name?: string
}

// Form Types
export interface CreateOrganizationInput {
  name: string
  type: 'club_os' | 'club_team_os'
  parent_org_id?: string
  tier?: 'foundation' | 'growth' | 'command'
  settings?: OrganizationSettings
  branding?: OrganizationBranding
}

export interface CreateTeamInput {
  club_id?: string  // Changed from organization_id
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

export interface AddUserToOrganizationInput {
  user_id: string
  organization_id: string
  role: 'owner' | 'admin' | 'director'
}