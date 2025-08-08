'use client'

import { useState, useMemo } from 'react'
import { Filter, Plus, Video, Image, Beaker, ChevronDown, ChevronRight, Search } from 'lucide-react'
import { useStrategies, getStrategiesByGamePhase, searchStrategies } from '@/hooks/useStrategies'
import VideoModal from './modals/VideoModal'
import LacrosseLabModal from './modals/LacrosseLabModal'
import AddCustomStrategiesModal from './modals/AddCustomStrategiesModal'

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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
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
                        className="p-3 bg-white border rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleStrategySelect(strategy)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{strategy.strategy_name}</h4>
                            {strategy.source === 'user' && (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                Custom
                              </span>
                            )}
                          </div>
                          
                          {/* Action Icons */}
                          <div className="flex items-center gap-1">
                            {isMobile && (
                              <input
                                type="checkbox"
                                checked={selectedStrategies.includes(strategy.id)}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  handleStrategySelect(strategy)
                                }}
                                className="mr-2"
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            
                            {hasVideo(strategy) && (
                              <button
                                onClick={(e) => openVideoModal(strategy, e)}
                                className="p-1.5 hover:bg-gray-100 rounded"
                                title="View Video"
                              >
                                <Video className="h-4 w-4 text-gray-600" />
                              </button>
                            )}
                            
                            {hasThumbnails(strategy) && (
                              <button
                                className="p-1.5 hover:bg-gray-100 rounded"
                                title="View Images"
                              >
                                <Image className="h-4 w-4 text-gray-600" />
                              </button>
                            )}
                            
                            {hasLabUrls(strategy) && (
                              <button
                                onClick={(e) => openLabModal(strategy, e)}
                                className="p-1.5 hover:bg-gray-100 rounded"
                                title="Lacrosse Lab"
                              >
                                <Beaker className="h-4 w-4 text-gray-600" />
                              </button>
                            )}
                            
                            {!isMobile && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStrategySelect(strategy)
                                }}
                                className="p-1.5 hover:bg-gray-100 rounded text-blue-600"
                                title="Add to Practice"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {strategy.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {strategy.description}
                          </p>
                        )}
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
        </>
      )}
    </div>
  )
}