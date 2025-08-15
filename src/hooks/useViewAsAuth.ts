'use client'

import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useRoleViewer } from '@/contexts/RoleViewerContext'

// Hook that wraps useAuth to provide view-as functionality
export function useViewAsAuth() {
  const actualAuth = useAuth()
  const { viewingRole, isViewingAs } = useRoleViewer()

  // Only allow viewing as different roles if user is an administrator
  const isAdmin = actualAuth.user?.roles?.includes('administrator')

  if (isViewingAs && isAdmin && viewingRole) {
    // Return modified user object with viewing role
    return {
      ...actualAuth,
      user: actualAuth.user ? {
        ...actualAuth.user,
        role: viewingRole,
        roles: [viewingRole],
        _isViewingAs: true,
        _actualRole: actualAuth.user.role,
        _actualRoles: actualAuth.user.roles
      } : null
    }
  }

  // Return actual auth if not viewing or not admin
  return actualAuth
}