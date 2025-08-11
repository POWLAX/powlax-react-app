'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useModalAuth } from '@/hooks/useModalAuth'
import AuthModal from '@/components/auth/AuthModal'

// User interface for Supabase Auth
interface User {
  id: string
  email: string
  full_name?: string
  wordpress_id?: number
  role: string
  roles: string[]
  avatar_url?: string
  display_name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
  validateSession: () => Promise<boolean>
  supabase: typeof supabase
  // Modal auth methods
  showAuthModal: (returnUrl?: string) => void
  hideAuthModal: () => void
  isAuthModalOpen: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  
  // Modal auth integration
  const modalAuth = useModalAuth()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Map database roles to expected role names
  const mapRoles = (roles: string[]): string[] => {
    const roleMap: Record<string, string> = {
      'admin': 'administrator',
      'director': 'club_director',
      'coach': 'team_coach',
      'player': 'player',
      'parent': 'parent'
    }
    
    return roles.map(role => roleMap[role] || role)
  }

  // Convert Supabase user to our User interface
  const convertSupabaseUser = async (authUser: any): Promise<User | null> => {
    try {
      // Get user data from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (userError || !userData) {
        // Try to find by email if auth_user_id not linked yet
        const { data: emailUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', authUser.email)
          .single()

        if (emailUser) {
          // Link the auth user ID
          await supabase
            .from('users')
            .update({ auth_user_id: authUser.id })
            .eq('id', emailUser.id)
          
          // Map roles to expected format
          const mappedRoles = mapRoles(emailUser.roles || ['player'])
          const mappedRole = emailUser.role === 'director' ? 'club_director' : 
                            emailUser.role === 'admin' ? 'administrator' : 
                            emailUser.role || 'player'
          
          return {
            id: emailUser.id,
            email: emailUser.email,
            full_name: emailUser.full_name || emailUser.display_name,
            wordpress_id: emailUser.wordpress_id,
            role: mappedRole,
            roles: mappedRoles,
            avatar_url: emailUser.avatar_url,
            display_name: emailUser.display_name || emailUser.full_name || emailUser.email
          }
        }
        return null
      }

      // Map roles to expected format
      const mappedRoles = mapRoles(userData.roles || ['player'])
      const mappedRole = userData.role === 'director' ? 'club_director' : 
                        userData.role === 'admin' ? 'administrator' : 
                        userData.role || 'player'

      return {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name || userData.display_name,
        wordpress_id: userData.wordpress_id,
        role: mappedRole,
        roles: mappedRoles,
        avatar_url: userData.avatar_url,
        display_name: userData.display_name || userData.full_name || userData.email
      }
    } catch (err) {
      console.error('Error converting Supabase user:', err)
      return null
    }
  }

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Only run after component is mounted to prevent hydration issues
      if (!mounted) {
        console.log('[Auth] Not mounted yet, returning false')
        return false
      }
      
      // First check for direct login session in localStorage (client-side only)
      if (typeof window !== 'undefined') {
        const directLoginUser = localStorage.getItem('supabase_auth_user')
        console.log('[Auth] Checking localStorage:', directLoginUser ? 'Found user' : 'No user')
        
        if (directLoginUser) {
          const user = JSON.parse(directLoginUser)
          console.log('[Auth] LocalStorage user:', user.email, 'roles:', user.roles)
          
          // Apply role mapping to localStorage user
          const mappedRoles = mapRoles(user.roles || ['player'])
          const mappedRole = user.role === 'director' ? 'club_director' : 
                            user.role === 'admin' ? 'administrator' : 
                            user.role || 'player'
          
          const mappedUser = {
            ...user,
            role: mappedRole,
            roles: mappedRoles
          }
          console.log('[Auth] Mapped user roles:', mappedRoles)
          setUser(mappedUser)
          return true
        }
      }

