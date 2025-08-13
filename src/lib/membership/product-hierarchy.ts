/**
 * POWLAX Membership Product Hierarchy
 * Defines the complete product catalog with capabilities and inheritance rules
 * Contract: membership-capability-002.yaml
 */

export type Capability = 
  // Academy Access
  | 'full_academy'
  | 'basic_academy'
  | 'limited_drills'
  | 'drills'
  | 'workouts'
  
  // Coach Features
  | 'practice_planner'
  | 'resources'
  | 'custom_content'
  | 'training'
  
  // Team Features
  | 'team_management'
  | 'roster'
  | 'playbook'
  | 'analytics'
  
  // Basic
  | 'platform_access'

export type ProductType = 'individual' | 'team' | 'club'

export interface ProductDefinition {
  id: string
  name: string
  type: ProductType
  capabilities: Capability[]
  excludes?: Capability[]
  playerLimit?: number
  description: string
}

export interface TeamProduct extends ProductDefinition {
  type: 'team'
  coachProduct: string // What coach gets
  playerProduct: string // What first 25 players get
  playerLimit: 25
}

export interface ClubProduct extends ProductDefinition {
  type: 'club'
  teamTier: string // Which team product all teams get
}

/**
 * Individual Products
 * Direct purchases by individual users
 */
export const individualProducts: Record<string, ProductDefinition> = {
  // Create Account (Free)
  create_account: {
    id: 'create_account',
    name: 'Free Account',
    type: 'individual',
    capabilities: ['platform_access'],
    description: 'Basic platform access with limited features'
  },

  // Skills Academy Products
  skills_academy_monthly: {
    id: 'skills_academy_monthly',
    name: 'Skills Academy Monthly',
    type: 'individual',
    capabilities: ['full_academy', 'drills', 'workouts'],
    description: 'Full Skills Academy access with all drills and workouts'
  },

  skills_academy_annual: {
    id: 'skills_academy_annual',
    name: 'Skills Academy Annual',
    type: 'individual',
    capabilities: ['full_academy', 'drills', 'workouts'],
    description: 'Full Skills Academy access with all drills and workouts (annual)'
  },

  skills_academy_basic: {
    id: 'skills_academy_basic',
    name: 'Skills Academy Basic',
    type: 'individual',
    capabilities: ['basic_academy', 'limited_drills'],
    description: 'Basic Skills Academy access with limited content'
  },

  // Coach Products (NO academy access)
  coach_essentials_kit: {
    id: 'coach_essentials_kit',
    name: 'Coach Essentials Kit',
    type: 'individual',
    capabilities: ['practice_planner', 'resources'],
    excludes: ['full_academy', 'basic_academy'],
    description: 'Practice planning tools and coaching resources'
  },

  coach_confidence_kit: {
    id: 'coach_confidence_kit',
    name: 'Coach Confidence Kit',
    type: 'individual',
    capabilities: ['practice_planner', 'custom_content', 'training'],
    excludes: ['full_academy', 'basic_academy'],
    description: 'Advanced coaching tools with custom content and training'
  }
}

/**
 * Team Products
 * Include coach benefits + first 25 players get academy access
 */
export const teamProducts: Record<string, TeamProduct> = {
  team_hq_structure: {
    id: 'team_hq_structure',
    name: 'Team HQ Structure',
    type: 'team',
    capabilities: ['team_management', 'roster'],
    coachProduct: 'coach_essentials_kit',
    playerProduct: 'skills_academy_basic',
    playerLimit: 25,
    description: 'Coach Essentials + 25 Basic Academy memberships'
  },

  team_hq_leadership: {
    id: 'team_hq_leadership',
    name: 'Team HQ Leadership',
    type: 'team',
    capabilities: ['team_management', 'playbook', 'roster'],
    coachProduct: 'coach_confidence_kit',
    playerProduct: 'skills_academy_basic',
    playerLimit: 25,
    description: 'Coach Confidence + Playbook + 25 Basic Academy memberships'
  },

  team_hq_activated: {
    id: 'team_hq_activated',
    name: 'Team HQ Activated',
    type: 'team',
    capabilities: ['team_management', 'playbook', 'roster', 'analytics'],
    coachProduct: 'coach_confidence_kit',
    playerProduct: 'skills_academy_monthly',
    playerLimit: 25,
    description: 'Coach Confidence + Playbook + Analytics + 25 Full Academy memberships'
  }
}

