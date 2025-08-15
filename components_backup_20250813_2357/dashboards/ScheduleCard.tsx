'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LucideIcon, Calendar, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

interface ScheduleEvent {
  id: string
  title: string
  time: string
  date: string
  location?: string
  type: 'practice' | 'game' | 'workout' | 'event'
  status?: 'upcoming' | 'today' | 'completed' | 'cancelled'
  href?: string
}

interface ScheduleCardProps {
  title: string
  description?: string
  events: ScheduleEvent[]
  icon?: LucideIcon
  maxEvents?: number
  showMoreHref?: string
}

const typeStyles = {
  practice: 'bg-blue-100 text-blue-800',
  game: 'bg-green-100 text-green-800',
  workout: 'bg-orange-100 text-orange-800',
  event: 'bg-purple-100 text-purple-800'
}

const statusStyles = {
  upcoming: 'border-l-blue-500',
  today: 'border-l-orange-500 bg-orange-50',
  completed: 'border-l-gray-500 opacity-75',
  cancelled: 'border-l-red-500 bg-red-50'
}

export function ScheduleCard({ 
  title, 
  description, 
  events, 
  icon: Icon, 
  maxEvents = 5,
  showMoreHref 
}: ScheduleCardProps) {
  const displayEvents = events.slice(0, maxEvents)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-blue-600" />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {displayEvents.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayEvents.map((event) => (
              <div 
                key={event.id}
                className={`p-3 border-l-4 rounded-r-md ${statusStyles[event.status || 'upcoming']}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <Badge variant="secondary" className={typeStyles[event.type]}>
                        {event.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {event.href && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={event.href}>View</Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {events.length > maxEvents && showMoreHref && (
              <div className="pt-3 border-t">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={showMoreHref}>
                    View All ({events.length} events)
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}