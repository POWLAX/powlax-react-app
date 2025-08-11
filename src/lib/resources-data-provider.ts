// Resources Data Provider - Real Data with Mock Fallback
// This provider fetches real data from Supabase when available
// and falls back to mock data with "(MOCK)" suffix when tables don't exist

import { supabase } from '@/lib/supabase'

// Resource type definition
export interface Resource {
  id: string
  title: string
  description: string
  category: string
  resource_type: 'video' | 'pdf' | 'template' | 'link'
  url: string
  thumbnail_url?: string
  file_size?: number
  duration_seconds?: number
  age_groups?: string[]
  roles?: string[]
  rating?: number
  views_count?: number
  downloads_count?: number
  tags?: string[]
  created_at?: string
  updated_at?: string
  is_mock?: boolean // Track if this is mock data
}

// User interaction type
export interface UserResourceInteraction {
  id: string
  user_id: string
  resource_id: string
  is_favorite: boolean
  rating?: number
  last_viewed?: string
  view_count?: number
  download_count?: number
}

// Mock data for each role
const MOCK_RESOURCES: Record<string, Resource[]> = {
  coach: [
    {
      id: 'mock-coach-1',
      title: 'U12 Practice Plan Template (MOCK)',
      description: 'Complete practice plan template for U12 teams with drills and progressions',
      category: 'Practice Planning',
      resource_type: 'template',
      url: '/templates/u12-practice-plan.pdf',
      file_size: 2400000,
      roles: ['coach'],
      age_groups: ['11-14'],
      rating: 4.8,
      downloads_count: 234,
      views_count: 567,
      tags: ['practice', 'planning', 'u12'],
      is_mock: true
    },
    {
      id: 'mock-coach-2',
      title: 'Ground Ball Technique Video (MOCK)',
      description: 'Master the fundamentals of ground ball technique with this comprehensive video guide',
      category: 'Training Videos',
      resource_type: 'video',
      url: 'https://example.com/ground-ball-technique',
      thumbnail_url: '/images/ground-ball-thumb.jpg',
      duration_seconds: 323,
      roles: ['coach'],
      rating: 4.9,
      views_count: 1456,
      tags: ['technique', 'ground balls', 'fundamentals'],
      is_mock: true
    },
    {
      id: 'mock-coach-3',
      title: 'Defensive Positioning Strategy Guide (MOCK)',
      description: 'Complete guide to teaching defensive positioning and slides',
      category: 'Strategy Guides',
      resource_type: 'pdf',
      url: '/guides/defensive-positioning.pdf',
      file_size: 3200000,
      roles: ['coach'],
      age_groups: ['11-14', '15+'],
      rating: 4.7,
      downloads_count: 189,
      views_count: 445,
      tags: ['defense', 'strategy', 'positioning'],
      is_mock: true
    },
    {
      id: 'mock-coach-4',
      title: 'Parent Communication Template Pack (MOCK)',
      description: 'Email templates and guides for effective parent communication',
      category: 'Team Management',
      resource_type: 'template',
      url: '/templates/parent-communication.zip',
      file_size: 1500000,
      roles: ['coach'],
      rating: 4.6,
      downloads_count: 312,
      tags: ['communication', 'parents', 'team management'],
      is_mock: true
    },
    {
      id: 'mock-coach-5',
      title: 'USA Lacrosse Coaching Certification Guide (MOCK)',
      description: 'Complete preparation guide for USA Lacrosse coaching certification',
      category: 'Certification',
      resource_type: 'pdf',
      url: '/certification/usa-lacrosse-guide.pdf',
      file_size: 4500000,
      roles: ['coach'],
      rating: 4.9,
      downloads_count: 567,
      views_count: 892,
      tags: ['certification', 'USA Lacrosse', 'coaching'],
      is_mock: true
    }
  ],
  player: [
    {
      id: 'mock-player-1',
      title: 'Wall Ball Workout Series (MOCK)',
      description: '12-part wall ball workout series for skill development',
      category: 'Skill Development',
      resource_type: 'video',
      url: 'https://example.com/wall-ball-series',
      thumbnail_url: '/images/wall-ball-thumb.jpg',
      duration_seconds: 765,
      roles: ['player'],
      age_groups: ['8-10', '11-14', '15+'],
      rating: 4.9,
      views_count: 3456,
      tags: ['wall ball', 'skills', 'workout'],
      is_mock: true
    },
    {
      id: 'mock-player-2',
      title: 'Position-Specific Training Guide - Attack (MOCK)',
      description: 'Complete training guide for attack position players',
      category: 'Workouts',
      resource_type: 'pdf',
      url: '/guides/attack-training.pdf',
      file_size: 2800000,
      roles: ['player'],
      age_groups: ['11-14', '15+'],
      rating: 4.7,
      downloads_count: 423,
      views_count: 789,
      tags: ['attack', 'position', 'training'],
      is_mock: true
    },
    {
      id: 'mock-player-3',
      title: 'Pro Game Highlights - Championship 2024 (MOCK)',
      description: 'Highlights and analysis from the 2024 championship game',
      category: 'Game Film',
      resource_type: 'video',
      url: 'https://example.com/championship-2024',
      thumbnail_url: '/images/championship-thumb.jpg',
      duration_seconds: 1200,
      roles: ['player'],
      rating: 4.8,
      views_count: 5678,
      tags: ['game film', 'highlights', 'professional'],
      is_mock: true
    },
    {
      id: 'mock-player-4',
      title: 'Lacrosse Rules Quick Reference (MOCK)',
      description: 'Quick reference guide for all lacrosse rules and regulations',
      category: 'Rules & Regulations',
      resource_type: 'pdf',
      url: '/rules/quick-reference.pdf',
      file_size: 1200000,
      roles: ['player'],
      rating: 4.5,
      downloads_count: 234,
      tags: ['rules', 'regulations', 'reference'],
      is_mock: true
    },
    {
      id: 'mock-player-5',
      title: 'Mental Training & Visualization (MOCK)',
      description: 'Guide to mental training and visualization techniques for lacrosse',
      category: 'Mental Training',
      resource_type: 'link',
      url: 'https://example.com/mental-training',
      roles: ['player'],
      age_groups: ['15+'],
      rating: 4.6,
      views_count: 892,
      tags: ['mental', 'visualization', 'performance'],
      is_mock: true
    }
  ],
  parent: [
    {
      id: 'mock-parent-1',
      title: 'Youth Lacrosse Equipment Guide 2025 (MOCK)',
      description: 'Complete guide to buying lacrosse equipment for youth players',
      category: 'Equipment Guide',
      resource_type: 'pdf',
      url: '/guides/equipment-2025.pdf',
      file_size: 3500000,
      roles: ['parent'],
      age_groups: ['8-10', '11-14'],
      rating: 4.7,
      downloads_count: 567,
      views_count: 1234,
      tags: ['equipment', 'youth', 'buying guide'],
      is_mock: true
    },
    {
      id: 'mock-parent-2',
      title: 'Game Day Nutrition Tips (MOCK)',
      description: 'Nutrition guidelines for before, during, and after games',
      category: 'Nutrition',
      resource_type: 'link',
      url: 'https://example.com/game-nutrition',
      roles: ['parent'],
      rating: 4.8,
      views_count: 892,
      tags: ['nutrition', 'game day', 'health'],
      is_mock: true
    },
    {
      id: 'mock-parent-3',
      title: 'Concussion Recognition & Response (MOCK)',
      description: 'Important information about recognizing and responding to concussions',
      category: 'Safety',
      resource_type: 'pdf',
      url: '/safety/concussion-guide.pdf',
      file_size: 2100000,
      roles: ['parent'],
      rating: 4.9,
      downloads_count: 789,
      views_count: 1567,
      tags: ['safety', 'concussion', 'health'],
      is_mock: true
    },
    {
      id: 'mock-parent-4',
      title: 'How to Support Your Young Athlete (MOCK)',
      description: 'Guide for parents on supporting without pressuring',
      category: 'Support Resources',
      resource_type: 'video',
      url: 'https://example.com/parent-support',
      duration_seconds: 600,
      roles: ['parent'],
      rating: 4.7,
      views_count: 456,
      tags: ['support', 'parenting', 'youth sports'],
      is_mock: true
    },
    {
      id: 'mock-parent-5',
      title: 'Team Volunteer Opportunities Guide (MOCK)',
      description: 'Ways parents can help support the team',
      category: 'Support Resources',
      resource_type: 'template',
      url: '/templates/volunteer-guide.pdf',
      file_size: 800000,
      roles: ['parent'],
      rating: 4.5,
      downloads_count: 234,
      tags: ['volunteer', 'team support', 'parent involvement'],
      is_mock: true
    }
  ],
  club_director: [
    {
      id: 'mock-director-1',
      title: 'Club Registration Forms Package (MOCK)',
      description: 'Complete set of registration forms and waivers for club operations',
      category: 'Administration',
      resource_type: 'template',
      url: '/forms/registration-package.zip',
      file_size: 4500000,
      roles: ['club_director'],
      rating: 4.8,
      downloads_count: 123,
      tags: ['registration', 'forms', 'administration'],
      is_mock: true
    },
    {
      id: 'mock-director-2',
      title: 'Annual Budget Template (MOCK)',
      description: 'Comprehensive budget template for lacrosse clubs',
      category: 'Financial',
      resource_type: 'template',
      url: '/templates/annual-budget.xlsx',
      file_size: 2300000,
      roles: ['club_director'],
      rating: 4.9,
      downloads_count: 89,
      tags: ['budget', 'financial', 'planning'],
      is_mock: true
    },
    {
      id: 'mock-director-3',
      title: 'Coach Development Program Guide (MOCK)',
      description: 'Framework for implementing coach development programs',
      category: 'Coach Development',
      resource_type: 'pdf',
      url: '/guides/coach-development.pdf',
      file_size: 3800000,
      roles: ['club_director'],
      rating: 4.7,
      downloads_count: 67,
      views_count: 234,
      tags: ['coaching', 'development', 'training'],
      is_mock: true
    },
    {
      id: 'mock-director-4',
      title: 'Social Media Marketing Templates (MOCK)',
      description: 'Ready-to-use social media templates for club promotion',
      category: 'Marketing',
      resource_type: 'template',
      url: '/templates/social-media-pack.zip',
      file_size: 8900000,
      roles: ['club_director'],
      rating: 4.6,
      downloads_count: 156,
      tags: ['marketing', 'social media', 'promotion'],
      is_mock: true
    },
    {
      id: 'mock-director-5',
      title: 'Sponsorship Proposal Template (MOCK)',
      description: 'Professional sponsorship proposal template for securing funding',
      category: 'Financial',
      resource_type: 'template',
      url: '/templates/sponsorship-proposal.pdf',
      file_size: 1800000,
      roles: ['club_director'],
      rating: 4.8,
      downloads_count: 198,
      tags: ['sponsorship', 'fundraising', 'financial'],
      is_mock: true
    }
  ],
  administrator: [
    {
      id: 'mock-admin-1',
      title: 'POWLAX API Documentation (MOCK)',
      description: 'Complete API documentation for POWLAX platform integration',
      category: 'System Docs',
      resource_type: 'link',
      url: 'https://docs.powlax.com/api',
      roles: ['administrator'],
      rating: 4.9,
      views_count: 456,
      tags: ['API', 'documentation', 'integration'],
      is_mock: true
    },
    {
      id: 'mock-admin-2',
      title: 'Platform User Guide (MOCK)',
      description: 'Comprehensive user guide for POWLAX platform administration',
      category: 'Training Materials',
      resource_type: 'pdf',
      url: '/guides/platform-user-guide.pdf',
      file_size: 6700000,
      roles: ['administrator'],
      rating: 4.7,
      downloads_count: 234,
      views_count: 567,
      tags: ['user guide', 'training', 'platform'],
      is_mock: true
    },
    {
      id: 'mock-admin-3',
      title: 'Troubleshooting Guide (MOCK)',
      description: 'Common issues and solutions for platform administrators',
      category: 'Support Tools',
      resource_type: 'pdf',
      url: '/guides/troubleshooting.pdf',
      file_size: 3400000,
      roles: ['administrator'],
      rating: 4.8,
      downloads_count: 345,
      tags: ['troubleshooting', 'support', 'solutions'],
      is_mock: true
    },
    {
      id: 'mock-admin-4',
      title: 'Analytics Dashboard Guide (MOCK)',
      description: 'How to use and interpret platform analytics',
      category: 'Analytics',
      resource_type: 'video',
      url: 'https://example.com/analytics-guide',
      duration_seconds: 900,
      roles: ['administrator'],
      rating: 4.6,
      views_count: 234,
      tags: ['analytics', 'dashboard', 'metrics'],
      is_mock: true
    },
    {
      id: 'mock-admin-5',
      title: 'Database Schema Documentation (MOCK)',
      description: 'Complete database schema and relationships documentation',
      category: 'System Docs',
      resource_type: 'pdf',
      url: '/docs/database-schema.pdf',
      file_size: 2900000,
      roles: ['administrator'],
      rating: 4.9,
      downloads_count: 123,
      tags: ['database', 'schema', 'documentation'],
      is_mock: true
    }
  ]
}

