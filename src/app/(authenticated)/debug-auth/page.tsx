'use client'

import { useEffect, useState } from 'react'
import { useAuth, useRequireAuth } from '@/contexts/SupabaseAuthContext'
import { Button } from '@/components/ui/button'

export default function DebugAuthPage() {
  const { user, loading, error } = useAuth()
  const { user: requiredUser, loading: requiredLoading } = useRequireAuth()
  const [localStorageData, setLocalStorageData] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const authUser = localStorage.getItem('supabase_auth_user')
      const authSession = localStorage.getItem('supabase_auth_session')
      
      setLocalStorageData({
        user: authUser ? JSON.parse(authUser) : null,
        session: authSession ? JSON.parse(authSession) : null
      })
    }
  }, [])

  const clearAuth = () => {
    localStorage.removeItem('supabase_auth_user')
    localStorage.removeItem('supabase_auth_session')
    window.location.reload()
  }

  const setDirectLogin = () => {
    const mockUser = {
      id: '523f2768-6404-439c-a429-f9eb6736aa17',
      email: 'patrick@powlax.com',
      full_name: 'Patrick Chapla',
      display_name: 'powlax_patrick',
      role: 'admin',
      roles: ['admin'],
      wordpress_id: null,
      avatar_url: null
    }
    
    localStorage.setItem('supabase_auth_user', JSON.stringify(mockUser))
    localStorage.setItem('supabase_auth_session', JSON.stringify({
      access_token: 'mock-token',
      user: mockUser
    }))
    
    window.location.reload()
  }

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
      
      <div className="space-y-6">
        {/* useAuth Hook Status */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="font-semibold mb-2">useAuth() Hook</h2>
          <div className="space-y-1 text-sm">
            <p>Loading: <span className={loading ? 'text-yellow-600' : 'text-green-600'}>{loading ? 'Yes' : 'No'}</span></p>
            <p>User Present: <span className={user ? 'text-green-600' : 'text-red-600'}>{user ? 'Yes' : 'No'}</span></p>
            {user && (
              <>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                <p>Roles: {JSON.stringify(user.roles)}</p>
                <p>Is Admin: {user.roles?.includes('administrator') ? '✅' : '❌'}</p>
              </>
            )}
            {error && <p className="text-red-600">Error: {error}</p>}
          </div>
        </div>

        {/* useRequireAuth Hook Status */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="font-semibold mb-2">useRequireAuth() Hook</h2>
          <div className="space-y-1 text-sm">
            <p>Loading: <span className={requiredLoading ? 'text-yellow-600' : 'text-green-600'}>{requiredLoading ? 'Yes' : 'No'}</span></p>
            <p>User Present: <span className={requiredUser ? 'text-green-600' : 'text-red-600'}>{requiredUser ? 'Yes' : 'No'}</span></p>
            <p className="text-gray-600">Note: This hook redirects if no user is found</p>
          </div>
        </div>

        {/* LocalStorage Status */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="font-semibold mb-2">LocalStorage</h2>
          <div className="space-y-1 text-sm">
            <p>Has User: <span className={localStorageData?.user ? 'text-green-600' : 'text-red-600'}>
              {localStorageData?.user ? 'Yes' : 'No'}
            </span></p>
            {localStorageData?.user && (
              <>
                <p>Email: {localStorageData.user.email}</p>
                <p>Role: {localStorageData.user.role}</p>
                <p>Roles: {JSON.stringify(localStorageData.user.roles)}</p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="font-semibold mb-2">Actions</h2>
          <div className="flex gap-2">
            <Button onClick={setDirectLogin} variant="default">
              Set Direct Login (Admin)
            </Button>
            <Button onClick={clearAuth} variant="destructive">
              Clear Auth
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Reload Page
            </Button>
          </div>
        </div>

        {/* Navigation Test */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="font-semibold mb-2">Test Navigation</h2>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => window.location.href = '/dashboard'} variant="outline" size="sm">
              Dashboard
            </Button>
            <Button onClick={() => window.location.href = '/skills-academy'} variant="outline" size="sm">
              Skills Academy
            </Button>
            <Button onClick={() => window.location.href = '/skills-academy/workouts'} variant="outline" size="sm">
              Workouts
            </Button>
            <Button onClick={() => window.location.href = '/teams/1/practice-plans'} variant="outline" size="sm">
              Practice Plans
            </Button>
            <Button onClick={() => window.location.href = '/admin/role-management'} variant="outline" size="sm">
              Admin Page
            </Button>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h2 className="font-semibold mb-2 text-blue-900">Diagnosis</h2>
          <div className="text-sm text-blue-800">
            {loading && <p>⏳ Auth is still loading...</p>}
            {!loading && !user && localStorageData?.user && (
              <p>❌ LocalStorage has user but auth context doesn&apos;t see it. The auth context may not be reading localStorage correctly.</p>
            )}
            {!loading && !user && !localStorageData?.user && (
              <p>❌ No user in localStorage or auth context. You need to log in.</p>
            )}
            {!loading && user && (
              <p>✅ Auth is working! User is loaded in context.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}