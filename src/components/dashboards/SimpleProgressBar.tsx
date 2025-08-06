'use client'

interface SimpleProgressBarProps {
  current: number
  goal: number
  label?: string
}

export function SimpleProgressBar({ current, goal, label }: SimpleProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100)
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">{label}</span>
          <span className="text-sm font-medium text-gray-900">
            {current} / {goal}
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}