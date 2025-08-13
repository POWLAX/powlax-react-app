/**
 * Capability-aware routing logic for magic links
 * Routes users to the most appropriate destination based on their capabilities
 */

export interface CapabilityRoute {
  path: string
  priority: number
  description: string
}

/**
 * Route priority mapping based on user capabilities
 * Higher priority = more specific/important capability
 */
const CAPABILITY_ROUTES: Record<string, CapabilityRoute> = {
  // Administrative capabilities (highest priority)
  'admin.manage_users': {
    path: '/admin/management',
    priority: 100,
    description: 'Admin user management'
  },
  'admin.full_access': {
    path: '/admin',
    priority: 95,
    description: 'Full admin dashboard'
  },
  'admin.view_analytics': {
    path: '/admin/analytics',
    priority: 90,
    description: 'Admin analytics'
  },

  // Coaching capabilities (high priority)
  'coaching.practice_planner': {
    path: '/practice-planner',
    priority: 80,
    description: 'Practice planning tools'
  },
  'coaching.team_management': {
    path: '/teams',
    priority: 75,
    description: 'Team management'
  },
  'coaching.view_team_analytics': {
    path: '/teams/analytics',
    priority: 70,
    description: 'Team performance analytics'
  },

  // Skills Academy capabilities (medium-high priority)
  'skills_academy.full_access': {
    path: '/academy',
    priority: 60,
    description: 'Full Skills Academy access'
  },
  'skills_academy.workouts': {
    path: '/academy/workouts',
    priority: 55,
    description: 'Skills Academy workouts'
  },
  'skills_academy.progress_tracking': {
    path: '/academy/progress',
    priority: 50,
    description: 'Skills progress tracking'
  },

  // Team member capabilities (medium priority)
  'teams.view_team_info': {
    path: '/teams',
    priority: 40,
    description: 'Team information'
  },
  'teams.view_practice_plans': {
    path: '/practice-plans',
    priority: 35,
    description: 'View practice plans'
  },

  // Parent capabilities (lower priority)
  'family.view_children': {
    path: '/dashboard',
    priority: 30,
    description: 'View children accounts'
  },
  'family.manage_accounts': {
    path: '/family',
    priority: 25,
    description: 'Manage family accounts'
  },

  // Basic user capabilities (lowest priority)
  'profile.view_own': {
    path: '/profile',
    priority: 10,
    description: 'View own profile'
  },
  'profile.edit_own': {
    path: '/profile/edit',
    priority: 5,
    description: 'Edit own profile'
  }
}

/**
 * Role-based fallback routes when specific capabilities aren't available
 */
const ROLE_FALLBACK_ROUTES: Record<string, string> = {
  'administrator': '/admin',
  'club_director': '/admin/management',
  'head_coach': '/practice-planner',
  'team_coach': '/practice-planner',
  'assistant_coach': '/teams',
  'player': '/academy',
  'parent': '/dashboard'
}

/**
 * Default route when no specific capabilities or roles are found
 */
const DEFAULT_ROUTE = '/dashboard'

/**
 * Determines the optimal route for a user based on their capabilities
 * @param capabilities Array of user capabilities
 * @param roles Optional array of user roles for fallback routing
 * @returns The optimal route path
 */
export function getOptimalRoute(capabilities: string[] = [], roles: string[] = []): string {
  // If no capabilities provided, try role-based routing
  if (!capabilities || capabilities.length === 0) {
    return getRouteFromRoles(roles)
  }

  // Find matching capabilities and their routes
  const matchingRoutes = capabilities
    .map(capability => CAPABILITY_ROUTES[capability])
    .filter(Boolean) // Remove undefined entries
    .sort((a, b) => b.priority - a.priority) // Sort by priority (highest first)

  // Return the highest priority route
  if (matchingRoutes.length > 0) {
    return matchingRoutes[0].path
  }

  // Fallback to role-based routing
  return getRouteFromRoles(roles)
}

