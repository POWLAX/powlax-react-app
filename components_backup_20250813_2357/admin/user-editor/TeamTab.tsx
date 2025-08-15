'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  Building, 
  UserPlus, 
  Plus, 
  Trash2,
  Crown,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'

interface TeamData {
  team_memberships: any[]
  clubs: any[]
  positions: string[]
}

interface TeamTabProps {
  userData: TeamData
  onFieldChange: (tab: string, field: string, oldValue: any, newValue: any) => void
}

const LACROSSE_POSITIONS = [
  'attack',
  'midfield', 
  'defense',
  'goalie',
  'fogo', // Face-off specialist
  'lsm', // Long-stick midfielder
  'ssdm' // Short-stick defensive midfielder
]

const TEAM_ROLES = [
  'player',
  'captain',
  'assistant_captain',
  'team_coach',
  'assistant_coach',
  'head_coach'
]

export default function TeamTab({ userData, onFieldChange }: TeamTabProps) {
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [selectedClub, setSelectedClub] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [selectedRole, setSelectedRole] = useState('player')
  const [selectedPosition, setSelectedPosition] = useState('')

  // Get teams for selected club
  const getTeamsForClub = (clubId: string) => {
    // In a real implementation, this would filter teams by club
    // For now, return all teams that belong to the selected club
    return userData.team_memberships
      .filter(tm => tm.teams?.clubs?.id === clubId)
      .map(tm => tm.teams)
      .filter(Boolean)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'head_coach':
        return 'default'
      case 'team_coach':
      case 'assistant_coach':
        return 'secondary'
      case 'captain':
      case 'assistant_captain':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatPosition = (position: string) => {
    const positionMap: Record<string, string> = {
      'fogo': 'Face-off Specialist',
      'lsm': 'Long-stick Midfielder',
      'ssdm': 'Short-stick Defensive Midfielder'
    }
    
    return positionMap[position] || 
           position.charAt(0).toUpperCase() + position.slice(1)
  }

  const handleAddTeamMembership = async () => {
    if (!selectedClub || !selectedTeam || !selectedRole) {
      toast.error('Please fill in all required fields')
      return
    }

    // Check if user is already a member of this team
    const existingMembership = userData.team_memberships.find(
      tm => tm.team_id === selectedTeam
    )

    if (existingMembership) {
      toast.error('User is already a member of this team')
      return
    }

    const newMembership = {
      id: `tm_${Date.now()}`,
      user_id: 'current_user', // Will be set properly in implementation
      team_id: selectedTeam,
      role: selectedRole,
      position: selectedPosition || null,
      joined_at: new Date().toISOString(),
      is_active: true,
      teams: {
        id: selectedTeam,
        name: `Team ${selectedTeam}`, // Would be fetched from actual team data
        clubs: {
          id: selectedClub,
          name: userData.clubs.find(c => c.id === selectedClub)?.name || 'Unknown Club'
        }
      }
    }

    const updatedMemberships = [...userData.team_memberships, newMembership]
    onFieldChange('team', 'team_memberships', userData.team_memberships, updatedMemberships)
    
    toast.success('Team membership added successfully')
    setShowAddTeam(false)
    setSelectedClub('')
    setSelectedTeam('')
    setSelectedRole('player')
    setSelectedPosition('')
  }

  const handleRemoveTeamMembership = async (membershipId: string) => {
    const updatedMemberships = userData.team_memberships.filter(tm => tm.id !== membershipId)
    onFieldChange('team', 'team_memberships', userData.team_memberships, updatedMemberships)
    toast.success('Team membership removed successfully')
  }

  const handleUpdateRole = async (membershipId: string, newRole: string) => {
    const updatedMemberships = userData.team_memberships.map(tm => 
      tm.id === membershipId 
        ? { ...tm, role: newRole }
        : tm
    )
    onFieldChange('team', 'team_memberships', userData.team_memberships, updatedMemberships)
    toast.success('Role updated successfully')
  }

  const handleUpdatePosition = async (membershipId: string, newPosition: string) => {
    const updatedMemberships = userData.team_memberships.map(tm => 
      tm.id === membershipId 
        ? { ...tm, position: newPosition }
        : tm
    )
    onFieldChange('team', 'team_memberships', userData.team_memberships, updatedMemberships)
    toast.success('Position updated successfully')
  }

  return (
    <div className="space-y-6">
      {/* Current Team Memberships */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Memberships ({userData.team_memberships.length})
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddTeam(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Team
            </Button>
          </CardTitle>
          <CardDescription>
            User's current team affiliations and roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userData.team_memberships.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No team memberships
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userData.team_memberships.map((membership) => (
                  <TableRow key={membership.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        {membership.teams?.name || 'Unknown Team'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        {membership.teams?.clubs?.name || 'Unknown Club'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(membership.role)}>
                        {formatRole(membership.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {membership.position ? (
                        <Badge variant="outline">
                          {formatPosition(membership.position)}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {membership.joined_at 
                        ? new Date(membership.joined_at).toLocaleDateString()
                        : 'Unknown'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Select
                          value={membership.role}
                          onValueChange={(newRole) => handleUpdateRole(membership.id, newRole)}
                        >
                          <SelectTrigger className="w-auto h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TEAM_ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                {formatRole(role)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (confirm(`This will remove the user from ${membership.teams?.name}. This action cannot be undone. Continue?`)) {
                              handleRemoveTeamMembership(membership.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Add Team Membership Form */}
          {showAddTeam && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-3">Add Team Membership</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="club">Club *</Label>
                  <Select value={selectedClub} onValueChange={setSelectedClub}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a club" />
                    </SelectTrigger>
                    <SelectContent>
                      {userData.clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="team">Team *</Label>
                  <Input
                    id="team"
                    placeholder="Team ID or name"
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    In a full implementation, this would be a dropdown of teams for the selected club
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {formatRole(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="position">Position (for players)</Label>
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No position</SelectItem>
                      {LACROSSE_POSITIONS.map((position) => (
                        <SelectItem key={position} value={position}>
                          {formatPosition(position)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAddTeamMembership} size="sm">
                    Add Membership
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddTeam(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Club Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Associated Clubs
          </CardTitle>
          <CardDescription>
            Clubs the user is affiliated with through team memberships
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userData.clubs.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No club affiliations
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userData.clubs.map((club) => {
                const userTeamsInClub = userData.team_memberships.filter(
                  tm => tm.teams?.clubs?.id === club.id
                )
                
                return (
                  <div key={club.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{club.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {club.description || 'No description available'}
                        </p>
                        <div className="mt-2">
                          <Badge variant="outline">
                            {userTeamsInClub.length} team{userTeamsInClub.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Position Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Position Summary
          </CardTitle>
          <CardDescription>
            Summary of playing positions across all teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userData.positions.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No positions assigned
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(userData.positions)).map((position) => (
                <Badge key={position} variant="secondary">
                  {formatPosition(position)}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}