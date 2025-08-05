'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function DebugAuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [supabaseSession, setSupabaseSession] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      setSupabaseSession(session)

      // Check debug endpoint
      const response = await fetch('/api/debug/auth')
      const data = await response.json()
      setAuthStatus(data)
    } catch (err) {
      console.error('Auth check error:', err)
    }
  }

  const loginWithSupabase = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Successfully logged in with Supabase!')
        await checkAuth()
      }
    } catch (err) {
      setError('Login error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const createTestAdmin = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // This will only work if you have service role key
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@powlax.local',
        password: 'testadmin123',
        options: {
          data: {
            roles: ['admin']
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Test admin created! Email: admin@powlax.local, Password: testadmin123')
      }
    } catch (err) {
      setError('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    await checkAuth()
    setSuccess('Logged out successfully')
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Debug Authentication</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Auth Status</CardTitle>
            <CardDescription>Authentication state from various sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Supabase Client Session:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(supabaseSession, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold">Server-side Auth Status:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(authStatus, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold">WordPress JWT Token:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {typeof window !== 'undefined' ? localStorage.getItem('wp_jwt_token') || 'No token' : 'Loading...'}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase Login</CardTitle>
            <CardDescription>Login with Supabase to access sync features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={loginWithSupabase} disabled={loading}>
                  Login with Supabase
                </Button>
                <Button onClick={createTestAdmin} disabled={loading} variant="outline">
                  Create Test Admin
                </Button>
                <Button onClick={logout} variant="destructive">
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>If you don't have a Supabase user, click "Create Test Admin"</li>
              <li>Login with the test admin credentials</li>
              <li>Once logged in, try accessing <a href="/admin/sync" className="text-blue-600 underline">/admin/sync</a></li>
              <li>The sync page should now work with proper authentication</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}