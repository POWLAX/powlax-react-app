'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { jwtAuth, UserData } from '@/lib/jwt-auth'

interface AuthContextType {
  user: UserData | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function JWTAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Check if we have a stored token
      const token = jwtAuth.getToken()
      
      if (!token) {
        setUser(null)
        return false
      }

      // Validate the token with WordPress
      const isValid = await jwtAuth.validateToken()
      
      if (isValid) {
        const userData = jwtAuth.getUser()
        setUser(userData)
        return true
      } else {
        setUser(null)
        return false
      }
    } catch (err) {
      console.error('Auth check error:', err)
      setUser(null)
      return false
    }
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await jwtAuth.login(username, password)
      
      if (result.success && result.user) {
        setUser(result.user)
        setError(null)
        return true
      } else {
        setError(result.error || 'Login failed')
        return false
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Connection error. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    jwtAuth.logout()
    setUser(null)
    router.push('/auth/login')
  }, [router])

  // Check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      await checkAuth()
      setLoading(false)
    }
    
    initAuth()
  }, [checkAuth])

  // Set up token refresh
  useEffect(() => {
    if (user) {
      jwtAuth.setupTokenRefresh()
    }
  }, [user])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a JWTAuthProvider')
  }
  return context
}

// Hook to protect routes
export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, loading, checkAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // Double-check auth before redirecting
      checkAuth().then(isAuthenticated => {
        if (!isAuthenticated) {
          router.push(redirectTo)
        }
      })
    }
  }, [user, loading, router, redirectTo, checkAuth])

  return { user, loading }
}