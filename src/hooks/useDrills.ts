'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Drill {
  id: string
  drill_id?: string
  name: string
  duration: number
  category: string
  subcategory?: string
  strategies?: string[]
  concepts?: string[]
  skills?: string[]
  skill_ids?: string[]
  concept_ids?: string[]
  game_phase_ids?: string[]
  videoUrl?: string
  drill_video_url?: string
  drill_lab_url_1?: string
  drill_lab_url_2?: string
  drill_lab_url_3?: string
  intensity_level?: string
  min_players?: number
  max_players?: number
  equipment_needed?: string[]
  notes?: string
  // Source indicator
  source: 'powlax' | 'user'
  user_id?: string
  is_public?: boolean
  team_share?: number[]
  club_share?: number[]
}

// No more mock data - we fetch from real database

export function useDrills() {
  const [drills, setDrills] = useState<Drill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDrills()
  }, [])

  const fetchDrills = async () => {
    try {
      setLoading(true)
      
      // Add a network safety timeout (10s) to avoid indefinite loading UI
      const withTimeout = <T,>(promise: Promise<T>, ms = 10000): Promise<T> => {
        return new Promise((resolve, reject) => {
          const id = setTimeout(() => reject(new Error('timeout')), ms)
          promise
            .then((value) => { clearTimeout(id); resolve(value) })
            .catch((err) => { clearTimeout(id); reject(err) })
        })
      }
      
      // Fetch both POWLAX drills and user drills in parallel with timeout
      const [powlaxResponse, userResponse] = await Promise.allSettled([
        withTimeout(
          supabase
            .from('powlax_drills')
            .select('*')
            .order('title')
            .limit(500)
        ),
        withTimeout(
          supabase
            .from('user_drills')
            .select('*')
            .order('created_at', { ascending: false })
        )
      ])

      let powlaxDrills: any[] = []
      let userDrills: any[] = []
      let hasErrors = false
      let errorMessages: string[] = []

      // Process POWLAX drills response
      if (powlaxResponse.status === 'fulfilled') {
        if (powlaxResponse.value.error) {
          errorMessages.push(`POWLAX drills: ${powlaxResponse.value.error.message}`)
          hasErrors = true
        } else {
          powlaxDrills = powlaxResponse.value.data || []
        }
      } else {
        errorMessages.push(`POWLAX drills: ${powlaxResponse.reason}`)
        hasErrors = true
      }

      // Process user drills response
      if (userResponse.status === 'fulfilled') {
        if (!userResponse.value.error) {
          userDrills = userResponse.value.data || []
        }
      }

      // Transform POWLAX drills (mapping actual database columns)
      const transformedPowlaxDrills = powlaxDrills.map((drill: any) => ({
        id: drill.id?.toString() || `powlax-drill-${Date.now()}`,
        drill_id: drill.id?.toString(),
        name: drill.title || 'Unnamed Drill',
        duration: drill.duration_minutes || 10,
        category: drill.category || 'Uncategorized', // Use the actual category from database
        subcategory: drill.category,
        drill_types: drill.tags || drill.category,
        
        // Extract strategies, concepts, and skills from drill data
        strategies: extractStrategiesFromDrill(drill),
        concepts: extractConceptsFromGameStates(parseArrayField(drill.game_states)),
        skills: extractSkillsFromCategory(drill.category || drill.tags || ''),
        skill_ids: extractSkillsFromCategory(drill.category || drill.tags || ''),
        concept_ids: extractConceptsFromGameStates(parseArrayField(drill.game_states)),
        game_phase_ids: parseArrayField(drill.game_states),
        
        // Video and media URLs
        videoUrl: drill.video_url,
        drill_video_url: drill.video_url,
        vimeo_url: drill.video_url,
        custom_url: drill.custom_url,
        
        // Metadata extracted from drill fields
        intensity_level: drill.difficulty_level,
        min_players: drill.min_players,
        max_players: drill.max_players,
        equipment_needed: parseArrayField(drill.equipment),
        space_needed: drill.space_needed,
        
        // Coaching information
        coach_instructions: drill.content || drill.notes || '',
        notes: drill.notes || '',
        content: drill.content,
        
        // Additional drill metadata
        game_states: drill.game_states,
        status: drill.status,
        tags: drill.tags,
        
        // Lacrosse Lab URLs
        lab_urls: drill.lab_urls || drill.lacrosse_lab_urls,
        lacrosse_lab_urls: drill.lacrosse_lab_urls,
        
        // Source indicator
        source: 'powlax' as const
      }))

      // Transform user drills
      const transformedUserDrills = userDrills.map((drill: any) => ({
        id: `user-${drill.id}`,
        drill_id: drill.id?.toString(),
        name: drill.name || drill.title || 'Unnamed Custom Drill',
        duration: parseDuration(drill.drill_duration) || 10,
        category: 'Custom Drills', // User drills always go in Custom Drills category
        subcategory: drill.drill_category,
        drill_types: drill.drill_types,
        
        // Extract strategies, concepts, and skills from drill data
        strategies: extractStrategiesFromDrill(drill),
        concepts: extractConceptsFromGameStates(parseArrayField(drill.game_states)),
        skills: extractSkillsFromCategory(drill.drill_category || drill.drill_types || ''),
        skill_ids: extractSkillsFromCategory(drill.drill_category || drill.drill_types || ''),
        concept_ids: extractConceptsFromGameStates(parseArrayField(drill.game_states)),
        game_phase_ids: parseArrayField(drill.game_phase),
        
        // Video and media URLs
        videoUrl: drill.vimeo_url,
        drill_video_url: drill.drill_video_url,
        vimeo_url: drill.vimeo_url,
        featured_image: drill.featured_image,
        
        // Metadata extracted from drill fields
        intensity_level: drill.drill_emphasis,
        min_players: parseNumber(drill.do_it_ages),
        max_players: parseNumber(drill.own_it_ages),
        equipment_needed: parseArrayField(drill.drill_types),
        
        // Coaching information
        coach_instructions: drill.content || drill.drill_notes || '',
        notes: drill.drill_notes || drill.content || '',
        content: drill.content,
        
        // Age-appropriate information
        do_it_ages: drill.do_it_ages,
        coach_it_ages: drill.coach_it_ages,
        own_it_ages: drill.own_it_ages,
        
        // Additional drill metadata
        game_states: drill.game_states,
        drill_emphasis: drill.drill_emphasis,
        game_phase: drill.game_phase,
        status: drill.status,
        
        // Source indicator and user-specific fields
        source: 'user' as const,
        user_id: drill.user_id,
        is_public: drill.is_public,
        team_share: drill.team_share || [],
        club_share: drill.club_share || []
      }))

      // Combine both drill sources
      const allDrills = [...transformedPowlaxDrills, ...transformedUserDrills]
      
      // Sort combined drills: user drills first, then POWLAX drills
      allDrills.sort((a, b) => {
        if (a.source !== b.source) {
          return a.source === 'user' ? -1 : 1
        }
        return a.name.localeCompare(b.name)
      })

      setDrills(allDrills)
      
      // Set error only if POWLAX drills failed (user drills failure is not critical)
      if (hasErrors && powlaxDrills.length === 0) {
        setError(errorMessages.join('; '))
      } else {
        setError(null)
      }
    } catch (err: any) {
      setError(err?.message === 'timeout' ? 'Timed out loading drills. Please check your connection and Supabase env settings.' : (err?.message || 'Failed to load drills'))
      setDrills([])
    } finally {
      setLoading(false)
    }
  }

  const refreshDrills = () => {
    fetchDrills()
  }

  return { 
    drills, 
    loading, 
    error, 
    refreshDrills,
    // Helper functions to identify drill types
    getPowlaxDrills: () => drills.filter(drill => drill.source === 'powlax'),
    getUserDrills: () => drills.filter(drill => drill.source === 'user'),
    getDrillsBySource: (source: 'powlax' | 'user') => drills.filter(drill => drill.source === source)
  }
}

