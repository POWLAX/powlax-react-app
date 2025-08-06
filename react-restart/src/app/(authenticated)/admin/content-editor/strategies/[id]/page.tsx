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

interface Strategy {
  id: string
  name: string
  description: string
  game_phase: string
  complexity_level: number
  video_url?: string
  diagram_url?: string
  lacrosse_lab_urls?: string[]
  updated_at: string
}

export default function StrategyEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<Strategy>>({
    name: '',
    description: '',
    game_phase: '',
    complexity_level: 3,
    video_url: '',
    diagram_url: '',
    lacrosse_lab_urls: []
  })

  // Available game phases
  const gamePhases = [
    'Offense',
    'Defense', 
    'Transition',
    'Special Situations',
    'Face-offs',
    'Settled Offense',
    'Settled Defense',
    'Man Up',
    'Man Down'
  ]

  const strategyId = params.id as string

  // Check permissions
  const isAdmin = currentUser?.roles?.includes('administrator')

  useEffect(() => {
    if (isAdmin && strategyId) {
      fetchStrategy()
    }
  }, [isAdmin, strategyId])

  const fetchStrategy = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('strategies_powlax')
        .select('*')
        .eq('id', strategyId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Strategy not found')
          router.push('/admin/content-editor')
          return
        }
        throw error
      }

      setStrategy(data)
      setFormData({
        name: data.name || '',
        description: data.description || '',
        game_phase: data.game_phase || '',
        complexity_level: data.complexity_level || 3,
        video_url: data.video_url || '',
        diagram_url: data.diagram_url || '',
        lacrosse_lab_urls: data.lacrosse_lab_urls || []
      })
    } catch (error) {
      console.error('Failed to fetch strategy:', error)
      toast.error('Failed to load strategy')
      router.push('/admin/content-editor')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Strategy, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const handleLacrosseLabUrlChange = (index: number, value: string) => {
    const newUrls = [...(formData.lacrosse_lab_urls || [])]
    newUrls[index] = value
    handleInputChange('lacrosse_lab_urls', newUrls)
  }

  const addLacrosseLabUrl = () => {
    const newUrls = [...(formData.lacrosse_lab_urls || []), '']
    handleInputChange('lacrosse_lab_urls', newUrls)
  }

  const removeLacrosseLabUrl = (index: number) => {
    const newUrls = (formData.lacrosse_lab_urls || []).filter((_, i) => i !== index)
    handleInputChange('lacrosse_lab_urls', newUrls)
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

  const validateVimeoUrl = (url: string | undefined | null): 'valid' | 'invalid' | 'empty' => {
    if (!url || url.trim() === '') return 'empty'
    const status = validateUrl(url)
    if (status !== 'valid') return status
    
    // Check if it's a Vimeo URL
    const vimeoPattern = /vimeo\.com/i
    return vimeoPattern.test(url) ? 'valid' : 'invalid'
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
        toast.error('Strategy name is required')
        return
      }

      if (!formData.game_phase) {
        toast.error('Game phase is required')
        return
      }

      // Filter out empty URLs
      const cleanedUrls = (formData.lacrosse_lab_urls || [])
        .filter(url => url && url.trim() !== '')

      const updateData = {
        ...formData,
        lacrosse_lab_urls: cleanedUrls,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('strategies_powlax')
        .update(updateData)
        .eq('id', strategyId)

      if (error) throw error

      toast.success('Strategy updated successfully!')
      setHasChanges(false)
      
      // Refresh strategy data
      fetchStrategy()
    } catch (error) {
      console.error('Failed to save strategy:', error)
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this strategy? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('strategies_powlax')
        .delete()
        .eq('id', strategyId)

      if (error) throw error

      toast.success('Strategy deleted successfully')
      router.push('/admin/content-editor')
    } catch (error) {
      console.error('Failed to delete strategy:', error)
      toast.error('Failed to delete strategy')
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
              Only administrators can edit strategies
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

  if (!strategy) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Not Found</CardTitle>
            <CardDescription>
              The requested strategy could not be found
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Strategy</h1>
          <p className="text-gray-600">
            {strategy.name} • Last updated: {new Date(strategy.updated_at).toLocaleString()}
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
              <Label htmlFor="name">Strategy Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter strategy name..."
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the strategy..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="game_phase">Game Phase *</Label>
              <Select
                value={formData.game_phase || ''}
                onValueChange={(value) => handleInputChange('game_phase', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select game phase" />
                </SelectTrigger>
                <SelectContent>
                  {gamePhases.map(phase => (
                    <SelectItem key={phase} value={phase}>
                      {phase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Complexity Level: {formData.complexity_level}/5</Label>
              <Slider
                value={[formData.complexity_level || 3]}
                onValueChange={(value) => handleInputChange('complexity_level', value[0])}
                max={5}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Media URLs */}
        <Card>
          <CardHeader>
            <CardTitle>Media & Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="video_url" className="flex items-center gap-2">
                Video URL (Vimeo)
                {getUrlStatusIcon(validateVimeoUrl(formData.video_url))}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="video_url"
                  value={formData.video_url || ''}
                  onChange={(e) => handleInputChange('video_url', e.target.value)}
                  placeholder="https://vimeo.com/..."
                />
                {formData.video_url && validateUrl(formData.video_url) === 'valid' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={formData.video_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="diagram_url" className="flex items-center gap-2">
                Diagram URL
                {getUrlStatusIcon(validateUrl(formData.diagram_url))}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="diagram_url"
                  value={formData.diagram_url || ''}
                  onChange={(e) => handleInputChange('diagram_url', e.target.value)}
                  placeholder="https://..."
                />
                {formData.diagram_url && validateUrl(formData.diagram_url) === 'valid' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={formData.diagram_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lacrosse Lab URLs - Priority Section */}
      <Card className="border-powlax-orange">
        <CardHeader>
          <CardTitle className="text-powlax-orange flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Lacrosse Lab URLs (Priority Fix)
          </CardTitle>
          <CardDescription>
            Manage Lacrosse Lab links. Invalid or broken links will be highlighted in red.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(formData.lacrosse_lab_urls || []).map((url, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <Label className="flex items-center gap-2 mb-2">
                  Lacrosse Lab URL {index + 1}
                  {getUrlStatusIcon(validateLacrosseLabUrl(url))}
                </Label>
                <Input
                  value={url}
                  onChange={(e) => handleLacrosseLabUrlChange(index, e.target.value)}
                  placeholder="https://lacrosselab.com/..."
                  className={
                    validateLacrosseLabUrl(url) === 'invalid' 
                      ? 'border-red-500' 
                      : validateLacrosseLabUrl(url) === 'valid'
                      ? 'border-green-500'
                      : ''
                  }
                />
              </div>
              
              <div className="flex gap-1 mt-7">
                {url && validateUrl(url) === 'valid' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLacrosseLabUrl(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addLacrosseLabUrl}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lacrosse Lab URL
          </Button>
        </CardContent>
      </Card>

      {/* URL Validation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>URL Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              {getUrlStatusIcon(validateVimeoUrl(formData.video_url))}
              <span>Video URL</span>
            </div>
            <div className="flex items-center gap-2">
              {getUrlStatusIcon(validateUrl(formData.diagram_url))}
              <span>Diagram URL</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>
                {(formData.lacrosse_lab_urls || []).filter(url => validateLacrosseLabUrl(url) === 'valid').length} Valid Lab URLs
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>
                {(formData.lacrosse_lab_urls || []).filter(url => validateLacrosseLabUrl(url) === 'invalid').length} Invalid Lab URLs
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}