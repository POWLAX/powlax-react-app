'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/JWTAuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  AlertCircle, 
  ArrowLeft,
  Save,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface SkillsAcademyDrill {
  id: string
  title: string
  vimeo_id?: string
  drill_category?: string[]
  equipment_needed?: string[]
  complexity: string
  duration_minutes: number
  point_values?: {
    [category: string]: number
  }
  age_progressions?: {
    do_it: string[]
    coach_it: string[]
    own_it: string[]
  }
  updated_at: string
}

export default function AcademyEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [drill, setDrill] = useState<SkillsAcademyDrill | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<SkillsAcademyDrill>>({
    title: '',
    vimeo_id: '',
    drill_category: [],
    equipment_needed: [],
    complexity: 'foundation',
    duration_minutes: 10,
    point_values: {},
    age_progressions: {
      do_it: [],
      coach_it: [],
      own_it: []
    }
  })

  // Available options
  const complexityLevels = ['foundation', 'building', 'advanced']
  
  const availableCategories = [
    'Stick Skills',
    'Shooting',
    'Passing',
    'Dodging',
    'Ground Balls',
    'Checking',
    'Footwork',
    'Conditioning'
  ]

  const availableEquipment = [
    'Stick',
    'Ball',
    'Cones',
    'Goals',
    'Nets',
    'Pads',
    'Helmet',
    'Gloves',
    'Wall',
    'Partner'
  ]

  const pointCategories = [
    'Technical',
    'Physical', 
    'Mental',
    'Leadership'
  ]

  const drillId = params.id as string

  // Check permissions
  const isAdmin = currentUser?.roles?.includes('administrator')

  useEffect(() => {
    if (isAdmin && drillId) {
      fetchDrill()
    }
  }, [isAdmin, drillId])

  const fetchDrill = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('skills_academy_drills')
        .select('*')
        .eq('id', drillId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Academy drill not found')
          router.push('/admin/content-editor')
          return
        }
        throw error
      }

      setDrill(data)
      setFormData({
        title: data.title || '',
        vimeo_id: data.vimeo_id || '',
        drill_category: data.drill_category || [],
        equipment_needed: data.equipment_needed || [],
        complexity: data.complexity || 'foundation',
        duration_minutes: data.duration_minutes || 10,
        point_values: data.point_values || {},
        age_progressions: data.age_progressions || {
          do_it: [],
          coach_it: [],
          own_it: []
        }
      })
    } catch (error) {
      console.error('Failed to fetch academy drill:', error)
      toast.error('Failed to load academy drill')
      router.push('/admin/content-editor')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof SkillsAcademyDrill, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const handleArrayChange = (field: 'drill_category' | 'equipment_needed', item: string, checked: boolean) => {
    const currentValues = formData[field] || []
    const newValues = checked 
      ? [...currentValues, item]
      : currentValues.filter(val => val !== item)
    
    handleInputChange(field, newValues)
  }

  const handlePointValueChange = (category: string, value: string) => {
    const pointValue = parseInt(value) || 0
    const newPointValues = {
      ...(formData.point_values || {}),
      [category]: pointValue
    }
    handleInputChange('point_values', newPointValues)
  }

  const handleAgeProgressionChange = (level: 'do_it' | 'coach_it' | 'own_it', text: string) => {
    // Split by lines and filter out empty lines
    const items = text.split('\n').filter(line => line.trim() !== '')
    
    const newProgressions = {
      ...(formData.age_progressions || { do_it: [], coach_it: [], own_it: [] }),
      [level]: items
    }
    handleInputChange('age_progressions', newProgressions)
  }

  // Vimeo URL validation
  const validateVimeoId = (id: string | undefined | null): 'valid' | 'invalid' | 'empty' => {
    if (!id || id.trim() === '') return 'empty'
    
    // Check if it's a valid Vimeo ID (numeric)
    const numericPattern = /^\d+$/
    return numericPattern.test(id.trim()) ? 'valid' : 'invalid'
  }

  const getVimeoUrl = (id: string) => {
    return `https://player.vimeo.com/video/${id}`
  }

  const getUrlStatusIcon = (status: 'valid' | 'invalid' | 'empty') => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'empty':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validate required fields
      if (!formData.title?.trim()) {
        toast.error('Title is required')
        return
      }

      if (!formData.complexity) {
        toast.error('Complexity level is required')
        return
      }

      const updateData = {
        ...formData,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('skills_academy_drills')
        .update(updateData)
        .eq('id', drillId)

      if (error) throw error

      toast.success('Academy drill updated successfully!')
      setHasChanges(false)
      
      // Refresh drill data
      fetchDrill()
    } catch (error) {
      console.error('Failed to save academy drill:', error)
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this academy drill? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('skills_academy_drills')
        .delete()
        .eq('id', drillId)

      if (error) throw error

      toast.success('Academy drill deleted successfully')
      router.push('/admin/content-editor')
    } catch (error) {
      console.error('Failed to delete academy drill:', error)
      toast.error('Failed to delete academy drill')
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Access Denied
            </CardTitle>
            <CardDescription>
              Only administrators can edit Skills Academy content
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-powlax-blue"></div>
        </div>
      </div>
    )
  }

  if (!drill) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Academy Drill Not Found</CardTitle>
            <CardDescription>
              The requested Skills Academy drill could not be found
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/content-editor">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Editor
          </Button>
        </Link>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Edit Skills Academy Drill</h1>
          <p className="text-gray-600">
            {drill.title} • Last updated: {new Date(drill.updated_at).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              You have unsaved changes
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter drill title..."
              />
            </div>

            <div>
              <Label htmlFor="complexity">Complexity Level *</Label>
              <Select
                value={formData.complexity || ''}
                onValueChange={(value) => handleInputChange('complexity', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select complexity" />
                </SelectTrigger>
                <SelectContent>
                  {complexityLevels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="60"
                value={formData.duration_minutes || ''}
                onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value) || 10)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Video Information */}
        <Card>
          <CardHeader>
            <CardTitle>Video Resource</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vimeo_id" className="flex items-center gap-2">
                Vimeo Video ID
                {getUrlStatusIcon(validateVimeoId(formData.vimeo_id))}
              </Label>
              <Input
                id="vimeo_id"
                value={formData.vimeo_id || ''}
                onChange={(e) => handleInputChange('vimeo_id', e.target.value)}
                placeholder="123456789"
                className={
                  validateVimeoId(formData.vimeo_id) === 'invalid' 
                    ? 'border-red-500' 
                    : validateVimeoId(formData.vimeo_id) === 'valid'
                    ? 'border-green-500'
                    : ''
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter only the numeric ID from the Vimeo URL
              </p>
            </div>

            {formData.vimeo_id && validateVimeoId(formData.vimeo_id) === 'valid' && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={getVimeoUrl(formData.vimeo_id)} target="_blank" rel="noopener noreferrer">
                    <Play className="h-4 w-4 mr-2" />
                    Preview Video
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Categories and Equipment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drill Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Drill Categories ({formData.drill_category?.length || 0})</CardTitle>
            <CardDescription>
              Select all categories that apply to this drill
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={formData.drill_category?.includes(category) || false}
                    onCheckedChange={(checked) => 
                      handleArrayChange('drill_category', category, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`category-${category}`}
                    className="text-sm cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Equipment Needed */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment Needed ({formData.equipment_needed?.length || 0})</CardTitle>
            <CardDescription>
              Select all equipment required for this drill
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableEquipment.map(equipment => (
                <div key={equipment} className="flex items-center space-x-2">
                  <Checkbox
                    id={`equipment-${equipment}`}
                    checked={formData.equipment_needed?.includes(equipment) || false}
                    onCheckedChange={(checked) => 
                      handleArrayChange('equipment_needed', equipment, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`equipment-${equipment}`}
                    className="text-sm cursor-pointer"
                  >
                    {equipment}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Point Values */}
      <Card>
        <CardHeader>
          <CardTitle>Point Values</CardTitle>
          <CardDescription>
            Set point rewards for completing this drill in different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pointCategories.map(category => (
              <div key={category}>
                <Label htmlFor={`points-${category}`}>{category} Points</Label>
                <Input
                  id={`points-${category}`}
                  type="number"
                  min="0"
                  max="100"
                  value={formData.point_values?.[category] || ''}
                  onChange={(e) => handlePointValueChange(category, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Age Progressions */}
      <Card>
        <CardHeader>
          <CardTitle>Age Progressions</CardTitle>
          <CardDescription>
            Define what players should be able to do at different skill levels (one item per line)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="do_it">Do It (Beginner)</Label>
              <Textarea
                id="do_it"
                value={formData.age_progressions?.do_it?.join('\n') || ''}
                onChange={(e) => handleAgeProgressionChange('do_it', e.target.value)}
                placeholder="Basic requirements&#10;One per line"
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.age_progressions?.do_it?.length || 0} items
              </p>
            </div>

            <div>
              <Label htmlFor="coach_it">Coach It (Intermediate)</Label>
              <Textarea
                id="coach_it"
                value={formData.age_progressions?.coach_it?.join('\n') || ''}
                onChange={(e) => handleAgeProgressionChange('coach_it', e.target.value)}
                placeholder="Advanced requirements&#10;One per line"
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.age_progressions?.coach_it?.length || 0} items
              </p>
            </div>

            <div>
              <Label htmlFor="own_it">Own It (Advanced)</Label>
              <Textarea
                id="own_it"
                value={formData.age_progressions?.own_it?.join('\n') || ''}
                onChange={(e) => handleAgeProgressionChange('own_it', e.target.value)}
                placeholder="Expert requirements&#10;One per line"
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.age_progressions?.own_it?.length || 0} items
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}