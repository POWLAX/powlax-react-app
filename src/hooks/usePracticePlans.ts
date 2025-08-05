'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/hooks/useSupabase'

export interface PracticePlan {
  id?: string
  title: string
  coach_id?: string
  team_id?: string
  practice_date: string
  duration_minutes: number
  drill_sequence: DrillSequence
  strategies_focus?: string[]
  notes?: string
  shared_with?: string[]
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
  }, [teamId, user])

  const fetchPracticePlans = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('practice_plans_collaborative')
        .select('*')
        .order('practice_date', { ascending: false })

      if (teamId) {
        query = query.eq('team_id', teamId)
      }

      if (user?.id) {
        query = query.or(`coach_id.eq.${user.id},shared_with.cs.{${user.id}}`)
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
  }

  const savePracticePlan = async (plan: Omit<PracticePlan, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const planData = {
        ...plan,
        coach_id: user?.id,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('practice_plans_collaborative')
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
      const { data, error } = await supabase
        .from('practice_plans_collaborative')
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
      const { error } = await supabase
        .from('practice_plans_collaborative')
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
      const { data, error } = await supabase
        .from('practice_plans_collaborative')
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