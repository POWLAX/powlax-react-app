'use client'

import { ExternalLink, Trophy, Star, TrendingUp, Award, Target, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlayerStats } from '@/hooks/usePlayerStats'

interface PlayerStatsCardProps {
  userId: string
  teamId: string
  showEditProfile?: boolean
  playerName?: string
  teamName?: string
}

export function PlayerStatsCard({ 
  userId, 
  teamId, 
  showEditProfile = true, 
  playerName = 'Player',
  teamName = 'Team'
}: PlayerStatsCardProps) {
  const { playerStats, loading, error, refreshStats } = usePlayerStats(userId)

  // Generate Edit Profile URL for WordPress integration
  const getEditProfileUrl = () => {
    if (playerStats?.wordpress_username) {
      return `https://powlax.com/members/${playerStats.wordpress_username}/profile/`
    }
    // Fallback to general profile page if no username
    return 'https://powlax.com/members/profile/'
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <div className="flex space-x-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <Trophy className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshStats}
            className="mt-3 w-full"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!playerStats) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-center text-gray-500">
          <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>No player data available</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate badge emoji representation
  const getBadgeEmoji = (badgeKey: string) => {
    const emojiMap: Record<string, string> = {
      'first_workout': '🌟',
      'week_streak': '🔥',
      'wall_ball_master': '🏆',
      'attack_specialist': '⚡',
      'defense_rock': '🛡️',
      'team_player': '🤝',
      'accuracy_ace': '🎯',
      'endurance_expert': '💪',
      'practice_perfect': '✨',
      'skill_master': '🎖️'
    }
    return emojiMap[badgeKey] || '🏅'
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 mb-1">
              {playerName}
            </CardTitle>
            <p className="text-sm text-gray-600">Team: {teamName}</p>
          </div>
          {showEditProfile && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(getEditProfileUrl(), '_blank')}
              className="flex items-center space-x-2"
            >
              <span>Edit Profile</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Points and Rank Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Points Card */}
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Trophy className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">
              {playerStats.totalPoints.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700 font-medium">POINTS</div>
            {playerStats.pointsByType.lax_credit > 0 && (
              <div className="text-xs text-blue-600 mt-1">
                {playerStats.pointsByType.lax_credit} Lax Credits
              </div>
            )}
          </div>
          
          {/* Rank Card */}
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-purple-900">
              {playerStats.currentRank?.title || 'UNRANKED'}
            </div>
            <div className="text-sm text-purple-700 font-medium">RANK</div>
            {playerStats.currentRank?.next_rank && (
              <div className="text-xs text-purple-600 mt-1">
                {playerStats.currentRank.points_to_next} to {playerStats.currentRank.next_rank.title}
              </div>
            )}
          </div>
        </div>

        {/* Recent Badges Section */}
        {playerStats.badges.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Recent Badges:</h4>
              <Badge variant="secondary" className="text-xs">
                {playerStats.badges.length} total
              </Badge>
            </div>
            <div className="flex space-x-2">
              {playerStats.badges.slice(0, 6).map((badge, index) => (
                <div 
                  key={badge.id}
                  className="flex items-center justify-center w-10 h-10 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer"
                  title={`${badge.badge_name} - ${new Date(badge.awarded_at).toLocaleDateString()}`}
                >
                  <span className="text-lg">
                    {getBadgeEmoji(badge.badge_key)}
                  </span>
                </div>
              ))}
              {playerStats.badges.length > 6 && (
                <div className="flex items-center justify-center w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                  +{playerStats.badges.length - 6}
                </div>
              )}
            </div>
          </div>
        )}

        {/* No badges state */}
        {playerStats.badges.length === 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Recent Badges:</h4>
            <div className="text-center py-4 text-gray-500">
              <Award className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No badges earned yet</p>
              <p className="text-xs text-gray-400 mt-1">Complete workouts to earn badges!</p>
            </div>
          </div>
        )}

        {/* Skills Completed Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">Skills Completed:</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {playerStats.skillsProgress.total_workouts_completed}/100
            </span>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={Math.min((playerStats.skillsProgress.total_workouts_completed / 100) * 100, 100)} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>
                {Math.round((playerStats.skillsProgress.total_workouts_completed / 100) * 100)}% Complete
              </span>
              <span>
                {playerStats.skillsProgress.total_points_earned} points earned
              </span>
            </div>
          </div>
        </div>

        {/* Rank Progress Bar (if not max rank) */}
        {playerStats.currentRank?.next_rank && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">
                Progress to {playerStats.currentRank.next_rank.title}
              </span>
              <span className="text-gray-600">
                {Math.round(playerStats.currentRank.progress_percentage)}%
              </span>
            </div>
            <Progress 
              value={playerStats.currentRank.progress_percentage} 
              className="h-2"
            />
          </div>
        )}

        {/* Recent Activity Summary */}
        {playerStats.skillsProgress.recent_activity.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Last activity:</span>
              <span>
                {new Date(playerStats.skillsProgress.recent_activity[0].completed_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}