'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { toast } from 'sonner'

// Types matching our new database schema with permanence pattern
interface ResourceInteraction {
  id: string
  user_id: string
  resource_id: string
  collection_ids: string[]
  shared_with_teams: number[]
  shared_with_users: string[]
  is_favorite: boolean
  is_downloaded: boolean
  is_completed: boolean
  rating?: number
  notes?: string
  custom_tags: string[]
  progress_percentage: number
  last_position_seconds?: number
  last_viewed?: string
  view_count: number
  download_count: number
  total_time_seconds: number
  created_at: string
  updated_at: string
  completed_at?: string
}

interface ResourceCollection {
  id: string
  user_id: string
  name: string
  description?: string
  icon?: string
  color?: string
  shared_with_teams: number[]
  shared_with_users: string[]
  shared_with_clubs: number[]
  parent_collection_id?: string
  path?: string
  depth: number
  is_public: boolean
  is_system: boolean
  is_active: boolean
  resource_count: number
  total_size_bytes: number
  created_at: string
  updated_at: string
  last_accessed?: string
  sort_order: number
  settings: any
}

export function useResourceFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<ResourceInteraction[]>([])
  const [collections, setCollections] = useState<ResourceCollection[]>([])
  const [loading, setLoading] = useState(false)
  
  // CRITICAL: Separate UI state from data state (permanence pattern)
  const [shareWithTeams, setShareWithTeams] = useState(false) // UI checkbox
  const [teamIds, setTeamIds] = useState<number[]>([]) // Actual IDs
  const [shareWithUsers, setShareWithUsers] = useState(false) // UI checkbox
  const [userIds, setUserIds] = useState<string[]>([]) // Actual IDs

  // Load user's teams on mount
  useEffect(() => {
    if (user?.id) {
      loadUserTeams()
      loadFavorites()
      loadCollections()
    }
  }, [user?.id])

  const loadUserTeams = async () => {
    if (!user?.id) return
    
    try {
      const { data: teams } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
      
      if (teams) {
        const teamIdList = teams.map(t => t.team_id)
        setTeamIds(teamIdList)
      }
    } catch (error) {
      console.error('Error loading user teams:', error)
    }
  }

  const loadFavorites = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_resource_interactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_favorite', true)
        .order('updated_at', { ascending: false })
      
      if (error) {
        console.log('Resources tables not yet created:', error.message)
        return
      }
      
      if (data) {
        setFavorites(data)
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCollections = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('resource_collections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      
      if (error) {
        console.log('Collections table not yet created:', error.message)
        return
      }
      
      if (data) {
        setCollections(data)
      }
    } catch (error) {
      console.error('Error loading collections:', error)
    }
  }

  /**
   * Toggle favorite status - PERMANENCE PATTERN IMPLEMENTATION
   */
  const toggleFavorite = useCallback(async (
    resourceId: string,
    resourceType: string = 'resource',
    options?: {
      shareWithTeams?: boolean
      shareWithUsers?: boolean
      teamIds?: number[]
      userIds?: string[]
      tags?: string[]
      notes?: string
    }
  ) => {
    if (!user?.id) {
      toast.error('Please log in to save favorites')
      return false
    }
    
    try {
      // CRITICAL: Transform booleans to arrays at save boundary
      const saveData = {
        user_id: user.id,
        resource_id: resourceId,
        is_favorite: true,
        
        // PERMANENCE PATTERN: Convert UI booleans to database arrays
        shared_with_teams: options?.shareWithTeams && options?.teamIds 
          ? options.teamIds 
          : [],
        shared_with_users: options?.shareWithUsers && options?.userIds
          ? options.userIds
          : [],
        collection_ids: [],
        custom_tags: options?.tags || [],
        notes: options?.notes || '',
        last_viewed: new Date().toISOString(),
        view_count: 1
      }
      
      // Check for existing interaction
      const { data: existing } = await supabase
        .from('user_resource_interactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('resource_id', resourceId)
        .single()
      
      if (existing) {
        // UPDATE: Preserve existing arrays when not explicitly changing
        const updateData = {
          is_favorite: !existing.is_favorite,
          
          // CRITICAL: Preserve existing arrays if not changing sharing
          shared_with_teams: options?.shareWithTeams !== undefined
            ? saveData.shared_with_teams
            : existing.shared_with_teams || [],
          shared_with_users: options?.shareWithUsers !== undefined
            ? saveData.shared_with_users
            : existing.shared_with_users || [],
          custom_tags: options?.tags !== undefined
            ? saveData.custom_tags
            : existing.custom_tags || [],
          notes: options?.notes !== undefined
            ? saveData.notes
            : existing.notes,
          
          last_viewed: new Date().toISOString(),
          view_count: (existing.view_count || 0) + 1
        }
        
        const { error } = await supabase
          .from('user_resource_interactions')
          .update(updateData)
          .eq('id', existing.id)
        
        if (error) {
          console.error('Error updating favorite:', error)
          toast.error('Failed to update favorite')
          return false
        }
        
        // Update local state
        if (!existing.is_favorite) {
          setFavorites(prev => [...prev, { ...existing, ...updateData }])
          toast.success('Added to favorites')
        } else {
          setFavorites(prev => prev.filter(f => f.id !== existing.id))
          toast.success('Removed from favorites')
        }
      } else {
        // CREATE: New interaction with arrays from the start
        const { data: newInteraction, error } = await supabase
          .from('user_resource_interactions')
          .insert([saveData])
          .select()
          .single()
        
        if (error) {
          console.error('Error creating favorite:', error)
          toast.error('Failed to add favorite')
          return false
        }
        
        if (newInteraction) {
          setFavorites(prev => [...prev, newInteraction])
          toast.success('Added to favorites')
        }
      }
      
      return true
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('An unexpected error occurred')
      return false
    }
  }, [user?.id])

  /**
   * Create a new collection with permanence pattern
   */
  const createCollection = useCallback(async (
    name: string,
    description?: string,
    options?: {
      icon?: string
      color?: string
      shareWithTeams?: boolean
      shareWithUsers?: boolean
      teamIds?: number[]
      userIds?: string[]
    }
  ) => {
    if (!user?.id) {
      toast.error('Please log in to create collections')
      return null
    }
    
    try {
      // PERMANENCE PATTERN: Arrays for sharing
      const collectionData = {
        user_id: user.id,
        name,
        description,
        icon: options?.icon || 'folder',
        color: options?.color || '#3B82F6',
        
        // Transform booleans to arrays
        shared_with_teams: options?.shareWithTeams && options?.teamIds
          ? options.teamIds
          : [],
        shared_with_users: options?.shareWithUsers && options?.userIds
          ? options.userIds
          : [],
        shared_with_clubs: [],
        
        is_public: false,
        is_system: false,
        is_active: true,
        resource_count: 0,
        total_size_bytes: 0,
        sort_order: collections.length
      }
      
      const { data, error } = await supabase
        .from('resource_collections')
        .insert([collectionData])
        .select()
        .single()
      
      if (error) {
        console.error('Error creating collection:', error)
        toast.error('Failed to create collection')
        return null
      }
      
      if (data) {
        setCollections(prev => [...prev, data])
        toast.success(`Created collection "${name}"`)
        return data
      }
      
      return null
    } catch (error) {
      console.error('Error creating collection:', error)
      toast.error('An unexpected error occurred')
      return null
    }
  }, [user?.id, collections.length])

  /**
   * Check if a resource is favorited
   */
  const isFavorite = useCallback((resourceId: string): boolean => {
    return favorites.some(f => f.resource_id === resourceId && f.is_favorite)
  }, [favorites])
  
  /**
   * Track resource view
   */
  const trackView = useCallback(async (resourceId: string) => {
    if (!user?.id) return
    
    try {
      const { data: existing } = await supabase
        .from('user_resource_interactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('resource_id', resourceId)
        .single()
      
      if (existing) {
        await supabase
          .from('user_resource_interactions')
          .update({
            view_count: (existing.view_count || 0) + 1,
            last_viewed: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('user_resource_interactions')
          .insert([{
            user_id: user.id,
            resource_id: resourceId,
            view_count: 1,
            last_viewed: new Date().toISOString(),
            is_favorite: false,
            shared_with_teams: [],
            shared_with_users: [],
            collection_ids: [],
            custom_tags: []
          }])
      }
      
      // Also increment resource view count
      await supabase.rpc('increment_resource_views', { resource_id: resourceId })
    } catch (error) {
      console.error('Error tracking view:', error)
    }
  }, [user?.id])

  return {
    // Data
    favorites,
    collections,
    loading,
    
    // UI State (for checkboxes)
    shareWithTeams,
    setShareWithTeams,
    teamIds,
    setTeamIds,
    shareWithUsers,
    setShareWithUsers,
    userIds,
    setUserIds,
    
    // Actions
    toggleFavorite,
    isFavorite,
    createCollection,
    trackView,
    
    // Refresh functions
    refresh: () => {
      loadFavorites()
      loadCollections()
    }
  }
}