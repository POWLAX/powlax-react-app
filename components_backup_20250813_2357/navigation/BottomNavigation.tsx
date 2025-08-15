'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Home, Users, GraduationCap, BookOpen, ChevronUp, ChevronDown } from 'lucide-react'

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: Users,
  },
  {
    name: 'Academy',
    href: '/skills-academy/workouts',
    icon: GraduationCap,
  },
  {
    name: 'Resources',
    href: '/resources',
    icon: BookOpen,
  },
]

export default function BottomNavigation() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Special collapsible behavior for Practice Planner and Skills Academy Workout pages
  if (pathname?.includes('/practiceplan') || pathname?.includes('/skills-academy/workout/')) {
    return (
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50">
        {/* Navigation items - shown when expanded */}
        {isExpanded && (
          <nav className="bg-white border-t border-gray-200">
            <div className="flex justify-around py-2">
              {navItems.map((item) => {
                const isActive = pathname?.includes('/practiceplan') 
                  ? item.href === '/teams'
                  : pathname?.includes('/skills-academy') && item.href === '/skills-academy'
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center py-2 px-3 text-xs ${
                      isActive
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-6 w-6 mb-1" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
        
        {/* Menu toggle button - always visible with top border for contrast */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full bg-gray-800 text-white py-3 flex items-center justify-center gap-2 border-t-2 border-gray-600"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">Menu</span>
        </button>
      </div>
    )
  }

  // Regular navigation for other pages
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 text-xs ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}