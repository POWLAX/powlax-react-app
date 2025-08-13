import { useState, useEffect } from 'react'

interface Coach {
  id: string
  email: string
  name?: string
  coaching_tier: 'essentials_kit' | 'confidence_kit'
  resources_created: number
  monthly_usage: number
  created_at: string
  last_active?: string
}

interface Resource {
  id: string
  title: string
  description: string
  category: 'practice_template' | 'drill_guide' | 'coaching_tips' | 'strategy_guide'
  content: string
  tier_access: string[]
  status: 'pending' | 'approved' | 'rejected' | 'draft'
  created_by: string
  created_at: string
  updated_at: string
  usage_count: number
}

interface Training {
  id: string
  title: string
  description: string
  category: 'fundamentals' | 'advanced_techniques' | 'coaching_methodology' | 'player_development'
  video_url: string
  duration: number
  tier_access: string[]
  status: 'pending' | 'approved' | 'rejected' | 'draft'
  created_by: string
  created_at: string
  updated_at: string
  view_count: number
}

interface CoachingAnalytics {
  total_resources: number
  resources_this_month: number
  total_training_views: number
  views_this_month: number
  active_coaches: number
  engagement_rate: number
  confidence_kit_users: number
  upgrade_rate: number
  monthly_usage: number
  tier_distribution: {
    essentials_kit: number
    confidence_kit: number
  }
  popular_categories: {
    category: string
    usage_count: number
  }[]
}

interface CreateResourceData {
  title: string
  description: string
  category: string
  content: string
  tier_access: string[]
  status: string
}

interface CreateTrainingData {
  title: string
  description: string
  category: string
  video_url: string
  duration: number
  tier_access: string[]
  status: string
}

// Mock data for demonstration
const mockCoaches: Coach[] = [
  {
    id: '1',
    email: 'john.coach@example.com',
    name: 'John Coach',
    coaching_tier: 'confidence_kit',
    resources_created: 12,
    monthly_usage: 45,
    created_at: '2024-01-15T00:00:00Z',
    last_active: '2024-01-10T00:00:00Z'
  },
  {
    id: '2',
    email: 'sarah.trainer@example.com',
    name: 'Sarah Trainer',
    coaching_tier: 'essentials_kit',
    resources_created: 8,
    monthly_usage: 23,
    created_at: '2024-02-01T00:00:00Z',
    last_active: '2024-01-11T00:00:00Z'
  },
  {
    id: '3',
    email: 'mike.mentor@example.com',
    name: 'Mike Mentor',
    coaching_tier: 'confidence_kit',
    resources_created: 15,
    monthly_usage: 67,
    created_at: '2023-11-20T00:00:00Z',
    last_active: '2024-01-12T00:00:00Z'
  }
]

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Basic Practice Template',
    description: 'Standard practice structure for youth teams',
    category: 'practice_template',
    content: 'Warm-up (10 min) -> Skills drills (20 min) -> Scrimmage (15 min) -> Cool down (5 min)',
    tier_access: ['essentials_kit'],
    status: 'approved',
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    usage_count: 156
  },
  {
    id: '2',
    title: 'Advanced Strategy Guide',
    description: 'Complex game strategies for competitive teams',
    category: 'strategy_guide',
    content: 'Advanced tactical approaches for experienced players...',
    tier_access: ['confidence_kit'],
    status: 'approved',
    created_by: '3',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
    usage_count: 89
  },
  {
    id: '3',
    title: 'Wall Ball Fundamentals',
    description: 'Essential wall ball techniques and drills',
    category: 'drill_guide',
    content: 'Step-by-step guide to proper wall ball form and practice drills...',
    tier_access: ['essentials_kit'],
    status: 'pending',
    created_by: '2',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    usage_count: 0
  }
]

const mockTrainings: Training[] = [
  {
    id: '1',
    title: 'Fundamentals of Lacrosse Coaching',
    description: 'Basic coaching principles and techniques',
    category: 'fundamentals',
    video_url: 'https://example.com/video1',
    duration: 25,
    tier_access: ['essentials_kit'],
    status: 'approved',
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    view_count: 245
  },
  {
    id: '2',
    title: 'Advanced Player Development',
    description: 'Strategies for developing elite players',
    category: 'player_development',
    video_url: 'https://example.com/video2',
    duration: 45,
    tier_access: ['confidence_kit'],
    status: 'approved',
    created_by: '3',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    view_count: 123
  },
  {
    id: '3',
    title: 'Game Strategy Implementation',
    description: 'How to teach and implement game strategies',
    category: 'coaching_methodology',
    video_url: 'https://example.com/video3',
    duration: 35,
    tier_access: ['confidence_kit'],
    status: 'pending',
    created_by: '1',
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z',
    view_count: 0
  }
]

