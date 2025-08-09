'use client'

import { useState } from 'react'
import { Plus, Calendar, Play, Clock, X } from 'lucide-react'
// Removed framer-motion - using CSS animations instead
import Link from 'next/link'

interface QuickAction {
  id: string
  label: string
  icon: React.ElementType
  href?: string
  onClick?: () => void
  color: string
}

const quickActions: QuickAction[] = [
  {
    id: 'create-practice',
    label: 'New Practice Plan',
    icon: Calendar,
    href: '/practice-planner',
    color: 'bg-powlax-blue hover:bg-blue-700'
  },
  {
    id: 'start-workout',
    label: 'Start Workout',
    icon: Play,
    href: '/skills-academy',
    color: 'bg-powlax-orange hover:bg-orange-700'
  },
  {
    id: 'todays-schedule',
    label: "Today's Schedule",
    icon: Clock,
    href: '/dashboard',
    color: 'bg-green-600 hover:bg-green-700'
  }
]

interface FloatingActionButtonProps {
  className?: string
}

export default function FloatingActionButton({ className = '' }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleActionClick = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick()
    }
    setIsOpen(false)
  }

  return (
    <div className={`fixed bottom-24 right-4 z-50 ${className}`}>
      {/* Quick Action Items */}
      {isOpen && (
        <div className="flex flex-col space-y-3 mb-4 animate-in fade-in zoom-in-95 duration-200">
          {quickActions.map((action, index) => (
            <div
              key={action.id}
              className="flex items-center animate-in slide-in-from-right-5 fade-in duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
                {/* Action Label */}
                <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap mr-3">
                  {action.label}
                </div>
                
                {/* Action Button */}
                {action.href ? (
                  <Link
                    href={action.href}
                    onClick={() => setIsOpen(false)}
                    className={`${action.color} text-white rounded-full p-3 shadow-lg transition-all duration-200 transform hover:scale-110`}
                  >
                    <action.icon className="h-6 w-6" />
                  </Link>
                ) : (
                  <button
                    onClick={() => handleActionClick(action)}
                    className={`${action.color} text-white rounded-full p-3 shadow-lg transition-all duration-200 transform hover:scale-110`}
                  >
                    <action.icon className="h-6 w-6" />
                  </button>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={toggleMenu}
        className={`bg-powlax-blue text-white rounded-full p-4 shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 -z-10 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}