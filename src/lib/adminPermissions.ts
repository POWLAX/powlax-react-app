'use client'

// Updated to work with Supabase Auth users
interface AdminUser {
  email: string
  roles?: string[]
  role?: string
}

/**
 * Admin Permissions Helper
 * Determines if a user has admin privileges to edit drills and strategies
 */

// Admin email addresses and roles that have edit permissions  
const ADMIN_EMAILS = [
  'admin@powlax.com',
  'patrick@powlax.com',
  'support@powlax.com',
  // Add additional variations to ensure matching
  'patrick.chapla@powlax.com'
]

const ADMIN_ROLES = [
  'administrator',
  'super_admin',
  'admin'
]

/**
 * Check if user has admin permissions to edit drills and strategies
 */
export function canEditDrillsAndStrategies(user: AdminUser | null): boolean {
  if (!user) return false

  // Debug logging for admin detection
  const debugInfo = {
    email: user.email,
    emailLower: user.email?.toLowerCase(),
    roles: user.roles,
    adminEmails: ADMIN_EMAILS,
    adminRoles: ADMIN_ROLES
  }
  
  // Check by email
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    console.log('✅ Admin access granted by email:', debugInfo)
    return true
  }

  // Check by role
  if (user.roles && user.roles.length > 0) {
    const hasAdminRole = user.roles.some(role => 
      ADMIN_ROLES.includes(role.toLowerCase())
    )
    if (hasAdminRole) {
      console.log('✅ Admin access granted by role:', debugInfo)
      return true
    }
  }

  console.log('❌ Admin access denied:', debugInfo)
  return false
}

/**
 * Check if user can delete drills and strategies
 * (Currently same as edit permissions, but separate function for future flexibility)
 */
export function canDeleteDrillsAndStrategies(user: AdminUser | null): boolean {
  return canEditDrillsAndStrategies(user)
}

/**
 * Get admin permission level for user
 */
export function getAdminPermissionLevel(user: AdminUser | null): 'none' | 'edit' | 'admin' {
  if (!user) return 'none'
  
  if (canEditDrillsAndStrategies(user)) {
    // Check if super admin
    if (user.email === 'admin@powlax.com' || 
        (user.roles && user.roles.includes('administrator'))) {
      return 'admin'
    }
    return 'edit'
  }
  
  return 'none'
}

/**
 * Validate admin operation before executing
 */
export function validateAdminOperation(user: AdminUser | null, operation: 'edit' | 'delete'): { allowed: boolean; reason?: string } {
  if (!user) {
    return { allowed: false, reason: 'User not authenticated' }
  }

  if (!canEditDrillsAndStrategies(user)) {
    return { allowed: false, reason: 'Insufficient permissions. Admin access required.' }
  }

  if (operation === 'delete' && !canDeleteDrillsAndStrategies(user)) {
    return { allowed: false, reason: 'Delete permissions not available for this user.' }
  }

  return { allowed: true }
}