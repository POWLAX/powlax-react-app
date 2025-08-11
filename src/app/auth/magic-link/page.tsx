'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/SupabaseAuthContext'

export default function MagicLinkPage() {
  const [status, setStatus] = useState('Processing...')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { checkAuth } = useAuth()

  useEffect(() => {
    const handleMagicLink = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')
      
      if (error) {
        setStatus('Login failed')
        setError(`Authentication error: ${error}`)
        return
      }
      
      if (!token) {
        setStatus('Invalid magic link')
        setError('No token provided')
        return
      }

      // Check if we're already authenticated after the server processed the magic link
      try {
        setStatus('Checking authentication...')
        await checkAuth()
        
        // If we get here without error, auth was successful
        setStatus('Login successful! Redirecting...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } catch (err) {
        setStatus('Login failed')
        setError('Authentication verification failed')
        console.error('Auth check error:', err)
      }
    }

    handleMagicLink()
  }, [searchParams, router, checkAuth])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Magic Link Login</h1>
          
          <div className="mb-4">
            <div className={`text-lg ${error ? 'text-red-600' : 'text-blue-600'}`}>
              {status}
            </div>
            
            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}
          </div>
          
          {!error && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {error && (
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
