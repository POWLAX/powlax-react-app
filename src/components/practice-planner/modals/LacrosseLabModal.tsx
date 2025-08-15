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
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ExternalLink, Beaker, Loader2 } from 'lucide-react'
import FullscreenDiagramModal from './FullscreenDiagramModal'

interface LacrosseLabModalProps {
  isOpen: boolean
  onClose: () => void
  drill: {
    title?: string
    name?: string
    drill_lab_url_1?: string
    drill_lab_url_2?: string
    drill_lab_url_3?: string
    drill_lab_url_4?: string
    drill_lab_url_5?: string
    lacrosse_lab_urls?: string[]
    lab_urls?: string[] | string  // JSONB field that could be string or array
  }
}

// Utility function to check if drill has lab URLs
export const hasLabUrls = (drill: {
  lab_urls?: string[] | string
  lacrosse_lab_urls?: string[]
  drill_lab_url_1?: string
  drill_lab_url_2?: string
  drill_lab_url_3?: string
  drill_lab_url_4?: string
  drill_lab_url_5?: string
}): boolean => {
  // Check lab_urls JSONB field
  if (drill.lab_urls) {
    if (Array.isArray(drill.lab_urls)) {
      return drill.lab_urls.some(url => url && url.trim())
    } else if (typeof drill.lab_urls === 'string') {
      try {
        const parsed = JSON.parse(drill.lab_urls)
        if (Array.isArray(parsed)) {
          return parsed.some(url => url && url.trim())
        } else if (typeof parsed === 'string') {
          return parsed.trim() !== ''
        }
      } catch (e) {
        // If it's not JSON, treat as single URL
        return drill.lab_urls.trim() !== ''
      }
    }
  }
  
  // Check individual lab URL fields
  if (drill.drill_lab_url_1 || drill.drill_lab_url_2 || drill.drill_lab_url_3 || 
      drill.drill_lab_url_4 || drill.drill_lab_url_5) {
    return true
  }
  
  // Check lacrosse_lab_urls array
  if (drill.lacrosse_lab_urls && Array.isArray(drill.lacrosse_lab_urls)) {
    return drill.lacrosse_lab_urls.some(url => url && url.trim())
  }
  
  return false
}

