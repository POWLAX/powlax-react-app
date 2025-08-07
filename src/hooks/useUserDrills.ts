'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UserDrill {
  id: string
  user_id: string
  title: string
  content?: string
  drill_types?: string
  drill_category?: string
  drill_duration?: string
  drill_video_url?: string
  drill_notes?: string
  game_states?: string
  drill_emphasis?: string
  game_phase?: string
  do_it_ages?: string
  coach_it_ages?: string
  own_it_ages?: string
  vimeo_url?: string
  featured_image?: string
  status?: string
  team_share?: number[]
  club_share?: number[]
  is_public?: boolean
  created_at?: string
  updated_at?: string
  // Normalized fields for practice planner compatibility
  name: string
  duration: number
  category: string
  strategies?: string[]
  concepts?: string[]
  skills?: string[]
  notes?: string
}

export function useUserDrills() {
  const [userDrills, setUserDrills] = useState<UserDrill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserDrills()
  }, [])

  const fetchUserDrills = async () => {
    try {
      setLoading(true)
      console.log('Fetching user drills...')
      
      const { data, error } = await supabase
        .from('user_drills')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error fetching user drills:', error)
        throw new Error(`Failed to fetch user drills: ${error.message}`)
      }

      if (!data) {
        console.log('No user drills found')
        setUserDrills([])
        return
      }

      // Transform user_drills data to match practice planner format
      const transformedDrills = data.map((drill: any) => ({
        // Original user_drills fields
        id: drill.id?.toString(),
        user_id: drill.user_id,
        title: drill.title,
        content: drill.content,
        drill_types: drill.drill_types,
        drill_category: drill.drill_category,
        drill_duration: drill.drill_duration,
        drill_video_url: drill.drill_video_url,
        drill_notes: drill.drill_notes,
        game_states: drill.game_states,
        drill_emphasis: drill.drill_emphasis,
        game_phase: drill.game_phase,
        do_it_ages: drill.do_it_ages,
        coach_it_ages: drill.coach_it_ages,
        own_it_ages: drill.own_it_ages,
        vimeo_url: drill.vimeo_url,
        featured_image: drill.featured_image,
        status: drill.status,
        team_share: drill.team_share || [],
        club_share: drill.club_share || [],
        is_public: drill.is_public || false,
        created_at: drill.created_at,
        updated_at: drill.updated_at,

        // Normalized fields for practice planner compatibility
        name: drill.title,
        duration: parseDuration(drill.drill_duration) || 10,
        category: mapDrillCategory(drill.drill_category || drill.drill_types) || 'skill',
        strategies: extractStrategies(drill),
        concepts: extractConcepts(drill),
        skills: extractSkills(drill),
        notes: drill.drill_notes || drill.content || ''
      }))

      console.log(`Loaded ${transformedDrills.length} user drills`)
      setUserDrills(transformedDrills)
    } catch (err: any) {
      console.error('Error fetching user drills:', err)
      setError(err.message)
      setUserDrills([])
    } finally {
      setLoading(false)
    }
  }

  const createUserDrill = async (drillData: Partial<UserDrill>) => {
    try {
      const { data, error } = await supabase
        .from('user_drills')
        .insert([{
          title: drillData.title || 'New Drill',
          content: drillData.content,
          drill_category: drillData.drill_category || drillData.category,
          drill_duration: drillData.drill_duration || `${drillData.duration || 10} minutes`,
          drill_notes: drillData.drill_notes || drillData.notes,
          drill_video_url: drillData.drill_video_url,
          is_public: drillData.is_public || false
        }])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create drill: ${error.message}`)
      }

      // Refresh the drill list
      await fetchUserDrills()
      return data
    } catch (err: any) {
      console.error('Error creating user drill:', err)
      setError(err.message)
      throw err
    }
  }

  const updateUserDrill = async (drillId: string, updates: Partial<UserDrill>) => {
    try {
      const { error } = await supabase
        .from('user_drills')
        .update({
          title: updates.title,
          content: updates.content,
          drill_category: updates.drill_category || updates.category,
          drill_duration: updates.drill_duration || `${updates.duration || 10} minutes`,
          drill_notes: updates.drill_notes || updates.notes,
          drill_video_url: updates.drill_video_url,
          is_public: updates.is_public
        })
        .eq('id', drillId)

      if (error) {
        throw new Error(`Failed to update drill: ${error.message}`)
      }

      // Refresh the drill list
      await fetchUserDrills()
    } catch (err: any) {
      console.error('Error updating user drill:', err)
      setError(err.message)
      throw err
    }
  }

  const deleteUserDrill = async (drillId: string) => {
    try {
      const { error } = await supabase
        .from('user_drills')
        .delete()
        .eq('id', drillId)

      if (error) {
        throw new Error(`Failed to delete drill: ${error.message}`)
      }

      // Refresh the drill list
      await fetchUserDrills()
    } catch (err: any) {
      console.error('Error deleting user drill:', err)
      setError(err.message)
      throw err
    }
  }

  const shareWithTeams = async (drillId: string, teamIds: number[]) => {
    try {
      const { data, error } = await supabase.rpc('share_drill_with_teams', {
        drill_id: parseInt(drillId),
        team_ids: teamIds
      })

      if (error) {
        throw new Error(`Failed to share drill: ${error.message}`)
      }

      await fetchUserDrills()
      return data
    } catch (err: any) {
      console.error('Error sharing drill with teams:', err)
      setError(err.message)
      throw err
    }
  }

  const shareWithClubs = async (drillId: string, clubIds: number[]) => {
    try {
      const { data, error } = await supabase.rpc('share_drill_with_clubs', {
        drill_id: parseInt(drillId),
        club_ids: clubIds
      })

      if (error) {
        throw new Error(`Failed to share drill: ${error.message}`)
      }

      await fetchUserDrills()
      return data
    } catch (err: any) {
      console.error('Error sharing drill with clubs:', err)
      setError(err.message)
      throw err
    }
  }

  const refreshDrills = () => {
    fetchUserDrills()
  }

  return {
    userDrills,
    loading,
    error,
    createUserDrill,
    updateUserDrill,
    deleteUserDrill,
    shareWithTeams,
    shareWithClubs,
    refreshDrills
  }
}

// Helper functions
function parseDuration(durationText: string | null): number {
  if (!durationText) return 10
  
  const match = durationText.match(/\d+/)
  return match ? parseInt(match[0], 10) : 10
}

function mapDrillCategory(category: string | null): string {
  if (!category) return 'skill'
  
  const lowerCategory = category.toLowerCase()
  
  if (lowerCategory === 'admin') {
    return 'admin'
  } else if (lowerCategory.includes('skill')) {
    return 'skill'
  } else if (lowerCategory.includes('concept')) {
    return 'concept'
  } else if (lowerCategory.includes('1v1')) {
    return '1v1'
  }
  
  return 'skill'
}

function extractStrategies(drill: any): string[] {
  const strategies: string[] = []
  
  if (drill.game_phase) {
    strategies.push(drill.game_phase)
  }
  
  if (drill.drill_emphasis) {
    strategies.push(drill.drill_emphasis)
  }
  
  return strategies.filter((v, i, a) => a.indexOf(v) === i)
}

function extractConcepts(drill: any): string[] {
  const concepts: string[] = []
  
  if (drill.game_states) {
    const states = Array.isArray(drill.game_states) ? drill.game_states : [drill.game_states]
    concepts.push(...states)
  }
  
  return concepts.filter((v, i, a) => a.indexOf(v) === i)
}

function extractSkills(drill: any): string[] {
  const skills: string[] = []
  
  if (drill.drill_types) {
    const types = Array.isArray(drill.drill_types) ? drill.drill_types : [drill.drill_types]
    skills.push(...types)
  }
  
  return skills.filter((v, i, a) => a.indexOf(v) === i)
}