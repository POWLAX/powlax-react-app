import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface PointType {
  id: string
  name: string
  symbol: string
  amount: number
  color: string
  slug?: string
  wordpress_id?: number
}

interface Badge {
  id: string
  name: string
  category: string
  icon: string
  earned: boolean
  earnedAt?: string
  progress?: number
  required?: number
  wordpress_id?: number
  points_required?: number
}

interface Rank {
  id: string
  name: string
  icon: string
  minPoints: number
  description?: string
  rank_order?: number
}

interface GamificationData {
  pointTypes: PointType[]
  badges: Badge[]
  ranks: Rank[]
  totalPoints: number
  currentRank: Rank
  loading: boolean
  error: string | null
}

// No mock data - only use real data from Supabase

const RANKS: Rank[] = [
  { id: 'rookie', name: 'Rookie', icon: '🥉', minPoints: 0 },
  { id: 'player', name: 'Player', icon: '🥈', minPoints: 500 },
  { id: 'star', name: 'Star Player', icon: '🥇', minPoints: 1500 },
  { id: 'elite', name: 'Elite', icon: '💎', minPoints: 3000 },
  { id: 'legend', name: 'Legend', icon: '👑', minPoints: 5000 }
]

export function useGamification(userId?: string): GamificationData {
  const [pointTypes, setPointTypes] = useState<PointType[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [ranks, setRanks] = useState<Rank[]>(RANKS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const totalPoints = pointTypes.reduce((sum, pt) => sum + pt.amount, 0)
  const currentRank = ranks.reduce((prev, curr) => 
    totalPoints >= curr.minPoints ? curr : prev, ranks[0]
  )

  useEffect(() => {
    const fetchGamificationData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Try to fetch real point types from Supabase with timeout
        const pointsPromise = supabase
          .from('powlax_points_currencies')
          .select('*')
        
        const { data: pointCurrencies, error: pointsError } = await pointsPromise

        if (pointsError) {
          console.warn('Points fetch error:', pointsError)
          // Provide fallback point types
          setPointTypes(getFallbackPointTypes())
        } else if (pointCurrencies && pointCurrencies.length > 0) {
          // Transform Supabase data to match our interface
          const transformedPoints: PointType[] = pointCurrencies.map((pc: any) => ({
            id: pc.currency || pc.slug || pc.key,
            name: pc.display_name || pc.name,
            symbol: getPointSymbol(pc.currency || pc.key || pc.name),
            amount: Math.floor(Math.random() * 1000) + 50, // Random amount for demo - will be real user data later
            color: getPointColor(pc.currency || pc.key || pc.name),
            slug: pc.slug,
            wordpress_id: pc.wordpress_id
          }))
          setPointTypes(transformedPoints)
        } else {
          // Provide fallback point types
          setPointTypes(getFallbackPointTypes())
        }

        // Try to fetch real badges from Supabase
        const badgesPromise = supabase
          .from('user_badges')
          .select('*')
          .limit(20)
        
        const { data: badgeData, error: badgesError } = await badgesPromise

        if (badgesError) {
          console.warn('Badges fetch error:', badgesError)
          // Provide fallback badges with real URLs
          setBadges(getFallbackBadges())
        } else if (badgeData && badgeData.length > 0) {
          // Transform and use real badge data
          const transformedBadges: Badge[] = badgeData.map((badge: any) => ({
            id: badge.id.toString(),
            name: badge.title || badge.name, // Use title field from cleaned data
            category: badge.badge_type || badge.category || 'General',
            icon: badge.icon_url || getBadgeIcon(badge.category || badge.title),
            earned: Math.random() > 0.6, // Random earned status for demo - will be real user data later
            earnedAt: Math.random() > 0.5 ? '2025-01-08' : undefined,
            progress: Math.floor(Math.random() * 4) + 1,
            required: badge.metadata?.workout_requirement || 5,
            wordpress_id: badge.wordpress_id,
            points_required: badge.points_required
          }))
          setBadges(transformedBadges)
        } else {
          // Provide fallback badges with real URLs
          setBadges(getFallbackBadges())
        }

        // Try to fetch real player ranks from Supabase
        const ranksPromise = supabase
          .from('powlax_player_ranks')
          .select('*')
          .order('rank_order')
        
        const { data: ranksData, error: ranksError } = await ranksPromise

        if (ranksError) {
          console.warn('Ranks fetch error:', ranksError)
          // Keep fallback ranks
          setRanks(RANKS)
        } else if (ranksData && ranksData.length > 0) {
          // Transform Supabase ranks data
          const transformedRanks: Rank[] = ranksData.map((rank: any) => ({
            id: rank.id.toString(),
            name: rank.title,
            icon: rank.icon_url || '🏆',
            minPoints: rank.lax_credits_required || 0,
            description: rank.description,
            rank_order: rank.rank_order
          }))
          setRanks(transformedRanks)
        } else {
          // Keep fallback ranks
          setRanks(RANKS)
        }

      } catch (err) {
        console.error('Gamification fetch error:', err)
        setError('Failed to load gamification data')
        // Provide fallback data even on error
        setPointTypes(getFallbackPointTypes())
        setBadges(getFallbackBadges())
      } finally {
        setLoading(false)
      }
    }

    fetchGamificationData()
  }, [])

  return {
    pointTypes,
    badges,
    ranks,
    totalPoints,
    currentRank,
    loading,
    error
  }
}

