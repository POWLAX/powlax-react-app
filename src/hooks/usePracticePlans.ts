'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/SupabaseAuthContext'

// 🚨 FIXED: Practice interface now matches ACTUAL database schema from practices table!
export interface PracticePlan {
  id?: string
  wp_post_id?: number
  coach_id?: string
  team_id?: string | null
  name?: string // Database uses 'name' not 'title'
  title?: string // For compatibility - will map to 'name'
  practice_date?: string | null
  start_time?: string | null
  duration_minutes?: number
  field_location?: string // Database uses 'field_location' not 'field_type'
  goals?: any // JSON field in database
  notes?: string | null
  raw_wp_data?: any // JSON field containing drill data
  drill_sequence?: DrillSequence // For compatibility - will map to raw_wp_data
  created_at?: string
  updated_at?: string
}

export interface DrillSequence {
  timeSlots: TimeSlot[]
  practiceInfo: {
    startTime: string
    setupTime?: number
    field: string
  }
}

export interface TimeSlot {
  id: string
  drills: any[]
  duration: number
}

export function usePracticePlans(teamId?: string) {
  const { user } = useAuth()
  const [plans, setPlans] = useState<PracticePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (teamId) {
      fetchPracticePlans()
    }
  }, [teamId, user, /* stable callback */])

  const fetchPracticePlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use 'practices' table as specified in database contract
      const tableName = 'practices'
      
      let query = supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false }) // Use created_at since practice_date can be null

      if (teamId) {
        query = query.eq('team_id', teamId)
      }

      if (user?.id) {
        // Use coach_id for filtering (practices table structure)
        query = query.eq('coach_id', user.id) // Fixed: use .eq instead of .or for single user
      }

      const { data, error } = await query

      if (error) throw error

      // 🚨 CRITICAL FIX: Convert database format to expected format
      const convertedPlans = (data || []).map(record => ({
        ...record,
        title: record.name, // Map name to title for compatibility
        // Convert raw_wp_data back to drill_sequence format
        drill_sequence: record.raw_wp_data?.drills ? {
          timeSlots: [{
            id: `slot-${record.id}`,
            drills: record.raw_wp_data.drills.map((drill, index) => ({
              ...drill,
              id: `drill-${record.id}-${index}`,
              title: drill.name,
              duration: drill.duration || 0,
              video_url: drill.videoUrl,
              drill_lab_url_1: drill.labUrl || drill.customUrl
            })),
            duration: record.raw_wp_data.drills.reduce((acc, drill) => acc + (drill.duration || 0), 0)
          }],
          practiceInfo: {
            startTime: record.raw_wp_data.startTime || record.start_time || '07:00',
            setupTime: undefined,
            field: record.raw_wp_data.field || record.field_location || 'Turf'
          }
        } : {
          timeSlots: [],
          practiceInfo: {
            startTime: record.start_time || '07:00',
            field: record.field_location || 'Turf'
          }
        }
      }))

      setPlans(convertedPlans)
    } catch (err: any) {
      console.error('Error fetching practice plans:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [teamId, user?.id])

  const savePracticePlan = async (plan: Omit<PracticePlan, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Use 'practices' table as specified in database contract
      const tableName = 'practices'
      
      // 🚨 CRITICAL FIX: Map data structure to match actual database schema
      const planData = {
        name: plan.title || plan.name, // Map title to name (database column)
        coach_id: user?.id,
        created_by: user?.id, // Add created_by field with user ID
        team_id: plan.team_id || null,
        practice_date: plan.practice_date || null,
        start_time: plan.start_time || null,
        duration_minutes: plan.duration_minutes || 0,
        field_location: plan.field_location || '',
        goals: plan.goals || {},
        notes: plan.notes || null,
        // Store drill sequence in raw_wp_data to match existing structure
        raw_wp_data: plan.drill_sequence ? {
          drills: plan.drill_sequence.timeSlots?.map(slot => 
            slot.drills.map(drill => ({
              name: drill.title || drill.name,
              duration: drill.duration || slot.duration,
              notes: drill.notes || '',
              videoUrl: drill.video_url || '',
              labUrl: drill.drill_lab_url_1 || '',
              customUrl: drill.drill_lab_url_1 || ''
            }))
          ).flat() || [],
          startTime: plan.drill_sequence.practiceInfo?.startTime || '07:00',
          field: plan.drill_sequence.practiceInfo?.field || plan.field_location || 'Turf'
        } : {},
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(tableName)
        .insert([planData])
        .select()
        .single()

      if (error) throw error

      // Convert back to expected format for local state
      const convertedData = {
        ...data,
        title: data.name, // Map name back to title for compatibility
        drill_sequence: data.raw_wp_data?.drills ? {
          timeSlots: [{
            id: 'converted-slot',
            drills: data.raw_wp_data.drills,
            duration: data.raw_wp_data.drills.reduce((acc, drill) => acc + (drill.duration || 0), 0)
          }],
          practiceInfo: {
            startTime: data.raw_wp_data.startTime || '07:00',
            field: data.raw_wp_data.field || data.field_location || 'Turf'
          }
        } : { timeSlots: [], practiceInfo: { startTime: '07:00', field: 'Turf' } }
      }

      // Update local state
      setPlans([convertedData, ...plans])
      
      return { data: convertedData, error: null }
    } catch (err: any) {
      console.error('Error saving practice plan:', err)
      return { data: null, error: err.message }
    }
  }

  const updatePracticePlan = async (id: string, updates: Partial<PracticePlan>) => {
    try {
      // Use 'practices' table as specified in database contract
      const tableName = 'practices'
      
      // 🚨 CRITICAL FIX: Map updates to match database schema
      const dbUpdates = {
        ...(updates.title && { name: updates.title }),
        ...(updates.name && { name: updates.name }),
        ...(updates.team_id !== undefined && { team_id: updates.team_id }),
        ...(updates.practice_date !== undefined && { practice_date: updates.practice_date }),
        ...(updates.start_time !== undefined && { start_time: updates.start_time }),
        ...(updates.duration_minutes !== undefined && { duration_minutes: updates.duration_minutes }),
        ...(updates.field_location && { field_location: updates.field_location }),
        ...(updates.goals && { goals: updates.goals }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        // Update raw_wp_data if drill_sequence is provided
        ...(updates.drill_sequence && {
          raw_wp_data: {
            drills: updates.drill_sequence.timeSlots?.map(slot => 
              slot.drills.map(drill => ({
                name: drill.title || drill.name,
                duration: drill.duration || slot.duration,
                notes: drill.notes || '',
                videoUrl: drill.video_url || '',
                labUrl: drill.drill_lab_url_1 || '',
                customUrl: drill.drill_lab_url_1 || ''
              }))
            ).flat() || [],
            startTime: updates.drill_sequence.practiceInfo?.startTime || '07:00',
            field: updates.drill_sequence.practiceInfo?.field || updates.field_location || 'Turf'
          }
        }),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from(tableName)
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Convert back to expected format
      const convertedData = {
        ...data,
        title: data.name,
        drill_sequence: data.raw_wp_data?.drills ? {
          timeSlots: [{
            id: 'updated-slot',
            drills: data.raw_wp_data.drills,
            duration: data.raw_wp_data.drills.reduce((acc, drill) => acc + (drill.duration || 0), 0)
          }],
          practiceInfo: {
            startTime: data.raw_wp_data.startTime || '07:00',
            field: data.raw_wp_data.field || data.field_location || 'Turf'
          }
        } : { timeSlots: [], practiceInfo: { startTime: '07:00', field: 'Turf' } }
      }

      // Update local state
      setPlans(plans.map(p => p.id === id ? convertedData : p))
      
      return { data: convertedData, error: null }
    } catch (err: any) {
      console.error('Error updating practice plan:', err)
      return { data: null, error: err.message }
    }
  }

  const deletePracticePlan = async (id: string) => {
    try {
      // Use 'practices' table as specified in database contract
      const tableName = 'practices'
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) throw error

      // Update local state
      setPlans(plans.filter(p => p.id !== id))
      
      return { error: null }
    } catch (err: any) {
      console.error('Error deleting practice plan:', err)
      return { error: err.message }
    }
  }

  const loadPracticePlan = async (id: string) => {
    try {
      // Use 'practices' table as specified in database contract
      const tableName = 'practices'
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      // Convert database format to expected format
      const convertedData = {
        ...data,
        title: data.name,
        drill_sequence: data.raw_wp_data?.drills ? {
          timeSlots: [{
            id: `slot-${data.id}`,
            drills: data.raw_wp_data.drills.map((drill, index) => ({
              ...drill,
              id: `drill-${data.id}-${index}`,
              title: drill.name,
              duration: drill.duration || 0,
              video_url: drill.videoUrl,
              drill_lab_url_1: drill.labUrl || drill.customUrl
            })),
            duration: data.raw_wp_data.drills.reduce((acc, drill) => acc + (drill.duration || 0), 0)
          }],
          practiceInfo: {
            startTime: data.raw_wp_data.startTime || data.start_time || '07:00',
            setupTime: undefined,
            field: data.raw_wp_data.field || data.field_location || 'Turf'
          }
        } : {
          timeSlots: [],
          practiceInfo: {
            startTime: data.start_time || '07:00',
            field: data.field_location || 'Turf'
          }
        }
      }

      return { data: convertedData, error: null }
    } catch (err: any) {
      console.error('Error loading practice plan:', err)
      return { data: null, error: err.message }
    }
  }

  return {
    plans,
    loading,
    error,
    savePracticePlan,
    updatePracticePlan,
    deletePracticePlan,
    loadPracticePlan,
    refetch: fetchPracticePlans
  }
}