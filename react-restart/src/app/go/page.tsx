'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/JWTAuthContext'
import { 
  Home, Users, Target, Calendar, GraduationCap, Trophy, 
  Settings, FolderOpen, FileText, Shield, RefreshCw,
  ChevronRight, Lock, Globe, TestTube, Gauge, Video,
  BookOpen, PenTool, UserCog, Zap, MapPin, BarChart
} from 'lucide-react'

interface RouteCategory {
  title: string
  icon: any
  routes: RouteLink[]
}

interface RouteLink {
  path: string
  title: string
  icon?: any
  description?: string
}

// Define all application routes organized by category
const routeCategories: RouteCategory[] = [
  {
    title: 'Main',
    icon: Home,
    routes: [
      { path: '/', title: 'Home', icon: Home },
      { path: '/dashboard', title: 'Dashboard', icon: Gauge },
    ]
  },
  {
    title: 'Skills Academy',
    icon: GraduationCap,
    routes: [
      { path: '/skills-academy', title: 'Skills Academy', icon: GraduationCap },
      { path: '/skills-academy/courses', title: 'Courses', icon: BookOpen },
      { path: '/skills-academy/quizzes', title: 'Quizzes', icon: FileText },
      { path: '/skills-academy/progress', title: 'Progress Tracker', icon: BarChart },
      { path: '/skills-academy/workouts', title: 'Workouts', icon: Video },
      { path: '/skills-academy/workout-builder', title: 'Workout Builder', icon: PenTool },
    ]
  },
  {
    title: 'Teams & Practice',
    icon: Users,
    routes: [
      { path: '/teams', title: 'My Teams', icon: Users },
      { path: '/teams/[teamId]/practice-plans', title: 'Practice Planner', icon: Calendar, description: 'Requires team selection' },
      { path: '/teams/[teamId]/roster', title: 'Team Roster', icon: Users, description: 'Requires team selection' },
      { path: '/teams/[teamId]/schedule', title: 'Team Schedule', icon: Calendar, description: 'Requires team selection' },
    ]
  },
  {
    title: 'Resources',
    icon: FolderOpen,
    routes: [
      { path: '/drills', title: 'Drill Library', icon: Target },
      { path: '/strategies', title: 'Strategies', icon: MapPin },
      { path: '/resources', title: 'Resources', icon: FolderOpen },
    ]
  },
  {
    title: 'Gamification',
    icon: Trophy,
    routes: [
      { path: '/gamification', title: 'Gamification Dashboard', icon: Trophy },
      { path: '/leaderboard', title: 'Leaderboard', icon: Trophy },
      { path: '/achievements', title: 'Achievements', icon: Trophy },
    ]
  },
  {
    title: 'Admin',
    icon: Shield,
    routes: [
      { path: '/admin', title: 'Admin Dashboard', icon: Shield },
      { path: '/admin/content-editor', title: 'Content Editor', icon: PenTool },
      { path: '/admin/content-editor/drills/[id]', title: 'Edit Drill', icon: Target, description: 'Requires drill ID' },
      { path: '/admin/content-editor/strategies/[id]', title: 'Edit Strategy', icon: MapPin, description: 'Requires strategy ID' },
      { path: '/admin/content-editor/academy/[id]', title: 'Edit Academy Content', icon: GraduationCap, description: 'Requires content ID' },
      { path: '/admin/role-management', title: 'Role Management', icon: UserCog },
      { path: '/admin/sync', title: 'Data Sync', icon: RefreshCw },
      { path: '/admin/users', title: 'User Management', icon: Users },
      { path: '/admin/analytics', title: 'Analytics', icon: BarChart },
    ]
  },
  {
    title: 'Account',
    icon: Settings,
    routes: [
      { path: '/profile', title: 'My Profile', icon: Users },
      { path: '/settings', title: 'Settings', icon: Settings },
      { path: '/auth/login', title: 'Login', icon: Lock },
    ]
  },
  {
    title: 'Demo Pages',
    icon: TestTube,
    routes: [
      { path: '/demo', title: 'Demo Hub', icon: TestTube },
      { path: '/demo/player-profile', title: 'Player Profile Demo', icon: Users },
      { path: '/demo/gamification', title: 'Gamification Demo', icon: Trophy },
      { path: '/demo/strategies', title: 'Strategies Demo', icon: MapPin },
      { path: '/demo/practice-planner', title: 'Practice Planner Demo', icon: Calendar },
      { path: '/demo/skills-academy', title: 'Skills Academy Demo', icon: GraduationCap },
      { path: '/demo/skills-academy/progress', title: 'Progress Demo', icon: BarChart },
      { path: '/demo/skills-academy/workouts', title: 'Workouts Demo', icon: Video },
      { path: '/demo/skills-academy/interactive-workout', title: 'Interactive Workout Demo', icon: Zap },
    ]
  },
  {
    title: 'Testing',
    icon: TestTube,
    routes: [
      { path: '/test/auth', title: 'Auth Test', icon: Lock },
      { path: '/test-gamification', title: 'Gamification Test', icon: Trophy },
      { path: '/debug', title: 'Debug Tools', icon: TestTube },
    ]
  }
]

export default function GoPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Check if user is admin
    if (!loading && mounted) {
      if (!user) {
        router.push('/auth/login')
      } else if (user.role !== 'admin') {
        router.push('/dashboard')
      }
    }
  }, [user, loading, router, mounted])

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading directory...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">This page is restricted to administrators only.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="h-8 w-8 text-blue-600" />
                  POWLAX Site Directory
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Quick navigation to all pages in the application
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Logged in as: <span className="font-semibold">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routeCategories.map((category) => {
            const CategoryIcon = category.icon
            return (
              <div key={category.title} className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5 text-blue-600" />
                    {category.title}
                  </h2>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {category.routes.map((route) => {
                      const RouteIcon = route.icon || ChevronRight
                      const isParameterized = route.path.includes('[')
                      
                      return (
                        <li key={route.path}>
                          {isParameterized ? (
                            <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 text-gray-500">
                              <RouteIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm">{route.title}</span>
                                {route.description && (
                                  <p className="text-xs text-gray-400 mt-0.5">{route.description}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <Link
                              href={route.path}
                              className="flex items-start gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                            >
                              <RouteIcon className="h-4 w-4 mt-0.5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium">
                                  {route.title}
                                </span>
                                {route.description && (
                                  <p className="text-xs text-gray-400 mt-0.5">{route.description}</p>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600 flex-shrink-0" />
                            </Link>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Directory Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {routeCategories.reduce((acc, cat) => acc + cat.routes.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Routes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {routeCategories.length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {routeCategories.filter(cat => cat.title === 'Admin')[0]?.routes.length || 0}
              </div>
              <div className="text-sm text-gray-600">Admin Pages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {routeCategories.filter(cat => cat.title === 'Demo Pages')[0]?.routes.length || 0}
              </div>
              <div className="text-sm text-gray-600">Demo Pages</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}