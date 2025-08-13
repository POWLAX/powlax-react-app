'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  BookOpen, 
  Users, 
  Target,
  Play,
  FileText,
  Plus,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Star
} from 'lucide-react'
import { useTeamPlaybook } from '@/hooks/useTeamPlaybook'
import { TeamPlaybookWithStrategy } from '@/types/teamPlaybook'
import { Strategy } from '@/hooks/useStrategies'
import StudyStrategyModal from '@/components/practice-planner/modals/StudyStrategyModal'
import { supabase } from '@/lib/supabase'

interface TeamPlaybookSectionProps {
  teamId: string
  teamName?: string
  isCoach: boolean // Show add/remove controls for coaches
  className?: string
}

// Game phases for grouping strategies
const GAME_PHASES = [
  'Face-Off',
  'Offensive Transition', 
  'Settled Offense',
  'Defensive Transition',
  'Settled Defense',
  'Clears',
  'Rides',
  'Special Situations',
  'Ground Ball',
  '1v1',
  'Team Play',
  'Other'
] as const

export default function TeamPlaybookSection({ 
  teamId, 
  teamName = 'Team',
  isCoach,
  className = ''
}: TeamPlaybookSectionProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [showStudyModal, setShowStudyModal] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const { 
    playbooks, 
    loading, 
    error, 
    removeFromPlaybook,
    refreshPlaybooks 
  } = useTeamPlaybook(teamId)

  // Get current user ID for permissions
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [])

  // Group playbooks by game phase
  const groupedPlaybooks = useMemo(() => {
    const groups = new Map<string, TeamPlaybookWithStrategy[]>()
    
    playbooks.forEach(playbook => {
      let category = 'Other' // default category
      
      // Determine category based on strategy categories or name
      const categories = playbook.strategy_categories?.toLowerCase() || ''
      const name = playbook.strategy_name?.toLowerCase() || ''
      const description = playbook.description?.toLowerCase() || ''
      
      // Check for face-off
      if (categories.includes('face') || name.includes('face') || categories.includes('faceoff')) {
        category = 'Face-Off'
      }
      // Check for offensive transition
      else if (categories.includes('transition') && (categories.includes('offensive') || categories.includes('offense'))) {
        category = 'Offensive Transition'
      }
      // Check for settled offense
      else if (categories.includes('settled') && (categories.includes('offensive') || categories.includes('offense'))) {
        category = 'Settled Offense'
      }
      // Check for defensive transition
      else if (categories.includes('transition') && (categories.includes('defensive') || categories.includes('defense'))) {
        category = 'Defensive Transition'
      }
      // Check for settled defense
      else if (categories.includes('settled') && (categories.includes('defensive') || categories.includes('defense'))) {
        category = 'Settled Defense'
      }
      // Check for clears
      else if (categories.includes('clear') || name.includes('clear')) {
        category = 'Clears'
      }
      // Check for rides
      else if (categories.includes('ride') || name.includes('ride')) {
        category = 'Rides'
      }
      // Check for special situations
      else if (categories.includes('man up') || categories.includes('man down') || categories.includes('special')) {
        category = 'Special Situations'
      }
      // Check for ground ball
      else if (categories.includes('ground') || name.includes('ground')) {
        category = 'Ground Ball'
      }
      // Check for 1v1
      else if (categories.includes('1v1') || name.includes('1v1') || categories.includes('dodge')) {
        category = '1v1'
      }
      // Check for team play
      else if (categories.includes('team') || categories.includes('communication')) {
        category = 'Team Play'
      }
      
      if (!groups.has(category)) {
        groups.set(category, [])
      }
      groups.get(category)!.push(playbook)
    })

    // Convert to array and sort by phase order
    return Array.from(groups.entries())
      .map(([category, strategies]) => ({
        category,
        strategies: strategies.sort((a, b) => 
          (a.custom_name || a.strategy_name).localeCompare(b.custom_name || b.strategy_name)
        )
      }))
      .sort((a, b) => {
        const aIndex = GAME_PHASES.indexOf(a.category as any)
        const bIndex = GAME_PHASES.indexOf(b.category as any)
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
      })
  }, [playbooks])

  const handleOpenStrategy = (playbook: TeamPlaybookWithStrategy) => {
    // Convert playbook to strategy format for StudyStrategyModal
    const strategy: Strategy = {
      id: playbook.strategy_id,
      strategy_name: playbook.custom_name || playbook.strategy_name,
      strategy_categories: playbook.strategy_categories,
      description: playbook.description,
      lacrosse_lab_links: playbook.lacrosse_lab_links,
      vimeo_link: playbook.vimeo_link,
      thumbnail_urls: playbook.thumbnail_urls,
      master_pdf_url: playbook.master_pdf_url,
      source: playbook.strategy_source as 'powlax' | 'user'
    } as Strategy
    
    setSelectedStrategy(strategy)
    setShowStudyModal(true)
  }

  const handleRemoveStrategy = async (playbookId: string) => {
    if (confirm('Are you sure you want to remove this strategy from the team playbook?')) {
      await removeFromPlaybook(playbookId)
    }
  }

  const handleAddStrategy = () => {
    // Navigate to practice planner strategy tab
    window.open('/practiceplan?tab=strategies', '_blank')
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-powlax-blue" />
            Team Playbook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-powlax-blue mb-2" />
              <p className="text-gray-600 text-sm">Loading team playbook...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-powlax-blue" />
            Team Playbook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-6 w-6 mx-auto text-red-500 mb-2" />
              <p className="text-red-600 text-sm font-medium">Failed to load playbook</p>
              <p className="text-gray-600 text-xs mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshPlaybooks}
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-powlax-blue" />
              Team Playbook
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPlaybooks}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              
              {isCoach && (
                <Button
                  onClick={handleAddStrategy}
                  size="sm"
                  className="bg-powlax-blue hover:bg-powlax-blue/90"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{playbooks.length} strategies</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{groupedPlaybooks.length} categories</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {playbooks.length === 0 ? (
            <div className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h4 className="font-medium text-gray-900 mb-2">No strategies in playbook</h4>
              <p className="text-gray-600 text-sm mb-4">
                {isCoach 
                  ? 'Add strategies from the Practice Planner to build your team playbook'
                  : 'Your coach will add strategies to the team playbook'
                }
              </p>
              {isCoach && (
                <Button 
                  onClick={handleAddStrategy}
                  className="bg-powlax-blue hover:bg-powlax-blue/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Strategy
                </Button>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-4">
                {groupedPlaybooks.map(({ category, strategies }) => (
                  <div key={category}>
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-powlax-blue text-white text-xs">
                        {category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {strategies.length} {strategies.length === 1 ? 'strategy' : 'strategies'}
                      </span>
                    </div>

                    {/* Strategy List */}
                    <div className="space-y-2 ml-2">
                      {strategies.map((playbook) => (
                        <div
                          key={playbook.id}
                          className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                          onClick={() => handleOpenStrategy(playbook)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-gray-900 text-sm truncate">
                                {playbook.custom_name || playbook.strategy_name}
                              </h5>
                              
                              {/* Media indicators */}
                              <div className="flex items-center gap-1">
                                {playbook.lacrosse_lab_links && (
                                  <Target className="h-3 w-3 text-green-600" />
                                )}
                                {playbook.vimeo_link && (
                                  <Play className="h-3 w-3 text-blue-600" />
                                )}
                                {playbook.master_pdf_url && (
                                  <FileText className="h-3 w-3 text-red-600" />
                                )}
                              </div>
                            </div>
                            
                            {playbook.team_notes && (
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {playbook.team_notes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isCoach && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveStrategy(playbook.id)
                                }}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <span className="text-red-500 text-xs">×</span>
                              </Button>
                            )}
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Study Strategy Modal */}
      {selectedStrategy && (
        <StudyStrategyModal
          isOpen={showStudyModal}
          onClose={() => {
            setShowStudyModal(false)
            setSelectedStrategy(null)
          }}
          strategy={selectedStrategy as any}
        />
      )}
    </>
  )
}