/**
 * Club Products
 * Cascade team benefits to ALL teams in the club
 */
export const clubProducts: Record<string, ClubProduct> = {
  club_os_foundation: {
    id: 'club_os_foundation',
    name: 'Club OS Foundation',
    type: 'club',
    capabilities: ['team_management'],
    teamTier: 'team_hq_structure',
    description: 'All teams get Structure tier benefits'
  },

  club_os_growth: {
    id: 'club_os_growth',
    name: 'Club OS Growth',
    type: 'club',
    capabilities: ['team_management', 'playbook'],
    teamTier: 'team_hq_leadership',
    description: 'All teams get Leadership tier benefits'
  },

  club_os_command: {
    id: 'club_os_command',
    name: 'Club OS Command',
    type: 'club',
    capabilities: ['team_management', 'playbook', 'analytics'],
    teamTier: 'team_hq_activated',
    description: 'All teams get Activated tier benefits'
  }
}

/**
 * All products combined for lookup
 */
export const allProducts: Record<string, ProductDefinition | TeamProduct | ClubProduct> = {
  ...individualProducts,
  ...teamProducts,
  ...clubProducts
}

/**
 * Capability inheritance rules
 */
export const capabilityHierarchy: Record<Capability, number> = {
  // Academy hierarchy (higher numbers include lower)
  full_academy: 3,
  basic_academy: 2,
  limited_drills: 1,
  drills: 1,
  workouts: 1,
  
  // Coach features (independent)
  practice_planner: 1,
  resources: 1,
  custom_content: 1,
  training: 1,
  
  // Team features (independent)
  team_management: 1,
  roster: 1,
  playbook: 1,
  analytics: 1,
  
  // Basic
  platform_access: 1
}

/**
 * Get effective capabilities for a product
 * Handles inheritance (e.g., full_academy includes basic_academy)
 */
export function getEffectiveCapabilities(product: ProductDefinition): Capability[] {
  const capabilities = new Set<Capability>(product.capabilities)
  
  // Add inherited capabilities
  product.capabilities.forEach(capability => {
    const level = capabilityHierarchy[capability]
    Object.entries(capabilityHierarchy).forEach(([cap, capLevel]) => {
      if (capability.includes('academy') && cap.includes('academy') && level > capLevel) {
        capabilities.add(cap as Capability)
      }
    })
  })
  
  // Remove excluded capabilities
  if (product.excludes) {
    product.excludes.forEach(excluded => capabilities.delete(excluded))
  }
  
  return Array.from(capabilities)
}

/**
 * Check if a user has a specific capability based on their products
 */
export function hasCapability(userProducts: string[], capability: Capability): boolean {
  return userProducts.some(productId => {
    const product = allProducts[productId]
    if (!product) return false
    
    const effectiveCapabilities = getEffectiveCapabilities(product)
    return effectiveCapabilities.includes(capability)
  })
}

/**
 * Get the highest academy tier for a user
 */
export function getAcademyTier(userProducts: string[]): 'full' | 'basic' | 'limited' | 'none' {
  if (hasCapability(userProducts, 'full_academy')) return 'full'
  if (hasCapability(userProducts, 'basic_academy')) return 'basic'
  if (hasCapability(userProducts, 'limited_drills')) return 'limited'
  return 'none'
}

/**
 * Product display helpers
 */
export function getProductDisplayName(productId: string): string {
  const product = allProducts[productId]
  return product?.name || productId
}

export function getProductType(productId: string): ProductType | null {
  const product = allProducts[productId]
  return product?.type || null
}

export function isTeamProduct(productId: string): boolean {
  return teamProducts.hasOwnProperty(productId)
}

export function isClubProduct(productId: string): boolean {
  return clubProducts.hasOwnProperty(productId)
}

/**
 * Team player limit helpers
 */
export function getPlayerLimit(productId: string): number | null {
  const product = allProducts[productId] as TeamProduct
  return product?.playerLimit || null
}

export function getTeamPlayerProduct(teamProductId: string): string | null {
  const teamProduct = teamProducts[teamProductId]
  return teamProduct?.playerProduct || null
}

export function getTeamCoachProduct(teamProductId: string): string | null {
  const teamProduct = teamProducts[teamProductId]
  return teamProduct?.coachProduct || null
}