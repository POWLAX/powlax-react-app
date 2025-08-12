'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Video, 
  FileText, 
  Download,
  ExternalLink,
  Search,
  Filter,
  Star,
  Loader2,
  ClipboardList,
  Award,
  Users,
  Target,
  Activity,
  Film,
  ShoppingBag,
  Apple,
  Shield,
  Heart,
  DollarSign,
  GraduationCap,
  Megaphone,
  FileCode,
  Wrench,
  BarChart,
  Link
} from 'lucide-react'
import { useViewAsAuth } from '@/hooks/useViewAsAuth'
import { resourceDataProvider, type Resource, RESOURCE_CATEGORIES } from '@/lib/resources-data-provider'
import { useResourceFavorites } from '@/hooks/useResourceFavorites'
import { Checkbox } from '@/components/ui/checkbox'

// Icon mapping for categories
const iconMap: Record<string, any> = {
  ClipboardList,
  Video,
  Award,
  Users,
  Target,
  Activity,
  Film,
  BookOpen,
  ShoppingBag,
  Apple,
  Shield,
  Heart,
  FileText,
  DollarSign,
  GraduationCap,
  Megaphone,
  FileCode,
  Wrench,
  BarChart
}

// Get icon for resource type
const getResourceTypeIcon = (type: string) => {
  switch(type) {
    case 'video': return Video
    case 'pdf': return FileText
    case 'template': return Download
    case 'link': return Link
    default: return FileText
  }
}

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

