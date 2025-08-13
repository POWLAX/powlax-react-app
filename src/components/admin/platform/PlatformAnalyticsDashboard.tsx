'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  DollarSign,
  Activity,
  Calendar,
  Zap,
  Trophy,
  Clock,
  RefreshCw,
  Download,
  Filter,
  ArrowUpCircle,
  AlertTriangle,
  Target,
  Percent,
  Star,
  Crown
} from 'lucide-react'
import { usePlatformAnalytics } from '@/hooks/usePlatformAnalytics'

// Types are now imported from the hook

export default function PlatformAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d')
  const {
    analytics,
    loading,
    error,
    refreshAnalytics,
    getMetricGrowth,
    getTierRevenue,
    getFeatureUsage,
    getRevenueGrowthRate,
    getTotalUsers,
    getEngagementRate,
    getTopPerformingTier,
    getConversionTrend,
    calculateChurnImpact
  } = usePlatformAnalytics()

  const refreshData = async () => {
    await refreshAnalytics()
  }

  const exportData = () => {
    if (!analytics) return
    
    // Create CSV data
    const csvData = [
      ['Metric', 'Value'],
      ['Total Users', getTotalUsers().toString()],
      ['Monthly Recurring Revenue', analytics.revenue.monthlyRecurringRevenue.toString()],
      ['Churn Rate', analytics.revenue.churnRate.toString()],
      ['Engagement Rate', getEngagementRate().toString()],
      ...analytics.revenue.tierRevenue.map(tier => [tier.tier, tier.revenue.toString()])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', `platform-analytics-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      'Club OS Foundation': 'bg-gray-100 text-gray-800',
      'Club OS Growth': 'bg-blue-100 text-blue-800',
      'Club OS Command': 'bg-purple-100 text-purple-800',
      'Team HQ Structure': 'bg-green-100 text-green-800',
      'Team HQ Leadership': 'bg-orange-100 text-orange-800',
      'Team HQ Activated': 'bg-red-100 text-red-800',
      'Coach Essentials Kit': 'bg-yellow-100 text-yellow-800',
      'Coach Confidence Kit': 'bg-indigo-100 text-indigo-800'
    }
    return colors[tier] || 'bg-gray-100 text-gray-800'
  }

  const getConversionTrendIcon = () => {
    const trend = getConversionTrend()
    if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Loading analytics...</span>
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

  if (!analytics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Platform Analytics
          </h2>
          <p className="text-gray-600">Comprehensive platform usage and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Last Updated & Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <div className="text-2xl font-bold">{getTotalUsers().toLocaleString()}</div>
            <div className="text-sm text-gray-600">Platform-wide</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Engagement</span>
            </div>
            <div className="text-2xl font-bold">{getEngagementRate()}%</div>
            <div className="text-sm text-gray-600">Active users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Revenue Growth</span>
            </div>
            <div className="text-2xl font-bold">{formatPercentage(getRevenueGrowthRate())}</div>
            <div className="text-sm text-gray-600">This month</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              {getConversionTrendIcon()}
              <span className="text-sm font-medium">Conversions</span>
            </div>
            <div className="text-2xl font-bold capitalize">{getConversionTrend()}</div>
            <div className="text-sm text-gray-600">Trend</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-sm text-gray-500 mb-4">
        Last updated: {analytics.lastUpdated ? new Date(analytics.lastUpdated).toLocaleString() : 'Never'}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Feature Usage</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="tiers">Tier Distribution</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Active Clubs</span>
                </div>
                <div className="text-3xl font-bold">{analytics.metrics.clubsActive}</div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">{formatPercentage(getMetricGrowth('clubs'))}</span>
                  <span className="text-gray-500">this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Active Teams</span>
                </div>
                <div className="text-3xl font-bold">{analytics.metrics.teamsActive}</div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">{formatPercentage(getMetricGrowth('teams'))}</span>
                  <span className="text-gray-500">this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Active Coaches</span>
                </div>
                <div className="text-3xl font-bold">{analytics.metrics.coachesActive}</div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">{formatPercentage(getMetricGrowth('coaches'))}</span>
                  <span className="text-gray-500">this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Active Players</span>
                </div>
                <div className="text-3xl font-bold">{analytics.metrics.playersActive}</div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">{formatPercentage(getMetricGrowth('players'))}</span>
                  <span className="text-gray-500">this month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Monthly Recurring Revenue</span>
                </div>
                <div className="text-3xl font-bold">{formatCurrency(analytics.revenue.monthlyRecurringRevenue)}</div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">{formatPercentage(getRevenueGrowthRate())}</span>
                  <span className="text-gray-500">this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Churn Rate</span>
                </div>
                <div className="text-3xl font-bold">{analytics.revenue.churnRate}%</div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">-0.5%</span>
                  <span className="text-gray-500">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpCircle className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Net Growth</span>
                </div>
                <div className="text-3xl font-bold">{analytics.revenue.upgradeDowngradeMetrics.netChange}</div>
                <div className="text-sm text-gray-500">
                  {analytics.revenue.upgradeDowngradeMetrics.upgrades} upgrades, {analytics.revenue.upgradeDowngradeMetrics.downgrades} downgrades
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feature Usage Tab */}
        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Practice Planner Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Practice Planner
                </CardTitle>
                <CardDescription>Practice planning and management usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{analytics.featureUsage.practicesPlannerUsage.usage_count.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Usage</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{analytics.featureUsage.practicesPlannerUsage.unique_users}</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {Math.round(analytics.featureUsage.practicesPlannerUsage.usage_count / analytics.featureUsage.practicesPlannerUsage.unique_users)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Uses/User</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(analytics.featureUsage.practicesPlannerUsage.growth_rate)}
                    </div>
                    <div className="text-sm text-gray-600">Growth Rate</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Usage by Tier</h4>
                  <div className="space-y-1">
                    {analytics.featureUsage.practicesPlannerUsage.tier_breakdown.map(tier => (
                      <div key={tier.tier} className="flex justify-between text-sm">
                        <span className="capitalize">{tier.tier.replace('_', ' ')}</span>
                        <span>{tier.usage_count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Academy Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Skills Academy
                </CardTitle>
                <CardDescription>Skills development and training usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{analytics.featureUsage.skillsAcademyUsage.usage_count.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Sessions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{analytics.featureUsage.skillsAcademyUsage.unique_users}</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {Math.round(analytics.featureUsage.skillsAcademyUsage.usage_count / analytics.featureUsage.skillsAcademyUsage.unique_users)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Sessions/User</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(analytics.featureUsage.skillsAcademyUsage.growth_rate)}
                    </div>
                    <div className="text-sm text-gray-600">Growth Rate</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Usage by Tier</h4>
                  <div className="space-y-1">
                    {analytics.featureUsage.skillsAcademyUsage.tier_breakdown.map(tier => (
                      <div key={tier.tier} className="flex justify-between text-sm">
                        <span className="capitalize">{tier.tier.replace('_', ' ')}</span>
                        <span>{tier.usage_count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Management Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Management
                </CardTitle>
                <CardDescription>Team administration and roster management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{analytics.featureUsage.teamManagementUsage.usage_count.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Usage</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{analytics.featureUsage.teamManagementUsage.unique_users}</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {Math.round(analytics.featureUsage.teamManagementUsage.usage_count / analytics.featureUsage.teamManagementUsage.unique_users)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Uses/User</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(analytics.featureUsage.teamManagementUsage.growth_rate)}
                    </div>
                    <div className="text-sm text-gray-600">Growth Rate</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Usage by Tier</h4>
                  <div className="space-y-1">
                    {analytics.featureUsage.teamManagementUsage.tier_breakdown.map(tier => (
                      <div key={tier.tier} className="flex justify-between text-sm">
                        <span className="capitalize">{tier.tier.replace(/_/g, ' ')}</span>
                        <span>{tier.usage_count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Membership Conversions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tier Conversions
                </CardTitle>
                <CardDescription>Membership upgrades and conversions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{analytics.featureUsage.membershipConversions.total_signups}</div>
                    <div className="text-sm text-gray-600">Total Signups</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{analytics.featureUsage.membershipConversions.tier_upgrades}</div>
                    <div className="text-sm text-gray-600">Tier Upgrades</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{analytics.featureUsage.membershipConversions.downgrades}</div>
                    <div className="text-sm text-gray-600">Downgrades</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.featureUsage.membershipConversions.conversion_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Monthly Trend</h4>
                  <div className="space-y-2">
                    {analytics.featureUsage.membershipConversions.monthly_data.map(month => (
                      <div key={month.month} className="flex justify-between text-sm">
                        <span>{month.month}</span>
                        <div className="flex gap-4">
                          <span>{month.signups} signups</span>
                          <span className="text-green-600">+{month.upgrades}</span>
                          <span className="text-red-600">-{month.downgrades}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Tier</CardTitle>
                <CardDescription>Monthly recurring revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.revenue.tierRevenue.map(tier => (
                  <div key={tier.tier} className="flex items-center justify-between">
                    <Badge className={getTierColor(tier.tier)}>
                      {tier.tier}
                    </Badge>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(tier.revenue)}</div>
                      <div className="text-xs text-gray-600">{tier.subscribers} subscribers</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Financial Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Key financial performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Monthly Recurring Revenue</div>
                    <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.monthlyRecurringRevenue)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Churn Rate</div>
                    <div className="text-2xl font-bold text-orange-600">{analytics.revenue.churnRate}%</div>
                    <div className="text-xs text-gray-600">Impact: {formatCurrency(calculateChurnImpact())}/month</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Net Growth (Upgrades - Downgrades)</div>
                    <div className="text-2xl font-bold text-green-600">+{analytics.revenue.upgradeDowngradeMetrics.netChange}</div>
                    <div className="text-xs text-gray-600">
                      {analytics.revenue.upgradeDowngradeMetrics.upgrades} upgrades, {analytics.revenue.upgradeDowngradeMetrics.downgrades} downgrades
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Top Performing Tier</div>
                    <div className="text-lg font-bold">{getTopPerformingTier()?.tier}</div>
                    <div className="text-xs text-gray-600">{formatCurrency(getTopPerformingTier()?.revenue || 0)}/month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Growth Trend</CardTitle>
              <CardDescription>Monthly revenue progression over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.revenue.revenueGrowth.map(month => (
                  <div key={month.month} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{month.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{formatCurrency(month.revenue)}</span>
                      <div className="flex items-center gap-1">
                        {month.growth_rate >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={month.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatPercentage(month.growth_rate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tier Distribution Tab */}
        <TabsContent value="tiers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Club OS Tiers */}
            <Card>
              <CardHeader>
                <CardTitle>Club OS Tiers</CardTitle>
                <CardDescription>Distribution of Club OS memberships</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-gray-100 text-gray-800">Foundation</Badge>
                  <span className="font-bold">{analytics.metrics.tierDistribution.club_os_foundation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800">Growth</Badge>
                  <span className="font-bold">{analytics.metrics.tierDistribution.club_os_growth}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-100 text-purple-800">Command</Badge>
                  <span className="font-bold">{analytics.metrics.tierDistribution.club_os_command}</span>
                </div>
              </CardContent>
            </Card>

            {/* Team HQ Tiers */}
            <Card>
              <CardHeader>
                <CardTitle>Team HQ Tiers</CardTitle>
                <CardDescription>Distribution of Team HQ memberships</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-800">Structure</Badge>
                  <span className="font-bold">{analytics.metrics.tierDistribution.team_hq_structure}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-orange-100 text-orange-800">Leadership</Badge>
                  <span className="font-bold">{analytics.metrics.tierDistribution.team_hq_leadership}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-red-100 text-red-800">Activated</Badge>
                  <span className="font-bold">{analytics.metrics.tierDistribution.team_hq_activated}</span>
                </div>
              </CardContent>
            </Card>

            {/* Coaching Kit Tiers */}
            <Card>
              <CardHeader>
                <CardTitle>Coaching Kit Tiers</CardTitle>
                <CardDescription>Distribution of coaching memberships</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Essentials Kit
                  </Badge>
                  <span className="font-bold">{analytics.metrics.tierDistribution.coach_essentials_kit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-indigo-100 text-indigo-800 flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Confidence Kit
                  </Badge>
                  <span className="font-bold">{analytics.metrics.tierDistribution.coach_confidence_kit}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Key Performance Insights
                </CardTitle>
                <CardDescription>Actionable insights from platform data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Growth Momentum</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Platform growth is {formatPercentage(analytics.metrics.monthlyGrowth.percentage)} this month with 
                      strong adoption in Skills Academy ({formatPercentage(analytics.featureUsage.skillsAcademyUsage.growth_rate)})
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Engagement Rate</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {getEngagementRate()}% of users are actively engaging with features, 
                      indicating strong platform value delivery
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      {getConversionTrendIcon()}
                      <span className="font-medium">Conversion Trend</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Tier upgrades are {getConversionTrend()} with a {analytics.featureUsage.membershipConversions.conversion_rate.toFixed(1)}% 
                      conversion rate from signups to upgrades
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Revenue Health</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      MRR is growing at {formatPercentage(getRevenueGrowthRate())} with {analytics.revenue.churnRate}% churn rate.
                      Top tier: {getTopPerformingTier()?.tier}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5" />
                  Strategic Recommendations
                </CardTitle>
                <CardDescription>Data-driven suggestions for platform growth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Focus on Skills Academy</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Skills Academy shows highest growth rate ({formatPercentage(analytics.featureUsage.skillsAcademyUsage.growth_rate)}). 
                      Consider expanding content and marketing this feature.
                    </p>
                  </div>

                  {analytics.revenue.churnRate > 3 && (
                    <div className="p-3 border rounded-lg bg-orange-50">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-800">Address Churn</span>
                      </div>
                      <p className="text-sm text-orange-700">
                        Churn rate of {analytics.revenue.churnRate}% costs ~{formatCurrency(calculateChurnImpact())}/month. 
                        Focus on retention strategies and user engagement.
                      </p>
                    </div>
                  )}

                  <div className="p-3 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Coaching Kit Opportunity</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Only {analytics.metrics.tierDistribution.coach_confidence_kit} coaches on Confidence Kit vs {analytics.metrics.tierDistribution.coach_essentials_kit} on Essentials. 
                      Opportunity to upgrade existing users.
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg bg-purple-50">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Premium Tier Expansion</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      {getTopPerformingTier()?.tier} generates {formatCurrency(getTopPerformingTier()?.revenue || 0)}/month. 
                      Consider adding more premium features to capture higher value.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}