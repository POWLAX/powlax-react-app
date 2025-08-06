'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Trophy, Target, Activity } from 'lucide-react'

interface TeamMember {
  id: string
  user: {
    first_name: string
    last_name: string
  }
  role: string
}

interface TeamStatsOverviewProps {
  teamId: string
  members: TeamMember[]
}

export function TeamStatsOverview({ teamId, members }: TeamStatsOverviewProps) {
  // Calculate basic stats
  const playerCount = members.filter(m => m.role === 'player').length
  const coachCount = members.filter(m => ['head_coach', 'assistant_coach'].includes(m.role)).length
  
  // Mock data for now - would come from database
  const stats = {
    practicesCompleted: 12,
    skillsAssigned: 45,
    teamWinRate: 75,
    averageAttendance: 92
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Team Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Team Size */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{playerCount}</div>
              <div className="text-xs text-blue-700">Players</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{coachCount}</div>
              <div className="text-xs text-green-700">Coaches</div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="h-4 w-4" />
                <span>Practices Completed</span>
              </div>
              <span className="font-semibold">{stats.practicesCompleted}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Trophy className="h-4 w-4" />
                <span>Win Rate</span>
              </div>
              <span className="font-semibold">{stats.teamWinRate}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4" />
                <span>Avg Attendance</span>
              </div>
              <span className="font-semibold">{stats.averageAttendance}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pt-3 border-t">
            <div className="text-xs text-gray-600 mb-2">Season Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: '65%' }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">Week 8 of 12</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}