'use client'

import { useState, useEffect } from 'react'
import { Plus, Star, Video, Target, TrendingUp, Lightbulb, X, ChevronDown, ChevronUp } from 'lucide-react'
import { getStrategyRecommendations, DrillRecommendation } from './strategyDrillMappings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface StrategyDrillRecommendationsProps {
  selectedStrategies: string[]
  onAddDrill: (drill: any) => void
  isOpen: boolean
  onClose: () => void
}

export default function StrategyDrillRecommendations({
  selectedStrategies,
  onAddDrill,
  isOpen,
  onClose
}: StrategyDrillRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<{
    strategyName: string
    strategyId: string
    drills: {
      essential: DrillRecommendation[]
      supporting: DrillRecommendation[]
      progression: DrillRecommendation[]
    }
  }[]>([])
  const [expandedSections, setExpandedSections] = useState<string[]>(['essential'])
  const [addedDrills, setAddedDrills] = useState<string[]>([])

  useEffect(() => {
    if (selectedStrategies.length > 0) {
      const recs = selectedStrategies.map(strategyId => {
        const drills = getStrategyRecommendations(strategyId)
        const strategyNameMap: Record<string, string> = {
          'demo-1': '4-3 Alpha Clear',
          'demo-2': 'Cuse Motion Offense',
          'demo-3': '2-3-1 Motion Offense',
          'demo-4': 'Ground Ball Recovery',
          'demo-5': 'Transition Defense'
        }
        
        return {
          strategyName: strategyNameMap[strategyId] || strategyId,
          strategyId,
          drills: drills || { essential: [], supporting: [], progression: [] }
        }
      }).filter(r => r.drills.essential.length > 0)
      
      setRecommendations(recs)
    }
  }, [selectedStrategies])

  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter(s => s !== section))
    } else {
      setExpandedSections([...expandedSections, section])
    }
  }

  const handleAddDrill = (drill: DrillRecommendation, strategyName: string) => {
    const drillToAdd = {
      id: `${drill.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: drill.name,
      duration: drill.duration,
      category: drill.category,
      strategies: [strategyName],
      notes: drill.strategyContext,
      coach_instructions: drill.strategyContext
    }
    
    onAddDrill(drillToAdd)
    setAddedDrills([...addedDrills, drill.name])
  }

  const getDifficultyStars = (difficulty?: number) => {
    if (!difficulty) return null
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${
              i < difficulty ? 'bg-orange-400' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Recommended Drills for Your Strategy Focus
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                AI-powered drill suggestions based on your selected strategies
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-180px)]">
          {recommendations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No recommendations available. Please select strategies first.</p>
            </div>
          ) : (
            recommendations.map(({ strategyName, drills }) => (
              <div key={strategyName} className="border-b last:border-b-0">
                <div className="p-4 bg-gray-50">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {strategyName} Drills
                  </h3>
                </div>

                {/* Essential Drills */}
                <div className="border-b">
                  <button
                    onClick={() => toggleSection('essential')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Essential Drills</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        Add these first
                      </Badge>
                      <span className="text-sm text-gray-500">({drills.essential.length})</span>
                    </div>
                    {expandedSections.includes('essential') ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSections.includes('essential') && (
                    <div className="px-4 pb-4 space-y-3">
                      {drills.essential.map((drill, idx) => (
                        <div
                          key={idx}
                          className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">{drill.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {drill.duration} min
                                </Badge>
                                {getDifficultyStars(drill.difficulty)}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{drill.strategyContext}</p>
                              {drill.tags && (
                                <div className="flex flex-wrap gap-1">
                                  {drill.tags.map(tag => (
                                    <span key={tag} className="text-xs text-blue-600">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <Video className="h-4 w-4" />
                              </button>
                              <Button
                                onClick={() => handleAddDrill(drill, strategyName)}
                                size="sm"
                                className={`${
                                  addedDrills.includes(drill.name)
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                } text-white`}
                                disabled={addedDrills.includes(drill.name)}
                              >
                                {addedDrills.includes(drill.name) ? (
                                  <>Added</>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Supporting Drills */}
                <div className="border-b">
                  <button
                    onClick={() => toggleSection('supporting')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-gray-900">Supporting Drills</span>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        Build fundamentals
                      </Badge>
                      <span className="text-sm text-gray-500">({drills.supporting.length})</span>
                    </div>
                    {expandedSections.includes('supporting') ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSections.includes('supporting') && (
                    <div className="px-4 pb-4 space-y-3">
                      {drills.supporting.map((drill, idx) => (
                        <div
                          key={idx}
                          className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">{drill.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {drill.duration} min
                                </Badge>
                                {getDifficultyStars(drill.difficulty)}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{drill.strategyContext}</p>
                              {drill.tags && (
                                <div className="flex flex-wrap gap-1">
                                  {drill.tags.map(tag => (
                                    <span key={tag} className="text-xs text-orange-600">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <Video className="h-4 w-4" />
                              </button>
                              <Button
                                onClick={() => handleAddDrill(drill, strategyName)}
                                size="sm"
                                className={`${
                                  addedDrills.includes(drill.name)
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-orange-500 hover:bg-orange-600'
                                } text-white`}
                                disabled={addedDrills.includes(drill.name)}
                              >
                                {addedDrills.includes(drill.name) ? (
                                  <>Added</>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Progression Drills */}
                <div>
                  <button
                    onClick={() => toggleSection('progression')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">Progression Drills</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Advanced application
                      </Badge>
                      <span className="text-sm text-gray-500">({drills.progression.length})</span>
                    </div>
                    {expandedSections.includes('progression') ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSections.includes('progression') && (
                    <div className="px-4 pb-4 space-y-3">
                      {drills.progression.map((drill, idx) => (
                        <div
                          key={idx}
                          className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">{drill.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {drill.duration} min
                                </Badge>
                                {getDifficultyStars(drill.difficulty)}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{drill.strategyContext}</p>
                              {drill.tags && (
                                <div className="flex flex-wrap gap-1">
                                  {drill.tags.map(tag => (
                                    <span key={tag} className="text-xs text-green-600">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <Video className="h-4 w-4" />
                              </button>
                              <Button
                                onClick={() => handleAddDrill(drill, strategyName)}
                                size="sm"
                                className={`${
                                  addedDrills.includes(drill.name)
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-green-600 hover:bg-green-700'
                                } text-white`}
                                disabled={addedDrills.includes(drill.name)}
                              >
                                {addedDrills.includes(drill.name) ? (
                                  <>Added</>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {addedDrills.length} {addedDrills.length === 1 ? 'drill' : 'drills'} added to practice
            </p>
            <Button onClick={onClose} variant="outline">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}