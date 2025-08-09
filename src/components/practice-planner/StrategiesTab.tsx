'use client'

import { useState, useMemo, Fragment } from 'react'
import { Filter, Plus, Video, Image, Beaker, ChevronDown, ChevronRight, Search, Play } from 'lucide-react'
import { useStrategies, getStrategiesByGamePhase, searchStrategies } from '@/hooks/useStrategies'
import VideoModal from './modals/VideoModal'
import LacrosseLabModal from './modals/LacrosseLabModal'
import AddCustomStrategiesModal from './modals/AddCustomStrategiesModal'
import StudyStrategyModal from './modals/StudyStrategyModal'

interface Strategy {
  id: string
  strategy_name: string
  strategy_categories?: string
  description?: string
  vimeo_link?: string
  lacrosse_lab_links?: any
  thumbnail_urls?: any
  source: 'powlax' | 'user'
  user_id?: string
}

interface StrategiesTabProps {
  onSelectStrategy: (strategy: Strategy) => void
  selectedStrategies: string[]
  isMobile?: boolean
}

export default function StrategiesTab({ 
  onSelectStrategy, 
  selectedStrategies,
  isMobile = false 
}: StrategiesTabProps) {
  const { strategies, loading, error, refreshStrategies } = useStrategies()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['Face-Off'])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  
  // Modal states for individual strategies
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showLabModal, setShowLabModal] = useState(false)
  const [showStudyStrategyModal, setShowStudyStrategyModal] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)

  const togglePhase = (phase: string) => {
    if (expandedPhases.includes(phase)) {
      setExpandedPhases(expandedPhases.filter(p => p !== phase))
    } else {
      setExpandedPhases([...expandedPhases, phase])
    }
  }

  // Filter and organize strategies
  const filteredStrategies = useMemo(() => {
    const searched = searchStrategies(strategies, searchTerm)
    return getStrategiesByGamePhase(searched)
  }, [strategies, searchTerm])

  const handleStrategySelect = (strategy: Strategy) => {
    onSelectStrategy(strategy)
  }

  const openVideoModal = (strategy: Strategy, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedStrategy(strategy)
    setShowVideoModal(true)
  }

  const openLabModal = (strategy: Strategy, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedStrategy(strategy)
    setShowLabModal(true)
  }

  const hasVideo = (strategy: Strategy) => {
    return !!strategy.vimeo_link
  }

  const hasLabUrls = (strategy: Strategy) => {
    if (!strategy.lacrosse_lab_links) return false
    
    try {
      const links = typeof strategy.lacrosse_lab_links === 'string' 
        ? JSON.parse(strategy.lacrosse_lab_links)
        : strategy.lacrosse_lab_links
      
      if (Array.isArray(links)) {
        return links.some(url => url && url.trim())
      }
      return false
    } catch {
      return false
    }
  }

  const hasThumbnails = (strategy: Strategy) => {
    if (!strategy.thumbnail_urls) return false
    
    try {
      const urls = typeof strategy.thumbnail_urls === 'string'
        ? JSON.parse(strategy.thumbnail_urls)
        : strategy.thumbnail_urls
      
      if (Array.isArray(urls)) {
        return urls.some(url => url && url.trim())
      }
      return false
    } catch {
      return false
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading strategies...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading strategies</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header - matching Drill Library */}
      <div className="px-4 pt-2 pb-4 border-b">
        <h3 className="text-lg font-semibold mb-4">Strategies Library</h3>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            <Filter className="h-4 w-4" />
            Filter Strategies
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            <Plus className="h-4 w-4" />
            Add Custom Strategy
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search strategies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Strategies List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredStrategies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No strategies found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredStrategies.map(({ phase, strategies }) => (
              <div key={phase} className="border rounded-lg">
                <button
                  onClick={() => togglePhase(phase)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg"
                >
                  <div className="flex items-center gap-2">
                    {expandedPhases.includes(phase) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">{phase}</span>
                    <span className="text-sm text-gray-500">({strategies.length})</span>
                  </div>
                </button>
                
                {expandedPhases.includes(phase) && (
                  <div className="p-2 space-y-2">
                    {strategies.map((strategy) => (
                      <div
                        key={strategy.id}
                        className="p-3 bg-white border rounded-md hover:bg-gray-50"
                      >
                        <div className="flex flex-col gap-2">
                          {/* Title row with Plus/checkbox on left */}
                          <div className="flex items-center gap-2">
                            {isMobile ? (
                              <input
                                type="checkbox"
                                checked={selectedStrategies.includes(strategy.id)}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  handleStrategySelect(strategy)
                                }}
                                className="flex-shrink-0"
                              />
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStrategySelect(strategy)
                                }}
                                className="p-1 border border-gray-300 hover:bg-gray-50 rounded flex-shrink-0"
                                title="Add to Practice"
                              >
                                <Plus className="h-4 w-4 text-gray-600" />
                              </button>
                            )}
                            <h4 className="font-medium text-sm flex-1">{strategy.strategy_name}</h4>
                          </div>
                          
                          {/* Source Badge and Study button */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {strategy.source === 'user' && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                  Custom
                                </span>
                              )}
                            </div>
                            
                            {/* Study button replacing all icons */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedStrategy(strategy)
                                setShowStudyStrategyModal(true)
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-900 text-white text-xs rounded border border-gray-700 hover:bg-gray-800 transition-colors"
                            >
                              <Play className="h-3 w-3" fill="white" />
                              Study
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCustomStrategiesModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onStrategyCreated={refreshStrategies}
      />

      {selectedStrategy && (
        <>
          <VideoModal
            isOpen={showVideoModal}
            onClose={() => setShowVideoModal(false)}
            drill={{
              name: selectedStrategy.strategy_name,
              videoUrl: selectedStrategy.vimeo_link
            }}
          />
          
          <LacrosseLabModal
            isOpen={showLabModal}
            onClose={() => setShowLabModal(false)}
            drill={{
              name: selectedStrategy.strategy_name,
              lab_urls: selectedStrategy.lacrosse_lab_links
            }}
          />
          
          <StudyStrategyModal
            isOpen={showStudyStrategyModal}
            onClose={() => setShowStudyStrategyModal(false)}
            strategy={selectedStrategy}
          />
        </>
      )}
    </>
  )
}