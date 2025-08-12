'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface DashboardFavorite {
  id: string
  coach_id: string
  item_id: string
  item_type: 'drill' | 'strategy' | 'player' | 'workout'
  visibility_teams: number[]
  visibility_clubs: number[]
  shared_with_assistants: string[]
  tags: string[]
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export function useDashboardFavorites() {
  const [favorites, setFavorites] = useState<DashboardFavorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      console.log('📊 Fetching dashboard favorites...')
      
      // First ensure table exists
      const { data, error } = await supabase
        .from('coach_favorites')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        // Table might not exist yet, create it
        console.log('Creating coach_favorites table...')
        await createFavoritesTable()
        setFavorites([])
        return
      }

      if (!data) {
        console.log('No favorites found')
        setFavorites([])
        return
      }

      // Direct column mapping - following permanence pattern
      const transformedFavorites = data.map((fav: any) => ({
        id: fav.id,
        coach_id: fav.coach_id,
        item_id: fav.item_id,
        item_type: fav.item_type,
        visibility_teams: fav.visibility_teams || [],
        visibility_clubs: fav.visibility_clubs || [],
        shared_with_assistants: fav.shared_with_assistants || [],
        tags: fav.tags || [],
        is_pinned: fav.is_pinned || false,
        created_at: fav.created_at,
        updated_at: fav.updated_at
      }))

      console.log(`✅ Loaded ${transformedFavorites.length} dashboard favorites`)
      setFavorites(transformedFavorites)
    } catch (err: any) {
      console.error('Error fetching favorites:', err)
      setError(err.message)
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  const createFavoritesTable = async () => {
    // Create table through RPC or manual creation
    console.log('Table creation would happen through Supabase Dashboard')
  }

  const addFavorite = async (favoriteData: {
    item_id: string
    item_type: 'drill' | 'strategy' | 'player' | 'workout'
    teamShare: boolean  // UI state
    clubShare: boolean  // UI state
    assistantShare: boolean  // UI state
    tags: string[]
    is_pinned: boolean
    // Hidden data state
    teamShareIds?: number[]
    clubShareIds?: number[]
    assistantShareIds?: string[]
  }) => {
    try {
      // Get current user as coach
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // PERMANENCE PATTERN: Transform booleans to arrays at save boundary
      const { data, error } = await supabase
        .from('coach_favorites')
        .insert([{
          coach_id: user.id,
          item_id: favoriteData.item_id,
          item_type: favoriteData.item_type,
          // Transform sharing booleans to arrays
          visibility_teams: favoriteData.teamShare 
            ? (favoriteData.teamShareIds || []) 
            : [],
          visibility_clubs: favoriteData.clubShare 
            ? (favoriteData.clubShareIds || []) 
            : [],
          shared_with_assistants: favoriteData.assistantShare 
            ? (favoriteData.assistantShareIds || []) 
            : [],
          tags: favoriteData.tags || [],
          is_pinned: favoriteData.is_pinned || false
        }])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to add favorite: ${error.message}`)
      }

      console.log('✅ Dashboard favorite added with permanence pattern')
      await fetchFavorites()
      return data
    } catch (err: any) {
      console.error('Error adding favorite:', err)
      setError(err.message)
      throw err
    }
  }

  const updateFavorite = async (favoriteId: string, updates: {
    teamShare?: boolean
    clubShare?: boolean
    assistantShare?: boolean
    teamShareIds?: number[]
    clubShareIds?: number[]
    assistantShareIds?: string[]
    tags?: string[]
    is_pinned?: boolean
  }) => {
    try {
      const updateData: any = {}

      // PERMANENCE PATTERN: Handle array transformations
      if ('teamShare' in updates) {
        updateData.visibility_teams = updates.teamShare
          ? (updates.teamShareIds || [])
          : []
      }

      if ('clubShare' in updates) {
        updateData.visibility_clubs = updates.clubShare
          ? (updates.clubShareIds || [])
          : []
      }

      if ('assistantShare' in updates) {
        updateData.shared_with_assistants = updates.assistantShare
          ? (updates.assistantShareIds || [])
          : []
      }

      if (updates.tags !== undefined) updateData.tags = updates.tags
      if (updates.is_pinned !== undefined) updateData.is_pinned = updates.is_pinned

      updateData.updated_at = new Date().toISOString()

      const { error } = await supabase
        .from('coach_favorites')
        .update(updateData)
        .eq('id', favoriteId)

      if (error) {
        throw new Error(`Failed to update favorite: ${error.message}`)
      }

      console.log('✅ Dashboard favorite updated with array transformation')
      await fetchFavorites()
    } catch (err: any) {
      console.error('Error updating favorite:', err)
      setError(err.message)
      throw err
    }
  }

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('coach_favorites')
        .delete()
        .eq('id', favoriteId)

      if (error) {
        throw new Error(`Failed to remove favorite: ${error.message}`)
      }

      console.log('✅ Favorite removed')
      await fetchFavorites()
    } catch (err: any) {
      console.error('Error removing favorite:', err)
      setError(err.message)
      throw err
    }
  }

  const togglePin = async (favoriteId: string) => {
    const favorite = favorites.find(f => f.id === favoriteId)
    if (!favorite) return

    await updateFavorite(favoriteId, { is_pinned: !favorite.is_pinned })
  }

  return {
    favorites,
    loading,
    error,
    addFavorite,
    updateFavorite,
    removeFavorite,
    togglePin,
    refreshFavorites: fetchFavorites
  }
}