// Helper function to map drill categories to our UI categories
function mapDrillCategory(category: string): string {
  if (!category) return 'skill'
  
  const lowerCategory = category.toLowerCase()
  
  // Map database categories to our UI categories based on screenshot
  if (lowerCategory === 'admin') {
    return 'admin'
  } else if (lowerCategory === 'skill drills' || lowerCategory === 'skill development') {
    return 'skill'
  } else if (lowerCategory === 'concept drills') {
    return 'concept'
  } else if (lowerCategory === 'team drills') {
    return 'concept'  // Team drills go under concept category
  } else if (lowerCategory.includes('1v1')) {
    return '1v1'
  } else if (lowerCategory.includes('ground ball') || lowerCategory.includes('skill')) {
    return 'skill'
  }
  
  return 'skill' // default category
}

// Helper function to extract strategies from drill data
function extractStrategiesFromDrill(drill: any): string[] {
  const strategies: string[] = []
  
  // Extract from game_states
  if (drill.game_states && Array.isArray(drill.game_states)) {
    drill.game_states.forEach((state: string) => {
      if (state.includes('offensive')) {
        strategies.push('Offense')
      }
      if (state.includes('defense')) {
        strategies.push('Defense')
      }
      if (state.includes('transition')) {
        strategies.push('Transition')
      }
      if (state.includes('settled')) {
        strategies.push('Settled')
      }
    })
  }
  
  // Extract from category
  if (drill.category) {
    const lowerCategory = drill.category.toLowerCase()
    if (lowerCategory.includes('ground ball')) {
      strategies.push('Ground Ball')
    }
    if (lowerCategory.includes('1v1')) {
      strategies.push('1v1')
    }
    if (lowerCategory.includes('team')) {
      strategies.push('Team Play')
    }
  }
  
  // Extract from title
  if (drill.title) {
    const lowerTitle = drill.title.toLowerCase()
    if (lowerTitle.includes('ground ball')) {
      if (!strategies.includes('Ground Ball')) strategies.push('Ground Ball')
    }
    if (lowerTitle.includes('clear')) {
      if (!strategies.includes('Clearing')) strategies.push('Clearing')
    }
    if (lowerTitle.includes('ride')) {
      if (!strategies.includes('Riding')) strategies.push('Riding')
    }
  }
  
  // Remove duplicates
  return strategies.filter((v, i, a) => a.indexOf(v) === i)
}