const mockAnalytics: CoachingAnalytics = {
  total_resources: 3,
  resources_this_month: 2,
  total_training_views: 368,
  views_this_month: 156,
  active_coaches: 3,
  engagement_rate: 78,
  confidence_kit_users: 2,
  upgrade_rate: 67,
  monthly_usage: 135,
  tier_distribution: {
    essentials_kit: 1,
    confidence_kit: 2
  },
  popular_categories: [
    { category: 'practice_template', usage_count: 156 },
    { category: 'strategy_guide', usage_count: 89 },
    { category: 'drill_guide', usage_count: 45 }
  ]
}

export function useCoachingKitManagement() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [trainings, setTrainings] = useState<Training[]>([])
  const [analytics, setAnalytics] = useState<CoachingAnalytics | null>(null)
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API calls with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCoaches(mockCoaches)
      setResources(mockResources)
      setTrainings(mockTrainings)
      setAnalytics(mockAnalytics)
    } catch (err) {
      setError('Failed to load coaching kit data')
      console.error('Error loading coaching kit data:', err)
    } finally {
      setLoading(false)
    }
  }

  const selectCoach = async (coachId: string) => {
    const coach = coaches.find(c => c.id === coachId)
    setSelectedCoach(coach || null)
  }

  const approveContent = async (contentId: string, status: 'approved' | 'rejected') => {
    try {
      // Update resource status
      setResources(prev => prev.map(resource => 
        resource.id === contentId 
          ? { ...resource, status, updated_at: new Date().toISOString() }
          : resource
      ))

      // Update training status
      setTrainings(prev => prev.map(training => 
        training.id === contentId 
          ? { ...training, status, updated_at: new Date().toISOString() }
          : training
      ))

      console.log(`Content ${contentId} ${status}`)
    } catch (err) {
      setError(`Failed to ${status} content`)
      console.error(`Error ${status} content:`, err)
    }
  }

  const createResource = async (data: CreateResourceData) => {
    try {
      const newResource: Resource = {
        id: String(resources.length + 1),
        title: data.title,
        description: data.description,
        category: data.category as Resource['category'],
        content: data.content,
        tier_access: data.tier_access,
        status: data.status as Resource['status'],
        created_by: '1', // Current user ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0
      }

      setResources(prev => [...prev, newResource])
      console.log('Resource created:', newResource)
    } catch (err) {
      setError('Failed to create resource')
      console.error('Error creating resource:', err)
    }
  }

  const uploadTraining = async (data: CreateTrainingData) => {
    try {
      const newTraining: Training = {
        id: String(trainings.length + 1),
        title: data.title,
        description: data.description,
        category: data.category as Training['category'],
        video_url: data.video_url,
        duration: data.duration,
        tier_access: data.tier_access,
        status: data.status as Training['status'],
        created_by: '1', // Current user ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        view_count: 0
      }

      setTrainings(prev => [...prev, newTraining])
      console.log('Training uploaded:', newTraining)
    } catch (err) {
      setError('Failed to upload training')
      console.error('Error uploading training:', err)
    }
  }

  const getCoachAnalytics = async (coachId: string) => {
    try {
      // Return mock analytics for specific coach
      const coach = coaches.find(c => c.id === coachId)
      if (!coach) throw new Error('Coach not found')

      return {
        resources_created: coach.resources_created,
        monthly_usage: coach.monthly_usage,
        tier: coach.coaching_tier,
        engagement_score: Math.floor(Math.random() * 100)
      }
    } catch (err) {
      setError('Failed to get coach analytics')
      console.error('Error getting coach analytics:', err)
      return null
    }
  }

  const hasKitAccess = (tier: 'essentials_kit' | 'confidence_kit', feature: string) => {
    // Mock tier enforcement logic
    const essentialsFeatures = ['practice_planner', 'basic_resources', 'standard_drills']
    const confidenceFeatures = ['custom_content', 'advanced_training', 'personal_coaching', 'analytics']

    if (tier === 'essentials_kit') {
      return essentialsFeatures.includes(feature)
    }

    if (tier === 'confidence_kit') {
      return [...essentialsFeatures, ...confidenceFeatures].includes(feature)
    }

    return false
  }

  const refreshData = async () => {
    await loadData()
  }

  return {
    coaches,
    resources,
    trainings,
    analytics,
    selectedCoach,
    loading,
    error,
    selectCoach,
    approveContent,
    createResource,
    uploadTraining,
    getCoachAnalytics,
    hasKitAccess,
    refreshData
  }
}