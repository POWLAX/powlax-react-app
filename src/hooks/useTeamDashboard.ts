'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSupabase } from '@/hooks/useSupabase'

export interface TeamEvent {
  id: string
  team_id: string
  event_type: 'practice' | 'game' | 'tournament' | 'meeting'
  title: string
  start_time: string
  end_time: string
  location: string
  description?: string
  weather_conditions?: {
    temp?: number
    conditions?: string
    wind?: string
  }
  created_by: string
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
      
      // Set up real-time subscriptions
      const eventsSub = supabase
        .channel('team-events')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'team_events', filter: `team_id=eq.${teamId}` },
          () => fetchUpcomingEvents()
        )
        .subscribe()

      const activitySub = supabase
        .channel('team-activity')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'team_activity_feed', filter: `team_id=eq.${teamId}` },
          () => fetchRecentActivity()
        )
        .subscribe()

      return () => {
        eventsSub.unsubscribe()
        activitySub.unsubscribe()
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
      // Mock data for now - replace with actual Supabase query
      const mockEvents: TeamEvent[] = [
        {
          id: '1',
          team_id: teamId,
          event_type: 'practice',
          title: 'Team Practice',
          start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
          location: 'Field 2',
          description: 'Focus on shooting and transition offense',
          weather_conditions: {
            temp: 72,
            conditions: 'Sunny',
            wind: '5 mph'
          },
          created_by: user!.id
        },
        {
          id: '2',
          team_id: teamId,
          event_type: 'game',
          title: 'vs Eagles',
          start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
          end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          location: 'Memorial Stadium',
          created_by: user!.id
        }
      ]

      setUpcomingEvents(mockEvents)

      /* 
      // Actual Supabase implementation:
      const { data, error } = await supabase
        .from('team_events')
        .select('*')
        .eq('team_id', teamId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5)

      if (error) throw error
      setUpcomingEvents(data || [])
      */
    } catch (err: any) {
      console.error('Error fetching events:', err)
    }
  }

  const fetchTeamStats = async () => {
    try {
      // Mock data for now - replace with actual aggregation queries
      const mockStats: TeamStats = {
        total_practices: 24,
        attendance_rate: 85,
        skills_completed: 67,
        team_level_progress: 73,
        recent_achievements: [
          {
            type: 'badge',
            title: 'Passing Master',
            date: '2025-01-05',
            user_name: 'Mike Johnson'
          },
          {
            type: 'milestone',
            title: '50 Practices Attended',
            date: '2025-01-04',
            user_name: 'Sarah Wilson'
          }
        ]
      }

      setTeamStats(mockStats)

      /*
      // Actual implementation would aggregate from multiple tables:
      // - practice_attendance for attendance_rate
      // - user_badge_progress_powlax for skills_completed
      // - team_activity_feed for recent_achievements
      */
    } catch (err: any) {
      console.error('Error fetching team stats:', err)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // Mock data for now
      const mockActivity: ActivityItem[] = [
        {
          id: '1',
          team_id: teamId,
          user_id: 'user1',
          user_name: 'Coach Johnson',
          activity_type: 'practice_created',
          activity_data: {
            title: 'Created practice for tomorrow',
            description: '4:00 PM at Field 2',
            icon: 'calendar-plus'
          },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: '2',
          team_id: teamId,
          user_id: 'user2',
          user_name: 'Mike Johnson',
          activity_type: 'badge_earned',
          activity_data: {
            title: 'Earned Passing Master badge',
            icon: 'trophy'
          },
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
        },
        {
          id: '3',
          team_id: teamId,
          user_id: 'user3',
          user_name: 'Sarah Wilson',
          activity_type: 'announcement',
          activity_data: {
            title: 'Posted team reminder',
            description: 'Don\'t forget cleats for tomorrow\'s practice',
            icon: 'megaphone'
          },
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
        }
      ]

      setRecentActivity(mockActivity)

      /*
      // Actual implementation:
      const { data, error } = await supabase
        .from('team_activity_feed')
        .select(`
          *,
          user:users(name, email)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setRecentActivity(data || [])
      */
    } catch (err: any) {
      console.error('Error fetching recent activity:', err)
    }
  }

  const createEvent = async (eventData: Omit<TeamEvent, 'id' | 'team_id' | 'created_by'>) => {
    try {
      // Mock success for now
      const newEvent: TeamEvent = {
        ...eventData,
        id: Date.now().toString(),
        team_id: teamId,
        created_by: user!.id
      }

      setUpcomingEvents([newEvent, ...upcomingEvents])
      return { data: newEvent, error: null }

      /*
      // Actual implementation:
      const { data, error } = await supabase
        .from('team_events')
        .insert([{
          ...eventData,
          team_id: teamId,
          created_by: user!.id
        }])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
      */
    } catch (err: any) {
      console.error('Error creating event:', err)
      return { data: null, error: err.message }
    }
  }

  const sendAnnouncement = async (title: string, content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') => {
    try {
      // Mock success - add to activity feed
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        team_id: teamId,
        user_id: user!.id,
        user_name: 'Coach', // Would get from user data
        activity_type: 'announcement',
        activity_data: {
          title: `Posted announcement: ${title}`,
          description: content.substring(0, 100),
          icon: 'megaphone'
        },
        created_at: new Date().toISOString()
      }

      setRecentActivity([newActivity, ...recentActivity])
      return { success: true, error: null }

      /*
      // Actual implementation:
      const { error } = await supabase
        .from('team_announcements')
        .insert([{
          team_id: teamId,
          author_id: user!.id,
          title,
          content,
          priority,
          target_roles: ['player', 'parent', 'coach']
        }])

      if (error) throw error
      return { success: true, error: null }
      */
    } catch (err: any) {
      console.error('Error sending announcement:', err)
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