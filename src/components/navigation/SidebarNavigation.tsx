'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, GraduationCap, BookOpen, MessageCircle, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/JWTAuthContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { Button } from '@/components/ui/button'
import SearchTrigger from '@/components/search/SearchTrigger'
import ThemeToggle from '@/components/theme/ThemeToggle'
import Image from 'next/image'

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
  const { isCollapsed, toggleSidebar } = useSidebar()

  return (
    <aside className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col w-full">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {/* Toggle Button - Above Logo */}
            <div className="flex justify-end px-4 pb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Logo Section */}
            <div className="flex items-center px-4 sidebar-logo">
              <div className="flex items-center overflow-hidden">
                {isCollapsed ? (
                  /* Small logo that fades in after collapse */
                  <div className="animate-fade-in">
                    <Image
                      src="/images/powlax-logo-icon.webp"
                      alt="POWLAX"
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                      priority
                    />
                  </div>
                ) : (
                  /* Full logo that stays in place during collapse */
                  <div className="flex items-center">
                    <Image
                      src="/images/powlax-logo-full.png"
                      alt="POWLAX"
                      width={176}
                      height={32}
                      className="h-8 w-auto object-contain object-left"
                      priority
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Search Bar - Hidden when collapsed */}
            {!isCollapsed && (
              <div className="px-4 mt-4 transition-opacity duration-300">
                <SearchTrigger 
                  variant="input" 
                  placeholder="Search drills, strategies..." 
                  className="w-full search-trigger"
                />
              </div>
            )}
            
            <nav className="mt-5 flex-1 px-2 space-y-1 overflow-hidden">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon
                
                return (
                  <div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Icon className="h-6 w-6 flex-shrink-0 mr-3" />
                      <span className={`whitespace-nowrap transition-opacity duration-150 ${
                        isCollapsed ? 'opacity-0' : 'opacity-100'
                      }`}>
                        {item.name}
                      </span>
                    </Link>
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                        {item.name}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 border-r-4 border-r-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
          
          {/* User section */}
          {user && (
            <div className="flex-shrink-0 flex bg-gray-700 p-4 overflow-hidden">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 relative group">
                  <User className="h-8 w-8 text-gray-300" />
                  {/* User tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 bottom-0 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                      {user.first_name || user.username}
                      <div className="absolute left-0 bottom-1/2 translate-y-1/2 -translate-x-1 w-0 h-0 border-r-4 border-r-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                    </div>
                  )}
                </div>
                <div className={`ml-3 flex-1 min-w-0 transition-opacity duration-150 ${
                  isCollapsed ? 'opacity-0' : 'opacity-100'
                }`}>
                  <p className="text-sm font-medium text-white truncate">
                    {user.first_name || user.username}
                  </p>
                  <p className="text-xs text-gray-300 truncate">
                    {user.email}
                  </p>
                </div>
                <div className={`flex items-center space-x-1 ml-2 transition-opacity duration-150 ${
                  isCollapsed ? 'opacity-0' : 'opacity-100'
                }`}>
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