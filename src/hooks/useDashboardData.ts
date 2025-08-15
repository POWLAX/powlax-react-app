'use client'

import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Hook to fetch dashboard data - NO AUTH VERSION
 * Returns simple mock data for dashboard display
 */
export function useDashboardData() {
  const { user } = useAuth(); // Mock user always available

  // Simple mock data return - no complex auth logic
  const dashboardData = {
    stats: {
      totalWorkouts: 166,
      completedWorkouts: 0,
      totalDrills: 167,
      favoriteCount: 0
    },
    recentActivity: [],
    upcomingPractices: [],
    achievements: []
  };

  return {
    data: dashboardData,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve({ data: dashboardData })
  };
}