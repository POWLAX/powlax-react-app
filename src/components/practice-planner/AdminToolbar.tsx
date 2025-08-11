'use client'

import { Edit3, Settings } from 'lucide-react'
import { canEditDrillsAndStrategies } from '@/lib/adminPermissions'
// UserData type no longer needed with Supabase Auth
import { Button } from '@/components/ui/button'

interface AdminToolbarProps {
  user: any | null // Supabase user type
  itemType: 'drill' | 'strategy'
  item: {
    id: string
    source?: string
    name?: string
    strategy_name?: string
  }
  onEdit: () => void
  className?: string
}

/**
 * AdminToolbar - Shows edit buttons only to admin users
 * Appears as small, unobtrusive controls on drill/strategy cards
 */
export default function AdminToolbar({ 
  user, 
  itemType, 
  item, 
  onEdit, 
  className = '' 
}: AdminToolbarProps) {
  
  // Only show toolbar to admin users
  const isAdmin = canEditDrillsAndStrategies(user)
  if (!isAdmin) return null

  // Only show for POWLAX-sourced items (not user-created items)
  if (item.source === 'user') return null

  const itemName = itemType === 'drill' ? item.name : item.strategy_name

  return (
    <div className={`admin-toolbar flex items-center gap-1 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-opacity"
        title={`Edit ${itemType}: ${itemName}`}
      >
        <Edit3 className="h-3 w-3" />
      </Button>
      
      {/* Visual indicator that this is an admin control */}
      <div className="h-1 w-1 bg-orange-400 rounded-full opacity-50" title="Admin Control" />
    </div>
  )
}

/**
 * AdminToolbarInline - Inline version for card headers
 */
export function AdminToolbarInline({ 
  user, 
  itemType, 
  item, 
  onEdit 
}: Omit<AdminToolbarProps, 'className'>) {
  
  const isAdmin = canEditDrillsAndStrategies(user)
  if (!isAdmin || item.source === 'user') return null

  return (
    <button
      onClick={onEdit}
      className="opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity ml-2 p-1 hover:bg-gray-100 rounded"
      title={`Edit ${itemType}`}
    >
      <Settings className="h-3 w-3 text-gray-500" />
    </button>
  )
}

/**
 * AdminToolbarFloating - Floating version for overlays
 */
export function AdminToolbarFloating({ 
  user, 
  itemType, 
  item, 
  onEdit 
}: Omit<AdminToolbarProps, 'className'>) {
  
  const isAdmin = canEditDrillsAndStrategies(user)
  if (!isAdmin || item.source === 'user') return null

  return (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="secondary"
        size="sm"
        onClick={onEdit}
        className="h-7 w-7 p-0 bg-white/90 hover:bg-white border shadow-sm"
        title={`Edit ${itemType}`}
      >
        <Edit3 className="h-3 w-3" />
      </Button>
    </div>
  )
}