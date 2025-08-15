'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Target, Lightbulb, Zap, AlertCircle, FileText, Users, BookOpen } from 'lucide-react'
import { useStrategies, getStrategiesByGamePhase, Strategy } from '@/hooks/useStrategies'

interface StrategiesModalProps {
  isOpen: boolean
  onClose: () => void
  onRefreshStrategies?: () => void
  drill: {
    title?: string
    name?: string
    strategies?: string[]
    concepts?: string[]
    skills?: string[]
    game_phase_ids?: string[]
    intensity_level?: string
    min_players?: number
    max_players?: number
    notes?: string
    coach_instructions?: string
    category?: string
    subcategory?: string
  }
}

export default function StrategiesModal({ isOpen, onClose, onRefreshStrategies, drill }: StrategiesModalProps) {
  const { strategies, loading, error, refreshStrategies } = useStrategies()
  
  // Refresh strategies when modal opens if callback provided
  React.useEffect(() => {
    if (isOpen && onRefreshStrategies) {
      refreshStrategies()
    }
  }, [isOpen, onRefreshStrategies, refreshStrategies])
  
  // Get strategies organized by game phase
  const strategiesByPhase = getStrategiesByGamePhase(strategies)
  
  // Filter strategies relevant to this drill
  const relevantStrategies = strategies.filter(strategy => {
    const drillCategory = drill.category?.toLowerCase() || ''
    const drillSubcategory = drill.subcategory?.toLowerCase() || ''
    const drillName = (drill.title || drill.name || '').toLowerCase()
    
    const strategyCategories = strategy.strategy_categories?.toLowerCase() || ''
    const strategyName = strategy.strategy_name.toLowerCase()
    const strategyDescription = strategy.description?.toLowerCase() || ''
    
    // Match by category, name, or keywords
    return strategyCategories.includes(drillCategory) ||
           strategyCategories.includes(drillSubcategory) ||
           strategyName.includes(drillCategory) ||
           strategyDescription.includes(drillCategory) ||
           drillName.includes(strategyName.split(' ')[0]) // Match first word
  })
  
  const hasContent = (drill.strategies && drill.strategies.length > 0) ||
                    (drill.concepts && drill.concepts.length > 0) ||
                    (drill.skills && drill.skills.length > 0) ||
                    drill.notes ||
                    drill.coach_instructions ||
                    relevantStrategies.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto field-border-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 field-drill-name">
            <Target className="h-6 w-6" />
            {drill.title || drill.name} - Strategies & Concepts
          </DialogTitle>
          <DialogDescription className="field-text-secondary font-medium">
            Strategic information and teaching concepts for this drill
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-powlax-blue mx-auto" />
                <p className="text-gray-600">Loading strategies...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div className="space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-red-400" />
                <p className="text-red-600">Error loading strategies: {error}</p>
              </div>
            </div>
          ) : !hasContent ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div className="space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-gray-600">No strategy information available for this drill</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Related Strategies from Database */}
              {relevantStrategies.length > 0 && (
                <Card className="bg-white">
                  <CardHeader className="pb-3 bg-white">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-4 w-4" />
                      Related Strategies
                      <Badge variant="outline" className="ml-auto text-xs">
                        {relevantStrategies.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-white">
                    <div className="space-y-3">
                      {relevantStrategies.slice(0, 5).map((strategy) => (
                        <div key={strategy.id} className="border-l-4 border-powlax-blue pl-4 py-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                {strategy.strategy_name}
                                {strategy.source === 'user' && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    <Users className="h-3 w-3 mr-1" />
                                    Custom
                                  </Badge>
                                )}
                                {strategy.source === 'powlax' && (
                                  <Badge variant="default" className="ml-2 text-xs">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    Study
                                  </Badge>
                                )}
                              </h4>
                              {strategy.description && (
                                <p className="text-sm text-gray-600 truncate">
                                  {strategy.description}
                                </p>
                              )}
                              {strategy.target_audience && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {strategy.target_audience}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {relevantStrategies.length > 5 && (
                        <p className="text-sm text-gray-500 text-center pt-2 border-t">
                          +{relevantStrategies.length - 5} more strategies available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Browse All Strategies by Game Phase */}
              {strategiesByPhase.length > 0 && (
                <Card className="bg-white">
                  <CardHeader className="pb-3 bg-white">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="h-4 w-4" />
                      Browse All Strategies
                      <Badge variant="outline" className="ml-auto text-xs">
                        {strategies.length} total
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-white">
                    <Accordion type="single" collapsible className="w-full">
                      {strategiesByPhase.map((phaseGroup, index) => (
                        <AccordionItem key={phaseGroup.phase} value={`phase-${index}`}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center justify-between w-full pr-4">
                              <span className="font-medium">{phaseGroup.phase}</span>
                              <Badge variant="secondary" className="text-xs">
                                {phaseGroup.strategies.length}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pt-2">
                              {phaseGroup.strategies.slice(0, 3).map((strategy) => (
                                <div key={strategy.id} className="border rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h5 className="font-medium text-sm text-gray-900">
                                        {strategy.strategy_name}
                                      </h5>
                                      {strategy.description && (
                                        <p className="text-xs text-gray-600 mt-1 truncate">
                                          {strategy.description}
                                        </p>
                                      )}
                                    </div>
                                    <Badge 
                                      variant={strategy.source === 'powlax' ? 'default' : 'secondary'} 
                                      className="text-xs ml-2 flex-shrink-0"
                                    >
                                      {strategy.source === 'powlax' ? 'Study' : 'Custom'}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                              {phaseGroup.strategies.length > 3 && (
                                <p className="text-xs text-gray-500 text-center">
                                  +{phaseGroup.strategies.length - 3} more in this phase
                                </p>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              )}

              {/* Notes Section - Show first as it's the main content */}
              {(drill.notes || drill.coach_instructions) && (
                <Card className="bg-white">
                  <CardHeader className="pb-3 bg-white">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-4 w-4" />
                      Drill Notes & Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-white">
                    <div className="space-y-3">
                      {drill.notes && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Notes:</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{drill.notes}</p>
                        </div>
                      )}
                      {drill.coach_instructions && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Coach Instructions:</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{drill.coach_instructions}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}


              {/* Additional Info */}
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Drill Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {drill.intensity_level && (
                      <div>
                        <span className="font-medium text-gray-600">Intensity:</span>
                        <p className="mt-1">{drill.intensity_level}</p>
                      </div>
                    )}
                    
                    {(drill.min_players || drill.max_players) && (
                      <div>
                        <span className="font-medium text-gray-600">Players:</span>
                        <p className="mt-1">
                          {drill.min_players && drill.max_players 
                            ? `${drill.min_players} - ${drill.max_players}`
                            : drill.min_players 
                              ? `${drill.min_players}+`
                              : drill.max_players 
                                ? `Up to ${drill.max_players}`
                                : 'Not specified'
                          }
                        </p>
                      </div>
                    )}
                    
                    {drill.game_phase_ids && drill.game_phase_ids.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-600">Game Phases:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {drill.game_phase_ids.map((phase, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {phase}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}