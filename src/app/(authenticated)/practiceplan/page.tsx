'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock, Plus } from 'lucide-react'
import Link from 'next/link'

export default function PracticePlanPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Practice Planner</h1>
          <p className="text-gray-600 mt-1">Design and organize your lacrosse practices</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Start Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Create New Practice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Start planning a new practice session</p>
              <Link href="/teams/no-team/practiceplan">
                <Button className="w-full">
                  Create Practice Plan
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Practices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Recent Plans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">View your recently created practices</p>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Offense Focus</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Defense Drills</p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Start with pre-built practice templates</p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  90-min Practice
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  60-min Practice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Practice Planner Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-1">Schedule Builder</h3>
                  <p className="text-sm text-gray-600">Drag and drop practice components</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-1">Drill Library</h3>
                  <p className="text-sm text-gray-600">Access hundreds of drills</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium mb-1">Time Management</h3>
                  <p className="text-sm text-gray-600">Automatic timing calculations</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Plus className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium mb-1">Sharing & Print</h3>
                  <p className="text-sm text-gray-600">Share with team and assistants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}