'use client'

import React, { useState, useMemo } from 'react'
import { Search, AlertCircle, CheckCircle, XCircle, AlertTriangle, Database, Code, FileText, Users, Zap, Shield, Package, Layers, Activity, Settings, Gamepad, Grid3x3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { componentPreviews, defaultPreview } from './component-preview'

// Component data extracted from analysis documents
const componentCategories = {
  'ui-foundation': {
    name: 'UI Foundation',
    icon: <Layers className="h-4 w-4" />,
    count: 21,
    score: 100,
    description: '100% Shadcn/UI based components',
    components: [
      { name: 'Button', path: 'src/components/ui/button.tsx', status: 'ready', database: [], mockData: 0, usage: ['All pages'], critical: false },
      { name: 'Card', path: 'src/components/ui/card.tsx', status: 'ready', database: [], mockData: 0, usage: ['All pages'], critical: false },
      { name: 'Input', path: 'src/components/ui/input.tsx', status: 'ready', database: [], mockData: 0, usage: ['Forms', 'Search'], critical: false },
      { name: 'Dialog', path: 'src/components/ui/dialog.tsx', status: 'ready', database: [], mockData: 0, usage: ['Modals'], critical: false },
      { name: 'Select', path: 'src/components/ui/select.tsx', status: 'ready', database: [], mockData: 0, usage: ['Forms'], critical: false },
      { name: 'Table', path: 'src/components/ui/table.tsx', status: 'ready', database: [], mockData: 0, usage: ['Admin', 'Teams'], critical: false },
      { name: 'Tabs', path: 'src/components/ui/tabs.tsx', status: 'ready', database: [], mockData: 0, usage: ['Practice Planner'], critical: false },
      { name: 'Progress', path: 'src/components/ui/progress.tsx', status: 'ready', database: [], mockData: 0, usage: ['Skills Academy'], critical: false },
      { name: 'Badge', path: 'src/components/ui/badge.tsx', status: 'ready', database: [], mockData: 0, usage: ['Status indicators'], critical: false },
      { name: 'Avatar', path: 'src/components/ui/avatar.tsx', status: 'ready', database: [], mockData: 0, usage: ['Teams'], critical: false },
      { name: 'Checkbox', path: 'src/components/ui/checkbox.tsx', status: 'ready', database: [], mockData: 0, usage: ['Forms'], critical: false },
      { name: 'Label', path: 'src/components/ui/label.tsx', status: 'ready', database: [], mockData: 0, usage: ['Forms'], critical: false },
      { name: 'Textarea', path: 'src/components/ui/textarea.tsx', status: 'ready', database: [], mockData: 0, usage: ['Notes'], critical: false },
      { name: 'Accordion', path: 'src/components/ui/accordion.tsx', status: 'ready', database: [], mockData: 0, usage: ['FAQs'], critical: false },
      { name: 'ScrollArea', path: 'src/components/ui/scroll-area.tsx', status: 'ready', database: [], mockData: 0, usage: ['Long content'], critical: false },
      { name: 'Separator', path: 'src/components/ui/separator.tsx', status: 'ready', database: [], mockData: 0, usage: ['Layout'], critical: false },
      { name: 'DropdownMenu', path: 'src/components/ui/dropdown-menu.tsx', status: 'ready', database: [], mockData: 0, usage: ['Context menus'], critical: false },
      { name: 'Skeleton', path: 'src/components/ui/skeleton.tsx', status: 'ready', database: [], mockData: 0, usage: ['Loading states'], critical: false },
      { name: 'Slider', path: 'src/components/ui/slider.tsx', status: 'ready', database: [], mockData: 0, usage: ['Settings'], critical: false },
      { name: 'Switch', path: 'src/components/ui/switch.tsx', status: 'ready', database: [], mockData: 0, usage: ['Settings'], critical: false },
      { name: 'Toast', path: 'src/components/ui/toast.tsx', status: 'ready', database: [], mockData: 0, usage: ['Notifications'], critical: false }
    ]
  },
  'dashboard': {
    name: 'Dashboard System',
    icon: <Activity className="h-4 w-4" />,
    count: 12,
    score: 65,
    description: 'Role-based dashboard components',
    components: [
      { 
        name: 'PlayerDashboard', 
        path: 'src/components/dashboards/PlayerDashboard.tsx', 
        status: 'blocked', 
        database: [], 
        mockData: 100, 
        usage: ['/dashboard'], 
        critical: true,
        issues: ['100% mock data', 'Highest user touchpoint', 'No database connection']
      },
      { 
        name: 'ParentDashboard', 
        path: 'src/components/dashboards/ParentDashboard.tsx', 
        status: 'ready', 
        database: ['parent_child_relationships', 'users', 'user_points_wallets', 'user_badges', 'skills_academy_user_progress', 'team_members', 'teams', 'clubs'], 
        mockData: 30, 
        usage: ['/dashboard'],
        critical: false,
        excellence: 'Gold standard implementation'
      },
      { 
        name: 'CoachDashboard', 
        path: 'src/components/dashboards/CoachDashboard.tsx', 
        status: 'ready', 
        database: ['user_favorites', 'powlax_drills', 'powlax_strategies'], 
        mockData: 20, 
        usage: ['/dashboard'],
        critical: false,
        excellence: 'Permanence pattern implementation'
      },
      { 
        name: 'AdminDashboard', 
        path: 'src/components/dashboards/AdminDashboard.tsx', 
        status: 'needs-work', 
        database: [], 
        mockData: 85, 
        usage: ['/dashboard'],
        critical: false,
        issues: ['85% mock data despite Supabase imports']
      },
      { 
        name: 'DirectorDashboard', 
        path: 'src/components/dashboards/DirectorDashboard.tsx', 
        status: 'ready', 
        database: ['clubs', 'teams', 'team_members', 'users'], 
        mockData: 40, 
        usage: ['/dashboard'],
        critical: false
      },
      { 
        name: 'PublicDashboard', 
        path: 'src/components/dashboards/PublicDashboard.tsx', 
        status: 'ready', 
        database: [], 
        mockData: 0, 
        usage: ['/dashboard'],
        critical: false
      },
      { name: 'ActionCard', path: 'src/components/dashboards/ActionCard.tsx', status: 'ready', database: [], mockData: 0, usage: ['Dashboard support'], critical: false },
      { name: 'StatCard', path: 'src/components/dashboards/StatCard.tsx', status: 'ready', database: [], mockData: 0, usage: ['Dashboard support'], critical: false },
      { name: 'ProgressCard', path: 'src/components/dashboards/ProgressCard.tsx', status: 'ready', database: [], mockData: 0, usage: ['Dashboard support'], critical: false },
      { name: 'ScheduleCard', path: 'src/components/dashboards/ScheduleCard.tsx', status: 'ready', database: [], mockData: 0, usage: ['Dashboard support'], critical: false }
    ]
  },
  'practice-planner': {
    name: 'Practice Planner',
    icon: <FileText className="h-4 w-4" />,
    count: 25,
    score: 92,
    description: '100% database integrated',
    components: [
      { 
        name: 'PracticePlanner', 
        path: 'src/components/practice-planner/PracticePlanner.tsx', 
        status: 'ready', 
        database: ['powlax_drills', 'powlax_strategies', 'practices', 'practice_drills', 'user_drills', 'user_strategies'], 
        mockData: 0, 
        usage: ['/teams/[teamId]/practiceplan'],
        critical: false,
        excellence: 'Production-grade CRUD operations'
      },
      { name: 'DrillCard', path: 'src/components/practice-planner/DrillCard.tsx', status: 'ready', database: ['powlax_drills'], mockData: 0, usage: ['Practice planner'], critical: false },
      { name: 'DrillDrawer', path: 'src/components/practice-planner/DrillDrawer.tsx', status: 'ready', database: ['powlax_drills'], mockData: 0, usage: ['Practice planner'], critical: false },
      { name: 'DrillsTab', path: 'src/components/practice-planner/DrillsTab.tsx', status: 'ready', database: ['powlax_drills', 'user_drills'], mockData: 0, usage: ['Practice planner'], critical: false },
      { name: 'StrategiesTab', path: 'src/components/practice-planner/StrategiesTab.tsx', status: 'ready', database: ['powlax_strategies', 'user_strategies'], mockData: 0, usage: ['Practice planner'], critical: false },
      { name: 'BuilderTab', path: 'src/components/practice-planner/BuilderTab.tsx', status: 'ready', database: ['practices', 'practice_drills'], mockData: 0, usage: ['Practice planner'], critical: false },
      { name: 'LoadPracticeModal', path: 'src/components/practice-planner/modals/LoadPracticeModal.tsx', status: 'ready', database: ['practices'], mockData: 0, usage: ['Practice planner'], critical: false },
      { name: 'SavePracticeModal', path: 'src/components/practice-planner/modals/SavePracticeModal.tsx', status: 'ready', database: ['practices'], mockData: 0, usage: ['Practice planner'], critical: false },
      { name: 'PrintPracticeModal', path: 'src/components/practice-planner/modals/PrintPracticeModal.tsx', status: 'ready', database: [], mockData: 0, usage: ['Practice planner'], critical: false },
      { name: 'StudyDrillModal', path: 'src/components/practice-planner/modals/StudyDrillModal.tsx', status: 'ready', database: ['powlax_drills'], mockData: 0, usage: ['Practice planner'], critical: false },
      { name: 'ShareStrategyModal', path: 'src/components/practice-planner/modals/ShareStrategyModal.tsx', status: 'ready', database: ['user_strategies'], mockData: 0, usage: ['Practice planner'], critical: false },
      { name: 'AddCustomDrillModal', path: 'src/components/practice-planner/modals/AddCustomDrillModal.tsx', status: 'ready', database: ['user_drills'], mockData: 0, usage: ['Practice planner'], critical: false },
      { name: 'AddCustomStrategyModal', path: 'src/components/practice-planner/modals/AddCustomStrategyModal.tsx', status: 'ready', database: ['user_strategies'], mockData: 0, usage: ['Practice planner'], critical: false }
    ]
  },
  'skills-academy': {
    name: 'Skills Academy',
    icon: <Zap className="h-4 w-4" />,
    count: 15,
    score: 75,
    description: 'Workout and training components',
    components: [
      { 
        name: 'SkillsAcademyWorkouts', 
        path: 'src/components/skills-academy/SkillsAcademyWorkouts.tsx', 
        status: 'ready', 
        database: ['skills_academy_series', 'skills_academy_workouts'], 
        mockData: 10, 
        usage: ['/skills-academy/workouts'],
        critical: false
      },
      { 
        name: 'WorkoutPlayer', 
        path: 'src/components/skills-academy/WorkoutPlayer.tsx', 
        status: 'ready', 
        database: ['skills_academy_workouts', 'skills_academy_drills', 'wall_ball_drill_library'], 
        mockData: 0, 
        usage: ['/skills-academy/workout/[id]'],
        critical: false
      },
      { 
        name: 'SkillsAcademyHubEnhanced', 
        path: 'src/components/skills-academy/SkillsAcademyHubEnhanced.tsx', 
        status: 'needs-work', 
        database: [], 
        mockData: 80, 
        usage: ['/skills-academy'],
        critical: false,
        issues: ['Hardcoded statistics']
      },
      { 
        name: 'TrackCards', 
        path: 'src/components/skills-academy/TrackCards.tsx', 
        status: 'needs-work', 
        database: [], 
        mockData: 100, 
        usage: ['/skills-academy'],
        critical: false,
        issues: ['Not connected to database']
      },
      { name: 'WallBallWorkout', path: 'src/components/skills-academy/WallBallWorkout.tsx', status: 'ready', database: ['wall_ball_drill_library'], mockData: 0, usage: ['Wall ball workouts'], critical: false },
      { name: 'WorkoutHeader', path: 'src/components/skills-academy/WorkoutHeader.tsx', status: 'ready', database: [], mockData: 0, usage: ['Workout player'], critical: false },
      { name: 'WorkoutControls', path: 'src/components/skills-academy/WorkoutControls.tsx', status: 'ready', database: [], mockData: 0, usage: ['Workout player'], critical: false },
      { name: 'WorkoutProgressBar', path: 'src/components/skills-academy/WorkoutProgressBar.tsx', status: 'ready', database: [], mockData: 0, usage: ['Workout player'], critical: false },
      { name: 'WorkoutErrorBoundary', path: 'src/components/skills-academy/WorkoutErrorBoundary.tsx', status: 'ready', database: [], mockData: 0, usage: ['Error handling'], critical: false, excellence: 'Best-in-class error handling' }
    ]
  },
  'teams': {
    name: 'Team Management',
    icon: <Users className="h-4 w-4" />,
    count: 11,
    score: 70,
    description: 'Team and roster components',
    components: [
      { 
        name: 'PlayerStatsCard', 
        path: 'src/components/teams/PlayerStatsCard.tsx', 
        status: 'ready', 
        database: ['user_points_wallets', 'user_badges', 'powlax_player_ranks'], 
        mockData: 5, 
        usage: ['/teams/[teamId]/dashboard'],
        critical: false,
        excellence: '95% real data with full gamification'
      },
      { 
        name: 'TeamHeader', 
        path: 'src/components/teams/dashboard/TeamHeader.tsx', 
        status: 'ready', 
        database: ['teams', 'team_members'], 
        mockData: 0, 
        usage: ['/teams/[teamId]/dashboard'],
        critical: false
      },
      { 
        name: 'TeamRoster', 
        path: 'src/components/teams/dashboard/TeamRoster.tsx', 
        status: 'ready', 
        database: ['team_members', 'users'], 
        mockData: 10, 
        usage: ['/teams/[teamId]/dashboard'],
        critical: false
      },
      { 
        name: 'CoachQuickActions', 
        path: 'src/components/teams/dashboard/CoachQuickActions.tsx', 
        status: 'ready', 
        database: [], 
        mockData: 0, 
        usage: ['/teams/[teamId]/dashboard'],
        critical: false
      },
      { 
        name: 'ParentView', 
        path: 'src/components/teams/dashboard/ParentView.tsx', 
        status: 'needs-work', 
        database: ['parent_child_relationships'], 
        mockData: 70, 
        usage: ['/teams/[teamId]/dashboard'],
        critical: false,
        issues: ['70% mock data']
      },
      { 
        name: 'PlayerView', 
        path: 'src/components/teams/dashboard/PlayerView.tsx', 
        status: 'ready', 
        database: ['skills_academy_user_progress'], 
        mockData: 20, 
        usage: ['/teams/[teamId]/dashboard'],
        critical: false
      },
      { 
        name: 'UpcomingSchedule', 
        path: 'src/components/teams/dashboard/UpcomingSchedule.tsx', 
        status: 'needs-work', 
        database: [], 
        mockData: 100, 
        usage: ['/teams/[teamId]/dashboard'],
        critical: false,
        issues: ['No database persistence']
      },
      { 
        name: 'ProgressOverview', 
        path: 'src/components/teams/dashboard/ProgressOverview.tsx', 
        status: 'ready', 
        database: ['skills_academy_user_progress'], 
        mockData: 30, 
        usage: ['/teams/[teamId]/dashboard'],
        critical: false
      },
      { 
        name: 'RecentActivity', 
        path: 'src/components/teams/dashboard/RecentActivity.tsx', 
        status: 'needs-work', 
        database: [], 
        mockData: 100, 
        usage: ['/teams/[teamId]/dashboard'],
        critical: false,
        issues: ['All mock data']
      },
      { 
        name: 'TeamPlaybookSection', 
        path: 'src/components/teams/dashboard/TeamPlaybookSection.tsx', 
        status: 'ready', 
        database: ['team_playbooks'], 
        mockData: 0, 
        usage: ['/teams/[teamId]/dashboard'],
        critical: false
      }
    ]
  },
  'admin-nav': {
    name: 'Admin & Navigation',
    icon: <Settings className="h-4 w-4" />,
    count: 15,
    score: 93,
    description: 'Admin tools and navigation',
    components: [
      { name: 'AdminPanel', path: 'src/components/admin/AdminPanel.tsx', status: 'ready', database: ['users', 'teams', 'clubs'], mockData: 10, usage: ['/admin'], critical: false },
      { name: 'UserManagement', path: 'src/components/admin/UserManagement.tsx', status: 'ready', database: ['users'], mockData: 0, usage: ['/admin'], critical: false },
      { name: 'TeamManagement', path: 'src/components/admin/TeamManagement.tsx', status: 'ready', database: ['teams', 'team_members'], mockData: 0, usage: ['/admin'], critical: false },
      { name: 'RoleManagement', path: 'src/components/admin/RoleManagement.tsx', status: 'ready', database: ['users'], mockData: 0, usage: ['/admin'], critical: false },
      { 
        name: 'MagicLinkPanel', 
        path: 'src/components/admin/MagicLinkPanel.tsx', 
        status: 'needs-work', 
        database: ['magic_links'], 
        mockData: 30, 
        usage: ['/admin'],
        critical: false,
        issues: ['Contains mock data']
      },
      { name: 'AppNavigation', path: 'src/components/AppNavigation.tsx', status: 'ready', database: [], mockData: 0, usage: ['All pages'], critical: false },
      { name: 'NavigationSidebar', path: 'src/components/NavigationSidebar.tsx', status: 'ready', database: [], mockData: 0, usage: ['Layout'], critical: false },
      { name: 'RoleViewer', path: 'src/components/RoleViewer.tsx', status: 'ready', database: [], mockData: 0, usage: ['All authenticated pages'], critical: false },
      { name: 'Header', path: 'src/components/Header.tsx', status: 'ready', database: [], mockData: 0, usage: ['All pages'], critical: false },
      { name: 'Footer', path: 'src/components/Footer.tsx', status: 'ready', database: [], mockData: 0, usage: ['All pages'], critical: false }
    ]
  },
  'gamification': {
    name: 'Gamification',
    icon: <Gamepad className="h-4 w-4" />,
    count: 10,
    score: 60,
    description: 'Points, badges, and achievements',
    components: [
      { 
        name: 'RankDisplay', 
        path: 'src/components/gamification/RankDisplay.tsx', 
        status: 'blocked', 
        database: ['powlax_player_ranks'], 
        mockData: 50, 
        usage: ['Player profiles'],
        critical: true,
        issues: ['Hardcoded ranks vs database mismatch', 'Causes user confusion']
      },
      { 
        name: 'PointsDisplay', 
        path: 'src/components/gamification/PointsDisplay.tsx', 
        status: 'needs-work', 
        database: ['user_points_wallets'], 
        mockData: 30, 
        usage: ['Player dashboard'],
        critical: true,
        issues: ['Point transactions not recorded']
      },
      { name: 'BadgeDisplay', path: 'src/components/gamification/BadgeDisplay.tsx', status: 'ready', database: ['user_badges'], mockData: 10, usage: ['Player profiles'], critical: false },
      { name: 'AchievementToast', path: 'src/components/gamification/AchievementToast.tsx', status: 'ready', database: [], mockData: 0, usage: ['Achievement notifications'], critical: false },
      { name: 'LeaderboardDisplay', path: 'src/components/gamification/LeaderboardDisplay.tsx', status: 'ready', database: ['leaderboard'], mockData: 20, usage: ['Team dashboard'], critical: false },
      { name: 'ProgressTracker', path: 'src/components/gamification/ProgressTracker.tsx', status: 'ready', database: ['skills_academy_user_progress'], mockData: 0, usage: ['Skills Academy'], critical: false },
      { name: 'RewardAnimation', path: 'src/components/gamification/RewardAnimation.tsx', status: 'ready', database: [], mockData: 0, usage: ['Achievement unlocks'], critical: false },
      { name: 'XPBar', path: 'src/components/gamification/XPBar.tsx', status: 'needs-work', database: ['user_points_wallets'], mockData: 40, usage: ['Player dashboard'], critical: false },
      { name: 'StreakCounter', path: 'src/components/gamification/StreakCounter.tsx', status: 'needs-work', database: [], mockData: 100, usage: ['Player dashboard'], critical: false },
      { name: 'QuestTracker', path: 'src/components/gamification/QuestTracker.tsx', status: 'needs-work', database: [], mockData: 100, usage: ['Player dashboard'], critical: false }
    ]
  },
  'miscellaneous': {
    name: 'Miscellaneous',
    icon: <Grid3x3 className="h-4 w-4" />,
    count: 12,
    score: 58,
    description: 'Utility and support components',
    components: [
      { 
        name: 'GlobalSearch', 
        path: 'src/components/GlobalSearch.tsx', 
        status: 'blocked', 
        database: [], 
        mockData: 100, 
        usage: ['Header'],
        critical: true,
        issues: ['Completely disconnected from database', 'Only returns mock data']
      },
      { 
        name: 'ResourceDetailModal', 
        path: 'src/components/resources/ResourceDetailModal.tsx', 
        status: 'ready', 
        database: ['resources_permanence'], 
        mockData: 0, 
        usage: ['/resources'],
        critical: false,
        excellence: 'Permanence pattern implementation'
      },
      { 
        name: 'FamilyAccountManager', 
        path: 'src/components/FamilyAccountManager.tsx', 
        status: 'needs-work', 
        database: ['parent_child_relationships'], 
        mockData: 60, 
        usage: ['Parent dashboard'],
        critical: false,
        issues: ['APIs incomplete']
      },
      { name: 'EmailVerification', path: 'src/components/auth/EmailVerification.tsx', status: 'ready', database: [], mockData: 0, usage: ['Auth flow'], critical: false },
      { name: 'ErrorBoundary', path: 'src/components/ErrorBoundary.tsx', status: 'ready', database: [], mockData: 0, usage: ['All pages'], critical: false },
      { name: 'LoadingSpinner', path: 'src/components/LoadingSpinner.tsx', status: 'ready', database: [], mockData: 0, usage: ['Loading states'], critical: false },
      { name: 'EmptyState', path: 'src/components/EmptyState.tsx', status: 'ready', database: [], mockData: 0, usage: ['Empty lists'], critical: false },
      { name: 'ConfirmDialog', path: 'src/components/ConfirmDialog.tsx', status: 'ready', database: [], mockData: 0, usage: ['Confirmations'], critical: false },
      { name: 'SearchFilter', path: 'src/components/SearchFilter.tsx', status: 'ready', database: [], mockData: 0, usage: ['List filtering'], critical: false },
      { name: 'DatePicker', path: 'src/components/DatePicker.tsx', status: 'ready', database: [], mockData: 0, usage: ['Forms'], critical: false },
      { name: 'FileUpload', path: 'src/components/FileUpload.tsx', status: 'ready', database: [], mockData: 0, usage: ['Media uploads'], critical: false },
      { name: 'ShareButton', path: 'src/components/ShareButton.tsx', status: 'ready', database: [], mockData: 0, usage: ['Content sharing'], critical: false }
    ]
  }
}

// Extract all unique database tables
const allDatabaseTables = new Set<string>()
Object.values(componentCategories).forEach(category => {
  category.components.forEach(component => {
    component.database.forEach(table => allDatabaseTables.add(table))
  })
})

// MVP Status calculation
const calculateMVPStatus = (status: string) => {
  switch (status) {
    case 'ready': return { label: 'Production Ready', color: 'bg-green-500', icon: <CheckCircle className="h-4 w-4" /> }
    case 'needs-work': return { label: 'Needs Work', color: 'bg-yellow-500', icon: <AlertTriangle className="h-4 w-4" /> }
    case 'blocked': return { label: 'MVP Blocker', color: 'bg-red-500', icon: <XCircle className="h-4 w-4" /> }
    default: return { label: 'Unknown', color: 'bg-gray-500', icon: <AlertCircle className="h-4 w-4" /> }
  }
}

export default function ComponentCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState('ui-foundation')
  const [selectedComponent, setSelectedComponent] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDatabase, setFilterDatabase] = useState<boolean>(false)

  // Calculate overall statistics
  const stats = useMemo(() => {
    const allComponents = Object.values(componentCategories).flatMap(cat => cat.components)
    const totalComponents = allComponents.length
    const readyComponents = allComponents.filter(c => c.status === 'ready').length
    const blockedComponents = allComponents.filter(c => c.status === 'blocked').length
    const withDatabase = allComponents.filter(c => c.database.length > 0).length
    const withMockData = allComponents.filter(c => c.mockData > 0).length
    const criticalBlockers = allComponents.filter(c => c.critical && c.status === 'blocked')

    return {
      total: totalComponents,
      ready: readyComponents,
      blocked: blockedComponents,
      needsWork: totalComponents - readyComponents - blockedComponents,
      withDatabase,
      withMockData,
      readyPercentage: Math.round((readyComponents / totalComponents) * 100),
      databasePercentage: Math.round((withDatabase / totalComponents) * 100),
      criticalBlockers
    }
  }, [])

  // Filter components based on search and filters
  const filteredComponents = useMemo(() => {
    const category = componentCategories[selectedCategory]
    if (!category) return []

    return category.components.filter(component => {
      const matchesSearch = searchQuery === '' || 
        component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.path.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || component.status === filterStatus
      const matchesDatabase = !filterDatabase || component.database.length > 0

      return matchesSearch && matchesStatus && matchesDatabase
    })
  }, [selectedCategory, searchQuery, filterStatus, filterDatabase])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">POWLAX Component Catalog</h1>
              <Badge variant="outline" className="ml-4">
                {stats.total} Components
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MVP Status Alert */}
      {stats.criticalBlockers.length > 0 && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Critical MVP Blockers</AlertTitle>
              <AlertDescription>
                {stats.criticalBlockers.length} components blocking MVP launch:
                {stats.criticalBlockers.map((c, i) => (
                  <span key={i} className="font-semibold">
                    {i > 0 && ', '}{c.name}
                  </span>
                ))}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Statistics Dashboard */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
                <p className="text-sm text-gray-600">Production Ready</p>
                <Progress value={stats.readyPercentage} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.needsWork}</div>
                <p className="text-sm text-gray-600">Needs Work</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
                <p className="text-sm text-gray-600">MVP Blockers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.withDatabase}</div>
                <p className="text-sm text-gray-600">Database Connected</p>
                <Progress value={stats.databasePercentage} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.withMockData}</div>
                <p className="text-sm text-gray-600">Using Mock Data</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-600">{allDatabaseTables.size}</div>
                <p className="text-sm text-gray-600">Tables Referenced</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Categories */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  {Object.entries(componentCategories).map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        selectedCategory === key ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {category.icon}
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <Badge variant="secondary">{category.count}</Badge>
                      </div>
                      <div className="mt-1">
                        <Progress value={category.score} className="h-1" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                    </button>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="all">All</option>
                    <option value="ready">Production Ready</option>
                    <option value="needs-work">Needs Work</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filterDatabase}
                      onChange={(e) => setFilterDatabase(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Database Connected Only</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Component Grid */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{componentCategories[selectedCategory]?.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {filteredComponents.length} components
                    </Badge>
                    <Badge variant="outline">
                      Score: {componentCategories[selectedCategory]?.score}/100
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredComponents.map((component, index) => {
                    const mvpStatus = calculateMVPStatus(component.status)
                    return (
                      <Card
                        key={index}
                        className={`cursor-pointer hover:shadow-lg transition-shadow ${
                          component.critical ? 'border-red-500 border-2' : ''
                        } ${selectedComponent?.name === component.name ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setSelectedComponent(component)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center space-x-2">
                                <Code className="h-4 w-4 text-gray-400" />
                                <span>{component.name}</span>
                                {component.critical && (
                                  <Badge variant="destructive" className="ml-2">CRITICAL</Badge>
                                )}
                              </CardTitle>
                              <p className="text-xs text-gray-500 mt-1 font-mono">{component.path}</p>
                            </div>
                            <div className={`p-2 rounded-full ${mvpStatus.color} text-white`}>
                              {mvpStatus.icon}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* MVP Status */}
                          <div className="flex items-center space-x-2">
                            <Badge variant={component.status === 'ready' ? 'default' : component.status === 'blocked' ? 'destructive' : 'secondary'}>
                              {mvpStatus.label}
                            </Badge>
                            {component.excellence && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Excellence
                              </Badge>
                            )}
                          </div>

                          {/* Database Integration */}
                          {component.database.length > 0 && (
                            <div className="flex items-start space-x-2">
                              <Database className="h-4 w-4 text-blue-500 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-700">Database Tables:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {component.database.slice(0, 3).map((table, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {table}
                                    </Badge>
                                  ))}
                                  {component.database.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{component.database.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Mock Data Indicator */}
                          {component.mockData > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">Mock Data</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={component.mockData} className="w-20 h-2" />
                                <span className={`text-xs font-bold ${
                                  component.mockData > 75 ? 'text-red-600' : 
                                  component.mockData > 50 ? 'text-yellow-600' : 
                                  'text-green-600'
                                }`}>
                                  {component.mockData}%
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Issues */}
                          {component.issues && component.issues.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-red-600">Issues:</p>
                              {component.issues.map((issue, i) => (
                                <div key={i} className="flex items-start space-x-1">
                                  <AlertCircle className="h-3 w-3 text-red-500 mt-0.5" />
                                  <p className="text-xs text-gray-600">{issue}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Excellence Note */}
                          {component.excellence && (
                            <div className="bg-green-50 p-2 rounded">
                              <p className="text-xs text-green-700">✨ {component.excellence}</p>
                            </div>
                          )}

                          {/* Mini Preview */}
                          <div className="border rounded p-2 bg-gray-50 max-h-[60px] overflow-hidden flex items-center justify-center">
                            <div className="scale-50 origin-center">
                              {componentPreviews[component.name] || <span className="text-xs text-gray-400">No preview</span>}
                            </div>
                          </div>

                          {/* Usage */}
                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-500">
                              Used on: {component.usage.join(', ')}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Component Details */}
          {selectedComponent && (
            <div className="w-80 flex-shrink-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedComponent.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">
                    {selectedComponent.path}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">MVP Status</h4>
                    <div className="flex items-center space-x-2">
                      {calculateMVPStatus(selectedComponent.status).icon}
                      <span className="font-medium">{calculateMVPStatus(selectedComponent.status).label}</span>
                    </div>
                    {selectedComponent.critical && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Critical MVP Blocker</AlertTitle>
                        <AlertDescription>
                          This component must be fixed before MVP launch
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Database Integration */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Database Integration</h4>
                    {selectedComponent.database.length > 0 ? (
                      <div className="space-y-1">
                        {selectedComponent.database.map((table, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <Database className="h-3 w-3 text-blue-500" />
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{table}</code>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No database connections</p>
                    )}
                  </div>

                  {/* Mock Data */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Data Quality</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Real Data</span>
                        <span className="text-sm font-bold text-green-600">
                          {100 - selectedComponent.mockData}%
                        </span>
                      </div>
                      <Progress value={100 - selectedComponent.mockData} className="h-2" />
                      {selectedComponent.mockData > 0 && (
                        <p className="text-xs text-gray-500">
                          {selectedComponent.mockData}% mock data needs replacement
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Issues */}
                  {selectedComponent.issues && selectedComponent.issues.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Known Issues</h4>
                      <div className="space-y-2">
                        {selectedComponent.issues.map((issue, i) => (
                          <Alert key={i} variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{issue}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Excellence */}
                  {selectedComponent.excellence && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Excellence Example</h4>
                      <Alert>
                        <Zap className="h-4 w-4" />
                        <AlertDescription>{selectedComponent.excellence}</AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Usage Locations */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Page Usage</h4>
                    <div className="space-y-1">
                      {selectedComponent.usage.map((page, i) => (
                        <Badge key={i} variant="outline" className="mr-1">
                          {page}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Component Preview */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Visual Preview</h4>
                    <div className="border rounded p-4 bg-white min-h-[100px] flex items-center justify-center overflow-hidden">
                      {componentPreviews[selectedComponent.name] || defaultPreview}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Timeline to MVP */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>MVP Launch Timeline</CardTitle>
            <CardDescription>Based on component analysis: 3 weeks to production-ready MVP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Week 1: Critical Blockers</span>
                  <Badge variant="destructive">4 components</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">• PlayerDashboard - Connect to real data</p>
                  <p className="text-xs text-gray-600">• GlobalSearch - Implement database search</p>
                  <p className="text-xs text-gray-600">• RankDisplay - Fix database mismatch</p>
                  <p className="text-xs text-gray-600">• Point Transactions - Implement persistence</p>
                </div>
              </div>
              <Separator />
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Week 2: High Priority Fixes</span>
                  <Badge variant="secondary">12 components</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">• Replace remaining mock data in dashboards</p>
                  <p className="text-xs text-gray-600">• Complete gamification system integration</p>
                  <p className="text-xs text-gray-600">• Fix team management data persistence</p>
                </div>
              </div>
              <Separator />
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Week 3: Polish & Testing</span>
                  <Badge>All components</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">• End-to-end testing of all user flows</p>
                  <p className="text-xs text-gray-600">• Performance optimization</p>
                  <p className="text-xs text-gray-600">• Security audit and fixes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Truth Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Database Truth Status</CardTitle>
            <CardDescription>Tables actually used vs referenced in code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-green-600">✅ Tables In Use</h4>
                <p className="text-2xl font-bold">47</p>
                <p className="text-xs text-gray-500">Verified in database</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2 text-red-600">❌ Non-Existent Tables</h4>
                <div className="space-y-1">
                  <Badge variant="destructive">drills</Badge>
                  <Badge variant="destructive">strategies</Badge>
                  <Badge variant="destructive">concepts</Badge>
                  <Badge variant="destructive">skills</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">Referenced but don't exist</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2 text-yellow-600">⚠️ Critical Gap</h4>
                <code className="text-sm bg-yellow-100 px-2 py-1 rounded">points_transactions_powlax</code>
                <p className="text-xs text-gray-500 mt-2">0 records - transactions not persisting</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}