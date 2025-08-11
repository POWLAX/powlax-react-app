'use client'

import { useState } from 'react'
import { 
  Calendar, 
  Users, 
  Megaphone, 
  Camera, 
  Play,
  Clock,
  MapPin,
  CheckCircle,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useTeamDashboard, type TeamEvent } from '@/hooks/useTeamDashboard'
import type { Team } from '@/types/teams'

interface CoachQuickActionsProps {
  team: Team
  upcomingEvents: TeamEvent[]
}

export function CoachQuickActions({ team, upcomingEvents }: CoachQuickActionsProps) {
  const [announcementOpen, setAnnouncementOpen] = useState(false)
  const [attendanceOpen, setAttendanceOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const { sendAnnouncement } = useTeamDashboard(team.id)

  const nextEvent = upcomingEvents[0]
  const isToday = nextEvent && new Date(nextEvent.start_time).toDateString() === new Date().toDateString()

  const handleSendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcement.trim()) return

    const result = await sendAnnouncement(announcementTitle, announcement, 'medium')
    if (result.success) {
      setAnnouncementTitle('')
      setAnnouncement('')
      setAnnouncementOpen(false)
    }
  }

  const startPractice = () => {
    // Navigate to live practice mode or start attendance
    window.location.href = `/teams/${team.id}/practice/live`
  }

  return (
    <Card className="border-l-4 border-l-powlax-orange">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-powlax-orange/10 rounded-lg flex items-center justify-center">
            <Play className="h-4 w-4 text-powlax-orange" />
          </div>
          <span>Coach Actions</span>
          {isToday && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Practice Today
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Primary action button - Start Practice */}
        <div className="mb-6">
          {nextEvent && isToday ? (
            <Button 
              onClick={startPractice}
              size="lg" 
              className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-semibold"
            >
              <Play className="h-5 w-5 mr-3" />
              Start Today&apos;s Practice
              <div className="ml-auto text-sm opacity-90">
                {new Date(nextEvent.start_time).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="lg"
              className="w-full h-14 text-lg border-dashed"
              disabled
            >
              <Calendar className="h-5 w-5 mr-3" />
              No Practice Scheduled Today
            </Button>
          )}
        </div>

        {/* Quick action grid - Large touch targets for mobile/field use */}
        <div className="grid grid-cols-2 gap-4">
          {/* Team Playbook */}
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-powlax-blue/5 hover:border-powlax-blue/20"
            onClick={() => window.location.href = `/teams/${team.id}/playbook`}
          >
            <BookOpen className="h-6 w-6 text-powlax-blue" />
            <span className="text-sm font-medium">Team Playbook</span>
          </Button>
          {/* Take Attendance */}
          <Dialog open={attendanceOpen} onOpenChange={setAttendanceOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-200"
              >
                <Users className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium">Take Attendance</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Quick Attendance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Mark attendance for {nextEvent?.title || 'current activity'}
                </p>
                <div className="space-y-2">
                  {/* Mock player list - would come from team members */}
                  {['Mike Johnson', 'Sarah Wilson', 'Tom Davis', 'Emma Brown'].map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded">
                      <span>{name}</span>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full">Save Attendance</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Send Announcement */}
          <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-200"
              >
                <Megaphone className="h-6 w-6 text-orange-600" />
                <span className="text-sm font-medium">Send Alert</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Team Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Announcement title..."
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Your message to the team..."
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setAnnouncementOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSendAnnouncement}>
                    Send Announcement
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Practice Photos */}
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-200"
          >
            <Camera className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-medium">Take Photos</span>
          </Button>

          {/* Quick Schedule */}
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-200"
          >
            <Clock className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium">Schedule Event</span>
          </Button>
        </div>

        {/* Next event preview */}
        {nextEvent && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Next Event</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{nextEvent.title}</span>
                <Badge variant="outline" className="capitalize">
                  {nextEvent.event_type}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(nextEvent.start_time).toLocaleDateString()} at{' '}
                    {new Date(nextEvent.start_time).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                {nextEvent.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{nextEvent.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}