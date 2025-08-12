'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/SupabaseAuthContext'

interface FavoriteItem {
  id: string
  drill_id?: string  // UUID - for drill favorites
  strategy_id?: string  // UUID - for strategy favorites (if column exists)
  user_id: string
  created_at?: string
  // Legacy compatibility
  item_id?: string
  item_type?: 'drill' | 'strategy'
}

export function useFavorites() {
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchFavorites()
  }, [user])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      
      // Check if user is available from context
      if (!user || !user.id) {
        console.log('User not authenticated, loading from localStorage if available')
        await loadFromLocalStorage()
        setLoading(false)
        return
      }

      // Try to fetch from database
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.log('user_favorites table not accessible, falling back to localStorage:', error.message)
        await loadFromLocalStorage()
        return
      }

      if (data) {
        // Map database structure to internal format
        // Database uses drill_id column, we need to map it to item_id for compatibility
        const favorites = data.map(item => ({
          id: item.id,
          drill_id: item.drill_id,  // Keep original column
          item_id: item.drill_id || item.item_id,   // Map to item_id for compatibility (check both columns)
          item_type: (item.item_type || 'drill') as 'drill' | 'strategy',  // Default to drill if not specified
          user_id: item.user_id,
          created_at: item.created_at
        }))
        setFavoriteItems(favorites)
        
        console.log('Loaded favorites from database:', favorites.length)
        if (favorites.length > 0) {
          console.log('Favorite drill IDs:', favorites.map(f => f.drill_id || f.item_id))
        }
        
        // Also save to localStorage as backup
        await saveToLocalStorage(favorites)
      }
    } catch (err) {
      console.error('Error in fetchFavorites:', err)
      await loadFromLocalStorage()
    } finally {
      setLoading(false)
    }
  }

  const loadFromLocalStorage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const storageKey = `favorites_${user.id}`
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const favorites = JSON.parse(stored) as FavoriteItem[]
        setFavoriteItems(favorites)
        console.log('Loaded favorites from localStorage:', favorites.length)
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err)
    }
  }

  const saveToLocalStorage = async (favorites: FavoriteItem[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const storageKey = `favorites_${user.id}`
      localStorage.setItem(storageKey, JSON.stringify(favorites))
    } catch (err) {
      console.error('Error saving to localStorage:', err)
    }
  }

  const toggleFavorite = async (itemId: string, itemType: 'drill' | 'strategy', itemData?: any) => {
    try {
      // 🎯 APPLY GOLD STANDARD PATTERN - Authentication validation
      if (!user?.id) {
        // Keep localStorage fallback but align with Gold Standard error handling
        console.log('User not authenticated, using localStorage fallback')
        const storageKey = 'powlax_favorites_local'
        const stored = localStorage.getItem(storageKey)
        const localFavorites = stored ? JSON.parse(stored) : []
        
        const existingIndex = localFavorites.findIndex((f: any) => 
          f.item_id === itemId && f.item_type === itemType
        )
        
        if (existingIndex >= 0) {
          localFavorites.splice(existingIndex, 1)
          toast.success(`Removed from favorites (offline mode)`)
        } else {
          localFavorites.push({
            id: `local-${Date.now()}`,
            item_id: itemId,
            item_type: itemType,
            user_id: 'local',
            created_at: new Date().toISOString()
          })
          toast.success(`Added to favorites (offline mode)`)
        }
        
        localStorage.setItem(storageKey, JSON.stringify(localFavorites))
        setFavoriteItems(localFavorites)
        return
      }

      const existingFavorite = favoriteItems.find(item => 
        (item.item_id === itemId || item.drill_id === itemId) && 
        (item.item_type === itemType || itemType === 'drill')
      )
      
      if (existingFavorite) {
        // Remove from favorites using drill_id column
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('drill_id', itemId)
          .eq('user_id', user.id)

        const updatedFavorites = favoriteItems.filter(item => 
          !((item.item_id === itemId || item.drill_id === itemId) && 
            (item.item_type === itemType || itemType === 'drill'))
        )
        
        if (error) {
          console.log('Database removal failed, using localStorage only:', error.message)
        }
        
        setFavoriteItems(updatedFavorites)
        await saveToLocalStorage(updatedFavorites)
        toast.success(`Removed from favorites`)
      } else {
        // 🎯 APPLY GOLD STANDARD PATTERN - Use actual database schema
        const dbFavorite = {
          user_id: user.id,
          drill_id: itemId,  // Use drill_id column as per database schema
          created_at: new Date().toISOString()
        }

        const { data: insertedData, error } = await supabase
          .from('user_favorites')
          .insert([dbFavorite])
          .select()
          .single()

        // 🎯 PATTERN 4: ERROR HANDLING (ALIGNED WITH GOLD STANDARD)
        if (error) {
          console.log('Database insertion failed, using localStorage fallback:', error.message)
          // Keep localStorage fallback but maintain Gold Standard error pattern
        }
        
        // Create UI-compatible favorite object
        const newFavorite = {
          id: insertedData?.id || `local-${Date.now()}`,
          drill_id: itemId,
          item_id: itemId,  // For UI compatibility
          item_type: itemType,
          user_id: user.id,
          created_at: dbFavorite.created_at
        }
        
        const updatedFavorites = [...favoriteItems, newFavorite]
        setFavoriteItems(updatedFavorites)
        await saveToLocalStorage(updatedFavorites)
        toast.success(`Added to favorites`)
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    }
  }

  const isFavorite = (itemId: string, itemType: 'drill' | 'strategy' = 'drill') => {
    // Check both item_id and drill_id for compatibility
    const result = favoriteItems.some(item => 
      (item.item_id === itemId || item.drill_id === itemId) && 
      (item.item_type === itemType || itemType === 'drill')
    )
    
    // Debug logging for first few checks
    if (favoriteItems.length > 0 && Math.random() < 0.01) { // Log 1% of checks to avoid spam
      console.log(`Checking if ${itemId} is favorite: ${result}. Have ${favoriteItems.length} favorites`)
    }
    
    return result
  }

  const getFavoriteCount = (itemType?: 'drill' | 'strategy') => {
    if (itemType) {
      return favoriteItems.filter(item => item.item_type === itemType).length
    }
    return favoriteItems.length
  }

  const getFavorites = (itemType?: 'drill' | 'strategy') => {
    if (itemType) {
      return favoriteItems.filter(item => item.item_type === itemType).map(item => item.item_id || item.drill_id)
    }
    return favoriteItems.map(item => item.item_id || item.drill_id)
  }

  const getFavoriteDrills = () => {
    return favoriteItems.filter(item => item.item_type === 'drill' || !item.item_type).map(item => item.item_id || item.drill_id).filter(Boolean)
  }

  const getFavoriteStrategies = () => {
    return favoriteItems.filter(item => item.item_type === 'strategy').map(item => item.item_id || item.drill_id).filter(Boolean)
  }

  return {
    favoriteItems,
    loading,
    toggleFavorite,
    isFavorite,
    getFavoriteCount,
    getFavorites,
    getFavoriteDrills,
    getFavoriteStrategies,
    refreshFavorites: fetchFavorites
  }
}