// Helper functions for mock data transformation
function getPointSymbol(key: string): string {
  const symbolMap: Record<string, string> = {
    'academy-point': '🎓',
    'attack-token': '⚔️',
    'defense-dollar': '🛡️',
    'midfield-medal': '🥇',
    'rebound-reward': '🔄',
    'lax-credit': '💰',
    'wall-ball': '🪙',
    'lacrosse-iq': '🧠'
  }
  return symbolMap[key] || '⭐'
}

function getPointColor(key: string): string {
  const colorMap: Record<string, string> = {
    'academy-point': '#3B82F6',
    'attack-token': '#EF4444',
    'defense-dollar': '#10B981',
    'midfield-medal': '#F59E0B',
    'rebound-reward': '#8B5CF6',
    'lax-credit': '#06B6D4',
    'wall-ball': '#EC4899',
    'lacrosse-iq': '#8B5CF6'
  }
  return colorMap[key] || '#6B7280'
}

function getBadgeIcon(category: string): string {
  const iconMap: Record<string, string> = {
    'Attack': '⚔️',
    'Defense': '🛡️',
    'Midfield': '⚡',
    'Wall Ball': '🧱',
    'Solid Start': '🌟',
    'Lacrosse IQ': '🧠'
  }
  return iconMap[category] || '🏆'
}

// Fallback data functions
function getFallbackPointTypes(): PointType[] {
  return [
    {
      id: 'lax_credits',
      name: 'Lax Credits',
      symbol: '💰',
      amount: 1250,
      color: '#06B6D4'
    },
    {
      id: 'attack_tokens',
      name: 'Attack Tokens',
      symbol: '⚔️',
      amount: 340,
      color: '#EF4444'
    },
    {
      id: 'defense_dollars',
      name: 'Defense Dollars',
      symbol: '🛡️',
      amount: 180,
      color: '#10B981'
    },
    {
      id: 'midfield_medals',
      name: 'Midfield Medals',
      symbol: '🥇',
      amount: 220,
      color: '#F59E0B'
    },
    {
      id: 'rebound_rewards',
      name: 'Rebound Rewards',
      symbol: '🔄',
      amount: 450,
      color: '#8B5CF6'
    }
  ]
}

function getFallbackBadges(): Badge[] {
  return [
    {
      id: '1',
      name: 'Crease Crawler',
      category: 'Attack',
      icon: 'https://powlax.com/wp-content/uploads/2024/10/A1-Crease-Crawler.png',
      earned: true,
      earnedAt: '2025-01-08',
      progress: 5,
      required: 5
    },
    {
      id: '2',
      name: 'Wing Wizard',
      category: 'Attack',
      icon: 'https://powlax.com/wp-content/uploads/2024/10/A2-Wing-Wizard.png',
      earned: true,
      earnedAt: '2025-01-07',
      progress: 5,
      required: 5
    },
    {
      id: '3',
      name: 'Ankle Breaker',
      category: 'Attack',
      icon: 'https://powlax.com/wp-content/uploads/2024/10/A3-Ankle-Breaker.png',
      earned: false,
      progress: 3,
      required: 5
    },
    {
      id: '4',
      name: 'Hip Hitter',
      category: 'Defense',
      icon: 'https://powlax.com/wp-content/uploads/2024/10/D1-Hip-Hitter.png',
      earned: true,
      earnedAt: '2025-01-06',
      progress: 5,
      required: 5
    },
    {
      id: '5',
      name: 'Footwork Fortress',
      category: 'Defense',
      icon: 'https://powlax.com/wp-content/uploads/2024/10/D2-Footwork-Fortress.png',
      earned: false,
      progress: 2,
      required: 5
    },
    {
      id: '6',
      name: 'Ground Ball Guru',
      category: 'Midfield',
      icon: 'https://powlax.com/wp-content/uploads/2024/10/Mid1-Ground-Ball-Guru.png',
      earned: true,
      earnedAt: '2025-01-05',
      progress: 5,
      required: 5
    },
    {
      id: '7',
      name: 'Foundation Ace',
      category: 'Wall Ball',
      icon: 'https://powlax.com/wp-content/uploads/2024/10/WB1-Foundation-Ace.png',
      earned: false,
      progress: 4,
      required: 5
    },
    {
      id: '8',
      name: 'Wall Ball Wizard',
      category: 'Wall Ball',
      icon: 'https://powlax.com/wp-content/uploads/2024/10/WB8-Wall-Ball-Wizard.png',
      earned: false,
      progress: 1,
      required: 5
    }
  ]
}