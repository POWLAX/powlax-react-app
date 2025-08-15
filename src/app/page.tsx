'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    // Client-side redirect to practice planner
    router.push('/teams/no-team/practiceplan')
  }, [router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold">POWLAX</h1>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </main>
  )
}