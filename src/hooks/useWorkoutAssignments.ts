'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface WorkoutAssignment {
  id: string
  coach_id: string
  workout_id: string
  assigned_players: string[]
  assigned_teams: number[]
  assigned_groups: string[]
  due_date: string | null
  required_completions: number
  tags: string[]
  notes: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface WorkoutCompletion {
  id: string
  player_id: string
  workout_id: string
  assignment_id: string | null
  completed_drills: string[]
  skipped_drills: string[]
  drill_scores: any
  total_time_seconds: number
  completion_date: string
  coach_notes: string
  player_feedback: string
}

export function useWorkoutAssignments() {
  const [assignments, setAssignments] = useState<WorkoutAssignment[]>([])
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      console.log('🏋️ Fetching workout assignments...')
      
      // Fetch assignments
      const { data: assignData, error: assignError } = await supabase
        .from('workout_assignments')
        .select('*')
        .order('created_at', { ascending: false })

      if (assignError && assignError.code !== 'PGRST116') {
        console.log('Note: workout_assignments table may not exist yet')
      } else if (assignData) {
        setAssignments(assignData.map((assign: any) => ({
          ...assign,
          assigned_players: assign.assigned_players || [],
          assigned_teams: assign.assigned_teams || [],
          assigned_groups: assign.assigned_groups || [],
          tags: assign.tags || []
        })))
      }

      // Fetch completions
      const { data: compData, error: compError } = await supabase
        .from('workout_completions')
        .select('*')
        .order('completion_date', { ascending: false })

      if (!compError && compData) {
        setCompletions(compData.map((comp: any) => ({
          ...comp,
          completed_drills: comp.completed_drills || [],
          skipped_drills: comp.skipped_drills || []
        })))
      }

      console.log(`✅ Loaded ${assignments.length} assignments`)
    } catch (err: any) {
      console.error('Error fetching assignments:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createAssignment = async (assignmentData: {
    workoutId: string
    assignToPlayers: boolean
    assignToTeams: boolean
    assignToGroups: boolean
    playerIds?: string[]
    teamIds?: number[]
    groupIds?: string[]
    dueDate?: Date | null
    requiredCompletions?: number
    tags?: string[]
    notes?: string
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // PERMANENCE PATTERN: Transform booleans to arrays
      const { error } = await supabase
        .from('workout_assignments')
        .insert([{
          coach_id: user.id,
          workout_id: assignmentData.workoutId,
          assigned_players: assignmentData.assignToPlayers 
            ? (assignmentData.playerIds || []) 
            : [],
          assigned_teams: assignmentData.assignToTeams 
            ? (assignmentData.teamIds || []) 
            : [],
          assigned_groups: assignmentData.assignToGroups 
            ? (assignmentData.groupIds || []) 
            : [],
          due_date: assignmentData.dueDate?.toISOString() || null,
          required_completions: assignmentData.requiredCompletions || 1,
          tags: assignmentData.tags || [],
          notes: assignmentData.notes || '',
          is_active: true
        }])
      
      if (error) throw error
      
      console.log('✅ Workout assignment created with permanence pattern')
      await fetchAssignments()
    } catch (err: any) {
      console.error('Error creating assignment:', err)
      setError(err.message)
      throw err
    }
  }

  const updateAssignment = async (assignmentId: string, updates: {
    assignToPlayers?: boolean
    assignToTeams?: boolean
    assignToGroups?: boolean
    playerIds?: string[]
    teamIds?: number[]
    groupIds?: string[]
    tags?: string[]
    is_active?: boolean
  }) => {
    try {
      const updateData: any = {}
      
      // PERMANENCE PATTERN: Handle array transformations
      if ('assignToPlayers' in updates) {
        updateData.assigned_players = updates.assignToPlayers
          ? (updates.playerIds || [])
          : []
      }
      
      if ('assignToTeams' in updates) {
        updateData.assigned_teams = updates.assignToTeams
          ? (updates.teamIds || [])
          : []
      }
      
      if ('assignToGroups' in updates) {
        updateData.assigned_groups = updates.assignToGroups
          ? (updates.groupIds || [])
          : []
      }
      
      if (updates.tags) updateData.tags = updates.tags
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active
      
      updateData.updated_at = new Date().toISOString()
      
      const { error } = await supabase
        .from('workout_assignments')
        .update(updateData)
        .eq('id', assignmentId)
      
      if (error) throw error
      
      console.log('✅ Assignment updated with array transformation')
      await fetchAssignments()
    } catch (err: any) {
      console.error('Error updating assignment:', err)
      setError(err.message)
      throw err
    }
  }

  const recordCompletion = async (completionData: {
    playerId: string
    workoutId: string
    assignmentId?: string
    completedDrills: string[]
    skippedDrills: string[]
    drillScores?: any
    totalTimeSeconds: number
    playerFeedback?: string
  }) => {
    try {
      const { error } = await supabase
        .from('workout_completions')
        .insert([{
          player_id: completionData.playerId,
          workout_id: completionData.workoutId,
          assignment_id: completionData.assignmentId || null,
          completed_drills: completionData.completedDrills,
          skipped_drills: completionData.skippedDrills,
          drill_scores: completionData.drillScores || {},
          total_time_seconds: completionData.totalTimeSeconds,
          player_feedback: completionData.playerFeedback || ''
        }])
      
      if (error) throw error
      
      console.log('✅ Workout completion recorded')
      await fetchAssignments()
    } catch (err: any) {
      console.error('Error recording completion:', err)
      setError(err.message)
      throw err
    }
  }

  return {
    assignments,
    completions,
    loading,
    error,
    createAssignment,
    updateAssignment,
    recordCompletion,
    refreshAssignments: fetchAssignments
  }
}