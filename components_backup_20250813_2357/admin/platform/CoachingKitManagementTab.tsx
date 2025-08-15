'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Clipboard, 
  Users, 
  BookOpen, 
  Video, 
  Award, 
  PlusCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Upload,
  Download,
  Filter,
  Search,
  BarChart3,
  Star,
  Crown
} from 'lucide-react'
import { useCoachingKitManagement } from '@/hooks/useCoachingKitManagement'

export default function CoachingKitManagementTab() {
  const {
    coaches,
    resources,
    trainings,
    analytics,
    selectedCoach,
    loading,
    error,
    selectCoach,
    approveContent,
    createResource,
    uploadTraining,
    getCoachAnalytics,
    hasKitAccess,
    refreshData
  } = useCoachingKitManagement()

  const [activeTab, setActiveTab] = useState('overview')
  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    category: 'practice_template',
    content: '',
    tierAccess: 'essentials_kit'
  })
  const [trainingForm, setTrainingForm] = useState({
    title: '',
    description: '',
    category: 'fundamentals',
    videoUrl: '',
    duration: '',
    tierAccess: 'essentials_kit'
  })

  const getTierBadge = (tier: string) => {
    const badgeColor = tier === 'confidence_kit' 
      ? 'bg-purple-100 text-purple-800 border-purple-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200'
    
    const icon = tier === 'confidence_kit' ? Crown : Star
    const Icon = icon
    const tierName = tier === 'confidence_kit' ? 'Confidence Kit' : 'Essentials Kit'

    return (
      <Badge className={`${badgeColor} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {tierName}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200'
    }

    const statusIcons = {
      approved: CheckCircle,
      pending: Clock,
      rejected: AlertTriangle,
      draft: Edit
    }

    const Icon = statusIcons[status as keyof typeof statusIcons]
    const color = statusColors[status as keyof typeof statusColors]

    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleContentSubmit = async () => {
    try {
      await createResource({
        title: contentForm.title,
        description: contentForm.description,
        category: contentForm.category,
        content: contentForm.content,
        tier_access: [contentForm.tierAccess],
        status: 'pending'
      })
      
      setContentForm({
        title: '',
        description: '',
        category: 'practice_template',
        content: '',
        tierAccess: 'essentials_kit'
      })
      
      await refreshData()
    } catch (error) {
      console.error('Failed to create resource:', error)
    }
  }

  const handleTrainingSubmit = async () => {
    try {
      await uploadTraining({
        title: trainingForm.title,
        description: trainingForm.description,
        category: trainingForm.category,
        video_url: trainingForm.videoUrl,
        duration: parseInt(trainingForm.duration),
        tier_access: [trainingForm.tierAccess],
        status: 'pending'
      })
      
      setTrainingForm({
        title: '',
        description: '',
        category: 'fundamentals',
        videoUrl: '',
        duration: '',
        tierAccess: 'essentials_kit'
      })
      
      await refreshData()
    } catch (error) {
      console.error('Failed to upload training:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Loading coaching kit...</span>
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clipboard className="h-6 w-6" />
            Coaching Kit Management
          </h2>
          <p className="text-gray-600">Manage coaching resources and training content</p>
        </div>
        <div className="flex items-center gap-2">
          {getTierBadge('essentials_kit')}
          {getTierBadge('confidence_kit')}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Active Coaches</span>
            </div>
            <div className="text-2xl font-bold">{coaches.length}</div>
            <div className="text-sm text-gray-600">Total registered</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              <span className="font-medium">Resources</span>
            </div>
            <div className="text-2xl font-bold">{resources.length}</div>
            <div className="text-sm text-gray-600">Available content</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Video className="h-5 w-5 text-purple-500" />
              <span className="font-medium">Training Modules</span>
            </div>
            <div className="text-2xl font-bold">{trainings.length}</div>
            <div className="text-sm text-gray-600">Video content</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <span className="font-medium">Engagement</span>
            </div>
            <div className="text-2xl font-bold">{analytics?.monthly_usage || 0}</div>
            <div className="text-sm text-gray-600">Monthly views</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="coaches">Coaches</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kit Tiers */}
            <Card>
              <CardHeader>
                <CardTitle>Coaching Kit Tiers</CardTitle>
                <CardDescription>
                  Different access levels for coaching content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4 text-blue-500" />
                      Essentials Kit
                    </h3>
                    {getTierBadge('essentials_kit')}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Basic coaching resources and practice planning tools
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Practice planner access</li>
                    <li>• Basic drill library</li>
                    <li>• Standard templates</li>
                    <li>• Fundamental training videos</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-500" />
                      Confidence Kit
                    </h3>
                    {getTierBadge('confidence_kit')}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Advanced coaching tools and custom content creation
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• All Essentials Kit features</li>
                    <li>• Custom content creation</li>
                    <li>• Advanced training modules</li>
                    <li>• Personal coaching sessions</li>
                    <li>• Analytics dashboard</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest content and coaching activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resources.slice(0, 5).map(resource => (
                    <div key={resource.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{resource.title}</div>
                        <div className="text-xs text-gray-600">{resource.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(resource.status)}
                        {getTierBadge(resource.tier_access[0])}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Coaching Resources</h3>
              <p className="text-gray-600">Manage practice templates, drills, and guides</p>
            </div>
            <Button onClick={() => setActiveTab('overview')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Resource
            </Button>
          </div>

          {/* Create Resource Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Resource</CardTitle>
              <CardDescription>
                Add new coaching content to the library
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={contentForm.title}
                    onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Resource title"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={contentForm.category}
                    onValueChange={(value) => setContentForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="practice_template">Practice Template</SelectItem>
                      <SelectItem value="drill_guide">Drill Guide</SelectItem>
                      <SelectItem value="coaching_tips">Coaching Tips</SelectItem>
                      <SelectItem value="strategy_guide">Strategy Guide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={contentForm.description}
                  onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description"
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={contentForm.content}
                  onChange={(e) => setContentForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Resource content..."
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="tierAccess">Tier Access</Label>
                <Select 
                  value={contentForm.tierAccess}
                  onValueChange={(value) => setContentForm(prev => ({ ...prev, tierAccess: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essentials_kit">Essentials Kit</SelectItem>
                    <SelectItem value="confidence_kit">Confidence Kit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleContentSubmit}>
                Create Resource
              </Button>
            </CardContent>
          </Card>

          {/* Resources List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(resource => (
              <Card key={resource.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{resource.title}</h4>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(resource.status)}
                      {getTierBadge(resource.tier_access[0])}
                    </div>
                    {resource.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => approveContent(resource.id, 'approved')}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Training Modules</h3>
              <p className="text-gray-600">Manage video training content and courses</p>
            </div>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Training
            </Button>
          </div>

          {/* Upload Training Form */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Training Module</CardTitle>
              <CardDescription>
                Add new video training content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trainingTitle">Title</Label>
                  <Input
                    id="trainingTitle"
                    value={trainingForm.title}
                    onChange={(e) => setTrainingForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Training module title"
                  />
                </div>

                <div>
                  <Label htmlFor="trainingCategory">Category</Label>
                  <Select 
                    value={trainingForm.category}
                    onValueChange={(value) => setTrainingForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fundamentals">Fundamentals</SelectItem>
                      <SelectItem value="advanced_techniques">Advanced Techniques</SelectItem>
                      <SelectItem value="coaching_methodology">Coaching Methodology</SelectItem>
                      <SelectItem value="player_development">Player Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="trainingDescription">Description</Label>
                <Input
                  id="trainingDescription"
                  value={trainingForm.description}
                  onChange={(e) => setTrainingForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Training description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    value={trainingForm.videoUrl}
                    onChange={(e) => setTrainingForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={trainingForm.duration}
                    onChange={(e) => setTrainingForm(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="trainingTierAccess">Tier Access</Label>
                <Select 
                  value={trainingForm.tierAccess}
                  onValueChange={(value) => setTrainingForm(prev => ({ ...prev, tierAccess: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essentials_kit">Essentials Kit</SelectItem>
                    <SelectItem value="confidence_kit">Confidence Kit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleTrainingSubmit}>
                Upload Training Module
              </Button>
            </CardContent>
          </Card>

          {/* Training Modules List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainings.map(training => (
              <Card key={training.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{training.title}</h4>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{training.description}</p>
                  <div className="text-sm text-gray-500 mb-3">
                    Duration: {training.duration} minutes
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(training.status)}
                      {getTierBadge(training.tier_access[0])}
                    </div>
                    {training.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => approveContent(training.id, 'approved')}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Coaches Tab */}
        <TabsContent value="coaches" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Coach Management</h3>
              <p className="text-gray-600">Manage coach access and tier assignments</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Coaches List */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {coaches.map(coach => (
                  <div key={coach.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{coach.name || coach.email}</h4>
                          <p className="text-sm text-gray-600">{coach.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-medium">{coach.resources_created || 0}</div>
                        <div className="text-xs text-gray-600">Resources</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{coach.monthly_usage || 0}</div>
                        <div className="text-xs text-gray-600">Monthly Views</div>
                      </div>
                      {getTierBadge(coach.coaching_tier || 'essentials_kit')}
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Coaching Analytics</h3>
              <p className="text-gray-600">Track coaching kit usage and engagement</p>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Total Resources</span>
                </div>
                <div className="text-2xl font-bold">{analytics?.total_resources || 0}</div>
                <div className="text-sm text-gray-600">+{analytics?.resources_this_month || 0} this month</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Training Views</span>
                </div>
                <div className="text-2xl font-bold">{analytics?.total_training_views || 0}</div>
                <div className="text-sm text-gray-600">+{analytics?.views_this_month || 0} this month</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Active Coaches</span>
                </div>
                <div className="text-2xl font-bold">{analytics?.active_coaches || 0}</div>
                <div className="text-sm text-gray-600">{analytics?.engagement_rate || 0}% engagement</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Confidence Kit</span>
                </div>
                <div className="text-2xl font-bold">{analytics?.confidence_kit_users || 0}</div>
                <div className="text-sm text-gray-600">{analytics?.upgrade_rate || 0}% upgrade rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
              <CardDescription>
                Monthly coaching kit engagement over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Analytics chart would be implemented here</p>
                  <p className="text-sm">Showing usage trends and engagement metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}