'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, GraduationCap, BookOpen, MessageCircle } from 'lucide-react'

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
    href: '/academy',
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

export default function BottomNavigation() {
  const pathname = usePathname()

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