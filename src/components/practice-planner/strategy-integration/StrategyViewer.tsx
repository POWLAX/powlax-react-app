'use client'

import { useState, useEffect } from 'react'
import { X, Video, FileText, ExternalLink, ChevronRight, Target, Shield, Zap, Users, Flag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import VideoModal from '@/components/practice-planner/modals/VideoModal'
import LacrosseLabModal from '@/components/practice-planner/modals/LacrosseLabModal'

interface Strategy {
  id: string
  strategy_name: string
  strategy_categories: string
  description?: string
  vimeo_link?: string
  lacrosse_lab_links?: string[]
  pdf_link?: string
  see_it_ages?: string
  coach_it_ages?: string
  own_it_ages?: string
}

interface StrategyViewerProps {
  selectedStrategies: Strategy[]
  onRemoveStrategy: (strategyId: string) => void
}

const gamePhaseConfig = {
  'Ride': { icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
  'Clear': { icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
  'Transition Offense': { icon: Zap, color: 'text-green-600', bg: 'bg-green-50' },
  'Transition Defense': { icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
  'Settled Offense': { icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
  'Settled Defense': { icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'Man Up': { icon: Users, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  'Man Down': { icon: Flag, color: 'text-gray-600', bg: 'bg-gray-50' },
  'Face Off': { icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' }
}

export default function StrategyViewer({ selectedStrategies, onRemoveStrategy }: StrategyViewerProps) {
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showLabModal, setShowLabModal] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState('')
  const [currentLabUrls, setCurrentLabUrls] = useState<string[]>([])
  const [selectedStrategyForModal, setSelectedStrategyForModal] = useState<Strategy | null>(null)

  const getPhaseConfig = (category: string) => {
    const normalizedCategory = category?.trim() || ''
    return gamePhaseConfig[normalizedCategory] || gamePhaseConfig['Settled Offense']
  }

  const openVideo = (strategy: Strategy) => {
    if (strategy.vimeo_link) {
      setCurrentVideoUrl(strategy.vimeo_link)
      setSelectedStrategyForModal(strategy)
      setShowVideoModal(true)
    }
  }

  const openLacrosseLab = (strategy: Strategy) => {
    if (strategy.lacrosse_lab_links && strategy.lacrosse_lab_links.length > 0) {
      setCurrentLabUrls(strategy.lacrosse_lab_links)
      setSelectedStrategyForModal(strategy)
      setShowLabModal(true)
    }
  }

  const openPDF = (pdfLink: string) => {
    window.open(pdfLink, '_blank')
  }

  if (selectedStrategies.length === 0) {
    return null
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Practice Strategies</h2>
          <span className="text-sm text-gray-500">
            {selectedStrategies.length} {selectedStrategies.length === 1 ? 'strategy' : 'strategies'} selected
          </span>
        </div>

        <div className="space-y-3">
          {selectedStrategies.map((strategy) => {
            const phaseConfig = getPhaseConfig(strategy.strategy_categories)
            const Icon = phaseConfig.icon
            const isExpanded = expandedStrategy === strategy.id

            return (
              <div
                key={strategy.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  isExpanded ? 'shadow-md' : ''
                }`}
              >
                {/* Strategy Header */}
                <div
                  className={`p-3 ${phaseConfig.bg} cursor-pointer`}
                  onClick={() => setExpandedStrategy(isExpanded ? null : strategy.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${phaseConfig.color}`} />
                      <div>
                        <h3 className="font-medium text-gray-900">{strategy.strategy_name}</h3>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {strategy.strategy_categories}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Quick Action Icons */}
                      <div className="flex gap-1">
                        {strategy.vimeo_link && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openVideo(strategy)
                            }}
                            className="p-1.5 hover:bg-white/50 rounded transition-colors"
                            title="View Video"
                          >
                            <Video className="h-4 w-4 text-gray-700" />
                          </button>
                        )}
                        {strategy.lacrosse_lab_links && strategy.lacrosse_lab_links.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openLacrosseLab(strategy)
                            }}
                            className="p-1.5 hover:bg-white/50 rounded transition-colors"
                            title="View Lacrosse Lab Diagrams"
                          >
                            <img 
                              src="https://powlax.com/wp-content/uploads/2025/06/Lacrosse-Lab-Link-1.svg" 
                              alt="Lacrosse Lab" 
                              className="h-4 w-4"
                            />
                          </button>
                        )}
                        {strategy.pdf_link && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openPDF(strategy.pdf_link)
                            }}
                            className="p-1.5 hover:bg-white/50 rounded transition-colors"
                            title="View PDF"
                          >
                            <FileText className="h-4 w-4 text-gray-700" />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveStrategy(strategy.id)
                        }}
                        className="p-1 hover:bg-white/50 rounded transition-colors"
                        title="Remove Strategy"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                      <ChevronRight
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-4 bg-white border-t">
                    {strategy.description && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                        <p className="text-sm text-gray-600">{strategy.description}</p>
                      </div>
                    )}

                    {/* Age Levels */}
                    {(strategy.see_it_ages || strategy.coach_it_ages || strategy.own_it_ages) && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Development Levels</h4>
                        <div className="flex gap-3 text-xs">
                          {strategy.see_it_ages && (
                            <Badge variant="outline">See It: {strategy.see_it_ages}</Badge>
                          )}
                          {strategy.coach_it_ages && (
                            <Badge variant="outline">Coach It: {strategy.coach_it_ages}</Badge>
                          )}
                          {strategy.own_it_ages && (
                            <Badge variant="outline">Own It: {strategy.own_it_ages}</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    <div className="flex flex-wrap gap-2">
                      {strategy.vimeo_link && (
                        <Button
                          onClick={() => openVideo(strategy)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Video className="h-3 w-3" />
                          Watch Video
                        </Button>
                      )}
                      {strategy.lacrosse_lab_links && strategy.lacrosse_lab_links.length > 0 && (
                        <Button
                          onClick={() => openLacrosseLab(strategy)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <img 
                            src="https://powlax.com/wp-content/uploads/2025/06/Lacrosse-Lab-Link-1.svg" 
                            alt="Lab" 
                            className="h-3 w-3"
                          />
                          View Diagrams ({strategy.lacrosse_lab_links.length})
                        </Button>
                      )}
                      {strategy.pdf_link && (
                        <Button
                          onClick={() => openPDF(strategy.pdf_link)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          Open PDF
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Video Modal */}
      {selectedStrategyForModal && (
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => {
            setShowVideoModal(false)
            setSelectedStrategyForModal(null)
          }}
          drill={{
            name: selectedStrategyForModal.strategy_name,
            videoUrl: currentVideoUrl
          }}
        />
      )}

      {/* Lacrosse Lab Modal */}
      {selectedStrategyForModal && (
        <LacrosseLabModal
          isOpen={showLabModal}
          onClose={() => {
            setShowLabModal(false)
            setSelectedStrategyForModal(null)
          }}
          drill={{
            name: selectedStrategyForModal.strategy_name,
            lacrosse_lab_urls: currentLabUrls
          }}
        />
      )}
    </>
  )
}