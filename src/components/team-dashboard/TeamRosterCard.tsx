'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TeamMember {
  id: string
  user: {
    first_name: string
    last_name: string
    email: string
  }
  role: string
  jersey_number?: string | null
  position?: string | null
}

interface TeamRosterCardProps {
  members: TeamMember[]
  teamId: string
  isCoach?: boolean
}

export function TeamRosterCard({ members, teamId, isCoach = false }: TeamRosterCardProps) {
  const coaches = members.filter(m => ['head_coach', 'assistant_coach'].includes(m.role))
  const players = members.filter(m => m.role === 'player')
  const parents = members.filter(m => m.role === 'parent')

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'head_coach':
        return 'bg-blue-100 text-blue-800'
      case 'assistant_coach':
        return 'bg-indigo-100 text-indigo-800'
      case 'player':
        return 'bg-green-100 text-green-800'
      case 'parent':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Roster
          </CardTitle>
          {isCoach && (
            <Button size="sm" variant="outline">
              <UserPlus className="h-4 w-4 mr-1" />
              Invite
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pb-4 border-b">
            <div className="text-center">
              <div className="text-2xl font-bold">{coaches.length}</div>
              <div className="text-xs text-gray-600">Coaches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{players.length}</div>
              <div className="text-xs text-gray-600">Players</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{parents.length}</div>
              <div className="text-xs text-gray-600">Parents</div>
            </div>
          </div>

          {/* Member List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No team members yet</p>
                {isCoach && (
                  <p className="text-sm mt-2">
                    Click "Invite" to add players and coaches
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Coaches Section */}
                {coaches.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Coaches</h4>
                    {coaches.map((member) => (
                      <div key={member.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {member.user.first_name} {member.user.last_name}
                            </div>
                            <div className="text-xs text-gray-500">{member.user.email}</div>
                          </div>
                        </div>
                        <Badge className={`text-xs ${getRoleBadgeColor(member.role)}`}>
                          {formatRole(member.role)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Players Section */}
                {players.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Players</h4>
                    {players.map((member) => (
                      <div key={member.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            {member.jersey_number ? (
                              <span className="text-xs font-bold text-green-700">
                                {member.jersey_number}
                              </span>
                            ) : (
                              <Users className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {member.user.first_name} {member.user.last_name}
                              {member.position && (
                                <span className="text-xs text-gray-500 ml-2">• {member.position}</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{member.user.email}</div>
                          </div>
                        </div>
                        <Badge className={`text-xs ${getRoleBadgeColor(member.role)}`}>
                          Player
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* View All Link */}
          {members.length > 5 && (
            <div className="pt-2 border-t">
              <Button variant="link" className="w-full text-sm" asChild>
                <a href={`/teams/${teamId}/roster`}>
                  View Full Roster →
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}