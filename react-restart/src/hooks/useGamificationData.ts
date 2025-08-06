'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface GamificationData {
  totalPoints: number
  pointsByType: {
    lax_credit: number
    attack_token: number
    defense_dollar: number
    midfield_medal: number
    rebound_reward: number
    flex_points: number
  }
  currentRank: {
    name: string
    level: number
    nextRank: string
    progressToNext: number
    pointsToNext: number
  }
  streaks: {
    current: number
    longest: number
    lastActive: string
  }
  badges: {
    total: number
    bronze: number
    silver: number
    gold: number
    recent: BadgeInfo[]
  }
  achievements: Achievement[]
  weeklyProgress: WeeklyData[]
}

interface BadgeInfo {
  id: string
  name: string
  description: string
  tier: 'bronze' | 'silver' | 'gold'
  earnedDate: string
  category: string
  imageUrl?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  progress: number
  total: number
  reward: number
  rewardType: string
  completed: boolean
}

interface WeeklyData {
  day: string
  points: number
  workouts: number
}

export function useGamificationData(userId?: string) {
  const [data, setData] = useState<GamificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchGamificationData(userId)
    } else {
      // Use current user if no userId provided
      fetchCurrentUserGamification()
    }
  }, [userId])

  const fetchGamificationData = async (targetUserId: string) => {
    try {
      setLoading(true)
      setError(null)

      // TODO: Fetch real gamification data from Supabase
      // For now, using mock data structure that matches what we expect
      
      // Placeholder queries that would fetch real data:
      /*
      const { data: userPoints } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', targetUserId)
        .single()

      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', targetUserId)
        .order('earned_at', { ascending: false })

      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', targetUserId)

      const { data: userActivity } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
      */

      // For now, return mock data
      setData(generateMockGamificationData(targetUserId))

    } catch (err: any) {
      console.error('Error fetching gamification data:', err)
      setError(err.message || 'Failed to load gamification data')
      // Still provide mock data as fallback
      setData(generateMockGamificationData(targetUserId))
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentUserGamification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await fetchGamificationData(user.id)
      } else {
        setError('No authenticated user found')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Error fetching current user:', err)
      setError('Authentication error')
      setLoading(false)
    }
  }

  const calculateRankProgress = (points: number) => {
    const ranks = [
      { name: 'Rookie', level: 1, minPoints: 0 },
      { name: 'Starter', level: 2, minPoints: 500 },
      { name: 'Varsity', level: 3, minPoints: 1500 },
      { name: 'All-Conference', level: 5, minPoints: 5000 },
      { name: 'All-State', level: 7, minPoints: 10000 },
      { name: 'All-American', level: 10, minPoints: 25000 }
    ]

    const currentRank = ranks.reverse().find(rank => points >= rank.minPoints) || ranks[ranks.length - 1]
    const nextRankIndex = ranks.findIndex(rank => rank.level === currentRank.level) - 1
    const nextRank = nextRankIndex >= 0 ? ranks[nextRankIndex] : null

    if (!nextRank) {
      return {
        name: currentRank.name,
        level: currentRank.level,
        nextRank: 'Max Level',
        progressToNext: 100,
        pointsToNext: 0
      }
    }

    const pointsToNext = nextRank.minPoints - points
    const progressToNext = ((points - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100

    return {
      name: currentRank.name,
      level: currentRank.level,
      nextRank: nextRank.name,
      progressToNext: Math.min(progressToNext, 100),
      pointsToNext: Math.max(pointsToNext, 0)
    }
  }

  return { 
    data, 
    loading, 
    error,
    refresh: () => userId ? fetchGamificationData(userId) : fetchCurrentUserGamification()
  }
}

// Helper function to generate mock data for development
function generateMockGamificationData(userId: string): GamificationData {
  const totalPoints = Math.floor(Math.random() * 10000) + 1000
  
  return {
    totalPoints,
    pointsByType: {
      lax_credit: Math.floor(totalPoints * 0.4),
      attack_token: Math.floor(totalPoints * 0.2),
      defense_dollar: Math.floor(totalPoints * 0.15),
      midfield_medal: Math.floor(totalPoints * 0.15),
      rebound_reward: Math.floor(totalPoints * 0.08),
      flex_points: Math.floor(totalPoints * 0.02)
    },
    currentRank: calculateRankFromPoints(totalPoints),
    streaks: {
      current: Math.floor(Math.random() * 20) + 1,
      longest: Math.floor(Math.random() * 50) + 10,
      lastActive: new Date().toISOString()
    },
    badges: {
      total: Math.floor(Math.random() * 25) + 5,
      bronze: Math.floor(Math.random() * 15) + 3,
      silver: Math.floor(Math.random() * 8) + 2,
      gold: Math.floor(Math.random() * 5) + 1,
      recent: generateMockBadges()
    },
    achievements: generateMockAchievements(),
    weeklyProgress: generateMockWeeklyData()
  }
}

function calculateRankFromPoints(points: number) {
  const ranks = [
    { name: 'Rookie', level: 1, minPoints: 0 },
    { name: 'Starter', level: 2, minPoints: 500 },
    { name: 'Varsity', level: 3, minPoints: 1500 },
    { name: 'All-Conference', level: 5, minPoints: 5000 },
    { name: 'All-State', level: 7, minPoints: 10000 },
    { name: 'All-American', level: 10, minPoints: 25000 }
  ]

  const currentRank = ranks.reverse().find(rank => points >= rank.minPoints) || ranks[ranks.length - 1]
  const nextRankIndex = ranks.findIndex(rank => rank.level === currentRank.level) - 1
  const nextRank = nextRankIndex >= 0 ? ranks[nextRankIndex] : null

  if (!nextRank) {
    return {
      name: currentRank.name,
      level: currentRank.level,
      nextRank: 'Max Level',
      progressToNext: 100,
      pointsToNext: 0
    }
  }

  const pointsToNext = nextRank.minPoints - points
  const progressToNext = ((points - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100

  return {
    name: currentRank.name,
    level: currentRank.level,
    nextRank: nextRank.name,
    progressToNext: Math.min(progressToNext, 100),
    pointsToNext: Math.max(pointsToNext, 0)
  }
}

function generateMockBadges(): BadgeInfo[] {
  const badges = [
    { name: 'First Steps', tier: 'bronze', description: 'Complete your first workout', category: 'Getting Started' },
    { name: 'Week Warrior', tier: 'silver', description: '7-day practice streak', category: 'Consistency' },
    { name: 'Wall Ball Master', tier: 'gold', description: 'Complete 50 wall ball workouts', category: 'Wall Ball' },
    { name: 'Attack Specialist', tier: 'silver', description: 'Master 20 attack drills', category: 'Attack' },
    { name: 'Defensive Rock', tier: 'bronze', description: 'Complete 10 defense workouts', category: 'Defense' }
  ]

  return badges.slice(0, 3).map((badge, index) => ({
    id: `badge-${index}`,
    ...badge,
    tier: badge.tier as 'bronze' | 'silver' | 'gold',
    earnedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }))
}

function generateMockAchievements(): Achievement[] {
  return [
    {
      id: 'achievement-1',
      title: 'Attack Master',
      description: 'Complete 100 attack-focused drills',
      progress: Math.floor(Math.random() * 80) + 20,
      total: 100,
      reward: 500,
      rewardType: 'attack_token',
      completed: false
    },
    {
      id: 'achievement-2',
      title: 'Marathon Month',
      description: 'Work out every day for 30 days',
      progress: Math.floor(Math.random() * 25) + 5,
      total: 30,
      reward: 1000,
      rewardType: 'lax_credit',
      completed: false
    }
  ]
}

function generateMockWeeklyData(): WeeklyData[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map(day => ({
    day,
    points: Math.floor(Math.random() * 200),
    workouts: Math.floor(Math.random() * 3)
  }))
}