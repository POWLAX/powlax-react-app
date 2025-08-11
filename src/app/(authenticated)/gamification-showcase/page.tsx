'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Zap, Target, Shield, Crosshairs } from 'lucide-react'
import { useGamification } from '@/hooks/useGamification'
import './animations.css'

// Rank definitions (used for animations and display)
const RANKS = [
  { id: 'rookie', name: 'Rookie', icon: '🥉', minPoints: 0 },
  { id: 'player', name: 'Player', icon: '🥈', minPoints: 500 },
  { id: 'star', name: 'Star Player', icon: '🥇', minPoints: 1500 },
  { id: 'elite', name: 'Elite', icon: '💎', minPoints: 3000 },
  { id: 'legend', name: 'Legend', icon: '👑', minPoints: 5000 }
]

interface PlayerCardProps {
  player: {
    name: string
    rank: typeof RANKS[0]
    totalPoints: number
    pointTypes: Array<{
      id: string
      name: string
      symbol: string
      amount: number
      color: string
    }>
    badges: Array<{
      id: string
      name: string
      category: string
      icon: string
      earned: boolean
      earnedAt?: string
      progress?: number
      required?: number
    }>
  }
}

function PlayerCard({ player }: PlayerCardProps) {
  const earnedBadges = player.badges.filter(b => b.earned)
  
  return (
    <div className="relative bg-gradient-to-br from-powlax-blue via-blue-800 to-powlax-blue rounded-xl p-6 text-white shadow-2xl border border-blue-400/30 min-h-[400px]">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] rounded-xl" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{player.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl">{player.rank.icon}</span>
            <span className="text-lg font-semibold text-blue-200">{player.rank.name}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-blue-200">Total Points</div>
          <div className="text-2xl font-bold text-yellow-300">{player.totalPoints.toLocaleString()}</div>
        </div>
      </div>
      
      {/* Point Types */}
      <div className="relative z-10 grid grid-cols-2 gap-3 mb-6">
        {player.pointTypes.map((pointType, index) => (
          <div key={pointType.id} className="bg-black/20 rounded-lg p-3 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">{pointType.symbol}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-blue-200 truncate">{pointType.name}</div>
                <div className="text-lg font-bold" style={{ color: pointType.color }}>
                  {pointType.amount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Badges */}
      <div className="relative z-10">
        <div className="text-sm text-blue-200 mb-3">Earned Badges ({earnedBadges.length})</div>
        <div className="flex flex-wrap gap-2">
          {earnedBadges.map((badge) => (
            <div key={badge.id} className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-2 flex items-center gap-2 shadow-lg">
              {badge.icon?.startsWith('http') ? (
                <img src={badge.icon} alt={badge.name} className="w-6 h-6 object-contain" />
              ) : (
                <span className="text-lg">{badge.icon}</span>
              )}
              <span className="text-sm font-semibold text-yellow-900">{badge.name}</span>
            </div>
          ))}
          {earnedBadges.length === 0 && (
            <div className="text-blue-300 text-sm italic">No badges earned yet</div>
          )}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-xl" />
      <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-lg" />
    </div>
  )
}

function RankUpAnimation({ rank, onComplete }: { rank: typeof RANKS[0], onComplete: () => void }) {
  const [stage, setStage] = useState<'rising' | 'flipping' | 'revealing' | 'complete'>('rising')
  
  useEffect(() => {
    const timer1 = setTimeout(() => setStage('flipping'), 800)
    const timer2 = setTimeout(() => setStage('revealing'), 1200)
    const timer3 = setTimeout(() => setStage('complete'), 2200)
    const timer4 = setTimeout(onComplete, 3000)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [onComplete])
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className={`transform transition-all duration-1000 ease-out ${
        stage === 'rising' ? 'translate-y-full scale-0 rotate-12' : 
        stage === 'flipping' ? 'translate-y-0 scale-110 rotate-180' :
        'translate-y-0 scale-100 rotate-0'
      }`}>
        <Card className={`w-80 h-48 relative overflow-hidden ${
          stage === 'flipping' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 
          'bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700'
        }`}>
          <div className="absolute inset-0 flex items-center justify-center">
            {stage === 'flipping' ? (
              <div className="w-24 h-24 bg-gray-700 rounded-full animate-pulse" />
            ) : (
              <>
                <div className="text-center text-white">
                  <div className="text-6xl mb-2 animate-bounce">{rank.icon}</div>
                  <div className="text-2xl font-bold">RANK UP!</div>
                  <div className="text-lg">{rank.name}</div>
                </div>
                
                {/* Sparkle effects */}
                {stage === 'revealing' && (
                  <>
                    <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-ping" />
                    <div className="absolute top-8 right-6 w-1 h-1 bg-yellow-200 rounded-full animate-ping animation-delay-200" />
                    <div className="absolute bottom-6 left-8 w-3 h-3 bg-white rounded-full animate-ping animation-delay-400" />
                    <div className="absolute bottom-4 right-4 w-2 h-2 bg-yellow-200 rounded-full animate-ping animation-delay-600" />
                    <div className="absolute top-1/2 left-2 w-1 h-1 bg-white rounded-full animate-ping animation-delay-800" />
                    <div className="absolute top-1/3 right-2 w-2 h-2 bg-yellow-300 rounded-full animate-ping animation-delay-1000" />
                  </>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function BadgeEarnedAnimation({ badge, onComplete }: { badge: typeof MOCK_BADGES[0], onComplete: () => void }) {
  const [stage, setStage] = useState<'rising' | 'spinning' | 'revealing' | 'complete'>('rising')
  
  useEffect(() => {
    const timer1 = setTimeout(() => setStage('spinning'), 500)
    const timer2 = setTimeout(() => setStage('revealing'), 1500)
    const timer3 = setTimeout(() => setStage('complete'), 3000)
    const timer4 = setTimeout(onComplete, 4000)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [onComplete])
  
  // Mock player data for background
  const mockPlayer = {
    name: 'Patrick Chapla',
    rank: RANKS[2],
    totalPoints: 3210,
    pointTypes: MOCK_POINT_TYPES,
    badges: MOCK_BADGES
  }
  
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      {/* Player card background - fades in during revealing */}
      <div className={`absolute transition-opacity duration-1000 ${
        stage === 'revealing' || stage === 'complete' ? 'opacity-30' : 'opacity-0'
      }`}>
        <PlayerCard player={mockPlayer} />
      </div>
      
      {/* Badge animation */}
      <div className={`relative z-10 transform transition-all duration-1000 ease-out ${
        stage === 'rising' ? 'translate-y-full scale-0' : 
        stage === 'spinning' ? 'translate-y-0 scale-150 rotate-[1080deg]' :
        stage === 'revealing' ? 'translate-y-0 scale-110 rotate-[1080deg]' :
        'translate-y-0 scale-100 rotate-[1080deg]'
      }`}>
        <div className="relative">
          {/* Badge */}
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-300">
            {badge.icon?.startsWith('http') ? (
              <img src={badge.icon} alt={badge.name} className="w-20 h-20 object-contain" />
            ) : (
              <span className="text-4xl">{badge.icon}</span>
            )}
          </div>
          
          {/* Sparkle effects */}
          {stage === 'spinning' && (
            <>
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-white rounded-full animate-ping" />
              <div className="absolute -top-4 right-2 w-2 h-2 bg-yellow-200 rounded-full animate-ping animation-delay-200" />
              <div className="absolute bottom-2 -left-4 w-3 h-3 bg-white rounded-full animate-ping animation-delay-400" />
              <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-yellow-200 rounded-full animate-ping animation-delay-600" />
            </>
          )}
          
          {/* Achievement text */}
          {stage === 'revealing' && (
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center text-white">
              <div className="text-2xl font-bold animate-pulse">BADGE EARNED!</div>
              <div className="text-lg text-yellow-300">{badge.name}</div>
              <div className="text-sm text-blue-200">{badge.category}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GamificationShowcase() {
  // Use real gamification data
  const gamificationData = useGamification() // Can pass userId when available
  
  const [showRankUp, setShowRankUp] = useState(false)
  const [showBadgeEarned, setShowBadgeEarned] = useState(false)
  const [currentRankOverride, setCurrentRankOverride] = useState<typeof RANKS[0] | null>(null)
  const [earnedBadge, setEarnedBadge] = useState(gamificationData.badges[2] || {
    id: 'sample', name: 'Sample Badge', category: 'General', icon: '🏆', earned: false
  })
  
  const currentRank = currentRankOverride || gamificationData.currentRank
  
  // Player data using real gamification data
  const mockPlayer = {
    name: 'Patrick Chapla',
    rank: currentRank,
    totalPoints: gamificationData.totalPoints,
    pointTypes: gamificationData.pointTypes,
    badges: gamificationData.badges
  }
  
  const triggerRankUp = () => {
    const currentIndex = RANKS.indexOf(currentRank)
    if (currentIndex < RANKS.length - 1) {
      const nextRank = RANKS[currentIndex + 1]
      setCurrentRankOverride(nextRank)
      setShowRankUp(true)
    }
  }
  
  const triggerBadgeEarned = () => {
    const unearned = gamificationData.badges.find(b => !b.earned)
    if (unearned) {
      setEarnedBadge(unearned)
      setShowBadgeEarned(true)
    }
  }
  
  if (gamificationData.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading your achievements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            🎮 POWLAX Gamification Showcase
          </h1>
          <p className="text-xl text-blue-200">
            Experience the power of motivation through achievements, ranks, and rewards!
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex justify-center gap-6 mb-12">
          <Button 
            onClick={triggerRankUp}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-3 text-lg shadow-lg"
            disabled={currentRank.id === 'legend'}
          >
            <Trophy className="w-5 h-5 mr-2" />
            Trigger Rank Up
          </Button>
          
          <Button 
            onClick={triggerBadgeEarned}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-8 py-3 text-lg shadow-lg"
          >
            <Star className="w-5 h-5 mr-2" />
            Earn Badge
          </Button>
        </div>
        
        {/* Player Card */}
        <div className="flex justify-center mb-12">
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-white text-center mb-6">🏆 Player Profile</h2>
            <PlayerCard player={mockPlayer} />
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="p-6 bg-gradient-to-br from-green-600 to-green-700 text-white">
            <div className="flex items-center gap-4">
              <Target className="w-12 h-12 text-green-200" />
              <div>
                <h3 className="text-xl font-bold">Total Points</h3>
                <p className="text-3xl font-bold text-green-200">{mockPlayer.totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
            <div className="flex items-center gap-4">
              <Zap className="w-12 h-12 text-purple-200" />
              <div>
                <h3 className="text-xl font-bold">Badges Earned</h3>
                <p className="text-3xl font-bold text-purple-200">{gamificationData.badges.filter(b => b.earned).length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-yellow-600 to-yellow-700 text-white">
            <div className="flex items-center gap-4">
              <Shield className="w-12 h-12 text-yellow-200" />
              <div>
                <h3 className="text-xl font-bold">Current Rank</h3>
                <p className="text-2xl font-bold text-yellow-200 flex items-center gap-2">
                  <span className="text-3xl">{currentRank.icon}</span>
                  {currentRank.name}
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Badge Progress */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-6">🎯 Badge Progress</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gamificationData.badges.map((badge) => (
              <Card key={badge.id} className={`p-4 ${badge.earned ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' : 'bg-slate-800 border-slate-700'}`}>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {badge.icon?.startsWith('http') ? (
                      <img src={badge.icon} alt={badge.name} className="w-12 h-12 object-contain" />
                    ) : (
                      <div className="text-3xl">{badge.icon}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${badge.earned ? 'text-yellow-900' : 'text-white'}`}>{badge.name}</h3>
                    <p className={`text-sm ${badge.earned ? 'text-yellow-800' : 'text-slate-400'}`}>{badge.category}</p>
                    {!badge.earned && badge.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Progress</span>
                          <span>{badge.progress}/{badge.required}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(badge.progress! / badge.required!) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {badge.earned && (
                      <Badge className="mt-2 bg-yellow-800 text-yellow-100">
                        Earned {badge.earnedAt}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Motivational Footer */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-powlax-blue to-blue-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Keep Grinding, Champion! 💪</h2>
            <p className="text-lg text-blue-200 mb-6">
              Every workout brings you closer to greatness. Earn points, unlock badges, and climb the ranks!
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <Badge className="bg-yellow-500 text-yellow-900">+50 Points per workout</Badge>
              <Badge className="bg-green-500 text-green-900">Weekly challenges</Badge>
              <Badge className="bg-purple-500 text-purple-100">Seasonal rewards</Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animations */}
      {showRankUp && (
        <RankUpAnimation 
          rank={currentRank} 
          onComplete={() => setShowRankUp(false)} 
        />
      )}
      
      {showBadgeEarned && (
        <BadgeEarnedAnimation 
          badge={earnedBadge} 
          onComplete={() => setShowBadgeEarned(false)} 
        />
      )}
    </div>
  )
}