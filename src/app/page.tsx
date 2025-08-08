'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/JWTAuthContext'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [fallbackReady, setFallbackReady] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        router.push('/dashboard')
      } else {
        // User is not authenticated, redirect to login
        router.push('/auth/login')
      }
    }
  }, [user, loading, router])

  // If client scripts fail to load chunks, loading may never flip.
  // Provide a graceful fallback CTA after a short delay.
  useEffect(() => {
    const timer = setTimeout(() => setFallbackReady(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {loading ? 'Checking authentication...' : 'Redirecting...'}
        </p>
        {fallbackReady && (
          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-500">If this takes more than a few seconds, continue below.</p>
            <a href="/auth/login" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md">Go to Login</a>
            <div className="text-xs text-gray-400 mt-2">Troubleshooting: hard refresh (Cmd+Shift+R). If chunks 404 in console, restart dev server.</div>
          </div>
        )}
      </div>
    </main>
  )
}