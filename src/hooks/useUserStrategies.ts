'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UserStrategy {
  id: string
  user_id: string
  strategy_name: string
  content?: string // PRIMARY FIELD - stores all structured data
  strategy_categories?: string
  description?: string
  lacrosse_lab_links?: string[]
  embed_codes?: any
  see_it_ages?: string
  coach_it_ages?: string
  own_it_ages?: string
  has_pdf?: boolean
  target_audience?: string
  lesson_category?: string
  master_pdf_url?: string
  vimeo_id?: number
  vimeo_link?: string
  pdf_shortcode?: string
  thumbnail_urls?: any
  team_share?: boolean | number[]
  club_share?: boolean | number[]
  is_public?: boolean
  created_at?: string
  updated_at?: string
}

export function useUserStrategies() {
  const [userStrategies, setUserStrategies] = useState<UserStrategy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserStrategies()
  }, [])

  const fetchUserStrategies = async () => {
    try {
      setLoading(true)
      console.log('Fetching user strategies...')
      
      const { data, error } = await supabase
        .from('user_strategies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error fetching user strategies:', error)
        throw new Error(`Failed to fetch user strategies: ${error.message}`)
      }

      if (!data) {
        console.log('No user strategies found')
        setUserStrategies([])
        return
      }

      // Transform user_strategies data - all fields are directly available in the table!
      const transformedStrategies = data.map((strategy: any) => ({
        // All fields directly from database
        id: strategy.id?.toString(),
        user_id: strategy.user_id,
        strategy_name: strategy.strategy_name,
        description: strategy.description || strategy.strategy_name,
        strategy_categories: strategy.strategy_categories || strategy.lesson_category,
        lesson_category: strategy.lesson_category,
        lacrosse_lab_links: strategy.lacrosse_lab_links || [],
        vimeo_link: strategy.vimeo_link,
        target_audience: strategy.target_audience,
        see_it_ages: strategy.see_it_ages,
        coach_it_ages: strategy.coach_it_ages,
        own_it_ages: strategy.own_it_ages,
        is_public: strategy.is_public || false,
        team_share: Array.isArray(strategy.team_share) ? strategy.team_share : [],
        club_share: Array.isArray(strategy.club_share) ? strategy.club_share : [],
        created_at: strategy.created_at,
        updated_at: strategy.updated_at,
        
        // Legacy/optional fields
        content: strategy.content,
        embed_codes: strategy.embed_codes,
        has_pdf: strategy.has_pdf || false,
        master_pdf_url: strategy.master_pdf_url,
        vimeo_id: strategy.vimeo_id,
        pdf_shortcode: strategy.pdf_shortcode,
        thumbnail_urls: strategy.thumbnail_urls
      }))

      console.log(`Loaded ${transformedStrategies.length} user strategies`)
      setUserStrategies(transformedStrategies)
    } catch (err: any) {
      console.error('Error fetching user strategies:', err)
      setError(err.message)
      setUserStrategies([])
    } finally {
      setLoading(false)
    }
  }

  const createUserStrategy = async (strategyData: any) => {
    try {
      // The user_strategies table supports ALL the fields we need!
      // Based on our test script verification, we can save all strategy details
      
      const { data, error } = await supabase
        .from('user_strategies')
        .insert([{
          user_id: strategyData.user_id,
          strategy_name: strategyData.strategy_name,
          description: strategyData.description || null,
          strategy_categories: strategyData.lesson_category || strategyData.strategy_categories || null,
          lesson_category: strategyData.lesson_category || null,
          vimeo_link: strategyData.vimeo_link || null,
          lacrosse_lab_links: strategyData.lacrosse_lab_links || null,
          target_audience: strategyData.target_audience || null,
          see_it_ages: strategyData.see_it_ages || null,
          coach_it_ages: strategyData.coach_it_ages || null,
          own_it_ages: strategyData.own_it_ages || null,
          is_public: strategyData.is_public || false,
          team_share: Array.isArray(strategyData.team_share) ? strategyData.team_share : [],
          club_share: Array.isArray(strategyData.club_share) ? strategyData.club_share : []
        }])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create strategy: ${error.message}`)
      }

      // Refresh the strategy list
      await fetchUserStrategies()
      return data
    } catch (err: any) {
      console.error('Error creating user strategy:', err)
      setError(err.message)
      throw err
    }
  }

  const updateUserStrategy = async (strategyId: string, updates: Partial<UserStrategy>) => {
    try {
      // Update all fields directly in the database
      const updateData: any = {}
      
      // Only include fields that are being updated
      if (updates.strategy_name !== undefined) updateData.strategy_name = updates.strategy_name
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.strategy_categories !== undefined) updateData.strategy_categories = updates.strategy_categories
      if (updates.lesson_category !== undefined) updateData.lesson_category = updates.lesson_category
      if (updates.vimeo_link !== undefined) updateData.vimeo_link = updates.vimeo_link
      if (updates.lacrosse_lab_links !== undefined) updateData.lacrosse_lab_links = updates.lacrosse_lab_links
      if (updates.target_audience !== undefined) updateData.target_audience = updates.target_audience
      if (updates.see_it_ages !== undefined) updateData.see_it_ages = updates.see_it_ages
      if (updates.coach_it_ages !== undefined) updateData.coach_it_ages = updates.coach_it_ages
      if (updates.own_it_ages !== undefined) updateData.own_it_ages = updates.own_it_ages
      if (updates.is_public !== undefined) updateData.is_public = updates.is_public
      if (updates.team_share !== undefined) updateData.team_share = updates.team_share
      if (updates.club_share !== undefined) updateData.club_share = updates.club_share
      
      // Also set updated_at timestamp
      updateData.updated_at = new Date().toISOString()

      const { error } = await supabase
        .from('user_strategies')
        .update(updateData)
        .eq('id', strategyId)

      if (error) {
        throw new Error(`Failed to update strategy: ${error.message}`)
      }

      // Refresh the strategy list
      await fetchUserStrategies()
    } catch (err: any) {
      console.error('Error updating user strategy:', err)
      setError(err.message)
      throw err
    }
  }

  const deleteUserStrategy = async (strategyId: string) => {
    try {
      const { error } = await supabase
        .from('user_strategies')
        .delete()
        .eq('id', strategyId)

      if (error) {
        throw new Error(`Failed to delete strategy: ${error.message}`)
      }

      // Refresh the strategy list
      await fetchUserStrategies()
    } catch (err: any) {
      console.error('Error deleting user strategy:', err)
      setError(err.message)
      throw err
    }
  }

  const shareWithTeams = async (strategyId: string, teamIds: number[]) => {
    try {
      const { data, error } = await supabase.rpc('share_strategy_with_teams', {
        strategy_id: parseInt(strategyId),
        team_ids: teamIds
      })

      if (error) {
        throw new Error(`Failed to share strategy: ${error.message}`)
      }

      await fetchUserStrategies()
      return data
    } catch (err: any) {
      console.error('Error sharing strategy with teams:', err)
      setError(err.message)
      throw err
    }
  }

  const shareWithClubs = async (strategyId: string, clubIds: number[]) => {
    try {
      const { data, error } = await supabase.rpc('share_strategy_with_clubs', {
        strategy_id: parseInt(strategyId),
        club_ids: clubIds
      })

      if (error) {
        throw new Error(`Failed to share strategy: ${error.message}`)
      }

      await fetchUserStrategies()
      return data
    } catch (err: any) {
      console.error('Error sharing strategy with clubs:', err)
      setError(err.message)
      throw err
    }
  }

  const refreshStrategies = () => {
    fetchUserStrategies()
  }

  return {
    userStrategies,
    loading,
    error,
    createUserStrategy,
    updateUserStrategy,
    deleteUserStrategy,
    shareWithTeams,
    shareWithClubs,
    refreshStrategies
  }
}

// No longer need helper functions to extract from content field
// All data is stored directly in database columns!

// Helper function to get strategies organized by game phases
export function getStrategiesByGamePhase(strategies: UserStrategy[]) {
  const gamePhases = [
    'Pre-Game Warm-Up',
    'Face-Off',
    'Offensive Transition',
    'Settled Offense',
    'Defensive Transition', 
    'Settled Defense',
    'Clears',
    'Rides',
    'Special Situations'
  ]

  return gamePhases.map(phase => ({
    phase,
    strategies: strategies.filter(strategy => 
      strategy.strategy_categories?.toLowerCase().includes(phase.toLowerCase()) ||
      strategy.lesson_category?.toLowerCase().includes(phase.toLowerCase())
    )
  }))
}