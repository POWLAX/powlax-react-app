'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">POWLAX</h1>
        <p className="text-xl text-gray-600">Modern Lacrosse Training Platform</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/teams/no-team/practiceplan">
            <Button size="lg" className="w-full sm:w-auto">
              Practice Planner
            </Button>
          </Link>
          <Link href="/skills-academy/workouts">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Skills Academy
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}