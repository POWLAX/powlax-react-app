'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Filter, 
  BookOpen, 
  Users, 
  Target,
  Play,
  FileText,
  RefreshCw,
  AlertCircle,
  Plus
} from 'lucide-react'
import PlaybookCard from './PlaybookCard'
import { useTeamPlaybook } from '@/hooks/useTeamPlaybook'
import { TeamPlaybookWithStrategy } from '@/types/teamPlaybook'
import { Strategy } from '@/hooks/useStrategies'
import StudyStrategyModal from '@/components/practice-planner/modals/StudyStrategyModal'
import { supabase } from '@/lib/supabase'

interface TeamPlaybookProps {
  teamId: string
  teamName?: string
  onAddStrategy?: () => void
}

// Game phases for filtering
const GAME_PHASES = [
  'All Phases',
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
  'Team Play'
] as const

export default function TeamPlaybook({ 
  teamId, 
  teamName = 'Team',
  onAddStrategy
}: TeamPlaybookProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPhase, setSelectedPhase] = useState('All Phases')
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

  // Filter playbooks based on search and phase
  const filteredPlaybooks = useMemo(() => {
    let filtered = playbooks

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(playbook => 
        (playbook.custom_name || playbook.strategy_name).toLowerCase().includes(term) ||
        playbook.strategy_categories?.toLowerCase().includes(term) ||
        playbook.description?.toLowerCase().includes(term) ||
        playbook.team_notes?.toLowerCase().includes(term)
      )
    }

    // Filter by game phase
    if (selectedPhase !== 'All Phases') {
      filtered = filtered.filter(playbook => {
        const categories = playbook.strategy_categories?.toLowerCase() || ''
        const description = playbook.description?.toLowerCase() || ''
        const name = playbook.strategy_name?.toLowerCase() || ''
        
        const phaseKeywords = getPhaseKeywords(selectedPhase)
        return phaseKeywords.some(keyword => 
          categories.includes(keyword) || 
          description.includes(keyword) ||
          name.includes(keyword)
        )
      })
    }

    return filtered
  }, [playbooks, searchTerm, selectedPhase])

  // Group playbooks by category
  const groupedPlaybooks = useMemo(() => {
    const groups = new Map<string, TeamPlaybookWithStrategy[]>()
    
    filteredPlaybooks.forEach(playbook => {
      const category = playbook.strategy_categories || 'Uncategorized'
      if (!groups.has(category)) {
        groups.set(category, [])
      }
      groups.get(category)!.push(playbook)
    })

    // Convert to array and sort
    return Array.from(groups.entries())
      .map(([category, strategies]) => ({
        category,
        strategies: strategies.sort((a, b) => 
          (a.custom_name || a.strategy_name).localeCompare(b.custom_name || b.strategy_name)
        )
      }))
      .sort((a, b) => {
        // Sort categories
        if (a.category === 'Uncategorized') return 1
        if (b.category === 'Uncategorized') return -1
        return a.category.localeCompare(b.category)
      })
  }, [filteredPlaybooks])

  const handleOpenStrategy = (strategy: Strategy) => {
    setSelectedStrategy(strategy)
    setShowStudyModal(true)
  }

  const handleDeleteStrategy = async (playbookId: string) => {
    await removeFromPlaybook(playbookId)
  }

  const handleRefresh = () => {
    refreshPlaybooks()
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-powlax-blue" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Team Playbook</h1>
              <p className="text-sm text-gray-600">{teamName} Strategy Collection</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {onAddStrategy && (
              <Button
                onClick={onAddStrategy}
                size="sm"
                className="bg-powlax-blue hover:bg-powlax-blue/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Strategy
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search playbook strategies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Game Phase Filter */}
          <div className="w-full sm:w-48">
            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GAME_PHASES.map((phase) => (
                  <SelectItem key={phase} value={phase}>
                    {phase}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>{filteredPlaybooks.length} strategies</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{groupedPlaybooks.length} categories</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-powlax-blue mb-2" />
                  <p className="text-gray-600">Loading team playbook...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center max-w-md">
                  <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                  <p className="text-red-600 font-medium">Failed to load playbook</p>
                  <p className="text-gray-600 text-sm mt-1">{error}</p>
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredPlaybooks.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center max-w-md">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">
                    {searchTerm || selectedPhase !== 'All Phases' 
                      ? 'No strategies match your filters'
                      : 'No strategies in playbook'
                    }
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {searchTerm || selectedPhase !== 'All Phases'
                      ? 'Try adjusting your search or filters'
                      : 'Add strategies from the Practice Planner to build your team playbook'
                    }
                  </p>
                  {onAddStrategy && (
                    <Button 
                      onClick={onAddStrategy}
                      className="bg-powlax-blue hover:bg-powlax-blue/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Strategy
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Strategy Groups */}
            {!loading && !error && groupedPlaybooks.length > 0 && (
              <div className="space-y-8">
                {groupedPlaybooks.map(({ category, strategies }) => (
                  <div key={category}>
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="secondary" className="bg-powlax-blue text-white">
                        {category}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {strategies.length} {strategies.length === 1 ? 'strategy' : 'strategies'}
                      </span>
                    </div>

                    {/* Strategy Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {strategies.map((playbook) => (
                        <PlaybookCard
                          key={playbook.id}
                          playbook={playbook}
                          onOpenStrategy={handleOpenStrategy}
                          onDelete={handleDeleteStrategy}
                          currentUserId={currentUserId}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Study Strategy Modal - Reuse existing component */}
      {selectedStrategy && (
        <StudyStrategyModal
          isOpen={showStudyModal}
          onClose={() => {
            setShowStudyModal(false)
            setSelectedStrategy(null)
          }}
          strategy={selectedStrategy}
        />
      )}
    </div>
  )
}

// Helper function to get keywords for game phases
function getPhaseKeywords(phase: string): string[] {
  const keywordMap: Record<string, string[]> = {
    'Face-Off': ['face-off', 'faceoff', 'face off', 'center', 'wing'],
    'Offensive Transition': ['offensive transition', 'fast break', 'transition offense', 'quick stick'],
    'Settled Offense': ['settled offense', 'offensive set', '6v6 offense', 'half court offense'],
    'Defensive Transition': ['defensive transition', 'transition defense', 'slide package'],
    'Settled Defense': ['settled defense', 'defensive set', '6v6 defense', 'half court defense'],
    'Clears': ['clear', 'clearing', 'break out'],
    'Rides': ['ride', 'riding', 'pressure'],
    'Special Situations': ['man up', 'man down', 'extra man', 'penalty', 'special'],
    'Ground Ball': ['ground ball', 'groundball', 'loose ball'],
    '1v1': ['1v1', '1 v 1', 'one on one', '1-on-1', 'dodge'],
    'Team Play': ['team', 'communication', 'unit']
  }
  
  return keywordMap[phase] || [phase.toLowerCase()]
}