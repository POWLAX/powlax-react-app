'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  ClipboardList, 
  MessageSquare,
  FileText,
  Video,
  Zap
} from 'lucide-react'

interface QuickActionsCardProps {
  teamId: string
  role: 'head_coach' | 'assistant_coach' | 'player' | 'parent'
}

export function QuickActionsCard({ teamId, role }: QuickActionsCardProps) {
  const getActionsForRole = () => {
    switch (role) {
      case 'head_coach':
      case 'assistant_coach':
        return [
          {
            label: 'Plan Practice',
            icon: ClipboardList,
            href: `/teams/${teamId}/practice-plans`,
            color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
          },
          {
            label: 'Send Message',
            icon: MessageSquare,
            href: `/teams/${teamId}/communications`,
            color: 'text-green-600 bg-green-50 hover:bg-green-100'
          },
          {
            label: 'Add Player',
            icon: Users,
            href: `/teams/${teamId}/roster`,
            color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
          },
          {
            label: 'Schedule Practice',
            icon: Calendar,
            href: `/teams/${teamId}/schedule`,
            color: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
          }
        ]
      case 'player':
        return [
          {
            label: 'Skills Training',
            icon: Video,
            href: '/skills-academy',
            color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
          },
          {
            label: 'View Schedule',
            icon: Calendar,
            href: `/teams/${teamId}/schedule`,
            color: 'text-green-600 bg-green-50 hover:bg-green-100'
          },
          {
            label: 'Team Playbook',
            icon: FileText,
            href: `/teams/${teamId}/playbook`,
            color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
          },
          {
            label: 'My Progress',
            icon: Zap,
            href: '/skills-academy/progress',
            color: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
          }
        ]
      case 'parent':
        return [
          {
            label: 'View Schedule',
            icon: Calendar,
            href: `/teams/${teamId}/schedule`,
            color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'
          },
          {
            label: 'Team Updates',
            icon: MessageSquare,
            href: `/teams/${teamId}/communications`,
            color: 'text-green-600 bg-green-50 hover:bg-green-100'
          },
          {
            label: 'Team Roster',
            icon: Users,
            href: `/teams/${teamId}/roster`,
            color: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
          },
          {
            label: 'Resources',
            icon: FileText,
            href: '/resources',
            color: 'text-orange-600 bg-orange-50 hover:bg-orange-100'
          }
        ]
      default:
        return []
    }
  }

  const actions = getActionsForRole()
  const roleTitle = role.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                variant="outline"
                className={`h-auto flex flex-col items-center gap-2 p-4 ${action.color} border-0`}
                asChild
              >
                <a href={action.href}>
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{action.label}</span>
                </a>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}