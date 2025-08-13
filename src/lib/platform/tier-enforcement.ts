/**
 * Platform Management - Tier Enforcement System
 * 
 * Handles tier-based feature access control for:
 * - Club OS tiers (Foundation, Growth, Command)
 * - Team HQ tiers (Structure, Leadership, Activated)
 * - Coaching Kit tiers (Essentials, Confidence)
 */

export interface ClubTierFeatures {
  foundation: string[]
  growth: string[]
  command: string[]
}

export interface TeamTierFeatures {
  structure: string[]
  leadership: string[]
  activated: string[]
}

export interface CoachingTierFeatures {
  essentials_kit: string[]
  confidence_kit: string[]
}

// Club OS Tier Features
export const CLUB_OS_FEATURES: ClubTierFeatures = {
  foundation: [
    'basic_settings',
    'team_overview',
    'billing_view',
    'basic_support'
  ],
  growth: [
    'basic_settings',
    'team_overview', 
    'billing_view',
    'basic_support',
    'advanced_settings',
    'team_management',
    'analytics',
    'bulk_operations',
    'priority_support'
  ],
  command: [
    'basic_settings',
    'team_overview',
    'billing_view', 
    'basic_support',
    'advanced_settings',
    'team_management',
    'analytics',
    'bulk_operations',
    'priority_support',
    'full_admin',
    'custom_features',
    'api_access',
    'white_label',
    'dedicated_support'
  ]
}

// Team HQ Tier Features
export const TEAM_HQ_FEATURES: TeamTierFeatures = {
  structure: [
    'roster_management',
    'basic_scheduling',
    'basic_communication'
  ],
  leadership: [
    'roster_management',
    'basic_scheduling',
    'basic_communication',
    'playbook_access',
    'advanced_scheduling',
    'parent_communication',
    'team_stats'
  ],
  activated: [
    'roster_management',
    'basic_scheduling',
    'basic_communication',
    'playbook_access',
    'advanced_scheduling',
    'parent_communication',
    'team_stats',
    'full_analytics',
    'custom_playbooks',
    'advanced_features',
    'performance_tracking'
  ]
}

// Coaching Kit Tier Features
export const COACHING_KIT_FEATURES: CoachingTierFeatures = {
  essentials_kit: [
    'practice_planner',
    'basic_resources',
    'drill_library',
    'basic_training'
  ],
  confidence_kit: [
    'practice_planner',
    'basic_resources',
    'drill_library',
    'basic_training',
    'custom_content',
    'advanced_training',
    'personal_coaching',
    'certification_tracking'
  ]
}

// Tier hierarchy for upgrades
export const TIER_HIERARCHY = {
  club_os: ['foundation', 'growth', 'command'],
  team_hq: ['structure', 'leadership', 'activated'],
  coaching_kit: ['essentials_kit', 'confidence_kit']
}

export interface UserMembership {
  userId: string
  clubId?: number
  teamId?: number
  clubTier?: keyof ClubTierFeatures
  teamTier?: keyof TeamTierFeatures
  coachingTier?: keyof CoachingTierFeatures
  isAdmin?: boolean
}

export class TierEnforcementEngine {
  /**
   * Check if user has access to a specific feature based on their membership tiers
   */
  static hasFeatureAccess(
    membership: UserMembership,
    feature: string,
    context: 'club' | 'team' | 'coaching'
  ): boolean {
    // Admin override
    if (membership.isAdmin) {
      return true
    }

    switch (context) {
      case 'club':
        if (!membership.clubTier) return false
        return CLUB_OS_FEATURES[membership.clubTier]?.includes(feature) || false

      case 'team':
        if (!membership.teamTier) return false
        return TEAM_HQ_FEATURES[membership.teamTier]?.includes(feature) || false

      case 'coaching':
        if (!membership.coachingTier) return false
        return COACHING_KIT_FEATURES[membership.coachingTier]?.includes(feature) || false

      default:
        return false
    }
  }

  /**
   * Get all available features for a user's current tier
   */
  static getAvailableFeatures(
    membership: UserMembership,
    context: 'club' | 'team' | 'coaching'
  ): string[] {
    if (membership.isAdmin) {
      // Admin gets all features
      switch (context) {
        case 'club':
          return CLUB_OS_FEATURES.command
        case 'team':
          return TEAM_HQ_FEATURES.activated
        case 'coaching':
          return COACHING_KIT_FEATURES.confidence_kit
      }
    }

    switch (context) {
      case 'club':
        return membership.clubTier ? CLUB_OS_FEATURES[membership.clubTier] : []
      case 'team':
        return membership.teamTier ? TEAM_HQ_FEATURES[membership.teamTier] : []
      case 'coaching':
        return membership.coachingTier ? COACHING_KIT_FEATURES[membership.coachingTier] : []
      default:
        return []
    }
  }