export default function LacrosseLabModal({ isOpen, onClose, drill }: LacrosseLabModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showFullscreen, setShowFullscreen] = useState(false)
  
  // Collect all Lacrosse Lab URLs
  const labUrls: string[] = []
  
  // First check lab_urls JSONB field (from database screenshot)
  if (drill.lab_urls) {
    if (Array.isArray(drill.lab_urls)) {
      // It's already an array
      drill.lab_urls.forEach(url => {
        if (url && url.trim() && !labUrls.includes(url.trim())) {
          labUrls.push(url.trim())
        }
      })
    } else if (typeof drill.lab_urls === 'string') {
      // It's a JSONB string, try to parse it
      try {
        const parsed = JSON.parse(drill.lab_urls)
        if (Array.isArray(parsed)) {
          parsed.forEach(url => {
            if (url && url.trim() && !labUrls.includes(url.trim())) {
              labUrls.push(url.trim())
            }
          })
        } else if (typeof parsed === 'string') {
          // Single URL string
          if (parsed.trim()) {
            labUrls.push(parsed.trim())
          }
        }
      } catch (e) {
        // If JSON parsing fails, treat as single URL
        if (drill.lab_urls.trim()) {
          labUrls.push(drill.lab_urls.trim())
        }
      }
    }
  }
  
  // Add individual lab URLs if no lab_urls array
  if (labUrls.length === 0) {
    if (drill.drill_lab_url_1) labUrls.push(drill.drill_lab_url_1)
    if (drill.drill_lab_url_2) labUrls.push(drill.drill_lab_url_2)
    if (drill.drill_lab_url_3) labUrls.push(drill.drill_lab_url_3)
    if (drill.drill_lab_url_4) labUrls.push(drill.drill_lab_url_4)
    if (drill.drill_lab_url_5) labUrls.push(drill.drill_lab_url_5)
  }
  
  // Add array of lab URLs if available
  if (drill.lacrosse_lab_urls && Array.isArray(drill.lacrosse_lab_urls)) {
    drill.lacrosse_lab_urls.forEach(url => {
      if (url && url.trim() && !labUrls.includes(url.trim())) {
        labUrls.push(url.trim())
      }
    })
  }

  useEffect(() => {
    // Reset to first lab when modal opens
    setCurrentIndex(0)
    setIsLoading(true)
  }, [isOpen])

  const handlePrevious = () => {
    setIsLoading(true)
    setCurrentIndex((prev) => (prev - 1 + labUrls.length) % labUrls.length)
  }

  const handleNext = () => {
    setIsLoading(true)
    setCurrentIndex((prev) => (prev + 1) % labUrls.length)
  }

  const handleDotClick = (index: number) => {
    setIsLoading(true)
    setCurrentIndex(index)
  }

  const handleOpenFullscreen = () => {
    if (labUrls[currentIndex]) {
      setShowFullscreen(true)
    }
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  // Convert URL to proper embed format
  const getEmbedUrl = (url: string) => {
    if (!url) return ''
    
    // If it's already a play URL, return as is
    if (url.includes('lacrosse.labradorsports.com/play?l=')) {
      return url
    }
    
    // If it's a Lacrosse Lab URL with an ID, extract it
    if (url.includes('lacrosse.labradorsports.com')) {
      const idMatch = url.match(/[?&]l=([^&]+)/)
      if (idMatch) {
        return `https://lacrosse.labradorsports.com/play?l=${idMatch[1]}`
      }
      // If no ID found, try to extract from path
      const pathMatch = url.match(/\/([A-Za-z0-9]+)\/?$/)
      if (pathMatch) {
        return `https://lacrosse.labradorsports.com/play?l=${pathMatch[1]}`
      }
    }
    
    // If it looks like just an ID, wrap it in the full URL
    if (url.match(/^[A-Za-z0-9]+$/)) {
      return `https://lacrosse.labradorsports.com/play?l=${url}`
    }
    
    // Return original URL if we can't parse it
    return url
  }

  if (labUrls.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#003366]">
              <Beaker className="h-5 w-5" />
              {drill.title || drill.name} - Lacrosse Lab
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <p className="text-[#003366]">No Lacrosse Lab diagrams available for this drill</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-6xl max-h-[95vh] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            {drill.title || drill.name} - Lacrosse Lab Diagrams
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between text-gray-600">
            <span>Interactive drill diagrams and field setups</span>
            <Badge variant="secondary">
              {currentIndex + 1} of {labUrls.length}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Carousel Container */}
          <div className="relative bg-white rounded-lg overflow-hidden shadow-inner">
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#003366]" />
                  <p className="text-sm text-gray-600 mt-2">Loading diagram...</p>
                </div>
              </div>
            )}

            {/* Iframe Container - Square aspect ratio */}
            <div className="relative flex justify-center items-center bg-white p-4">
              <iframe
                key={labUrls[currentIndex]} // Force reload on URL change
                src={getEmbedUrl(labUrls[currentIndex])}
                className="aspect-square w-full max-w-[600px] border-0 rounded-lg"
                onLoad={handleIframeLoad}
                title={`Lacrosse Lab Diagram ${currentIndex + 1}`}
                allow="fullscreen; autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-pointer-lock"
                style={{ pointerEvents: 'auto' }}
              />
            </div>

            {/* Navigation Arrows */}
            {labUrls.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                  aria-label="Previous diagram"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                  aria-label="Next diagram"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Dots Navigation */}
          {labUrls.length > 1 && (
            <div className="flex justify-center gap-2">
              {labUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-[#003366] w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to diagram ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              <p>Use arrow keys or click dots to navigate between diagrams</p>
            </div>
            <Button onClick={handleOpenFullscreen} variant="outline" size="sm" className="bg-gray-100 hover:bg-gray-200 text-[#003366] border-gray-300">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Fullscreen
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Fullscreen Modal */}
      <FullscreenDiagramModal
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        labUrls={labUrls}
        currentIndex={currentIndex}
        drill={drill}
      />
    </Dialog>
  )
}