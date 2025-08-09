'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/hooks/useSupabase'

export interface PracticePlan {
  id?: string
  title: string
  user_id?: string
  team_id?: string
  practice_date: string
  start_time?: string
  duration_minutes: number
  field_type?: 'turf' | 'grass' | 'indoor' | 'other'
  setup_time?: number
  setup_notes?: string
  practice_notes?: string
  drill_sequence: DrillSequence
  selected_strategies?: string[]
  template?: boolean
  age_group?: '8-10' | '11-14' | '15+' | 'all'
  version?: number
  parent_id?: string
  is_draft?: boolean
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
  const { user } = useSupabase()
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
      
      // Check if new table exists, fallback to old if not
      const { error: checkError } = await supabase
        .from('practice_plans')
        .select('id')
        .limit(1)
      
      const tableName = checkError?.code === '42P01' ? 'practice_plans_collaborative' : 'practice_plans'
      
      let query = supabase
        .from(tableName)
        .select('*')
        .order('practice_date', { ascending: false })

      if (teamId) {
        query = query.eq('team_id', teamId)
      }

      if (user?.id) {
        if (tableName === 'practice_plans') {
          // New table structure
          query = query.or(`user_id.eq.${user.id}`)
        } else {
          // Old table structure
          query = query.or(`coach_id.eq.${user.id},shared_with.cs.{${user.id}}`)
        }
      }

      const { data, error } = await query

      if (error) throw error

      setPlans(data || [])
    } catch (err: any) {
      console.error('Error fetching practice plans:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [teamId, user?.id])

  const savePracticePlan = async (plan: Omit<PracticePlan, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Check which table to use
      const { error: checkError } = await supabase
        .from('practice_plans')
        .select('id')
        .limit(1)
      
      const tableName = checkError?.code === '42P01' ? 'practice_plans_collaborative' : 'practice_plans'
      
      const planData = tableName === 'practice_plans' 
        ? {
            ...plan,
            user_id: user?.id,
            updated_at: new Date().toISOString()
          }
        : {
            ...plan,
            coach_id: user?.id,
            updated_at: new Date().toISOString()
          }

      const { data, error } = await supabase
        .from(tableName)
        .insert([planData])
        .select()
        .single()

      if (error) throw error

      // Update local state
      setPlans([data, ...plans])
      
      return { data, error: null }
    } catch (err: any) {
      console.error('Error saving practice plan:', err)
      return { data: null, error: err.message }
    }
  }

  const updatePracticePlan = async (id: string, updates: Partial<PracticePlan>) => {
    try {
      // Check which table to use
      const { error: checkError } = await supabase
        .from('practice_plans')
        .select('id')
        .limit(1)
      
      const tableName = checkError?.code === '42P01' ? 'practice_plans_collaborative' : 'practice_plans'
      
      const { data, error } = await supabase
        .from(tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setPlans(plans.map(p => p.id === id ? data : p))
      
      return { data, error: null }
    } catch (err: any) {
      console.error('Error updating practice plan:', err)
      return { data: null, error: err.message }
    }
  }

  const deletePracticePlan = async (id: string) => {
    try {
      // Check which table to use
      const { error: checkError } = await supabase
        .from('practice_plans')
        .select('id')
        .limit(1)
      
      const tableName = checkError?.code === '42P01' ? 'practice_plans_collaborative' : 'practice_plans'
      
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
      // Check which table to use
      const { error: checkError } = await supabase
        .from('practice_plans')
        .select('id')
        .limit(1)
      
      const tableName = checkError?.code === '42P01' ? 'practice_plans_collaborative' : 'practice_plans'
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
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