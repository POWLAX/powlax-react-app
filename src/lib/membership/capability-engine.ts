/**
 * POWLAX Membership Capability Engine
 * Core logic for calculating user capabilities, inheritance, and team limits
 * Contract: membership-capability-002.yaml
 */

import { supabase } from '@/lib/supabase'
import { 
  Capability, 
  allProducts, 
  teamProducts, 
  clubProducts,
  getEffectiveCapabilities,
  hasCapability as hasCapabilityByProducts,
  getTeamPlayerProduct,
  getTeamCoachProduct,
  type ProductDefinition,
  type TeamProduct,
  type ClubProduct
} from './product-hierarchy'

// Database types
interface User {
  id: string
  email: string
  display_name?: string
  roles?: string[]
}

interface MembershipEntitlement {
  id: string
  user_id: string
  product_name: string
  status: 'active' | 'inactive' | 'expired' | 'cancelled'
  expires_at?: string
  created_at: string
}

interface TeamMember {
  id: string
  user_id: string
  team_id: number
  role: string
  created_at: string
}

interface Team {
  id: number
  name: string
  club_id?: number
}

interface Club {
  id: number
  name: string
}

interface ParentChildRelationship {
  id: string
  parent_user_id: string
  child_user_id: string
  relationship_type: string
}

// Result types
export interface UserCapabilities {
  userId: string
  capabilities: Capability[]
  products: string[]
  sources: CapabilitySource[]
  academyTier: 'full' | 'basic' | 'limited' | 'none'
  teamLimits?: TeamLimitInfo
}

export interface CapabilitySource {
  type: 'direct' | 'team' | 'club' | 'parent'
  productId: string
  sourceId?: string | number // team_id, club_id, parent_user_id
  sourceName?: string
}

export interface TeamLimitInfo {
  teamId: number
  teamName: string
  playerLimit: number
  currentPlayers: number
  availableSlots: number
  isEligible: boolean
  position?: number // User's position in team (1-25 gets benefits)
}

export class CapabilityEngine {
  /**
   * Get comprehensive capabilities for a user
   * Includes direct purchases, team benefits, club cascading, and parent purchases
   */
  async getUserCapabilities(userId: string): Promise<UserCapabilities> {
    // Get all capability sources in parallel
    const [
      directEntitlements,
      teamBenefits,
      clubBenefits,
      parentPurchases
    ] = await Promise.all([
      this.getDirectEntitlements(userId),
      this.getTeamBenefits(userId),
      this.getClubBenefits(userId),
      this.getParentPurchases(userId)
    ])

    // Combine all sources
    const allSources: CapabilitySource[] = [
      ...directEntitlements.sources,
      ...teamBenefits.sources,
      ...clubBenefits.sources,
      ...parentPurchases.sources
    ]

    // Get unique products
    const allProducts = Array.from(new Set(allSources.map(s => s.productId)))

    // Calculate combined capabilities
    const capabilities = this.calculateCombinedCapabilities(allProducts)

    // Get academy tier
    const academyTier = this.getAcademyTier(allProducts)

    // Get team limit info if user is on a team
    const teamLimits = teamBenefits.teamLimits

    return {
      userId,
      capabilities,
      products: allProducts,
      sources: allSources,
      academyTier,
      teamLimits
    }
  }

  /**
   * Check if user has a specific capability
   */
  async hasCapability(userId: string, capability: Capability): Promise<boolean> {
    const userCaps = await this.getUserCapabilities(userId)
    return userCaps.capabilities.includes(capability)
  }

  /**
   * Get direct membership entitlements for user
   */
  private async getDirectEntitlements(userId: string): Promise<{
    sources: CapabilitySource[]
  }> {
    const { data: entitlements } = await supabase
      .from('membership_entitlements')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')

    const sources: CapabilitySource[] = (entitlements || []).map(ent => ({
      type: 'direct',
      productId: ent.product_name
    }))

    return { sources }
  }

