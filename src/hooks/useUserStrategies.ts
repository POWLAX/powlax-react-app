'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UserStrategy {
  id: string
  user_id: string
  strategy_name: string
  strategy_categories?: string
  description?: string
  lacrosse_lab_links?: any
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
  team_share?: number[]
  club_share?: number[]
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

      // Transform user_strategies data
      const transformedStrategies = data.map((strategy: any) => ({
        id: strategy.id?.toString(),
        user_id: strategy.user_id,
        strategy_name: strategy.strategy_name,
        strategy_categories: strategy.strategy_categories,
        description: strategy.description,
        lacrosse_lab_links: strategy.lacrosse_lab_links,
        embed_codes: strategy.embed_codes,
        see_it_ages: strategy.see_it_ages,
        coach_it_ages: strategy.coach_it_ages,
        own_it_ages: strategy.own_it_ages,
        has_pdf: strategy.has_pdf || false,
        target_audience: strategy.target_audience,
        lesson_category: strategy.lesson_category,
        master_pdf_url: strategy.master_pdf_url,
        vimeo_id: strategy.vimeo_id,
        vimeo_link: strategy.vimeo_link,
        pdf_shortcode: strategy.pdf_shortcode,
        thumbnail_urls: strategy.thumbnail_urls,
        team_share: strategy.team_share || [],
        club_share: strategy.club_share || [],
        is_public: strategy.is_public || false,
        created_at: strategy.created_at,
        updated_at: strategy.updated_at
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

  const createUserStrategy = async (strategyData: Partial<UserStrategy>) => {
    try {
      const { data, error } = await supabase
        .from('user_strategies')
        .insert([{
          strategy_name: strategyData.strategy_name || 'New Strategy',
          description: strategyData.description,
          strategy_categories: strategyData.strategy_categories,
          target_audience: strategyData.target_audience,
          lesson_category: strategyData.lesson_category,
          vimeo_link: strategyData.vimeo_link,
          master_pdf_url: strategyData.master_pdf_url,
          has_pdf: strategyData.has_pdf || false,
          is_public: strategyData.is_public || false
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
      const { error } = await supabase
        .from('user_strategies')
        .update({
          strategy_name: updates.strategy_name,
          description: updates.description,
          strategy_categories: updates.strategy_categories,
          target_audience: updates.target_audience,
          lesson_category: updates.lesson_category,
          vimeo_link: updates.vimeo_link,
          master_pdf_url: updates.master_pdf_url,
          has_pdf: updates.has_pdf,
          is_public: updates.is_public
        })
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