// Helper function to extract concepts from game states
function extractConceptsFromGameStates(gameStates: string[] | null): string[] {
  if (!gameStates || !Array.isArray(gameStates)) return []
  
  const concepts: string[] = []
  gameStates.forEach(state => {
    if (state.includes('settled')) {
      concepts.push('Settled Play')
    }
    if (state.includes('transition')) {
      concepts.push('Transition')
    }
    if (state.includes('offense')) {
      concepts.push('Offensive Concepts')
    }
    if (state.includes('defense')) {
      concepts.push('Defensive Concepts')
    }
  })
  
  return concepts.filter((v, i, a) => a.indexOf(v) === i)
}

// Helper function to extract skills from category
function extractSkillsFromCategory(category: string): string[] {
  if (!category) return []
  
  const skills: string[] = []
  const lowerCategory = category.toLowerCase()
  
  if (lowerCategory.includes('1v1')) {
    skills.push('Dodging', 'Defense')
  }
  if (lowerCategory.includes('team')) {
    skills.push('Communication', 'Positioning')
  }
  if (lowerCategory.includes('shooting')) {
    skills.push('Shooting')
  }
  if (lowerCategory.includes('passing')) {
    skills.push('Passing', 'Catching')
  }
  
  return skills
}

// Helper function to parse array fields that might be PostgreSQL arrays or strings
function parseArrayField(field: any): string[] {
  if (!field) return []
  if (Array.isArray(field)) return field
  if (typeof field === 'string') {
    // Handle PostgreSQL array format {value1,value2}
    if (field.startsWith('{') && field.endsWith('}')) {
      return field.slice(1, -1).split(',').filter(Boolean)
    }
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(field)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      // If not JSON, split by comma
      return field.split(',').map(s => s.trim()).filter(Boolean)
    }
  }
  return []
}

// Helper function to parse lacrosse lab URLs from JSONB
function parseLacrosseLabUrls(labUrls: any): string[] {
  if (!labUrls) return []
  
  // If it's already an array, return it
  if (Array.isArray(labUrls)) {
    return labUrls.filter(url => url && typeof url === 'string' && url.trim() !== '')
  }
  
  // If it's a JSONB string, try to parse it
  if (typeof labUrls === 'string') {
    try {
      const parsed = JSON.parse(labUrls)
      if (Array.isArray(parsed)) {
        return parsed.filter(url => url && typeof url === 'string' && url.trim() !== '')
      }
    } catch {
      // ignore parse errors and fall back to empty array
    }
  }
  
  return []
}

// Helper function to parse duration from text (e.g., "10 minutes" -> 10)
function parseDuration(durationText: string | null): number {
  if (!durationText) return 10
  
  // Extract number from text like "10 minutes", "5-10 min", etc.
  const match = durationText.match(/\d+/)
  return match ? parseInt(match[0], 10) : 10
}

// Helper function to parse number from text
function parseNumber(text: string | null): number | undefined {
  if (!text) return undefined
  
  const match = text.match(/\d+/)
  return match ? parseInt(match[0], 10) : undefined
}