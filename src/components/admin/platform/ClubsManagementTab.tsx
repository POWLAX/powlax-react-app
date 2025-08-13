'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Building, 
  Users, 
  Settings, 
  BarChart3, 
  Zap, 
  AlertTriangle,
  Crown,
  Star,
  ArrowUpCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { useClubsManagement } from '@/hooks/useClubsManagement'
import { TierEnforcementEngine } from '@/lib/platform/tier-enforcement'

export default function ClubsManagementTab() {
  const {
    clubs,
    selectedClub,
    teams,
    analytics,
    membership,
    loading,
    error,
    selectClub,
    updateClubSettings,
    hasFeatureAccess,
    getUpgradeInfo,
    performBulkOperation,
    refreshData
  } = useClubsManagement()

  const [activeTab, setActiveTab] = useState('overview')
  const [settingsForm, setSettingsForm] = useState({
    timezone: 'America/New_York',
    emailNotifications: true,
    smsNotifications: false,
    parentUpdates: true,
    customBranding: false,
    apiAccess: false
  })
  const [bulkOperation, setBulkOperation] = useState({
    type: 'update_teams',
    selectedTeams: [] as number[],
    newSeason: ''
  })

  const getTierBadge = (tier?: string) => {
    if (!tier) return null
    
    const badgeColor = TierEnforcementEngine.getTierBadgeColor(tier)
    const tierName = TierEnforcementEngine.formatTierName(tier)
    
    const icon = tier === 'command' ? Crown : tier === 'growth' ? Star : Building
    const Icon = icon

    return (
      <Badge className={`${badgeColor} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {tierName}
      </Badge>
    )
  }

  const renderFeatureAccess = (feature: string, label: string, description: string) => {
    const hasAccess = hasFeatureAccess(feature)
    const upgradeInfo = getUpgradeInfo(feature)

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{label}</span>
            {hasAccess ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowUpCircle className="h-4 w-4 text-orange-500" />
            )}
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {!hasAccess && upgradeInfo.tier && (
          <Button variant="outline" size="sm">
            Upgrade to {TierEnforcementEngine.formatTierName(upgradeInfo.tier)}
          </Button>
        )}
      </div>
    )
  }

  const handleSettingsUpdate = async () => {
    if (!selectedClub) return

    try {
      await updateClubSettings(selectedClub.id, {
        timezone: settingsForm.timezone,
        communication_preferences: {
          email_notifications: settingsForm.emailNotifications,
          sms_notifications: settingsForm.smsNotifications,
          parent_updates: settingsForm.parentUpdates
        },
        advanced_settings: {
          custom_branding: settingsForm.customBranding,
          api_access: settingsForm.apiAccess,
          white_label: false
        }
      })
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  const handleBulkOperation = async () => {
    if (!selectedClub || !bulkOperation.selectedTeams.length) return

    try {
      const result = await performBulkOperation(selectedClub.id, {
        type: bulkOperation.type as any,
        data: { new_season: bulkOperation.newSeason },
        target_teams: bulkOperation.selectedTeams
      })

      if (result.success) {
        await refreshData()
      }
    } catch (error) {
      console.error('Bulk operation failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Loading clubs...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <Building className="h-6 w-6" />
            Club Management
          </h2>
          <p className="text-gray-600">Manage clubs and organizational settings</p>
        </div>
        {membership && getTierBadge(membership.clubTier)}
      </div>

      {/* Club Selection */}
      <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Building className="h-5 w-5" />
            Select Club
          </CardTitle>
          <CardDescription>
            Choose a club to manage settings and teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map(club => (
              <Card 
                key={club.id}
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedClub?.id === club.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => selectClub(club.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{club.name}</h3>
                    {selectedClub?.id === club.id && (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      {club.team_count || 0} teams
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Created {new Date(club.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Club Management Tabs */}
      {selectedClub && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-lg p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600 hover:text-gray-900">Overview</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600 hover:text-gray-900">Settings</TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600 hover:text-gray-900">Teams</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600 hover:text-gray-900">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-gray-900">Teams</span>
                  </div>
                  <div className="text-2xl font-bold">{teams.length}</div>
                  <div className="text-sm text-gray-600">Active teams</div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-gray-900">Members</span>
                  </div>
                  <div className="text-2xl font-bold">{analytics?.total_members || 0}</div>
                  <div className="text-sm text-gray-600">Total members</div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    <span className="font-medium text-gray-900">Engagement</span>
                  </div>
                  <div className="text-2xl font-bold">{analytics?.tier_utilization.usage_percentage || 0}%</div>
                  <div className="text-sm text-gray-600">Feature usage</div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Access Overview */}
            <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Feature Access</CardTitle>
                <CardDescription>
                  Available features for your current Club OS tier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {renderFeatureAccess('basic_settings', 'Basic Settings', 'Club profile and basic configuration')}
                {renderFeatureAccess('team_management', 'Team Management', 'Advanced team administration tools')}
                {renderFeatureAccess('analytics', 'Analytics Dashboard', 'Usage metrics and performance insights')}
                {renderFeatureAccess('bulk_operations', 'Bulk Operations', 'Multi-team updates and management')}
                {renderFeatureAccess('api_access', 'API Access', 'Custom integrations and data export')}
                {renderFeatureAccess('white_label', 'White Label', 'Custom branding and domain')}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Basic Settings</CardTitle>
                <CardDescription>
                  Core club configuration options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={settingsForm.timezone}
                    onValueChange={(value) => setSettingsForm(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Send club updates via email</p>
                    </div>
                    <Checkbox 
                      checked={settingsForm.emailNotifications}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, emailNotifications: !!checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Send urgent updates via SMS</p>
                    </div>
                    <Checkbox 
                      checked={settingsForm.smsNotifications}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, smsNotifications: !!checked }))}
                      disabled={!hasFeatureAccess('advanced_settings')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Parent Updates</Label>
                      <p className="text-sm text-gray-600">Automatic parent communication</p>
                    </div>
                    <Checkbox 
                      checked={settingsForm.parentUpdates}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, parentUpdates: !!checked }))}
                    />
                  </div>
                </div>

                <Button onClick={handleSettingsUpdate} disabled={!hasFeatureAccess('basic_settings')} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Crown className="h-5 w-5" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>
                  Premium features for Club OS Growth and Command tiers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Custom Branding</Label>
                      <p className="text-sm text-gray-600">Club logo and color scheme</p>
                    </div>
                    <Checkbox 
                      checked={settingsForm.customBranding}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, customBranding: !!checked }))}
                      disabled={!hasFeatureAccess('custom_features')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>API Access</Label>
                      <p className="text-sm text-gray-600">External integrations and data access</p>
                    </div>
                    <Checkbox 
                      checked={settingsForm.apiAccess}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, apiAccess: !!checked }))}
                      disabled={!hasFeatureAccess('api_access')}
                    />
                  </div>
                </div>

                {!hasFeatureAccess('custom_features') && (
                  <Alert>
                    <ArrowUpCircle className="h-4 w-4" />
                    <AlertDescription>
                      Upgrade to Club OS Growth or Command to access advanced settings.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Team Management</h3>
                <p className="text-gray-600">Manage teams within {selectedClub.name}</p>
              </div>
              <Button disabled={!hasFeatureAccess('team_management')} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Team
              </Button>
            </div>

            {/* Team List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map(team => (
                <Card key={team.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{team.name}</h4>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                        Manage
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {team.age_group && (
                        <div>Age Group: {team.age_group}</div>
                      )}
                      {team.season && (
                        <div>Season: {team.season}</div>
                      )}
                      <div>{team.player_count || 0} players</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bulk Operations */}
            {hasFeatureAccess('bulk_operations') && (
              <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Zap className="h-5 w-5" />
                    Bulk Operations
                  </CardTitle>
                  <CardDescription>
                    Perform actions across multiple teams
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Operation Type</Label>
                    <Select 
                      value={bulkOperation.type}
                      onValueChange={(value) => setBulkOperation(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="update_teams">Update Teams</SelectItem>
                        <SelectItem value="season_rollover">Season Rollover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {bulkOperation.type === 'season_rollover' && (
                    <div>
                      <Label htmlFor="newSeason">New Season</Label>
                      <Input
                        id="newSeason"
                        value={bulkOperation.newSeason}
                        onChange={(e) => setBulkOperation(prev => ({ ...prev, newSeason: e.target.value }))}
                        placeholder="e.g., Spring 2024"
                      />
                    </div>
                  )}

                  <Button onClick={handleBulkOperation} className="bg-gray-900 hover:bg-gray-800 text-white">
                    Execute Bulk Operation
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {hasFeatureAccess('analytics') ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <span className="font-medium text-gray-900">Total Teams</span>
                      </div>
                      <div className="text-2xl font-bold">{analytics?.total_teams || 0}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-gray-900">Active Players</span>
                      </div>
                      <div className="text-2xl font-bold">{analytics?.active_players || 0}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-5 w-5 text-purple-500" />
                        <span className="font-medium text-gray-900">Practices</span>
                      </div>
                      <div className="text-2xl font-bold">{analytics?.monthly_engagement.practices_planned || 0}</div>
                      <div className="text-sm text-gray-600">This month</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-orange-500" />
                        <span className="font-medium text-gray-900">Skills Sessions</span>
                      </div>
                      <div className="text-2xl font-bold">{analytics?.monthly_engagement.skills_sessions || 0}</div>
                      <div className="text-sm text-gray-600">This month</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Feature Utilization</CardTitle>
                    <CardDescription>
                      How your club is using available features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Features Used</span>
                        <span>{analytics?.tier_utilization.features_used.length} / {analytics?.tier_utilization.features_available.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${analytics?.tier_utilization.usage_percentage || 0}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        {analytics?.tier_utilization.usage_percentage || 0}% of available features
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Alert>
                <ArrowUpCircle className="h-4 w-4" />
                <AlertDescription>
                  Analytics dashboard is available with Club OS Growth and Command tiers. 
                  Upgrade to access detailed club performance metrics.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}