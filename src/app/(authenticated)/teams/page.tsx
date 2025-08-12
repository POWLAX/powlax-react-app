'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ChevronRight, Plus, Activity } from 'lucide-react'
import Link from 'next/link'

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600 mt-1">Manage your lacrosse teams and rosters</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Sample Teams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Varsity Boys
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Players:</span>
                <span className="font-medium">22</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Season:</span>
                <span className="font-medium">Spring 2025</span>
              </div>
              <Link href="/teams/varsity-boys/dashboard">
                <Button className="w-full">
                  View Team
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  JV Boys
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Players:</span>
                <span className="font-medium">18</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Season:</span>
                <span className="font-medium">Spring 2025</span>
              </div>
              <Link href="/teams/jv-boys/dashboard">
                <Button className="w-full">
                  View Team
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Varsity Girls
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Players:</span>
                <span className="font-medium">20</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Season:</span>
                <span className="font-medium">Spring 2025</span>
              </div>
              <Link href="/teams/varsity-girls/dashboard">
                <Button className="w-full">
                  View Team
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/teams/no-team/practiceplan">
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">Practice Planner</div>
                      <div className="text-sm text-gray-500">Create practice plans</div>
                    </div>
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Add Players</div>
                    <div className="text-sm text-gray-500">Manage rosters</div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Team Stats</div>
                    <div className="text-sm text-gray-500">View performance</div>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Communication</div>
                    <div className="text-sm text-gray-500">Send messages</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Team data is currently showing sample information. 
            Full team management features are being enhanced for better integration.
          </p>
        </div>
      </div>
    </div>
  )
}