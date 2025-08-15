'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Link, 
  Copy, 
  Trash2, 
  RefreshCw,
  Plus,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface MagicLink {
  id: string
  user_id: string
  email: string
  token: string
  expires_at: string
  used_at?: string
  created_at: string
  redirect_to?: string
}

export default function MagicLinkPanel() {
  const [magicLinks, setMagicLinks] = useState<MagicLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchMagicLinks()
  }, [])

  const fetchMagicLinks = async () => {
    try {
      setLoading(true)
      
      // First, let's add some mock data if the table is empty
      const { count } = await supabase
        .from('magic_links')
        .select('*', { count: 'exact', head: true })
      
      if (count === 0) {
        // Add mock magic links for demonstration
        const mockLinks = [
          {
            user_id: '523f2768-6404-439c-a429-f9eb6736aa17', // Patrick's ID from the query
            email: 'patrick@powlax.com',
            token: `mock-${Math.random().toString(36).substring(2, 15)}`,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            redirect_to: '/dashboard',
            created_at: new Date().toISOString()
          },
          {
            user_id: '9461112e-8c4b-4e1f-a39e-94ed9d4e877e',
            email: 'wordpress_3667@powlax.com (MOCK)',
            token: `mock-${Math.random().toString(36).substring(2, 15)}`,
            expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Expired
            redirect_to: '/academy',
            created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
          },
          {
            user_id: '4a02493b-3691-45d7-bf8f-8a2dd0310a3f',
            email: 'kailyn-russel@example.com (MOCK)',
            token: `mock-${Math.random().toString(36).substring(2, 15)}`,
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            redirect_to: '/practice-planner',
            used_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // Used
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ]
        
        for (const link of mockLinks) {
          await supabase.from('magic_links').insert(link)
        }
      }
      
      // Now fetch all magic links
      const { data, error } = await supabase
        .from('magic_links')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching magic links:', error)
        toast.error('Failed to load magic links')
        return
      }
      
      setMagicLinks(data || [])
    } catch (error) {
      console.error('Failed to fetch magic links:', error)
      toast.error('Failed to load magic links')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/auth/magic-link?token=${token}`
    navigator.clipboard.writeText(link)
    toast.success('Magic link copied to clipboard')
  }

  const handleRevoke = async (id: string) => {
    try {
      const { error } = await supabase
        .from('magic_links')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Magic link revoked')
      fetchMagicLinks()
    } catch (error) {
      console.error('Failed to revoke magic link:', error)
      toast.error('Failed to revoke magic link')
    }
  }

  const getStatus = (link: MagicLink) => {
    if (link.used_at) {
      return { label: 'Used', variant: 'secondary' as const, icon: CheckCircle }
    }
    if (new Date(link.expires_at) < new Date()) {
      return { label: 'Expired', variant: 'destructive' as const, icon: XCircle }
    }
    return { label: 'Active', variant: 'default' as const, icon: Clock }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Link className="h-5 w-5" />
                Magic Link Management
              </CardTitle>
              <CardDescription>
                Generate and manage magic links for user authentication
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={fetchMagicLinks} 
                variant="outline" 
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Generate Link
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : magicLinks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No magic links found</p>
              <p className="text-sm text-gray-400 mt-2">Generate a magic link to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Redirect To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {magicLinks.map((link) => {
                    const status = getStatus(link)
                    const StatusIcon = status.icon
                    
                    return (
                      <TableRow key={link.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{link.email}</div>
                            <div className="text-xs text-gray-500">
                              {link.token.substring(0, 20)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono">
                            {link.redirect_to || '/dashboard'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(link.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(link.expires_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyLink(link.token)}
                              disabled={status.label !== 'Active'}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevoke(link.id)}
                              disabled={status.label !== 'Active'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}