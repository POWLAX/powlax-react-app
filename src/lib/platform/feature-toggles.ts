/**
 * Platform Management - Feature Toggle System
 * 
 * Dynamic feature management system that allows enabling/disabling features
 * based on tier memberships and administrative controls
 */

import { supabase } from '@/lib/supabase'

export interface FeatureFlag {
  id: string
  name: string
  description: string
  enabled: boolean
  required_tiers: string[]
  rollout_percentage?: number
  target_users?: string[]
  created_at: string
  updated_at: string
}

export interface FeatureMatrix {
  [featureId: string]: {
    enabled: boolean
    tiers: string[]
    rollout: number
    description: string
  }
}

export interface UserFeatureAccess {
  userId: string
  featureId: string
  hasAccess: boolean
  reason: 'tier' | 'rollout' | 'target' | 'disabled'
  timestamp: string
}

// Default feature definitions
export const DEFAULT_FEATURES: Record<string, Partial<FeatureFlag>> = {
  // Club OS Features
  'club_basic_settings': {
    name: 'Basic Club Settings',
    description: 'Club profile and basic configuration options',
    enabled: true,
    required_tiers: ['club_os_foundation', 'club_os_growth', 'club_os_command']
  },
  'club_advanced_settings': {
    name: 'Advanced Club Settings', 
    description: 'Custom branding, integrations, and advanced options',
    enabled: true,
    required_tiers: ['club_os_growth', 'club_os_command']
  },
  'club_team_management': {
    name: 'Club Team Management',
    description: 'Manage multiple teams within club hierarchy',
    enabled: true,
    required_tiers: ['club_os_growth', 'club_os_command']
  },
  'club_analytics': {
    name: 'Club Analytics Dashboard',
    description: 'Usage metrics and performance insights for clubs',
    enabled: true,
    required_tiers: ['club_os_growth', 'club_os_command']
  },
  'club_bulk_operations': {
    name: 'Club Bulk Operations',
    description: 'Multi-team updates and bulk management tools',
    enabled: true,
    required_tiers: ['club_os_growth', 'club_os_command']
  },
  'club_api_access': {
    name: 'Club API Access',
    description: 'Custom integrations and data export capabilities',
    enabled: true,
    required_tiers: ['club_os_command']
  },
  'club_white_label': {
    name: 'Club White Label',
    description: 'Custom branding and domain hosting',
    enabled: true,
    required_tiers: ['club_os_command']
  },

  // Team HQ Features
  'team_roster_management': {
    name: 'Team Roster Management',
    description: 'Add, remove, and organize team members',
    enabled: true,
    required_tiers: ['team_hq_structure', 'team_hq_leadership', 'team_hq_activated']
  },
  'team_basic_scheduling': {
    name: 'Team Basic Scheduling',
    description: 'Practice and game scheduling tools',
    enabled: true,
    required_tiers: ['team_hq_structure', 'team_hq_leadership', 'team_hq_activated']
  },
  'team_playbook_access': {
    name: 'Team Playbook Access',
    description: 'Access to team playbooks and strategies',
    enabled: true,
    required_tiers: ['team_hq_leadership', 'team_hq_activated']
  },
  'team_advanced_scheduling': {
    name: 'Team Advanced Scheduling',
    description: 'Recurring events and complex scheduling options',
    enabled: true,
    required_tiers: ['team_hq_leadership', 'team_hq_activated']
  },
  'team_parent_communication': {
    name: 'Team Parent Communication',
    description: 'Automated parent updates and notifications',
    enabled: true,
    required_tiers: ['team_hq_leadership', 'team_hq_activated']
  },
  'team_stats': {
    name: 'Team Statistics',
    description: 'Basic team performance metrics',
    enabled: true,
    required_tiers: ['team_hq_leadership', 'team_hq_activated']
  },
  'team_full_analytics': {
    name: 'Team Full Analytics',
    description: 'Comprehensive team performance analytics',
    enabled: true,
    required_tiers: ['team_hq_activated']
  },
  'team_custom_playbooks': {
    name: 'Team Custom Playbooks',
    description: 'Create and customize team-specific playbooks',
    enabled: true,
    required_tiers: ['team_hq_activated']
  },

  // Coaching Kit Features
  'coach_practice_planner': {
    name: 'Coach Practice Planner',
    description: 'Practice planning and drill management',
    enabled: true,
    required_tiers: ['coach_essentials_kit', 'coach_confidence_kit']
  },
  'coach_basic_resources': {
    name: 'Coach Basic Resources',
    description: 'Access to coaching resources and materials',
    enabled: true,
    required_tiers: ['coach_essentials_kit', 'coach_confidence_kit']
  },
  'coach_custom_content': {
    name: 'Coach Custom Content',
    description: 'Create and share custom coaching content',
    enabled: true,
    required_tiers: ['coach_confidence_kit']
  },
  'coach_advanced_training': {
    name: 'Coach Advanced Training',
    description: 'Advanced coaching techniques and methodologies',
    enabled: true,
    required_tiers: ['coach_confidence_kit']
  },
  'coach_personal_coaching': {
    name: 'Coach Personal Coaching',
    description: 'One-on-one coaching support and mentorship',
    enabled: true,
    required_tiers: ['coach_confidence_kit']
  }
}

