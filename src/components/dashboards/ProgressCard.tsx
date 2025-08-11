'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'

interface ProgressItem {
  label: string
  value: number
  maxValue?: number
  color?: 'blue' | 'orange' | 'green' | 'purple' | 'gray'
}

interface ProgressCardProps {
  title: string
  description?: string
  items: ProgressItem[]
  icon?: LucideIcon
  showBadges?: boolean
}

const progressColors = {
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-500'
}

export function ProgressCard({ title, description, items, icon: Icon, showBadges = false }: ProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-blue-600" />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => {
          const percentage = item.maxValue ? (item.value / item.maxValue) * 100 : item.value
          const color = item.color || 'blue'
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {item.value}{item.maxValue ? `/${item.maxValue}` : '%'}
                  </span>
                  {showBadges && percentage >= 80 && (
                    <Badge variant="secondary" className="text-xs">
                      Excellent
                    </Badge>
                  )}
                  {showBadges && percentage >= 60 && percentage < 80 && (
                    <Badge variant="outline" className="text-xs">
                      Good
                    </Badge>
                  )}
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}