  /**
   * Get team-based benefits for user
   * Includes coach benefits and player benefits (if within first 25)
   */
  private async getTeamBenefits(userId: string): Promise<{
    sources: CapabilitySource[]
    teamLimits?: TeamLimitInfo
  }> {
    // Get user's team memberships
    const { data: teamMemberships } = await supabase
      .from('team_members')
      .select(`
        *,
        teams (
          id,
          name,
          club_id
        )
      `)
      .eq('user_id', userId)

    if (!teamMemberships || teamMemberships.length === 0) {
      return { sources: [] }
    }

    const sources: CapabilitySource[] = []
    let teamLimits: TeamLimitInfo | undefined

    for (const membership of teamMemberships) {
      const team = membership.teams
      if (!team) continue

      // Get team's product entitlement
      const teamProduct = await this.getTeamProduct(team.id)
      if (!teamProduct) continue

      const teamProductDef = teamProducts[teamProduct]
      if (!teamProductDef) continue

      // Add team capabilities
      sources.push({
        type: 'team',
        productId: teamProduct,
        sourceId: team.id,
        sourceName: team.name
      })

      // Check if user gets coach benefits
      if (membership.role === 'coach' || membership.role === 'head_coach') {
        const coachProduct = getTeamCoachProduct(teamProduct)
        if (coachProduct) {
          sources.push({
            type: 'team',
            productId: coachProduct,
            sourceId: team.id,
            sourceName: team.name
          })
        }
      }

      // Check if user gets player benefits (first 25 only)
      if (membership.role === 'player') {
        const playerInfo = await this.getTeamPlayerInfo(team.id, userId)
        
        teamLimits = {
          teamId: team.id,
          teamName: team.name,
          playerLimit: 25,
          currentPlayers: playerInfo.totalPlayers,
          availableSlots: Math.max(0, 25 - playerInfo.totalPlayers),
          isEligible: playerInfo.position <= 25,
          position: playerInfo.position
        }

        if (playerInfo.position <= 25) {
          const playerProduct = getTeamPlayerProduct(teamProduct)
          if (playerProduct) {
            sources.push({
              type: 'team',
              productId: playerProduct,
              sourceId: team.id,
              sourceName: team.name
            })
          }
        }
      }
    }

    return { sources, teamLimits }
  }

  /**
   * Get club cascade benefits for user
   */
  private async getClubBenefits(userId: string): Promise<{
    sources: CapabilitySource[]
  }> {
    // Get user's teams, then find clubs
    const { data: teamMemberships } = await supabase
      .from('team_members')
      .select(`
        *,
        teams (
          id,
          name,
          club_id,
          clubs (
            id,
            name
          )
        )
      `)
      .eq('user_id', userId)

    if (!teamMemberships) return { sources: [] }

    const sources: CapabilitySource[] = []
    const processedClubs = new Set<number>()

    for (const membership of teamMemberships) {
      const team = membership.teams
      if (!team?.club_id || processedClubs.has(team.club_id)) continue
      
      processedClubs.add(team.club_id)

      // Get club's product entitlement
      const clubProduct = await this.getClubProduct(team.club_id)
      if (!clubProduct) continue

      const clubProductDef = clubProducts[clubProduct]
      if (!clubProductDef) continue

      // Add club capabilities (cascade through team tier)
      sources.push({
        type: 'club',
        productId: clubProduct,
        sourceId: team.club_id,
        sourceName: team.clubs?.name
      })

      // Add the team tier that club provides
      sources.push({
        type: 'club',
        productId: clubProductDef.teamTier,
        sourceId: team.club_id,
        sourceName: team.clubs?.name
      })
    }

    return { sources }
  }

  /**
   * Get parent purchase benefits for user (child accounts)
   */
  private async getParentPurchases(userId: string): Promise<{
    sources: CapabilitySource[]
  }> {
    // Get parent-child relationships where this user is the child
    const { data: relationships } = await supabase
      .from('parent_child_relationships')
      .select(`
        *,
        parent_user:users!parent_child_relationships_parent_user_id_fkey (
          id,
          display_name,
          email
        )
      `)
      .eq('child_user_id', userId)

    if (!relationships) return { sources: [] }

    const sources: CapabilitySource[] = []

    for (const relationship of relationships) {
      const parentUser = relationship.parent_user
      if (!parentUser) continue

      // Get parent's entitlements that can be shared with children
      const { data: parentEntitlements } = await supabase
        .from('membership_entitlements')
        .select('*')
        .eq('user_id', parentUser.id)
        .eq('status', 'active')

      if (!parentEntitlements) continue

      // Add sharable products
      for (const entitlement of parentEntitlements) {
        if (this.isShareableProduct(entitlement.product_name)) {
          sources.push({
            type: 'parent',
            productId: entitlement.product_name,
            sourceId: parentUser.id,
            sourceName: parentUser.display_name || parentUser.email
          })
        }
      }
    }

    return { sources }
  }

