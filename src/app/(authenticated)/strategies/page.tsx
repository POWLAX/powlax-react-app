'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Target, Shield, Users, Zap, PlayCircle, 
  ChevronRight, Search, Filter, BookOpen, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useUserStrategies } from '@/hooks/useUserStrategies'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import VideoModal from '@/components/practice-planner/modals/VideoModal'
import LacrosseLabModal from '@/components/practice-planner/modals/LacrosseLabModal'

interface Strategy {
  id: string
  name: string
  category: string
  description?: string
  complexity?: string
  age_level?: string
  video_url?: string
  lacrosse_lab_url?: string
  tags?: string[]
  related_drills?: any[]
  related_concepts?: string[]
  isUserStrategy?: boolean
}

export default function StrategiesPage() {
  const { user, loading: authLoading } = useAuth()
  const { userStrategies, loading: userLoading, createUserStrategy } = useUserStrategies()
  const [powlaxStrategies, setPowlaxStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  
  // Combine user strategies with POWLAX strategies
  const allStrategies = [
    ...powlaxStrategies,
    ...userStrategies.map(us => ({
      id: `user-${us.id}`,
      name: us.strategy_name,
      category: us.strategy_categories?.toLowerCase().replace(/\s+/g, '_') || 'general',
      description: us.description,
      complexity: 'custom',
      age_level: us.target_audience,
      video_url: us.vimeo_link,
      lacrosse_lab_url: undefined,
      tags: [us.lesson_category || 'custom'].filter(Boolean),
      related_drills: [],
      related_concepts: [],
      isUserStrategy: true
    })) as Strategy[]
  ]
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showLabModal, setShowLabModal] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState('')
  const [currentLabUrl, setCurrentLabUrl] = useState('')
  const [currentStrategyName, setCurrentStrategyName] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchStrategies()
  }, [])

  // Show loading spinner while authentication is being verified
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const fetchStrategies = async () => {
    try {
      const { data, error } = await supabase
        .from('powlax_strategies')
        .select('*')
        .order('strategy_name')

      if (error) throw error

      const formattedStrategies = data?.map(strategy => ({
        id: strategy.id?.toString() || 'strategy-' + Math.random(),
        name: strategy.strategy_name || 'Unnamed Strategy',
        category: strategy.strategy_categories?.toLowerCase().replace(/\s+/g, '_') || 'general',
        description: strategy.description,
        complexity: getComplexityFromAge(strategy.see_it_ages, strategy.coach_it_ages, strategy.own_it_ages),
        age_level: strategy.see_it_ages || strategy.coach_it_ages || strategy.own_it_ages,
        video_url: strategy.vimeo_link,
        lacrosse_lab_url: strategy.lacrosse_lab_links?.[0],
        tags: strategy.strategy_categories ? [strategy.strategy_categories] : [],
        related_drills: [], // Will be populated when we have drill relationships
        related_concepts: []
      })) || []

      setPowlaxStrategies(formattedStrategies)
    } catch (error) {
      console.error('Error fetching strategies:', error)
      setPowlaxStrategies(getMockStrategies())
    } finally {
      setLoading(false || userLoading)
    }
  }
  
  const getComplexityFromAge = (seeIt: string, coachIt: string, ownIt: string) => {
    const ages = [seeIt, coachIt, ownIt].filter(Boolean);
    if (ages.length === 0) return 'foundation';
    
    const maxAge = Math.max(...ages.map(age => {
      const match = age.match(/(\d+)/);
      return match ? parseInt(match[1]) : 8;
    }));
    
    if (maxAge >= 14) return 'advanced';
    if (maxAge >= 12) return 'building';
    return 'foundation';
  }

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'offense': return <Target className="w-5 h-5" />
      case 'defense': return <Shield className="w-5 h-5" />
      case 'transition': return <Zap className="w-5 h-5" />
      default: return <Users className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'offense': return 'text-red-500'
      case 'defense': return 'text-blue-500'
      case 'transition': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case 'foundation': return 'bg-green-100 text-green-800'
      case 'building': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      case 'custom': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredStrategies = allStrategies.filter(strategy => {
    const matchesCategory = selectedCategory === 'all' || strategy.category === selectedCategory
    const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categories = ['all', 'offense', 'defense', 'transition', 'special teams']

  const handleViewStrategy = (strategy: Strategy) => {
    setSelectedStrategy(strategy)
  }

  const handlePlayVideo = (url: string, name: string = 'Strategy Video') => {
    setCurrentVideoUrl(url)
    setCurrentStrategyName(name)
    setShowVideoModal(true)
  }

  const handleViewLab = (url: string, name: string = 'Strategy Lab') => {
    setCurrentLabUrl(url)
    setCurrentStrategyName(name)
    setShowLabModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-4">Strategies & Concepts</h1>
          <p className="text-muted-foreground">
            Master lacrosse strategies with detailed breakdowns and video analysis
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          Create Strategy
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search strategies..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category === 'all' ? 'All' : category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy List */}
        <div className="lg:col-span-2">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
              {filteredStrategies.map((strategy) => (
                <Card 
                  key={strategy.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewStrategy(strategy)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={getCategoryColor(strategy.category)}>
                          {getCategoryIcon(strategy.category)}
                        </div>
                        <CardTitle className="text-lg">{strategy.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {strategy.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {strategy.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {strategy.isUserStrategy && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Custom
                          </Badge>
                        )}
                        {strategy.complexity && (
                          <Badge className={getComplexityColor(strategy.complexity)}>
                            {strategy.complexity === 'custom' ? 'My Strategy' : strategy.complexity}
                          </Badge>
                        )}
                        {strategy.age_level && (
                          <Badge variant="outline">{strategy.age_level}</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        {strategy.video_url && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <PlayCircle className="w-3 h-3" />
                            Video
                          </Badge>
                        )}
                        {strategy.lacrosse_lab_url && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Lab
                          </Badge>
                        )}
                        {strategy.related_drills && strategy.related_drills.length > 0 && (
                          <Badge variant="outline">
                            {strategy.related_drills.length} drills
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Strategy Detail Panel */}
        <div className="lg:col-span-1">
          {selectedStrategy ? (
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className={getCategoryColor(selectedStrategy.category)}>
                    {getCategoryIcon(selectedStrategy.category)}
                  </div>
                  <CardTitle>{selectedStrategy.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedStrategy.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedStrategy.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Category</span>
                        <span className="capitalize">{selectedStrategy.category}</span>
                      </div>
                      {selectedStrategy.complexity && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Complexity</span>
                          <Badge className={getComplexityColor(selectedStrategy.complexity)}>
                            {selectedStrategy.complexity}
                          </Badge>
                        </div>
                      )}
                      {selectedStrategy.age_level && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Age Level</span>
                          <span>{selectedStrategy.age_level}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {selectedStrategy.video_url && (
                      <Button 
                        className="w-full" 
                        onClick={() => handlePlayVideo(selectedStrategy.video_url!, selectedStrategy.name)}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Watch Video
                      </Button>
                    )}
                    {selectedStrategy.lacrosse_lab_url && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleViewLab(selectedStrategy.lacrosse_lab_url!, selectedStrategy.name)}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        View in Lacrosse Lab
                      </Button>
                    )}
                  </div>

                  {/* Related Drills */}
                  {selectedStrategy.related_drills && selectedStrategy.related_drills.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Related Drills</h4>
                      <div className="space-y-2">
                        {selectedStrategy.related_drills.slice(0, 5).map((drill: any, index: number) => (
                          <div key={index} className="text-sm p-2 bg-muted rounded-lg">
                            {drill.name}
                          </div>
                        ))}
                        {selectedStrategy.related_drills.length > 5 && (
                          <p className="text-sm text-muted-foreground">
                            +{selectedStrategy.related_drills.length - 5} more drills
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a strategy to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      {showVideoModal && currentVideoUrl && (
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          drill={{
            name: currentStrategyName,
            videoUrl: currentVideoUrl
          }}
        />
      )}

      {showLabModal && currentLabUrl && (
        <LacrosseLabModal
          isOpen={showLabModal}
          onClose={() => setShowLabModal(false)}
          drill={{
            name: currentStrategyName,
            lab_urls: [currentLabUrl]
          }}
        />
      )}
      
      {/* Create Strategy Modal */}
      {showCreateModal && (
        <CreateStrategyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={createUserStrategy}
        />
      )}
    </div>
  )
}

function getMockStrategies(): Strategy[] {
  return [
    {
      id: '1',
      name: '2-3-1 Motion Offense',
      category: 'offense',
      description: 'A balanced offensive set that creates space and movement opportunities',
      complexity: 'building',
      age_level: '14U+',
      video_url: 'https://vimeo.com/123456',
      lacrosse_lab_url: 'https://lacrosselab.com/strategy/231-motion',
      tags: ['motion', 'balanced'],
      related_drills: []
    },
    {
      id: '2',
      name: 'Slide Package Defense',
      category: 'defense',
      description: 'Comprehensive defensive sliding system with adjacent and crease slides',
      complexity: 'advanced',
      age_level: '16U+',
      video_url: 'https://vimeo.com/234567',
      tags: ['sliding', 'team-defense'],
      related_drills: []
    },
    {
      id: '3',
      name: 'Clear vs Ride',
      category: 'transition',
      description: 'Systematic approach to clearing against various riding schemes',
      complexity: 'foundation',
      age_level: '12U+',
      lacrosse_lab_url: 'https://lacrosselab.com/strategy/clear-ride',
      tags: ['clearing', 'transition'],
      related_drills: []
    }
  ]
}

// Create Strategy Modal Component
interface CreateStrategyModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (strategyData: any) => Promise<any>
}

function CreateStrategyModal({ isOpen, onClose, onCreate }: CreateStrategyModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('offense')
  const [targetAudience, setTargetAudience] = useState('')
  const [videoLink, setVideoLink] = useState('')
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      return
    }

    setCreating(true)
    try {
      await onCreate({
        strategy_name: name.trim(),
        description: description.trim() || undefined,
        strategy_categories: category,
        lesson_category: category,
        target_audience: targetAudience.trim() || undefined,
        vimeo_link: videoLink.trim() || undefined,
        is_public: false
      })

      // Reset form
      setName('')
      setDescription('')
      setCategory('offense')
      setTargetAudience('')
      setVideoLink('')
      onClose()
    } catch (error) {
      console.error('Error creating strategy:', error)
    } finally {
      setCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Create New Strategy</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={creating}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strategy Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Motion Offense Set Play"
              required
              disabled={creating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={creating}
            >
              <option value="offense">Offense</option>
              <option value="defense">Defense</option>
              <option value="transition">Transition</option>
              <option value="special teams">Special Teams</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe how this strategy works..."
              disabled={creating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={creating}
            >
              <option value="">Select age group (optional)</option>
              <option value="Youth (8-10)">Youth (8-10)</option>
              <option value="Middle School (11-13)">Middle School (11-13)</option>
              <option value="High School (14-18)">High School (14-18)</option>
              <option value="College">College</option>
              <option value="All Ages">All Ages</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video Link (optional)
            </label>
            <input
              type="url"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://vimeo.com/..."
              disabled={creating}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Strategy'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}