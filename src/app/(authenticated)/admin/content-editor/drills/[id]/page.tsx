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
import { Slider } from '@/components/ui/slider'
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
  Plus,
  Minus
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Drill {
  id: string
  name: string
  description: string
  category: string
  duration_min: number
  difficulty_level: number
  drill_video_url?: string
  drill_lab_url_1?: string
  drill_lab_url_2?: string
  drill_lab_url_3?: string
  drill_lab_url_4?: string
  drill_lab_url_5?: string
  skill_ids?: string[]
  concept_ids?: string[]
  strategy_ids?: string[]
  notes?: string
  updated_at: string
}

interface Skill {
  id: string
  name: string
}

interface Concept {
  id: string
  name: string
}

interface Strategy {
  id: string
  name: string
}

export default function DrillEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [drill, setDrill] = useState<Drill | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Related data
  const [skills, setSkills] = useState<Skill[]>([])
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])

  // Form state
  const [formData, setFormData] = useState<Partial<Drill>>({
    name: '',
    description: '',
    category: '',
    duration_min: 15,
    difficulty_level: 3,
    drill_video_url: '',
    drill_lab_url_1: '',
    drill_lab_url_2: '',
    drill_lab_url_3: '',
    drill_lab_url_4: '',
    drill_lab_url_5: '',
    skill_ids: [],
    concept_ids: [],
    strategy_ids: [],
    notes: ''
  })

  // Available categories
  const drillCategories = [
    'Stick Skills',
    'Shooting',
    'Passing',
    'Dodging',
    'Ground Balls',
    'Checking',
    'Clearing',
    'Riding',
    'Face-offs',
    'Goalie',
    'Conditioning',
    'Team Defense',
    'Team Offense',
    'Transition'
  ]

  const drillId = params.id as string

  // Check permissions
  const isAdmin = currentUser?.roles?.includes('administrator')

  useEffect(() => {
    if (isAdmin && drillId) {
      fetchDrill()
      fetchRelatedData()
    }
  }, [isAdmin, drillId])

  const fetchDrill = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('drills')
        .select('*')
        .eq('id', drillId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Drill not found')
          router.push('/admin/content-editor')
          return
        }
        throw error
      }

      setDrill(data)
      setFormData({
        name: data.name || '',
        description: data.description || '',
        category: data.category || '',
        duration_min: data.duration_min || 15,
        difficulty_level: data.difficulty_level || 3,
        drill_video_url: data.drill_video_url || '',
        drill_lab_url_1: data.drill_lab_url_1 || '',
        drill_lab_url_2: data.drill_lab_url_2 || '',
        drill_lab_url_3: data.drill_lab_url_3 || '',
        drill_lab_url_4: data.drill_lab_url_4 || '',
        drill_lab_url_5: data.drill_lab_url_5 || '',
        skill_ids: data.skill_ids || [],
        concept_ids: data.concept_ids || [],
        strategy_ids: data.strategy_ids || [],
        notes: data.notes || ''
      })
    } catch (error) {
      console.error('Failed to fetch drill:', error)
      toast.error('Failed to load drill')
      router.push('/admin/content-editor')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedData = async () => {
    try {
      // Fetch skills, concepts, and strategies
      const [skillsResult, conceptsResult, strategiesResult] = await Promise.all([
        supabase.from('skills').select('id, name').order('name'),
        supabase.from('concepts').select('id, name').order('name'),
        supabase.from('strategies_powlax').select('id, name').order('name')
      ])

      if (skillsResult.data) setSkills(skillsResult.data)
      if (conceptsResult.data) setConcepts(conceptsResult.data)
      if (strategiesResult.data) setStrategies(strategiesResult.data)
    } catch (error) {
      console.error('Failed to fetch related data:', error)
    }
  }

  const handleInputChange = (field: keyof Drill, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const handleMultiSelectChange = (field: 'skill_ids' | 'concept_ids' | 'strategy_ids', itemId: string, checked: boolean) => {
    const currentValues = formData[field] || []
    const newValues = checked 
      ? [...currentValues, itemId]
      : currentValues.filter(id => id !== itemId)
    
    handleInputChange(field, newValues)
  }

  // URL validation helpers
  const validateUrl = (url: string | undefined | null): 'valid' | 'invalid' | 'empty' => {
    if (!url || url.trim() === '') return 'empty'
    try {
      new URL(url)
      return 'valid'
    } catch {
      return 'invalid'
    }
  }

  const validateLacrosseLabUrl = (url: string | undefined | null): 'valid' | 'invalid' | 'empty' => {
    if (!url || url.trim() === '') return 'empty'
    const status = validateUrl(url)
    if (status !== 'valid') return status
    
    // Check if it's actually a Lacrosse Lab URL
    const lacrosseLabPattern = /lacrosse.*lab/i
    return lacrosseLabPattern.test(url) ? 'valid' : 'invalid'
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
      if (!formData.name?.trim()) {
        toast.error('Drill name is required')
        return
      }

      if (!formData.category) {
        toast.error('Category is required')
        return
      }

      const updateData = {
        ...formData,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('drills')
        .update(updateData)
        .eq('id', drillId)

      if (error) throw error

      toast.success('Drill updated successfully!')
      setHasChanges(false)
      
      // Refresh drill data
      fetchDrill()
    } catch (error) {
      console.error('Failed to save drill:', error)
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this drill? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('drills')
        .delete()
        .eq('id', drillId)

      if (error) throw error

      toast.success('Drill deleted successfully')
      router.push('/admin/content-editor')
    } catch (error) {
      console.error('Failed to delete drill:', error)
      toast.error('Failed to delete drill')
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
              Only administrators can edit drills
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
            <CardTitle>Drill Not Found</CardTitle>
            <CardDescription>
              The requested drill could not be found
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Drill</h1>
          <p className="text-gray-600">
            {drill.name} • Last updated: {new Date(drill.updated_at).toLocaleString()}
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
              <Label htmlFor="name">Drill Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter drill name..."
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the drill..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category || ''}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {drillCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.duration_min || ''}
                  onChange={(e) => handleInputChange('duration_min', parseInt(e.target.value) || 15)}
                />
              </div>

              <div>
                <Label>Difficulty: {formData.difficulty_level}/5</Label>
                <Slider
                  value={[formData.difficulty_level || 3]}
                  onValueChange={(value) => handleInputChange('difficulty_level', value[0])}
                  max={5}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video URL */}
        <Card>
          <CardHeader>
            <CardTitle>Video Resource</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="video_url" className="flex items-center gap-2">
                Drill Video URL
                {getUrlStatusIcon(validateUrl(formData.drill_video_url))}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="video_url"
                  value={formData.drill_video_url || ''}
                  onChange={(e) => handleInputChange('drill_video_url', e.target.value)}
                  placeholder="https://..."
                />
                {formData.drill_video_url && validateUrl(formData.drill_video_url) === 'valid' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={formData.drill_video_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lacrosse Lab URLs */}
      <Card>
        <CardHeader>
          <CardTitle>Lacrosse Lab URLs</CardTitle>
          <CardDescription>
            Add links to related Lacrosse Lab content for this drill
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map(num => {
            const fieldName = `drill_lab_url_${num}` as keyof Drill
            const url = formData[fieldName] as string
            return (
              <div key={num}>
                <Label className="flex items-center gap-2 mb-2">
                  Lacrosse Lab URL {num}
                  {getUrlStatusIcon(validateLacrosseLabUrl(url))}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={url || ''}
                    onChange={(e) => handleInputChange(fieldName, e.target.value)}
                    placeholder="https://lacrosselab.com/..."
                    className={
                      validateLacrosseLabUrl(url) === 'invalid' 
                        ? 'border-red-500' 
                        : validateLacrosseLabUrl(url) === 'valid'
                        ? 'border-green-500'
                        : ''
                    }
                  />
                  {url && validateUrl(url) === 'valid' && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Related Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Related Skills ({formData.skill_ids?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {skills.map(skill => (
                <div key={skill.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${skill.id}`}
                    checked={formData.skill_ids?.includes(skill.id) || false}
                    onCheckedChange={(checked) => 
                      handleMultiSelectChange('skill_ids', skill.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`skill-${skill.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {skill.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Concepts */}
        <Card>
          <CardHeader>
            <CardTitle>Related Concepts ({formData.concept_ids?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {concepts.map(concept => (
                <div key={concept.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`concept-${concept.id}`}
                    checked={formData.concept_ids?.includes(concept.id) || false}
                    onCheckedChange={(checked) => 
                      handleMultiSelectChange('concept_ids', concept.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`concept-${concept.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {concept.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strategies */}
        <Card>
          <CardHeader>
            <CardTitle>Related Strategies ({formData.strategy_ids?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {strategies.map(strategy => (
                <div key={strategy.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`strategy-${strategy.id}`}
                    checked={formData.strategy_ids?.includes(strategy.id) || false}
                    onCheckedChange={(checked) => 
                      handleMultiSelectChange('strategy_ids', strategy.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`strategy-${strategy.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {strategy.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional notes about this drill..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  )
}