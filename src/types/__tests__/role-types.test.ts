// Type validation tests for role standardization

import { 
  UserAccountRole, 
  TeamMemberRole, 
  ClubMemberRole,
  isUserAccountRole,
  isTeamMemberRole,
  isClubMemberRole,
  ROLE_MAPPING,
  VALID_USER_ACCOUNT_ROLES,
  VALID_TEAM_MEMBER_ROLES,
  VALID_CLUB_MEMBER_ROLES
} from '../database.types'

import { UserRole, DatabaseUser, DatabaseTeamMember } from '../database'

// Type compilation tests - these will fail if types are wrong
describe('Role Type Validation', () => {
  test('UserRole type should match UserAccountRole', () => {
    const testUserRole: UserRole = 'administrator'
    const testUserAccountRole: UserAccountRole = testUserRole
    expect(testUserAccountRole).toBe('administrator')
  })

  test('DatabaseUser should only accept valid user account roles', () => {
    const validUser: DatabaseUser = {
      id: 'test-id',
      email: 'test@example.com',
      display_name: 'Test User',
      role: 'administrator', // Should be valid
      roles: [],
      wp_user_id: null,
      avatar_url: null,
      club_id: null,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
      last_login: null,
      is_active: true
    }
    
    expect(validUser.role).toBe('administrator')
  })

  test('DatabaseTeamMember should accept team member roles', () => {
    const validTeamMember: DatabaseTeamMember = {
      id: 'test-id',
      team_id: 'team-id',
      user_id: 'user-id',
      role: 'administrator', // Should be valid for team context
      jersey_number: null,
      position: null,
      status: 'active',
      joined_at: '2025-01-01',
      created_at: '2025-01-01'
    }
    
    expect(validTeamMember.role).toBe('administrator')
  })

  test('Role type guards should work correctly', () => {
    expect(isUserAccountRole('administrator')).toBe(true)
    expect(isUserAccountRole('admin')).toBe(false) // No longer valid
    expect(isUserAccountRole('player')).toBe(true)
    
    expect(isTeamMemberRole('head_coach')).toBe(true)
    expect(isTeamMemberRole('administrator')).toBe(true)
    expect(isTeamMemberRole('invalid_role')).toBe(false)
    
    expect(isClubMemberRole('admin')).toBe(true) // Still valid for club roles
    expect(isClubMemberRole('owner')).toBe(true)
    expect(isClubMemberRole('administrator')).toBe(false) // Not a club role
  })

  test('Role mapping should convert admin to administrator', () => {
    expect(ROLE_MAPPING['admin']).toBe('administrator')
    expect(ROLE_MAPPING['administrator']).toBe('administrator')
  })

  test('Valid role arrays should contain correct values', () => {
    expect(VALID_USER_ACCOUNT_ROLES).toContain('administrator')
    expect(VALID_USER_ACCOUNT_ROLES).not.toContain('admin')
    
    expect(VALID_TEAM_MEMBER_ROLES).toContain('administrator')
    expect(VALID_TEAM_MEMBER_ROLES).toContain('head_coach')
    
    expect(VALID_CLUB_MEMBER_ROLES).toContain('admin') // Club-level admin is still valid
    expect(VALID_CLUB_MEMBER_ROLES).not.toContain('administrator')
  })
})

// This won't run but validates types at compile time
function typeValidationTests() {
  // These should compile without errors
  const userRole: UserAccountRole = 'administrator'
  const teamRole: TeamMemberRole = 'administrator' 
  const clubRole: ClubMemberRole = 'admin' // Club admin is still 'admin'
  
  // These should cause compilation errors if uncommented:
  // const invalidUserRole: UserAccountRole = 'admin' // Should fail
  // const invalidClubRole: ClubMemberRole = 'administrator' // Should fail
  
  return { userRole, teamRole, clubRole }
}