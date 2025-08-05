'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/JWTAuthContext'
import { roleManager, WORDPRESS_ROLES, WordPressRole } from '@/lib/wordpress-role-management'
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
  RefreshCw,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  wordpress_id: number
  email: string
  full_name: string
  roles: string[]
  organization_id?: string
  organization_name?: string
  last_login?: string
  subscription_status?: string
}

interface RoleChangeModal {
  open: boolean
  user: User | null
  newRole: WordPressRole | ''
  reason: string
}

export default function RoleManagementPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterOrg, setFilterOrg] = useState<string>('all')
  const [organizations, setOrganizations] = useState<Array<{id: string, name: string}>>([])
  const [roleChangeModal, setRoleChangeModal] = useState<RoleChangeModal>({
    open: false,
    user: null,
    newRole: '',
    reason: ''
  })
  const [syncing, setSyncing] = useState(false)

  // Check permissions
  const isAdmin = currentUser?.roles?.includes('administrator')
  const isDirector = currentUser?.roles?.includes('club_director')
  const canManageRoles = isAdmin || isDirector

  useEffect(() => {
    if (canManageRoles) {
      fetchUsers()
      fetchOrganizations()
    }
  }, [canManageRoles])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('users')
        .select(`
          *,
          teams!inner(
            organization_id,
            organizations!inner(name)
          )
        `)
        .order('last_login', { ascending: false })

      // Directors only see their organization
      if (isDirector && !isAdmin) {
        const { data: directorData } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', currentUser!.id)
          .single()

        if (directorData?.organization_id) {
          query = query.eq('teams.organization_id', directorData.organization_id)
        }
      }

      const { data, error } = await query

      if (error) throw error

      // Transform data to include organization info
      const transformedUsers = data?.map(user => ({
        ...user,
        organization_name: user.teams?.[0]?.organizations?.name || 'No Organization'
      })) || []

      setUsers(transformedUsers)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name')

      if (error) throw error
      setOrganizations(data || [])
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    }
  }

  const handleRoleChange = async () => {
    if (!roleChangeModal.user || !roleChangeModal.newRole) return

    try {
      const result = await roleManager.updateUserRole(
        roleChangeModal.user.id,
        roleChangeModal.newRole,
        currentUser!.id,
        roleChangeModal.reason
      )

      if (result.success) {
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
      } else {
        toast.error(result.error || 'Failed to update role')
      }
    } catch (error) {
      toast.error('An error occurred while updating role')
    }
  }

  const handleSyncAllRoles = async () => {
    if (!isAdmin) {
      toast.error('Only administrators can sync all roles')
      return
    }

    setSyncing(true)
    try {
      const result = await roleManager.syncAllRoles(currentUser!.id)
      
      if (result.success) {
        toast.success(`Successfully synced ${result.synced} users`)
        fetchUsers() // Refresh the list
      } else {
        toast.error(`Sync completed with errors: ${result.errors.join(', ')}`)
      }
    } catch (error) {
      toast.error('Failed to sync roles')
    } finally {
      setSyncing(false)
    }
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || user.roles.includes(filterRole)
    
    const matchesOrg = filterOrg === 'all' || user.organization_id === filterOrg

    return matchesSearch && matchesRole && matchesOrg
  })

  // Get available roles for current user
  const availableRoles = roleManager.getAvailableRoles(currentUser?.roles || [])

  if (!canManageRoles) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to manage user roles
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
            {isAdmin ? 'Manage all user roles across the platform' : 'Manage user roles in your organization'}
          </p>
        </div>
        
        {isAdmin && (
          <Button
            onClick={handleSyncAllRoles}
            disabled={syncing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync with WordPress
          </Button>
        )}
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
            <Badge variant={isAdmin ? 'default' : 'secondary'}>
              {isAdmin ? 'Administrator' : 'Director'}
            </Badge>
            <span className="text-sm text-gray-600">
              {isAdmin 
                ? 'Full system access - can manage all roles' 
                : 'Organization access - can manage coach, player, and parent roles'}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <SelectItem value="club_director">Director</SelectItem>
                <SelectItem value="team_coach">Coach</SelectItem>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>

            {isAdmin && (
              <Select value={filterOrg} onValueChange={setFilterOrg}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
                    {isAdmin && <TableHead>Organization</TableHead>}
                    <TableHead>Status</TableHead>
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
                          user.roles.includes('administrator') ? 'default' :
                          user.roles.includes('club_director') ? 'secondary' :
                          'outline'
                        }>
                          {user.roles[0] || 'No Role'}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>{user.organization_name}</TableCell>
                      )}
                      <TableCell>
                        <Badge variant={
                          user.subscription_status === 'active' ? 'default' : 'secondary'
                        }>
                          {user.subscription_status || 'No Subscription'}
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
                          disabled={
                            // Can't change own role
                            user.id === currentUser?.id ||
                            // Directors can't change admin/director roles
                            (!isAdmin && (
                              user.roles.includes('administrator') || 
                              user.roles.includes('club_director')
                            ))
                          }
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
                  {roleChangeModal.user?.roles[0] || 'No Role'}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">New Role</label>
              <Select 
                value={roleChangeModal.newRole} 
                onValueChange={(value) => setRoleChangeModal(prev => ({
                  ...prev,
                  newRole: value as WordPressRole
                }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                  This will update the user's role in WordPress and require them to log in again.
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