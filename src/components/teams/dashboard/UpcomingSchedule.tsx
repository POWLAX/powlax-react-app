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
    title: '',
    event_type: 'practice' as 'practice' | 'game' | 'tournament' | 'meeting',
    start_time: '',
    end_time: '',
    location: '',
    description: ''
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
    if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) return

    const result = await createEvent({
      ...newEvent,
      start_time: new Date(newEvent.start_time).toISOString(),
      end_time: new Date(newEvent.end_time).toISOString()
    })

    if (result.data) {
      setNewEvent({
        title: '',
        event_type: 'practice',
        start_time: '',
        end_time: '',
        location: '',
        description: ''
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Event Title</label>
                      <Input
                        placeholder="e.g., Team Practice"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Event Type</label>
                      <Select 
                        value={newEvent.event_type} 
                        onValueChange={(value: typeof newEvent.event_type) => 
                          setNewEvent({ ...newEvent, event_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="practice">Practice</SelectItem>
                          <SelectItem value="game">Game</SelectItem>
                          <SelectItem value="tournament">Tournament</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Time</label>
                      <Input
                        type="datetime-local"
                        value={newEvent.start_time}
                        onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Time</label>
                      <Input
                        type="datetime-local"
                        value={newEvent.end_time}
                        onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      placeholder="e.g., Field 2"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <Textarea
                      placeholder="Additional details about the event..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                    />
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
              const eventDate = formatEventDate(event.start_time)
              const isHighPriority = isToday(event.start_time) || isTomorrow(event.start_time)
              
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
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <Badge 
                          variant="outline" 
                          className={`capitalize text-xs ${getEventTypeColor(event.event_type)}`}
                        >
                          {event.event_type}
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
                            {new Date(event.start_time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {new Date(event.end_time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Weather conditions for outdoor events */}
                    {event.weather_conditions && (
                      <div className="ml-4 flex flex-col items-center space-y-1 text-xs text-gray-600">
                        <WeatherIcon className="h-5 w-5" />
                        <div className="text-center">
                          <div className="font-medium">{event.weather_conditions.temp}°F</div>
                          <div className="flex items-center space-x-1">
                            <Wind className="h-3 w-3" />
                            <span>{event.weather_conditions.wind}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons for high priority events */}
                  {isHighPriority && canManage && (
                    <div className="flex justify-end space-x-2 pt-2 border-t border-orange-100">
                      <Button size="sm" variant="outline" className="text-xs">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      {isToday(event.start_time) && (
                        <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700">
                          Start Event
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