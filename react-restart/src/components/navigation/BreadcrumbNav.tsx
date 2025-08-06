'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: any
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function BreadcrumbNav({ items, className = '' }: BreadcrumbNavProps) {
  // Always add Home as the first item if not present
  const breadcrumbItems = items[0]?.label !== 'Home' 
    ? [{ label: 'Home', href: '/dashboard', icon: Home }, ...items]
    : items

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1
        const Icon = item.icon
        
        return (
          <div key={`${item.label}-${index}`} className="flex items-center">
            {/* Separator */}
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
            
            {/* Breadcrumb item */}
            {item.href && !isLast ? (
              <Link 
                href={item.href} 
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className="flex items-center text-gray-900 font-medium">
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}