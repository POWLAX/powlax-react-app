'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  toggleSidebar: () => void
  setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('powlax-sidebar-collapsed')
      if (stored) {
        setIsCollapsed(JSON.parse(stored))
      }
    }
  }, [])

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('powlax-sidebar-collapsed', JSON.stringify(isCollapsed))
    }
  }, [isCollapsed])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed)
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
