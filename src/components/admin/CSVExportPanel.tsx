'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Download,
  Users,
  Filter,
  FileText,
  Settings,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { UserCSVProcessor, type ExportOptions } from '@/lib/csv/user-import-export'

interface CSVExportPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedUserIds?: string[]
  totalUsers?: number
}

export default function CSVExportPanel({ 
  isOpen, 
  onClose, 
  selectedUserIds = [], 
  totalUsers = 0 
}: CSVExportPanelProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeRoles: true,
    includeMemberships: true,
    includeTeams: true,
    includeActivity: false,
    includePersonalInfo: false,
    userIds: selectedUserIds.length > 0 ? selectedUserIds : undefined
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportScope, setExportScope] = useState<'all' | 'selected' | 'filtered'>(
    selectedUserIds.length > 0 ? 'selected' : 'all'
  )

  const handleExportScopeChange = (scope: 'all' | 'selected' | 'filtered') => {
    setExportScope(scope)
    
    if (scope === 'selected' && selectedUserIds.length > 0) {
      setExportOptions(prev => ({ ...prev, userIds: selectedUserIds }))
    } else {
      setExportOptions(prev => ({ ...prev, userIds: undefined }))
    }
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      const csvContent = await UserCSVProcessor.exportUsers(exportOptions)
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const scope = exportScope === 'selected' ? 'selected' : exportScope === 'filtered' ? 'filtered' : 'all'
      link.download = `powlax-users-export-${scope}-${timestamp}.csv`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Users exported successfully')
      onClose()
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed: ' + (error as Error).message)
    } finally {
      setIsExporting(false)
    }
  }

  const getExportedUserCount = () => {
    switch (exportScope) {
      case 'selected':
        return selectedUserIds.length
      case 'all':
        return totalUsers
      case 'filtered':
        return totalUsers // This would need to be passed from parent with actual filtered count
      default:
        return totalUsers
    }
  }

  const getEstimatedFields = () => {
    const baseFields = ['email', 'display_name', 'created_at', 'last_sign_in_at']
    const fields = [...baseFields]
    
    if (exportOptions.includePersonalInfo) {
      fields.push('phone', 'bio')
    }
    if (exportOptions.includeRoles) {
      fields.push('roles')
    }
    if (exportOptions.includeTeams) {
      fields.push('teams', 'team_roles')
    }
    if (exportOptions.includeMemberships) {
      fields.push('membership_products')
    }
    if (exportOptions.includeActivity) {
      fields.push('points_balance', 'badges')
    }
    
    return fields
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Users to CSV
          </DialogTitle>
          <DialogDescription>
            Configure your export settings and download user data as CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Scope */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Export Scope
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="scope-all"
                    name="exportScope"
                    value="all"
                    checked={exportScope === 'all'}
                    onChange={(e) => handleExportScopeChange('all')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor="scope-all" className="flex items-center gap-2">
                    All users 
                    <Badge variant="outline">{totalUsers} users</Badge>
                  </Label>
                </div>
                
                {selectedUserIds.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="scope-selected"
                      name="exportScope"
                      value="selected"
                      checked={exportScope === 'selected'}
                      onChange={(e) => handleExportScopeChange('selected')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="scope-selected" className="flex items-center gap-2">
                      Selected users only 
                      <Badge variant="secondary">{selectedUserIds.length} users</Badge>
                    </Label>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                {exportScope === 'all' && 'Export all users in the system'}
                {exportScope === 'selected' && 'Export only the users you have selected'}
                {exportScope === 'filtered' && 'Export users matching current filters'}
              </div>
            </CardContent>
          </Card>

          {/* Data Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Data Fields
              </CardTitle>
              <CardDescription>
                Select which data fields to include in the export
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Fields (Always Included) */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Basic Fields (Always Included)
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['email', 'display_name', 'created_at', 'last_sign_in_at'].map(field => (
                    <Badge key={field} variant="secondary">
                      {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Optional Fields
                </Label>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="include-personal"
                      checked={exportOptions.includePersonalInfo}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, includePersonalInfo: !!checked }))
                      }
                    />
                    <div>
                      <Label htmlFor="include-personal" className="font-medium">
                        Personal Information
                      </Label>
                      <p className="text-sm text-gray-600">
                        Include phone numbers and bio fields
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="include-roles"
                      checked={exportOptions.includeRoles}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, includeRoles: !!checked }))
                      }
                    />
                    <div>
                      <Label htmlFor="include-roles" className="font-medium">
                        User Roles
                      </Label>
                      <p className="text-sm text-gray-600">
                        Include user role assignments (administrator, coach, player, etc.)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="include-teams"
                      checked={exportOptions.includeTeams}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, includeTeams: !!checked }))
                      }
                    />
                    <div>
                      <Label htmlFor="include-teams" className="font-medium">
                        Team Associations
                      </Label>
                      <p className="text-sm text-gray-600">
                        Include team memberships and roles within teams
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="include-memberships"
                      checked={exportOptions.includeMemberships}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, includeMemberships: !!checked }))
                      }
                    />
                    <div>
                      <Label htmlFor="include-memberships" className="font-medium">
                        Membership Products
                      </Label>
                      <p className="text-sm text-gray-600">
                        Include active membership products and access levels
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="include-activity"
                      checked={exportOptions.includeActivity}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, includeActivity: !!checked }))
                      }
                    />
                    <div>
                      <Label htmlFor="include-activity" className="font-medium">
                        Activity & Gamification
                      </Label>
                      <p className="text-sm text-gray-600">
                        Include points, badges, and activity tracking data
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Export Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Users to Export</Label>
                  <div className="text-2xl font-bold text-blue-600">
                    {getExportedUserCount()}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Total Fields</Label>
                  <div className="text-2xl font-bold text-green-600">
                    {getEstimatedFields().length}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-700">
                  Fields to Export
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {getEstimatedFields().map(field => (
                    <Badge key={field} variant="outline">
                      {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            
            <Button 
              onClick={handleExport}
              disabled={isExporting || getExportedUserCount() === 0}
              className="min-w-[140px]"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </>
              )}
            </Button>
          </div>

          {/* Format Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Export Format</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your CSV file will be formatted for easy import back into POWLAX or other systems. 
                    Multi-value fields (roles, teams, etc.) are separated by semicolons.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}