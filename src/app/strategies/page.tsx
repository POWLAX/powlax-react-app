'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Target, Shield, Zap, Users, PlayCircle, 
  BookOpen, ChevronRight, Lightbulb, TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface StrategyPreview {
  id: string
  name: string
  category: string
  description?: string
  complexity?: string
  hasVideo: boolean
  hasLab: boolean
  drillCount: number
}

interface CategoryStats {
  category: string
  count: number
  icon: any
  color: string
  description: string
}

export default function PublicStrategiesPage() {
  const [strategyPreviews, setStrategyPreviews] = useState<StrategyPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStrategyPreviews()
  }, [])

  const fetchStrategyPreviews = async () => {
    try {
      const { data, error } = await supabase
        .from('strategies')
        .select('id, name, category, description, complexity, video_url, lacrosse_lab_url')
        .limit(9)

      if (error) throw error

      const previews = data?.map(strategy => ({
        id: strategy.id,
        name: strategy.name,
        category: strategy.category,
        description: strategy.description,
        complexity: strategy.complexity,
        hasVideo: !!strategy.video_url,
        hasLab: !!strategy.lacrosse_lab_url,
        drillCount: Math.floor(Math.random() * 10) + 3 // Mock drill count
      })) || []

      setStrategyPreviews(previews)
    } catch (error) {
      console.error('Error fetching strategies:', error)
      setStrategyPreviews(getMockStrategyPreviews())
    } finally {
      setLoading(false)
    }
  }

  const categoryStats: CategoryStats[] = [
    {
      category: 'Offense',
      count: 45,
      icon: Target,
      color: 'text-red-500',
      description: 'Motion offenses, set plays, and scoring strategies'
    },
    {
      category: 'Defense',
      count: 38,
      icon: Shield,
      color: 'text-blue-500',
      description: 'Defensive packages, slides, and communication systems'
    },
    {
      category: 'Transition',
      count: 27,
      icon: Zap,
      color: 'text-green-500',
      description: 'Clearing, riding, and fast break strategies'
    },
    {
      category: 'Special Teams',
      count: 22,
      icon: Users,
      color: 'text-purple-500',
      description: 'Man-up, man-down, and face-off plays'
    }
  ]

  const getComplexityColor = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case 'foundation': return 'bg-green-100 text-green-800'
      case 'building': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground">
              132 Strategies • 87 Concepts
            </Badge>
            <h1 className="text-5xl font-bold mb-6">Master Lacrosse Strategy</h1>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Comprehensive playbook with video breakdowns, Lacrosse Lab integration, 
              and connected drill progressions for every strategic concept.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/login">Access Full Library</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                <PlayCircle className="mr-2 w-4 h-4" />
                Watch Sample Video
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Stats */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Strategic Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryStats.map((stat) => (
            <Card key={stat.category} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`w-12 h-12 ${stat.color}`} />
                  <span className="text-2xl font-bold">{stat.count}</span>
                </div>
                <CardTitle>{stat.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Sample Strategies */}
      <section className="container mx-auto px-4 py-16 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Featured Strategies</h2>
          <p className="text-center text-muted-foreground mb-12">
            Preview our comprehensive strategy library with video analysis and drill connections
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategyPreviews.map((strategy) => (
              <Card key={strategy.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    {strategy.complexity && (
                      <Badge className={getComplexityColor(strategy.complexity)}>
                        {strategy.complexity}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {strategy.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {strategy.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="capitalize">
                        {strategy.category}
                      </Badge>
                      {strategy.hasVideo && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <PlayCircle className="w-3 h-3" />
                          Video
                        </Badge>
                      )}
                      {strategy.hasLab && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          Lab
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {strategy.drillCount} connected drills
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/login">
                Explore All Strategies <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Integration Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Integrated Learning System</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Video Breakdowns</h3>
              <p className="text-muted-foreground">
                Professional video analysis for every strategy and concept
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Lacrosse Lab</h3>
              <p className="text-muted-foreground">
                Direct integration with Lacrosse Lab for deeper insights
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Connected Drills</h3>
              <p className="text-muted-foreground">
                Practice drills specifically designed for each strategy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Team's Strategy?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of coaches using POWLAX to implement winning strategies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/login">Get Started Today</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link href="/skills-academy">
                <TrendingUp className="mr-2 w-4 h-4" />
                Explore Skills Academy
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function getMockStrategyPreviews(): StrategyPreview[] {
  return [
    {
      id: '1',
      name: '2-3-1 Motion Offense',
      category: 'offense',
      description: 'A balanced offensive set that creates space and movement opportunities',
      complexity: 'building',
      hasVideo: true,
      hasLab: true,
      drillCount: 8
    },
    {
      id: '2',
      name: 'Adjacent Slide Package',
      category: 'defense',
      description: 'Fundamental defensive sliding system for team defense',
      complexity: 'foundation',
      hasVideo: true,
      hasLab: false,
      drillCount: 6
    },
    {
      id: '3',
      name: 'Invert Clear',
      category: 'transition',
      description: 'Advanced clearing strategy using inverted midfield positioning',
      complexity: 'advanced',
      hasVideo: true,
      hasLab: true,
      drillCount: 5
    },
    {
      id: '4',
      name: '3-3 Zone Defense',
      category: 'defense',
      description: 'Zone defense system for controlling the middle of the field',
      complexity: 'building',
      hasVideo: false,
      hasLab: true,
      drillCount: 7
    },
    {
      id: '5',
      name: 'EMO Green Package',
      category: 'special teams',
      description: 'Extra man offense plays focused on quick ball movement',
      complexity: 'foundation',
      hasVideo: true,
      hasLab: false,
      drillCount: 4
    },
    {
      id: '6',
      name: 'Wing Face-Off Play',
      category: 'special teams',
      description: 'Specialized face-off play for wing dominance',
      complexity: 'advanced',
      hasVideo: true,
      hasLab: true,
      drillCount: 3
    }
  ]
}