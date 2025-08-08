'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Interface for both POWLAX and user strategies
export interface Strategy {
  id: string
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
  created_at?: string
  updated_at?: string
  // User strategy specific fields
  user_id?: string
  team_share?: number[]
  club_share?: number[]
  is_public?: boolean
  // Source indicator
  source: 'powlax' | 'user'
}

// Game phases for organizing strategies
export const GAME_PHASES = [
  'Pre-Game Warm-Up',
  'Face-Off',
  'Offensive Transition',
  'Settled Offense',
  'Defensive Transition', 
  'Settled Defense',
  'Clears',
  'Rides',
  'Special Situations',
  'Ground Ball',
  '1v1',
  'Team Play',
  'Communication'
] as const

export function useStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllStrategies()
  }, [])

  const fetchAllStrategies = async () => {
    try {
      setLoading(true)
      console.log('Fetching strategies from both powlax_strategies and user_strategies tables...')
      
      // Fetch POWLAX official strategies
      const { data: powlaxData, error: powlaxError } = await supabase
        .from('powlax_strategies')
        .select('*')
        .order('strategy_name')

      if (powlaxError) {
        console.error('Error fetching POWLAX strategies:', powlaxError)
      }

      // Fetch user strategies (only ones user has access to)
      const { data: userData, error: userError } = await supabase
        .from('user_strategies')
        .select('*')
        .order('created_at', { ascending: false })

      if (userError) {
        console.error('Error fetching user strategies:', userError)
      }

      // Transform and combine both data sources
      const transformedStrategies: Strategy[] = []

      // Add POWLAX strategies
      if (powlaxData && powlaxData.length > 0) {
        const powlaxStrategies = powlaxData.map((strategy: any) => ({
          id: strategy.id?.toString(),
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
          created_at: strategy.created_at,
          updated_at: strategy.updated_at,
          source: 'powlax' as const
        }))
        transformedStrategies.push(...powlaxStrategies)
      }

      // Add user strategies
      if (userData && userData.length > 0) {
        const userStrategies = userData.map((strategy: any) => ({
          id: `user-${strategy.id}`, // Prefix to avoid ID conflicts
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
          updated_at: strategy.updated_at,
          source: 'user' as const
        }))
        transformedStrategies.push(...userStrategies)
      }

      console.log(`Loaded ${transformedStrategies.length} total strategies (${powlaxData?.length || 0} POWLAX + ${userData?.length || 0} user)`)
      setStrategies(transformedStrategies)
    } catch (err: any) {
      console.error('Error fetching strategies:', err)
      setError(err.message)
      setStrategies([])
    } finally {
      setLoading(false)
    }
  }

  const refreshStrategies = () => {
    fetchAllStrategies()
  }

  return {
    strategies,
    loading,
    error,
    refreshStrategies
  }
}

// Helper function to organize strategies by game phase
export function getStrategiesByGamePhase(strategies: Strategy[]) {
  return GAME_PHASES.map(phase => ({
    phase,
    strategies: strategies.filter(strategy => {
      const categories = strategy.strategy_categories?.toLowerCase() || ''
      const lessonCategory = strategy.lesson_category?.toLowerCase() || ''
      const description = strategy.description?.toLowerCase() || ''
      const name = strategy.strategy_name?.toLowerCase() || ''
      
      const phaseKeywords = getPhaseKeywords(phase)
      return phaseKeywords.some(keyword => 
        categories.includes(keyword) || 
        lessonCategory.includes(keyword) ||
        description.includes(keyword) ||
        name.includes(keyword)
      )
    })
  })).filter(group => group.strategies.length > 0) // Only return phases with strategies
}

// Helper function to get keywords for each game phase
function getPhaseKeywords(phase: string): string[] {
  const keywordMap: Record<string, string[]> = {
    'Pre-Game Warm-Up': ['warm up', 'warmup', 'pre-game', 'preparation'],
    'Face-Off': ['face-off', 'faceoff', 'face off', 'center', 'wing'],
    'Offensive Transition': ['offensive transition', 'fast break', 'transition offense', 'quick stick'],
    'Settled Offense': ['settled offense', 'offensive set', '6v6 offense', 'half court offense'],
    'Defensive Transition': ['defensive transition', 'transition defense', 'slide package'],
    'Settled Defense': ['settled defense', 'defensive set', '6v6 defense', 'half court defense'],
    'Clears': ['clear', 'clearing', 'break out'],
    'Rides': ['ride', 'riding', 'pressure'],
    'Special Situations': ['man up', 'man down', 'extra man', 'penalty', 'special'],
    'Ground Ball': ['ground ball', 'groundball', 'loose ball'],
    '1v1': ['1v1', '1 v 1', 'one on one', '1-on-1', 'dodge'],
    'Team Play': ['team', 'communication', 'unit'],
    'Communication': ['communication', 'talk', 'call', 'voice']
  }
  
  return keywordMap[phase] || [phase.toLowerCase()]
}

// Helper function to filter strategies by source
export function getStrategiesBySource(strategies: Strategy[], source: 'powlax' | 'user') {
  return strategies.filter(strategy => strategy.source === source)
}

// Helper function to search strategies
export function searchStrategies(strategies: Strategy[], searchTerm: string): Strategy[] {
  if (!searchTerm.trim()) return strategies
  
  const term = searchTerm.toLowerCase()
  return strategies.filter(strategy => 
    strategy.strategy_name.toLowerCase().includes(term) ||
    strategy.description?.toLowerCase().includes(term) ||
    strategy.strategy_categories?.toLowerCase().includes(term) ||
    strategy.target_audience?.toLowerCase().includes(term)
  )
}