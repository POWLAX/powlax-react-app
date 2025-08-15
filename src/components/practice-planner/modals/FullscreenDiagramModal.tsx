'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Beaker, Loader2 } from 'lucide-react'

interface FullscreenDiagramModalProps {
  isOpen: boolean
  onClose: () => void
  labUrls: string[]           // All diagram URLs
  currentIndex: number        // Current diagram index
  drill: any                  // Drill object for title
}

export default function FullscreenDiagramModal({
  isOpen,
  onClose,
  labUrls,
  currentIndex: initialIndex,
  drill
}: FullscreenDiagramModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isLoading, setIsLoading] = useState(true)

  // Sync with parent's currentIndex
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  // URL processing
  const getEmbedUrl = (url: string): string => {
    if (url.includes('embed/')) return url
    const match = url.match(/(?:share\/|id=)([a-zA-Z0-9_-]+)/)
    if (match) {
      return `https://embed.lacrosselab.com/${match[1]}`
    }
    return url
  }

  // Navigation handlers
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % labUrls.length)
    setIsLoading(true)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + labUrls.length) % labUrls.length)
    setIsLoading(true)
  }

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
    setIsLoading(true)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          if (labUrls.length > 1) handlePrevious()
          break
        case 'ArrowRight':
          event.preventDefault()
          if (labUrls.length > 1) handleNext()
          break
        case 'Escape':
          event.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, labUrls.length])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full bg-white p-0 m-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-white">
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5 text-[#003366]" />
            <span className="text-[#003366] font-bold">
              {drill?.title || drill?.name || 'Drill'} - Lacrosse Lab Diagrams
            </span>
          </DialogTitle>
          {labUrls.length > 1 && (
            <DialogDescription>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {currentIndex + 1} of {labUrls.length} diagrams
              </Badge>
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-[calc(100vh-140px)]">
          {/* Iframe Container with Navigation */}
          <div className="relative flex-1 bg-white">
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-[#003366]" />
              </div>
            )}
            
            {/* Iframe */}
            <iframe
              src={getEmbedUrl(labUrls[currentIndex])}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              title={`Lacrosse Lab Diagram ${currentIndex + 1}`}
              allow="fullscreen; autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-pointer-lock"
            />
            
            {/* Navigation Arrows (only if multiple diagrams) */}
            {labUrls.length > 1 && (
              <>
                <button 
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg z-20"
                  aria-label="Previous diagram"
                >
                  <ChevronLeft className="h-6 w-6 text-[#003366]" />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg z-20"
                  aria-label="Next diagram"
                >
                  <ChevronRight className="h-6 w-6 text-[#003366]" />
                </button>
              </>
            )}
          </div>
          
          {/* Bottom Navigation */}
          <div className="p-4 border-t bg-white">
            {/* Dots Navigation (only if multiple diagrams) */}
            {labUrls.length > 1 && (
              <div className="flex justify-center gap-2 mb-4">
                {labUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex 
                        ? 'bg-[#003366] w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to diagram ${index + 1}`}
                  />
                ))}
              </div>
            )}
            
            {/* Instructions */}
            <div className="text-center text-sm text-gray-600">
              <p>
                {labUrls.length > 1 
                  ? 'Use arrow keys, navigation arrows, or dots to navigate • Press Escape to close'
                  : 'Press Escape to close fullscreen'
                }
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}