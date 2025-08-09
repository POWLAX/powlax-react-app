'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Star, BookOpen, Play, Target } from 'lucide-react'

interface Drill {
  id: string
  name: string
  duration: number
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
}

interface StudyDrillModalProps {
  isOpen: boolean
  onClose: () => void
  drill: Drill | null
  onUpdateDrill?: (drill: Drill) => void
}

export default function StudyDrillModal({ isOpen, onClose, drill, onUpdateDrill }: StudyDrillModalProps) {
  const [embedUrl, setEmbedUrl] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [tempNotes, setTempNotes] = useState(drill?.notes || '')
  
  useEffect(() => {
    if (!drill) return
    setTempNotes(drill.notes || '')
    setEditingNotes(false)
    
    const videoUrl = drill.videoUrl || drill.drill_video_url
    if (!videoUrl) {
      setEmbedUrl('')
      return
    }
    
    // Convert YouTube URLs to embed format
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      let videoId = ''
      if (videoUrl.includes('youtube.com/watch')) {
        videoId = videoUrl.match(/[?&]v=([^&]+)/)?.[1] || ''
      } else if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.match(/youtu\.be\/([^?]+)/)?.[1] || ''
      }
      if (videoId) {
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}?rel=0`)
      }
    } else if (videoUrl.includes('vimeo.com')) {
      const vimeoId = videoUrl.match(/vimeo\.com\/(?:.*\/)?(\d+)/)?.[1]
      if (vimeoId) {
        setEmbedUrl(`https://player.vimeo.com/video/${vimeoId}`)
      }
    } else {
      setEmbedUrl(videoUrl)
    }
  }, [drill])

  if (!drill) return null

  // Get Lab URLs
  const getLabUrls = () => {
    const urls: string[] = []
    
    if (drill.labUrl) urls.push(drill.labUrl)
    if (drill.lacrosse_lab_urls && Array.isArray(drill.lacrosse_lab_urls)) {
      urls.push(...drill.lacrosse_lab_urls.filter(Boolean))
    }
    if (typeof drill.lab_urls === 'string') {
      try {
        const parsed = JSON.parse(drill.lab_urls)
        if (Array.isArray(parsed)) urls.push(...parsed.filter(Boolean))
      } catch {}
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5" />
            {drill.name}
          </DialogTitle>
          <button 
            onClick={() => {/* TODO: Add favorite functionality */}}
            className="absolute top-6 right-12 p-1 hover:bg-gray-100 rounded"
          >
            <Star className="h-5 w-5 text-gray-400" />
          </button>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className={`grid w-full px-6 ${availableTabs.length === 3 ? 'grid-cols-3' : availableTabs.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {availableTabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
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
                            onUpdateDrill({ ...drill, notes: tempNotes })
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
                    {drill.notes ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{drill.notes}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">+ Add Notes</p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Diagram Tab - Only show if content exists */}
            {hasDiagram && (
            <TabsContent value="diagram" className="px-6 py-4 mt-0">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Field Diagram</h3>
                {labUrls.length > 0 ? (
                  <div className="flex justify-center">
                    <iframe
                      src={labUrls[0]}
                      className="aspect-square w-full max-w-[500px] rounded-lg border border-gray-200"
                      title="Drill Diagram"
                    />
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-lg p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      <Target className="h-10 w-10 text-green-600" />
                    </div>
                    <p className="text-green-800 font-medium">{drill.name} Diagram</p>
                    <p className="text-green-600 text-sm mt-2">Interactive field diagram would load here</p>
                  </div>
                )}
              </div>
            </TabsContent>
            )}

            {/* Video Tab - Only show if content exists */}
            {hasVideo && (
            <TabsContent value="video" className="px-6 py-4 mt-0">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Instructional Video</h3>
                {embedUrl ? (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={embedUrl}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      allowFullScreen
                      title="Drill Video"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-900 rounded-lg p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                      <Play className="h-10 w-10 text-white" />
                    </div>
                    <p className="text-white font-medium">{drill.name}</p>
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