'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/JWTAuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  AlertCircle, 
  Edit3, 
  Database,
  Search,
  Filter,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Drill {
  id: string
  name: string
  description: string
  category: string
  duration_min: number
  difficulty_level: number
  drill_video_url?: string
  drill_lab_url_1?: string
  drill_lab_url_2?: string
  drill_lab_url_3?: string
  drill_lab_url_4?: string
  drill_lab_url_5?: string
  updated_at: string
}

interface Strategy {
  id: string
  name: string
  description: string
  game_phase: string
  complexity_level: number
  video_url?: string
  diagram_url?: string
  lacrosse_lab_urls?: string[]
  updated_at: string
}

interface SkillsAcademyDrill {
  id: string
  title: string
  vimeo_id?: string
  drill_category: string[]
  complexity: string
  duration_minutes: number
  updated_at: string
}

type ContentType = 'drills' | 'strategies' | 'academy'

export default function ContentEditorPage() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<ContentType>('strategies')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  
  // Data states
  const [drills, setDrills] = useState<Drill[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [academyDrills, setAcademyDrills] = useState<SkillsAcademyDrill[]>([])
  const [loading, setLoading] = useState(false)

  // Categories for filtering
  const [drillCategories, setDrillCategories] = useState<string[]>([])
  const [strategyPhases, setStrategyPhases] = useState<string[]>([])

  // Check permissions - handle multiple admin roles and dev mode
  const isAdmin = process.env.NODE_ENV === 'development' || currentUser?.roles?.some(role => 
    ['administrator', 'admin', 'club_director', 'super_admin'].includes(role)
  )

  // Single useEffect to handle data loading
  useEffect(() => {
    // Only load data if we have auth resolved and user is admin, or in dev mode
    if (!authLoading) {
      if (process.env.NODE_ENV === 'development' || (currentUser && isAdmin)) {
        fetchAllContent()
      } else {
        // User is not authorized, but don't show loading
        setLoading(false)
      }
    }
  }, [authLoading, currentUser, isAdmin])

  const fetchAllContent = async () => {
    try {
      console.log('🔄 Starting to fetch all content...')
      setLoading(true)
      await Promise.all([
        fetchDrills(),
        fetchStrategies(), 
        fetchAcademyDrills()
      ])
      console.log('✅ Successfully fetched all content')
    } catch (error) {
      console.error('❌ Failed to fetch content:', error)
      toast.error('Failed to load content')
    } finally {
      console.log('🏁 Setting loading to false')
      setLoading(false)
    }
  }

  const fetchDrills = async () => {
    const { data, error } = await supabase
      .from('drills')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching drills:', error)
      return
    }
    
    setDrills(data || [])
    
    // Extract unique categories
    const categories = [...new Set(data?.map(d => d.category).filter(Boolean))]
    setDrillCategories(categories)
  }

  const fetchStrategies = async () => {
    const { data, error } = await supabase
      .from('strategies_powlax')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching strategies:', error)
      return
    }
    
    setStrategies(data || [])
    
    // Extract unique game phases
    const phases = [...new Set(data?.map(s => s.game_phase).filter(Boolean))]
    setStrategyPhases(phases)
  }

  const fetchAcademyDrills = async () => {
    const { data, error } = await supabase
      .from('skills_academy_drills')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching academy drills:', error)
      return
    }
    
    setAcademyDrills(data || [])
  }

  // URL validation helpers
  const validateUrl = (url: string | undefined | null): 'valid' | 'invalid' | 'empty' => {
    if (!url) return 'empty'
    try {
      new URL(url)
      return 'valid'
    } catch {
      return 'invalid'
    }
  }

  const validateLacrosseLabUrl = (url: string | undefined | null): 'valid' | 'invalid' | 'empty' => {
    if (!url) return 'empty'
    const status = validateUrl(url)
    if (status !== 'valid') return status
    
    // Check if it's actually a Lacrosse Lab URL
    const lacrosseLabPattern = /lacrosse.*lab/i
    return lacrosseLabPattern.test(url) ? 'valid' : 'invalid'
  }

  const getUrlStatusIcon = (status: 'valid' | 'invalid' | 'empty') => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'empty':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
  }

  // Filter functions
  const filterDrills = () => {
    return drills.filter(drill => {
      const matchesSearch = (drill.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false) ||
                           (drill.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false)
      const matchesCategory = filterCategory === 'all' || drill.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }

  const filterStrategies = () => {
    return strategies.filter(strategy => {
      const matchesSearch = (strategy.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false) ||
                           (strategy.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false)
      const matchesPhase = filterCategory === 'all' || strategy.game_phase === filterCategory
      return matchesSearch && matchesPhase
    })
  }

  const filterAcademyDrills = () => {
    return academyDrills.filter(drill => {
      const matchesSearch = drill.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false
      const matchesComplexity = filterCategory === 'all' || drill.complexity === filterCategory
      return matchesSearch && matchesComplexity
    })
  }

  // Count broken URLs for alert
  const brokenUrlCount = strategies.filter(strategy => {
    if (strategy.lacrosse_lab_urls) {
      return strategy.lacrosse_lab_urls.some(url => validateLacrosseLabUrl(url) === 'invalid')
    }
    return false
  }).length

  // Show loading state while auth is resolving
  if (authLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-powlax-blue"></div>
        </div>
        <p className="text-center mt-4 text-gray-600">Loading user data...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Access Denied
            </CardTitle>
            <CardDescription>
              {process.env.NODE_ENV === 'development' ? 
                'Development mode: Admin access granted' : 
                `Only administrators can access the content editor. Current roles: ${currentUser?.roles?.join(', ') || 'None'}`
              }
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Editor</h1>
          <p className="text-gray-600">
            Edit drills, strategies, and Skills Academy content with broken URL detection
          </p>
        </div>
        
        <Button
          onClick={fetchAllContent}
          disabled={loading}
          variant="outline"
        >
          <Database className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Broken URL Alert */}
      {brokenUrlCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Broken Lacrosse Lab Links Detected</h3>
                <p className="text-red-700 text-sm mt-1">
                  {brokenUrlCount} strategies have broken or invalid Lacrosse Lab URLs that need fixing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {activeTab === 'drills' && drillCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
                {activeTab === 'strategies' && strategyPhases.map(phase => (
                  <SelectItem key={phase} value={phase}>
                    {phase}
                  </SelectItem>
                ))}
                {activeTab === 'academy' && ['foundation', 'building', 'advanced'].map(complexity => (
                  <SelectItem key={complexity} value={complexity}>
                    {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strategies">
            Strategies ({strategies.length})
          </TabsTrigger>
          <TabsTrigger value="drills">
            Drills ({drills.length})
          </TabsTrigger>
          <TabsTrigger value="academy">
            Academy ({academyDrills.length})
          </TabsTrigger>
        </TabsList>

        {/* Strategies Tab */}
        <TabsContent value="strategies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Strategy Management
              </CardTitle>
              <CardDescription>
                Priority: Fix broken Lacrosse Lab URLs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-powlax-blue"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Strategy Name</TableHead>
                        <TableHead>Game Phase</TableHead>
                        <TableHead>Complexity</TableHead>
                        <TableHead>Video URL</TableHead>
                        <TableHead>Lab URLs</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterStrategies().map((strategy) => (
                        <TableRow key={strategy.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{strategy.name}</div>
                              <div className="text-sm text-gray-600 truncate max-w-xs">
                                {strategy.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{strategy.game_phase}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={strategy.complexity_level >= 4 ? 'default' : 'secondary'}>
                              {strategy.complexity_level}/5
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getUrlStatusIcon(validateUrl(strategy.video_url))}
                              {strategy.video_url && (
                                <Link href={strategy.video_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {strategy.lacrosse_lab_urls?.map((url, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  {getUrlStatusIcon(validateLacrosseLabUrl(url))}
                                  <span className="text-xs">Lab {index + 1}</span>
                                  {url && (
                                    <Link href={url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3" />
                                    </Link>
                                  )}
                                </div>
                              )) || (
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                  <span className="text-xs">No URLs</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link href={`/admin/content-editor/strategies/${strategy.id}`}>
                              <Button size="sm" variant="outline">
                                <Edit3 className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drills Tab */}
        <TabsContent value="drills">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Drill Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-powlax-blue"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Drill Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Video URL</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterDrills().map((drill) => (
                        <TableRow key={drill.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{drill.name}</div>
                              <div className="text-sm text-gray-600 truncate max-w-xs">
                                {drill.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{drill.category}</Badge>
                          </TableCell>
                          <TableCell>{drill.duration_min} min</TableCell>
                          <TableCell>
                            <Badge variant={drill.difficulty_level >= 4 ? 'default' : 'secondary'}>
                              {drill.difficulty_level}/5
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getUrlStatusIcon(validateUrl(drill.drill_video_url))}
                              {drill.drill_video_url && (
                                <Link href={drill.drill_video_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link href={`/admin/content-editor/drills/${drill.id}`}>
                              <Button size="sm" variant="outline">
                                <Edit3 className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academy Tab */}
        <TabsContent value="academy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Skills Academy Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-powlax-blue"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Categories</TableHead>
                        <TableHead>Complexity</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Vimeo ID</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterAcademyDrills().map((drill) => (
                        <TableRow key={drill.id}>
                          <TableCell>
                            <div className="font-medium">{drill.title}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {drill.drill_category?.map((cat, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              drill.complexity === 'advanced' ? 'default' :
                              drill.complexity === 'building' ? 'secondary' : 'outline'
                            }>
                              {drill.complexity}
                            </Badge>
                          </TableCell>
                          <TableCell>{drill.duration_minutes} min</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getUrlStatusIcon(drill.vimeo_id ? 'valid' : 'empty')}
                              <span className="text-xs font-mono">{drill.vimeo_id}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link href={`/admin/content-editor/academy/${drill.id}`}>
                              <Button size="sm" variant="outline">
                                <Edit3 className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}