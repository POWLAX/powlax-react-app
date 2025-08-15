'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Available roles for viewing
export type ViewableRole = 'player' | 'team_coach' | 'parent' | 'club_director' | null

interface RoleViewerContextType {
  viewingRole: ViewableRole
  isViewingAs: boolean
  setViewingRole: (role: ViewableRole) => void
  clearViewingRole: () => void
  availableRoles: Array<{ value: ViewableRole; label: string }>
}

const RoleViewerContext = createContext<RoleViewerContextType | undefined>(undefined)

export function RoleViewerProvider({ children }: { children: ReactNode }) {
  const [viewingRole, setViewingRoleState] = useState<ViewableRole>(null)
  const [mounted, setMounted] = useState(false)

  // Available roles for the dropdown
  const availableRoles = [
    { value: null, label: 'Administrator (Actual Role)' },
    { value: 'player' as ViewableRole, label: 'Player' },
    { value: 'team_coach' as ViewableRole, label: 'Coach' },
    { value: 'parent' as ViewableRole, label: 'Parent' },
    { value: 'club_director' as ViewableRole, label: 'Club Director' }
  ]

  // Load viewing role from sessionStorage on mount
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('powlax_viewing_role')
      if (stored && stored !== 'null') {
        setViewingRoleState(stored as ViewableRole)
      }
    }
  }, [])

  // Save viewing role to sessionStorage when it changes
  const setViewingRole = (role: ViewableRole) => {
    setViewingRoleState(role)
    if (typeof window !== 'undefined') {
      if (role === null) {
        sessionStorage.removeItem('powlax_viewing_role')
      } else {
        sessionStorage.setItem('powlax_viewing_role', role)
      }
    }
  }

  const clearViewingRole = () => {
    setViewingRole(null)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <RoleViewerContext.Provider value={{
        viewingRole: null,
        isViewingAs: false,
        setViewingRole: () => {},
        clearViewingRole: () => {},
        availableRoles
      }}>
        {children}
      </RoleViewerContext.Provider>
    )
  }

  return (
    <RoleViewerContext.Provider value={{
      viewingRole,
      isViewingAs: viewingRole !== null,
      setViewingRole,
      clearViewingRole,
      availableRoles
    }}>
      {children}
    </RoleViewerContext.Provider>
  )
}

export function useRoleViewer() {
  const context = useContext(RoleViewerContext)
  if (context === undefined) {
    throw new Error('useRoleViewer must be used within a RoleViewerProvider')
  }
  return context
}