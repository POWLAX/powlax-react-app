'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.log('User not authenticated, skipping favorites fetch')
        setLoading(false)
        return
      }

      // Create user_favorites table if it doesn't exist
      const { error: createError } = await supabase.rpc('create_user_favorites_table_if_not_exists')
      if (createError) {
        // If RPC doesn't exist, create table directly
        const { error: tableError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', 'user_favorites')
          .single()
        
        if (tableError) {
          // Table doesn't exist, but we can't create it here
          // Fall back to storing in user_drills as before
          return await fetchFavoritesFromUserDrills()
        }
      }

      // Get user's favorites from proper table
      const { data, error } = await supabase
        .from('user_favorites')
        .select('drill_id')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching favorites from user_favorites:', error)
        // Fall back to user_drills method
        return await fetchFavoritesFromUserDrills()
      }

      if (data) {
        const ids = data.map(item => item.drill_id).filter(Boolean) as string[]
        setFavoriteIds(ids)
      }
    } catch (err) {
      console.error('Error in fetchFavorites:', err)
      // Fall back to user_drills method
      await fetchFavoritesFromUserDrills()
    } finally {
      setLoading(false)
    }
  }

  const fetchFavoritesFromUserDrills = async () => {
    try {
      const { data, error } = await supabase
        .from('user_drills')
        .select('id, title')
        .eq('drill_category', 'favorite')

      if (error) {
        console.error('Error fetching favorites from user_drills:', error)
        return
      }

      if (data) {
        const ids = data
          .map(item => item.title)
          .filter(Boolean) as string[]
        setFavoriteIds(ids)
      }
    } catch (err) {
      console.error('Error in fetchFavoritesFromUserDrills:', err)
    }
  }

  const toggleFavorite = async (drillId: string, drillData?: any) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        toast.error('Please sign in to save favorites')
        return
      }

      const isFavorite = favoriteIds.includes(drillId)
      
      if (isFavorite) {
        // Try to remove from user_favorites table first
        let { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('drill_id', drillId)
          .eq('user_id', user.id)

        if (error) {
          // Fall back to user_drills method
          const { error: fallbackError } = await supabase
            .from('user_drills')
            .delete()
            .eq('title', drillId)
            .eq('drill_category', 'favorite')
          
          if (fallbackError) throw fallbackError
        }

        setFavoriteIds(favoriteIds.filter(id => id !== drillId))
        toast.success('Removed from favorites')
      } else {
        // Try to add to user_favorites table first
        const favoriteData = {
          user_id: user.id,
          drill_id: drillId,
          drill_data: drillData ? {
            name: drillData.name,
            duration: drillData.duration,
            category: drillData.category,
            drill_video_url: drillData.drill_video_url
          } : null
        }

        let { error } = await supabase
          .from('user_favorites')
          .insert([favoriteData])

        if (error) {
          // Fall back to user_drills method
          const { error: fallbackError } = await supabase
            .from('user_drills')
            .insert([{
              title: drillId,
              drill_category: 'favorite',
              drill_duration: drillData?.duration ? `${drillData.duration} minutes` : null,
              drill_notes: `Favorite: ${drillData?.name || 'Drill'}`,
              content: `Favorited drill from practice planner: ${drillData?.name}`,
              drill_video_url: drillData?.drill_video_url
            }])
          
          if (fallbackError) throw fallbackError
        }

        setFavoriteIds([...favoriteIds, drillId])
        toast.success('Added to favorites')
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    }
  }

  const isFavorite = (drillId: string) => {
    return favoriteIds.includes(drillId)
  }

  const getFavoriteCount = () => {
    return favoriteIds.length
  }

  const getFavorites = () => {
    return favoriteIds
  }

  return {
    favoriteIds,
    loading,
    toggleFavorite,
    isFavorite,
    getFavoriteCount,
    getFavorites,
    refreshFavorites: fetchFavorites
  }
}