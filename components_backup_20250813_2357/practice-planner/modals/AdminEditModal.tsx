'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Save, 
  Trash2, 
  Eye, 
  Play, 
  AlertTriangle, 
  Users, 
  Timer, 
  Target,
  Video
} from 'lucide-react'
import { useAdminEdit } from '@/hooks/useAdminEdit'
// UserData type no longer needed with Supabase Auth

interface AdminEditModalProps {
  isOpen: boolean
  onClose: () => void
  user: any | null // Supabase user type
  itemType: 'drill' | 'strategy'
  item: any
  onSave?: () => void
  onDelete?: () => void
}

// Drill categories for selection
const DRILL_CATEGORIES = [
  'Skill Drills',
  'Concept Drills', 
  'Team Drills',
  '1v1 Drills',
  'Ground Ball',
  'Shooting',
  'Passing',
  'Defense',
  'Offense',
  'Transition',
  'Face Off',
  'Clearing',
  'Riding',
  'Conditioning'
]

// Strategy categories for selection
const STRATEGY_CATEGORIES = [
  'Face Off',
  'Face Offs',
  'Clearing',
  'Riding', 
  'Transition Offense',
  'Zone Offense',
  'Set Plays',
  '2 Man Ideas',
  'Defense',
  'Box',
  'Man Up',
  'Man Down',
  'Man Up & Man Down',
  'Substitutions'
]

// Age ranges for strategies
const AGE_RANGES = [
  '8-10 years',
  '10-12 years',
  '12-14 years',
  '14-16 years', 
  '16-18 years',
  'All Ages'
]

// Difficulty levels
const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate', 
  'Advanced',
  'Expert'
]

