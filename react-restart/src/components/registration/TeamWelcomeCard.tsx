'use client'

import React from 'react'

interface TeamWelcomeCardProps {
  teamName: string
  coachName?: string
  ageGroup?: string
  level?: string
  organizationName?: string
}

export function TeamWelcomeCard({
  teamName,
  coachName,
  ageGroup,
  level,
  organizationName
}: TeamWelcomeCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Join {teamName}!
      </h1>
      
      <p className="text-gray-600 mb-4">
        You've been invited to join our lacrosse team.
      </p>

      <div className="space-y-2">
        {organizationName && (
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-20">Club:</span>
            <span className="text-gray-900 font-medium">{organizationName}</span>
          </div>
        )}
        
        {coachName && (
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-20">Coach:</span>
            <span className="text-gray-900 font-medium">{coachName}</span>
          </div>
        )}
        
        {level && (
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-20">Level:</span>
            <span className="text-gray-900 font-medium capitalize">{level}</span>
          </div>
        )}
        
        {ageGroup && (
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-20">Age Group:</span>
            <span className="text-gray-900 font-medium">{ageGroup}</span>
          </div>
        )}
      </div>
    </div>
  )
}