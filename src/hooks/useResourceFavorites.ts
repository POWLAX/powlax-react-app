'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ResourceFavorite {
  id: string
  user_id: string
  resource_id: string
  resource_type: string
  shared_with_teams: number[]
  shared_with_users: string[]
  tags: string[]
  notes: string
  created_at: string
}

interface ResourceCollection {
  id: string
  owner_id: string
  collection_name: string
  description: string
  resource_ids: string[]
  contributor_ids: string[]
  viewer_teams: number[]
  viewer_clubs: number[]
  tags: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}

export function useResourceFavorites() {
  const [favorites, setFavorites] = useState<ResourceFavorite[]>([])
  const [collections, setCollections] = useState<ResourceCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResourceData()
  }, [])

  const fetchResourceData = async () => {
    try {
      setLoading(true)
      console.log('📚 Fetching resource favorites and collections...')
      
      // Fetch favorites
      const { data: favData, error: favError } = await supabase
        .from('resource_favorites')
        .select('*')
        .order('created_at', { ascending: false })

      if (favError && favError.code !== 'PGRST116') {
        console.log('Note: resource_favorites table may not exist yet')
      } else if (favData) {
        setFavorites(favData.map((fav: any) => ({
          ...fav,
          shared_with_teams: fav.shared_with_teams || [],
          shared_with_users: fav.shared_with_users || [],
          tags: fav.tags || []
        })))
      }

      // Fetch collections
      const { data: collData, error: collError } = await supabase
        .from('resource_collections')
        .select('*')
        .order('created_at', { ascending: false })

      if (collError && collError.code !== 'PGRST116') {
        console.log('Note: resource_collections table may not exist yet')
      } else if (collData) {
        setCollections(collData.map((coll: any) => ({
          ...coll,
          resource_ids: coll.resource_ids || [],
          contributor_ids: coll.contributor_ids || [],
          viewer_teams: coll.viewer_teams || [],
          viewer_clubs: coll.viewer_clubs || [],
          tags: coll.tags || []
        })))
      }

      console.log(`✅ Loaded ${favorites.length} favorites and ${collections.length} collections`)
    } catch (err: any) {
      console.error('Error fetching resource data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (resourceId: string, resourceType: string, options: {
    shareWithTeams: boolean
    shareWithUsers: boolean
    teamIds?: number[]
    userIds?: string[]
    tags?: string[]
    notes?: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Check if already favorited
      const existing = favorites.find(f => f.resource_id === resourceId && f.user_id === user.id)
      
      if (existing) {
        // Remove favorite
        const { error } = await supabase
          .from('resource_favorites')
          .delete()
          .eq('id', existing.id)
        
        if (error) throw error
        console.log('✅ Favorite removed')
      } else {
        // PERMANENCE PATTERN: Transform booleans to arrays
        const { error } = await supabase
          .from('resource_favorites')
          .insert([{
            user_id: user.id,
            resource_id: resourceId,
            resource_type: resourceType,
            shared_with_teams: options.shareWithTeams ? (options.teamIds || []) : [],
            shared_with_users: options.shareWithUsers ? (options.userIds || []) : [],
            tags: options.tags || [],
            notes: options.notes || ''
          }])
        
        if (error) throw error
        console.log('✅ Resource favorited with array transformation')
      }
      
      await fetchResourceData()
    } catch (err: any) {
      console.error('Error toggling favorite:', err)
      setError(err.message)
      throw err
    }
  }

  const createCollection = async (collectionData: {
    name: string
    description: string
    resourceIds: string[]
    allowContributors: boolean
    shareWithTeams: boolean
    shareWithClubs: boolean
    contributorIds?: string[]
    teamIds?: number[]
    clubIds?: number[]
    tags?: string[]
    isPublic: boolean
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // PERMANENCE PATTERN: Transform booleans to arrays
      const { error } = await supabase
        .from('resource_collections')
        .insert([{
          owner_id: user.id,
          collection_name: collectionData.name,
          description: collectionData.description,
          resource_ids: collectionData.resourceIds,
          contributor_ids: collectionData.allowContributors 
            ? (collectionData.contributorIds || []) 
            : [],
          viewer_teams: collectionData.shareWithTeams 
            ? (collectionData.teamIds || []) 
            : [],
          viewer_clubs: collectionData.shareWithClubs 
            ? (collectionData.clubIds || []) 
            : [],
          tags: collectionData.tags || [],
          is_public: collectionData.isPublic
        }])
      
      if (error) throw error
      
      console.log('✅ Collection created with permanence pattern')
      await fetchResourceData()
    } catch (err: any) {
      console.error('Error creating collection:', err)
      setError(err.message)
      throw err
    }
  }

  const updateCollection = async (collectionId: string, updates: {
    allowContributors?: boolean
    shareWithTeams?: boolean
    shareWithClubs?: boolean
    contributorIds?: string[]
    teamIds?: number[]
    clubIds?: number[]
    resourceIds?: string[]
    tags?: string[]
  }) => {
    try {
      const updateData: any = {}
      
      // PERMANENCE PATTERN: Transform sharing options
      if ('allowContributors' in updates) {
        updateData.contributor_ids = updates.allowContributors
          ? (updates.contributorIds || [])
          : []
      }
      
      if ('shareWithTeams' in updates) {
        updateData.viewer_teams = updates.shareWithTeams
          ? (updates.teamIds || [])
          : []
      }
      
      if ('shareWithClubs' in updates) {
        updateData.viewer_clubs = updates.shareWithClubs
          ? (updates.clubIds || [])
          : []
      }
      
      if (updates.resourceIds) updateData.resource_ids = updates.resourceIds
      if (updates.tags) updateData.tags = updates.tags
      
      updateData.updated_at = new Date().toISOString()
      
      const { error } = await supabase
        .from('resource_collections')
        .update(updateData)
        .eq('id', collectionId)
      
      if (error) throw error
      
      console.log('✅ Collection updated with array transformation')
      await fetchResourceData()
    } catch (err: any) {
      console.error('Error updating collection:', err)
      setError(err.message)
      throw err
    }
  }

  return {
    favorites,
    collections,
    loading,
    error,
    toggleFavorite,
    createCollection,
    updateCollection,
    refreshData: fetchResourceData
  }
}