      // Then check Supabase Auth session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session?.user) {
        setUser(null)
        return false
      }

      const convertedUser = await convertSupabaseUser(session.user)
      if (convertedUser) {
        setUser(convertedUser)
        return true
      }
      
      setUser(null)
      return false
    } catch (err) {
      console.error('Auth check error:', err)
      setError(err instanceof Error ? err.message : 'Authentication error')
      setUser(null)
      return false
    }
  }, [mounted])

  // Alias for backward compatibility
  const validateSession = checkAuth

  const login = useCallback(async (email: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      // Send magic link
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const result = await response.json()
      
      if (result.success) {
        setError(null)
        return true
      } else {
        setError(result.error || 'Failed to send magic link')
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
    try {
      // Clear direct login session (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase_auth_user')
        localStorage.removeItem('supabase_auth_session')
      }
      
      // Clear Supabase session
      await supabase.auth.signOut()
      setUser(null)
      setError(null)
      router.push('/auth/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }, [router])

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const convertedUser = await convertSupabaseUser(session.user)
          setUser(convertedUser)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        setLoading(false)
      }
    )

    // Initial auth check - only set loading to false after actual check
    if (mounted) {
      checkAuth().then((hasUser) => {
        console.log('[Auth] Initial check complete, has user:', hasUser)
        setLoading(false)
      })
    }

    return () => subscription?.unsubscribe()
  }, [checkAuth, mounted])

  // Listen for auth modal requests
  useEffect(() => {
    const handleAuthRequest = (event: CustomEvent) => {
      modalAuth.showAuthModal(event.detail?.returnUrl)
    }

    window.addEventListener('request-auth', handleAuthRequest as EventListener)
    
    return () => {
      window.removeEventListener('request-auth', handleAuthRequest as EventListener)
    }
  }, [modalAuth])

  // Cross-domain authentication detection
  useEffect(() => {
    if (!mounted || loading) return
    
    // Check if user is coming from powlax.com or has auto_auth parameter
    const checkCrossDomainAuth = () => {
      // Skip if user is already authenticated
      if (user) return
      
      const referrer = document.referrer
      const urlParams = new URLSearchParams(window.location.search)
      const autoAuth = urlParams.get('auto_auth')
      const fromPowlax = urlParams.get('from_powlax')
      
      // Check if coming from powlax.com domain
      const isFromPowlax = referrer.includes('powlax.com') || 
                          referrer.includes('powlax.') ||
                          fromPowlax === 'true' ||
                          autoAuth === 'true'
      
      if (isFromPowlax) {
        console.log('[Auth] Detected cross-domain visit from POWLAX')
        console.log('[Auth] Referrer:', referrer)
        console.log('[Auth] Auto-auth params:', { autoAuth, fromPowlax })
        
        // Show auth modal automatically with current path as return URL
        const returnUrl = window.location.pathname + window.location.search
        modalAuth.showAuthModal(returnUrl)
        
        // Remove the URL parameters to clean up the URL
        if (autoAuth || fromPowlax) {
          urlParams.delete('auto_auth')
          urlParams.delete('from_powlax')
          const newUrl = window.location.pathname + 
                        (urlParams.toString() ? '?' + urlParams.toString() : '')
          window.history.replaceState({}, '', newUrl)
        }
      }
    }
    
    // Small delay to ensure everything is mounted
    setTimeout(checkCrossDomainAuth, 100)
  }, [mounted, loading, user, modalAuth])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      checkAuth,
      validateSession,
      supabase,
      // Modal auth methods
      showAuthModal: modalAuth.showAuthModal,
      hideAuthModal: modalAuth.hideAuthModal,
      isAuthModalOpen: modalAuth.isAuthModalOpen
    }}>
      {children}
      
      {/* Auth Modal */}
      <AuthModal
        open={modalAuth.isAuthModalOpen}
        onClose={modalAuth.hideAuthModal}
        returnUrl={modalAuth.authReturnUrl}
      />
    </AuthContext.Provider>
  )
}

// Maintain backward compatibility
export const AuthProvider = SupabaseAuthProvider

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider')
  }
  return context
}

export function useRequireAuth() {
  const { user, loading, showAuthModal } = useAuth()
  const [modalShown, setModalShown] = useState(false)
  const [initialCheck, setInitialCheck] = useState(true)
  
  useEffect(() => {
    // Give auth context time to initialize on first mount
    if (initialCheck) {
      const timer = setTimeout(() => {
        setInitialCheck(false)
      }, 100) // Small delay to allow localStorage check
      return () => clearTimeout(timer)
    }
  }, [initialCheck])
  
  useEffect(() => {
    console.log('[useRequireAuth] State:', { loading, hasUser: !!user, modalShown, initialCheck })
    
    // Don't show modal during initial check or while loading
    if (initialCheck || loading) {
      return
    }
    
    // Show auth modal instead of redirecting
    if (!user && !modalShown && typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      const isAuthPage = currentPath.includes('/auth/') || currentPath.includes('/login') || currentPath.includes('/direct-login') || currentPath.includes('/debug-auth')
      
      console.log('[useRequireAuth] No user found, checking path:', currentPath, 'isAuthPage:', isAuthPage)
      
      if (!isAuthPage) {
        console.log('[useRequireAuth] Showing auth modal - no user found')
        setModalShown(true)
        showAuthModal(currentPath)
      }
    }
    
    // Reset modal shown flag when user is authenticated
    if (user && modalShown) {
      setModalShown(false)
    }
  }, [user, loading, modalShown, initialCheck, showAuthModal])
  
  return { user, loading: loading || initialCheck }
}
