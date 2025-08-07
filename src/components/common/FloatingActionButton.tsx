'use client'

import { useState } from 'react'
import { Plus, Calendar, Play, Clock, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
    href: '/skills-academy/workouts',
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col space-y-3 mb-4"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center"
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={toggleMenu}
        className="bg-powlax-blue text-white rounded-full p-4 shadow-lg transition-all duration-200 transform hover:scale-110"
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-20 -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}