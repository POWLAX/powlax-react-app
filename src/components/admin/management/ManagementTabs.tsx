'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Shield, 
  RefreshCw, 
  Link, 
  Building, 
  Users2, 
  Clipboard, 
  BarChart 
} from 'lucide-react'
import UsersTabContent from './UsersTabContent'
import MemberpressStatusPanel from '../MemberpressStatusPanel'
import ClubsManagementTab from '../platform/ClubsManagementTab'
import TeamHQManagementTab from '../platform/TeamHQManagementTab'
import CoachingKitManagementTab from '../platform/CoachingKitManagementTab'
import PlatformAnalyticsDashboard from '../platform/PlatformAnalyticsDashboard'

interface ManagementTabsProps {
  children: React.ReactNode
  defaultTab?: string
}

const managementTabs = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield },
  { id: 'memberpress', label: 'Memberpress Sync', icon: RefreshCw },
  { id: 'magic-links', label: 'Magic Links', icon: Link },
  { id: 'clubs', label: 'Clubs', icon: Building },
  { id: 'teams', label: 'Team HQ', icon: Users2 },
  { id: 'coaching', label: 'Coaching Kit', icon: Clipboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart }
]

export default function ManagementTabs({ children, defaultTab = 'roles' }: ManagementTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1 mb-6 bg-white border border-gray-200 rounded-lg p-1">
        {managementTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 px-2 py-2 text-xs lg:text-sm whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600 hover:text-gray-900"
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>
      
      {/* Roles & Permissions Tab - Contains existing role management */}
      <TabsContent value="roles" className="space-y-4">
        {children}
      </TabsContent>
      
      {/* Users Tab */}
      <TabsContent value="users" className="space-y-4">
        <UsersTabContent />
      </TabsContent>
      
      {/* Memberpress Sync Tab */}
      <TabsContent value="memberpress" className="space-y-4">
        <MemberpressStatusPanel />
      </TabsContent>
      
      {/* Magic Links Tab */}
      <TabsContent value="magic-links" className="space-y-4">
        <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Link className="h-5 w-5" />
              Magic Link Management
            </CardTitle>
            <CardDescription>
              Generate and manage magic links for user authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Create registration links, manage authentication flows, and track link usage.
              Features coming in Phase 2.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Clubs Tab */}
      <TabsContent value="clubs" className="space-y-4">
        <ClubsManagementTab />
      </TabsContent>
      
      {/* Teams Tab */}
      <TabsContent value="teams" className="space-y-4">
        <TeamHQManagementTab />
      </TabsContent>
      
      {/* Coaching Kit Tab */}
      <TabsContent value="coaching" className="space-y-4">
        <CoachingKitManagementTab />
      </TabsContent>
      
      {/* Analytics Tab */}
      <TabsContent value="analytics" className="space-y-4">
        <PlatformAnalyticsDashboard />
      </TabsContent>
    </Tabs>
  )
}