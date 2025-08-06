'use client'

import React from 'react'

interface RoleSelectionCardProps {
  value: 'player' | 'parent' | 'coach'
  title: string
  description: string
  selected: boolean
  onClick: () => void
}

export function RoleSelectionCard({
  value,
  title,
  description,
  selected,
  onClick
}: RoleSelectionCardProps) {
  return (
    <div
      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="flex items-center">
        <input
          type="radio"
          checked={selected}
          className="mr-3 h-4 w-4"
          readOnly
          tabIndex={-1}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  )
}