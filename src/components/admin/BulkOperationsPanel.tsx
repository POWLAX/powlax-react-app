'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Filter,
  Play,
  Square,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  Link2,
  UserCheck,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'
import { useBulkUserOperations, type BulkFilterCriteria, type BulkRoleOperation } from '@/hooks/useBulkUserOperations'

interface BulkOperationsPanelProps {
  onImportCSV?: () => void
  onExportCSV?: () => void
}

export default function BulkOperationsPanel({ onImportCSV, onExportCSV }: BulkOperationsPanelProps) {
  const {
    users,
    filteredUsers,
    loading,
    operationProgress,
    loadUsers,
    filterUsers,
    bulkUpdateRoles,
    bulkAssignMemberships,
    bulkSendMagicLinks,
    resetPasswords,
    cancelOperation
  } = useBulkUserOperations()

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [filterCriteria, setFilterCriteria] = useState<BulkFilterCriteria>({})
  const [activeOperation, setActiveOperation] = useState<string | null>(null)

  // Role operation state
  const [roleOperation, setRoleOperation] = useState<{
    type: 'add' | 'remove' | 'set'
    roles: string[]
  }>({
    type: 'add',
    roles: []
  })

  // Membership operation state
  const [membershipProducts, setMembershipProducts] = useState<string[]>([])

  // Magic link options
  const [magicLinkOptions, setMagicLinkOptions] = useState({
    expiresIn: 24 * 60 * 60, // 24 hours
    redirectTo: '/dashboard'
  })

  const availableRoles = [
    'administrator',
    'club_director', 
    'team_coach',
    'player',
    'parent'
  ]

  const availableMembershipProducts = [
    'academy_access',
    'coach_access',
    'team_access',
    'parent_access',
    'full_access'
  ]

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleFilterChange = (newCriteria: Partial<BulkFilterCriteria>) => {
    const updatedCriteria = { ...filterCriteria, ...newCriteria }
    setFilterCriteria(updatedCriteria)
    filterUsers(updatedCriteria)
    setSelectedUserIds([]) // Clear selection when filter changes
  }

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([])
    } else {
      setSelectedUserIds(filteredUsers.map(user => user.id))
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleBulkRoleUpdate = async () => {
    if (selectedUserIds.length === 0) {
      toast.error('Please select users first')
      return
    }

    if (roleOperation.roles.length === 0) {
      toast.error('Please select roles')
      return
    }

    try {
      setActiveOperation('roles')
      
      const operation: BulkRoleOperation = {}
      if (roleOperation.type === 'add') {
        operation.add = roleOperation.roles
      } else if (roleOperation.type === 'remove') {
        operation.remove = roleOperation.roles
      } else {
        operation.set = roleOperation.roles
      }

      const result = await bulkUpdateRoles(selectedUserIds, operation)
      
      if (result.success) {
        toast.success(`Roles updated for ${result.successCount} users`)
        setSelectedUserIds([])
      } else {
        toast.error(`Failed to update ${result.failureCount} users`)
      }
    } catch (error) {
      console.error('Bulk role update failed:', error)
      toast.error('Bulk role update failed: ' + (error as Error).message)
    } finally {
      setActiveOperation(null)
    }
  }

  const handleBulkMembershipAssignment = async () => {
    if (selectedUserIds.length === 0) {
      toast.error('Please select users first')
      return
    }

    if (membershipProducts.length === 0) {
      toast.error('Please select membership products')
      return
    }

    try {
      setActiveOperation('memberships')
      
      const result = await bulkAssignMemberships(selectedUserIds, membershipProducts)
      
      if (result.success) {
        toast.success(`Memberships assigned to ${result.successCount} users`)
        setSelectedUserIds([])
      } else {
        toast.error(`Failed to assign memberships to ${result.failureCount} users`)
      }
    } catch (error) {
      console.error('Bulk membership assignment failed:', error)
      toast.error('Bulk membership assignment failed: ' + (error as Error).message)
    } finally {
      setActiveOperation(null)
    }
  }

  const handleBulkSendMagicLinks = async () => {
    if (selectedUserIds.length === 0) {
      toast.error('Please select users first')
      return
    }

    try {
      setActiveOperation('magic_links')
      
      const result = await bulkSendMagicLinks(selectedUserIds, magicLinkOptions)
      
      if (result.success) {
        toast.success(`Magic links sent to ${result.successCount} users`)
        setSelectedUserIds([])
      } else {
        toast.error(`Failed to send magic links to ${result.failureCount} users`)
      }
    } catch (error) {
      console.error('Bulk magic link send failed:', error)
      toast.error('Bulk magic link send failed: ' + (error as Error).message)
    } finally {
      setActiveOperation(null)
    }
  }

  const handleBulkPasswordReset = async () => {
    if (selectedUserIds.length === 0) {
      toast.error('Please select users first')
      return
    }

    try {
      setActiveOperation('password_reset')
      
      const result = await resetPasswords(selectedUserIds)
      
      if (result.success) {
        toast.success(`Password reset initiated for ${result.successCount} users`)
        setSelectedUserIds([])
      } else {
        toast.error(`Failed to reset passwords for ${result.failureCount} users`)
      }
    } catch (error) {
      console.error('Bulk password reset failed:', error)
      toast.error('Bulk password reset failed: ' + (error as Error).message)
    } finally {
      setActiveOperation(null)
    }
  }

  const handleCancelOperation = () => {
    cancelOperation()
    setActiveOperation(null)
    toast.info('Operation cancelled')
  }

  const getProgressPercentage = () => {
    if (!operationProgress) return 0
    return Math.round((operationProgress.completed + operationProgress.failed) / operationProgress.total * 100)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            User Filters
          </CardTitle>
          <CardDescription>
            Filter users for bulk operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="role-filter">Filter by Roles</Label>
              <Select onValueChange={(value) => 
                handleFilterChange({ 
                  roles: value === 'all' ? undefined : [value] 
                })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="activity-filter">Activity Status</Label>
              <Select onValueChange={(value) => 
                handleFilterChange({ 
                  activityStatus: value === 'all' ? undefined : value as any
                })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active (30 days)</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="never_logged_in">Never Logged In</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => handleFilterChange({})}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredUsers.length} users match current filters
            </div>
            <div className="flex gap-2">
              <Button onClick={onImportCSV} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" />
                Import CSV
              </Button>
              <Button onClick={onExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Selection
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedUserIds.length} selected
              </Badge>
              <Button 
                onClick={handleSelectAll}
                variant="outline" 
                size="sm"
              >
                {selectedUserIds.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.display_name || user.email}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Role Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Operation Type</Label>
              <Select 
                value={roleOperation.type} 
                onValueChange={(value: 'add' | 'remove' | 'set') => 
                  setRoleOperation(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Roles</SelectItem>
                  <SelectItem value="remove">Remove Roles</SelectItem>
                  <SelectItem value="set">Set Roles (Replace All)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Select Roles</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availableRoles.map(role => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={roleOperation.roles.includes(role)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRoleOperation(prev => ({
                            ...prev,
                            roles: [...prev.roles, role]
                          }))
                        } else {
                          setRoleOperation(prev => ({
                            ...prev,
                            roles: prev.roles.filter(r => r !== role)
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={`role-${role}`} className="text-sm">
                      {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleBulkRoleUpdate}
              disabled={selectedUserIds.length === 0 || roleOperation.roles.length === 0 || activeOperation === 'roles'}
              className="w-full"
            >
              {activeOperation === 'roles' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating Roles...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Update Roles ({selectedUserIds.length} users)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Membership Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Membership Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Membership Products</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {availableMembershipProducts.map(product => (
                  <div key={product} className="flex items-center space-x-2">
                    <Checkbox
                      id={`product-${product}`}
                      checked={membershipProducts.includes(product)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setMembershipProducts(prev => [...prev, product])
                        } else {
                          setMembershipProducts(prev => prev.filter(p => p !== product))
                        }
                      }}
                    />
                    <Label htmlFor={`product-${product}`} className="text-sm">
                      {product.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleBulkMembershipAssignment}
              disabled={selectedUserIds.length === 0 || membershipProducts.length === 0 || activeOperation === 'memberships'}
              className="w-full"
            >
              {activeOperation === 'memberships' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning Memberships...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Assign Memberships ({selectedUserIds.length} users)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Communication Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Communication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="redirect-url">Redirect URL</Label>
              <Input
                id="redirect-url"
                value={magicLinkOptions.redirectTo}
                onChange={(e) => setMagicLinkOptions(prev => ({
                  ...prev,
                  redirectTo: e.target.value
                }))}
                placeholder="/dashboard"
              />
            </div>

            <div>
              <Label htmlFor="expires-hours">Expires (hours)</Label>
              <Input
                id="expires-hours"
                type="number"
                value={magicLinkOptions.expiresIn / 3600}
                onChange={(e) => setMagicLinkOptions(prev => ({
                  ...prev,
                  expiresIn: parseInt(e.target.value) * 3600
                }))}
                min="1"
                max="168"
              />
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleBulkSendMagicLinks}
                disabled={selectedUserIds.length === 0 || activeOperation === 'magic_links'}
                className="w-full"
              >
                {activeOperation === 'magic_links' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Links...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Send Magic Links ({selectedUserIds.length} users)
                  </>
                )}
              </Button>

              <Button 
                onClick={handleBulkPasswordReset}
                disabled={selectedUserIds.length === 0 || activeOperation === 'password_reset'}
                variant="outline"
                className="w-full"
              >
                {activeOperation === 'password_reset' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Resetting Passwords...
                  </>
                ) : (
                  'Reset Passwords'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operation Progress */}
      {operationProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Operation in Progress
              </div>
              <Button onClick={handleCancelOperation} variant="outline" size="sm">
                <Square className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{operationProgress.currentOperation}</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="w-full" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  {operationProgress.completed} completed
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm">
                  {operationProgress.failed} failed
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  {operationProgress.total - operationProgress.completed - operationProgress.failed} remaining
                </span>
              </div>
            </div>

            {operationProgress.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto">
                <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                {operationProgress.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded mb-1">
                    <strong>{error.userEmail}:</strong> {error.error}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}