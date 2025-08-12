'use client'

import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useRoleViewer } from '@/contexts/RoleViewerContext'
import { Loader2 } from 'lucide-react'

// Import all dashboard components
import { PlayerDashboard } from '@/components/dashboards/PlayerDashboard'
import { CoachDashboard } from '@/components/dashboards/CoachDashboard'
import { ParentDashboard } from '@/components/dashboards/ParentDashboard'
import { DirectorDashboard } from '@/components/dashboards/DirectorDashboard'
import { AdminDashboard } from '@/components/dashboards/AdminDashboard'
import { PublicDashboard } from '@/components/dashboards/PublicDashboard'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { viewingRole, isViewingAs } = useRoleViewer()

  console.log('[Dashboard] User:', user ? `${user.email} (role: ${user.role})` : 'No user')
  console.log('[Dashboard] Loading:', loading)
  console.log('[Dashboard] Role Viewer:', { viewingRole, isViewingAs })

  // For development: Create a test user if no auth user exists
  const testUser = user || {
    id: 'test-user',
    email: 'test@example.com',
    display_name: 'Test Admin',
    role: 'administrator', // Default to admin so role switcher appears
    roles: ['administrator']
  }

  // Temporarily bypass loading for development
  if (loading) {
    console.log('[Dashboard] Still loading, showing dashboard anyway for development')
  }

  // Always show a dashboard (use testUser if no real user)
  const currentUser = testUser

  // Determine the effective role to display
  // If viewing as another role, use that role; otherwise use the user's actual role
  const effectiveRole = isViewingAs ? viewingRole : currentUser.role
  
  console.log('[Dashboard] Using user:', currentUser.email)
  console.log('[Dashboard] Effective role:', effectiveRole)

  // Route to appropriate dashboard based on effective role
  switch (effectiveRole) {
    case 'player':
      return <PlayerDashboard user={{ ...currentUser, role: 'player' }} />
    case 'team_coach':
      return <CoachDashboard user={{ ...currentUser, role: 'team_coach' }} />
    case 'parent':
      return <ParentDashboard user={{ ...currentUser, role: 'parent' }} />
    case 'club_director':
      return <DirectorDashboard user={{ ...currentUser, role: 'club_director' }} />
    case 'administrator':
    case null: // null means admin viewing as admin (their actual role)
      return <AdminDashboard user={{ ...currentUser, role: 'administrator' }} />
    default:
      console.log('[Dashboard] Unknown role:', effectiveRole, 'defaulting to admin dashboard')
      return <AdminDashboard user={{ ...currentUser, role: 'administrator' }} />
  }
}