// ROLE TYPE DEFINITIONS - STANDARDIZED FOR WORDPRESS ALIGNMENT
// 🚨 CRITICAL: These types enforce role standardization migration

// User Account Roles - These are the primary account roles from WordPress
export type UserAccountRole = 'administrator' | 'parent' | 'club_director' | 'team_coach' | 'player'

// Team Member Roles - These are team-specific roles within team management
export type TeamMemberRole = 'head_coach' | 'assistant_coach' | 'player' | 'parent' | 'administrator'

// Club Member Roles - These are club-level roles (admin remains for club-level admin)
export type ClubMemberRole = 'owner' | 'admin' | 'director'

// Type Guards
export function isUserAccountRole(role: string): role is UserAccountRole {
  return ['administrator', 'parent', 'club_director', 'team_coach', 'player'].includes(role)
}

export function isTeamMemberRole(role: string): role is TeamMemberRole {
  return ['head_coach', 'assistant_coach', 'player', 'parent', 'administrator'].includes(role)
}

export function isClubMemberRole(role: string): role is ClubMemberRole {
  return ['owner', 'admin', 'director'].includes(role)
}

// Role mappings for migration and compatibility
export const ROLE_MAPPING = {
  // User account role migrations
  'admin': 'administrator', // OLD -> NEW for user accounts
  
  // Legacy compatibility (these are already correct)
  'administrator': 'administrator',
  'parent': 'parent',
  'club_director': 'club_director', 
  'team_coach': 'team_coach',
  'player': 'player'
} as const

// Valid role values for database constraints
export const VALID_USER_ACCOUNT_ROLES = ['administrator', 'parent', 'club_director', 'team_coach', 'player'] as const
export const VALID_TEAM_MEMBER_ROLES = ['head_coach', 'assistant_coach', 'player', 'parent', 'administrator'] as const
export const VALID_CLUB_MEMBER_ROLES = ['owner', 'admin', 'director'] as const

// Role display names
export const ROLE_DISPLAY_NAMES = {
  // User account roles
  'administrator': 'Administrator',
  'parent': 'Parent',
  'club_director': 'Club Director',
  'team_coach': 'Team Coach',
  'player': 'Player',
  
  // Team member roles
  'head_coach': 'Head Coach',
  'assistant_coach': 'Assistant Coach',
  
  // Club member roles  
  'owner': 'Owner',
  'admin': 'Admin', // This remains 'admin' for club-level roles
  'director': 'Director'
} as const

// Export types for backward compatibility
export type UserRole = UserAccountRole
export type AdminRole = 'administrator' // Standardized admin role for user accounts