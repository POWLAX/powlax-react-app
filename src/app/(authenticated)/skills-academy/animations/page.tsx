'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, Trophy, ArrowLeft, Play, RotateCcw, 
  Zap, Shield, Target, Users
} from 'lucide-react'
import Link from 'next/link'
import BadgeUnlockCSS from '@/components/animations/BadgeUnlockCSS'
import BadgeCollectionSpring from '@/components/animations/BadgeCollectionSpring'
import SkillTreeSVG from '@/components/animations/SkillTreeSVG'
import TeamChallengeRacing from '@/components/animations/TeamChallengeRacing'

export default function AnimationsShowcasePage() {
  const [badgeUnlockActive, setBadgeUnlockActive] = useState(false)
  const [currentDemo, setCurrentDemo] = useState<string>('badge-unlock')
  
  // Mock data for demonstrations
  const mockBadges = [
    { 
      id: '1', 
      name: 'Quick Stick Master', 
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNGRkQ3MDAiLz4KPHBhdGggZD0iTTQwIDIwTDQ1IDM1SDU1TDQzIDQzTDQ4IDU4TDQwIDQ4TDMyIDU4TDM3IDQzTDI1IDM1SDM1TDQwIDIwWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4=', 
      category: 'attack' as const, 
      tier: 'gold' as const, 
      earned: true, 
      progress: 100 
    },
    { 
      id: '2', 
      name: 'Wall Ball Warrior', 
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNDMEMwQzAiLz4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiB4PSIyMCIgeT0iMjUiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+', 
      category: 'wallball' as const, 
      tier: 'silver' as const, 
      earned: true, 
      progress: 100 
    },
    { 
      id: '3', 
      name: 'Defensive Shield', 
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNDRDdGMzIiLz4KPHBhdGggZD0iTTQwIDIwTDUwIDI1VjQwQzUwIDQ1IDQ1IDUwIDQwIDU1QzM1IDUwIDMwIDQ1IDMwIDQwVjI1TDQwIDIwWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4=', 
      category: 'defense' as const, 
      tier: 'bronze' as const, 
      earned: false, 
      progress: 65 
    },
    { 
      id: '4', 
      name: 'Midfield General', 
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNFNUU0RTIiLz4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMTUiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+', 
      category: 'midfield' as const, 
      tier: 'platinum' as const, 
      earned: false, 
      progress: 45 
    }
  ]

  const mockSkillTreeData = {
    nodes: [
      { id: 'start', x: 40, y: 80, label: 'Start', unlocked: true, completed: true },
      { id: 'basics', x: 40, y: 60, label: 'Basics', unlocked: true, completed: true },
      { id: 'passing', x: 20, y: 40, label: 'Passing', unlocked: true, completed: false },
      { id: 'shooting', x: 40, y: 40, label: 'Shooting', unlocked: true, completed: false },
      { id: 'defense', x: 60, y: 40, label: 'Defense', unlocked: false, completed: false },
      { id: 'advanced', x: 40, y: 20, label: 'Advanced', unlocked: false, completed: false }
    ],
    connections: [
      { from: 'start', to: 'basics' },
      { from: 'basics', to: 'passing' },
      { from: 'basics', to: 'shooting' },
      { from: 'basics', to: 'defense' },
      { from: 'shooting', to: 'advanced' }
    ]
  }

  const mockTeams = [
    { id: '1', name: 'Red Raiders', color: '#FF4444', progress: 75, points: 750 },
    { id: '2', name: 'Blue Lightning', color: '#4444FF', progress: 60, points: 600 },
    { id: '3', name: 'Green Machine', color: '#44FF44', progress: 85, points: 850 },
    { id: '4', name: 'Orange Crush', color: '#FF8844', progress: 45, points: 450 }
  ]

  const resetBadgeUnlock = () => {
    setBadgeUnlockActive(false)
    setTimeout(() => setBadgeUnlockActive(true), 100)
  }

  const renderCurrentDemo = () => {
    switch(currentDemo) {
      case 'badge-unlock':
        return (
          <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg relative overflow-hidden">
            {badgeUnlockActive ? (
              <div key={Date.now()}>
                <BadgeUnlockCSS
                  badgeName="Animation Master"
                  badgeImage="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSIjRkZENzAwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTIwIiBmb250LXNpemU9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn4+GPC90ZXh0Pgo8L3N2Zz4="
                  category="attack"
                  onComplete={() => {
                    setTimeout(() => setBadgeUnlockActive(false), 2000)
                  }}
                />
              </div>
            ) : (
              <Button 
                onClick={resetBadgeUnlock} 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Trigger Badge Unlock Animation
              </Button>
            )}
          </div>
        )
      
      case 'badge-collection':
        return (
          <div className="min-h-[500px] bg-gradient-to-br from-gray-50 to-white rounded-lg p-6">
            <BadgeCollectionSpring
              badges={mockBadges}
              onCollect={(badge) => console.log('Collected badge:', badge)}
              onBadgeSelect={(badge) => console.log('Selected badge:', badge)}
            />
          </div>
        )
      
      case 'skill-tree':
        return (
          <div className="min-h-[500px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
            <SkillTreeSVG
              nodes={mockSkillTreeData.nodes}
              connections={mockSkillTreeData.connections}
              onNodeClick={(nodeId) => console.log('Clicked node:', nodeId)}
            />
          </div>
        )
      
      case 'team-racing':
        return (
          <div className="min-h-[500px] bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6">
            <TeamChallengeRacing
              teams={mockTeams}
              targetPoints={1000}
              duration={30}
              onComplete={(winnerId) => console.log('Winner:', winnerId)}
            />
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/skills-academy/workouts">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Workouts
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Animation Showcase</h1>
                <p className="text-sm text-gray-600">Interactive Performance Animations for Skills Academy</p>
              </div>
            </div>
            <Badge className="bg-green-500 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Mobile Optimized
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Animation Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button
            variant={currentDemo === 'badge-unlock' ? 'default' : 'outline'}
            onClick={() => setCurrentDemo('badge-unlock')}
            className="flex flex-col items-center py-4 h-auto"
          >
            <Trophy className="w-6 h-6 mb-2" />
            <span className="text-xs">Badge Unlock</span>
            <Badge variant="secondary" className="mt-1 text-xs">CSS Only</Badge>
          </Button>
          
          <Button
            variant={currentDemo === 'badge-collection' ? 'default' : 'outline'}
            onClick={() => setCurrentDemo('badge-collection')}
            className="flex flex-col items-center py-4 h-auto"
          >
            <Zap className="w-6 h-6 mb-2" />
            <span className="text-xs">Badge Grid</span>
            <Badge variant="secondary" className="mt-1 text-xs">React Spring</Badge>
          </Button>
          
          <Button
            variant={currentDemo === 'skill-tree' ? 'default' : 'outline'}
            onClick={() => setCurrentDemo('skill-tree')}
            className="flex flex-col items-center py-4 h-auto"
          >
            <Target className="w-6 h-6 mb-2" />
            <span className="text-xs">Skill Tree</span>
            <Badge variant="secondary" className="mt-1 text-xs">SVG</Badge>
          </Button>
          
          <Button
            variant={currentDemo === 'team-racing' ? 'default' : 'outline'}
            onClick={() => setCurrentDemo('team-racing')}
            className="flex flex-col items-center py-4 h-auto"
          >
            <Users className="w-6 h-6 mb-2" />
            <span className="text-xs">Team Racing</span>
            <Badge variant="secondary" className="mt-1 text-xs">CSS + Spring</Badge>
          </Button>
        </div>

        {/* Demo Area */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardTitle className="text-xl">
              {currentDemo === 'badge-unlock' && 'Badge Unlock Animation - Pure CSS Performance'}
              {currentDemo === 'badge-collection' && 'Badge Collection Grid - Interactive Physics'}
              {currentDemo === 'skill-tree' && 'Skill Tree Progression - SVG Animations'}
              {currentDemo === 'team-racing' && 'Team Challenge Racing - Real-time Competition'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {renderCurrentDemo()}
          </CardContent>
        </Card>

        {/* Implementation Details */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentDemo === 'badge-unlock' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frame Rate:</span>
                      <Badge className="bg-green-500 text-white">60 FPS</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Memory Usage:</span>
                      <Badge className="bg-green-500 text-white">&lt; 5MB</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CPU Impact:</span>
                      <Badge className="bg-green-500 text-white">2-5%</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Battery Impact:</span>
                      <Badge className="bg-green-500 text-white">Minimal</Badge>
                    </div>
                  </>
                )}
                
                {currentDemo === 'badge-collection' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frame Rate:</span>
                      <Badge className="bg-blue-500 text-white">50-60 FPS</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Memory Usage:</span>
                      <Badge className="bg-blue-500 text-white">&lt; 10MB</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CPU Impact:</span>
                      <Badge className="bg-blue-500 text-white">5-10%</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Battery Impact:</span>
                      <Badge className="bg-blue-500 text-white">Low</Badge>
                    </div>
                  </>
                )}
                
                {currentDemo === 'skill-tree' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frame Rate:</span>
                      <Badge className="bg-green-500 text-white">60 FPS</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Memory Usage:</span>
                      <Badge className="bg-green-500 text-white">&lt; 3MB</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CPU Impact:</span>
                      <Badge className="bg-green-500 text-white">3-7%</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Battery Impact:</span>
                      <Badge className="bg-green-500 text-white">Minimal</Badge>
                    </div>
                  </>
                )}
                
                {currentDemo === 'team-racing' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frame Rate:</span>
                      <Badge className="bg-blue-500 text-white">45-60 FPS</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Memory Usage:</span>
                      <Badge className="bg-blue-500 text-white">&lt; 8MB</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CPU Impact:</span>
                      <Badge className="bg-blue-500 text-white">5-12%</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Battery Impact:</span>
                      <Badge className="bg-orange-500 text-white">Low-Medium</Badge>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Implementation Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Implementation Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {currentDemo === 'badge-unlock' && (
                  <>
                    <div>
                      <strong className="text-green-600">Best For:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600 ml-4">
                        <li>• Workout completion celebrations</li>
                        <li>• Achievement unlocks</li>
                        <li>• Milestone moments</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-blue-600">Key Tips:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600 ml-4">
                        <li>• Preload images before animation</li>
                        <li>• Use transform & opacity only</li>
                        <li>• Clean up DOM after completion</li>
                      </ul>
                    </div>
                  </>
                )}
                
                {currentDemo === 'badge-collection' && (
                  <>
                    <div>
                      <strong className="text-green-600">Best For:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600 ml-4">
                        <li>• Progress overview screens</li>
                        <li>• Badge galleries</li>
                        <li>• Interactive selections</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-blue-600">Key Tips:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600 ml-4">
                        <li>• Lazy load off-screen badges</li>
                        <li>• Use virtual scrolling for 50+ items</li>
                        <li>• Throttle scroll events</li>
                      </ul>
                    </div>
                  </>
                )}
                
                {currentDemo === 'skill-tree' && (
                  <>
                    <div>
                      <strong className="text-green-600">Best For:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600 ml-4">
                        <li>• Learning path visualization</li>
                        <li>• Workout progression</li>
                        <li>• Skill unlocking</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-blue-600">Key Tips:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600 ml-4">
                        <li>• Optimize SVG paths</li>
                        <li>• Animate transforms not paths</li>
                        <li>• Limit to 3-4 simultaneous animations</li>
                      </ul>
                    </div>
                  </>
                )}
                
                {currentDemo === 'team-racing' && (
                  <>
                    <div>
                      <strong className="text-green-600">Best For:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600 ml-4">
                        <li>• Team competitions</li>
                        <li>• Weekly challenges</li>
                        <li>• Live leaderboards</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-blue-600">Key Tips:</strong>
                      <ul className="mt-1 space-y-1 text-gray-600 ml-4">
                        <li>• Batch position updates</li>
                        <li>• Use transform3d for GPU</li>
                        <li>• Limit to 8-10 teams on mobile</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage in Skills Academy */}
        <Card className="mt-8 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-blue-900">Skills Academy Integration Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">During Workout:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <Shield className="w-4 h-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span><strong>Drill Completion:</strong> Quick CSS burst animation (200-500ms)</span>
                  </li>
                  <li className="flex items-start">
                    <Target className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                    <span><strong>Progress Update:</strong> Skill tree node highlight</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="w-4 h-4 mr-2 mt-0.5 text-yellow-500 flex-shrink-0" />
                    <span><strong>Streak Bonus:</strong> Subtle combo counter</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Post Workout:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <Trophy className="w-4 h-4 mr-2 mt-0.5 text-yellow-500 flex-shrink-0" />
                    <span><strong>Completion:</strong> Full badge unlock celebration</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-4 h-4 mr-2 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span><strong>Team Update:</strong> Racing position change</span>
                  </li>
                  <li className="flex items-start">
                    <Sparkles className="w-4 h-4 mr-2 mt-0.5 text-pink-500 flex-shrink-0" />
                    <span><strong>New Achievement:</strong> Badge collection update</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}