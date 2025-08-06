'use client'

import { useState } from 'react'
import { Grip, X, Clock, Trophy, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface AcademyDrill {
  id: string
  title: string
  category: 'attack' | 'defense' | 'midfield' | 'wall_ball' | 'fundamentals'
  duration_minutes: number
  complexity: 'foundation' | 'building' | 'advanced'
  point_values: {
    lax_credit: number
    attack_tokens?: number
    defense_dollars?: number
    midfield_medals?: number
    rebound_rewards?: number
    lax_iq_points?: number
    flex_points?: number
  }
  vimeo_id?: string
  description?: string
  equipment?: string[]
}

interface WorkoutSlot {
  id: string
  drill: AcademyDrill
  order: number
}

interface WorkoutTimelineProps {
  slots: WorkoutSlot[]
  onRemoveDrill: (slotId: string) => void
  onReorderDrills: (newOrder: WorkoutSlot[]) => void
}

const categoryIcons = {
  attack: '⚔️',
  defense: '🛡️',
  midfield: '🏃',
  wall_ball: '🎾',
  fundamentals: '🎯'
}

const complexityColors = {
  foundation: 'bg-green-100 text-green-800 border-green-200',
  building: 'bg-blue-100 text-blue-800 border-blue-200',
  advanced: 'bg-purple-100 text-purple-800 border-purple-200'
}

export default function WorkoutTimeline({ slots, onRemoveDrill, onReorderDrills }: WorkoutTimelineProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, slotId: string) => {
    setDraggedItem(slotId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverItem(slotId)
  }

  const handleDragLeave = () => {
    setDragOverItem(null)
  }

  const handleDrop = (e: React.DragEvent, targetSlotId: string) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem === targetSlotId) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    const draggedIndex = slots.findIndex(s => s.id === draggedItem)
    const targetIndex = slots.findIndex(s => s.id === targetSlotId)
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    const newSlots = [...slots]
    const [removed] = newSlots.splice(draggedIndex, 1)
    newSlots.splice(targetIndex, 0, removed)
    
    onReorderDrills(newSlots)
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const getCategoryPoints = (drill: AcademyDrill): { icon: string; value: number } => {
    const points = drill.point_values
    if (drill.category === 'attack' && points.attack_tokens) {
      return { icon: '⚔️', value: points.attack_tokens }
    } else if (drill.category === 'defense' && points.defense_dollars) {
      return { icon: '🛡️', value: points.defense_dollars }
    } else if (drill.category === 'midfield' && points.midfield_medals) {
      return { icon: '🏃', value: points.midfield_medals }
    } else if (drill.category === 'wall_ball' && points.rebound_rewards) {
      return { icon: '🎾', value: points.rebound_rewards }
    }
    return { icon: '💰', value: points.lax_credit }
  }

  return (
    <div className="space-y-3">
      {slots.map((slot, index) => {
        const categoryPoints = getCategoryPoints(slot.drill)
        const isDragging = draggedItem === slot.id
        const isDragOver = dragOverItem === slot.id
        
        return (
          <Card
            key={slot.id}
            className={`
              transition-all cursor-move
              ${isDragging ? 'opacity-50' : ''}
              ${isDragOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            `}
            draggable
            onDragStart={(e) => handleDragStart(e, slot.id)}
            onDragOver={(e) => handleDragOver(e, slot.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, slot.id)}
            onDragEnd={handleDragEnd}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div className="pt-1 cursor-move">
                  <Grip className="h-5 w-5 text-gray-400" />
                </div>

                {/* Drill Number */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                </div>

                {/* Drill Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {slot.drill.title}
                        <span className="text-lg">{categoryIcons[slot.drill.category]}</span>
                      </h4>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {slot.drill.duration_minutes} min
                        </span>
                        
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${complexityColors[slot.drill.complexity]}`}
                        >
                          {slot.drill.complexity}
                        </Badge>
                        
                        <span className="text-sm font-semibold flex items-center gap-1">
                          {categoryPoints.icon} {categoryPoints.value} pts
                        </span>
                        
                        <span className="text-sm text-gray-600">
                          💰 {slot.drill.point_values.lax_credit} pts
                        </span>
                      </div>

                      {slot.drill.equipment && slot.drill.equipment.length > 0 && (
                        <div className="text-xs text-gray-500 mt-2">
                          Equipment: {slot.drill.equipment.join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveDrill(slot.id)}
                      className="ml-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}