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
import { Target, Lightbulb, Zap, AlertCircle, BookOpen, Users, ExternalLink } from 'lucide-react'
import { useStrategies, getStrategiesByGamePhase, Strategy } from '@/hooks/useStrategies'
import { Button } from "@/components/ui/button"

interface StrategiesListModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function StrategiesListModal({ isOpen, onClose }: StrategiesListModalProps) {
  const { strategies, loading, error, refreshStrategies } = useStrategies()
  
  // Get strategies organized by game phase
  const strategiesByPhase = getStrategiesByGamePhase(strategies)

  const handleStrategyClick = (strategy: Strategy) => {
    // For now, just show an alert with the strategy info
    // In the future, this could open a detailed strategy modal
    if (strategy.description) {
      alert(`${strategy.strategy_name}\n\n${strategy.description}`)
    } else {
      alert(`${strategy.strategy_name}\n\nNo description available.`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-powlax-blue">
            <Target className="h-6 w-6" />
            Strategy Reference Library
          </DialogTitle>
          <DialogDescription>
            Browse coaching strategies and concepts for your practice planning
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
                <Button onClick={refreshStrategies} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          ) : strategies.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div className="space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-gray-600">No strategies available</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <Card className="bg-powlax-blue/5 border-powlax-blue/20">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-powlax-blue" />
                      <span className="font-medium">{strategies.filter(s => s.source === 'powlax').length} POWLAX Strategies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{strategies.filter(s => s.source === 'user').length} Custom Strategies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">{strategiesByPhase.length} Game Phases</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strategies by Game Phase */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Strategies by Game Phase
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                          <div className="space-y-3 pt-3">
                            {phaseGroup.strategies.map((strategy) => (
                              <Card
                                key={strategy.id} 
                                className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-powlax-blue/30 hover:border-l-powlax-blue"
                                onClick={() => handleStrategyClick(strategy)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                        {strategy.strategy_name}
                                        {strategy.source === 'user' && (
                                          <Badge variant="secondary" className="text-xs">
                                            <Users className="h-3 w-3 mr-1" />
                                            Custom
                                          </Badge>
                                        )}
                                        {strategy.source === 'powlax' && (
                                          <Badge variant="default" className="text-xs bg-powlax-blue">
                                            <BookOpen className="h-3 w-3 mr-1" />
                                            POWLAX
                                          </Badge>
                                        )}
                                      </h4>
                                      {strategy.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                          {strategy.description}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-1">
                                        {strategy.target_audience && (
                                          <Badge variant="outline" className="text-xs">
                                            {strategy.target_audience}
                                          </Badge>
                                        )}
                                        {strategy.lesson_category && strategy.lesson_category !== phaseGroup.phase && (
                                          <Badge variant="outline" className="text-xs">
                                            {strategy.lesson_category}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-gray-400 ml-3 flex-shrink-0" />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}