  /**
   * Get team's current product entitlement
   */
  private async getTeamProduct(teamId: number): Promise<string | null> {
    // This would typically come from a team_entitlements table
    // For now, we'll simulate with a simple lookup
    const { data: entitlements } = await supabase
      .from('membership_entitlements')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'active')
      .limit(1)

    return entitlements?.[0]?.product_name || null
  }

  /**
   * Get club's current product entitlement
   */
  private async getClubProduct(clubId: number): Promise<string | null> {
    // This would typically come from a club_entitlements table
    const { data: entitlements } = await supabase
      .from('membership_entitlements')
      .select('*')
      .eq('club_id', clubId)
      .eq('status', 'active')
      .limit(1)

    return entitlements?.[0]?.product_name || null
  }

  /**
   * Get player position info for team player limits
   */
  private async getTeamPlayerInfo(teamId: number, userId: string): Promise<{
    totalPlayers: number
    position: number
  }> {
    // Get all players ordered by join date
    const { data: players } = await supabase
      .from('team_members')
      .select('user_id, created_at')
      .eq('team_id', teamId)
      .eq('role', 'player')
      .order('created_at', { ascending: true })

    if (!players) return { totalPlayers: 0, position: 0 }

    const userPosition = players.findIndex(p => p.user_id === userId) + 1
    
    return {
      totalPlayers: players.length,
      position: userPosition || players.length + 1
    }
  }

  /**
   * Calculate combined capabilities from multiple products
   */
  private calculateCombinedCapabilities(productIds: string[]): Capability[] {
    const allCapabilities = new Set<Capability>()

    productIds.forEach(productId => {
      const product = allProducts[productId]
      if (product) {
        const capabilities = getEffectiveCapabilities(product)
        capabilities.forEach(cap => allCapabilities.add(cap))
      }
    })

    return Array.from(allCapabilities)
  }

  /**
   * Get academy tier from products
   */
  private getAcademyTier(productIds: string[]): 'full' | 'basic' | 'limited' | 'none' {
    if (hasCapabilityByProducts(productIds, 'full_academy')) return 'full'
    if (hasCapabilityByProducts(productIds, 'basic_academy')) return 'basic'
    if (hasCapabilityByProducts(productIds, 'limited_drills')) return 'limited'
    return 'none'
  }

  /**
   * Check if a product can be shared with children
   */
  private isShareableProduct(productId: string): boolean {
    // Individual academy products can be shared
    return productId.includes('skills_academy')
  }

  /**
   * Bulk capability check for multiple users
   */
  async bulkGetUserCapabilities(userIds: string[]): Promise<UserCapabilities[]> {
    const results = await Promise.all(
      userIds.map(userId => this.getUserCapabilities(userId))
    )
    return results
  }

  /**
   * Get team overview with player limits and benefits
   */
  async getTeamOverview(teamId: number): Promise<{
    team: Team
    playerLimit: number
    currentPlayers: number
    availableSlots: number
    players: Array<{
      userId: string
      displayName?: string
      position: number
      hasAcademyAccess: boolean
    }>
  } | null> {
    // Get team info
    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (!team) return null

    // Get team product
    const teamProduct = await this.getTeamProduct(teamId)
    if (!teamProduct) {
      return {
        team,
        playerLimit: 0,
        currentPlayers: 0,
        availableSlots: 0,
        players: []
      }
    }

    // Get all players
    const { data: players } = await supabase
      .from('team_members')
      .select(`
        user_id,
        created_at,
        users (
          display_name,
          email
        )
      `)
      .eq('team_id', teamId)
      .eq('role', 'player')
      .order('created_at', { ascending: true })

    if (!players) return null

    const playerLimit = 25
    const currentPlayers = players.length

    const playersWithStatus = players.map((player, index) => ({
      userId: player.user_id,
      displayName: player.users?.display_name,
      position: index + 1,
      hasAcademyAccess: index < 25
    }))

    return {
      team,
      playerLimit,
      currentPlayers,
      availableSlots: Math.max(0, playerLimit - currentPlayers),
      players: playersWithStatus
    }
  }
}

// Export singleton instance
export const capabilityEngine = new CapabilityEngine()

// Convenience functions
export async function getUserCapabilities(userId: string): Promise<UserCapabilities> {
  return capabilityEngine.getUserCapabilities(userId)
}

export async function hasCapability(userId: string, capability: Capability): Promise<boolean> {
  return capabilityEngine.hasCapability(userId, capability)
}

export async function getTeamOverview(teamId: number) {
  return capabilityEngine.getTeamOverview(teamId)
}