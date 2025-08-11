'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Target, 
  FileText, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  User
} from 'lucide-react'
import { TeamPlaybookWithStrategy } from '@/types/teamPlaybook'
import { Strategy } from '@/hooks/useStrategies'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PlaybookCardProps {
  playbook: TeamPlaybookWithStrategy
  onOpenStrategy: (strategy: Strategy) => void
  onEdit?: (playbook: TeamPlaybookWithStrategy) => void
  onDelete?: (playbookId: string) => void
  currentUserId?: string
}

export default function PlaybookCard({ 
  playbook, 
  onOpenStrategy,
  onEdit,
  onDelete,
  currentUserId
}: PlaybookCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
    source: playbook.strategy_source
  }

  const handleCardClick = () => {
    onOpenStrategy(strategy)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    onEdit?.(playbook)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    if (confirm('Are you sure you want to remove this strategy from the team playbook?')) {
      onDelete?.(playbook.id)
    }
  }

  const canEdit = currentUserId === playbook.added_by

  return (
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer bg-white border border-gray-200">
      {/* Card Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0" onClick={handleCardClick}>
            <CardTitle className="text-base font-semibold text-gray-900 line-clamp-2">
              {playbook.custom_name || playbook.strategy_name}
            </CardTitle>
            {playbook.custom_name && (
              <p className="text-sm text-gray-500 mt-1">
                Original: {playbook.strategy_name}
              </p>
            )}
          </div>
          
          {/* Actions Menu */}
          {canEdit && (onEdit || onDelete) && (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {onEdit && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      {/* Card Content */}
      <CardContent className="space-y-3" onClick={handleCardClick}>
        {/* Category Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-gray-900 text-white text-xs">
            {playbook.strategy_categories || 'Strategy'}
          </Badge>
          <div className="flex items-center gap-1">
            {playbook.lacrosse_lab_links && (
              <Target className="h-4 w-4 text-green-600" title="Has diagram" />
            )}
            {playbook.vimeo_link && (
              <Play className="h-4 w-4 text-blue-600" title="Has video" />
            )}
            {playbook.master_pdf_url && (
              <FileText className="h-4 w-4 text-red-600" title="Has PDF" />
            )}
          </div>
        </div>

        {/* Description */}
        {playbook.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {playbook.description}
          </p>
        )}

        {/* Team Notes */}
        {playbook.team_notes && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <p className="text-xs font-medium text-blue-900 mb-1">Team Notes:</p>
            <p className="text-xs text-blue-700 line-clamp-2">
              {playbook.team_notes}
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>Added by coach</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(playbook.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* View Strategy Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3 group-hover:bg-powlax-blue group-hover:text-white group-hover:border-powlax-blue transition-colors"
        >
          <Target className="h-4 w-4 mr-2" />
          View Strategy
        </Button>
      </CardContent>
    </Card>
  )
}