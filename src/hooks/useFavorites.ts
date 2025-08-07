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
      
      // Get user's favorite drills - we'll store favorites as user_drills entries
      // with a special category of 'favorite' and reference to the original drill
      const { data, error } = await supabase
        .from('user_drills')
        .select('id, title')
        .eq('drill_category', 'favorite')

      if (error) {
        console.error('Error fetching favorites:', error)
        return
      }

      if (data) {
        const ids = data
          .map(item => item.title) // Use title to store the original drill ID
          .filter(Boolean) as string[]
        setFavoriteIds(ids)
      }
    } catch (err) {
      console.error('Error in fetchFavorites:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (drillId: string, drillData?: any) => {
    try {
      const isFavorite = favoriteIds.includes(drillId)
      
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_drills')
          .delete()
          .eq('title', drillId) // Using title field to store drill ID
          .eq('drill_category', 'favorite')

        if (error) throw error

        setFavoriteIds(favoriteIds.filter(id => id !== drillId))
        toast.success('Removed from favorites')
      } else {
        // Add to favorites by creating a user_drill entry
        const { error } = await supabase
          .from('user_drills')
          .insert([{
            title: drillId, // Store drill ID in title field for lookup
            drill_category: 'favorite',
            drill_duration: drillData?.duration ? `${drillData.duration} minutes` : null,
            drill_notes: `Favorite: ${drillData?.name || 'Drill'}`,
            content: `Favorited drill from practice planner: ${drillData?.name}`,
            drill_video_url: drillData?.drill_video_url
          }])

        if (error) throw error

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

  return {
    favoriteIds,
    loading,
    toggleFavorite,
    isFavorite,
    getFavoriteCount,
    refreshFavorites: fetchFavorites
  }
}