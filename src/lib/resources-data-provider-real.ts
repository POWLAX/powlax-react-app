/**
 * Resources Data Provider - REAL DATA ONLY
 * 
 * NO MOCK DATA POLICY: This provider only fetches real data from Supabase
 * Test data should be in the database, marked with "(MOCK)" prefix
 * 
 * Run scripts/seed-resources-database.ts to populate test data
 */

import { supabase } from '@/lib/supabase'

// Resource type definition matching database schema
export interface Resource {
  id: string
  title: string
  description: string
  category: string
  resource_type: 'video' | 'pdf' | 'template' | 'link'
  url: string
  thumbnail_url?: string
  file_size?: number
  duration_seconds?: number
  age_groups?: string[]
  roles?: string[]
  team_restrictions?: number[]
  club_restrictions?: number[]
  rating?: number
  views_count?: number
  downloads_count?: number
  tags?: string[]
  is_premium?: boolean
  is_public?: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
}

// User interaction type
export interface ResourceInteraction {
  id: string
  user_id: string
  resource_id: string
  collection_ids?: string[]
  shared_with_teams?: number[]
  shared_with_users?: string[]
  is_favorite: boolean
  rating?: number
  notes?: string
  custom_tags?: string[]
  last_viewed?: string
  view_count?: number
  download_count?: number
  created_at?: string
  updated_at?: string
}

// Resource collection type
export interface ResourceCollection {
  id: string
  user_id: string
  name: string
  description?: string
  icon?: string
  color?: string
  shared_with_teams?: number[]
  shared_with_users?: string[]
  shared_with_clubs?: number[]
  is_public?: boolean
  parent_collection_id?: string
  created_at?: string
  updated_at?: string
}

