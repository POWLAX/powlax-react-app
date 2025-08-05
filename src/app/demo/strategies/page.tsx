'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Target, Shield, Users, Zap, PlayCircle, 
  ChevronRight, Search, Filter, BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { vimeoService } from '@/lib/vimeo-service'
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
}

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showLabModal, setShowLabModal] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState('')
  const [currentLabUrl, setCurrentLabUrl] = useState('')

  useEffect(() => {
    fetchStrategies()
  }, [])

  const fetchStrategies = async () => {
    try {
      const { data, error } = await supabase
        .from('strategies_powlax')
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

      setStrategies(formattedStrategies)
    } catch (error) {
      console.error('Error fetching strategies:', error)
      setStrategies(getMockStrategies())
    } finally {
      setLoading(false)
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
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredStrategies = strategies.filter(strategy => {
    const matchesCategory = selectedCategory === 'all' || strategy.category === selectedCategory
    const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categories = ['all', 'offense', 'defense', 'transition', 'special teams']

  const handleViewStrategy = (strategy: Strategy) => {
    setSelectedStrategy(strategy)
  }

  const handlePlayVideo = (url: string) => {
    setCurrentVideoUrl(url)
    setShowVideoModal(true)
  }

  const handleViewLab = (url: string) => {
    setCurrentLabUrl(url)
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Strategies & Concepts</h1>
        <p className="text-muted-foreground">
          Master lacrosse strategies with detailed breakdowns and video analysis
        </p>
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
                        {strategy.complexity && (
                          <Badge className={getComplexityColor(strategy.complexity)}>
                            {strategy.complexity}
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
                        onClick={() => handlePlayVideo(selectedStrategy.video_url!)}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Watch Video
                      </Button>
                    )}
                    {selectedStrategy.lacrosse_lab_url && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleViewLab(selectedStrategy.lacrosse_lab_url!)}
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
          videoUrl={currentVideoUrl}
        />
      )}

      {showLabModal && currentLabUrl && (
        <LacrosseLabModal
          isOpen={showLabModal}
          onClose={() => setShowLabModal(false)}
          labUrl={currentLabUrl}
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