'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, Users, BookOpen, AlertCircle, Star, Play, Image, Plus } from 'lucide-react'

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
}

interface StudyStrategyModalProps {
  isOpen: boolean
  onClose: () => void
  strategy: Strategy
}

export default function StudyStrategyModal({ isOpen, onClose, strategy }: StudyStrategyModalProps) {
  const [embedUrl, setEmbedUrl] = useState('')
  
  // Parse implementation steps from string
  const implementationSteps = strategy.implementation_steps || 
    (strategy.detailed_description?.split('\n').filter(step => step.trim()) || [])
  
  // Process video URL for embedding
  useEffect(() => {
    if (!strategy?.vimeo_link) {
      setEmbedUrl('')
      return
    }
    
    const videoUrl = strategy.vimeo_link
    
    // Convert Vimeo URLs to embed format
    if (videoUrl.includes('vimeo.com')) {
      const vimeoId = videoUrl.match(/vimeo\.com\/(?:.*\/)?(\d+)/)?.[1]
      if (vimeoId) {
        setEmbedUrl(`https://player.vimeo.com/video/${vimeoId}`)
      }
    } else if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      let videoId = ''
      if (videoUrl.includes('youtube.com/watch')) {
        videoId = videoUrl.match(/[?&]v=([^&]+)/)?.[1] || ''
      } else if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.match(/youtu\.be\/([^?]+)/)?.[1] || ''
      }
      if (videoId) {
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}?rel=0`)
      }
    } else {
      setEmbedUrl(videoUrl)
    }
  }, [strategy])
  
  // Get Lab URLs for diagrams
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
  
  // Get image URLs
  const getImageUrls = () => {
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
  const imageUrls = getImageUrls()
  const hasVideo = !!embedUrl
  const hasDiagram = labUrls.length > 0
  const hasImages = imageUrls.length > 0
  
  // Determine available tabs
  const availableTabs = [
    { value: 'overview', label: 'Overview', show: true },
    { value: 'diagram', label: 'Diagram', show: hasDiagram },
    { value: 'video', label: 'Video', show: hasVideo },
    { value: 'images', label: 'Images', show: hasImages },
    { value: 'implementation', label: 'Implementation', show: implementationSteps.length > 0 }
  ].filter(tab => tab.show)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {/* TODO: Add to plan functionality */}}
                className="p-1.5 border border-gray-300 hover:bg-gray-50 rounded transition-colors"
                title="Add to Practice Plan"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
              <DialogTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {strategy.strategy_name}
              </DialogTitle>
            </div>
            <button 
              onClick={() => {/* TODO: Add favorite functionality */}}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Add to Favorites"
            >
              <Star className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
            </button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className={`grid w-full px-6 ${availableTabs.length >= 5 ? 'grid-cols-5' : availableTabs.length === 4 ? 'grid-cols-4' : availableTabs.length === 3 ? 'grid-cols-3' : availableTabs.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {availableTabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
            <TabsContent value="overview" className="px-6 py-4 space-y-4 mt-0">
              {/* Strategy Details Card */}
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#003366] font-semibold">Strategy Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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

            {/* Diagram Tab */}
            {hasDiagram && (
              <TabsContent value="diagram" className="px-6 py-4 mt-0">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Field Diagram</h3>
                  {labUrls[0] ? (
                    <div className="flex justify-center">
                      <iframe
                        src={labUrls[0]}
                        className="aspect-square w-full max-w-[500px] rounded-lg border border-gray-200"
                        title="Strategy Diagram"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center border border-green-200">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-green-200 rounded-full mx-auto flex items-center justify-center">
                          <Target className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-green-700 font-medium">2-2-2 Set Diagram</p>
                        <p className="text-green-600 text-sm">Interactive field diagram would load here</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            {/* Video Tab */}
            {hasVideo && (
              <TabsContent value="video" className="px-6 py-4 mt-0">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Instructional Video</h3>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      title="Strategy Video"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Images Tab */}
            {hasImages && (
              <TabsContent value="images" className="px-6 py-4 mt-0">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Strategy Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={url}
                          alt={`Strategy Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Implementation Tab - Now appears after conditional tabs */}
            {implementationSteps.length > 0 && (
              <TabsContent value="implementation" className="px-6 py-4 space-y-4 mt-0">
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
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}