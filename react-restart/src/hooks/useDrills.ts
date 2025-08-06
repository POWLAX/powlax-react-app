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
}

// Mock data fallback - comprehensive drill library
const mockDrills: Drill[] = [
  // Admin Drills
  { id: '1', name: 'Dynamic Warm-Up', duration: 10, category: 'admin', strategies: ['Warm-Up'], notes: 'Progressive warm-up with dynamic stretching' },
  { id: '2', name: 'Line Drills', duration: 8, category: 'admin', strategies: ['Warm-Up', 'Footwork'] },
  { id: '3', name: 'Stick Work Lines', duration: 10, category: 'admin', strategies: ['Warm-Up', 'Stick Skills'] },
  
  // Skill Drills
  { id: '4', name: '2 Ball Reaction Drill', duration: 10, category: 'skill', strategies: ['Ground Ball'], notes: 'Quick reaction and ground ball technique' },
  { id: '5', name: '3 Man Passing', duration: 15, category: 'skill', strategies: ['Passing', 'Catching'] },
  { id: '6', name: 'Star Drill', duration: 12, category: 'skill', strategies: ['Passing', 'Movement'] },
  { id: '7', name: 'Box Passing', duration: 10, category: 'skill', strategies: ['Passing', 'Catching'] },
  { id: '8', name: 'Over the Shoulder', duration: 10, category: 'skill', strategies: ['Catching', 'Communication'] },
  { id: '9', name: 'Quick Stick Drill', duration: 8, category: 'skill', strategies: ['Stick Skills'] },
  { id: '10', name: 'Wall Ball Circuit', duration: 15, category: 'skill', strategies: ['Stick Skills'], notes: 'Individual skill development' },
  
  // 1v1 Drills
  { id: '11', name: '1v1 Ground Balls', duration: 15, category: '1v1', strategies: ['Ground Ball', 'Competition'] },
  { id: '12', name: '1v1 from X', duration: 20, category: '1v1', strategies: ['Dodging', 'Defense'] },
  { id: '13', name: '1v1 from Top', duration: 20, category: '1v1', strategies: ['Dodging', 'Defense'] },
  { id: '14', name: 'Mirror Dodge', duration: 10, category: '1v1', strategies: ['Dodging', 'Footwork'] },
  { id: '15', name: 'Defensive Positioning 1v1', duration: 15, category: '1v1', strategies: ['Defense', 'Positioning'] },
  
  // Concept Drills
  { id: '16', name: '3v2 Fast Break', duration: 20, category: 'concept', strategies: ['Transition', 'Offense'] },
  { id: '17', name: '4v3 West Genny', duration: 25, category: 'concept', strategies: ['Transition', 'Decision Making'] },
  { id: '18', name: '5v4 Slow Break', duration: 25, category: 'concept', strategies: ['Transition', 'Offense'] },
  { id: '19', name: 'Clear vs Ride', duration: 25, category: 'concept', strategies: ['Clearing', 'Riding'] },
  { id: '20', name: '6v6 Ground Ball to Offense', duration: 30, category: 'concept', strategies: ['Transition', 'Ground Ball'] },
  { id: '21', name: 'Defensive Slides', duration: 20, category: 'concept', strategies: ['Defense', 'Communication'] },
  { id: '22', name: 'Motion Offense', duration: 25, category: 'concept', strategies: ['Offense', 'Movement'] },
  { id: '23', name: '2-3-1 Zone Defense', duration: 20, category: 'concept', strategies: ['Defense', 'Zone'] },
  { id: '24', name: 'Man-Up Offense', duration: 20, category: 'concept', strategies: ['Offense', 'Special Teams'] },
  { id: '25', name: 'Man-Down Defense', duration: 20, category: 'concept', strategies: ['Defense', 'Special Teams'] },
]

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
      console.log('Fetching drills from Supabase...')
      
      // Fetch from the drills table based on v3 schema
      const { data, error } = await supabase
        .from('drills')
        .select('*')
        .order('title')
        .limit(100)  // Add limit for performance

      if (error) {
        console.error('Supabase error fetching drills:', error)
        throw error
      }

      if (!data || data.length === 0) {
        console.log('No drills found in database, using mock data')
        setDrills(mockDrills)
        return
      }

      // Transform the data to match our component's expected format
      const transformedDrills = data.map((drill: any) => ({
        id: drill.id?.toString() || `drill-${Date.now()}`,
        drill_id: drill.wp_post_id?.toString(),
        name: drill.title || 'Unnamed Drill',
        duration: drill.duration_minutes || 10,
        category: mapDrillCategory(drill.category || ''),
        subcategory: drill.category,
        description: drill.content || drill.description,
        
        // Extract strategies from game_states and category
        strategies: extractStrategiesFromDrill(drill),
        concepts: extractConceptsFromGameStates(drill.game_states),
        skills: extractSkillsFromCategory(drill.category),
        skill_ids: drill.game_states || [],
        concept_ids: drill.game_states || [],
        game_phase_ids: drill.game_states || [],
        
        // Video and lab URLs
        videoUrl: drill.video_url,
        drill_video_url: drill.video_url,
        drill_lab_url_1: drill.drill_lab_url_1,
        drill_lab_url_2: drill.drill_lab_url_2,
        drill_lab_url_3: drill.drill_lab_url_3,
        drill_lab_url_4: drill.drill_lab_url_4,
        drill_lab_url_5: drill.drill_lab_url_5,
        custom_url: drill.custom_url,
        lab_urls: drill.lab_urls,  // JSONB array field
        lacrosse_lab_urls: parseLacrosseLabUrls(drill.lab_urls),  // Parse JSONB to array
        
        // Additional metadata from v3 schema
        intensity_level: drill.difficulty_level,
        difficulty_level: drill.difficulty_level,
        min_players: drill.min_players,
        max_players: drill.max_players,
        equipment_needed: parseArrayField(drill.equipment),
        equipment: parseArrayField(drill.equipment),
        
        // Coaching information
        setup_requirements: drill.setup_requirements || '',
        coach_instructions: drill.coach_instructions || drill.notes || '',
        notes: drill.notes || drill.content || '',
        
        // Age progressions (from v3 schema references)
        age_adaptations: drill.age_adaptations,
        do_it: drill.do_it,
        coach_it: drill.coach_it,
        own_it: drill.own_it,
        
        // Additional URLs and references  - already handled above
        
        // Game context
        applicable_situations: parseArrayField(drill.applicable_situations),
        communication_focus: drill.communication_focus,
        movement_principle_ids: parseArrayField(drill.movement_principle_ids),
        
        // Scoring and progression
        scoring_system: drill.scoring_system,
        progressions: drill.progressions,
      }))

      console.log(`Loaded ${transformedDrills.length} drills from database`)
      setDrills(transformedDrills)
    } catch (err: any) {
      console.error('Error fetching drills:', err)
      setError(err.message)
      // Use mock data as fallback
      console.log('Using mock drills as fallback')
      setDrills(mockDrills)
    } finally {
      setLoading(false)
    }
  }

  // TEMPORARY: Return mock data with loading false for testing
  return { drills: drills.length > 0 ? drills : mockDrills, loading: false, error }
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
    } catch (e) {
      console.error('Failed to parse lab_urls:', e)
    }
  }
  
  return []
}