/**
 * Gets route based on user roles (fallback when capabilities aren't available)
 * @param roles Array of user roles
 * @returns Route path
 */
export function getRouteFromRoles(roles: string[] = []): string {
  // Check each role against fallback routes (in order of priority)
  const prioritizedRoles = [
    'administrator',
    'club_director', 
    'head_coach',
    'team_coach',
    'assistant_coach',
    'player',
    'parent'
  ]

  for (const role of prioritizedRoles) {
    if (roles.includes(role)) {
      return ROLE_FALLBACK_ROUTES[role]
    }
  }

  return DEFAULT_ROUTE
}

/**
 * Gets all possible routes for a user based on their capabilities
 * Useful for generating navigation menus
 * @param capabilities Array of user capabilities
 * @returns Array of available routes with metadata
 */
export function getAvailableRoutes(capabilities: string[] = []): CapabilityRoute[] {
  return capabilities
    .map(capability => CAPABILITY_ROUTES[capability])
    .filter(Boolean)
    .sort((a, b) => b.priority - a.priority)
}

/**
 * Validates if a user has access to a specific route based on capabilities
 * @param targetRoute The route to check access for
 * @param capabilities Array of user capabilities
 * @param roles Optional array of user roles for fallback
 * @returns True if user has access to the route
 */
export function hasRouteAccess(
  targetRoute: string, 
  capabilities: string[] = [], 
  roles: string[] = []
): boolean {
  // Get all available routes for the user
  const availableRoutes = getAvailableRoutes(capabilities)
  const hasCapabilityAccess = availableRoutes.some(route => route.path === targetRoute)
  
  if (hasCapabilityAccess) {
    return true
  }

  // Check role-based access as fallback
  const roleBasedRoute = getRouteFromRoles(roles)
  return roleBasedRoute === targetRoute
}

/**
 * Gets user-friendly description for a route
 * @param routePath The route path
 * @returns Description of what the route provides
 */
export function getRouteDescription(routePath: string): string {
  const route = Object.values(CAPABILITY_ROUTES).find(r => r.path === routePath)
  return route?.description || 'Dashboard'
}

/**
 * Generates a magic link URL with capability-aware routing
 * @param baseUrl The base URL of the application
 * @param token The magic link token
 * @param capabilities User capabilities for routing
 * @param roles Optional user roles for fallback
 * @param customRedirect Optional custom redirect path
 * @returns Complete magic link URL
 */
export function generateMagicLinkUrl(
  baseUrl: string,
  token: string,
  capabilities: string[] = [],
  roles: string[] = [],
  customRedirect?: string
): string {
  const redirectPath = customRedirect || getOptimalRoute(capabilities, roles)
  const url = new URL(`${baseUrl}/auth/magic-link`)
  url.searchParams.set('token', token)
  url.searchParams.set('redirect', redirectPath)
  return url.toString()
}

/**
 * Extracts routing information from a magic link URL
 * @param magicLinkUrl The complete magic link URL
 * @returns Object containing token and redirect information
 */
export function parseMagicLinkUrl(magicLinkUrl: string): {
  token: string | null
  redirect: string | null
  isValid: boolean
} {
  try {
    const url = new URL(magicLinkUrl)
    const token = url.searchParams.get('token')
    const redirect = url.searchParams.get('redirect')
    
    return {
      token,
      redirect,
      isValid: !!token
    }
  } catch (error) {
    return {
      token: null,
      redirect: null,
      isValid: false
    }
  }
}

/**
 * Gets capability requirements for accessing a specific route
 * Useful for checking permissions before navigation
 * @param routePath The route to check
 * @returns Array of capabilities that grant access to this route
 */
export function getRouteCapabilityRequirements(routePath: string): string[] {
  return Object.entries(CAPABILITY_ROUTES)
    .filter(([, route]) => route.path === routePath)
    .map(([capability]) => capability)
}