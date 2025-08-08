'use client'

import { Video, Image, Beaker, X } from 'lucide-react'
import { useState } from 'react'
import VideoModal from './modals/VideoModal'
import LacrosseLabModal from './modals/LacrosseLabModal'

interface Strategy {
  id: string
  strategy_name: string
  strategy_categories?: string
  vimeo_link?: string
  lacrosse_lab_links?: any
  thumbnail_urls?: any
}

interface StrategyCardProps {
  strategy: Strategy
  gamePhase: string
  onRemove: (id: string) => void
  isMobile?: boolean
}

export default function StrategyCard({ 
  strategy, 
  gamePhase, 
  onRemove,
  isMobile = false 
}: StrategyCardProps) {
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showLabModal, setShowLabModal] = useState(false)

  const hasVideo = !!strategy.vimeo_link

  const hasLabUrls = () => {
    if (!strategy.lacrosse_lab_links) return false
    
    try {
      const links = typeof strategy.lacrosse_lab_links === 'string' 
        ? JSON.parse(strategy.lacrosse_lab_links)
        : strategy.lacrosse_lab_links
      
      if (Array.isArray(links)) {
        return links.some(url => url && url.trim())
      }
      return false
    } catch {
      return false
    }
  }

  const hasThumbnails = () => {
    if (!strategy.thumbnail_urls) return false
    
    try {
      const urls = typeof strategy.thumbnail_urls === 'string'
        ? JSON.parse(strategy.thumbnail_urls)
        : strategy.thumbnail_urls
      
      if (Array.isArray(urls)) {
        return urls.some(url => url && url.trim())
      }
      return false
    } catch {
      return false
    }
  }

  if (isMobile) {
    // Mobile layout - similar to drill cards in library
    return (
      <div className="bg-white border rounded-lg p-3 mb-2">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm">{strategy.strategy_name}</h4>
            <p className="text-xs text-gray-500">{gamePhase}</p>
          </div>
          <button
            onClick={() => onRemove(strategy.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {hasVideo && (
            <button
              onClick={() => setShowVideoModal(true)}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="View Video"
            >
              <Video className="h-4 w-4 text-gray-600" />
            </button>
          )}
          
          {hasThumbnails() && (
            <button
              className="p-1.5 hover:bg-gray-100 rounded"
              title="View Images"
            >
              <Image className="h-4 w-4 text-gray-600" />
            </button>
          )}
          
          {hasLabUrls() && (
            <button
              onClick={() => setShowLabModal(true)}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Lacrosse Lab"
            >
              <Beaker className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* Modals */}
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          drill={{
            name: strategy.strategy_name,
            videoUrl: strategy.vimeo_link
          }}
        />
        
        <LacrosseLabModal
          isOpen={showLabModal}
          onClose={() => setShowLabModal(false)}
          drill={{
            name: strategy.strategy_name,
            lab_urls: strategy.lacrosse_lab_links
          }}
        />
      </div>
    )
  }

  // Desktop layout - thin cards
  return (
    <div className="bg-white border rounded px-3 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 font-medium">{gamePhase}</span>
        <span className="font-medium text-sm">{strategy.strategy_name}</span>
      </div>
      
      <div className="flex items-center gap-1">
        {hasVideo && (
          <button
            onClick={() => setShowVideoModal(true)}
            className="p-1 hover:bg-gray-100 rounded"
            title="View Video"
          >
            <Video className="h-3.5 w-3.5 text-gray-600" />
          </button>
        )}
        
        {hasThumbnails() && (
          <button
            className="p-1 hover:bg-gray-100 rounded"
            title="View Images"
          >
            <Image className="h-3.5 w-3.5 text-gray-600" />
          </button>
        )}
        
        {hasLabUrls() && (
          <button
            onClick={() => setShowLabModal(true)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Lacrosse Lab"
          >
            <Beaker className="h-3.5 w-3.5 text-gray-600" />
          </button>
        )}
        
        <button
          onClick={() => onRemove(strategy.id)}
          className="p-1 hover:bg-gray-100 rounded ml-2"
        >
          <X className="h-3.5 w-3.5 text-gray-500" />
        </button>
      </div>

      {/* Modals */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        drill={{
          name: strategy.strategy_name,
          videoUrl: strategy.vimeo_link
        }}
      />
      
      <LacrosseLabModal
        isOpen={showLabModal}
        onClose={() => setShowLabModal(false)}
        drill={{
          name: strategy.strategy_name,
          lab_urls: strategy.lacrosse_lab_links
        }}
      />
    </div>
  )
}