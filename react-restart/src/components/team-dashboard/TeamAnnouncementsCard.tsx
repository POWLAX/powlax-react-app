'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, Bell, AlertCircle, Info, Plus } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  message: string
  type: 'info' | 'important' | 'urgent'
  author: string
  created_at: string
}

interface TeamAnnouncementsCardProps {
  teamId: string
  announcements?: Announcement[]
  isCoach?: boolean
}

export function TeamAnnouncementsCard({ 
  teamId, 
  announcements = [], 
  isCoach = false 
}: TeamAnnouncementsCardProps) {
  
  // Mock data for demonstration
  const mockAnnouncements: Announcement[] = announcements.length > 0 ? announcements : [
    {
      id: '1',
      title: 'Practice Cancelled - Weather',
      message: 'Tomorrow\'s practice is cancelled due to forecasted storms. We\'ll reschedule for next week.',
      type: 'urgent',
      author: 'Coach Smith',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'New Practice Jerseys',
      message: 'New practice jerseys have arrived! Pick them up at the next practice.',
      type: 'info',
      author: 'Coach Johnson',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'important':
        return <Bell className="h-4 w-4 text-orange-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getAnnouncementBadgeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'important':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Team Announcements
          </CardTitle>
          {isCoach && (
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Post
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No announcements</p>
              {isCoach && (
                <p className="text-sm mt-2">
                  Click "Post" to share updates with your team
                </p>
              )}
            </div>
          ) : (
            <>
              {mockAnnouncements.slice(0, 3).map((announcement) => (
                <div 
                  key={announcement.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getAnnouncementIcon(announcement.type)}
                      <h4 className="font-medium text-sm">{announcement.title}</h4>
                    </div>
                    <Badge className={`text-xs ${getAnnouncementBadgeColor(announcement.type)}`}>
                      {announcement.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {announcement.message}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{announcement.author}</span>
                    <span>{formatTimeAgo(announcement.created_at)}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* View All Link */}
        {mockAnnouncements.length > 0 && (
          <div className="pt-3 mt-3 border-t">
            <Button variant="link" className="w-full text-sm" asChild>
              <a href={`/teams/${teamId}/communications`}>
                View All Announcements →
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}