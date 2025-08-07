'use client'

import { useState } from 'react'
import { Phone, MapPin, Calendar, Settings, AlertTriangle, Sun, Cloud } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import type { Team, UserTeamRole } from '@/types/teams'

interface TeamHeaderProps {
  team: Team
  userRole?: string
  members: UserTeamRole[]
}

export function TeamHeader({ team, userRole, members }: TeamHeaderProps) {
  const [emergencyOpen, setEmergencyOpen] = useState(false)

  const coaches = members.filter(m => ['head_coach', 'assistant_coach'].includes(m.role))
  const isCoach = userRole && ['head_coach', 'assistant_coach', 'team_admin'].includes(userRole)

  // Mock weather data - in production, integrate with weather API
  const currentWeather = {
    temp: 72,
    condition: 'sunny',
    feels_like: 75,
    wind: '8 mph NW'
  }

  const WeatherIcon = currentWeather.condition === 'sunny' ? Sun : Cloud

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        {/* Mobile-first responsive header */}
        <div className="flex items-center justify-between mb-4 lg:mb-0">
          {/* Team branding */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-powlax-blue rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {team.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                {team.name}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{team.age_group}</span>
                {team.level && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{team.level}</span>
                  </>
                )}
                {team.gender && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{team.gender}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick access buttons - Large touch targets */}
          <div className="flex items-center space-x-2">
            {/* Emergency contacts - Critical for field use */}
            <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 min-h-[48px] px-4"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Emergency</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Emergency Contacts</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {coaches.map((coach, index) => (
                    <div key={coach.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{coach.user?.name || 'Coach'}</p>
                        <p className="text-sm text-gray-600 capitalize">{coach.role.replace('_', ' ')}</p>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <Button variant="outline" className="w-full text-red-600 border-red-200">
                      <Phone className="h-4 w-4 mr-2" />
                      Call 911
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Settings access */}
            {isCoach && (
              <Link href={`/teams/${team.id}/settings`}>
                <Button variant="outline" size="sm" className="min-h-[48px] px-4">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Secondary info bar - Weather, location, subscription */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
          <div className="flex items-center space-x-6 text-sm">
            {/* Current weather for field conditions */}
            <div className="flex items-center space-x-2 text-gray-600">
              <WeatherIcon className="h-4 w-4" />
              <span>{currentWeather.temp}°F</span>
              <span className="text-xs text-gray-500">
                Feels {currentWeather.feels_like}°F • Wind {currentWeather.wind}
              </span>
            </div>

            {/* Field location if available */}
            <div className="flex items-center space-x-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>Home Field</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Coach roster preview */}
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-1">
                {coaches.slice(0, 3).map((coach, index) => (
                  <Avatar key={coach.id} className="w-8 h-8 border-2 border-white">
                    <AvatarFallback className="text-xs bg-powlax-blue text-white">
                      {coach.user?.name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {coaches.length} coach{coaches.length !== 1 ? 'es' : ''}
              </span>
            </div>

            {/* Subscription tier */}
            <Badge 
              variant={
                team.subscription_tier === 'activated' ? 'default' :
                team.subscription_tier === 'leadership' ? 'secondary' :
                'outline'
              }
              className="capitalize"
            >
              {team.subscription_tier}
            </Badge>
          </div>
        </div>

        {/* Organization breadcrumb */}
        {team.organization && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500">
              <span>{team.organization.name}</span>
              {team.organization.parent_org && (
                <>
                  <span className="mx-2">•</span>
                  <span>{team.organization.parent_org.name}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}