'use client'

import { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Sun, 
  Cloud, 
  CloudRain,
  Thermometer,
  Wind,
  Plus,
  Edit
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTeamDashboard, type TeamEvent } from '@/hooks/useTeamDashboard'
import type { Team } from '@/types/teams'

interface UpcomingScheduleProps {
  events: TeamEvent[]
  team: Team
  canManage: boolean
}

export function UpcomingSchedule({ events, team, canManage }: UpcomingScheduleProps) {
  const [newEventOpen, setNewEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    name: '',
    practice_date: '',
    start_time: '',
    duration_minutes: 90,
    is_public: false
  })
  const { createEvent } = useTeamDashboard(team.id)

  const getWeatherIcon = (conditions: string | undefined) => {
    switch (conditions?.toLowerCase()) {
      case 'sunny':
        return Sun
      case 'cloudy':
        return Cloud
      case 'rainy':
        return CloudRain
      default:
        return Sun
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'game':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'tournament':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'meeting':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-green-100 text-green-700 border-green-200'
    }
  }

  const isToday = (dateString: string) => {
    return new Date(dateString).toDateString() === new Date().toDateString()
  }

  const isTomorrow = (dateString: string) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return new Date(dateString).toDateString() === tomorrow.toDateString()
  }

  const formatEventDate = (dateString: string) => {
    if (isToday(dateString)) return 'Today'
    if (isTomorrow(dateString)) return 'Tomorrow'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' })
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  const handleCreateEvent = async () => {
    if (!newEvent.name || !newEvent.practice_date) return

    const result = await createEvent({
      name: newEvent.name,
      practice_date: newEvent.practice_date,
      start_time: newEvent.start_time || null,
      duration_minutes: newEvent.duration_minutes || null,
      is_public: newEvent.is_public
    })

    if (result.data) {
      setNewEvent({
        name: '',
        practice_date: '',
        start_time: '',
        duration_minutes: 90,
        is_public: false
      })
      setNewEventOpen(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-powlax-blue" />
            <span>Upcoming Schedule</span>
          </CardTitle>
          {canManage && (
            <Dialog open={newEventOpen} onOpenChange={setNewEventOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="flex items-center space-x-1">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Event</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Practice Name</label>
                    <Input
                      placeholder="e.g., Team Practice"
                      value={newEvent.name}
                      onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Practice Date</label>
                      <Input
                        type="date"
                        value={newEvent.practice_date}
                        onChange={(e) => setNewEvent({ ...newEvent, practice_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Start Time (Optional)</label>
                      <Input
                        type="time"
                        value={newEvent.start_time}
                        onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Duration (minutes)</label>
                    <Input
                      type="number"
                      placeholder="90"
                      value={newEvent.duration_minutes}
                      onChange={(e) => setNewEvent({ ...newEvent, duration_minutes: parseInt(e.target.value) || 90 })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={newEvent.is_public}
                      onChange={(e) => setNewEvent({ ...newEvent, is_public: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <label htmlFor="is_public" className="text-sm font-medium">
                      Make this practice public
                    </label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setNewEventOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateEvent}>
                      Create Event
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Scheduled</h3>
            <p className="text-gray-600 mb-4">Create your first practice or game to get started.</p>
            {canManage && (
              <Button onClick={() => setNewEventOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Event
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {events.slice(0, 3).map((event) => {
              const WeatherIcon = getWeatherIcon(event.weather_conditions?.conditions)
              const eventDate = formatEventDate(event.practice_date)
              const isHighPriority = isToday(event.practice_date) || isTomorrow(event.practice_date)
              
              return (
                <div 
                  key={event.id} 
                  className={`p-4 rounded-lg border transition-all ${
                    isHighPriority 
                      ? 'border-powlax-orange bg-orange-50/50 ring-1 ring-powlax-orange/20' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{event.name || 'Practice'}</h3>
                        <Badge 
                          variant="outline" 
                          className={`capitalize text-xs ${event.is_public ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {event.is_public ? 'Public' : 'Team Only'}
                        </Badge>
                        {isHighPriority && (
                          <Badge variant="default" className="bg-powlax-orange text-white">
                            {eventDate}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {!isHighPriority && `${eventDate} • `}
                            {event.start_time ? 
                              event.start_time.substring(0, 5) : 
                              'Time TBD'
                            }
                            {event.duration_minutes && ` (${event.duration_minutes} min)`}
                          </span>
                        </div>
                        
                        {event.duration_minutes && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{event.duration_minutes} minutes</span>
                          </div>
                        )}
                      </div>

                      {event.created_at && (
                        <p className="text-xs text-gray-500 mt-2">
                          Created {new Date(event.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Remove weather since it's not in practices table */}
                  </div>

                  {/* Action buttons for high priority events */}
                  {isHighPriority && canManage && (
                    <div className="flex justify-end space-x-2 pt-2 border-t border-orange-100">
                      <Button size="sm" variant="outline" className="text-xs">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      {isToday(event.practice_date) && (
                        <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700">
                          Start Practice
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {events.length > 3 && (
              <div className="text-center pt-4 border-t">
                <Button variant="outline" size="sm">
                  View All Events ({events.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}