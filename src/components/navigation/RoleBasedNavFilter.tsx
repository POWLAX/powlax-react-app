'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/JWTAuthContext'

interface RoleBasedNavFilterProps {
  roles?: string[]
  children: ReactNode
  fallback?: ReactNode
  requireAll?: boolean
}

/**
 * Component that conditionally renders children based on user roles
 * @param roles - Array of roles that can see this content
 * @param children - Content to render if user has required role(s)
 * @param fallback - Optional content to render if user doesn't have required role(s)
 * @param requireAll - If true, user must have ALL specified roles. If false (default), user needs ANY of the roles
 */
export default function RoleBasedNavFilter({ 
  roles, 
  children, 
  fallback = null,
  requireAll = false 
}: RoleBasedNavFilterProps) {
  const { user } = useAuth()
  
  // If no roles specified, always show
  if (!roles || roles.length === 0) {
    return <>{children}</>
  }
  
  // During development, show everything if user has no roles
  if (!user?.roles || user.roles.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      return <>{children}</>
    }
  }
  
  // Check if user has required roles
  const hasRequiredRoles = requireAll
    ? roles.every(role => user?.roles?.includes(role))
    : roles.some(role => user?.roles?.includes(role))
  
  return hasRequiredRoles ? <>{children}</> : <>{fallback}</>
}

/**
 * Hook for filtering navigation items based on user roles
 */
export function useRoleBasedNavigation<T extends { roles?: string[], always?: boolean }>(
  items: T[]
): T[] {
  const { user } = useAuth()
  
  return items.filter(item => {
    // Always show items marked as "always"
    if (item.always) return true
    
    // Show all items if user has no roles (during development)
    if (!user?.roles || user.roles.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        return true
      }
    }
    
    // If item has no role restrictions, show it
    if (!item.roles || item.roles.length === 0) return true
    
    // Show items if user has matching role
    return item.roles.some(role => user?.roles?.includes(role))
  })
}