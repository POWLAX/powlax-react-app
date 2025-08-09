'use client'

import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Strategy {
  id: string
  strategy_name: string
  strategy_categories?: string
  description?: string
  complexity?: string
}

interface ActiveStrategiesSectionProps {
  strategies: Strategy[]
  onRemoveStrategy: (id: string) => void
  onAddStrategy: () => void
}

export default function ActiveStrategiesSection({
  strategies,
  onRemoveStrategy,
  onAddStrategy
}: ActiveStrategiesSectionProps) {
  // Color scheme for strategy badges - cycling through different colors
  const getBadgeColor = (index: number): string => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-orange-500 text-white',
      'bg-teal-500 text-white',
      'bg-pink-500 text-white'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
      {/* Header with blue dot indicator */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-900">
          Active Strategies for This Practice
        </h2>
      </div>

      {/* Strategies Grid - Responsive */}
      {strategies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {strategies.map((strategy, index) => (
            <div
              key={strategy.id}
              className={`group relative px-3 py-2 rounded-lg ${getBadgeColor(index)} transition-all duration-200 hover:shadow-md`}
            >
              {/* Strategy Content */}
              <div className="pr-6">
                <div className="font-bold text-sm leading-tight">
                  {strategy.strategy_name}
                </div>
                {strategy.strategy_categories && (
                  <div className="text-xs opacity-90 mt-1">
                    {strategy.strategy_categories}
                  </div>
                )}
              </div>

              {/* Remove Button - Shows on hover */}
              <button
                onClick={() => onRemoveStrategy(strategy.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-30"
                aria-label={`Remove ${strategy.strategy_name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-sm">No strategies added yet</div>
          <div className="text-xs mt-1">Click &quot;Add Strategy&quot; to get started</div>
        </div>
      )}

      {/* Add Strategy Button */}
      <Button
        onClick={onAddStrategy}
        variant="outline"
        className="w-full md:w-auto border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 min-h-[44px]"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Strategy
      </Button>

      {/* Strategy Count Info */}
      {strategies.length > 0 && (
        <div className="mt-3 text-sm text-gray-600">
          {strategies.length} {strategies.length === 1 ? 'strategy' : 'strategies'} selected
        </div>
      )}
    </div>
  )
}