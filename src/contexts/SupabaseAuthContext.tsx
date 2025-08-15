'use client'

import { createContext, useContext, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

// 🚨 AUTHENTICATION COMPLETELY DISABLED
// This is a mock auth context that always returns a demo user
// No actual authentication is performed

// Check for admin override in URL (for owner access)
const isAdminOverride = () => {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('admin') === 'powlax2025' // Secret admin key
}

// Mock user that's always "logged in" - LIMITED PERMISSIONS FOR SECURITY
const getDemoUser = () => {
  const baseUser = {
    id: 'demo-user-001',
    email: 'demo@powlax.com',
    full_name: 'Demo User',
    memberpress_id: undefined,
    avatar_url: undefined,
  }
  
  if (isAdminOverride()) {
    return {
      ...baseUser,
      role: 'administrator',
      roles: ['administrator', 'club_director', 'team_coach', 'player', 'parent'],
      display_name: 'Demo User (ADMIN OVERRIDE)',
      email: 'admin@powlax.com'
    }
  }
  
  return {
    ...baseUser,
    role: 'player',
    roles: ['player'],
    display_name: 'Demo User (Limited Access)'
  }
}

interface AuthContextType {
  user: ReturnType<typeof getDemoUser>
  loading: false
  error: null
  login: (email: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
  validateSession: () => Promise<boolean>
  supabase: typeof supabase
  showAuthModal: () => void
  hideAuthModal: () => void
  isAuthModalOpen: false
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  // Mock functions that do nothing but return success
  const mockLogin = async (email: string) => {
    console.log(`[MOCK AUTH] Login called with email: ${email}`)
    return true
  }

  const mockLogout = async () => {
    console.log('[MOCK AUTH] Logout called - no action taken')
  }

  const mockCheckAuth = async () => {
    console.log('[MOCK AUTH] Check auth called - always returns true')
    return true
  }

  const mockShowAuthModal = () => {
    console.log('[MOCK AUTH] Show auth modal called - no action taken')
  }

  const mockHideAuthModal = () => {
    console.log('[MOCK AUTH] Hide auth modal called - no action taken')
  }

  const value: AuthContextType = {
    user: getDemoUser(),
    loading: false,
    error: null,
    login: mockLogin,
    logout: mockLogout,
    checkAuth: mockCheckAuth,
    validateSession: mockCheckAuth,
    supabase,
    showAuthModal: mockShowAuthModal,
    hideAuthModal: mockHideAuthModal,
    isAuthModalOpen: false
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within SupabaseAuthProvider')
  }
  return context
}

// Mock hook that always returns "authenticated"
export function useRequireAuth(redirectUrl?: string) {
  return {
    user: getDemoUser(),
    loading: false,
    error: null
  }
}