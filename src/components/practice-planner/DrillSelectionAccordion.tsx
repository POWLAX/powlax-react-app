'use client'

import { useState } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Video, Link, Star, Plus, Trash2, Beaker } from 'lucide-react'
import VideoModal from './modals/VideoModal'
import LinksModal from './modals/LinksModal' 
import StrategiesModal from './modals/StrategiesModal'
import LacrosseLabModal from './modals/LacrosseLabModal'

interface Drill {
  id: string
  name: string
  duration: number
  category: string
  strategies?: string[]
  concepts?: string[]
  skills?: string[]
  videoUrl?: string
  isFavorite?: boolean
  notes?: string
  coach_instructions?: string
  custom_url?: string
  lab_urls?: string[] | string
  lacrosse_lab_urls?: string[]
  drill_lab_url_1?: string
  drill_lab_url_2?: string
  drill_lab_url_3?: string
  drill_lab_url_4?: string
  drill_lab_url_5?: string
}

interface DrillSelectionAccordionProps {
  drills: Drill[]
  onAddSelectedDrills: (drills: Drill[]) => void
  onToggleFavorite?: (drillId: string) => void
  favorites?: string[]
}

export default function DrillSelectionAccordion({
  drills,
  onAddSelectedDrills,
  onToggleFavorite,
  favorites = []
}: DrillSelectionAccordionProps) {
  const [selectedDrills, setSelectedDrills] = useState<string[]>([])
  const [isAccordionOpen, setIsAccordionOpen] = useState(false)
  
  // Modal states
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showLinksModal, setShowLinksModal] = useState(false)
  const [showStrategiesModal, setShowStrategiesModal] = useState(false)
  const [showLacrosseLabModal, setShowLacrosseLabModal] = useState(false)
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null)

  const categories = [
    { id: 'admin', name: 'Admin' },
    { id: 'skill', name: 'Skill Drills' },
    { id: '1v1', name: '1v1 Drills' },
    { id: 'concept', name: 'Concept Drills' },
  ]

  const toggleDrillSelection = (drillId: string) => {
    setSelectedDrills(prev => 
      prev.includes(drillId) 
        ? prev.filter(id => id !== drillId)
        : [...prev, drillId]
    )
  }

  const handleAddSelected = () => {
    const drillsToAdd = drills.filter(drill => selectedDrills.includes(drill.id))
    onAddSelectedDrills(drillsToAdd)
    setSelectedDrills([])
    setIsAccordionOpen(false)
  }

  const handleClearSelection = () => {
    setSelectedDrills([])
  }

  const openVideoModal = (drill: Drill, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDrill(drill)
    setShowVideoModal(true)
  }

  const openLinksModal = (drill: Drill, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDrill(drill)
    setShowLinksModal(true)
  }

  const openStrategiesModal = (drill: Drill, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDrill(drill)
    setShowStrategiesModal(true)
  }

  const openLacrosseLabModal = (drill: Drill, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDrill(drill)
    setShowLacrosseLabModal(true)
  }

  const getDrillsByCategory = (categoryId: string) => {
    return drills.filter(drill => drill.category === categoryId)
  }

  const selectedDrillsData = drills.filter(drill => selectedDrills.includes(drill.id))

  return (
    <div className="w-full">
      {/* Selected Drills Accordion */}
      {selectedDrills.length > 0 && (
        <Accordion type="single" collapsible value={isAccordionOpen ? "selected" : ""} onValueChange={(value) => setIsAccordionOpen(value === "selected")}>
          <AccordionItem value="selected">
            <AccordionTrigger className="bg-blue-50 px-4 py-3 rounded-t-lg border">
              <div className="flex items-center gap-2">
                <Badge variant="default">{selectedDrills.length}</Badge>
                <span>Selected Drills</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="border-x border-b rounded-b-lg bg-white">
              <div className="p-4 space-y-3">
                {selectedDrillsData.map(drill => (
                  <div key={drill.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => toggleDrillSelection(drill.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{drill.name}</h4>
                        <span className="text-sm text-gray-500">{drill.duration}min</span>
                      </div>
                      
                      {drill.strategies && drill.strategies.length > 0 && (
                        <p className="text-sm text-blue-600 mt-1">
                          {drill.strategies.map(s => `#${s}`).join(' ')}
                        </p>
                      )}
                      
                      {/* Icon row */}
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={(e) => openVideoModal(drill, e)}
                          className={`p-1 rounded hover:bg-blue-50 ${!drill.videoUrl ? 'opacity-40' : ''}`}
                          title="View Video"
                          disabled={!drill.videoUrl}
                        >
                          <img 
                            src="https://powlax.com/wp-content/uploads/2025/06/Video-1.svg" 
                            alt="Video" 
                            className="h-4 w-4"
                          />
                        </button>

                        <button
                          onClick={(e) => openLacrosseLabModal(drill, e)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Lacrosse Lab Diagrams"
                        >
                          <img 
                            src="https://powlax.com/wp-content/uploads/2025/06/Lacrosse-Lab-Link-1.svg" 
                            alt="Lacrosse Lab" 
                            className="h-4 w-4"
                          />
                        </button>

                        <button
                          onClick={(e) => openLinksModal(drill, e)}
                          className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                          title="External Links"
                        >
                          <Link className="h-3 w-3" />
                        </button>

                        <button
                          onClick={(e) => openStrategiesModal(drill, e)}
                          className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                          title="Strategies & Concepts"
                        >
                          <span className="text-xs font-bold">X/O</span>
                        </button>

                        {onToggleFavorite && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleFavorite(drill.id)
                            }}
                            className={`p-1 rounded ml-auto ${
                              favorites.includes(drill.id)
                                ? 'text-yellow-500'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            <Star
                              className={`h-3 w-3 ${
                                favorites.includes(drill.id) ? 'fill-current' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex gap-2 pt-2 border-t">
                  <Button onClick={handleAddSelected} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Add {selectedDrills.length} Drill{selectedDrills.length > 1 ? 's' : ''} to Plan
                  </Button>
                  <Button onClick={handleClearSelection} variant="outline">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Drill Categories */}
      <div className="space-y-2 mt-4">
        {categories.map(category => {
          const categoryDrills = getDrillsByCategory(category.id)
          if (categoryDrills.length === 0) return null
          
          return (
            <Accordion key={category.id} type="single" collapsible>
              <AccordionItem value={category.id}>
                <AccordionTrigger className="px-4 py-2 bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>{category.name}</span>
                    <Badge variant="secondary">{categoryDrills.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2">
                  <div className="space-y-2">
                    {categoryDrills.map(drill => (
                      <div key={drill.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          checked={selectedDrills.includes(drill.id)}
                          onCheckedChange={() => toggleDrillSelection(drill.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 text-sm">{drill.name}</h4>
                            <span className="text-xs text-gray-500">{drill.duration}min</span>
                          </div>
                          
                          {drill.strategies && drill.strategies.length > 0 && (
                            <p className="text-xs text-blue-600 mt-1">
                              {drill.strategies.slice(0, 3).map(s => `#${s}`).join(' ')}
                            </p>
                          )}
                          
                          {/* Icon row */}
                          <div className="flex items-center gap-1 mt-1">
                            <button
                              onClick={(e) => openVideoModal(drill, e)}
                              className={`p-1 rounded hover:bg-blue-50 ${!drill.videoUrl ? 'opacity-40' : ''}`}
                              title="View Video"
                              disabled={!drill.videoUrl}
                            >
                              <img 
                                src="https://powlax.com/wp-content/uploads/2025/06/Video-1.svg" 
                                alt="Video" 
                                className="h-4 w-4"
                              />
                            </button>

                            <button
                              onClick={(e) => openLacrosseLabModal(drill, e)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Lacrosse Lab Diagrams"
                            >
                              <img 
                                src="https://powlax.com/wp-content/uploads/2025/06/Lacrosse-Lab-Link-1.svg" 
                                alt="Lacrosse Lab" 
                                className="h-4 w-4"
                              />
                            </button>

                            <button
                              onClick={(e) => openLinksModal(drill, e)}
                              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                              title="External Links"
                            >
                              <Link className="h-3 w-3" />
                            </button>

                            <button
                              onClick={(e) => openStrategiesModal(drill, e)}
                              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                              title="Strategies & Concepts"
                            >
                              <span className="text-xs font-bold">X/O</span>
                            </button>

                            {onToggleFavorite && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleFavorite(drill.id)
                                }}
                                className={`p-1 rounded ml-auto ${
                                  favorites.includes(drill.id)
                                    ? 'text-yellow-500'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                <Star
                                  className={`h-3 w-3 ${
                                    favorites.includes(drill.id) ? 'fill-current' : ''
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )
        })}
      </div>

      {/* Modals */}
      {selectedDrill && (
        <>
          <VideoModal
            isOpen={showVideoModal}
            onClose={() => {
              setShowVideoModal(false)
              setSelectedDrill(null)
            }}
            drill={selectedDrill}
          />

          <LinksModal
            isOpen={showLinksModal}
            onClose={() => {
              setShowLinksModal(false)
              setSelectedDrill(null)
            }}
            drill={selectedDrill}
          />

          <StrategiesModal
            isOpen={showStrategiesModal}
            onClose={() => {
              setShowStrategiesModal(false)
              setSelectedDrill(null)
            }}
            drill={selectedDrill}
          />

          <LacrosseLabModal
            isOpen={showLacrosseLabModal}
            onClose={() => {
              setShowLacrosseLabModal(false)
              setSelectedDrill(null)
            }}
            drill={selectedDrill}
          />
        </>
      )}
    </div>
  )
}