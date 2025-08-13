import { useState, useEffect } from 'react'

interface PlatformMetrics {
  clubsActive: number
  teamsActive: number
  coachesActive: number
  playersActive: number
  monthlyGrowth: {
    clubs: number
    teams: number
    coaches: number
    players: number
    percentage: number
  }
  tierDistribution: {
    club_os_foundation: number
    club_os_growth: number
    club_os_command: number
    team_hq_structure: number
    team_hq_leadership: number
    team_hq_activated: number
    coach_essentials_kit: number
    coach_confidence_kit: number
  }
}

interface FeatureUsageStats {
  feature: string
  usage_count: number
  unique_users: number
  growth_rate: number
  tier_breakdown: {
    tier: string
    usage_count: number
  }[]
}

interface FeatureUsage {
  practicesPlannerUsage: FeatureUsageStats
  skillsAcademyUsage: FeatureUsageStats
  teamManagementUsage: FeatureUsageStats
  membershipConversions: {
    total_signups: number
    tier_upgrades: number
    downgrades: number
    conversion_rate: number
    monthly_data: {
      month: string
      signups: number
      upgrades: number
      downgrades: number
    }[]
  }
}

interface RevenueData {
  monthlyRecurringRevenue: number
  tierRevenue: {
    tier: string
    revenue: number
    subscribers: number
    averageRevenue: number
  }[]
  churnRate: number
  upgradeDowngradeMetrics: {
    upgrades: number
    downgrades: number
    netChange: number
    upgradeRate: number
    downgradeRate: number
  }
  revenueGrowth: {
    month: string
    revenue: number
    growth_rate: number
  }[]
}

interface PlatformAnalytics {
  metrics: PlatformMetrics
  featureUsage: FeatureUsage
  revenue: RevenueData
  lastUpdated: string
}

// Mock data for demonstration
const mockPlatformAnalytics: PlatformAnalytics = {
  metrics: {
    clubsActive: 24,
    teamsActive: 156,
    coachesActive: 89,
    playersActive: 1247,
    monthlyGrowth: {
      clubs: 3,
      teams: 12,
      coaches: 8,
      players: 67,
      percentage: 8.2
    },
    tierDistribution: {
      club_os_foundation: 12,
      club_os_growth: 8,
      club_os_command: 4,
      team_hq_structure: 45,
      team_hq_leadership: 78,
      team_hq_activated: 33,
      coach_essentials_kit: 56,
      coach_confidence_kit: 33
    }
  },
  featureUsage: {
    practicesPlannerUsage: {
      feature: 'Practice Planner',
      usage_count: 1456,
      unique_users: 89,
      growth_rate: 12.5,
      tier_breakdown: [
        { tier: 'essentials_kit', usage_count: 856 },
        { tier: 'confidence_kit', usage_count: 600 }
      ]
    },
    skillsAcademyUsage: {
      feature: 'Skills Academy',
      usage_count: 2234,
      unique_users: 156,
      growth_rate: 18.3,
      tier_breakdown: [
        { tier: 'essentials_kit', usage_count: 1234 },
        { tier: 'confidence_kit', usage_count: 1000 }
      ]
    },
    teamManagementUsage: {
      feature: 'Team Management',
      usage_count: 3456,
      unique_users: 134,
      growth_rate: 9.7,
      tier_breakdown: [
        { tier: 'team_hq_structure', usage_count: 1200 },
        { tier: 'team_hq_leadership', usage_count: 1456 },
        { tier: 'team_hq_activated', usage_count: 800 }
      ]
    },
    membershipConversions: {
      total_signups: 156,
      tier_upgrades: 23,
      downgrades: 5,
      conversion_rate: 14.7,
      monthly_data: [
        { month: 'Nov 2024', signups: 45, upgrades: 8, downgrades: 2 },
        { month: 'Dec 2024', signups: 56, upgrades: 12, downgrades: 1 },
        { month: 'Jan 2025', signups: 55, upgrades: 3, downgrades: 2 }
      ]
    }
  },
  revenue: {
    monthlyRecurringRevenue: 12480,
    tierRevenue: [
      { tier: 'Club OS Foundation', revenue: 2400, subscribers: 12, averageRevenue: 200 },
      { tier: 'Club OS Growth', revenue: 3200, subscribers: 8, averageRevenue: 400 },
      { tier: 'Club OS Command', revenue: 2800, subscribers: 4, averageRevenue: 700 },
      { tier: 'Team HQ Structure', revenue: 1800, subscribers: 45, averageRevenue: 40 },
      { tier: 'Team HQ Leadership', revenue: 1560, subscribers: 78, averageRevenue: 20 },
      { tier: 'Team HQ Activated', revenue: 660, subscribers: 33, averageRevenue: 20 },
      { tier: 'Coach Essentials Kit', revenue: 280, subscribers: 56, averageRevenue: 5 },
      { tier: 'Coach Confidence Kit', revenue: 990, subscribers: 33, averageRevenue: 30 }
    ],
    churnRate: 3.2,
    upgradeDowngradeMetrics: {
      upgrades: 23,
      downgrades: 5,
      netChange: 18,
      upgradeRate: 2.1,
      downgradeRate: 0.4
    },
    revenueGrowth: [
      { month: 'Oct 2024', revenue: 10200, growth_rate: 0 },
      { month: 'Nov 2024', revenue: 11100, growth_rate: 8.8 },
      { month: 'Dec 2024', revenue: 11800, growth_rate: 6.3 },
      { month: 'Jan 2025', revenue: 12480, growth_rate: 5.8 }
    ]
  },
  lastUpdated: new Date().toISOString()
}

