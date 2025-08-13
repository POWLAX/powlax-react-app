'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Download, 
  Eye, 
  FileText, 
  Video, 
  Link as LinkIcon,
  File,
  Clock,
  Users,
  MoreVertical,
  Folder,
  Share2,
  Bookmark
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useResourceFavorites } from '@/hooks/useResourceFavorites'
import type { Resource } from '@/lib/resources-data-provider'
import { toast } from 'sonner'

interface ResourceCardProps {
  resource: Resource
  onClick: () => void
  isFavorite?: boolean
  isCompact?: boolean
  showActions?: boolean
  className?: string
}

export default function ResourceCard({
  resource,
  onClick,
  isFavorite: propIsFavorite,
  isCompact = false,
  showActions = true,
  className = ''
}: ResourceCardProps) {
  const { toggleFavorite, isFavorite: checkIsFavorite } = useResourceFavorites()
  const [isHovered, setIsHovered] = useState(false)
  
  // Use prop if provided, otherwise check from hook
  const favorited = propIsFavorite !== undefined ? propIsFavorite : checkIsFavorite(resource.id)

  // Get resource type icon
  const getResourceIcon = () => {
    switch (resource.resource_type) {
      case 'video': return Video
      case 'pdf': return FileText
      case 'link': return LinkIcon
      case 'template': return File
      default: return File
    }
  }

  const ResourceIcon = getResourceIcon()

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const mb = bytes / 1000000
    return `${mb.toFixed(1)} MB`
  }

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return ''
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Handle quick favorite toggle
  const handleQuickFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    await toggleFavorite(resource.id, 'resource')
  }

  // Handle download
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    if (resource.url) {
      window.open(resource.url, '_blank')
      toast.success('Download started')
    }
  }

  // Compact view for list display
  if (isCompact) {
    return (
      <div 
        className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-all cursor-pointer ${className}`}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${resource.is_mock ? 'bg-gray-100' : 'bg-blue-50'}`}>
            <ResourceIcon className={`h-5 w-5 ${resource.is_mock ? 'text-gray-500' : 'text-blue-600'}`} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              {resource.title}
              {favorited && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
            </h4>
            <div className="flex items-center gap-4 mt-1">
              <Badge variant="outline" className="text-xs">
                {resource.category}
              </Badge>
              {resource.rating && (
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="h-3 w-3 text-yellow-400 mr-1" />
                  {resource.rating}
                </div>
              )}
              <span className="text-sm text-gray-500">
                {formatDuration(resource.duration_seconds) || 
                 formatFileSize(resource.file_size) || 
                 `${resource.views_count || 0} views`}
              </span>
              {resource.is_mock && (
                <Badge variant="secondary" className="text-xs">
                  Sample
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {showActions && isHovered && (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleQuickFavorite}
            >
              <Star className={`h-4 w-4 ${favorited ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            {resource.url && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  // Full card view
  return (
    <Card 
      className={`hover:shadow-lg transition-all cursor-pointer relative overflow-hidden ${className} ${
        resource.is_mock ? 'border-dashed border-gray-300 bg-gray-50' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail or Icon Header */}
      <div className="relative h-32 bg-gradient-to-br from-blue-50 to-blue-100">
        {resource.thumbnail_url ? (
          <img 
            src={resource.thumbnail_url} 
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ResourceIcon className={`h-12 w-12 ${resource.is_mock ? 'text-gray-400' : 'text-blue-600'}`} />
          </div>
        )}
        
        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge variant="secondary" className="bg-white/90">
            {resource.resource_type}
          </Badge>
          {resource.is_mock && (
            <Badge variant="outline" className="bg-white/90">
              Mock
            </Badge>
          )}
        </div>

        {/* Favorite indicator */}
        {favorited && (
          <div className="absolute top-2 right-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          </div>
        )}

        {/* Quick actions on hover */}
        {showActions && isHovered && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation()
                handleQuickFavorite(e)
              }}
            >
              <Star className={`h-4 w-4 ${favorited ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            {resource.url && (
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title and Description */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {resource.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {resource.description}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {resource.category}
          </Badge>
          {resource.age_groups && resource.age_groups.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Ages: {resource.age_groups[0]}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {resource.rating && (
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                {resource.rating.toFixed(1)}
              </div>
            )}
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {resource.views_count || 0}
            </div>
            {resource.downloads_count && resource.downloads_count > 0 && (
              <div className="flex items-center">
                <Download className="h-3 w-3 mr-1" />
                {resource.downloads_count}
              </div>
            )}
          </div>
          
          {/* More actions menu */}
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  onClick()
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  handleQuickFavorite(e as any)
                }}>
                  <Star className="h-4 w-4 mr-2" />
                  {favorited ? 'Remove from Favorites' : 'Add to Favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  <Folder className="h-4 w-4 mr-2" />
                  Add to Collection
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {resource.url && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(e as any)
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(`${window.location.origin}/resources/${resource.id}`)
                  toast.success('Link copied!')
                }}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Duration or Size */}
        {(resource.duration_seconds || resource.file_size) && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {formatDuration(resource.duration_seconds) || formatFileSize(resource.file_size)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}