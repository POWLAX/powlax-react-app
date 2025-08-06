'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, Users, GraduationCap, Calendar, ClipboardList,
  Settings, LogOut, User, ChevronRight, Building2,
  FileText, HelpCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/JWTAuthContext'
import { Button } from '@/components/ui/button'
import { useMemo } from 'react'

interface NavItem {
  name: string
  href: string
  icon: any
  roles?: string[]
  always?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navigationSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      {
        name: 'Dashboard',
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
        name: 'Organizations',
        href: '/organizations',
        icon: Building2,
        roles: ['director', 'admin']
      },
    ]
  },
  {
    title: 'Training',
    items: [
      {
        name: 'Skills Academy',
        href: '/skills-academy',
        icon: GraduationCap,
        roles: ['player', 'coach', 'admin']
      },
      {
        name: 'Practice Plans',
        href: '/practice-plans',
        icon: Calendar,
        roles: ['coach', 'director', 'admin']
      },
      {
        name: 'Drill Library',
        href: '/drills',
        icon: ClipboardList,
        roles: ['coach', 'director', 'admin']
      },
    ]
  },
  {
    title: 'Resources',
    items: [
      {
        name: 'Content Library',
        href: '/resources',
        icon: FileText,
        always: true
      },
      {
        name: 'Help Center',
        href: '/help',
        icon: HelpCircle,
        always: true
      },
    ]
  }
]

export default function SidebarNavigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  // Filter navigation sections based on user roles
  const filteredSections = useMemo(() => {
    return navigationSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        // Always show items marked as "always"
        if (item.always) return true
        
        // Show items if user has no roles (during development)
        if (!user?.roles || user.roles.length === 0) return true
        
        // Show items if user has matching role
        return item.roles?.some(role => user?.roles?.includes(role))
      })
    })).filter(section => section.items.length > 0) // Remove empty sections
  }, [user?.roles])

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {/* Logo/Brand */}
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <h1 className="text-2xl font-bold text-blue-600">POWLAX</h1>
            </div>
            
            {/* Navigation Sections */}
            <nav className="flex-1 px-3 space-y-6">
              {filteredSections.map((section) => (
                <div key={section.title}>
                  {/* Section Header */}
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                  
                  {/* Section Items */}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname.startsWith(item.href) || 
                                      (item.href === '/dashboard' && pathname === '/')
                      const Icon = item.icon
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`
                            group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                            transition-all duration-150 relative
                            ${isActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }
                          `}
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r" />
                          )}
                          
                          <Icon className={`
                            mr-3 flex-shrink-0 transition-colors
                            ${isActive ? 'h-5 w-5 text-blue-600' : 'h-5 w-5 text-gray-400 group-hover:text-gray-500'}
                          `} />
                          
                          <span className="flex-1">{item.name}</span>
                          
                          {isActive && (
                            <ChevronRight className="h-4 w-4 text-blue-600 ml-auto" />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
          
          {/* User section */}
          {user && (
            <div className="flex-shrink-0 border-t border-gray-200">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {user.name || user.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.email || 'user@powlax.com'}
                    </p>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="mt-3 flex gap-2">
                  <Link
                    href="/profile"
                    className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="flex-1 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}