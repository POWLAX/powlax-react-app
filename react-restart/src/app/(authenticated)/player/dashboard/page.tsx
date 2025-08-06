'use client'

import { useAuth } from '@/contexts/JWTAuthContext'
import { TaskCard } from '@/components/dashboards/TaskCard'
import { StatCard } from '@/components/dashboards/StatCard'
import { SimpleProgressBar } from '@/components/dashboards/SimpleProgressBar'
import { Trophy, Target, TrendingUp, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface PlayerData {
  teamName?: string
  weeklyPoints: number
  weeklyGoal: number
  completedWorkouts: number
  teamRank: number
  hasAssignedWorkout: boolean
}

export default function PlayerDashboardPage() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const [playerData, setPlayerData] = useState<PlayerData>({
    teamName: undefined,
    weeklyPoints: 0,
    weeklyGoal: 100,
    completedWorkouts: 0,
    teamRank: 1,
    hasAssignedWorkout: false
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlayerData() {
      if (!currentUser?.id) return
      
      try {
        // Get player's team
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('team:teams(name)')
          .eq('user_id', currentUser.id)
          .eq('role', 'player')
          .single()
        
        // Get gamification data
        const { data: gamification } = await supabase
          .from('gamification_user_progress')
          .select('total_points, weekly_streak, badges_earned')
          .eq('user_id', currentUser.id)
          .single()
        
        setPlayerData({
          teamName: teamMember?.team?.name ?? undefined,
          weeklyPoints: gamification?.total_points ?? 0,
          weeklyGoal: 100,
          completedWorkouts: Math.floor(Math.random() * 5), // TODO: Get real data
          teamRank: Math.floor(Math.random() * 10) + 1, // TODO: Calculate real rank
          hasAssignedWorkout: Math.random() > 0.5 // TODO: Check real assignments
        })
      } catch (error) {
        console.error('Error fetching player data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && currentUser) {
      fetchPlayerData()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [currentUser, authLoading])

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const playerName = currentUser?.first_name ?? currentUser?.username ?? 'Player'

  // Determine next action
  const getNextAction = () => {
    if (playerData.hasAssignedWorkout) {
      return {
        title: "Complete Your Assigned Workout",
        description: "Your coach assigned a new workout for you",
        actionText: "Start Workout",
        actionUrl: "/skills-academy/workouts",
        priority: 'high' as const
      }
    }
    
    return {
      title: "Choose a Skills Academy Workout",
      description: "Pick a workout to improve your skills",
      actionText: "Browse Academy",
      actionUrl: "/skills-academy",
      priority: 'medium' as const
    }
  }

  const nextAction = getNextAction()

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Section 1: Welcome & Progress */}
      <div className="mb-8 bg-white rounded-lg border p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {playerName}!
        </h1>
        {playerData.teamName && (
          <p className="text-gray-600 mt-2">Team: {playerData.teamName}</p>
        )}
        <div className="mt-6">
          <SimpleProgressBar 
            current={playerData.weeklyPoints} 
            goal={playerData.weeklyGoal}
            label="Weekly Points Goal"
          />
        </div>
      </div>

      {/* Section 2: What to do next */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Next Challenge</h2>
        <TaskCard {...nextAction} />
      </div>

      {/* Section 3: Quick Progress Overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Points This Week"
            value={playerData.weeklyPoints}
            icon={<Trophy className="h-5 w-5" />}
          />
          <StatCard
            title="Workouts Completed"
            value={playerData.completedWorkouts}
            icon={<Target className="h-5 w-5" />}
          />
          <StatCard
            title="Team Rank"
            value={`#${playerData.teamRank}`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>
      </div>
    </div>
  )
}