'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, Video, AlertCircle } from 'lucide-react'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  drill: {
    title?: string
    name?: string
    videoUrl?: string
    drill_video_url?: string
  }
}

export default function VideoModal({ isOpen, onClose, drill }: VideoModalProps) {
  const [videoError, setVideoError] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Get the video URL from either field (with null safety)
  const videoUrl = drill?.videoUrl || drill?.drill_video_url

  useEffect(() => {
    setIsLoading(true)
    
    if (!drill || !videoUrl) {
      setVideoError(true)
      setIsLoading(false)
      return
    }

    // Convert various video URL formats to embed URLs
    const convertToEmbedUrl = (url: string) => {
      setVideoError(false)
      
      // Vimeo URLs
      if (url.includes('vimeo.com')) {
        const vimeoId = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/)?.[1]
        if (vimeoId) {
          return `https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0&app_id=58479`
        }
      }
      
      // YouTube URLs
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = ''
        if (url.includes('youtube.com/watch')) {
          videoId = url.match(/[?&]v=([^&]+)/)?.[1] || ''
        } else if (url.includes('youtu.be/')) {
          videoId = url.match(/youtu\.be\/([^?]+)/)?.[1] || ''
        }
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
        }
      }
      
      // If it's already an embed URL or unknown format, return as is
      if (url.includes('embed') || url.includes('player')) {
        return url
      }
      
      // Unknown format
      setVideoError(true)
      return ''
    }

    const embed = convertToEmbedUrl(videoUrl)
    setEmbedUrl(embed)
    
    // Reset loading state when modal closes
    if (!isOpen) {
      setIsLoading(true)
    }
  }, [videoUrl, isOpen, drill])

  const handleOpenInNewTab = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] z-50 bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#003366]">
            <Video className="h-5 w-5" />
            {drill?.name || 'Drill'} - Video
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Watch the drill demonstration video
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!videoUrl ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div className="space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-[#003366]">No video available for this drill</p>
              </div>
            </div>
          ) : videoError ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-8 text-center">
                <div className="space-y-2">
                  <AlertCircle className="h-8 w-8 mx-auto text-red-400" />
                  <p className="text-[#003366]">Unable to load video player</p>
                  <p className="text-sm text-gray-500">The video format may not be supported for embedding</p>
                </div>
              </div>
              <div className="flex justify-center">
                <Button onClick={handleOpenInNewTab} variant="outline" className="bg-gray-100 hover:bg-gray-200 text-[#003366] border-gray-300">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Video in New Tab
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden z-40">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                      <p className="text-white mt-2">Loading video...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full z-50"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${drill.title || drill.name} drill video`}
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false)
                    setVideoError(true)
                  }}
                />
              </div>
              <div className="flex justify-center">
                <Button onClick={handleOpenInNewTab} variant="outline" size="sm" className="bg-gray-100 hover:bg-gray-200 text-[#003366] border-gray-300">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}