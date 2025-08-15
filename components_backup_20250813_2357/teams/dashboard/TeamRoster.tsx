'use client'

import { useState } from 'react'
import { 
  Users, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  UserPlus,
  Trophy,
  Target,
  Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Team, UserTeamRole } from '@/types/teams'
import type { TeamEvent } from '@/hooks/useTeamDashboard'

interface TeamRosterProps {
  team: Team
  members: UserTeamRole[]
  canTakeAttendance: boolean
  upcomingEvent?: TeamEvent
}

interface PlayerStats {
  user_id: string
  attendance_rate: number
  skills_completed: number
  recent_badges: string[]
  position?: string
  jersey_number?: string
}

export function TeamRoster({ team, members, canTakeAttendance, upcomingEvent }: TeamRosterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [attendanceMode, setAttendanceMode] = useState(false)
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'excused' | 'late'>>({})

  // Use actual member data from team_members table
  const playerStats: PlayerStats[] = members
    .filter(m => m.role === 'player')
    .map(m => ({
      user_id: m.user_id,
      attendance_rate: 0, // No attendance table exists yet
      skills_completed: 0, // Will be fetched separately if needed
      recent_badges: [], // Will be fetched separately if needed
      position: m.position || 'Player',
      jersey_number: m.jersey_number || '--'
    }))

  const getPlayerStats = (userId: string) => {
    const member = members.find(m => m.user_id === userId)
    return playerStats.find(s => s.user_id === userId) || {
      user_id: userId,
      attendance_rate: 0,
      skills_completed: 0,
      recent_badges: [],
      position: member?.position || 'Player',
      jersey_number: member?.jersey_number || '--'
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    return matchesSearch && matchesRole
  })

  const players = filteredMembers.filter(m => m.role === 'player')
  const coaches = filteredMembers.filter(m => ['head_coach', 'assistant_coach'].includes(m.role))
  const parents = filteredMembers.filter(m => m.role === 'parent')

  const getAttendanceStatus = (userId: string) => {
    return attendance[userId] || 'absent'
  }

  const setAttendanceStatus = (userId: string, status: 'present' | 'absent' | 'excused' | 'late') => {
    setAttendance(prev => ({ ...prev, [userId]: status }))
  }

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'late':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'excused':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-red-100 text-red-700 border-red-200'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'head_coach':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'assistant_coach':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'parent':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const PlayerCard = ({ member }: { member: UserTeamRole }) => {
    const stats = getPlayerStats(member.user_id)
    const attendanceStatus = getAttendanceStatus(member.user_id)

    return (
      <div className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-powlax-blue text-white font-semibold">
                {member.user?.name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {member.user?.name || 'Player'}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>#{stats.jersey_number}</span>
                <span>•</span>
                <span>{stats.position}</span>
              </div>
            </div>
          </div>
          
          {attendanceMode ? (
            <div className="flex space-x-1">
              {(['present', 'late', 'excused', 'absent'] as const).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={attendanceStatus === status ? 'default' : 'outline'}
                  onClick={() => setAttendanceStatus(member.user_id, status)}
                  className={`text-xs px-2 ${
                    attendanceStatus === status ? getAttendanceColor(status) : ''
                  }`}
                >
                  {status === 'present' && <CheckCircle className="h-3 w-3" />}
                  {status === 'absent' && <XCircle className="h-3 w-3" />}
                  {status === 'late' && <Clock className="h-3 w-3" />}
                  {status === 'excused' && <Star className="h-3 w-3" />}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-right">
              <div className="flex items-center justify-end space-x-1 text-sm">
                <Trophy className="h-3 w-3 text-yellow-500" />
                <span className="text-gray-600">{stats.recent_badges.length}</span>
              </div>
              <div className="text-xs text-gray-500">
                {stats.attendance_rate}% attendance
              </div>
            </div>
          )}
        </div>

        {!attendanceMode && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Skills</div>
              <div className="font-medium text-gray-900">{stats.skills_completed}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Recent Badges</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {stats.recent_badges.slice(0, 2).map((badge, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {badge}
                  </Badge>
                ))}
                {stats.recent_badges.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{stats.recent_badges.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {member.user?.email}
          </div>
          <div className="flex space-x-1">
            <Button size="sm" variant="outline" className="text-xs">
              <Mail className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <Phone className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const StaffCard = ({ member }: { member: UserTeamRole }) => (
    <div className="p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-powlax-blue text-white font-semibold">
              {member.user?.name?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">
              {member.user?.name || 'Staff Member'}
            </h3>
            <Badge variant="outline" className={`text-xs capitalize ${getRoleColor(member.role)}`}>
              {member.role.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <Button size="sm" variant="outline" className="text-xs">
            <Phone className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            <Mail className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-powlax-blue" />
            <span>Team Roster</span>
            <Badge variant="outline">{members.length}</Badge>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {canTakeAttendance && upcomingEvent && (
              <Button
                size="sm"
                variant={attendanceMode ? 'default' : 'outline'}
                onClick={() => setAttendanceMode(!attendanceMode)}
                className={attendanceMode ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {attendanceMode ? 'Save Attendance' : 'Take Attendance'}
              </Button>
            )}
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <UserPlus className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Add Member</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Email address" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="player">Player</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="assistant_coach">Assistant Coach</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full">Send Invitation</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex items-center space-x-3 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="player">Players</SelectItem>
              <SelectItem value="head_coach">Head Coach</SelectItem>
              <SelectItem value="assistant_coach">Assistant</SelectItem>
              <SelectItem value="parent">Parents</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="players" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Players ({players.length})</span>
            </TabsTrigger>
            <TabsTrigger value="coaches" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Coaches ({coaches.length})</span>
            </TabsTrigger>
            <TabsTrigger value="parents" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Parents ({parents.length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="players" className="space-y-4 mt-4">
            {players.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Players Yet</h3>
                <p className="text-gray-600">Add players to start building your roster.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {players.map((member) => (
                  <PlayerCard key={member.id} member={member} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="coaches" className="space-y-3 mt-4">
            {coaches.map((member) => (
              <StaffCard key={member.id} member={member} />
            ))}
          </TabsContent>
          
          <TabsContent value="parents" className="space-y-3 mt-4">
            {parents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No parent contacts added yet.</p>
              </div>
            ) : (
              parents.map((member) => (
                <StaffCard key={member.id} member={member} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}