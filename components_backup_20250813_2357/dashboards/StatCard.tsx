'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  color?: 'blue' | 'orange' | 'green' | 'purple' | 'gray'
  trend?: {
    value: number
    label: string
  }
}

const colorClasses = {
  blue: {
    icon: 'text-blue-600',
    background: 'bg-blue-50',
    text: 'text-blue-900'
  },
  orange: {
    icon: 'text-orange-600',
    background: 'bg-orange-50',
    text: 'text-orange-900'
  },
  green: {
    icon: 'text-green-600',
    background: 'bg-green-50',
    text: 'text-green-900'
  },
  purple: {
    icon: 'text-purple-600',
    background: 'bg-purple-50',
    text: 'text-purple-900'
  },
  gray: {
    icon: 'text-gray-600',
    background: 'bg-gray-50',
    text: 'text-gray-900'
  }
}

export function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }: StatCardProps) {
  const colors = colorClasses[color]
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${colors.background} pb-2`}>
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span className={colors.text}>{title}</span>
          {Icon && <Icon className={`h-4 w-4 ${colors.icon}`} />}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`text-sm ${trend.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-sm text-gray-500 ml-2">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}