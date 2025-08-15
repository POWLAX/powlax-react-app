'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import GlobalSearch from './GlobalSearch'

interface SearchTriggerProps {
  variant?: 'button' | 'input'
  className?: string
  placeholder?: string
}

export default function SearchTrigger({ 
  variant = 'input', 
  className = '',
  placeholder = 'Search...'
}: SearchTriggerProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={() => setIsSearchOpen(true)}
          className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
          title="Search (Cmd+K)"
        >
          <Search className="h-5 w-5" />
        </button>
        <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </>
    )
  }

  return (
    <>
      <div 
        className={`relative cursor-pointer ${className}`}
        onClick={() => setIsSearchOpen(true)}
      >
        <div className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg px-3 py-2">
          <Search className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500 flex-1">{placeholder}</span>
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-500">
            ⌘K
          </kbd>
        </div>
      </div>
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}