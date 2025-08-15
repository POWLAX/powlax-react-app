'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2, AlertCircle } from 'lucide-react'

export default function DirectLoginPage() {
  const [status, setStatus] = useState('Ready to send magic link')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('patrick@powlax.com') // Pre-filled for testing
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading, logout, login } = useAuth()
  const [allowLogin, setAllowLogin] = useState(false)

  const handleDirectLogin = async () => {
    try {
      setIsSubmitting(true)
      setStatus('Sending magic link to ' + email + '...')
      setErrorMessage(null)
      setSuccessMessage(null)
      
      const success = await login(email)
      
      if (success) {
        setStatus('Magic link sent successfully!')
        setSuccessMessage('Check your email for the magic link to complete login.')
      } else {
        setStatus('Failed to send magic link')
        setErrorMessage('Could not send magic link. Please try again.')
      }
    } catch (err) {
      setStatus('Error occurred')
      setErrorMessage('An error occurred while sending the magic link.')
      console.error('Direct login error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogoutAndRelogin = async () => {
    await logout()
    setAllowLogin(true)
    setStatus('Ready to send magic link')
    setSuccessMessage(null)
    setErrorMessage(null)
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
          <CardTitle className="text-2xl font-bold text-center">Quick Login (Testing)</CardTitle>
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
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start gap-2">
                  <Mail className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-600">{successMessage}</p>
                </div>
              )}
              
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}
              
              <div className="mb-6">
                <div className="text-lg text-blue-600 mb-2 text-center">
                  {status}
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter email address"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <Button 
                onClick={handleDirectLogin}
                className="w-full"
                disabled={loading || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending magic link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link to {email.split('@')[0]}
                  </>
                )}
              </Button>
              
              <div className="text-sm text-gray-600 text-center">
                This page is for testing purposes. It sends a real magic link 
                to the specified email address using Supabase authentication.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}