// Mock user interactions
const MOCK_USER_INTERACTIONS: UserResourceInteraction[] = [
  {
    id: 'mock-interaction-1',
    user_id: 'current-user',
    resource_id: 'mock-coach-1',
    is_favorite: true,
    rating: 5,
    last_viewed: '2025-01-10T10:00:00Z',
    view_count: 3,
    download_count: 1
  },
  {
    id: 'mock-interaction-2',
    user_id: 'current-user',
    resource_id: 'mock-coach-2',
    is_favorite: true,
    rating: 4,
    last_viewed: '2025-01-09T14:30:00Z',
    view_count: 5,
    download_count: 0
  }
]

// Resource categories by role
export const RESOURCE_CATEGORIES = {
  coach: [
    { id: 'practice-planning', name: 'Practice Planning', icon: 'ClipboardList', color: 'bg-blue-500' },
    { id: 'training-videos', name: 'Training Videos', icon: 'Video', color: 'bg-red-500' },
    { id: 'certification', name: 'Certification', icon: 'Award', color: 'bg-green-500' },
    { id: 'team-management', name: 'Team Management', icon: 'Users', color: 'bg-purple-500' }
  ],
  player: [
    { id: 'skill-development', name: 'Skill Development', icon: 'Target', color: 'bg-blue-500' },
    { id: 'workouts', name: 'Workouts', icon: 'Activity', color: 'bg-red-500' },
    { id: 'game-film', name: 'Game Film', icon: 'Film', color: 'bg-green-500' },
    { id: 'rules-regulations', name: 'Rules & Regulations', icon: 'BookOpen', color: 'bg-purple-500' }
  ],
  parent: [
    { id: 'equipment-guide', name: 'Equipment Guide', icon: 'ShoppingBag', color: 'bg-blue-500' },
    { id: 'nutrition', name: 'Nutrition', icon: 'Apple', color: 'bg-red-500' },
    { id: 'safety', name: 'Safety', icon: 'Shield', color: 'bg-green-500' },
    { id: 'support-resources', name: 'Support Resources', icon: 'Heart', color: 'bg-purple-500' }
  ],
  club_director: [
    { id: 'administration', name: 'Administration', icon: 'FileText', color: 'bg-blue-500' },
    { id: 'financial', name: 'Financial', icon: 'DollarSign', color: 'bg-red-500' },
    { id: 'coach-development', name: 'Coach Development', icon: 'GraduationCap', color: 'bg-green-500' },
    { id: 'marketing', name: 'Marketing', icon: 'Megaphone', color: 'bg-purple-500' }
  ],
  administrator: [
    { id: 'system-docs', name: 'System Docs', icon: 'FileCode', color: 'bg-blue-500' },
    { id: 'training-materials', name: 'Training Materials', icon: 'BookOpen', color: 'bg-red-500' },
    { id: 'support-tools', name: 'Support Tools', icon: 'Wrench', color: 'bg-green-500' },
    { id: 'analytics', name: 'Analytics', icon: 'BarChart', color: 'bg-purple-500' }
  ]
}

