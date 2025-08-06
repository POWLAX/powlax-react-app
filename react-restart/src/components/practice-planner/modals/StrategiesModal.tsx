'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Lightbulb, Zap, AlertCircle, FileText } from 'lucide-react'

interface StrategiesModalProps {
  isOpen: boolean
  onClose: () => void
  drill: {
    name: string
    strategies?: string[]
    concepts?: string[]
    skills?: string[]
    game_phase_ids?: string[]
    intensity_level?: string
    min_players?: number
    max_players?: number
    notes?: string
    coach_instructions?: string
  }
}

export default function StrategiesModal({ isOpen, onClose, drill }: StrategiesModalProps) {
  const hasContent = (drill.strategies && drill.strategies.length > 0) ||
                    (drill.concepts && drill.concepts.length > 0) ||
                    (drill.skills && drill.skills.length > 0) ||
                    drill.notes ||
                    drill.coach_instructions

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {drill.name} - Strategies & Concepts
          </DialogTitle>
          <DialogDescription>
            Strategic information and teaching concepts for this drill
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!hasContent ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div className="space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-gray-600">No strategy information available for this drill</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
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

              {/* Strategies Section */}
              {drill.strategies && drill.strategies.length > 0 && (
                <Card className="bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-4 w-4" />
                      Strategies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {drill.strategies.map((strategy, index) => (
                        <Badge key={index} variant="default" className="text-xs">
                          #{strategy}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Concepts Section */}
              {drill.concepts && drill.concepts.length > 0 && (
                <Card className="bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="h-4 w-4" />
                      Concepts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {drill.concepts.map((concept, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{concept}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Skills Section */}
              {drill.skills && drill.skills.length > 0 && (
                <Card className="bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-4 w-4" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {drill.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{skill}
                        </Badge>
                      ))}
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