  /**
   * Get features available in the next tier (for upgrade prompts)
   */
  static getNextTierFeatures(
    membership: UserMembership,
    context: 'club' | 'team' | 'coaching'
  ): { tier: string; features: string[] } | null {
    const currentFeatures = this.getAvailableFeatures(membership, context)
    
    switch (context) {
      case 'club': {
        const currentTier = membership.clubTier
        if (currentTier === 'foundation') {
          return {
            tier: 'growth',
            features: CLUB_OS_FEATURES.growth.filter(f => !currentFeatures.includes(f))
          }
        }
        if (currentTier === 'growth') {
          return {
            tier: 'command',
            features: CLUB_OS_FEATURES.command.filter(f => !currentFeatures.includes(f))
          }
        }
        return null
      }
      
      case 'team': {
        const currentTier = membership.teamTier
        if (currentTier === 'structure') {
          return {
            tier: 'leadership',
            features: TEAM_HQ_FEATURES.leadership.filter(f => !currentFeatures.includes(f))
          }
        }
        if (currentTier === 'leadership') {
          return {
            tier: 'activated',
            features: TEAM_HQ_FEATURES.activated.filter(f => !currentFeatures.includes(f))
          }
        }
        return null
      }
      
      case 'coaching': {
        const currentTier = membership.coachingTier
        if (currentTier === 'essentials_kit') {
          return {
            tier: 'confidence_kit',
            features: COACHING_KIT_FEATURES.confidence_kit.filter(f => !currentFeatures.includes(f))
          }
        }
        return null
      }
      
      default:
        return null
    }
  }

  /**
   * Check if feature requires upgrade and return upgrade info
   */
  static getUpgradeInfo(
    membership: UserMembership,
    feature: string,
    context: 'club' | 'team' | 'coaching'
  ): { requiresUpgrade: boolean; tier?: string } {
    const hasAccess = this.hasFeatureAccess(membership, feature, context)
    
    if (hasAccess) {
      return { requiresUpgrade: false }
    }

    // Find which tier has this feature
    switch (context) {
      case 'club':
        for (const [tier, features] of Object.entries(CLUB_OS_FEATURES)) {
          if (features.includes(feature)) {
            return { requiresUpgrade: true, tier }
          }
        }
        break
        
      case 'team':
        for (const [tier, features] of Object.entries(TEAM_HQ_FEATURES)) {
          if (features.includes(feature)) {
            return { requiresUpgrade: true, tier }
          }
        }
        break
        
      case 'coaching':
        for (const [tier, features] of Object.entries(COACHING_KIT_FEATURES)) {
          if (features.includes(feature)) {
            return { requiresUpgrade: true, tier }
          }
        }
        break
    }
    
    return { requiresUpgrade: true }
  }

  /**
   * Check team academy access limits (25 players per team)
   */
  static checkTeamAcademyLimit(teamSize: number): {
    withinLimit: boolean
    remaining: number
    limit: number
  } {
    const ACADEMY_LIMIT = 25
    return {
      withinLimit: teamSize <= ACADEMY_LIMIT,
      remaining: Math.max(0, ACADEMY_LIMIT - teamSize),
      limit: ACADEMY_LIMIT
    }
  }

  /**
   * Format tier name for display
   */
  static formatTierName(tier: string): string {
    const tierMap: Record<string, string> = {
      foundation: 'Club OS Foundation',
      growth: 'Club OS Growth',
      command: 'Club OS Command',
      structure: 'Team Structure',
      leadership: 'Team Leadership', 
      activated: 'Team Activated',
      essentials_kit: 'Coach Essentials Kit',
      confidence_kit: 'Coach Confidence Kit'
    }
    
    return tierMap[tier] || tier
  }

  /**
   * Get tier badge color for UI display
   */
  static getTierBadgeColor(tier: string): string {
    const colorMap: Record<string, string> = {
      foundation: 'bg-gray-100 text-gray-800',
      growth: 'bg-blue-100 text-blue-800',
      command: 'bg-purple-100 text-purple-800',
      structure: 'bg-green-100 text-green-800',
      leadership: 'bg-orange-100 text-orange-800',
      activated: 'bg-red-100 text-red-800',
      essentials_kit: 'bg-yellow-100 text-yellow-800',
      confidence_kit: 'bg-indigo-100 text-indigo-800'
    }
    
    return colorMap[tier] || 'bg-gray-100 text-gray-800'
  }
}