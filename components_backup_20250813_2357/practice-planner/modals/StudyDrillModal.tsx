'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Star, BookOpen, Play, Target, ChevronLeft, ChevronRight, Loader2, Download, Maximize2 } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { toast } from 'sonner'

interface Drill {
  id: string
  title: string
  duration_minutes: number
  notes?: string
  videoUrl?: string
  drill_video_url?: string
  labUrl?: string
  lab_urls?: string[] | string
  lacrosse_lab_urls?: string[]
  imageUrls?: string[]
  strategies?: string[]
  concepts?: string[]
  skills?: string[]
  coach_instructions?: string
  description?: string
  category?: string
  complexity?: string
  age_group?: string
  drill_type?: string
  source?: string
  thumbnail_url?: string
  master_pdf_url?: string
}

interface StudyDrillModalProps {
  isOpen: boolean
  onClose: () => void
  drill: Drill | null
  onUpdateDrill?: (drill: Drill) => void
}

export default function StudyDrillModal({ isOpen, onClose, drill, onUpdateDrill }: StudyDrillModalProps) {
  const { toggleFavorite, isFavorite } = useFavorites()
  const [embedUrl, setEmbedUrl] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [tempNotes, setTempNotes] = useState(drill?.notes || '')
  const [currentDiagramIndex, setCurrentDiagramIndex] = useState(0)
  const [isDiagramLoading, setIsDiagramLoading] = useState(true)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  useEffect(() => {
    if (!drill) return
    
    // Load saved notes from localStorage
    const savedNotes = JSON.parse(localStorage.getItem('drillNotes') || '{}')
    const savedNote = savedNotes[drill.id] || drill.notes || ''
    setTempNotes(savedNote)
    
    setEditingNotes(false)
    setCurrentDiagramIndex(0)
    setIsDiagramLoading(true)
    setIsVideoPlaying(false)
    
    const videoUrl = drill.videoUrl || drill.drill_video_url
    if (!videoUrl) {
      setEmbedUrl('')
      return
    }
    
    // Convert YouTube URLs to embed format
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      let videoId = ''
      if (videoUrl.includes('watch?v=')) {
        videoId = videoUrl.split('watch?v=')[1].split('&')[0]
      } else if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1].split('?')[0]
      }
      if (videoId) {
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`)
      }
    } 
    // Convert Vimeo URLs
    else if (videoUrl.includes('vimeo.com')) {
      const vimeoId = videoUrl.split('vimeo.com/')[1].split('/')[0].split('?')[0]
      if (vimeoId) {
        setEmbedUrl(`https://player.vimeo.com/video/${vimeoId}?autoplay=1`)
      }
    } else {
      setEmbedUrl(videoUrl)
    }
  }, [drill])

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview')
    }
  }, [isOpen])

  if (!drill) return null

  // Get all possible lab URLs
  const getLabUrls = () => {
    const urls: string[] = []
    
    // Check various lab URL fields
    if (drill.labUrl) urls.push(drill.labUrl)
    if (drill.lab_urls) {
      if (typeof drill.lab_urls === 'string') {
        try {
          const parsed = JSON.parse(drill.lab_urls)
          if (Array.isArray(parsed)) urls.push(...parsed.filter(Boolean))
        } catch {
          urls.push(drill.lab_urls)
        }
      } else if (Array.isArray(drill.lab_urls)) {
        urls.push(...drill.lab_urls.filter(Boolean))
      }
    }
    if (drill.lacrosse_lab_urls && Array.isArray(drill.lacrosse_lab_urls)) {
      urls.push(...drill.lacrosse_lab_urls.filter(Boolean))
    }
    
    return urls.filter(url => url && url.trim())
  }

  const labUrls = getLabUrls()
  const hasVideo = !!embedUrl
  const hasDiagram = labUrls.length > 0
  
  // Determine available tabs
  const availableTabs = [
    { value: 'overview', label: 'Overview', show: true },
    { value: 'diagram', label: 'Diagram', show: hasDiagram },
    { value: 'video', label: 'Video', show: hasVideo }
  ].filter(tab => tab.show)

  // Calculate modal height based on active tab
  const modalHeight = activeTab === 'diagram' ? 'h-[90vh]' : 'max-h-[85vh]'
  const contentClass = activeTab === 'diagram' ? 'flex flex-col h-full' : ''

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-3xl ${modalHeight} p-0 overflow-hidden bg-white ${contentClass}`}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl pr-48">
            <BookOpen className="h-5 w-5" />
            {drill?.title || ''}
            <button 
              onClick={async () => {
                if (drill) {
                  await toggleFavorite(drill.id, 'drill')
                }
              }}
              className="p-1.5 hover:bg-gray-100 rounded ml-2"
              title={drill && isFavorite(drill.id, 'drill') ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`h-5 w-5 ${drill && isFavorite(drill.id, 'drill') ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-yellow-500'}`} />
            </button>
          </DialogTitle>
          <div className="absolute top-6 right-6 flex items-center gap-2">
            {drill?.master_pdf_url && (
              <button 
                onClick={() => window.open(drill.master_pdf_url, '_blank')}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded"
              >
                <Download className="h-3 w-3" />
                Download Printable Playbook
              </button>
            )}
          </div>
        </DialogHeader>

        <Tabs 
          defaultValue="overview" 
          className={activeTab === 'diagram' ? 'flex-1 flex flex-col' : 'flex-1'}
          onValueChange={setActiveTab}
        >
          <TabsList className={`grid w-full px-6 flex-shrink-0 ${availableTabs.length === 3 ? 'grid-cols-3' : availableTabs.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {availableTabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className={activeTab === 'diagram' ? 'flex-1 overflow-hidden' : 'overflow-y-auto max-h-[calc(85vh-140px)]'}>
            {/* Overview Tab */}
            <TabsContent value="overview" className="px-6 py-4 space-y-4 mt-0">
              {/* Strategy Details Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Strategy Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Category</p>
                    <Badge variant="secondary" className="bg-gray-900 text-white">
                      {drill.category || drill.drill_type || 'Offense'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Complexity</p>
                    <p className="text-sm font-medium">
                      <span className="text-yellow-600">Level {drill.complexity || '3'}/5</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Age Group</p>
                    <p className="text-sm font-medium">{drill.age_group || '14U+'}</p>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-sm text-gray-700">
                  {drill.description || drill.notes || 
                   'A balanced offensive formation with two attackmen, two midfielders, and two defenders positioned strategically for ball movement and scoring opportunities.'}
                </p>
              </div>

              {/* Coaches Notes Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Coaches Notes</h3>
                  {!editingNotes && (
                    <button
                      onClick={() => setEditingNotes(true)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editingNotes ? (
                  <div>
                    <textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg resize-none text-sm"
                      rows={4}
                      placeholder="Add coaching notes..."
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          if (onUpdateDrill && drill) {
                            const updatedDrill = { ...drill, notes: tempNotes }
                            onUpdateDrill(updatedDrill)
                            // Also save to localStorage for user-specific persistence
                            const savedNotes = JSON.parse(localStorage.getItem('drillNotes') || '{}')
                            savedNotes[drill.id] = tempNotes
                            localStorage.setItem('drillNotes', JSON.stringify(savedNotes))
                          }
                          setEditingNotes(false)
                        }}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setTempNotes(drill?.notes || '')
                          setEditingNotes(false)
                        }}
                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {tempNotes ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{tempNotes}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">+ Add Notes</p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Diagram Tab - Non-scrollable, full height */}
            {hasDiagram && (
            <TabsContent value="diagram" className="h-full flex flex-col mt-0">
              <div className="flex-1 flex flex-col p-4 md:p-4 p-2">
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <h3 className="font-semibold text-gray-900">Field Diagram</h3>
                  <div className="flex items-center gap-2">
                    {labUrls.length > 1 && (
                      <Badge variant="secondary">
                        {currentDiagramIndex + 1} of {labUrls.length}
                      </Badge>
                    )}
                    {/* Fullscreen button for mobile */}
                    <button
                      onClick={() => {
                        const iframe = document.querySelector(`#drill-diagram-${drill.id}`) as HTMLIFrameElement
                        if (iframe) {
                          // Handle different browser implementations
                          if (iframe.requestFullscreen) {
                            iframe.requestFullscreen()
                          } else if ((iframe as any).webkitRequestFullscreen) {
                            // Safari/iOS
                            (iframe as any).webkitRequestFullscreen()
                          } else if ((iframe as any).mozRequestFullScreen) {
                            // Firefox
                            (iframe as any).mozRequestFullScreen()
                          } else if ((iframe as any).msRequestFullscreen) {
                            // IE/Edge
                            (iframe as any).msRequestFullscreen()
                          } else {
                            // Fallback: open in new window
                            window.open(labUrls[currentDiagramIndex], '_blank')
                          }
                        }
                      }}
                      className="p-2 bg-white hover:bg-gray-100 rounded-lg shadow-md border border-gray-200"
                      aria-label="Fullscreen"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {labUrls.length > 0 ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Iframe Container - Takes up available space */}
                    <div className="flex-1 relative bg-white rounded-lg border border-gray-200">
                      {/* Loading Overlay */}
                      {isDiagramLoading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20 pointer-events-none">
                          <div className="text-center pointer-events-none">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#003366]" />
                            <p className="text-sm text-gray-600 mt-2">Loading diagram...</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Iframe - Full height and width */}
                      <iframe
                        id={`drill-diagram-${drill.id}`}
                        key={labUrls[currentDiagramIndex]}
                        src={labUrls[currentDiagramIndex]}
                        className="absolute inset-0 w-full h-full"
                        onLoad={() => setIsDiagramLoading(false)}
                        title={`Drill Diagram ${currentDiagramIndex + 1}`}
                        allow="fullscreen; autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-pointer-lock"
                        style={{ pointerEvents: 'auto', zIndex: 1 }}
                      />
                    </div>
                    
                    {/* Navigation Controls at Bottom */}
                    {labUrls.length > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-4 flex-shrink-0">
                        {/* Left Arrow */}
                        <button
                          onClick={() => {
                            setIsDiagramLoading(true)
                            setCurrentDiagramIndex((prev) => (prev - 1 + labUrls.length) % labUrls.length)
                          }}
                          className="p-2 bg-white hover:bg-gray-100 rounded-full shadow-md border border-gray-200 transition-all"
                          aria-label="Previous diagram"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        
                        {/* Dots Navigation */}
                        <div className="flex gap-2">
                          {labUrls.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setIsDiagramLoading(true)
                                setCurrentDiagramIndex(index)
                              }}
                              className={`h-2 w-2 rounded-full transition-all ${
                                index === currentDiagramIndex
                                  ? 'bg-[#003366] w-8'
                                  : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                              aria-label={`Go to diagram ${index + 1}`}
                            />
                          ))}
                        </div>
                        
                        {/* Right Arrow */}
                        <button
                          onClick={() => {
                            setIsDiagramLoading(true)
                            setCurrentDiagramIndex((prev) => (prev + 1) % labUrls.length)
                          }}
                          className="p-2 bg-white hover:bg-gray-100 rounded-full shadow-md border border-gray-200 transition-all"
                          aria-label="Next diagram"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-lg p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      <Target className="h-10 w-10 text-green-600" />
                    </div>
                    <p className="text-green-800 font-medium">{drill.title} Diagram</p>
                    <p className="text-green-600 text-sm mt-2">Interactive field diagram would load here</p>
                  </div>
                )}
              </div>
            </TabsContent>
            )}

            {/* Video Tab with Thumbnail */}
            {hasVideo && (
            <TabsContent value="video" className="px-6 py-4 mt-0">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Instructional Video</h3>
                {embedUrl ? (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    {/* Thumbnail with Play Button Overlay */}
                    {!isVideoPlaying && drill?.thumbnail_url && (
                      <div 
                        className="absolute top-0 left-0 w-full h-full rounded-lg bg-black cursor-pointer z-10"
                        onClick={() => setIsVideoPlaying(true)}
                      >
                        <img 
                          src={drill.thumbnail_url} 
                          alt="Video thumbnail"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                            <Play className="h-8 w-8 text-gray-900 ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Video iframe */}
                    <iframe
                      src={isVideoPlaying || !drill?.thumbnail_url ? embedUrl : ''}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      allowFullScreen
                      title="Drill Video"
                      style={{ display: isVideoPlaying || !drill?.thumbnail_url ? 'block' : 'none' }}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-900 rounded-lg p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                      <Play className="h-10 w-10 text-white" />
                    </div>
                    <p className="text-white font-medium">{drill.title}</p>
                    <p className="text-gray-400 text-sm mt-2">Video demonstration</p>
                  </div>
                )}
              </div>
            </TabsContent>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}