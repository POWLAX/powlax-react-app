'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface StepItem {
  title: string
  description: string
  actionLabel: string
  actionHref: string
}

interface SuccessStepsCardProps {
  role: 'player' | 'parent' | 'coach'
  teamName: string
}

export function SuccessStepsCard({ role, teamName }: SuccessStepsCardProps) {
  const getStepsByRole = (): StepItem[] => {
    switch (role) {
      case 'player':
        return [
          {
            title: 'Skills Academy',
            description: 'Start improving your lacrosse skills with interactive training',
            actionLabel: 'Start Training',
            actionHref: '/skills-academy'
          },
          {
            title: 'Practice Schedule',
            description: 'View upcoming practices and team events',
            actionLabel: 'View Schedule',
            actionHref: '/teams'
          }
        ]
      
      case 'parent':
        return [
          {
            title: 'Team Communication',
            description: 'Stay updated with team announcements and messages',
            actionLabel: 'Join Updates',
            actionHref: '/teams'
          },
          {
            title: 'Practice Schedule',
            description: 'View your child\'s practice times and locations',
            actionLabel: 'See Schedule',
            actionHref: '/teams'
          }
        ]
      
      case 'coach':
        return [
          {
            title: 'Team Dashboard',
            description: 'Manage your team roster and settings',
            actionLabel: 'Manage Team',
            actionHref: '/teams'
          },
          {
            title: 'Practice Planner',
            description: 'Create and organize practice sessions',
            actionLabel: 'Plan Practice',
            actionHref: '/teams'
          }
        ]
      
      default:
        return []
    }
  }

  const steps = getStepsByRole()

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to {teamName}!
        </h1>
        <p className="text-gray-600">
          Your registration is complete. Here's what you can do next:
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Next Steps</h2>
        
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="ml-4"
              >
                <a href={step.actionHref}>
                  {step.actionLabel}
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}