'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Practice {
  id: string
  date: string
  start_time: string
  end_time: string
  location: string
  type: 'practice' | 'game' | 'tournament'
  status: 'scheduled' | 'completed' | 'cancelled'
}

interface PracticeScheduleCardProps {
  teamId: string
  practices?: Practice[]
  isCoach?: boolean
}

export function PracticeScheduleCard({ teamId, practices = [], isCoach = false }: PracticeScheduleCardProps) {
  // Mock data for now
  const upcomingPractices: Practice[] = practices.length > 0 ? practices : [
    {
      id: '1',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      start_time: '16:00',
      end_time: '17:30',
      location: 'Main Field',
      type: 'practice',
      status: 'scheduled'
    },
    {
      id: '2',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      start_time: '16:00',
      end_time: '17:30',
      location: 'Main Field',
      type: 'practice',
      status: 'scheduled'
    }
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'practice':
        return 'bg-blue-100 text-blue-800'
      case 'game':
        return 'bg-green-100 text-green-800'
      case 'tournament':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const nextPractice = upcomingPractices[0]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Practice Schedule
          </CardTitle>
          {isCoach && (
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Schedule
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Next Practice Highlight */}
          {nextPractice && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-blue-900">Next Practice</h4>
                <Badge className={`text-xs ${getTypeBadgeColor(nextPractice.type)}`}>
                  {nextPractice.type}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-blue-800">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{formatDate(nextPractice.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatTime(nextPractice.start_time)} - {formatTime(nextPractice.end_time)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <MapPin className="h-4 w-4" />
                  <span>{nextPractice.location}</span>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Practices List */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Upcoming</h4>
            {upcomingPractices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No practices scheduled</p>
                {isCoach && (
                  <p className="text-sm mt-2">
                    Click "Schedule" to add practices
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingPractices.slice(1, 4).map((practice) => (
                  <div 
                    key={practice.id} 
                    className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded border border-gray-100"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {formatDate(practice.date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(practice.start_time)} • {practice.location}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {practice.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* View Calendar Link */}
          <div className="pt-2 border-t">
            <Button variant="link" className="w-full text-sm" asChild>
              <a href={`/teams/${teamId}/schedule`}>
                View Full Calendar →
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}