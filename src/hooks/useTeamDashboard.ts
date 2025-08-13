'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/hooks/useSupabase'

// Using practices table for events (team_events table doesn't exist)
export interface TeamEvent {
  id: string
  team_id: string
  coach_id: string
  name: string
  practice_date: string
  start_time: string | null
  duration_minutes: number | null
  is_public: boolean
  created_at: string
}

export interface TeamStats {
  total_practices: number
  attendance_rate: number
  skills_completed: number
  team_level_progress: number
  recent_achievements: Array<{
    type: string
    title: string
    date: string
    user_name: string
  }>
}

export interface ActivityItem {
  id: string
  team_id: string
  user_id: string
  user_name: string
  activity_type: string
  activity_data: {
    title: string
    description?: string
    icon?: string
  }
  created_at: string
}

export function useTeamDashboard(teamId: string) {
  const { user } = useSupabase()
  const [upcomingEvents, setUpcomingEvents] = useState<TeamEvent[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && teamId) {
      fetchDashboardData()
      
      // Set up real-time subscriptions for practices table
      const practicesSub = supabase
        .channel('team-practices')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'practices', filter: `team_id=eq.${teamId}` },
          () => fetchUpcomingEvents()
        )
        .subscribe()

      // Subscribe to user progress for activity updates
      const progressSub = supabase
        .channel('user-progress')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'skills_academy_user_progress' },
          () => fetchRecentActivity()
        )
        .subscribe()

      return () => {
        practicesSub.unsubscribe()
        progressSub.unsubscribe()
      }
    }
  }, [user, teamId])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchUpcomingEvents(),
        fetchTeamStats(),
        fetchRecentActivity()
      ])
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchUpcomingEvents = async () => {
    try {
      // Query real practices table
      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .eq('team_id', teamId)
        .gte('practice_date', new Date().toISOString().split('T')[0])
        .order('practice_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5)

      if (error) {
        console.error('Error fetching practices:', error)
        setUpcomingEvents([])
        return
      }

      // Transform practices data to TeamEvent format
      const events: TeamEvent[] = (data || []).map(practice => ({
        id: practice.id,
        team_id: practice.team_id,
        coach_id: practice.coach_id,
        name: practice.name || '(No Name)',
        practice_date: practice.practice_date,
        start_time: practice.start_time,
        duration_minutes: practice.duration_minutes,
        is_public: practice.is_public || false,
        created_at: practice.created_at
      }))

      setUpcomingEvents(events)
    } catch (err: any) {
      console.error('Error fetching upcoming practices:', err)
      setUpcomingEvents([])
    }
  }

  const fetchTeamStats = async () => {
    try {
      // Get team members first
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)

      if (membersError || !members) {
        console.error('Error fetching team members:', membersError)
        setTeamStats(null)
        return
      }

      const memberIds = members.map(m => m.user_id)

      // Get total practices count
      const { count: practiceCount } = await supabase
        .from('practices')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId)

      // Get skills completed by team members
      const { data: progressData, error: progressError } = await supabase
        .from('skills_academy_user_progress')
        .select('*')
        .in('user_id', memberIds)
        .eq('status', 'completed')

      // Get recent badges earned by team members
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select(`
          *,
          users!user_badges_user_id_fkey (
            display_name,
            first_name,
            last_name
          )
        `)
        .in('user_id', memberIds)
        .order('earned_at', { ascending: false })
        .limit(5)

      // Calculate stats
      const stats: TeamStats = {
        total_practices: practiceCount || 0,
        attendance_rate: 0, // No attendance table exists yet
        skills_completed: progressData?.length || 0,
        team_level_progress: Math.min(100, Math.round(((progressData?.length || 0) / (memberIds.length * 10)) * 100)),
        recent_achievements: (badgesData || []).map(badge => ({
          type: 'badge',
          title: badge.badge_name || 'Achievement',
          date: badge.earned_at,
          user_name: badge.users?.display_name || 
                     `${badge.users?.first_name || ''} ${badge.users?.last_name || ''}`.trim() ||
                     'Team Member'
        }))
      }

      setTeamStats(stats)
    } catch (err: any) {
      console.error('Error fetching team stats:', err)
      setTeamStats(null)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // Get team members
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)

      if (membersError || !members) {
        console.error('Error fetching team members:', membersError)
        setRecentActivity([])
        return
      }

      const memberIds = members.map(m => m.user_id)

      // Fetch recent skill completions
      const { data: skillsData, error: skillsError } = await supabase
        .from('skills_academy_user_progress')
        .select(`
          *,
          users!skills_academy_user_progress_user_id_fkey (
            display_name,
            first_name,
            last_name
          ),
          skills_academy_workouts (
            name
          )
        `)
        .in('user_id', memberIds)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5)

      // Fetch recent badges earned
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select(`
          *,
          users!user_badges_user_id_fkey (
            display_name,
            first_name,
            last_name
          )
        `)
        .in('user_id', memberIds)
        .order('earned_at', { ascending: false })
        .limit(5)

      // Combine and format activities
      const activities: ActivityItem[] = []

      // Add skill completions
      if (skillsData) {
        skillsData.forEach(skill => {
          const userName = skill.users?.display_name || 
                          `${skill.users?.first_name || ''} ${skill.users?.last_name || ''}`.trim() ||
                          'Team Member'
          activities.push({
            id: `skill-${skill.id}`,
            team_id: teamId,
            user_id: skill.user_id,
            user_name: userName,
            activity_type: 'skill_completed',
            activity_data: {
              title: `Completed ${skill.skills_academy_workouts?.name || 'workout'}`,
              description: `Earned ${skill.points_earned || 0} points`,
              icon: 'target'
            },
            created_at: skill.completed_at
          })
        })
      }

      // Add badge earnings
      if (badgesData) {
        badgesData.forEach(badge => {
          const userName = badge.users?.display_name || 
                          `${badge.users?.first_name || ''} ${badge.users?.last_name || ''}`.trim() ||
                          'Team Member'
          activities.push({
            id: `badge-${badge.id}`,
            team_id: teamId,
            user_id: badge.user_id,
            user_name: userName,
            activity_type: 'badge_earned',
            activity_data: {
              title: `Earned ${badge.badge_name || 'Achievement'} badge`,
              description: `${badge.points_awarded || 0} points awarded`,
              icon: 'trophy'
            },
            created_at: badge.earned_at
          })
        })
      }

      // Sort by date and limit
      activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      setRecentActivity(activities.slice(0, 10))
    } catch (err: any) {
      console.error('Error fetching recent activity:', err)
      setRecentActivity([])
    }
  }

  const createEvent = async (eventData: Omit<TeamEvent, 'id' | 'team_id' | 'coach_id' | 'created_at'>) => {
    try {
      // Create practice in practices table
      const { data, error } = await supabase
        .from('practices')
        .insert([{
          team_id: teamId,
          coach_id: user!.id,
          name: eventData.name,
          practice_date: eventData.practice_date,
          start_time: eventData.start_time,
          duration_minutes: eventData.duration_minutes,
          is_public: eventData.is_public || false
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating practice:', error)
        return { data: null, error: error.message }
      }

      // Refresh events list
      await fetchUpcomingEvents()
      return { data, error: null }
    } catch (err: any) {
      console.error('Error creating practice:', err)
      return { data: null, error: err.message }
    }
  }

  const sendAnnouncement = async (title: string, content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') => {
    try {
      // Since team_announcements table doesn't exist, we'll return a placeholder
      // In production, this would need a proper announcements table
      console.log('Announcement feature not yet implemented - needs announcements table')
      console.log('Title:', title, 'Content:', content, 'Priority:', priority)
      
      // For now, just add to local state as a placeholder
      const { data: userData } = await supabase
        .from('users')
        .select('display_name, first_name, last_name')
        .eq('id', user!.id)
        .single()

      const userName = userData?.display_name || 
                      `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() ||
                      'Coach'

      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        team_id: teamId,
        user_id: user!.id,
        user_name: userName,
        activity_type: 'announcement',
        activity_data: {
          title: `(LOCAL ONLY) ${title}`,
          description: content.substring(0, 100),
          icon: 'megaphone'
        },
        created_at: new Date().toISOString()
      }

      setRecentActivity([newActivity, ...recentActivity])
      return { success: true, error: null }
    } catch (err: any) {
      console.error('Error with announcement:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    upcomingEvents,
    teamStats,
    recentActivity,
    loading,
    error,
    createEvent,
    sendAnnouncement,
    refetch: fetchDashboardData
  }
}