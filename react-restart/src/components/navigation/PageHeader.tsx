'use client'

import { ReactNode } from 'react'
import BreadcrumbNav, { BreadcrumbItem } from './BreadcrumbNav'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
  showBackButton?: boolean
  className?: string
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  showBackButton = false,
  className = ''
}: PageHeaderProps) {
  const router = useRouter()
  
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-3">
            <BreadcrumbNav items={breadcrumbs} />
          </div>
        )}
        
        {/* Main header content */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* Back button */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="p-2 -ml-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            
            {/* Title and subtitle */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}