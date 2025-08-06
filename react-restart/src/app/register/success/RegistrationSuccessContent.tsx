'use client'

import { useSearchParams } from 'next/navigation'
import { SuccessStepsCard } from '@/components/registration/SuccessStepsCard'

export function RegistrationSuccessContent() {
  const searchParams = useSearchParams()
  const teamName = searchParams.get('team') || 'the team'
  const role = searchParams.get('role') as 'player' | 'parent' | 'coach' | null

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Registration Complete
          </h1>
          <p className="text-gray-600">
            Your registration has been completed successfully.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <SuccessStepsCard 
          role={role} 
          teamName={teamName}
        />
      </div>
    </div>
  )
}