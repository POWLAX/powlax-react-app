'use client'

import { useState, useEffect } from 'react'
import { Users, GraduationCap, Heart, X, ArrowRight } from 'lucide-react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Button } from '@/components/ui/button'

interface UserRole {
  id: 'coach' | 'player' | 'parent'
  title: string
  description: string
  icon: React.ElementType
  tourId: string
  color: string
}

const roles: UserRole[] = [
  {
    id: 'coach',
    title: 'Coach',
    description: 'Plan practices, manage teams, and develop players',
    icon: Users,
    tourId: 'coach-welcome',
    color: 'bg-blue-100 text-blue-800 border-blue-200 hover:border-blue-400'
  },
  {
    id: 'player',
    title: 'Player',
    description: 'Improve skills, track progress, and complete workouts',
    icon: GraduationCap,
    tourId: 'player-welcome',
    color: 'bg-green-100 text-green-800 border-green-200 hover:border-green-400'
  },
  {
    id: 'parent',
    title: 'Parent',
    description: "Support your child's lacrosse development",
    icon: Heart,
    tourId: 'parent-welcome',
    color: 'bg-purple-100 text-purple-800 border-purple-200 hover:border-purple-400'
  }
]

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const { startTour } = useOnboarding()

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
  }

  const handleStartTour = () => {
    if (selectedRole) {
      startTour(selectedRole.tourId)
      onClose()
    }
  }

  const handleSkip = () => {
    // Mark as seen so it doesn't show again
    localStorage.setItem('powlax-welcome-seen', 'true')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto my-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 sm:p-8">
          <button
            onClick={handleSkip}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 text-white/80 hover:text-white rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-in zoom-in duration-500 delay-200">
              <span className="text-xl sm:text-2xl font-bold text-blue-600">P</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to POWLAX!</h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Let&apos;s customize your experience based on your role
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center">
            I am a...
          </h2>

          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            {roles.map((role) => {
              const Icon = role.icon
              const isSelected = selectedRole?.id === role.id
              
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role)}
                  className={`w-full p-3 sm:p-4 border-2 rounded-xl transition-all text-left ${
                    isSelected 
                      ? role.color.replace('hover:', '') 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className={`p-2 sm:p-3 rounded-lg ${
                      isSelected 
                        ? role.color.split(' ')[0] + ' ' + role.color.split(' ')[1]
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-sm sm:text-base ${
                        isSelected ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {role.title}
                      </h3>
                      <p className={`text-xs sm:text-sm mt-1 ${
                        isSelected ? 'text-gray-600' : 'text-gray-500'
                      }`}>
                        {role.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="text-blue-600 animate-in zoom-in duration-200">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-500 w-full sm:w-auto text-sm sm:text-base"
            >
              Skip for now
            </Button>
            
            <Button
              onClick={handleStartTour}
              disabled={!selectedRole}
              className={`w-full sm:w-auto text-sm sm:text-base ${
                selectedRole 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Start Tour
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}