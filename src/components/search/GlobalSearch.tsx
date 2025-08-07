'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, FileText, Target, Dumbbell, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface SearchResult {
  id: string
  title: string
  description?: string
  category: 'drill' | 'strategy' | 'workout' | 'concept'
  url: string
  metadata?: {
    duration?: number
    difficulty?: string
    equipment?: string[]
    ageGroup?: string
  }
}

const mockSearchData: SearchResult[] = [
  {
    id: 'drill-1',
    title: 'Ground Ball Pickup',
    description: 'Basic ground ball technique for all players',
    category: 'drill',
    url: '/drills/ground-ball-pickup',
    metadata: {
      duration: 10,
      difficulty: 'Beginner',
      equipment: ['Lacrosse balls', 'Sticks'],
      ageGroup: '8-18'
    }
  },
  {
    id: 'strategy-1',
    title: '6v6 Settled Offense',
    description: 'Basic offensive strategies for settled situations',
    category: 'strategy',
    url: '/strategies/6v6-offense',
    metadata: {
      duration: 20,
      difficulty: 'Intermediate',
      ageGroup: '12-18'
    }
  },
  {
    id: 'workout-1',
    title: 'Stick Skills Daily Practice',
    description: 'Essential stick handling exercises for home practice',
    category: 'workout',
    url: '/skills-academy/workouts/stick-skills',
    metadata: {
      duration: 30,
      difficulty: 'All Levels',
      ageGroup: '8-18'
    }
  }
]

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const searchData = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const filteredResults = mockSearchData.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    setResults(filteredResults)
    setLoading(false)
    setSelectedIndex(-1)
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchData(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, searchData])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : -1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev > -1 ? prev - 1 : results.length - 1))
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault()
        const selectedResult = results[selectedIndex]
        if (selectedResult) {
          window.location.href = selectedResult.url
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, results, selectedIndex])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'drill':
        return <Target className="h-4 w-4" />
      case 'strategy':
        return <FileText className="h-4 w-4" />
      case 'workout':
        return <Dumbbell className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'drill':
        return 'text-blue-600 bg-blue-100'
      case 'strategy':
        return 'text-green-600 bg-green-100'
      case 'workout':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mt-16"
      >
        {/* Search Header */}
        <div className="flex items-center p-4 border-b">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search drills, strategies, workouts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-lg outline-none placeholder-gray-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result, index) => (
                <Link
                  key={result.id}
                  href={result.url}
                  onClick={onClose}
                  className={`block p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(result.category)}`}>
                      {getCategoryIcon(result.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {result.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(result.category)}`}>
                          {result.category}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {result.description}
                        </p>
                      )}
                      {result.metadata && (
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {result.metadata.duration && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{result.metadata.duration} min</span>
                            </div>
                          )}
                          {result.metadata.difficulty && (
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {result.metadata.difficulty}
                            </span>
                          )}
                          {result.metadata.ageGroup && (
                            <span>Ages {result.metadata.ageGroup}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">
                Try searching for drills, strategies, or workouts with different keywords.
              </p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Search POWLAX</h3>
              <p className="text-gray-500">
                Find drills, strategies, workouts, and more across the platform.
              </p>
              <div className="mt-4 space-y-2 text-sm text-gray-400">
                <p>Try searching for:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="bg-gray-100 px-2 py-1 rounded">ground balls</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">shooting</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">dodging</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">defense</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Footer */}
        <div className="p-3 border-t bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">Enter</kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
            <div>
              {results.length > 0 && `${results.length} result${results.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}