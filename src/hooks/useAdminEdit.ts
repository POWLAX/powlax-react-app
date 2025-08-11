'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { canEditDrillsAndStrategies, validateAdminOperation } from '@/lib/adminPermissions'
// UserData type no longer needed with Supabase Auth
import { useAuth } from '@/contexts/SupabaseAuthContext'

/**
 * Admin Edit Hook
 * Handles direct Supabase updates for drills and strategies by admin users
 */

interface DrillData {
  id: string
  title?: string
  content?: string
  video_url?: string
  category?: string
  duration_minutes?: number
  min_players?: number
  max_players?: number
  difficulty_level?: string
  equipment?: string[]
  tags?: string
}

interface StrategyData {
  id: string
  strategy_name?: string
  description?: string
  vimeo_link?: string
  strategy_categories?: string
  see_it_ages?: string
  coach_it_ages?: string
  own_it_ages?: string
  target_audience?: string
}

export function useAdminEdit(providedUser?: UserData | null) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Get user from auth context if not provided
  const { user: authUser } = useAuth()
  const user = providedUser !== undefined ? providedUser : authUser
  
  const isAdmin = canEditDrillsAndStrategies(user)
  
  // Debug logging for admin detection
  if (typeof window !== 'undefined' && user) {
    console.log('Admin Debug:', {
      email: user.email,
      roles: user.roles,
      isAdmin,
      emailMatch: user.email?.toLowerCase() === 'patrick@powlax.com'
    })
  }

  /**
   * Update a drill in the powlax_drills table
   */
  const updateDrill = async (drillId: string, updates: Partial<DrillData>): Promise<boolean> => {
    const validation = validateAdminOperation(user, 'edit')
    if (!validation.allowed) {
      setError(validation.reason || 'Permission denied')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('powlax_drills')
        .update(updates)
        .eq('id', drillId)

      if (updateError) {
        setError(`Failed to update drill: ${updateError.message}`)
        return false
      }

      return true
    } catch (err: any) {
      setError(`Update error: ${err.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update a strategy in the powlax_strategies table
   */
  const updateStrategy = async (strategyId: string, updates: Partial<StrategyData>): Promise<boolean> => {
    const validation = validateAdminOperation(user, 'edit')
    if (!validation.allowed) {
      setError(validation.reason || 'Permission denied')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('powlax_strategies')
        .update(updates)
        .eq('id', strategyId)

      if (updateError) {
        setError(`Failed to update strategy: ${updateError.message}`)
        return false
      }

      return true
    } catch (err: any) {
      setError(`Update error: ${err.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Delete a drill from the powlax_drills table
   */
  const deleteDrill = async (drillId: string): Promise<boolean> => {
    const validation = validateAdminOperation(user, 'delete')
    if (!validation.allowed) {
      setError(validation.reason || 'Permission denied')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('powlax_drills')
        .delete()
        .eq('id', drillId)

      if (deleteError) {
        setError(`Failed to delete drill: ${deleteError.message}`)
        return false
      }

      return true
    } catch (err: any) {
      setError(`Delete error: ${err.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Delete a strategy from the powlax_strategies table
   */
  const deleteStrategy = async (strategyId: string): Promise<boolean> => {
    const validation = validateAdminOperation(user, 'delete')
    if (!validation.allowed) {
      setError(validation.reason || 'Permission denied')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('powlax_strategies')
        .delete()
        .eq('id', strategyId)

      if (deleteError) {
        setError(`Failed to delete strategy: ${deleteError.message}`)
        return false
      }

      return true
    } catch (err: any) {
      setError(`Delete error: ${err.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Create a new drill in the powlax_drills table
   */
  const createDrill = async (drillData: Omit<DrillData, 'id'>): Promise<string | null> => {
    const validation = validateAdminOperation(user, 'edit')
    if (!validation.allowed) {
      setError(validation.reason || 'Permission denied')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from('powlax_drills')
        .insert([drillData])
        .select('id')
        .single()

      if (insertError) {
        setError(`Failed to create drill: ${insertError.message}`)
        return null
      }

      return data.id
    } catch (err: any) {
      setError(`Create error: ${err.message}`)
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Create a new strategy in the powlax_strategies table
   */
  const createStrategy = async (strategyData: Omit<StrategyData, 'id'>): Promise<string | null> => {
    const validation = validateAdminOperation(user, 'edit')
    if (!validation.allowed) {
      setError(validation.reason || 'Permission denied')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from('powlax_strategies')
        .insert([strategyData])
        .select('id')
        .single()

      if (insertError) {
        setError(`Failed to create strategy: ${insertError.message}`)
        return null
      }

      return data.id
    } catch (err: any) {
      setError(`Create error: ${err.message}`)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    loading,
    error,
    isAdmin,

    // Actions
    updateDrill,
    updateStrategy,
    deleteDrill,
    deleteStrategy,
    createDrill,
    createStrategy,

    // Utilities
    clearError: () => setError(null)
  }
}