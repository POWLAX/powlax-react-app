'use client'

import { useParams } from 'next/navigation'

export default function WorkoutTestPage() {
  const params = useParams()
  const workoutId = params?.id

  return (
    <div className="p-4">
      <h1>Workout Test Page</h1>
      <p>Workout ID: {workoutId}</p>
      <p>This is a test to see if the basic page structure works.</p>
    </div>
  )
}