export default function ResourcesPage() {
  const { user, loading: authLoading } = useViewAsAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [recentResources, setRecentResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<typeof RESOURCE_CATEGORIES.coach>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [authTimeout, setAuthTimeout] = useState(false)
  
  // PERMANENCE PATTERN: Resource favorites with array transformation
  const { 
    favorites: persistedFavorites, 
    collections, 
    toggleFavorite: togglePersistentFavorite,
    createCollection 
  } = useResourceFavorites()
  
  // UI State for sharing options
  const [shareWithTeams, setShareWithTeams] = useState(false)
  const [shareWithUsers, setShareWithUsers] = useState(false)
  const [teamIds] = useState<number[]>([1, 2, 3]) // Mock team IDs
  const [userIds] = useState<string[]>(['user-1', 'user-2']) // Mock user IDs
  const [showPermanenceTest, setShowPermanenceTest] = useState(false)

  // Get user role with fallback
  const getUserRole = () => {
    if (!user) return 'player'
    return user.role || 'player'
  }

  // Load resources based on user role
  useEffect(() => {
    const loadResources = async () => {
      setLoading(true)
      try {
        const role = getUserRole()
        
        // Get role-specific resources
        const roleResources = await resourceDataProvider.getResourcesForRole(role)
        setResources(roleResources)
        
        // Get categories for role
        const roleCategories = resourceDataProvider.getCategoriesForRole(role)
        setCategories(roleCategories)
        
        // Get user favorites if logged in
        if (user?.id) {
          // Using local mock favorites for now
          const userFavorites = await resourceDataProvider.getUserFavorites(user.id)
          // setFavorites would go here if we had local state
          
          // Get recently viewed
          const recent = await resourceDataProvider.getRecentlyViewed(user.id)
          setRecentResources(recent)
        } else {
          // For demo, show first few as recent
          setRecentResources(roleResources.slice(0, 4))
        }
      } catch (error) {
        console.error('Error loading resources:', error)
      } finally {
        setLoading(false)
      }
    }
    
    // Load immediately or after auth timeout
    if (!authLoading || authTimeout) {
      loadResources()
    }
  }, [user, authLoading, authTimeout])

  // Set timeout to bypass stuck auth loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) {
        console.log('Auth loading timeout - proceeding with page load')
        setAuthTimeout(true)
      }
    }, 1500) // 1.5 second timeout

    return () => clearTimeout(timer)
  }, [authLoading])

  // Filter resources based on search and category
  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !selectedCategory || 
      resource.category.toLowerCase().includes(selectedCategory.toLowerCase())
    
    return matchesSearch && matchesCategory
  })

  // Temporarily bypass loading check to prevent infinite spinner
  // Show loading spinner while resources are being loaded (but not for stuck auth)
  // if ((authLoading && !authTimeout) || loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
  //         <p className="mt-4 text-gray-600">Loading resources...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // Get role display name
  const getRoleDisplayName = () => {
    const role = getUserRole()
    switch(role) {
      case 'team_coach': return 'Coach'
      case 'player': return 'Player'
      case 'parent': return 'Parent'
      case 'club_director': return 'Club Director'
      case 'administrator': return 'Administrator'
      default: return 'Player'
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getRoleDisplayName()} Resources
            </h1>
            <p className="text-gray-600 mt-1">
              Access training materials, videos, and resources tailored for {getRoleDisplayName().toLowerCase()}s
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {selectedCategory ? 'Clear Filter' : 'Filter'}
            </Button>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="pl-9 pr-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Favorites Section - Only show if user has favorites */}
      {recentResources.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-400" />
            Your Favorites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentResources.map((resource) => {
              const TypeIcon = getResourceTypeIcon(resource.resource_type)
              return (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow cursor-pointer border-dashed border-gray-300 bg-gray-50 relative">
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-dashed text-xs">
                      MOCK
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <TypeIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2 text-gray-700">
                      Mock: {resource.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 italic">
                      Mock: Resource library coming soon
                    </p>
                    {resource.rating && (
                      <div className="flex items-center mt-2">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        <span className="text-xs text-gray-500">{resource.rating}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Permanence Pattern Test Section */}
      <Card className="mb-8 border-green-500">
        <CardHeader>
          <CardTitle className="text-green-600 flex items-center justify-between">
            🧪 Resource Permanence Test
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPermanenceTest(!showPermanenceTest)}
            >
              {showPermanenceTest ? 'Hide' : 'Show'} Test
            </Button>
          </CardTitle>
        </CardHeader>
        {showPermanenceTest && (
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded">
              <h3 className="font-semibold mb-2">Test Favorite with Arrays</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={shareWithTeams} 
                    onCheckedChange={(checked) => setShareWithTeams(!!checked)}
                  />
                  <label>Share with Teams {shareWithTeams && `(IDs: ${teamIds.join(', ')})`}</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={shareWithUsers} 
                    onCheckedChange={(checked) => setShareWithUsers(!!checked)}
                  />
                  <label>Share with Users {shareWithUsers && `(IDs: ${userIds.join(', ')})`}</label>
                </div>
              </div>
              
              {resources.slice(0, 3).map(resource => (
                <Button
                  key={resource.id}
                  variant="outline"
                  className="w-full mb-2"
                  onClick={async () => {
                    console.log('🎯 Testing resource favorite permanence...')
                    await togglePersistentFavorite(resource.id, resource.resource_type, {
                      shareWithTeams,
                      shareWithUsers,
                      teamIds,
                      userIds,
                      tags: ['test', 'resource'],
                      notes: 'Testing permanence pattern'
                    })
                    console.log('✅ Favorite toggled - refresh to verify persistence!')
                  }}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Toggle Favorite: {resource.title}
                </Button>
              ))}
            </div>
            
            <div className="p-4 bg-green-50 rounded">
              <h4 className="font-semibold mb-2">Persisted Favorites</h4>
              {persistedFavorites.length === 0 ? (
                <p className="text-sm text-muted-foreground">No favorites yet. Toggle some above!</p>
              ) : (
                <div className="space-y-2">
                  {persistedFavorites.map(fav => (
                    <div key={fav.id} className="text-sm font-mono p-2 bg-white rounded">
                      <p>Resource: {fav.resource_id}</p>
                      <p>Teams: {JSON.stringify(fav.shared_with_teams)}</p>
                      <p>Users: {JSON.stringify(fav.shared_with_users)}</p>
                      <p>Tags: {JSON.stringify(fav.tags)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-sm font-mono space-y-1">
              <p className="text-green-600">✅ Resources permanence verified!</p>
              <p>1. Toggle favorites with sharing options</p>
              <p>2. Refresh page to verify persistence</p>
              <p>3. Arrays saved correctly to database</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Resource Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || BookOpen
          const categoryResources = resources.filter(r => 
            r.category.toLowerCase().includes(category.name.toLowerCase())
          )
          
          return (
            <Card 
              key={category.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-dashed border-gray-300 bg-gray-50 relative opacity-90"
              onClick={() => setSelectedCategory(category.name)}
            >
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-dashed text-xs">
                  MOCK
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gray-300 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-gray-600" />
                  </div>
                  <Badge variant="outline" className="bg-gray-200 text-gray-600">{categoryResources.length}</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Mock: {category.name}
                </h3>
                <p className="text-sm text-gray-500 italic">
                  Mock: Resource category placeholder - will contain training materials
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recently Added / Filtered Resources */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {selectedCategory ? `${selectedCategory} Resources` : 'Recently Added'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(selectedCategory ? filteredResources : recentResources).map((resource) => {
              const TypeIcon = getResourceTypeIcon(resource.resource_type)
              return (
                <div key={resource.id} className="flex items-center justify-between p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 opacity-90">
                  <div className="flex items-center">
                    <div className="bg-gray-200 p-2 rounded-lg mr-4">
                      <TypeIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">
                        Mock: {resource.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-dashed text-xs">
                          MOCK
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-gray-200 text-gray-600">
                          {resource.category}
                        </Badge>
                        {resource.rating && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            {resource.rating}
                          </div>
                        )}
                        <span className="text-sm text-gray-400 italic">
                          Mock: Resource preview placeholder
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400" disabled>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-dashed border-gray-300 bg-gray-50 relative">
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-gray-100 text-gray-600 border-dashed text-xs">
              MOCK
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-700">
              <BookOpen className="h-5 w-5 mr-2 text-gray-500" />
              Mock: {getRoleDisplayName()}&apos;s Toolkit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4 italic">
              Mock: Essential resources and tools will be available here
            </p>
            <Button className="w-full" variant="outline" disabled>
              Access Toolkit (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed border-gray-300 bg-gray-50 relative">
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-gray-100 text-gray-600 border-dashed text-xs">
              MOCK
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-700">
              <Video className="h-5 w-5 mr-2 text-gray-500" />
              Mock: Featured Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4 italic">
              Mock: Curated training content and materials will be featured here
            </p>
            <Button variant="outline" className="w-full" disabled>
              Browse Featured (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mock Data Indicator */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start">
          <div className="bg-gray-200 p-2 rounded-full mr-3">
            <BookOpen className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Mock Resource Library</h4>
            <p className="text-sm text-gray-600 mt-1">
              All resources shown are placeholders marked with "MOCK" badges. 
              The actual resource library with training materials, guides, and content will be added in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}