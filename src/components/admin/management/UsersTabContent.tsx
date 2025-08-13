'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { 
  Users, 
  Search,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Edit,
  Link2,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'
import MembershipCapabilityDisplay from '@/components/admin/MembershipCapabilityDisplay'
import CompleteUserEditor from '@/components/admin/CompleteUserEditor'
import BulkOperationsPanel from '@/components/admin/BulkOperationsPanel'
import CSVImportPanel from '@/components/admin/CSVImportPanel'
import CSVExportPanel from '@/components/admin/CSVExportPanel'
import { useMagicLinkManagement } from '@/hooks/useMagicLinkManagement'

interface User {
  id: string
  email: string
  display_name?: string
  roles: string[]
  created_at: string
  last_sign_in_at?: string
}

interface UserStats {
  total: number
  withAcademy: number
  coaches: number
  teamMembers: number
  parents: number
}

export default function UsersTabContent() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [membershipFilter, setMembershipFilter] = useState<string>('all')
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    withAcademy: 0,
    coaches: 0,
    teamMembers: 0,
    parents: 0
  })
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [showBulkOperations, setShowBulkOperations] = useState(false)
  const [showCSVImport, setShowCSVImport] = useState(false)
  const [showCSVExport, setShowCSVExport] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  
  const { generateMagicLink, sendViaEmail } = useMagicLinkManagement()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Get users with their team memberships
      const { data: usersData, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          display_name,
          roles,
          created_at,
          last_sign_in_at
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching users:', error)
        toast.error('Failed to load users: ' + error.message)
        return
      }

      if (usersData) {
        setUsers(usersData)
        
        // Calculate stats
        const newStats: UserStats = {
          total: usersData.length,
          withAcademy: 0,
          coaches: 0,
          teamMembers: 0,
          parents: 0
        }
        
        usersData.forEach(user => {
          const userRoles = user.roles || []
          if (userRoles.includes('team_coach') || userRoles.includes('head_coach')) {
            newStats.coaches++
          }
          if (userRoles.includes('player')) {
            newStats.teamMembers++
          }
          if (userRoles.includes('parent')) {
            newStats.parents++
          }
        })
        
        setStats(newStats)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchUsers()
  }

  const handleExport = () => {
    setShowCSVExport(true)
  }

  const handleImport = () => {
    setShowCSVImport(true)
  }

  const handleBulkOperations = () => {
    setShowBulkOperations(true)
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([])
    } else {
      setSelectedUserIds(filteredUsers.map(user => user.id))
    }
  }

  const handleEditUser = (userId: string) => {
    setEditingUserId(userId)
    setIsEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setEditingUserId(null)
    setIsEditorOpen(false)
  }

  const handleUserUpdated = () => {
    // Refresh the users list when a user is updated
    fetchUsers()
  }

  const handleSendMagicLink = async (userId: string, userEmail: string) => {
    try {
      // Generate magic link with capability-aware routing
      const link = await generateMagicLink({
        userId,
        expiresIn: 24 * 60 * 60 // 24 hours
      })

      // Send via email
      await sendViaEmail(link.id)
      
      toast.success(`Magic link sent to ${userEmail}`)
    } catch (error) {
      console.error('Failed to send magic link:', error)
      toast.error('Failed to send magic link: ' + (error as Error).message)
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = roleFilter === 'all' || (user.roles && user.roles.includes(roleFilter))

    // Membership filter will be enhanced once we have capability data
    const matchesMembership = membershipFilter === 'all'

    return matchesSearch && matchesRole && matchesMembership
  })

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.coaches}</div>
            <div className="text-sm text-gray-600">Coaches</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{stats.teamMembers}</div>
            <div className="text-sm text-gray-600">Team Members</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">{stats.parents}</div>
            <div className="text-sm text-gray-600">Parents</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.withAcademy}</div>
            <div className="text-sm text-gray-600">With Academy</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button onClick={handleImport} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" />
                Import
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button onClick={handleBulkOperations} variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Bulk Ops
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Manage users and view their membership capabilities
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
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

            <Select value={membershipFilter} onValueChange={setMembershipFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by membership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Memberships</SelectItem>
                <SelectItem value="academy">Has Academy</SelectItem>
                <SelectItem value="coach">Coach Access</SelectItem>
                <SelectItem value="team">Team Access</SelectItem>
                <SelectItem value="none">No Active Membership</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {filteredUsers.length} of {users.length} users
                  </div>
                  {selectedUserIds.length > 0 && (
                    <Badge variant="secondary">
                      {selectedUserIds.length} selected
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedUserIds.length > 0 && (
                    <Button onClick={handleBulkOperations} className="bg-gray-900 hover:bg-gray-800 text-white" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Bulk Actions ({selectedUserIds.length})
                    </Button>
                  )}
                  <Badge variant="outline">
                    <Filter className="h-3 w-3 mr-1" />
                    {searchTerm || roleFilter !== 'all' || membershipFilter !== 'all' ? 'Filtered' : 'All'}
                  </Badge>
                </div>
              </div>

              <div className="overflow-x-auto">
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
                      <TableHead>Membership</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
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
                                  className="text-xs"
                                >
                                  {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">No Roles</Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <MembershipCapabilityDisplay 
                            userId={user.id} 
                            compact={true}
                            showProducts={false}
                            showCapabilities={false}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {user.last_sign_in_at 
                              ? new Date(user.last_sign_in_at).toLocaleDateString()
                              : 'Never'
                            }
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user.id)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendMagicLink(user.id, user.email)}
                              title="Send magic link"
                            >
                              <Link2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No users found matching the current filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete User Editor Modal */}
      <CompleteUserEditor
        userId={editingUserId}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        onUserUpdated={handleUserUpdated}
      />

      {/* Bulk Operations Panel */}
      {showBulkOperations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-8 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Bulk Operations</h2>
                <Button onClick={() => setShowBulkOperations(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-900">
                  Close
                </Button>
              </div>
              <BulkOperationsPanel
                onImportCSV={() => {
                  setShowBulkOperations(false)
                  setShowCSVImport(true)
                }}
                onExportCSV={() => {
                  setShowBulkOperations(false)
                  setShowCSVExport(true)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <CSVImportPanel
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        onImportComplete={(result) => {
          setShowCSVImport(false)
          fetchUsers() // Refresh the user list
          toast.success(`Import completed: ${result.created} created, ${result.updated} updated`)
        }}
      />

      {/* CSV Export Modal */}
      <CSVExportPanel
        isOpen={showCSVExport}
        onClose={() => setShowCSVExport(false)}
        selectedUserIds={selectedUserIds}
        totalUsers={users.length}
      />
    </div>
  )
}