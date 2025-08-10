'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, Users, BookOpen, AlertCircle, Star, Play, Image, Plus, ChevronLeft, ChevronRight, Loader2, Download, Maximize2 } from 'lucide-react'

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
  vimeo_link?: string
  lacrosse_lab_links?: any
  thumbnail_urls?: any
  age_group?: string
  master_pdf_url?: string
}

interface StudyStrategyModalProps {
  isOpen: boolean
  onClose: () => void
  strategy: Strategy
}

export default function StudyStrategyModal({ isOpen, onClose, strategy }: StudyStrategyModalProps) {
  const [embedUrl, setEmbedUrl] = useState('')
  const [currentDiagramIndex, setCurrentDiagramIndex] = useState(0)
  const [isDiagramLoading, setIsDiagramLoading] = useState(true)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Parse implementation steps from string
  const implementationSteps = strategy.implementation_steps || 
    (strategy.detailed_description?.split('\n').filter(step => step.trim()) || [])
  
  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentDiagramIndex(0)
      setIsDiagramLoading(true)
      setIsVideoPlaying(false)
      setActiveTab('overview')
    }
  }, [isOpen])
  
  // Process video URL for embedding
  useEffect(() => {
    if (!strategy?.vimeo_link) {
      setEmbedUrl('')
      return
    }
    
    const videoUrl = strategy.vimeo_link
    
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
  }, [strategy])
  
  // Parse lab URLs
  const getLabUrls = () => {
    if (!strategy?.lacrosse_lab_links) return []
    
    try {
      const links = typeof strategy.lacrosse_lab_links === 'string'
        ? JSON.parse(strategy.lacrosse_lab_links)
        : strategy.lacrosse_lab_links
      
      if (Array.isArray(links)) {
        return links.filter(url => url && url.trim())
      }
      return []
    } catch {
      return []
    }
  }
  
  // Parse thumbnail URLs
  const getThumbnailUrls = () => {
    if (!strategy?.thumbnail_urls) return []
    
    try {
      const urls = typeof strategy.thumbnail_urls === 'string'
        ? JSON.parse(strategy.thumbnail_urls)
        : strategy.thumbnail_urls
      
      if (Array.isArray(urls)) {
        return urls.filter(url => url && url.trim())
      }
      return []
    } catch {
      return []
    }
  }
  
  const labUrls = getLabUrls()
  const thumbnailUrls = getThumbnailUrls()
  const hasVideo = !!embedUrl
  const hasDiagram = labUrls.length > 0
  const hasImages = thumbnailUrls.length > 0
  const hasImplementation = implementationSteps.length > 0
  
  // Get the first thumbnail for video preview
  const videoThumbnail = thumbnailUrls[0]
  
  // Determine available tabs
  const availableTabs = [
    { value: 'overview', label: 'Overview', show: true },
    { value: 'diagram', label: 'Diagram', show: hasDiagram },
    { value: 'video', label: 'Video', show: hasVideo },
    { value: 'images', label: 'Images', show: hasImages },
    { value: 'implementation', label: 'Implementation', show: hasImplementation }
  ].filter(tab => tab.show)
  
  // Calculate modal height based on active tab
  const modalHeight = activeTab === 'diagram' ? 'h-[90vh]' : 'max-h-[85vh]'
  const contentClass = activeTab === 'diagram' ? 'flex flex-col h-full' : ''

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-3xl ${modalHeight} p-0 overflow-hidden bg-white ${contentClass}`}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl pr-48">
            <Target className="h-5 w-5" />
            {strategy?.strategy_name || ''}
          </DialogTitle>
          <div className="absolute top-6 right-6 flex items-center gap-2">
            {strategy?.master_pdf_url && (
              <button 
                onClick={() => window.open(strategy.master_pdf_url, '_blank')}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded"
              >
                <Download className="h-3 w-3" />
                Download Printable Playbook
              </button>
            )}
            <button 
              onClick={() => {/* TODO: Add favorite functionality */}}
              className="p-1.5 hover:bg-gray-100 rounded"
            >
              <Star className="h-6 w-6 text-gray-400 hover:text-yellow-500" />
            </button>
          </div>
        </DialogHeader>

        <Tabs 
          defaultValue="overview" 
          className={activeTab === 'diagram' ? 'flex-1 flex flex-col' : 'flex-1'}
          onValueChange={setActiveTab}
        >
          <TabsList className={`grid w-full px-6 flex-shrink-0 ${
            availableTabs.length === 5 ? 'grid-cols-5' : 
            availableTabs.length === 4 ? 'grid-cols-4' : 
            availableTabs.length === 3 ? 'grid-cols-3' : 
            availableTabs.length === 2 ? 'grid-cols-2' : 
            'grid-cols-1'
          }`}>
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
                      {strategy.strategy_categories || 'Offense'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Complexity</p>
                    <p className="text-sm font-medium">
                      <span className="text-yellow-600">Level {strategy.complexity || '3'}/5</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Age Group</p>
                    <p className="text-sm font-medium">{strategy.age_group || '14U+'}</p>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {strategy.description || strategy.detailed_description || 
                   'A comprehensive strategy for effective team play and ball movement.'}
                </p>
              </div>

              {/* Coaches Notes Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Coaches Notes</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-sm text-gray-500 mr-2">•</span>
                    <span className="text-sm text-gray-700">Quick ball movement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-sm text-gray-500 mr-2">•</span>
                    <span className="text-sm text-gray-700">Pick plays</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-sm text-gray-500 mr-2">•</span>
                    <span className="text-sm text-gray-700">Weak side cutting</span>
                  </li>
                </ul>
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
                          const iframe = document.querySelector(`#strategy-diagram-${strategy.id}`) as HTMLIFrameElement
                          if (iframe && iframe.requestFullscreen) {
                            iframe.requestFullscreen()
                          }
                        }}
                        className="md:hidden p-2 bg-white hover:bg-gray-100 rounded-lg shadow-md border border-gray-200"
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
                          id={`strategy-diagram-${strategy.id}`}
                          key={labUrls[currentDiagramIndex]}
                          src={labUrls[currentDiagramIndex]}
                          className="absolute inset-0 w-full h-full"
                          onLoad={() => setIsDiagramLoading(false)}
                          title={`Strategy Diagram ${currentDiagramIndex + 1}`}
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
                    <div className="aspect-video bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center border border-green-200">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-green-200 rounded-full mx-auto flex items-center justify-center">
                          <Target className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-green-700 font-medium">No Diagram Available</p>
                        <p className="text-green-600 text-sm">Interactive field diagram would load here</p>
                      </div>
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
                      {!isVideoPlaying && videoThumbnail && (
                        <div 
                          className="absolute top-0 left-0 w-full h-full rounded-lg bg-black cursor-pointer z-10"
                          onClick={() => setIsVideoPlaying(true)}
                        >
                          <img 
                            src={videoThumbnail} 
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
                        src={isVideoPlaying || !videoThumbnail ? embedUrl : ''}
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        allowFullScreen
                        title="Strategy Video"
                        style={{ display: isVideoPlaying || !videoThumbnail ? 'block' : 'none' }}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-900 rounded-lg p-12 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                        <Play className="h-10 w-10 text-white" />
                      </div>
                      <p className="text-white font-medium">{strategy.strategy_name}</p>
                      <p className="text-gray-400 text-sm mt-2">Video demonstration</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            {/* Images Tab */}
            {hasImages && (
              <TabsContent value="images" className="px-6 py-4 mt-0">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Strategy Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {thumbnailUrls.map((url, index) => (
                      <img 
                        key={index}
                        src={url} 
                        alt={`Strategy image ${index + 1}`}
                        className="w-full rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Implementation Tab */}
            {hasImplementation && (
              <TabsContent value="implementation" className="px-6 py-4 mt-0">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Implementation Steps</h3>
                  <ol className="space-y-3">
                    {implementationSteps.map((step, index) => (
                      <li key={index} className="flex">
                        <span className="flex-shrink-0 w-7 h-7 bg-[#003366] text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}