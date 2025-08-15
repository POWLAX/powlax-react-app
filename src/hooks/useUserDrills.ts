'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UserDrill {
  // Database fields
  id: string
  user_id: string
  wp_id?: number
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
  slug?: string
  raw_data?: any
  team_share?: number[] | boolean
  club_share?: number[] | boolean
  is_public?: boolean
  created_at?: string
  updated_at?: string
  duration_minutes?: number
  category?: string
  video_url?: string
  drill_lab_url_1?: string
  drill_lab_url_2?: string
  drill_lab_url_3?: string
  drill_lab_url_4?: string
  drill_lab_url_5?: string
  equipment?: string
  tags?: string
  // Normalized fields for practice planner compatibility
  name: string
  duration: number
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
      // Use actual database columns that exist
      const transformedDrills = data.map((drill: any) => ({
        // Original user_drills fields from database
        id: drill.id?.toString(),
        user_id: drill.user_id,
        title: drill.title,
        content: drill.content,
        drill_types: drill.drill_types,
        drill_category: drill.drill_category,
        drill_duration: drill.drill_duration,
        drill_video_url: drill.drill_video_url,
        drill_notes: drill.drill_notes,
        game_states: drill.game_states || [],
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
        
        // Additional database columns that exist
        duration_minutes: drill.duration_minutes,
        category: drill.category,
        video_url: drill.video_url,
        equipment: drill.equipment,
        tags: drill.tags,
        
        // Lacrosse Lab URLs (all 5 columns)
        drill_lab_url_1: drill.drill_lab_url_1,
        drill_lab_url_2: drill.drill_lab_url_2,
        drill_lab_url_3: drill.drill_lab_url_3,
        drill_lab_url_4: drill.drill_lab_url_4,
        drill_lab_url_5: drill.drill_lab_url_5,
        
        // Legacy compatibility fields for practice planner
        name: drill.title,
        duration: drill.duration_minutes || 10,
        strategies: extractStrategies(drill),
        concepts: extractConcepts(drill),
        skills: extractSkills(drill),
        notes: drill.content || drill.drill_notes || ''
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

  const createUserDrill = async (drillData: any) => {
    try {
      // FIXED: Save ALL fields to their database columns, following strategy pattern
      const { data, error } = await supabase
        .from('user_drills')
        .insert([{
          user_id: drillData.user_id,
          title: drillData.title || 'New Drill',
          content: drillData.content || '',
          
          // Duration fields (both legacy and new)
          duration_minutes: drillData.duration_minutes || drillData.duration || 10,
          drill_duration: `${drillData.duration_minutes || drillData.duration || 10} minutes`,
          
          // Category fields (both legacy and new)
          category: drillData.category || 'Custom',
          drill_category: drillData.drill_category || drillData.category || 'Custom',
          
          // Video fields (both legacy and new)
          video_url: drillData.video_url || null,
          drill_video_url: drillData.drill_video_url || drillData.video_url || null,
          vimeo_url: drillData.vimeo_url || null,
          
          // Lacrosse Lab URLs (all 5 columns)
          drill_lab_url_1: drillData.drill_lab_url_1 || null,
          drill_lab_url_2: drillData.drill_lab_url_2 || null,
          drill_lab_url_3: drillData.drill_lab_url_3 || null,
          drill_lab_url_4: drillData.drill_lab_url_4 || null,
          drill_lab_url_5: drillData.drill_lab_url_5 || null,
          
          // Equipment and tags
          equipment: drillData.equipment || '',
          tags: drillData.tags || '',
          
          // Notes fields (both legacy and new)
          drill_notes: drillData.drill_notes || drillData.notes || drillData.content || '',
          
          // Drill types and emphasis
          drill_types: drillData.drill_types || '',
          drill_emphasis: drillData.drill_emphasis || '',
          
          // Game states and phases
          game_states: drillData.game_states || [],
          game_phase: drillData.game_phase || '',
          
          // Age appropriateness
          do_it_ages: drillData.do_it_ages || drillData.see_it_ages || '',
          coach_it_ages: drillData.coach_it_ages || '',
          own_it_ages: drillData.own_it_ages || '',
          
          // Visibility and sharing
          is_public: drillData.is_public || false,
          status: drillData.status || 'active',
          
          // CRITICAL FIX: Send arrays, not booleans!
          team_share: Array.isArray(drillData.team_share) ? drillData.team_share : 
                     (drillData.team_share === true ? [] : []),
          club_share: Array.isArray(drillData.club_share) ? drillData.club_share : 
                     (drillData.club_share === true ? [] : []),
          
          // Media
          featured_image: drillData.featured_image || null
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
      // FIXED: Handle ALL fields including arrays, following successful strategy pattern
      const updateData: any = {}
      
      // Basic fields
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.content !== undefined) updateData.content = updates.content
      
      // Duration fields (both legacy and new)
      if (updates.duration_minutes !== undefined || updates.duration !== undefined) {
        const duration = updates.duration_minutes || updates.duration || 10
        updateData.duration_minutes = duration
        updateData.drill_duration = `${duration} minutes`
      }
      
      // Category fields (both legacy and new)
      if (updates.category !== undefined) {
        updateData.category = updates.category
        updateData.drill_category = updates.category
      }
      if (updates.drill_category !== undefined) updateData.drill_category = updates.drill_category
      
      // Video fields (both legacy and new)
      if (updates.video_url !== undefined) {
        updateData.video_url = updates.video_url
        updateData.drill_video_url = updates.video_url
      }
      if (updates.drill_video_url !== undefined) updateData.drill_video_url = updates.drill_video_url
      if (updates.vimeo_url !== undefined) updateData.vimeo_url = updates.vimeo_url
      
      // Lacrosse Lab URLs (all 5 columns)
      if (updates.drill_lab_url_1 !== undefined) updateData.drill_lab_url_1 = updates.drill_lab_url_1
      if (updates.drill_lab_url_2 !== undefined) updateData.drill_lab_url_2 = updates.drill_lab_url_2
      if (updates.drill_lab_url_3 !== undefined) updateData.drill_lab_url_3 = updates.drill_lab_url_3
      if (updates.drill_lab_url_4 !== undefined) updateData.drill_lab_url_4 = updates.drill_lab_url_4
      if (updates.drill_lab_url_5 !== undefined) updateData.drill_lab_url_5 = updates.drill_lab_url_5
      
      // Equipment and tags
      if (updates.equipment !== undefined) updateData.equipment = updates.equipment
      if (updates.tags !== undefined) updateData.tags = updates.tags
      
      // Notes fields (both legacy and new)
      if (updates.notes !== undefined || updates.drill_notes !== undefined) {
        const notes = updates.drill_notes || updates.notes || ''
        updateData.drill_notes = notes
      }
      
      // Drill types and emphasis
      if (updates.drill_types !== undefined) updateData.drill_types = updates.drill_types
      if (updates.drill_emphasis !== undefined) updateData.drill_emphasis = updates.drill_emphasis
      
      // Game states and phases
      if (updates.game_states !== undefined) updateData.game_states = updates.game_states
      if (updates.game_phase !== undefined) updateData.game_phase = updates.game_phase
      
      // Age appropriateness
      if (updates.do_it_ages !== undefined) updateData.do_it_ages = updates.do_it_ages
      if (updates.coach_it_ages !== undefined) updateData.coach_it_ages = updates.coach_it_ages
      if (updates.own_it_ages !== undefined) updateData.own_it_ages = updates.own_it_ages
      
      // Visibility and sharing
      if (updates.is_public !== undefined) updateData.is_public = updates.is_public
      if (updates.status !== undefined) updateData.status = updates.status
      
      // CRITICAL FIX: Handle team_share and club_share as arrays, not booleans
      if ('team_share' in updates) {
        updateData.team_share = Array.isArray(updates.team_share) 
          ? updates.team_share 
          : (updates.team_share === true ? [] : [])
      }
      
      if ('club_share' in updates) {
        updateData.club_share = Array.isArray(updates.club_share) 
          ? updates.club_share 
          : (updates.club_share === true ? [] : [])
      }
      
      // Media
      if (updates.featured_image !== undefined) updateData.featured_image = updates.featured_image
      
      // Set updated timestamp
      updateData.updated_at = new Date().toISOString()

      const { error } = await supabase
        .from('user_drills')
        .update(updateData)
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

// Helper function for legacy compatibility
function extractDurationMinutes(content: string | null): number {
  if (!content) return 10
  
  const durationMatch = content.match(/Duration:\s*(\d+)\s*minutes?/i)
  return durationMatch ? parseInt(durationMatch[1], 10) : 10
}

// Legacy helper functions (kept for compatibility)
function parseDuration(durationText: string | null): number {
  if (!durationText) return 10
  
  const match = durationText.match(/\d+/)
  return match ? parseInt(match[0], 10) : 10
}

function mapDrillCategory(category: string | null): string {
  if (!category) return 'skill'
  
  const lowerCategory = category.toLowerCase()
  
  if (lowerCategory === 'administrator') {
    return 'administrator'
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