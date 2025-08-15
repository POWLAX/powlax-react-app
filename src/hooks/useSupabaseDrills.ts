'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Create a separate client instance to test different approaches
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

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
  videoUrl?: string
  notes?: string
}

export function useSupabaseDrills() {
  const [drills, setDrills] = useState<Drill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    fetchDrills()
  }, [])

  const fetchDrills = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First, let's check what tables we can access
      const tableCheckResults: any = {}
      
      // Try different table names
      const tablesToCheck = ['drills', 'staging_wp_drills', 'wp_drills', 'Drills']
      
      for (const tableName of tablesToCheck) {
        try {
          const { count, error } = await supabaseClient
            .from(tableName)
            .select('*', { count: 'exact', head: true })
          
          tableCheckResults[tableName] = {
            accessible: !error,
            count: count,
            error: error?.message
          }
        } catch (e: any) {
          tableCheckResults[tableName] = {
            accessible: false,
            error: e.message
          }
        }
      }
      
      setDebugInfo({ tableChecks: tableCheckResults })
      
      // Try to fetch from the most likely table
      let data = null
      let fetchError = null
      
      // Try drills table first (from v3 schema)
      const { data: drillsData, error: drillsError } = await supabaseClient
        .from('powlax_drills')
        .select(`
          id,
          drill_id,
          name,
          description,
          category,
          subcategory,
          duration_min,
          skill_focus,
          intensity_level,
          min_players,
          max_players,
          equipment_needed,
          drill_video_url,
          drill_lab_url_1,
          drill_lab_url_2,
          drill_lab_url_3,
          notes,
          skill_ids,
          concept_ids,
          game_phase_ids
        `)
        .limit(100)
      
      if (!drillsError) {
        data = drillsData
      } else {
        fetchError = drillsError
        
        // Try alternative table
        const { data: altData, error: altError } = await supabaseClient
          .from('staging_wp_drills')
          .select('*')
          .limit(100)
        
        if (!altError) {
          data = altData
          fetchError = null
        }
      }
      
      if (fetchError) {
        throw fetchError
      }

      if (!data || data.length === 0) {
        setDrills(getMockDrills())
        setDebugInfo((prev: any) => ({ ...prev, usingMockData: true }))
        return
      }

      // Transform the data
      const transformedDrills = data.map((drill: any) => ({
        id: drill.id?.toString() || drill.drill_id || `drill-${Date.now()}-${Math.random()}`,
        drill_id: drill.drill_id,
        name: drill.name || drill.title || 'Unnamed Drill',
        duration: drill.duration_min || drill.duration || 10,
        category: mapDrillCategory(drill.category || drill.subcategory || ''),
        subcategory: drill.subcategory,
        strategies: extractStrategiesFromDrill(drill),
        concepts: parseArrayField(drill.concept_ids),
        skills: parseArrayField(drill.skill_ids),
        videoUrl: drill.drill_video_url || drill.video_url,
        notes: drill.notes,
      }))

      setDrills(transformedDrills)
      setDebugInfo((prev: any) => ({ 
        ...prev, 
        loadedCount: transformedDrills.length,
        sampleDrill: transformedDrills[0]
      }))
      
    } catch (err: any) {
      console.error('Error fetching drills:', err)
      setError(err.message || 'Failed to load drills')
      setDrills(getMockDrills())
      setDebugInfo((prev: any) => ({ ...prev, error: err.message, usingMockData: true }))
    } finally {
      setLoading(false)
    }
  }

  return { drills, loading, error, debugInfo }
}

function getMockDrills(): Drill[] {
  return [
    { id: '1', name: '2 Ball Reaction Drill', duration: 10, category: 'skill', strategies: ['Ground Ball'] },
    { id: '2', name: '3 Man Passing', duration: 15, category: 'skill', strategies: ['Clearing'] },
    { id: '3', name: '+1 Ground Ball', duration: 10, category: 'skill', strategies: ['Ground Ball'] },
    { id: '4', name: '10 Man Ride', duration: 20, category: '1v1', strategies: ['Riding'] },
    { id: '5', name: 'Box Lacrosse Ground Ball', duration: 15, category: 'concept', strategies: ['Ground Ball'] },
    { id: '6', name: 'Clear vs Ride', duration: 25, category: 'concept', strategies: ['Clearing', 'Riding'] },
    { id: '7', name: '2v1 Ground Ball Battle', duration: 5, category: 'skill', strategies: ['Ground Ball'] },
    { id: '8', name: 'Star Drill', duration: 12, category: 'skill', strategies: ['Passing', 'Catching'] },
    { id: '9', name: '3v2 Fast Break', duration: 15, category: 'concept', strategies: ['Transition', 'Offense'] },
    { id: '10', name: 'Defensive Slide Package', duration: 20, category: 'concept', strategies: ['Defense', 'Communication'] },
  ]
}

function mapDrillCategory(category: string): string {
  if (!category) return 'skill'
  
  const lowerCategory = category.toLowerCase()
  
  if (lowerCategory.includes('ground ball') || lowerCategory.includes('skill')) {
    return 'skill'
  } else if (lowerCategory.includes('1v1') || lowerCategory.includes('competitive')) {
    return '1v1'
  } else if (lowerCategory.includes('team') || lowerCategory.includes('concept')) {
    return 'concept'
  } else if (lowerCategory.includes('admin') || lowerCategory.includes('warm')) {
    return 'administrator'
  }
  
  return 'skill'
}

function extractStrategiesFromDrill(drill: any): string[] {
  const strategies: string[] = []
  
  if (drill.category?.toLowerCase().includes('ground ball') || drill.name?.toLowerCase().includes('ground ball')) {
    strategies.push('Ground Ball')
  }
  if (drill.category?.toLowerCase().includes('clear') || drill.name?.toLowerCase().includes('clear')) {
    strategies.push('Clearing')
  }
  if (drill.category?.toLowerCase().includes('ride') || drill.name?.toLowerCase().includes('ride')) {
    strategies.push('Riding')
  }
  if (drill.name?.toLowerCase().includes('transition')) {
    strategies.push('Transition')
  }
  if (drill.category?.toLowerCase().includes('offense') || drill.name?.toLowerCase().includes('offense')) {
    strategies.push('Offense')
  }
  if (drill.category?.toLowerCase().includes('defense') || drill.name?.toLowerCase().includes('defense')) {
    strategies.push('Defense')
  }
  
  return strategies.filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
}

function parseArrayField(field: any): string[] {
  if (!field) return []
  if (Array.isArray(field)) return field
  if (typeof field === 'string') {
    if (field.startsWith('{') && field.endsWith('}')) {
      return field.slice(1, -1).split(',').filter(Boolean)
    }
    try {
      const parsed = JSON.parse(field)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return field.split(',').map(s => s.trim()).filter(Boolean)
    }
  }
  return []
}