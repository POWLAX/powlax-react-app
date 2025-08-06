'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface TaskCardProps {
  title: string
  description?: string
  actionText: string
  actionUrl: string
  priority?: 'high' | 'medium' | 'low'
}

export function TaskCard({ 
  title, 
  description, 
  actionText, 
  actionUrl, 
  priority = 'medium' 
}: TaskCardProps) {
  const priorityStyles = {
    high: 'border-orange-200 bg-orange-50',
    medium: 'border-gray-200 bg-white',
    low: 'border-gray-100 bg-gray-50'
  }

  return (
    <div className={`rounded-lg border p-6 shadow-sm ${priorityStyles[priority]}`}>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="text-gray-600 mt-2">{description}</p>
      )}
      <Link href={actionUrl}>
        <Button 
          className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
        >
          {actionText}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}