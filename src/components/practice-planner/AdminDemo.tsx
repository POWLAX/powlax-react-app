'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AdminEditModal from './modals/AdminEditModal'
import { AdminToolbarFloating } from './AdminToolbar'
import { canEditDrillsAndStrategies } from '@/lib/adminPermissions'
import { Shield, Edit3, Users, Drill } from 'lucide-react'

// Mock drill and strategy data for testing
const mockDrill = {
  id: '1',
  drill_id: '1',
  name: 'Basic Ground Ball Drill',
  title: 'Basic Ground Ball Drill',
  content: 'A fundamental drill for practicing ground ball technique with proper form and footwork.',
  duration: 10,
  category: 'Ground Ball',
  video_url: 'https://vimeo.com/123456',
  source: 'powlax',
  difficulty_level: 'Beginner',
  min_players: 2,
  max_players: 12,
  equipment: 'Balls, Cones'
}

const mockStrategy = {
  id: '1',
  strategy_name: 'Basic Clear Pattern',
  description: 'A foundational clearing pattern for moving the ball from defense to offense.',
  strategy_categories: 'Clearing',
  vimeo_link: 'https://vimeo.com/789012',
  source: 'powlax',
  target_audience: 'High School',
  see_it_ages: '12-14 years'
}

export default function AdminDemo() {
  const { user } = useAuth()
  const [showDrillModal, setShowDrillModal] = useState(false)
  const [showStrategyModal, setShowStrategyModal] = useState(false)
  
  const isAdmin = canEditDrillsAndStrategies(user)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Interface Demo
            {isAdmin && <Badge variant="secondary">Admin User</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Admin Status</h3>
              <div className="space-y-2">
                <p><strong>User:</strong> {user?.name || user?.username || 'Not logged in'}</p>
                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                <p><strong>Roles:</strong> {user?.roles?.join(', ') || 'None'}</p>
                <div className="flex items-center gap-2">
                  <strong>Admin Access:</strong>
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>

            {!isAdmin && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Note:</strong> Admin edit buttons will only appear for users with admin permissions.
                  Current user does not have admin access.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Demo Drill Card */}
      <Card className="group relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Drill className="h-5 w-5" />
              Sample Drill Card
            </CardTitle>
            {/* Admin toolbar will appear here for admin users */}
            <AdminToolbarFloating
              user={user}
              itemType="drill"
              item={mockDrill}
              onEdit={() => setShowDrillModal(true)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h3 className="text-lg font-medium">{mockDrill.name}</h3>
            <p className="text-sm text-gray-600">{mockDrill.content}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Duration: {mockDrill.duration} min</span>
              <span>Category: {mockDrill.category}</span>
              <span>Players: {mockDrill.min_players}-{mockDrill.max_players}</span>
            </div>

            {isAdmin ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDrillModal(true)}
                className="mt-2"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Drill (Admin)
              </Button>
            ) : (
              <p className="text-xs text-gray-500 italic">
                Admin edit button would appear here for admin users
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Demo Strategy Card */}
      <Card className="group relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sample Strategy Card
            </CardTitle>
            <AdminToolbarFloating
              user={user}
              itemType="strategy"
              item={mockStrategy}
              onEdit={() => setShowStrategyModal(true)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h3 className="text-lg font-medium">{mockStrategy.strategy_name}</h3>
            <p className="text-sm text-gray-600">{mockStrategy.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Category: {mockStrategy.strategy_categories}</span>
              <span>Audience: {mockStrategy.target_audience}</span>
              <span>Ages: {mockStrategy.see_it_ages}</span>
            </div>

            {isAdmin ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowStrategyModal(true)}
                className="mt-2"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Strategy (Admin)
              </Button>
            ) : (
              <p className="text-xs text-gray-500 italic">
                Admin edit button would appear here for admin users
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin Edit Modals */}
      <AdminEditModal
        isOpen={showDrillModal}
        onClose={() => setShowDrillModal(false)}
        user={user}
        itemType="drill"
        item={mockDrill}
        onSave={() => {
          console.log('Drill saved!')
          setShowDrillModal(false)
        }}
        onDelete={() => {
          console.log('Drill deleted!')
          setShowDrillModal(false)
        }}
      />

      <AdminEditModal
        isOpen={showStrategyModal}
        onClose={() => setShowStrategyModal(false)}
        user={user}
        itemType="strategy"
        item={mockStrategy}
        onSave={() => {
          console.log('Strategy saved!')
          setShowStrategyModal(false)
        }}
        onDelete={() => {
          console.log('Strategy deleted!')
          setShowStrategyModal(false)
        }}
      />
    </div>
  )
}