'use client'

import { useViewAsAuth } from '@/hooks/useViewAsAuth'
import { Loader2 } from 'lucide-react'

// Import all dashboard components
import { PlayerDashboard } from '@/components/dashboards/PlayerDashboard'
import { CoachDashboard } from '@/components/dashboards/CoachDashboard'
import { ParentDashboard } from '@/components/dashboards/ParentDashboard'
import { DirectorDashboard } from '@/components/dashboards/DirectorDashboard'
import { AdminDashboard } from '@/components/dashboards/AdminDashboard'
import { PublicDashboard } from '@/components/dashboards/PublicDashboard'

export default function DashboardPage() {
  const { user, loading } = useViewAsAuth()

  // Temporarily bypass loading check to fix infinite spinner
  // Show loading spinner while authentication is being verified
  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
  //         <p className="mt-4 text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // Route to appropriate dashboard based on role
  if (!user) {
    return <PublicDashboard />
  }

  switch (user.role) {
    case 'player':
      return <PlayerDashboard user={user} />
    case 'team_coach':
      return <CoachDashboard />
    case 'parent':
      return <ParentDashboard user={user} />
    case 'club_director':
      return <DirectorDashboard user={user} />
    case 'administrator':
      return <AdminDashboard user={user} />
    default:
      // Default to player dashboard for unknown roles
      return <PlayerDashboard user={user} />
  }
}