export class FeatureToggleManager {
  private static instance: FeatureToggleManager
  private featureCache: Map<string, FeatureFlag> = new Map()
  private cacheExpiry: number = 5 * 60 * 1000 // 5 minutes
  private lastCacheUpdate: number = 0

  static getInstance(): FeatureToggleManager {
    if (!FeatureToggleManager.instance) {
      FeatureToggleManager.instance = new FeatureToggleManager()
    }
    return FeatureToggleManager.instance
  }

  /**
   * Check if a user has access to a specific feature
   */
  async checkFeatureAccess(
    userId: string,
    featureId: string,
    userTiers: string[] = []
  ): Promise<UserFeatureAccess> {
    try {
      const feature = await this.getFeature(featureId)
      
      if (!feature) {
        return {
          userId,
          featureId,
          hasAccess: false,
          reason: 'disabled',
          timestamp: new Date().toISOString()
        }
      }

      // Check if feature is globally disabled
      if (!feature.enabled) {
        return {
          userId,
          featureId,
          hasAccess: false,
          reason: 'disabled',
          timestamp: new Date().toISOString()
        }
      }

      // Check tier access
      const hasTierAccess = feature.required_tiers.some(tier => userTiers.includes(tier))
      
      if (!hasTierAccess) {
        return {
          userId,
          featureId,
          hasAccess: false,
          reason: 'tier',
          timestamp: new Date().toISOString()
        }
      }

      // Check if user is specifically targeted
      if (feature.target_users && feature.target_users.length > 0) {
        const isTargeted = feature.target_users.includes(userId)
        return {
          userId,
          featureId,
          hasAccess: isTargeted,
          reason: isTargeted ? 'target' : 'disabled',
          timestamp: new Date().toISOString()
        }
      }

      // Check rollout percentage
      if (feature.rollout_percentage && feature.rollout_percentage < 100) {
        const userHash = this.hashUserId(userId, featureId)
        const isInRollout = userHash < feature.rollout_percentage
        
        return {
          userId,
          featureId,
          hasAccess: isInRollout,
          reason: isInRollout ? 'rollout' : 'rollout',
          timestamp: new Date().toISOString()
        }
      }

      // Full access
      return {
        userId,
        featureId,
        hasAccess: true,
        reason: 'tier',
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('Error checking feature access:', error)
      return {
        userId,
        featureId,
        hasAccess: false,
        reason: 'disabled',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Get feature by ID, with caching
   */
  async getFeature(featureId: string): Promise<FeatureFlag | null> {
    // Check cache first
    if (this.isValidCache() && this.featureCache.has(featureId)) {
      return this.featureCache.get(featureId) || null
    }

    // Load from database or use default
    const feature = await this.loadFeatureFromDatabase(featureId)
    
    if (feature) {
      this.featureCache.set(featureId, feature)
    }

    return feature
  }

  /**
   * Get all features
   */
  async getFeatureMatrix(): Promise<FeatureMatrix> {
    const matrix: FeatureMatrix = {}

    // Get all feature IDs from defaults and database
    const allFeatureIds = new Set([
      ...Object.keys(DEFAULT_FEATURES),
      ...Array.from(this.featureCache.keys())
    ])

    for (const featureId of allFeatureIds) {
      const feature = await this.getFeature(featureId)
      
      if (feature) {
        matrix[featureId] = {
          enabled: feature.enabled,
          tiers: feature.required_tiers,
          rollout: feature.rollout_percentage || 100,
          description: feature.description
        }
      }
    }

    return matrix
  }

  /**
   * Enable a feature for specific tiers
   */
  async enableFeature(
    featureId: string,
    requiredTiers: string[],
    rolloutPercentage: number = 100,
    targetUsers: string[] = []
  ): Promise<void> {
    try {
      const feature: FeatureFlag = {
        id: featureId,
        name: DEFAULT_FEATURES[featureId]?.name || featureId,
        description: DEFAULT_FEATURES[featureId]?.description || '',
        enabled: true,
        required_tiers: requiredTiers,
        rollout_percentage: rolloutPercentage,
        target_users: targetUsers.length > 0 ? targetUsers : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // In a real implementation, this would save to database
      // For now, update cache
      this.featureCache.set(featureId, feature)

      console.log(`Feature ${featureId} enabled for tiers:`, requiredTiers)

    } catch (error) {
      console.error('Error enabling feature:', error)
      throw error
    }
  }

  /**
   * Disable a feature globally
   */
  async disableFeature(featureId: string): Promise<void> {
    try {
      const existingFeature = await this.getFeature(featureId)
      
      if (existingFeature) {
        const disabledFeature: FeatureFlag = {
          ...existingFeature,
          enabled: false,
          updated_at: new Date().toISOString()
        }

        // In a real implementation, this would update database
        // For now, update cache
        this.featureCache.set(featureId, disabledFeature)

        console.log(`Feature ${featureId} disabled`)
      }

    } catch (error) {
      console.error('Error disabling feature:', error)
      throw error
    }
  }

  /**
   * Update feature rollout percentage
   */
  async updateFeatureRollout(featureId: string, percentage: number): Promise<void> {
    try {
      const existingFeature = await this.getFeature(featureId)
      
      if (existingFeature) {
        const updatedFeature: FeatureFlag = {
          ...existingFeature,
          rollout_percentage: Math.max(0, Math.min(100, percentage)),
          updated_at: new Date().toISOString()
        }

        this.featureCache.set(featureId, updatedFeature)

        console.log(`Feature ${featureId} rollout updated to ${percentage}%`)
      }

    } catch (error) {
      console.error('Error updating feature rollout:', error)
      throw error
    }
  }

  /**
   * Set target users for a feature
   */
  async setFeatureTargetUsers(featureId: string, userIds: string[]): Promise<void> {
    try {
      const existingFeature = await this.getFeature(featureId)
      
      if (existingFeature) {
        const updatedFeature: FeatureFlag = {
          ...existingFeature,
          target_users: userIds.length > 0 ? userIds : undefined,
          updated_at: new Date().toISOString()
        }

        this.featureCache.set(featureId, updatedFeature)

        console.log(`Feature ${featureId} target users updated:`, userIds)
      }

    } catch (error) {
      console.error('Error setting feature target users:', error)
      throw error
    }
  }

  /**
   * Clear feature cache
   */
  clearCache(): void {
    this.featureCache.clear()
    this.lastCacheUpdate = 0
  }

  /**
   * Initialize default features
   */
  async initializeDefaultFeatures(): Promise<void> {
    for (const [featureId, featureData] of Object.entries(DEFAULT_FEATURES)) {
      const feature: FeatureFlag = {
        id: featureId,
        name: featureData.name || featureId,
        description: featureData.description || '',
        enabled: featureData.enabled ?? true,
        required_tiers: featureData.required_tiers || [],
        rollout_percentage: featureData.rollout_percentage || 100,
        target_users: featureData.target_users,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      this.featureCache.set(featureId, feature)
    }

    this.lastCacheUpdate = Date.now()
  }

  private async loadFeatureFromDatabase(featureId: string): Promise<FeatureFlag | null> {
    try {
      // In a real implementation, this would query the feature_flags table
      // For now, return from defaults if available
      const defaultFeature = DEFAULT_FEATURES[featureId]
      
      if (defaultFeature) {
        return {
          id: featureId,
          name: defaultFeature.name || featureId,
          description: defaultFeature.description || '',
          enabled: defaultFeature.enabled ?? true,
          required_tiers: defaultFeature.required_tiers || [],
          rollout_percentage: defaultFeature.rollout_percentage || 100,
          target_users: defaultFeature.target_users,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      return null

    } catch (error) {
      console.error('Error loading feature from database:', error)
      return null
    }
  }

  private isValidCache(): boolean {
    return Date.now() - this.lastCacheUpdate < this.cacheExpiry
  }

  private hashUserId(userId: string, featureId: string): number {
    // Simple hash function for consistent rollout distribution
    const combined = `${userId}-${featureId}`
    let hash = 0
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash) % 100
  }
}

// Singleton instance
export const featureToggleManager = FeatureToggleManager.getInstance()

// Convenience functions
export async function checkFeatureAccess(
  userId: string,
  featureId: string,
  userTiers: string[] = []
): Promise<boolean> {
  const access = await featureToggleManager.checkFeatureAccess(userId, featureId, userTiers)
  return access.hasAccess
}

export async function getFeatureMatrix(): Promise<FeatureMatrix> {
  return featureToggleManager.getFeatureMatrix()
}

export async function initializeFeatures(): Promise<void> {
  await featureToggleManager.initializeDefaultFeatures()
}