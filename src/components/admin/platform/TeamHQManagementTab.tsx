'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users2, 
  UserPlus,
  UserMinus,
  Calendar,
  BookOpen,
  BarChart3,
  Shield,
  AlertTriangle,
  Crown,
  Target,
  ArrowUpCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Trophy,
  Zap,
  Mail,
  Phone,
  MapPin,
  Star
} from 'lucide-react'
import { useTeamHQManagement } from '@/hooks/useTeamHQManagement'
import { TierEnforcementEngine } from '@/lib/platform/tier-enforcement'

export default function TeamHQManagementTab() {
  const {
    teams,
    selectedTeam,
    roster,
    schedule,
    playbooks,
    analytics,
    membership,
    loading,
    error,
    selectTeam,
    updateTeamSettings,
    addTeamMember,
    removeTeamMember,
    assignAcademyAccess,
    removeAcademyAccess,
    createScheduleEvent,
    createPlaybook,
    hasFeatureAccess,
    getUpgradeInfo,
    checkAcademyLimit,
    refreshData
  } = useTeamHQManagement()

  const [activeTab, setActiveTab] = useState('overview')
  const [rosterSearch, setRosterSearch] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<'player' | 'coach' | 'manager' | 'parent'>('player')
  const [scheduleForm, setScheduleForm] = useState({
    type: 'practice' as 'practice' | 'game' | 'tournament',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: ''
  })
  const [playbookForm, setPlaybookForm] = useState({
    name: '',
    description: ''
  })

  const getTierBadge = (tier?: string) => {
    if (!tier) return null
    
    const badgeColor = TierEnforcementEngine.getTierBadgeColor(tier)
    const tierName = TierEnforcementEngine.formatTierName(tier)
    
    const icon = tier === 'activated' ? Crown : tier === 'leadership' ? Target : Shield
    const Icon = icon

    return (
      <Badge className={`${badgeColor} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {tierName}
      </Badge>
    )
  }

  const renderFeatureAccess = (feature: string, label: string, description: string) => {
    const hasAccess = hasFeatureAccess(feature)
    const upgradeInfo = getUpgradeInfo(feature)

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{label}</span>
            {hasAccess ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowUpCircle className="h-4 w-4 text-orange-500" />
            )}
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {!hasAccess && upgradeInfo.tier && (
          <Button variant="outline" size="sm">
            Upgrade to {TierEnforcementEngine.formatTierName(upgradeInfo.tier)}
          </Button>
        )}
      </div>
    )
  }

  const handleAddMember = async () => {
    if (!selectedTeam || !newMemberEmail || !newMemberRole) return

    try {
      // In a real implementation, this would first find or create the user
      // For now, we'll simulate with a placeholder user ID
      const userId = `user_${Date.now()}`
      await addTeamMember(selectedTeam.id, userId, newMemberRole)
      setNewMemberEmail('')
      setNewMemberRole('player')
    } catch (error) {
      console.error('Failed to add member:', error)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return

    try {
      await removeTeamMember(selectedTeam.id, userId)
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }

  const handleToggleAcademyAccess = async (member: any) => {
    if (!selectedTeam) return

    try {
      if (member.academy_access) {
        await removeAcademyAccess(selectedTeam.id, member.user_id)
      } else {
        await assignAcademyAccess(selectedTeam.id, member.user_id)
      }
    } catch (error) {
      console.error('Failed to toggle academy access:', error)
    }
  }

  const handleCreateEvent = async () => {
    if (!selectedTeam || !scheduleForm.title || !scheduleForm.date) return

    try {
      await createScheduleEvent(selectedTeam.id, {
        team_id: selectedTeam.id,
        type: scheduleForm.type,
        title: scheduleForm.title,
        date: scheduleForm.date,
        start_time: scheduleForm.startTime,
        end_time: scheduleForm.endTime,
        location: scheduleForm.location
      })
      setScheduleForm({
        type: 'practice',
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        location: ''
      })
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }

  const handleCreatePlaybook = async () => {
    if (!selectedTeam || !playbookForm.name) return

    try {
      await createPlaybook(selectedTeam.id, {
        team_id: selectedTeam.id,
        name: playbookForm.name,
        description: playbookForm.description,
        plays: []
      })
      setPlaybookForm({ name: '', description: '' })
    } catch (error) {
      console.error('Failed to create playbook:', error)
    }
  }

  const filteredRoster = roster.filter(member => 
    member.user?.full_name?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
    member.user?.email?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
    member.role.toLowerCase().includes(rosterSearch.toLowerCase())
  )

  const academyLimit = selectedTeam ? checkAcademyLimit(selectedTeam.id) : null
  const playersWithAccess = roster.filter(m => m.academy_access && m.role === 'player').length

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Loading teams...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users2 className="h-6 w-6" />
            Team HQ Management
          </h2>
          <p className="text-gray-600">Advanced team management and oversight</p>
        </div>
        {membership && getTierBadge(membership.teamTier)}
      </div>

      {/* Team Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5" />
            Select Team
          </CardTitle>
          <CardDescription>
            Choose a team to manage roster, schedule, and playbooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <Card 
                key={team.id}
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedTeam?.id === team.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => selectTeam(team.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{team.name}</h3>
                    {selectedTeam?.id === team.id && (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {team.age_group && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-3 w-3" />
                        {team.age_group}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users2 className="h-3 w-3" />
                      {team.member_count || 0} members
                    </div>
                    {team.season && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {team.season}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Management Tabs */}
      {selectedTeam && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users2 className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Total Members</span>
                  </div>
                  <div className="text-2xl font-bold">{roster.length}</div>
                  <div className="text-sm text-gray-600">All roles</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Players</span>
                  </div>
                  <div className="text-2xl font-bold">{roster.filter(m => m.role === 'player').length}</div>
                  <div className="text-sm text-gray-600">Active players</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Academy Access</span>
                  </div>
                  <div className="text-2xl font-bold">{playersWithAccess}/25</div>
                  <div className="text-sm text-gray-600">Players with access</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">This Month</span>
                  </div>
                  <div className="text-2xl font-bold">{schedule.length}</div>
                  <div className="text-sm text-gray-600">Scheduled events</div>
                </CardContent>
              </Card>
            </div>

            {/* Academy Access Limit */}
            {academyLimit && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Academy Access Management
                  </CardTitle>
                  <CardDescription>
                    Skills Academy access is limited to 25 players per team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Players with Academy Access</span>
                        <span>{playersWithAccess} / {academyLimit.limit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            academyLimit.withinLimit ? 'bg-green-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${(playersWithAccess / academyLimit.limit) * 100}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {academyLimit.remaining} spots remaining
                      </div>
                    </div>

                    {!academyLimit.withinLimit && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          You have reached the 25-player limit for Skills Academy access. 
                          Remove access from some players to assign it to others.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feature Access Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Team HQ Features</CardTitle>
                <CardDescription>
                  Available features for your current Team HQ tier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {renderFeatureAccess('roster_management', 'Roster Management', 'Add, remove, and organize team members')}
                {renderFeatureAccess('basic_scheduling', 'Basic Scheduling', 'Practice and game scheduling')}
                {renderFeatureAccess('playbook_access', 'Playbook Access', 'Team playbooks and strategy sharing')}
                {renderFeatureAccess('advanced_scheduling', 'Advanced Scheduling', 'Recurring events and complex scheduling')}
                {renderFeatureAccess('parent_communication', 'Parent Communication', 'Automated parent updates and notifications')}
                {renderFeatureAccess('full_analytics', 'Full Analytics', 'Comprehensive team performance metrics')}
                {renderFeatureAccess('custom_playbooks', 'Custom Playbooks', 'Create and customize team playbooks')}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roster Tab */}
          <TabsContent value="roster" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Team Roster</h3>
                <p className="text-gray-600">Manage team members and academy access</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search members..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            {/* Add Member Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Add Team Member
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="memberEmail">Email Address</Label>
                    <Input
                      id="memberEmail"
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="member@example.com"
                      disabled={!hasFeatureAccess('roster_management')}
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select 
                      value={newMemberRole}
                      onValueChange={(value: any) => setNewMemberRole(value)}
                      disabled={!hasFeatureAccess('roster_management')}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="player">Player</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleAddMember}
                    disabled={!hasFeatureAccess('roster_management') || !newMemberEmail || !newMemberRole}
                  >
                    Add Member
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Roster List */}
            <div className="space-y-2">
              {filteredRoster.map(member => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {member.user?.full_name || member.user?.email || 'Unknown User'}
                            </span>
                            <Badge variant="outline">{member.role}</Badge>
                            {member.academy_access && (
                              <Badge className="bg-purple-100 text-purple-800">
                                <Zap className="h-3 w-3 mr-1" />
                                Academy
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {member.user?.email}
                            {member.jersey_number && ` • #${member.jersey_number}`}
                            {member.position && ` • ${member.position}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {member.role === 'player' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAcademyAccess(member)}
                            disabled={!member.academy_access && !academyLimit?.withinLimit}
                          >
                            {member.academy_access ? (
                              <>
                                <UserMinus className="h-4 w-4 mr-2" />
                                Remove Academy
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Academy
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member.user_id)}
                          disabled={!hasFeatureAccess('roster_management')}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRoster.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {rosterSearch ? 'No members match your search.' : 'No team members yet.'}
              </div>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Team Schedule</h3>
                <p className="text-gray-600">Manage practices, games, and events</p>
              </div>
            </div>

            {hasFeatureAccess('basic_scheduling') ? (
              <>
                {/* Create Event Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Create Event
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Event Type</Label>
                        <Select 
                          value={scheduleForm.type}
                          onValueChange={(value: any) => setScheduleForm(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="practice">Practice</SelectItem>
                            <SelectItem value="game">Game</SelectItem>
                            <SelectItem value="tournament">Tournament</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="eventTitle">Title</Label>
                        <Input
                          id="eventTitle"
                          value={scheduleForm.title}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Event title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventDate">Date</Label>
                        <Input
                          id="eventDate"
                          type="date"
                          value={scheduleForm.date}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventLocation">Location</Label>
                        <Input
                          id="eventLocation"
                          value={scheduleForm.location}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Event location"
                        />
                      </div>
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={scheduleForm.startTime}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={scheduleForm.endTime}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button onClick={handleCreateEvent}>
                        Create Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Schedule List */}
                <div className="space-y-2">
                  {schedule.map(event => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.title}</span>
                              <Badge variant="outline">{event.type}</Badge>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.start_time} - {event.end_time}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {schedule.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No scheduled events yet. Create your first event above.
                  </div>
                )}
              </>
            ) : (
              <Alert>
                <ArrowUpCircle className="h-4 w-4" />
                <AlertDescription>
                  Schedule management requires Team Structure tier or higher.
                  Upgrade to access team scheduling features.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Playbooks Tab */}
          <TabsContent value="playbooks" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Team Playbooks</h3>
                <p className="text-gray-600">Manage team strategies and plays</p>
              </div>
            </div>

            {hasFeatureAccess('playbook_access') ? (
              <>
                {/* Create Playbook Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Create Playbook
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="playbookName">Playbook Name</Label>
                        <Input
                          id="playbookName"
                          value={playbookForm.name}
                          onChange={(e) => setPlaybookForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Offensive Strategies"
                          disabled={!hasFeatureAccess('custom_playbooks')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="playbookDesc">Description</Label>
                        <Input
                          id="playbookDesc"
                          value={playbookForm.description}
                          onChange={(e) => setPlaybookForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description of the playbook"
                          disabled={!hasFeatureAccess('custom_playbooks')}
                        />
                      </div>
                      <Button 
                        onClick={handleCreatePlaybook}
                        disabled={!hasFeatureAccess('custom_playbooks') || !playbookForm.name}
                      >
                        Create Playbook
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Playbooks List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playbooks.map(playbook => (
                    <Card key={playbook.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">{playbook.name}</span>
                        </div>
                        {playbook.description && (
                          <p className="text-sm text-gray-600 mb-3">{playbook.description}</p>
                        )}
                        <div className="text-sm text-gray-500 mb-3">
                          {playbook.plays.length} plays
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Open Playbook
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {playbooks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No playbooks created yet. Create your first playbook above.
                  </div>
                )}
              </>
            ) : (
              <Alert>
                <ArrowUpCircle className="h-4 w-4" />
                <AlertDescription>
                  Playbook access requires Team Leadership tier or higher.
                  Upgrade to access team playbook features.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {hasFeatureAccess('team_stats') ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users2 className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Roster Size</span>
                      </div>
                      <div className="text-2xl font-bold">{analytics?.roster_size || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Active Players</span>
                      </div>
                      <div className="text-2xl font-bold">{analytics?.active_players || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">Practices</span>
                      </div>
                      <div className="text-2xl font-bold">{analytics?.practices_this_month || 0}</div>
                      <div className="text-sm text-gray-600">This month</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">Academy Sessions</span>
                      </div>
                      <div className="text-2xl font-bold">{analytics?.academy_usage.total_sessions || 0}</div>
                      <div className="text-sm text-gray-600">Total sessions</div>
                    </CardContent>
                  </Card>
                </div>

                {hasFeatureAccess('full_analytics') && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                      <CardDescription>
                        Team engagement and development tracking
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Attendance Rate</span>
                            <span>{analytics?.performance_metrics.attendance_rate || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${analytics?.performance_metrics.attendance_rate || 0}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Skill Progression</span>
                            <span>{analytics?.performance_metrics.skill_progression || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${analytics?.performance_metrics.skill_progression || 0}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Engagement Score</span>
                            <span>{analytics?.performance_metrics.engagement_score || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${analytics?.performance_metrics.engagement_score || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Alert>
                <ArrowUpCircle className="h-4 w-4" />
                <AlertDescription>
                  Team analytics are available with Team Leadership tier and above.
                  Upgrade to access detailed team performance metrics.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}