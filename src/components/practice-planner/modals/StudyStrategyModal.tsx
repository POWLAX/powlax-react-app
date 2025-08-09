'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, Users, BookOpen, AlertCircle } from 'lucide-react'

interface Strategy {
  id: string
  strategy_name: string
  strategy_categories?: string
  description?: string
  complexity?: string
  source?: string
  target_audience?: string
  detailed_description?: string
  implementation_steps?: string[]
}

interface StudyStrategyModalProps {
  isOpen: boolean
  onClose: () => void
  strategy: Strategy
}

export default function StudyStrategyModal({ isOpen, onClose, strategy }: StudyStrategyModalProps) {
  // Parse implementation steps from string
  const implementationSteps = strategy.implementation_steps || 
    (strategy.detailed_description?.split('\n').filter(step => step.trim()) || [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[85vh] bg-white overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-[#003366] text-lg font-semibold">
            Study: {strategy.strategy_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 150px)' }}>
            <TabsContent value="overview" className="space-y-4">
              {/* Strategy Details Card */}
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#003366] font-semibold">Strategy Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {strategy.strategy_categories && (
                      <Badge variant="secondary" className="bg-blue-50 text-[#003366] border border-blue-200">
                        {strategy.strategy_categories}
                      </Badge>
                    )}
                    {strategy.source && (
                      <Badge variant="secondary" className={
                        strategy.source === 'powlax' 
                          ? "bg-[#003366] text-white border border-[#003366]" 
                          : "bg-green-50 text-green-700 border border-green-200"
                      }>
                        {strategy.source === 'powlax' ? (
                          <>
                            <BookOpen className="w-3 h-3 mr-1" />
                            POWLAX
                          </>
                        ) : (
                          <>
                            <Users className="w-3 h-3 mr-1" />
                            Custom
                          </>
                        )}
                      </Badge>
                    )}
                    {strategy.target_audience && (
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 border border-purple-200">
                        {strategy.target_audience}
                      </Badge>
                    )}
                    {strategy.complexity && (
                      <Badge variant="secondary" className="bg-orange-50 text-[#FF6600] border border-orange-200">
                        {strategy.complexity}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {strategy.description && (
                <div className="space-y-2">
                  <h3 className="text-[#003366] font-semibold">Description</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{strategy.description}</p>
                </div>
              )}

              {/* Detailed Description */}
              {strategy.detailed_description && strategy.detailed_description !== strategy.description && (
                <div className="space-y-2">
                  <h3 className="text-[#003366] font-semibold">Detailed Overview</h3>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{strategy.detailed_description}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="implementation" className="space-y-4">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-[#003366] font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Implementation Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {implementationSteps.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-[#003366] mb-3">Step-by-Step Implementation:</h4>
                      <ol className="space-y-2">
                        {implementationSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                            <div className="w-6 h-6 rounded-full bg-[#003366] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <div className="flex-1">{step.trim()}</div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-blue-200 rounded-lg mx-auto flex items-center justify-center">
                          <Target className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-blue-700 font-medium">Implementation Guide Coming Soon</p>
                        <p className="text-blue-600 text-sm">Detailed step-by-step instructions will be available here</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}