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
  Search,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  display_name: string
  roles: string[]
  created_at: string
  last_sign_in_at?: string
}

interface RoleChangeModal {
  open: boolean
  user: User | null
  newRoles: string[]
  reason: string
}

interface RoleStats {
  administrator: number
  club_director: number
  team_coach: number
  player: number
  parent: number
  total: number
}

const AVAILABLE_ROLES = [
  'administrator',
  'club_director',
  'team_coach', 
  'player',
  'parent'
]

export default function RoleManagementPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [roleStats, setRoleStats] = useState<RoleStats>({
    administrator: 0,
    club_director: 0,
    team_coach: 0,
    player: 0,
    parent: 0,
    total: 0
  })
  const [roleChangeModal, setRoleChangeModal] = useState<RoleChangeModal>({
    open: false,
    user: null,
    newRoles: [],
    reason: ''
  })

  // Check permissions - only admin can manage roles
  const isAdmin = currentUser?.roles?.includes('administrator') || 
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
      
      // Fetch users directly from the users table
      const { data: usersData, error } = await supabase
        .from('users')
        .select('id, email, display_name, roles, created_at, last_sign_in_at')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching users:', error)
        toast.error('Failed to load users: ' + error.message)
        return
      }

      if (usersData) {
        setUsers(usersData)
        
        // Calculate role statistics
        const stats: RoleStats = {
          administrator: 0,
          club_director: 0,
          team_coach: 0,
          player: 0,
          parent: 0,
          total: usersData.length
        }
        
        usersData.forEach(user => {
          const userRoles = user.roles || []
          userRoles.forEach(role => {
            if (role === 'administrator') stats.administrator++
            if (role === 'club_director') stats.club_director++
            if (role === 'team_coach') stats.team_coach++
            if (role === 'player') stats.player++
            if (role === 'parent') stats.parent++
          })
        })
        
        setRoleStats(stats)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async () => {
    if (!roleChangeModal.user || roleChangeModal.newRoles.length === 0) return

    try {
      // Update user roles in the users table
      const { error } = await supabase
        .from('users')
        .update({ roles: roleChangeModal.newRoles })
        .eq('id', roleChangeModal.user.id)

      if (error) {
        toast.error('Failed to update roles: ' + error.message)
        return
      }

      toast.success(`Roles updated for ${roleChangeModal.user.display_name || roleChangeModal.user.email}`)
      
      // Refresh the users list to get updated data and recalculate stats
      await fetchUsers()
      
      // Close modal
      setRoleChangeModal({
        open: false,
        user: null,
        newRoles: [],
        reason: ''
      })
    } catch (error) {
      console.error('Error updating roles:', error)
      toast.error('An error occurred while updating roles')
    }
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = filterRole === 'all' || (user.roles && user.roles.includes(filterRole))

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

      {/* Role Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{roleStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600">Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{roleStats.administrator}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-600">Directors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{roleStats.club_director}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600">Coaches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{roleStats.team_coach}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-600">Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{roleStats.player}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-600">Parents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{roleStats.parent}</div>
          </CardContent>
        </Card>
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
                <SelectItem value="administrator">Administrator</SelectItem>
                <SelectItem value="club_director">Club Director</SelectItem>
                <SelectItem value="team_coach">Team Coach</SelectItem>
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
                    <TableHead>Current Roles</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.display_name || user.email}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role, index) => (
                              <Badge 
                                key={index}
                                variant={
                                  role === 'administrator' ? 'default' :
                                  role === 'club_director' ? 'secondary' :
                                  role === 'team_coach' ? 'secondary' :
                                  'outline'
                                }
                              >
                                {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">No Roles</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
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
                            newRoles: user.roles || [],
                            reason: ''
                          })}
                          disabled={user.id === currentUser?.id}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Edit Roles
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
            <DialogTitle>Edit User Roles</DialogTitle>
            <DialogDescription>
              Update roles for {roleChangeModal.user?.display_name || roleChangeModal.user?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Current Roles</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {roleChangeModal.user?.roles && roleChangeModal.user.roles.length > 0 ? (
                  roleChangeModal.user.roles.map((role, index) => (
                    <Badge key={index} variant="outline">
                      {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">No Roles</Badge>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Select New Roles</label>
              <div className="mt-2 space-y-2">
                {AVAILABLE_ROLES.map(role => (
                  <div key={role} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={role}
                      checked={roleChangeModal.newRoles.includes(role)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRoleChangeModal(prev => ({
                            ...prev,
                            newRoles: [...prev.newRoles, role]
                          }))
                        } else {
                          setRoleChangeModal(prev => ({
                            ...prev,
                            newRoles: prev.newRoles.filter(r => r !== role)
                          }))
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor={role} className="text-sm">
                      {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                  </div>
                ))}
              </div>
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

            {roleChangeModal.newRoles.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  This will update the user&apos;s roles immediately.
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
                newRoles: [],
                reason: ''
              })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={roleChangeModal.newRoles.length === 0}
            >
              Update Roles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}