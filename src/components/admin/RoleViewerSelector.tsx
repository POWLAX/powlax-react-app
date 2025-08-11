'use client'

import { useAuth } from '@/contexts/SupabaseAuthContext'
import { useRoleViewer } from '@/contexts/RoleViewerContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, X, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'

export function RoleViewerSelector() {
  const { user } = useAuth()
  const { viewingRole, isViewingAs, setViewingRole, clearViewingRole, availableRoles } = useRoleViewer()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Only show for administrators
  const isAdmin = user?.roles?.includes('administrator') || user?.roles?.includes('admin')
  
  if (!mounted || !isAdmin) {
    return null
  }

  const currentRoleLabel = availableRoles.find(r => r.value === viewingRole)?.label || 'Admin (Actual Role)'

  return (
    <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-2 p-3 rounded-lg shadow-lg backdrop-blur-sm transition-all ${
      isViewingAs 
        ? 'bg-orange-50/95 border-2 border-orange-400 dark:bg-orange-950/95 dark:border-orange-600' 
        : 'bg-white/95 border border-gray-200 dark:bg-gray-900/95 dark:border-gray-700'
    }`}>
      {/* Admin Shield Icon */}
      <Shield className={`w-5 h-5 ${isViewingAs ? 'text-orange-600' : 'text-blue-600'}`} />
      
      {/* View As Label */}
      <div className="flex items-center gap-2">
        {isViewingAs && (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700">
            <Eye className="w-3 h-3 mr-1" />
            Viewing as
          </Badge>
        )}
        
        {/* Role Selector */}
        <Select value={viewingRole || 'null'} onValueChange={(value) => setViewingRole(value === 'null' ? null : value as any)}>
          <SelectTrigger className={`w-[180px] ${isViewingAs ? 'border-orange-400' : ''}`}>
            <SelectValue>{currentRoleLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((role) => (
              <SelectItem key={role.value || 'admin'} value={role.value || 'null'}>
                <div className="flex items-center gap-2">
                  {role.value === null && <Shield className="w-4 h-4 text-blue-600" />}
                  <span>{role.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Quick Exit Button */}
        {isViewingAs && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearViewingRole}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900"
            title="Exit View As Mode (Ctrl+Shift+R)"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
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