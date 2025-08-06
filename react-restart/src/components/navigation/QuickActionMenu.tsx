'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface QuickAction {
  id: string
  label: string
  href?: string
  onClick?: () => void
  icon?: any
  description?: string
}

interface QuickActionMenuProps {
  actions: QuickAction[]
  className?: string
}

export default function QuickActionMenu({ actions, className = '' }: QuickActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  
  // Don't render if no actions
  if (!actions || actions.length === 0) return null
  
  return (
    <div 
      ref={menuRef}
      className={`fixed bottom-20 right-4 z-50 md:bottom-8 ${className}`}
    >
      {/* Action items */}
      {isOpen && (
        <div className="mb-3 space-y-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          {actions.map((action) => {
            const Icon = action.icon
            const Component = action.href ? Link : 'button'
            
            return (
              <Component
                key={action.id}
                href={action.href || '#'}
                onClick={() => {
                  if (action.onClick) action.onClick()
                  setIsOpen(false)
                }}
                className="
                  flex items-center gap-3 w-full min-w-[200px]
                  px-4 py-3 bg-white rounded-lg shadow-lg border border-gray-200
                  hover:bg-gray-50 transition-colors text-left
                  animate-in slide-in-from-right fade-in duration-200
                "
                style={{ animationDelay: `${actions.indexOf(action) * 50}ms` }}
              >
                {Icon && (
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5 text-gray-600" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {action.label}
                  </p>
                  {action.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {action.description}
                    </p>
                  )}
                </div>
              </Component>
            )
          })}
        </div>
      )}
      
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-lg
          bg-blue-600 hover:bg-blue-700 text-white
          transition-all duration-200
          ${isOpen ? 'rotate-45' : ''}
        `}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  )
}