export default function AdminEditModal({
  isOpen,
  onClose,
  user,
  itemType,
  item,
  onSave,
  onDelete
}: AdminEditModalProps) {
  const { 
    loading, 
    error, 
    isAdmin,
    updateDrill,
    updateStrategy,
    deleteDrill,
    deleteStrategy,
    clearError
  } = useAdminEdit(user)

  // Form state for drills
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    video_url: '',
    category: '',
    duration_minutes: 10,
    min_players: 2,
    max_players: 20,
    difficulty_level: '',
    equipment: '',
    tags: '',
    // Strategy fields
    strategy_name: '',
    description: '',
    vimeo_link: '',
    strategy_categories: '',
    see_it_ages: '',
    coach_it_ages: '',
    own_it_ages: '',
    target_audience: ''
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [videoPreview, setVideoPreview] = useState('')

  // Initialize form data when item changes
  useEffect(() => {
    if (item && isOpen) {
      if (itemType === 'drill') {
        setFormData({
          title: item.title || item.name || '',
          content: item.content || item.notes || item.coach_instructions || '',
          video_url: item.video_url || item.videoUrl || item.drill_video_url || '',
          category: item.category || '',
          duration_minutes: item.duration_minutes || item.duration || 10,
          min_players: item.min_players || 2,
          max_players: item.max_players || 20,
          difficulty_level: item.difficulty_level || item.intensity_level || '',
          equipment: Array.isArray(item.equipment) ? item.equipment.join(', ') : (item.equipment_needed || ''),
          tags: item.tags || '',
          // Strategy fields (empty for drills)
          strategy_name: '',
          description: '',
          vimeo_link: '',
          strategy_categories: '',
          see_it_ages: '',
          coach_it_ages: '',
          own_it_ages: '',
          target_audience: ''
        })
        setVideoPreview(item.video_url || item.videoUrl || '')
      } else {
        // Strategy
        setFormData({
          strategy_name: item.strategy_name || '',
          description: item.description || '',
          vimeo_link: item.vimeo_link || '',
          strategy_categories: item.strategy_categories || '',
          see_it_ages: item.see_it_ages || '',
          coach_it_ages: item.coach_it_ages || '',
          own_it_ages: item.own_it_ages || '',
          target_audience: item.target_audience || '',
          // Drill fields (empty for strategies)
          title: '',
          content: '',
          video_url: '',
          category: '',
          duration_minutes: 10,
          min_players: 2,
          max_players: 20,
          difficulty_level: '',
          equipment: '',
          tags: ''
        })
        setVideoPreview(item.vimeo_link || '')
      }
    }
  }, [item, itemType, isOpen])

  // Clear error when modal opens
  useEffect(() => {
    if (isOpen) {
      clearError()
    }
  }, [isOpen, clearError])

  // Handle video URL change and preview
  useEffect(() => {
    const videoUrl = itemType === 'drill' ? formData.video_url : formData.vimeo_link
    if (videoUrl && (videoUrl.includes('vimeo.com') || videoUrl.includes('youtube.com'))) {
      setVideoPreview(videoUrl)
    } else {
      setVideoPreview('')
    }
  }, [formData.video_url, formData.vimeo_link, itemType])

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle save
  const handleSave = async () => {
    if (!isAdmin || !item) return

    let success = false

    if (itemType === 'drill') {
      const drillUpdates = {
        title: formData.title,
        content: formData.content,
        video_url: formData.video_url,
        category: formData.category,
        duration_minutes: formData.duration_minutes,
        min_players: formData.min_players,
        max_players: formData.max_players,
        difficulty_level: formData.difficulty_level,
        equipment: formData.equipment.split(',').map(s => s.trim()).filter(Boolean),
        tags: formData.tags
      }
      
      success = await updateDrill(item.drill_id || item.id, drillUpdates)
    } else {
      const strategyUpdates = {
        strategy_name: formData.strategy_name,
        description: formData.description,
        vimeo_link: formData.vimeo_link,
        strategy_categories: formData.strategy_categories,
        see_it_ages: formData.see_it_ages,
        coach_it_ages: formData.coach_it_ages,
        own_it_ages: formData.own_it_ages,
        target_audience: formData.target_audience
      }
      
      success = await updateStrategy(item.id, strategyUpdates)
    }

    if (success) {
      onSave?.()
      onClose()
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!isAdmin || !item) return

    let success = false

    if (itemType === 'drill') {
      success = await deleteDrill(item.drill_id || item.id)
    } else {
      success = await deleteStrategy(item.id)
    }

    if (success) {
      onDelete?.()
      onClose()
    }

    setShowDeleteConfirm(false)
  }

  if (!isAdmin) return null

  const itemName = itemType === 'drill' 
    ? (formData.title || item?.name || 'Unnamed Drill')
    : (formData.strategy_name || item?.strategy_name || 'Unnamed Strategy')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Edit {itemType === 'drill' ? 'Drill' : 'Strategy'}: {itemName}
            <Badge variant="secondary" className="text-xs">Admin</Badge>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="media">Media & Links</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {itemType === 'drill' ? 'Drill Information' : 'Strategy Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {itemType === 'drill' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="title">Drill Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Enter drill title..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Description & Instructions</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => handleChange('content', e.target.value)}
                        placeholder="Detailed drill description, coaching points, and instructions..."
                        rows={6}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {DRILL_CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                        <Select value={formData.difficulty_level} onValueChange={(value) => handleChange('difficulty_level', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            {DIFFICULTY_LEVELS.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="strategy_name">Strategy Name *</Label>
                      <Input
                        id="strategy_name"
                        value={formData.strategy_name}
                        onChange={(e) => handleChange('strategy_name', e.target.value)}
                        placeholder="Enter strategy name..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Strategy description, key points, and implementation notes..."
                        rows={6}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="strategy_categories">Category *</Label>
                        <Select value={formData.strategy_categories} onValueChange={(value) => handleChange('strategy_categories', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {STRATEGY_CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="target_audience">Target Audience</Label>
                        <Select value={formData.target_audience} onValueChange={(value) => handleChange('target_audience', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select audience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Youth">Youth</SelectItem>
                            <SelectItem value="High School">High School</SelectItem>
                            <SelectItem value="College">College</SelectItem>
                            <SelectItem value="All Levels">All Levels</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video & Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video_url">Video URL</Label>
                  <Input
                    id="video_url"
                    value={itemType === 'drill' ? formData.video_url : formData.vimeo_link}
                    onChange={(e) => handleChange(itemType === 'drill' ? 'video_url' : 'vimeo_link', e.target.value)}
                    placeholder="https://vimeo.com/... or https://youtube.com/..."
                  />
                </div>

                {videoPreview && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Play className="h-4 w-4" />
                      <span className="text-sm font-medium">Video Preview</span>
                    </div>
                    <div className="text-sm text-gray-600 break-all">
                      {videoPreview}
                    </div>
                  </div>
                )}

                {itemType === 'drill' && (
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipment Needed</Label>
                    <Input
                      id="equipment"
                      value={formData.equipment}
                      onChange={(e) => handleChange('equipment', e.target.value)}
                      placeholder="Cones, balls, goals... (comma separated)"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {itemType === 'drill' ? 'Drill Settings' : 'Age Ranges'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {itemType === 'drill' ? (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          max="60"
                          value={formData.duration_minutes}
                          onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value) || 10)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="min_players">Min Players</Label>
                        <Input
                          id="min_players"
                          type="number"
                          min="1"
                          max="50"
                          value={formData.min_players}
                          onChange={(e) => handleChange('min_players', parseInt(e.target.value) || 2)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max_players">Max Players</Label>
                        <Input
                          id="max_players"
                          type="number"
                          min="1"
                          max="50"
                          value={formData.max_players}
                          onChange={(e) => handleChange('max_players', parseInt(e.target.value) || 20)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => handleChange('tags', e.target.value)}
                        placeholder="Fundamental, Advanced, 1v1... (comma separated)"
                      />
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="see_it_ages">See It Ages</Label>
                      <Select value={formData.see_it_ages} onValueChange={(value) => handleChange('see_it_ages', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age range" />
                        </SelectTrigger>
                        <SelectContent>
                          {AGE_RANGES.map(age => (
                            <SelectItem key={age} value={age}>{age}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coach_it_ages">Coach It Ages</Label>
                      <Select value={formData.coach_it_ages} onValueChange={(value) => handleChange('coach_it_ages', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age range" />
                        </SelectTrigger>
                        <SelectContent>
                          {AGE_RANGES.map(age => (
                            <SelectItem key={age} value={age}>{age}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="own_it_ages">Own It Ages</Label>
                      <Select value={formData.own_it_ages} onValueChange={(value) => handleChange('own_it_ages', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age range" />
                        </SelectTrigger>
                        <SelectContent>
                          {AGE_RANGES.map(age => (
                            <SelectItem key={age} value={age}>{age}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="mr-2"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {itemType === 'drill' ? 'Drill' : 'Strategy'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p>Are you sure you want to delete this {itemType}?</p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>{itemName}</strong>
              </p>
              <p className="text-sm text-red-600 mt-2">
                This action cannot be undone and will permanently remove this {itemType} from the database.
              </p>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}