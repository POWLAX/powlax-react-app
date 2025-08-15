'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  Trophy, 
  Coins, 
  Award, 
  TrendingUp,
  Plus, 
  Minus,
  Star,
  Target,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'

interface ActivityData {
  points_wallets: any[]
  badges: any[]
  achievements: any[]
  progress: any[]
}

interface ActivityTabProps {
  userData: ActivityData
  onFieldChange: (tab: string, field: string, oldValue: any, newValue: any) => void
}

export default function ActivityTab({ userData, onFieldChange }: ActivityTabProps) {
  const [showAdjustPoints, setShowAdjustPoints] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState('')
  const [pointsAdjustment, setPointsAdjustment] = useState('')
  const [adjustmentReason, setAdjustmentReason] = useState('')

  const formatCurrencyName = (currency: any) => {
    return currency?.name || 'Unknown Currency'
  }

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType.toLowerCase()) {
      case 'achievement':
        return <Trophy className="h-4 w-4" />
      case 'milestone':
        return <Target className="h-4 w-4" />
      case 'streak':
        return <Star className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType.toLowerCase()) {
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800'
      case 'milestone':
        return 'bg-blue-100 text-blue-800'
      case 'streak':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAdjustPoints = async () => {
    if (!selectedCurrency || !pointsAdjustment) {
      toast.error('Please select a currency and enter an adjustment amount')
      return
    }

    const adjustment = parseInt(pointsAdjustment)
    if (isNaN(adjustment)) {
      toast.error('Please enter a valid number')
      return
    }

    // Find the wallet for the selected currency
    const walletIndex = userData.points_wallets.findIndex(
      wallet => wallet.currency_id === selectedCurrency
    )

    let updatedWallets = [...userData.points_wallets]

    if (walletIndex >= 0) {
      // Update existing wallet
      updatedWallets[walletIndex] = {
        ...updatedWallets[walletIndex],
        balance: Math.max(0, updatedWallets[walletIndex].balance + adjustment),
        last_updated: new Date().toISOString()
      }
    } else {
      // Create new wallet
      const newWallet = {
        id: `wallet_${Date.now()}`,
        user_id: 'current_user',
        currency_id: selectedCurrency,
        balance: Math.max(0, adjustment),
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      }
      updatedWallets.push(newWallet)
    }

    onFieldChange('activity', 'points_wallets', userData.points_wallets, updatedWallets)
    
    toast.success(`Points ${adjustment > 0 ? 'added' : 'deducted'} successfully`)
    setShowAdjustPoints(false)
    setSelectedCurrency('')
    setPointsAdjustment('')
    setAdjustmentReason('')
  }

  const handleAwardBadge = async (badgeId: string) => {
    const newBadge = {
      id: `user_badge_${Date.now()}`,
      user_id: 'current_user',
      badge_id: badgeId,
      awarded_at: new Date().toISOString(),
      awarded_by: 'admin',
      is_active: true
    }

    const updatedBadges = [...userData.badges, newBadge]
    onFieldChange('activity', 'badges', userData.badges, updatedBadges)
    toast.success('Badge awarded successfully')
  }

  const handleRevokeBadge = async (badgeId: string) => {
    const updatedBadges = userData.badges.filter(badge => badge.id !== badgeId)
    onFieldChange('activity', 'badges', userData.badges, updatedBadges)
    toast.success('Badge revoked successfully')
  }

  const getTotalPoints = () => {
    return userData.points_wallets.reduce((total, wallet) => total + (wallet.balance || 0), 0)
  }

  const getProgressPercentage = (progress: any) => {
    if (!progress.target_value || progress.target_value === 0) return 0
    return Math.min(100, (progress.current_value / progress.target_value) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Points & Currencies
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAdjustPoints(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adjust Points
            </Button>
          </CardTitle>
          <CardDescription>
            User's point balances across different currencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{getTotalPoints()}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{userData.badges.length}</div>
              <div className="text-sm text-gray-600">Badges Earned</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{userData.progress.length}</div>
              <div className="text-sm text-gray-600">Progress Tracked</div>
            </div>
          </div>

          {userData.points_wallets.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No point wallets found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userData.points_wallets.map((wallet) => (
                  <TableRow key={wallet.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-gray-400" />
                        {formatCurrencyName(wallet.powlax_points_currencies)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{wallet.balance || 0}</div>
                    </TableCell>
                    <TableCell>
                      {wallet.last_updated 
                        ? new Date(wallet.last_updated).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCurrency(wallet.currency_id)
                            setShowAdjustPoints(true)
                          }}
                        >
                          Adjust
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Adjust Points Form */}
          {showAdjustPoints && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-3">Adjust Points</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {userData.points_wallets.map((wallet) => (
                        <SelectItem key={wallet.currency_id} value={wallet.currency_id}>
                          {formatCurrencyName(wallet.powlax_points_currencies)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="adjustment">Points Adjustment</Label>
                  <Input
                    id="adjustment"
                    type="number"
                    placeholder="Enter positive or negative number"
                    value={pointsAdjustment}
                    onChange={(e) => setPointsAdjustment(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Positive numbers add points, negative numbers deduct points
                  </p>
                </div>
                <div>
                  <Label htmlFor="reason">Reason (optional)</Label>
                  <Input
                    id="reason"
                    placeholder="Reason for adjustment"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAdjustPoints} size="sm">
                    Apply Adjustment
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAdjustPoints(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges & Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badges & Achievements
          </CardTitle>
          <CardDescription>
            User's earned badges and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userData.badges.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No badges earned yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userData.badges.map((badge) => (
                <div key={badge.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${getBadgeColor(badge.badge_type || 'achievement')}`}>
                        {getBadgeIcon(badge.badge_type || 'achievement')}
                      </div>
                      <div>
                        <h4 className="font-medium">{badge.name || 'Unknown Badge'}</h4>
                        <p className="text-sm text-gray-600">
                          Earned {badge.awarded_at ? new Date(badge.awarded_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to revoke this badge? This action can be undone by re-awarding the badge.')) {
                          handleRevokeBadge(badge.id)
                        }
                      }}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Tracking
          </CardTitle>
          <CardDescription>
            User's progress on various skills and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userData.progress.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No progress data available
            </div>
          ) : (
            <div className="space-y-4">
              {userData.progress.map((progress) => (
                <div key={progress.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-400" />
                      <h4 className="font-medium">{progress.activity_type || 'Unknown Activity'}</h4>
                    </div>
                    <Badge variant="outline">
                      {progress.current_value || 0} / {progress.target_value || 0}
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={getProgressPercentage(progress)} 
                    className="mb-2"
                  />
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Started: {progress.started_at ? new Date(progress.started_at).toLocaleDateString() : 'Unknown'}</span>
                    <span>{getProgressPercentage(progress).toFixed(1)}% Complete</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest points transactions and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            Recent activity log will be implemented with real transaction data
          </div>
        </CardContent>
      </Card>
    </div>
  )
}