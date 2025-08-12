'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DirectLoginPage() {
  const [status, setStatus] = useState('Ready to login')
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [allowLogin, setAllowLogin] = useState(false)

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

  const handleLogoutAndRelogin = async () => {
    await logout()
    setAllowLogin(true)
    setStatus('Ready to login')
  }

  useEffect(() => {
    if (!loading && user && !allowLogin) {
      // Don't auto-redirect if user is already logged in, show the logged-in UI instead
    }
  }, [user, loading, router, allowLogin])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Direct Login</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Show logged-in status if user is already authenticated */}
          {user && !allowLogin ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-900 font-medium">
                  Logged in as: {user.display_name?.split(' ')[0] || user.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                </p>
                <button
                  onClick={handleLogoutAndRelogin}
                  className="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
                >
                  Not you? Click here to sign in with a different account
                </button>
              </div>
              
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Continue to Dashboard
              </Button>
              
              <div className="text-xs text-gray-500 text-center">
                You&apos;re already logged in. Click above to continue or switch accounts.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-6">
                <div className="text-lg text-blue-600 mb-2 text-center">
                  {status}
                </div>
              </div>
              
              <Button 
                onClick={handleDirectLogin}
                className="w-full"
                disabled={loading}
              >
                Login as patrick@powlax.com
              </Button>
              
              <div className="text-sm text-gray-600 text-center">
                This bypasses the magic link system and logs you in directly 
                to test the admin features.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
