'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, GraduationCap, User, Calendar } from 'lucide-react'
import { useAuth } from '@/contexts/JWTAuthContext'
import { useMemo } from 'react'

interface NavItem {
  name: string
  href: string
  icon: any
  roles?: string[]
  always?: boolean
}

const allNavItems: NavItem[] = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: Home,
    always: true
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: Users,
    roles: ['coach', 'director', 'admin']
  },
  {
    name: 'Academy',
    href: '/skills-academy',
    icon: GraduationCap,
    roles: ['player', 'coach', 'admin']
  },
  {
    name: 'Practice',
    href: '/practice-plans',
    icon: Calendar,
    roles: ['coach', 'director', 'admin']
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    always: true
  },
]

export default function BottomNavigation() {
  const pathname = usePathname()
  const { user } = useAuth()
  
  // Filter navigation items based on user roles
  const navItems = useMemo(() => {
    return allNavItems.filter(item => {
      // Always show items marked as "always"
      if (item.always) return true
      
      // Show items if user has no roles (during development)
      if (!user?.roles || user.roles.length === 0) return true
      
      // Show items if user has matching role
      return item.roles?.some(role => user?.roles?.includes(role))
    })
  }, [user?.roles])

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 md:hidden z-40 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href) || 
                          (item.href === '/dashboard' && pathname === '/')
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center
                min-w-[64px] h-full px-2
                transition-all duration-200 relative
                ${isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 active:scale-95'
                }
              `}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-blue-600 rounded-b-full" />
              )}
              
              {/* Icon with better sizing */}
              <Icon className={`
                mb-1 transition-all duration-200
                ${isActive ? 'h-6 w-6' : 'h-5 w-5'}
              `} />
              
              {/* Always visible label with better typography */}
              <span className={`
                text-[11px] font-medium
                ${isActive ? 'font-semibold' : ''}
              `}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}