// Data provider class
export class ResourceDataProvider {
  private supabase = supabase
  
  /**
   * Fetch resources for a specific user role
   * Attempts to fetch from Supabase first, falls back to mock data
   */
  async getResourcesForRole(role: string): Promise<Resource[]> {
    try {
      // First, try to fetch from Supabase
      const { data, error } = await this.supabase
        .from('powlax_resources')
        .select('*')
        .contains('roles', [role])
        .order('created_at', { ascending: false })
      
      if (error) {
        console.log('No real resource data found, using mock data:', error.message)
        // Table doesn't exist or error occurred, use mock data
        return this.getMockResourcesForRole(role)
      }
      
      if (data && data.length > 0) {
        console.log(`Found ${data.length} real resources for role: ${role}`)
        return data
      }
      
      // No data found, use mock
      console.log(`No resources found for role: ${role}, using mock data`)
      return this.getMockResourcesForRole(role)
    } catch (error) {
      console.log('Error fetching resources, using mock data:', error)
      return this.getMockResourcesForRole(role)
    }
  }
  
  /**
   * Get mock resources for a role
   */
  private getMockResourcesForRole(role: string): Resource[] {
    // Map role names to mock data keys
    const roleMap: Record<string, string> = {
      'team_coach': 'coach',
      'coach': 'coach',
      'player': 'player',
      'parent': 'parent',
      'club_director': 'club_director',
      'director': 'club_director',
      'administrator': 'administrator',
      'admin': 'administrator'
    }
    
    const mappedRole = roleMap[role] || 'player'
    return MOCK_RESOURCES[mappedRole] || []
  }
  
