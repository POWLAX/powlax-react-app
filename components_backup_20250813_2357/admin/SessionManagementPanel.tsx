'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Monitor, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Clock, 
  LogOut, 
  User, 
  RefreshCw,
  AlertTriangle,
  Eye,
  X,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface Session {
  id: string
  user_id: string
  user_email?: string
  user_name?: string
  device_info?: {
    type: string
    browser: string
    os: string
  }
  ip_address?: string
  location?: {
    city?: string
    country?: string
  }
  last_activity: string
  created_at: string
  expires_at?: string
  is_current?: boolean
}

interface SessionStats {
  total: number
  active: number
  expired: number
  uniqueUsers: number
}

interface ImpersonationRequest {
  userId: string
  reason: string
}

interface SessionManagementPanelProps {
  userId?: string
  compact?: boolean
}

export default function SessionManagementPanel({ userId, compact = false }: SessionManagementPanelProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<SessionStats>({
    total: 0,
    active: 0,
    expired: 0,
    uniqueUsers: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showImpersonationForm, setShowImpersonationForm] = useState(false)
  const [impersonationData, setImpersonationData] = useState<ImpersonationRequest>({
    userId: '',
    reason: ''
  })

  useEffect(() => {
    fetchSessions()
  }, [userId])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('user_sessions')
        .select(`
          id,
          user_id,
          device_info,
          ip_address,
          location,
          last_activity,
          created_at,
          expires_at,
          users!inner(email, display_name)
        `)
        .order('last_activity', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching sessions:', error)
        toast.error('Failed to load sessions: ' + error.message)
        return
      }

      // Transform the data to include user information
      const transformedSessions = data?.map(session => ({
        ...session,
        user_email: (session.users as any)?.email,
        user_name: (session.users as any)?.display_name,
        is_current: false // We'd need to check this against current session
      })) || []

      setSessions(transformedSessions)

      // Calculate stats
      const now = new Date()
      const newStats: SessionStats = {
        total: transformedSessions.length,
        active: 0,
        expired: 0,
        uniqueUsers: new Set(transformedSessions.map(s => s.user_id)).size
      }

      transformedSessions.forEach(session => {
        const expiresAt = session.expires_at ? new Date(session.expires_at) : null
        const lastActivity = new Date(session.last_activity)
        const isActive = !expiresAt || expiresAt > now
        
        if (isActive) {
          newStats.active++
        } else {
          newStats.expired++
        }
      })

      setStats(newStats)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ expires_at: new Date().toISOString() })
        .eq('id', sessionId)

      if (error) {
        throw error
      }

      toast.success('Session terminated successfully')
      fetchSessions()
    } catch (error) {
      console.error('Failed to terminate session:', error)
      toast.error('Failed to terminate session: ' + (error as Error).message)
    }
  }

  const handleTerminateAllSessions = async (targetUserId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ expires_at: new Date().toISOString() })
        .eq('user_id', targetUserId)

      if (error) {
        throw error
      }

      toast.success('All user sessions terminated successfully')
      fetchSessions()
    } catch (error) {
      console.error('Failed to terminate all sessions:', error)
      toast.error('Failed to terminate all sessions: ' + (error as Error).message)
    }
  }

  const handleStartImpersonation = async () => {
    try {
      if (!impersonationData.userId || !impersonationData.reason) {
        toast.error('Please provide user ID and reason for impersonation')
        return
      }

      // Log the impersonation attempt
      const { error: logError } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: impersonationData.userId,
          action: 'admin_impersonation_start',
          details: {
            reason: impersonationData.reason,
            admin_user_id: 'current_admin_id', // TODO: Get from auth context
            timestamp: new Date().toISOString()
          }
        })

      if (logError) {
        console.error('Failed to log impersonation:', logError)
      }

      // In a real implementation, this would create an impersonation token
      // and redirect to the user's dashboard with admin overlay
      toast.success('Impersonation started (feature in development)')
      
      setShowImpersonationForm(false)
      setImpersonationData({ userId: '', reason: '' })
    } catch (error) {
      console.error('Failed to start impersonation:', error)
      toast.error('Failed to start impersonation: ' + (error as Error).message)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getSessionStatus = (session: Session) => {
    const now = new Date()
    const expiresAt = session.expires_at ? new Date(session.expires_at) : null
    const lastActivity = new Date(session.last_activity)
    
    // Check if session is expired
    if (expiresAt && expiresAt < now) {
      return <Badge variant="destructive">Expired</Badge>
    }
    
    // Check if session is stale (no activity in last 30 minutes)
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)
    if (lastActivity < thirtyMinutesAgo) {
      return <Badge variant="secondary">Idle</Badge>
    }
    
    return <Badge variant="default">Active</Badge>
  }

  const formatLastActivity = (lastActivity: string) => {
    const now = new Date()
    const activity = new Date(lastActivity)
    const diffMs = now.getTime() - activity.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 1) {
      return 'Just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffMinutes < 1440) {
      const diffHours = Math.floor(diffMinutes / 60)
      return `${diffHours}h ago`
    } else {
      const diffDays = Math.floor(diffMinutes / 1440)
      return `${diffDays}d ago`
    }
  }

  const filteredSessions = sessions.filter(session => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      session.user_email?.toLowerCase().includes(searchLower) ||
      session.user_name?.toLowerCase().includes(searchLower) ||
      session.ip_address?.includes(searchTerm) ||
      session.location?.city?.toLowerCase().includes(searchLower) ||
      session.location?.country?.toLowerCase().includes(searchLower)
    )
  })

  if (compact) {
    const userSessions = userId ? sessions.filter(s => s.user_id === userId) : sessions.slice(0, 3)
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Active Sessions</div>
          <Badge variant="outline">{userSessions.length}</Badge>
        </div>
        
        {userSessions.length > 0 ? (
          <div className="space-y-2">
            {userSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(session.device_info?.type || 'desktop')}
                  <div className="text-xs">
                    <div>{session.device_info?.browser || 'Unknown Browser'}</div>
                    <div className="text-gray-500">{formatLastActivity(session.last_activity)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getSessionStatus(session)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTerminateSession(session.id)}
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No active sessions</div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Session Management
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchSessions} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button 
              onClick={() => setShowImpersonationForm(true)} 
              variant="outline" 
              size="sm"
            >
              <Shield className="h-4 w-4 mr-1" />
              Impersonate
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Monitor and manage user sessions across the platform
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-gray-600">Expired</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">{stats.uniqueUsers}</div>
              <div className="text-sm text-gray-600">Unique Users</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search sessions by user, IP, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

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
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">
                            {session.user_name || session.user_email}
                          </div>
                          <div className="text-sm text-gray-600">
                            {session.user_email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(session.device_info?.type || 'desktop')}
                        <div className="text-sm">
                          <div>{session.device_info?.browser || 'Unknown'}</div>
                          <div className="text-gray-500">
                            {session.device_info?.os || 'Unknown OS'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <div className="text-sm">
                          <div>{session.location?.city || 'Unknown'}</div>
                          <div className="text-gray-500">
                            {session.ip_address || 'No IP'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getSessionStatus(session)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">
                          {formatLastActivity(session.last_activity)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setImpersonationData({ 
                            userId: session.user_id, 
                            reason: '' 
                          }) || setShowImpersonationForm(true)}
                          title="Impersonate user"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTerminateSession(session.id)}
                          title="Terminate session"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTerminateAllSessions(session.user_id)}
                          title="Terminate all user sessions"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredSessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No sessions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Impersonation Form Modal */}
      {showImpersonationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  User Impersonation
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImpersonationForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Start an impersonation session with audit logging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="impersonateUserId">User ID</Label>
                <Input
                  id="impersonateUserId"
                  value={impersonationData.userId}
                  onChange={(e) => setImpersonationData(prev => ({ 
                    ...prev, 
                    userId: e.target.value 
                  }))}
                  placeholder="Enter user ID to impersonate"
                />
              </div>

              <div>
                <Label htmlFor="impersonateReason">Reason (Required)</Label>
                <Textarea
                  id="impersonateReason"
                  value={impersonationData.reason}
                  onChange={(e) => setImpersonationData(prev => ({ 
                    ...prev, 
                    reason: e.target.value 
                  }))}
                  placeholder="Explain why you need to impersonate this user..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleStartImpersonation} className="flex-1">
                  <Shield className="h-4 w-4 mr-2" />
                  Start Impersonation
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowImpersonationForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  )
}