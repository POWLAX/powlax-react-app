'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface FavoriteItem {
  id: string
  item_id: string
  item_type: 'drill' | 'strategy'
  user_id: string
  created_at?: string
}

export function useFavorites() {
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([])
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
        console.log('User not authenticated, loading from localStorage if available')
        await loadFromLocalStorage()
        setLoading(false)
        return
      }

      // Try to fetch from user_favorites table first
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id, item_id, item_type, user_id, created_at')
        .eq('user_id', user.id)

      if (error) {
        console.log('user_favorites table not accessible, falling back to localStorage:', error.message)
        await loadFromLocalStorage()
        return
      }

      if (data) {
        const favorites = data.map(item => ({
          id: item.id || item.item_id,
          item_id: item.item_id,
          item_type: item.item_type as 'drill' | 'strategy',
          user_id: item.user_id,
          created_at: item.created_at
        }))
        setFavoriteItems(favorites)
        
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
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        toast.error('Please sign in to save favorites')
        return
      }

      const existingFavorite = favoriteItems.find(item => item.item_id === itemId && item.item_type === itemType)
      
      if (existingFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('item_id', itemId)
          .eq('item_type', itemType)
          .eq('user_id', user.id)

        const updatedFavorites = favoriteItems.filter(item => !(item.item_id === itemId && item.item_type === itemType))
        
        if (error) {
          console.log('Database removal failed, using localStorage only:', error.message)
        }
        
        setFavoriteItems(updatedFavorites)
        await saveToLocalStorage(updatedFavorites)
        toast.success(`Removed from favorites`)
      } else {
        // Add to favorites
        const newFavorite: FavoriteItem = {
          id: `${itemType}_${itemId}`,
          item_id: itemId,
          item_type: itemType,
          user_id: user.id,
          created_at: new Date().toISOString()
        }

        const { error } = await supabase
          .from('user_favorites')
          .insert([newFavorite])

        const updatedFavorites = [...favoriteItems, newFavorite]
        
        if (error) {
          console.log('Database insertion failed, using localStorage only:', error.message)
        }
        
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
    return favoriteItems.some(item => item.item_id === itemId && item.item_type === itemType)
  }

  const getFavoriteCount = (itemType?: 'drill' | 'strategy') => {
    if (itemType) {
      return favoriteItems.filter(item => item.item_type === itemType).length
    }
    return favoriteItems.length
  }

  const getFavorites = (itemType?: 'drill' | 'strategy') => {
    if (itemType) {
      return favoriteItems.filter(item => item.item_type === itemType).map(item => item.item_id)
    }
    return favoriteItems.map(item => item.item_id)
  }

  const getFavoriteDrills = () => {
    return favoriteItems.filter(item => item.item_type === 'drill').map(item => item.item_id)
  }

  const getFavoriteStrategies = () => {
    return favoriteItems.filter(item => item.item_type === 'strategy').map(item => item.item_id)
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