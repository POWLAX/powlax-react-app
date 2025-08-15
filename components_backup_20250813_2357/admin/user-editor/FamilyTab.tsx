'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Heart, 
  UserPlus, 
  Users, 
  Plus, 
  Trash2,
  Crown,
  Baby,
  User
} from 'lucide-react'
import { toast } from 'sonner'

interface FamilyData {
  parent_relationships: any[]
  child_relationships: any[]
  family_account?: any
}

interface FamilyTabProps {
  userData: FamilyData
  onFieldChange: (tab: string, field: string, oldValue: any, newValue: any) => void
}

export default function FamilyTab({ userData, onFieldChange }: FamilyTabProps) {
  const [showAddChild, setShowAddChild] = useState(false)
  const [showAddParent, setShowAddParent] = useState(false)
  const [newChildEmail, setNewChildEmail] = useState('')
  const [newParentEmail, setNewParentEmail] = useState('')

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  const handleAddChildRelationship = async () => {
    if (!newChildEmail) {
      toast.error('Please enter a child email address')
      return
    }

    // Check if relationship already exists
    const existingChild = userData.parent_relationships.find(
      rel => rel.child_user?.email === newChildEmail
    )

    if (existingChild) {
      toast.error('This child relationship already exists')
      return
    }

    const newRelationship = {
      id: `rel_${Date.now()}`,
      parent_id: 'current_user', // Will be set properly in implementation
      child_id: `child_${Date.now()}`,
      relationship_type: 'parent_child',
      created_at: new Date().toISOString(),
      is_active: true,
      child_user: {
        id: `child_${Date.now()}`,
        email: newChildEmail,
        display_name: newChildEmail.split('@')[0] // Temporary name
      }
    }

    const updatedRelationships = [...userData.parent_relationships, newRelationship]
    onFieldChange('family', 'parent_relationships', userData.parent_relationships, updatedRelationships)
    
    toast.success('Child relationship added successfully')
    setShowAddChild(false)
    setNewChildEmail('')
  }

  const handleAddParentRelationship = async () => {
    if (!newParentEmail) {
      toast.error('Please enter a parent email address')
      return
    }

    // Check if relationship already exists
    const existingParent = userData.child_relationships.find(
      rel => rel.parent_user?.email === newParentEmail
    )

    if (existingParent) {
      toast.error('This parent relationship already exists')
      return
    }

    const newRelationship = {
      id: `rel_${Date.now()}`,
      parent_id: `parent_${Date.now()}`,
      child_id: 'current_user', // Will be set properly in implementation
      relationship_type: 'parent_child',
      created_at: new Date().toISOString(),
      is_active: true,
      parent_user: {
        id: `parent_${Date.now()}`,
        email: newParentEmail,
        display_name: newParentEmail.split('@')[0] // Temporary name
      }
    }

    const updatedRelationships = [...userData.child_relationships, newRelationship]
    onFieldChange('family', 'child_relationships', userData.child_relationships, updatedRelationships)
    
    toast.success('Parent relationship added successfully')
    setShowAddParent(false)
    setNewParentEmail('')
  }

  const handleRemoveChildRelationship = async (relationshipId: string) => {
    const updatedRelationships = userData.parent_relationships.filter(rel => rel.id !== relationshipId)
    onFieldChange('family', 'parent_relationships', userData.parent_relationships, updatedRelationships)
    toast.success('Child relationship removed successfully')
  }

  const handleRemoveParentRelationship = async (relationshipId: string) => {
    const updatedRelationships = userData.child_relationships.filter(rel => rel.id !== relationshipId)
    onFieldChange('family', 'child_relationships', userData.child_relationships, updatedRelationships)
    toast.success('Parent relationship removed successfully')
  }

  const handleCreateFamilyAccount = async () => {
    const newFamilyAccount = {
      id: `family_${Date.now()}`,
      primary_user_id: 'current_user',
      name: 'Family Account',
      created_at: new Date().toISOString(),
      is_active: true
    }

    onFieldChange('family', 'family_account', userData.family_account, newFamilyAccount)
    toast.success('Family account created successfully')
  }

  return (
    <div className="space-y-6">
      {/* Family Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Family Account
            </div>
            {!userData.family_account && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCreateFamilyAccount}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Family Account
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Family account management and billing consolidation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userData.family_account ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Crown className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">{userData.family_account.name}</h3>
                  <p className="text-sm text-gray-600">
                    Created {new Date(userData.family_account.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userData.parent_relationships.length + userData.child_relationships.length}
                  </div>
                  <div className="text-sm text-gray-600">Family Members</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userData.parent_relationships.length}
                  </div>
                  <div className="text-sm text-gray-600">Children</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {userData.child_relationships.length}
                  </div>
                  <div className="text-sm text-gray-600">Parents</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Family Account</h3>
              <p className="text-gray-500 mb-4">
                Create a family account to manage child accounts and consolidated billing
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Child Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Baby className="h-5 w-5" />
              Child Accounts ({userData.parent_relationships.length})
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddChild(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Child
            </Button>
          </CardTitle>
          <CardDescription>
            Child accounts managed by this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userData.parent_relationships.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No child accounts
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Child</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Relationship Since</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userData.parent_relationships.map((relationship) => (
                  <TableRow key={relationship.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={relationship.child_user?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {getInitials(
                              relationship.child_user?.display_name,
                              relationship.child_user?.email
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {relationship.child_user?.display_name || 
                             relationship.child_user?.email?.split('@')[0] || 
                             'Unknown Child'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{relationship.child_user?.email || 'No email'}</TableCell>
                    <TableCell>
                      {relationship.created_at 
                        ? new Date(relationship.created_at).toLocaleDateString()
                        : 'Unknown'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={relationship.is_active ? "default" : "outline"}
                        className={relationship.is_active ? "bg-green-100 text-green-800" : ""}
                      >
                        {relationship.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (confirm('This will remove the parent-child relationship. The child account will remain but will no longer be managed by this parent. Continue?')) {
                            handleRemoveChildRelationship(relationship.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Add Child Form */}
          {showAddChild && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-3">Add Child Account</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="child-email">Child's Email Address</Label>
                  <Input
                    id="child-email"
                    type="email"
                    placeholder="child@example.com"
                    value={newChildEmail}
                    onChange={(e) => setNewChildEmail(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the email address of the child account to add
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddChildRelationship} size="sm">
                    Add Child
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddChild(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parent Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Parent Accounts ({userData.child_relationships.length})
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddParent(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Parent
            </Button>
          </CardTitle>
          <CardDescription>
            Parent accounts that manage this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userData.child_relationships.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No parent accounts
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parent</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Relationship Since</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userData.child_relationships.map((relationship) => (
                  <TableRow key={relationship.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={relationship.parent_user?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {getInitials(
                              relationship.parent_user?.display_name,
                              relationship.parent_user?.email
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {relationship.parent_user?.display_name || 
                             relationship.parent_user?.email?.split('@')[0] || 
                             'Unknown Parent'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{relationship.parent_user?.email || 'No email'}</TableCell>
                    <TableCell>
                      {relationship.created_at 
                        ? new Date(relationship.created_at).toLocaleDateString()
                        : 'Unknown'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={relationship.is_active ? "default" : "outline"}
                        className={relationship.is_active ? "bg-green-100 text-green-800" : ""}
                      >
                        {relationship.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (confirm('This will remove the parent-child relationship. This user will no longer be managed by this parent. Continue?')) {
                            handleRemoveParentRelationship(relationship.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Add Parent Form */}
          {showAddParent && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-3">Add Parent Account</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="parent-email">Parent's Email Address</Label>
                  <Input
                    id="parent-email"
                    type="email"
                    placeholder="parent@example.com"
                    value={newParentEmail}
                    onChange={(e) => setNewParentEmail(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the email address of the parent account
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddParentRelationship} size="sm">
                    Add Parent
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddParent(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}