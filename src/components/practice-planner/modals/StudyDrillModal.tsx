'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Star, Video, AlertCircle } from 'lucide-react'

interface Drill {
  id: string
  name: string
  duration: number
  notes?: string
  videoUrl?: string
  labUrl?: string
  imageUrls?: string[]
  strategies?: string[]
  concepts?: string[]
  skills?: string[]
  coach_instructions?: string
  description?: string
  category?: string
  complexity?: string
  age_group?: string
}

interface StudyDrillModalProps {
  isOpen: boolean
  onClose: () => void
  drill: Drill
}

export default function StudyDrillModal({ isOpen, onClose, drill }: StudyDrillModalProps) {
  // Parse complexity level from string (e.g., "Level 3" -> "3")
  const complexityLevel = drill.complexity?.match(/(\d+)/)?.[1] || '1'
  
  // Parse coach instructions into bullet points
  const coachNotes = drill.coach_instructions?.split('\n').filter(note => note.trim()) || []
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[85vh] bg-white overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-[#003366] text-lg font-semibold">
            Study: {drill.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="diagram">Diagram</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 150px)' }}>
            <TabsContent value="overview" className="space-y-4">
              {/* Drill Details Card */}
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#003366] font-semibold">Drill Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {drill.category && (
                      <Badge variant="secondary" className="bg-blue-50 text-[#003366] border border-blue-200">
                        {drill.category}
                      </Badge>
                    )}
                    {drill.complexity && (
                      <Badge variant="secondary" className="bg-orange-50 text-[#FF6600] border border-orange-200">
                        Complexity: Level {complexityLevel}/5
                      </Badge>
                    )}
                    {drill.age_group && (
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200">
                        Age Group: {drill.age_group}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 border border-purple-200">
                      Duration: {drill.duration} min
                    </Badge>
                  </div>

                  {/* Connected Strategies, Concepts, Skills */}
                  {drill.strategies && drill.strategies.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#003366] mb-2">Connected Strategies:</h4>
                      <div className="flex flex-wrap gap-1">
                        {drill.strategies.map((strategy, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-[#003366] text-[#003366]">
                            {strategy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {drill.concepts && drill.concepts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#003366] mb-2">Connected Concepts:</h4>
                      <div className="flex flex-wrap gap-1">
                        {drill.concepts.map((concept, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-[#FF6600] text-[#FF6600]">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {drill.skills && drill.skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#003366] mb-2">Connected Skills:</h4>
                      <div className="flex flex-wrap gap-1">
                        {drill.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-green-600 text-green-600">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              {drill.description && (
                <div className="space-y-2">
                  <h3 className="text-[#003366] font-semibold">Description</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{drill.description}</p>
                </div>
              )}

              {/* Coach Notes */}
              {coachNotes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[#003366] font-semibold">Coach Instructions</h3>
                  <ul className="space-y-1">
                    {coachNotes.map((note, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-1 h-1 rounded-full bg-[#003366] mt-2 flex-shrink-0" />
                        {note.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="diagram" className="space-y-4">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-[#003366] font-semibold flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Interactive Drill Diagram
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {drill.labUrl ? (
                    <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden border">
                      <iframe
                        src={drill.labUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        title={`${drill.name} interactive diagram`}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center border border-green-200">
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-green-200 rounded-lg mx-auto flex items-center justify-center">
                          <Star className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-green-700 font-medium">Interactive Diagram Coming Soon</p>
                        <p className="text-green-600 text-sm">3D field visualization will be available here</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-[#003366] font-semibold flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Drill Demonstration Video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {drill.videoUrl ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={drill.videoUrl.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`${drill.name} demonstration video`}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                          <Play className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-gray-300 font-medium">Video Coming Soon</p>
                        <p className="text-gray-400 text-sm">Drill demonstration video will be available here</p>
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