  /**
   * Get all resources (for search/filter)
   */
  async getAllResources(): Promise<Resource[]> {
    try {
      const { data, error } = await this.supabase
        .from('powlax_resources')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error || !data || data.length === 0) {
        // Use all mock resources
        return Object.values(MOCK_RESOURCES).flat()
      }
      
      return data
    } catch (error) {
      return Object.values(MOCK_RESOURCES).flat()
    }
  }
  
  /**
   * Get user's favorite resources
   */
  async getUserFavorites(userId: string): Promise<Resource[]> {
    try {
      // Try to get real favorites
      const { data: interactions, error } = await this.supabase
        .from('user_resource_interactions')
        .select('resource_id')
        .eq('user_id', userId)
        .eq('is_favorite', true)
      
      if (error || !interactions || interactions.length === 0) {
        // Return mock favorites
        const mockFavorites = MOCK_USER_INTERACTIONS
          .filter((i: UserResourceInteraction) => i.is_favorite)
          .map((i: UserResourceInteraction) => i.resource_id)
        
        return Object.values(MOCK_RESOURCES)
          .flat()
          .filter(r => mockFavorites.includes(r.id))
          .map(r => ({ ...r, title: r.title.replace(' (MOCK)', ' (MOCK - FAVORITED)') }))
      }
      
      // Fetch the actual resources
      const resourceIds = interactions.map((i: any) => i.resource_id)
      const { data: resources } = await this.supabase
        .from('powlax_resources')
        .select('*')
        .in('id', resourceIds)
      
      return resources || []
    } catch (error) {
      console.log('Error fetching favorites, using mock:', error)
      return []
    }
  }
  
  /**
   * Get recently viewed resources
   */
  async getRecentlyViewed(userId: string, limit: number = 5): Promise<Resource[]> {
    try {
      // Try to get real recently viewed
      const { data: interactions, error } = await this.supabase
        .from('user_resource_interactions')
        .select('resource_id, last_viewed')
        .eq('user_id', userId)
        .order('last_viewed', { ascending: false })
        .limit(limit)
      
      if (error || !interactions || interactions.length === 0) {
        // Return mock recently viewed
        return Object.values(MOCK_RESOURCES)
          .flat()
          .slice(0, limit)
          .map(r => ({ ...r, title: r.title.replace(' (MOCK)', ' (MOCK - RECENT)') }))
      }
      
      // Fetch the actual resources
      const resourceIds = interactions.map((i: any) => i.resource_id)
      const { data: resources } = await this.supabase
        .from('powlax_resources')
        .select('*')
        .in('id', resourceIds)
      
      return resources || []
    } catch (error) {
      console.log('Error fetching recent resources, using mock:', error)
      return Object.values(MOCK_RESOURCES).flat().slice(0, limit)
    }
  }
  
  /**
   * Toggle favorite status for a resource
   */
  async toggleFavorite(userId: string, resourceId: string): Promise<boolean> {
    try {
      // Check if interaction exists
      const { data: existing } = await this.supabase
        .from('user_resource_interactions')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .single()
      
      if (existing) {
        // Update existing
        const { error } = await this.supabase
          .from('user_resource_interactions')
          .update({ is_favorite: !existing.is_favorite })
          .eq('id', existing.id)
        
        return !error
      } else {
        // Create new
        const { error } = await this.supabase
          .from('user_resource_interactions')
          .insert({
            user_id: userId,
            resource_id: resourceId,
            is_favorite: true,
            view_count: 1,
            last_viewed: new Date().toISOString()
          })
        
        return !error
      }
    } catch (error) {
      console.log('Error toggling favorite (using mock):', error)
      // Just return success for mock data
      return true
    }
  }
  
  /**
   * Track resource view
   */
  async trackView(userId: string, resourceId: string): Promise<void> {
    try {
      // Update view count in interactions
      const { data: existing } = await this.supabase
        .from('user_resource_interactions')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .single()
      
      if (existing) {
        await this.supabase
          .from('user_resource_interactions')
          .update({
            view_count: (existing.view_count || 0) + 1,
            last_viewed: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        await this.supabase
          .from('user_resource_interactions')
          .insert({
            user_id: userId,
            resource_id: resourceId,
            is_favorite: false,
            view_count: 1,
            last_viewed: new Date().toISOString()
          })
      }
      
      // Update resource view count (only if function exists)
      try {
        await this.supabase.rpc('increment_resource_views', { resource_id: resourceId })
      } catch (e) {
        // RPC function doesn't exist yet, skip
      }
    } catch (error) {
      console.log('Error tracking view (mock mode):', error)
    }
  }
  
  /**
   * Get resource categories for a role
   */
  getCategoriesForRole(role: string): typeof RESOURCE_CATEGORIES.coach {
    const roleMap: Record<string, keyof typeof RESOURCE_CATEGORIES> = {
      'team_coach': 'coach',
      'coach': 'coach',
      'player': 'player',
      'parent': 'parent',
      'club_director': 'club_director',
      'director': 'club_director',
      'administrator': 'administrator',
      'admin': 'administrator'
    }
    
    const mappedRole = roleMap[role] || 'player'
    return RESOURCE_CATEGORIES[mappedRole as keyof typeof RESOURCE_CATEGORIES] || RESOURCE_CATEGORIES.player
  }
  
  /**
   * Search resources
   */
  async searchResources(query: string, filters?: {
    category?: string
    resource_type?: string
    role?: string
  }): Promise<Resource[]> {
    try {
      let supabaseQuery = this.supabase
        .from('powlax_resources')
        .select('*')
      
      // Add search
      if (query) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      }
      
      // Add filters
      if (filters?.category) {
        supabaseQuery = supabaseQuery.eq('category', filters.category)
      }
      if (filters?.resource_type) {
        supabaseQuery = supabaseQuery.eq('resource_type', filters.resource_type)
      }
      if (filters?.role) {
        supabaseQuery = supabaseQuery.contains('roles', [filters.role])
      }
      
      const { data, error } = await supabaseQuery
      
      if (error || !data || data.length === 0) {
        // Search mock data
        let mockResults = Object.values(MOCK_RESOURCES).flat()
        
        if (query) {
          const lowerQuery = query.toLowerCase()
          mockResults = mockResults.filter(r => 
            r.title.toLowerCase().includes(lowerQuery) ||
            r.description.toLowerCase().includes(lowerQuery)
          )
        }
        
        if (filters?.category) {
          mockResults = mockResults.filter(r => r.category === filters.category)
        }
        if (filters?.resource_type) {
          mockResults = mockResults.filter(r => r.resource_type === filters.resource_type)
        }
        if (filters?.role) {
          mockResults = mockResults.filter(r => r.roles?.includes(filters.role!))
        }
        
        return mockResults
      }
      
      return data
    } catch (error) {
      console.log('Error searching resources, using mock:', error)
      return Object.values(MOCK_RESOURCES).flat()
    }
  }
}

// Export singleton instance
export const resourceDataProvider = new ResourceDataProvider()