class ResourcesDataProvider {
  /**
   * Get all public resources or resources accessible to the user
   * NO MOCK DATA - only returns what's in the database
   */
  async getResources(userId?: string): Promise<Resource[]> {
    try {
      let query = supabase
        .from('powlax_resources')
        .select('*')
        .order('created_at', { ascending: false })

      // If no user, only get public resources
      if (!userId) {
        query = query.eq('is_public', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching resources:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch resources:', error)
      return []
    }
  }

  /**
   * Get resources for a specific role
   * Filters by the roles array column
   */
  async getResourcesForRole(role: string): Promise<Resource[]> {
    try {
      const { data, error } = await supabase
        .from('powlax_resources')
        .select('*')
        .contains('roles', [role])
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching resources for role:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch resources for role:', error)
      return []
    }
  }

  /**
   * Get resources by category
   */
  async getResourcesByCategory(category: string): Promise<Resource[]> {
    try {
      const { data, error } = await supabase
        .from('powlax_resources')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching resources by category:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch resources by category:', error)
      return []
    }
  }

  /**
   * Get user's favorite resources
   */
  async getUserFavorites(userId: string): Promise<Resource[]> {
    try {
      // First get user's interactions where is_favorite = true
      const { data: interactions, error: interactionError } = await supabase
        .from('user_resource_interactions')
        .select('resource_id')
        .eq('user_id', userId)
        .eq('is_favorite', true)

      if (interactionError) {
        console.error('Error fetching user favorites:', interactionError)
        return []
      }

      if (!interactions || interactions.length === 0) {
        return []
      }

      // Then get the actual resources
      const resourceIds = interactions.map(i => i.resource_id)
      const { data: resources, error: resourceError } = await supabase
        .from('powlax_resources')
        .select('*')
        .in('id', resourceIds)

      if (resourceError) {
        console.error('Error fetching favorite resources:', resourceError)
        return []
      }

      return resources || []
    } catch (error) {
      console.error('Failed to fetch user favorites:', error)
      return []
    }
  }

  /**
   * Get recently viewed resources for a user
   */
  async getRecentlyViewed(userId: string, limit: number = 10): Promise<Resource[]> {
    try {
      // Get user's interactions ordered by last_viewed
      const { data: interactions, error: interactionError } = await supabase
        .from('user_resource_interactions')
        .select('resource_id, last_viewed')
        .eq('user_id', userId)
        .not('last_viewed', 'is', null)
        .order('last_viewed', { ascending: false })
        .limit(limit)

      if (interactionError) {
        console.error('Error fetching recently viewed:', interactionError)
        return []
      }

      if (!interactions || interactions.length === 0) {
        return []
      }

      // Get the actual resources
      const resourceIds = interactions.map(i => i.resource_id)
      const { data: resources, error: resourceError } = await supabase
        .from('powlax_resources')
        .select('*')
        .in('id', resourceIds)

      if (resourceError) {
        console.error('Error fetching recent resources:', resourceError)
        return []
      }

      // Sort resources to match the order from interactions
      const sortedResources = resourceIds
        .map(id => resources?.find(r => r.id === id))
        .filter(Boolean) as Resource[]

      return sortedResources
    } catch (error) {
      console.error('Failed to fetch recently viewed:', error)
      return []
    }
  }

  /**
   * Track a resource view
   */
  async trackView(resourceId: string, userId?: string): Promise<void> {
    try {
      // Update the resource view count
      const { error: resourceError } = await supabase.rpc('increment_resource_views', {
        resource_id: resourceId
      })

      if (resourceError) {
        console.error('Error incrementing view count:', resourceError)
      }

      // If user is logged in, update their interaction
      if (userId) {
        const { data: existing } = await supabase
          .from('user_resource_interactions')
          .select('id, view_count')
          .eq('user_id', userId)
          .eq('resource_id', resourceId)
          .single()

        if (existing) {
          // Update existing interaction
          await supabase
            .from('user_resource_interactions')
            .update({
              last_viewed: new Date().toISOString(),
              view_count: (existing.view_count || 0) + 1
            })
            .eq('id', existing.id)
        } else {
          // Create new interaction
          await supabase
            .from('user_resource_interactions')
            .insert([{
              user_id: userId,
              resource_id: resourceId,
              last_viewed: new Date().toISOString(),
              view_count: 1,
              is_favorite: false,
              shared_with_teams: [],
              shared_with_users: [],
              collection_ids: []
            }])
        }
      }
    } catch (error) {
      console.error('Failed to track view:', error)
    }
  }

  /**
   * Track a resource download
   */
  async trackDownload(resourceId: string, userId?: string): Promise<void> {
    try {
      // Update the resource download count
      const { error: resourceError } = await supabase.rpc('increment_resource_downloads', {
        resource_id: resourceId
      })

      if (resourceError) {
        console.error('Error incrementing download count:', resourceError)
      }

      // If user is logged in, update their interaction
      if (userId) {
        const { data: existing } = await supabase
          .from('user_resource_interactions')
          .select('id, download_count')
          .eq('user_id', userId)
          .eq('resource_id', resourceId)
          .single()

        if (existing) {
          // Update existing interaction
          await supabase
            .from('user_resource_interactions')
            .update({
              download_count: (existing.download_count || 0) + 1
            })
            .eq('id', existing.id)
        } else {
          // Create new interaction
          await supabase
            .from('user_resource_interactions')
            .insert([{
              user_id: userId,
              resource_id: resourceId,
              download_count: 1,
              is_favorite: false,
              shared_with_teams: [],
              shared_with_users: [],
              collection_ids: []
            }])
        }
      }
    } catch (error) {
      console.error('Failed to track download:', error)
    }
  }

  /**
   * Get resource categories
   * Returns unique categories from the database
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('powlax_resources')
        .select('category')
        .order('category')

      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }

      // Get unique categories
      const categories = [...new Set(data?.map(r => r.category) || [])]
      return categories
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      return []
    }
  }

  /**
   * Search resources
   */
  async searchResources(query: string): Promise<Resource[]> {
    try {
      const { data, error } = await supabase
        .from('powlax_resources')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching resources:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to search resources:', error)
      return []
    }
  }
}

// Export singleton instance
export const resourceDataProvider = new ResourcesDataProvider()

// Re-export types for convenience
export type { Resource, ResourceInteraction, ResourceCollection }