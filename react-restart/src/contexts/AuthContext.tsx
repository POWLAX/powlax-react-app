'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  username: string
  name: string
  email: string
  roles: string[]
  avatar: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  validateSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const validateSession = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('wp_token')
    
    if (!token) {
      setUser(null)
      return false
    }

    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.valid && data.user) {
          setUser(data.user)
          return true
        }
      }
      
      // Invalid token
      localStorage.removeItem('wp_token')
      setUser(null)
      return false
      
    } catch (err) {
      console.error('Session validation error:', err)
      setUser(null)
      return false
    }
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (data.success && data.token) {
        localStorage.setItem('wp_token', data.token)
        setUser(data.user)
        setError(null)
        return true
      } else {
        setError(data.error || 'Login failed')
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

  const logout = useCallback(async () => {
    const token = localStorage.getItem('wp_token')
    
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        })
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('wp_token')
      setUser(null)
      router.push('/auth/login')
    }
  }, [router])

  // Check session on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)
      await validateSession()
      setLoading(false)
    }
    
    checkAuth()
  }, [validateSession])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      validateSession
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to protect routes
export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading }
}