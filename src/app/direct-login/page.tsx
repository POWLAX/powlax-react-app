'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { Button } from '@/components/ui/button'

export default function DirectLoginPage() {
  const [status, setStatus] = useState('Setting up direct login...')
  const router = useRouter()
  const { user, loading } = useAuth()

  const handleDirectLogin = async () => {
    try {
      setStatus('Logging in as patrick@powlax.com...')
      
      // Create a mock user session that matches the database user
      // Patrick now has all 5 roles in the database
      const mockUser = {
        id: '523f2768-6404-439c-a429-f9eb6736aa17', // Actual ID from database
        email: 'patrick@powlax.com',
        full_name: 'Patrick Chapla',
        display_name: 'Patrick Chapla (Admin)',
        role: 'administrator', // Primary role
        roles: ['administrator', 'parent', 'club_director', 'team_coach', 'player'], // All 5 roles
        wordpress_id: null,
        avatar_url: null
      }
      
      // Store in localStorage for the auth context to pick up
      localStorage.setItem('supabase_auth_user', JSON.stringify(mockUser))
      localStorage.setItem('supabase_auth_session', JSON.stringify({
        access_token: 'mock-token',
        user: mockUser
      }))
      
      setStatus('Login successful! Redirecting...')
      
      // Force page reload to pick up the new auth state
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
      
    } catch (err) {
      setStatus('Login failed')
      console.error('Direct login error:', err)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      // Already logged in, redirect to dashboard
      router.push('/dashboard')
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Direct Login</h1>
          
          <div className="mb-6">
            <div className="text-lg text-blue-600 mb-2">
              {status}
            </div>
          </div>
          
          <Button 
            onClick={handleDirectLogin}
            className="w-full mb-4"
            disabled={loading}
          >
            Login as patrick@powlax.com
          </Button>
          
          <div className="text-sm text-gray-600">
            This bypasses the magic link system and logs you in directly 
            to test the admin features.
          </div>
        </div>
      </div>
    </div>
  )
}
