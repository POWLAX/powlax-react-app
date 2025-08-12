'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, PlayCircle } from 'lucide-react'
import Link from 'next/link'

export default function WorkoutPage() {
  const params = useParams()
  const workoutId = params?.id ? parseInt(params.id as string) : 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/skills-academy/workouts" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Skills Academy Workout</h1>
            <p className="text-sm text-gray-600">Workout #{workoutId}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-blue-600" />
              Workout Loading...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 mb-4">Setting up your workout experience...</p>
              <p className="text-sm text-gray-500">
                We're working on fixing the Skills Academy workout page. 
                Please check back soon for the enhanced experience with point tracking, 
                real-time updates, and vibrant animations!
              </p>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Quick Access:</h3>
              <div className="space-y-2">
                <Link href="/skills-academy/workouts">
                  <Button variant="outline" className="w-full justify-start">
                    ← Back to Workout Browser
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    ← Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}