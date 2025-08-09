'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, GraduationCap, BookOpen, MessageCircle, LogOut, User } from 'lucide-react'
import { useAuth } from '@/contexts/JWTAuthContext'
import { Button } from '@/components/ui/button'
import SearchTrigger from '@/components/search/SearchTrigger'
import ThemeToggle from '@/components/theme/ThemeToggle'

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
    href: '/skills-academy',
    icon: GraduationCap,
  },
  {
    name: 'Resources',
    href: '/resources',
    icon: BookOpen,
  },
  {
    name: 'Community',
    href: '/community',
    icon: MessageCircle,
  },
]

export default function SidebarNavigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 sidebar-logo">
              <h1 className="text-2xl font-bold text-white">POWLAX</h1>
            </div>
            
            {/* Search Bar */}
            <div className="px-4 mt-4">
              <SearchTrigger 
                variant="input" 
                placeholder="Search drills, strategies..." 
                className="w-full search-trigger"
              />
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="mr-3 h-6 w-6" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          
          {/* User section */}
          {user && (
            <div className="flex-shrink-0 flex bg-gray-700 p-4">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-gray-300" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    {user.first_name || user.username}
                  </p>
                  <p className="text-xs text-gray-300">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <ThemeToggle size="sm" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-gray-300 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
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