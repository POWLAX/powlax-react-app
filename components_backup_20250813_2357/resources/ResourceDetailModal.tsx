'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Star, 
  Download, 
  Share2, 
  ExternalLink, 
  FileText, 
  Video, 
  Link, 
  File,
  Users,
  User,
  Folder,
  Eye,
  Clock,
  Tag,
  ChevronRight,
  Loader2,
  Play,
  X
} from 'lucide-react'
import { useResourceFavorites } from '@/hooks/useResourceFavorites'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { toast } from 'sonner'
import type { Resource } from '@/lib/resources-data-provider'

interface ResourceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  resource: Resource | null
  relatedResources?: Resource[]
}

export default function ResourceDetailModal({ 
  isOpen, 
  onClose, 
  resource,
  relatedResources = []
}: ResourceDetailModalProps) {
  const { user } = useAuth()
  const {
    toggleFavorite,
    isFavorite,
    trackView,
    createCollection,
    shareWithTeams,
    setShareWithTeams,
    teamIds,
    shareWithUsers,
    setShareWithUsers,
    userIds
  } = useResourceFavorites()

  // Local state
  const [activeTab, setActiveTab] = useState('overview')
  const [rating, setRating] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [notes, setNotes] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [videoPlaying, setVideoPlaying] = useState(false)

  // Track view when modal opens
  useEffect(() => {
    if (isOpen && resource?.id) {
      trackView(resource.id)
    }
  }, [isOpen, resource?.id, trackView])

  // Reset state when resource changes
  useEffect(() => {
    if (resource) {
      setActiveTab('overview')
      setVideoPlaying(false)
      setShowShareOptions(false)
      setNotes('')
      setRating(resource.rating || 0)
    }
  }, [resource])

  if (!resource) return null

  // Get resource type icon
  const getResourceIcon = () => {
    switch (resource.resource_type) {
      case 'video': return Video
      case 'pdf': return FileText
      case 'link': return Link
      default: return File
    }
  }

  const ResourceIcon = getResourceIcon()

  // Handle favorite toggle with permanence pattern
  const handleToggleFavorite = async () => {
    if (!user?.id) {
      toast.error('Please log in to save favorites')
      return
    }

    // Use the hook with permanence pattern transformation
    const success = await toggleFavorite(resource.id, 'resource', {
      shareWithTeams,
      shareWithUsers,
      teamIds: shareWithTeams ? teamIds : [],
      userIds: shareWithUsers ? userIds : [],
      tags: selectedTags,
      notes
    })

    if (success && showShareOptions) {
      setShowShareOptions(false)
    }
  }

  // Handle download
  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // Track download in database
      if (user?.id) {
        // This would update the download count
        // await updateDownloadCount(resource.id)
      }

      // Trigger actual download
      if (resource.url) {
        window.open(resource.url, '_blank')
        toast.success('Download started')
      }
    } catch (error) {
      toast.error('Failed to download resource')
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle rating
  const handleRating = (newRating: number) => {
    setRating(newRating)
    // Save rating to database
    // This would update user_resource_interactions
    toast.success(`Rated ${newRating} stars`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <ResourceIcon className="h-5 w-5 text-gray-600" />
                {resource.title}
              </DialogTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary">{resource.category}</Badge>
                <Badge variant="outline">{resource.resource_type}</Badge>
                {resource.age_groups && resource.age_groups.length > 0 && (
                  <Badge variant="outline">Ages: {resource.age_groups.join(', ')}</Badge>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="h-3 w-3" />
                  {resource.views_count || 0}
                </div>
                {resource.downloads_count && resource.downloads_count > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Download className="h-3 w-3" />
                    {resource.downloads_count}
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full px-6 py-0 h-12 bg-gray-50 border-b">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            {resource.resource_type === 'video' && (
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Watch
              </TabsTrigger>
            )}
            {resource.resource_type === 'pdf' && (
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            )}
            <TabsTrigger value="share" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share & Save
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(90vh-200px)]">
            {/* Overview Tab */}
            <TabsContent value="overview" className="px-6 py-4 space-y-4 mt-0">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{resource.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 font-medium">{resource.resource_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium">{resource.category}</span>
                    </div>
                    {resource.file_size && (
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <span className="ml-2 font-medium">
                          {(resource.file_size / 1000000).toFixed(1)} MB
                        </span>
                      </div>
                    )}
                    {resource.duration_seconds && (
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 font-medium">
                          {Math.floor(resource.duration_seconds / 60)}:
                          {(resource.duration_seconds % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rating */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Rating</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {rating > 0 ? `${rating.toFixed(1)} stars` : 'Not rated yet'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Related Resources */}
              {relatedResources.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Related Resources</h3>
                    <div className="space-y-2">
                      {relatedResources.slice(0, 3).map((related) => (
                        <div
                          key={related.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">{related.title}</p>
                              <p className="text-xs text-gray-500">{related.category}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Video Tab */}
            {resource.resource_type === 'video' && (
              <TabsContent value="video" className="px-6 py-4 mt-0">
                <Card>
                  <CardContent className="p-0">
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      {resource.thumbnail_url && !videoPlaying ? (
                        <div 
                          className="relative w-full h-full cursor-pointer"
                          onClick={() => setVideoPlaying(true)}
                        >
                          <img
                            src={resource.thumbnail_url}
                            alt={resource.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                              <Play className="h-8 w-8 text-gray-900 ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {resource.url ? (
                            <iframe
                              src={resource.url}
                              className="w-full h-full"
                              allowFullScreen
                              title={resource.title}
                            />
                          ) : (
                            <p className="text-white">Video not available</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* PDF Preview Tab */}
            {resource.resource_type === 'pdf' && (
              <TabsContent value="preview" className="px-6 py-4 mt-0">
                <Card>
                  <CardContent className="p-4">
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">PDF Preview</p>
                      <Button onClick={handleDownload} disabled={isDownloading}>
                        {isDownloading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Share & Save Tab */}
            <TabsContent value="share" className="px-6 py-4 space-y-4 mt-0">
              {/* Favorite with Sharing Options */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Save to Favorites
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Permanence Pattern: UI Checkboxes */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="share-teams"
                          checked={shareWithTeams}
                          onCheckedChange={(checked) => setShareWithTeams(!!checked)}
                        />
                        <label
                          htmlFor="share-teams"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <Users className="inline h-4 w-4 mr-1" />
                          Share with my teams
                        </label>
                      </div>
                      
                      {shareWithTeams && teamIds.length > 0 && (
                        <div className="ml-6 text-sm text-gray-600">
                          Will be shared with {teamIds.length} team(s)
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="share-users"
                          checked={shareWithUsers}
                          onCheckedChange={(checked) => setShareWithUsers(!!checked)}
                        />
                        <label
                          htmlFor="share-users"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <User className="inline h-4 w-4 mr-1" />
                          Share with specific users
                        </label>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                      <textarea
                        className="w-full p-2 border rounded-md text-sm"
                        rows={3}
                        placeholder="Add notes about this resource..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleToggleFavorite}
                        className={isFavorite(resource.id) ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                      >
                        <Star className={`h-4 w-4 mr-2 ${isFavorite(resource.id) ? 'fill-white' : ''}`} />
                        {isFavorite(resource.id) ? 'Update Favorite' : 'Add to Favorites'}
                      </Button>
                      
                      {resource.url && (
                        <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
                          {isDownloading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Collections */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Add to Collection
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Organize this resource in your collections
                  </p>
                  <Button variant="outline" size="sm">
                    <Folder className="h-4 w-4 mr-2" />
                    Create New Collection
                  </Button>
                </CardContent>
              </Card>

              {/* Share Link */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Share Link</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/resources/${resource.id}`}
                      className="flex-1 px-3 py-2 border rounded-md text-sm bg-gray-50"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/resources/${resource.id}`)
                        toast.success('Link copied to clipboard')
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}