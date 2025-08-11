'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/SupabaseAuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  AlertCircle, 
  Shield, 
  Users, 
  UserCheck, 
  Search
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  full_name: string
  roles: string[]
  last_login?: string
}

interface RoleChangeModal {
  open: boolean
  user: User | null
  newRole: string
  reason: string
}

const AVAILABLE_ROLES = [
  'admin',
  'coach', 
  'player',
  'parent'
]

export default function RoleManagementPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [roleChangeModal, setRoleChangeModal] = useState<RoleChangeModal>({
    open: false,
    user: null,
    newRole: '',
    reason: ''
  })

  // Check permissions - only admin can manage roles
  const isAdmin = currentUser?.user_metadata?.roles?.includes('admin') || 
                  currentUser?.email?.includes('admin@powlax.com') ||
                  currentUser?.email?.includes('patrick@powlax.com')

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // Get users from Supabase Auth
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      
      if (authUsers?.users) {
        const transformedUsers = authUsers.users.map(user => ({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          roles: user.user_metadata?.roles || ['player'],
          last_login: user.last_sign_in_at || undefined
        }))
        setUsers(transformedUsers)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async () => {
    if (!roleChangeModal.user || !roleChangeModal.newRole) return

    try {
      // Update user metadata
      const { error } = await supabase.auth.admin.updateUserById(
        roleChangeModal.user.id,
        {
          user_metadata: {
            ...roleChangeModal.user,
            roles: [roleChangeModal.newRole]
          }
        }
      )

      if (error) {
        toast.error('Failed to update role: ' + error.message)
        return
      }

      toast.success(`Role updated for ${roleChangeModal.user.full_name}`)
      
      // Update local state
      setUsers(users.map(u => 
        u.id === roleChangeModal.user!.id 
          ? { ...u, roles: [roleChangeModal.newRole] }
          : u
      ))
      
      // Close modal
      setRoleChangeModal({
        open: false,
        user: null,
        newRole: '',
        reason: ''
      })
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('An error occurred while updating role')
    }
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || user.roles.includes(filterRole)

    return matchesSearch && matchesRole
  })

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
              You don&apos;t have permission to manage user roles
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">
            Manage user roles across the platform
          </p>
        </div>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Your Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="default">Administrator</Badge>
            <span className="text-sm text-gray-600">
              Full system access - can manage all roles
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name || user.email}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          user.roles.includes('admin') ? 'default' :
                          user.roles.includes('coach') ? 'secondary' :
                          'outline'
                        }>
                          {user.roles[0] || 'player'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRoleChangeModal({
                            open: true,
                            user,
                            newRole: '',
                            reason: ''
                          })}
                          disabled={user.id === currentUser?.id}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Change Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Change Modal */}
      <Dialog 
        open={roleChangeModal.open} 
        onOpenChange={(open) => setRoleChangeModal(prev => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update role for {roleChangeModal.user?.full_name || roleChangeModal.user?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Current Role</label>
              <div className="mt-1">
                <Badge variant="outline">
                  {roleChangeModal.user?.roles[0] || 'player'}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">New Role</label>
              <Select 
                value={roleChangeModal.newRole} 
                onValueChange={(value) => setRoleChangeModal(prev => ({
                  ...prev,
                  newRole: value
                }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ROLES.map(role => (
                    <SelectItem key={role} value={role}>
                      {role.replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Reason for Change</label>
              <Input
                className="mt-1"
                placeholder="Optional: Provide a reason..."
                value={roleChangeModal.reason}
                onChange={(e) => setRoleChangeModal(prev => ({
                  ...prev,
                  reason: e.target.value
                }))}
              />
            </div>

            {roleChangeModal.newRole && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  This will update the user&apos;s role and may require them to log in again.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleChangeModal({
                open: false,
                user: null,
                newRole: '',
                reason: ''
              })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={!roleChangeModal.newRole}
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}