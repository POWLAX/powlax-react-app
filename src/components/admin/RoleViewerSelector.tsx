'use client'

import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useRoleViewer } from '@/contexts/RoleViewerContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, User, Users, Heart, Building2, X, Clipboard, UserCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

export function RoleViewerSelector() {
  const { user } = useAuth()
  const { viewingRole, isViewingAs, setViewingRole, clearViewingRole, availableRoles } = useRoleViewer()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Only show for administrators
  const isAdmin = user?.roles?.includes('administrator')
  
  // SECURITY: Only show role switcher for actual administrators
  // Removed development mode bypass for security
  if (!mounted || !isAdmin) {
    return null
  }

  // Icon mapping for each role
  const getRoleIcon = (roleValue: string | null) => {
    switch (roleValue) {
      case null:
        return Crown
      case 'player':
        return User
      case 'team_coach':
        return Clipboard
      case 'parent':
        return Users
      case 'club_director':
        return Building2
      default:
        return Crown
    }
  }

  // Get role color
  const getRoleColor = (roleValue: string | null, isActive: boolean) => {
    if (!isActive) return 'text-gray-400'
    
    switch (roleValue) {
      case null:
        return 'text-blue-600'
      case 'player':
        return 'text-green-600'
      case 'team_coach':
        return 'text-purple-600'
      case 'parent':
        return 'text-pink-600'
      case 'club_director':
        return 'text-orange-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <div className={`fixed top-0 left-1/2 transform -translate-x-1/2 z-[9999] transition-all ${
      isViewingAs 
        ? 'bg-orange-50/95 border-b-2 border-orange-400 dark:bg-orange-950/95 dark:border-orange-600' 
        : 'bg-white/95 border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-700'
    } backdrop-blur-sm shadow-lg`}>
      
      {/* Viewing As Badge */}
      {isViewingAs && (
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700 text-xs">
            Viewing as {availableRoles.find(r => r.value === viewingRole)?.label}
          </Badge>
        </div>
      )}
      
      {/* Role Navigation Icons */}
      <div className="flex items-center justify-center px-4">
        <div className="flex items-center gap-1">
          {availableRoles.map((role) => {
            const IconComponent = getRoleIcon(role.value)
            const isActive = viewingRole === role.value
            const colorClass = getRoleColor(role.value, isActive)
            
            return (
              <Button
                key={role.value || 'administrator'}
                variant="ghost"
                size="sm"
                onClick={() => setViewingRole(role.value)}
                className={`p-2 h-auto min-w-[60px] ${
                  isActive 
                    ? 'bg-gray-100 dark:bg-gray-800' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                title={`Switch to ${role.label} view`}
              >
                <span className={`text-sm ${isActive ? 'font-medium' : ''} ${colorClass}`}>
                  {role.value === 'club_director' ? 'Direct' : role.label.split(' ')[0]}
                </span>
              </Button>
            )
          })}
          
          {/* Quick Exit Button */}
          {isViewingAs && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearViewingRole}
              className="p-2 h-auto min-w-[60px] text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
              title="Exit View As Mode (Ctrl+Shift+R)"
            >
              <span className="text-sm">Exit</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Keyboard shortcut handler
export function RoleViewerKeyboardHandler() {
  const { clearViewingRole, isViewingAs } = useRoleViewer()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+Shift+R to exit view mode
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault()
        if (isViewingAs) {
          clearViewingRole()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isViewingAs, clearViewingRole])

  return null
}