'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LucideIcon, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface ActionCardProps {
  title: string
  description: string
  href: string
  icon?: LucideIcon
  color?: 'blue' | 'orange' | 'green' | 'purple' | 'gray'
  buttonText?: string
  disabled?: boolean
}

const colorClasses = {
  blue: {
    icon: 'text-blue-600',
    background: 'bg-blue-50',
    button: 'bg-blue-600 hover:bg-blue-700 text-white'
  },
  orange: {
    icon: 'text-orange-600',
    background: 'bg-orange-50',
    button: 'bg-orange-600 hover:bg-orange-700 text-white'
  },
  green: {
    icon: 'text-green-600',
    background: 'bg-green-50',
    button: 'bg-green-600 hover:bg-green-700 text-white'
  },
  purple: {
    icon: 'text-purple-600',
    background: 'bg-purple-50',
    button: 'bg-purple-600 hover:bg-purple-700 text-white'
  },
  gray: {
    icon: 'text-gray-600',
    background: 'bg-gray-50',
    button: 'bg-gray-600 hover:bg-gray-700 text-white'
  }
}

export function ActionCard({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  color = 'blue', 
  buttonText = 'Go',
  disabled = false 
}: ActionCardProps) {
  const colors = colorClasses[color]
  
  return (
    <Card className="h-full">
      <CardHeader className={colors.background}>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className={`h-5 w-5 ${colors.icon}`} />}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-6">
        <div className="flex-1" />
        <Button 
          asChild 
          className={`w-full ${colors.button}`}
          disabled={disabled}
        >
          <Link href={disabled ? '#' : href} className="flex items-center justify-center gap-2">
            {buttonText}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}