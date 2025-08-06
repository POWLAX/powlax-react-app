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
    name: string
    videoUrl?: string
    drill_video_url?: string
  }
}

export default function VideoModal({ isOpen, onClose, drill }: VideoModalProps) {
  const [videoError, setVideoError] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')

  // Get the video URL from either field
  const videoUrl = drill.videoUrl || drill.drill_video_url

  useEffect(() => {
    if (!videoUrl) {
      setVideoError(true)
      return
    }

    // Convert various video URL formats to embed URLs
    const convertToEmbedUrl = (url: string) => {
      setVideoError(false)
      
      // Vimeo URLs
      if (url.includes('vimeo.com')) {
        const vimeoId = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/)?.[1]
        if (vimeoId) {
          return `https://player.vimeo.com/video/${vimeoId}?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479`
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
  }, [videoUrl])

  const handleOpenInNewTab = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] sm:max-h-[85vh] z-[110] p-0 sm:p-6">
        <DialogHeader className="px-4 pt-4 sm:px-0 sm:pt-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Video className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span className="truncate">{drill.name}</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Watch the drill demonstration video
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-4 sm:px-0 sm:pb-0 space-y-3 sm:space-y-4">
          {!videoUrl ? (
            <div className="flex items-center justify-center p-6 sm:p-8 text-center">
              <div className="space-y-2">
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-gray-400" />
                <p className="text-sm sm:text-base text-gray-600">No video available for this drill</p>
              </div>
            </div>
          ) : videoError ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-center p-6 sm:p-8 text-center">
                <div className="space-y-2">
                  <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-red-400" />
                  <p className="text-sm sm:text-base text-gray-600">Unable to load video player</p>
                  <p className="text-xs sm:text-sm text-gray-500">The video format may not be supported for embedding</p>
                </div>
              </div>
              <div className="flex justify-center">
                <Button onClick={handleOpenInNewTab} variant="outline" size="sm" className="sm:size-default">
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Open Video in New Tab
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  title={`${drill.name} drill video`}
                />
              </div>
              <div className="flex justify-center">
                <Button onClick={handleOpenInNewTab} variant="outline" size="sm" className="text-xs sm:text-sm">
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
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