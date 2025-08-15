import { memo } from 'react'

interface PracticeDurationBarProps {
  totalDuration: number
  usedDuration: number
}

const PracticeDurationBar = memo(function PracticeDurationBar({ totalDuration, usedDuration }: PracticeDurationBarProps) {
  const percentage = Math.min((usedDuration / totalDuration) * 100, 100)
  const isOverTime = usedDuration > totalDuration
  
  const getBarColor = () => {
    if (isOverTime) return 'bg-red-500'
    if (percentage > 80) return 'bg-green-500'
    if (percentage > 50) return 'bg-green-500'
    return 'bg-blue-500'
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Practice Duration</span>
        <span className={isOverTime ? 'text-red-600 font-semibold' : ''}>
          {formatTime(usedDuration)} / {formatTime(totalDuration)}
          {isOverTime && ` (+${formatTime(usedDuration - totalDuration)})`}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isOverTime && (
        <p className="text-sm text-red-600 mt-1">
          Practice is over time by {formatTime(usedDuration - totalDuration)}
        </p>
      )}
    </div>
  )
})

export default PracticeDurationBar