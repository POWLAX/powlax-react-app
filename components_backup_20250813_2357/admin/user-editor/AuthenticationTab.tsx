'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Shield, 
  Key, 
  Monitor, 
  Clock, 
  Link2, 
  Trash2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import MagicLinkPanel from '@/components/admin/MagicLinkPanel'
import SessionManagementPanel from '@/components/admin/SessionManagementPanel'

interface AuthenticationData {
  auth_status: string
  sessions: any[]
  magic_links: any[]
  last_login?: string
}

interface AuthenticationTabProps {
  userData: AuthenticationData
  userId?: string
  onFieldChange: (tab: string, field: string, oldValue: any, newValue: any) => void
}

export default function AuthenticationTab({ userData, userId, onFieldChange }: AuthenticationTabProps) {
  const [showGenerateMagicLink, setShowGenerateMagicLink] = useState(false)
  const [magicLinkExpiry, setMagicLinkExpiry] = useState('24') // hours

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleStatusChange = (newStatus: string) => {
    onFieldChange('authentication', 'auth_status', userData.auth_status, newStatus)
  }

  const handleTerminateSession = async (sessionId: string) => {
    // Implementation would terminate the specific session
    toast.success('Session terminated successfully')
    onFieldChange('authentication', 'sessions', userData.sessions, 
      userData.sessions.filter(s => s.id !== sessionId)
    )
  }

  const handleTerminateAllSessions = async () => {
    // Implementation would terminate all user sessions
    toast.success('All sessions terminated successfully')
    onFieldChange('authentication', 'sessions', userData.sessions, [])
  }

  const handleRevokeMagicLink = async (linkId: string) => {
    // Implementation would revoke the specific magic link
    toast.success('Magic link revoked successfully')
    onFieldChange('authentication', 'magic_links', userData.magic_links,
      userData.magic_links.filter(l => l.id !== linkId)
    )
  }

  const handleGenerateMagicLink = async () => {
    // Implementation would generate a new magic link
    const newLink = {
      id: `link_${Date.now()}`,
      token: `ml_${Math.random().toString(36).substring(2)}`,
      expires_at: new Date(Date.now() + parseInt(magicLinkExpiry) * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      used: false
    }
    
    toast.success('Magic link generated successfully')
    onFieldChange('authentication', 'magic_links', userData.magic_links, 
      [...userData.magic_links, newLink]
    )
    setShowGenerateMagicLink(false)
  }

  const formatSessionDevice = (session: any) => {
    // Extract device info from user agent or session data
    return session.device || session.user_agent || 'Unknown Device'
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  return (
    <div className="space-y-6">
      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Status
          </CardTitle>
          <CardDescription>
            User account status and authentication state
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="flex items-center gap-2">
                {getStatusBadge(userData.auth_status)}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Last Login</Label>
              <Input 
                value={userData.last_login ? new Date(userData.last_login).toLocaleString() : 'Never'} 
                readOnly 
                className="bg-gray-50" 
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex gap-2">
              <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStatusChange('active')}
              disabled={userData.auth_status === 'active'}
            >
              Activate Account
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStatusChange('suspended')}
              disabled={userData.auth_status === 'suspended'}
            >
              Suspend Account
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStatusChange('pending')}
              disabled={userData.auth_status === 'pending'}
            >
              Set Pending
            </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <SessionManagementPanel userId={userId} compact={true} />

      {/* Magic Link Management */}
      <MagicLinkPanel userId={userId} compact={false} />
    </div>
  )
}