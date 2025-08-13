'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Link, 
  Send, 
  Copy, 
  Trash2, 
  Clock, 
  User, 
  RefreshCw,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import { useMagicLinkManagement } from '@/hooks/useMagicLinkManagement'

interface MagicLinkPanelProps {
  userId?: string
  compact?: boolean
}

interface MagicLinkFormData {
  userId: string
  expiresIn: number
  redirectTo: string
  capabilities: string[]
  sendEmail: boolean
}

export default function MagicLinkPanel({ userId, compact = false }: MagicLinkPanelProps) {
  const {
    magicLinks,
    loading,
    generateMagicLink,
    revokeMagicLink,
    sendViaEmail,
    refreshMagicLinks
  } = useMagicLinkManagement()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<MagicLinkFormData>({
    userId: userId || '',
    expiresIn: 24, // 24 hours default
    redirectTo: 'auto', // Auto-route based on capabilities
    capabilities: [],
    sendEmail: true
  })
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [showFullTokens, setShowFullTokens] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    if (userId) {
      refreshMagicLinks(userId)
    }
  }, [userId, refreshMagicLinks])

  const handleGenerateLink = async () => {
    try {
      if (!formData.userId) {
        toast.error('Please select a user')
        return
      }

      const link = await generateMagicLink({
        userId: formData.userId,
        expiresIn: formData.expiresIn * 60 * 60, // Convert hours to seconds
        redirectTo: formData.redirectTo === 'auto' ? undefined : formData.redirectTo,
        capabilities: formData.capabilities
      })

      setGeneratedLink(link.magicLinkUrl)
      
      if (formData.sendEmail) {
        await sendViaEmail(link.id)
        toast.success('Magic link generated and sent via email')
      } else {
        toast.success('Magic link generated successfully')
      }

      // Reset form
      setShowCreateForm(false)
      setFormData({
        userId: userId || '',
        expiresIn: 24,
        redirectTo: 'auto',
        capabilities: [],
        sendEmail: true
      })

      // Refresh the links list
      if (userId) {
        refreshMagicLinks(userId)
      }
    } catch (error) {
      console.error('Failed to generate magic link:', error)
      toast.error('Failed to generate magic link: ' + (error as Error).message)
    }
  }

  const handleRevokeLink = async (linkId: string) => {
    try {
      await revokeMagicLink(linkId)
      toast.success('Magic link revoked successfully')
      
      if (userId) {
        refreshMagicLinks(userId)
      }
    } catch (error) {
      console.error('Failed to revoke magic link:', error)
      toast.error('Failed to revoke magic link: ' + (error as Error).message)
    }
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Magic link copied to clipboard')
  }

  const handleSendEmail = async (linkId: string) => {
    try {
      await sendViaEmail(linkId)
      toast.success('Magic link sent via email')
    } catch (error) {
      console.error('Failed to send email:', error)
      toast.error('Failed to send email: ' + (error as Error).message)
    }
  }

  const toggleTokenVisibility = (linkId: string) => {
    setShowFullTokens(prev => ({
      ...prev,
      [linkId]: !prev[linkId]
    }))
  }

  const formatExpiresAt = (expiresAt: string) => {
    const date = new Date(expiresAt)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 0) {
      return 'Expired'
    } else if (diffHours < 24) {
      return `${diffHours}h remaining`
    } else {
      const diffDays = Math.round(diffHours / 24)
      return `${diffDays}d remaining`
    }
  }

  const formatToken = (token: string, linkId: string) => {
    if (showFullTokens[linkId]) {
      return token
    }
    return token.substring(0, 8) + '...' + token.substring(token.length - 8)
  }

  const getStatusBadge = (expiresAt: string, usedAt?: string) => {
    if (usedAt) {
      return <Badge variant="secondary">Used</Badge>
    }
    
    const now = new Date()
    const expiry = new Date(expiresAt)
    
    if (expiry < now) {
      return <Badge variant="destructive">Expired</Badge>
    }
    
    return <Badge variant="default">Active</Badge>
  }

  const userFilteredLinks = userId 
    ? magicLinks.filter(link => link.user_id === userId)
    : magicLinks

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Magic Links</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Generate
          </Button>
        </div>
        
        {userFilteredLinks.length > 0 ? (
          <div className="space-y-2">
            {userFilteredLinks.slice(0, 3).map((link) => (
              <div key={link.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusBadge(link.expires_at, link.used_at)}
                  <span className="text-xs text-gray-600">
                    {formatExpiresAt(link.expires_at)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyLink(link.magic_link_url)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeLink(link.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {userFilteredLinks.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{userFilteredLinks.length - 3} more links
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No magic links</div>
        )}

        {/* Generate Link Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Generate Magic Link</CardTitle>
                <CardDescription>
                  Create a new magic link for user authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="expiresIn">Expires In (hours)</Label>
                  <Select 
                    value={formData.expiresIn.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, expiresIn: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="72">3 days</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="redirectTo">Redirect Destination</Label>
                  <Select 
                    value={formData.redirectTo} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, redirectTo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (based on capabilities)</SelectItem>
                      <SelectItem value="/dashboard">Dashboard</SelectItem>
                      <SelectItem value="/academy">Skills Academy</SelectItem>
                      <SelectItem value="/practice-planner">Practice Planner</SelectItem>
                      <SelectItem value="/teams">Teams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={formData.sendEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="sendEmail">Send via email</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleGenerateLink} className="flex-1">
                    <Link className="h-4 w-4 mr-2" />
                    Generate Link
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Generated Link Display */}
        {generatedLink && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Magic Link Generated</CardTitle>
                <CardDescription>
                  Copy this link to share with the user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg break-all text-sm">
                  {generatedLink}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleCopyLink(generatedLink)} className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setGeneratedLink(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Magic Link Management
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => refreshMagicLinks()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Generate Link
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Manage magic links for user authentication and capability-based routing
        </CardDescription>
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
                  <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userFilteredLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">{link.user_email || link.user_id}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {formatToken(link.token, link.id)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTokenVisibility(link.id)}
                        >
                          {showFullTokens[link.id] ? 
                            <EyeOff className="h-3 w-3" /> : 
                            <Eye className="h-3 w-3" />
                          }
                        </Button>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(link.expires_at, link.used_at)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">{formatExpiresAt(link.expires_at)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">
                        {new Date(link.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(link.magic_link_url)}
                          title="Copy link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendEmail(link.id)}
                          title="Send email"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeLink(link.id)}
                          title="Revoke link"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {userFilteredLinks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No magic links found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Generate Link Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Generate Magic Link</CardTitle>
              <CardDescription>
                Create a new magic link for user authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!userId && (
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={formData.userId}
                    onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="Enter user ID"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="expiresIn">Expires In (hours)</Label>
                <Select 
                  value={formData.expiresIn.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, expiresIn: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="72">3 days</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="redirectTo">Redirect Destination</Label>
                <Select 
                  value={formData.redirectTo} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, redirectTo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (based on capabilities)</SelectItem>
                    <SelectItem value="/dashboard">Dashboard</SelectItem>
                    <SelectItem value="/academy">Skills Academy</SelectItem>
                    <SelectItem value="/practice-planner">Practice Planner</SelectItem>
                    <SelectItem value="/teams">Teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={formData.sendEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="sendEmail">Send via email</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleGenerateLink} className="flex-1">
                  <Link className="h-4 w-4 mr-2" />
                  Generate Link
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generated Link Display */}
      {generatedLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Magic Link Generated</CardTitle>
              <CardDescription>
                Copy this link to share with the user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg break-all text-sm">
                {generatedLink}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleCopyLink(generatedLink)} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setGeneratedLink(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  )
}