export function usePlatformAnalytics() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadAnalytics()
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadAnalytics()
    }, 5 * 60 * 1000)
    
    setRefreshInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In a real implementation, this would fetch from your analytics API
      setAnalytics(mockPlatformAnalytics)
    } catch (err) {
      setError('Failed to load platform analytics')
      console.error('Error loading platform analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshAnalytics = async () => {
    await loadAnalytics()
  }

  const getMetricGrowth = (metric: keyof PlatformMetrics['monthlyGrowth']) => {
    if (!analytics) return 0
    return analytics.metrics.monthlyGrowth[metric]
  }

  const getTierRevenue = (tier: string) => {
    if (!analytics) return null
    return analytics.revenue.tierRevenue.find(t => t.tier === tier)
  }

  const getFeatureUsage = (feature: keyof FeatureUsage) => {
    if (!analytics || feature === 'membershipConversions') return null
    return analytics.featureUsage[feature] as FeatureUsageStats
  }

  const getRevenueGrowthRate = () => {
    if (!analytics || analytics.revenue.revenueGrowth.length < 2) return 0
    
    const latest = analytics.revenue.revenueGrowth[analytics.revenue.revenueGrowth.length - 1]
    return latest.growth_rate
  }

  const getTotalUsers = () => {
    if (!analytics) return 0
    return analytics.metrics.clubsActive + 
           analytics.metrics.teamsActive + 
           analytics.metrics.coachesActive + 
           analytics.metrics.playersActive
  }

  const getEngagementRate = () => {
    if (!analytics) return 0
    
    const totalUsers = getTotalUsers()
    const activeUsers = analytics.featureUsage.practicesPlannerUsage.unique_users +
                       analytics.featureUsage.skillsAcademyUsage.unique_users +
                       analytics.featureUsage.teamManagementUsage.unique_users
    
    return totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
  }

  const getTopPerformingTier = () => {
    if (!analytics) return null
    
    return analytics.revenue.tierRevenue.reduce((top, tier) => 
      tier.revenue > top.revenue ? tier : top
    )
  }

  const getConversionTrend = () => {
    if (!analytics) return 'stable'
    
    const recent = analytics.featureUsage.membershipConversions.monthly_data.slice(-2)
    if (recent.length < 2) return 'stable'
    
    const currentMonth = recent[1]
    const previousMonth = recent[0]
    
    const currentRate = currentMonth.upgrades / currentMonth.signups
    const previousRate = previousMonth.upgrades / previousMonth.signups
    
    if (currentRate > previousRate * 1.1) return 'increasing'
    if (currentRate < previousRate * 0.9) return 'decreasing'
    return 'stable'
  }

  const calculateChurnImpact = () => {
    if (!analytics) return 0
    
    const avgRevenuePerUser = analytics.revenue.monthlyRecurringRevenue / getTotalUsers()
    const churnedUsers = getTotalUsers() * (analytics.revenue.churnRate / 100)
    
    return Math.round(churnedUsers * avgRevenuePerUser)
  }

  return {
    analytics,
    loading,
    error,
    refreshAnalytics,
    getMetricGrowth,
    getTierRevenue,
    getFeatureUsage,
    getRevenueGrowthRate,
    getTotalUsers,
    getEngagementRate,
    getTopPerformingTier,
    getConversionTrend,
    calculateChurnImpact
  }
}