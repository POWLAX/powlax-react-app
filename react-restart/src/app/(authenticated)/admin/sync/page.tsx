'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react'
import { format } from 'date-fns'

interface SyncResult {
  success: boolean
  created: number
  updated: number
  errors: string[]
  syncLogId?: string
}

interface SyncStatus {
  currentCounts: {
    organizations: number
    teams: number
    teamMemberships: number
  }
  syncHistory: Array<{
    id: string
    sync_type: string
    status: string
    records_processed: number
    records_created: number
    records_updated: number
    error_message: string | null
    started_at: string
    completed_at: string | null
    metadata?: any
  }>
}

export default function AdminSyncPage() {
  const [loading, setLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [syncResults, setSyncResults] = useState<{
    organizations?: SyncResult
    teams?: SyncResult
    users?: SyncResult
    full?: any
  }>({})
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    fetchSyncStatus()
  }, [])

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync/status')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Failed with status ${response.status}`)
      }
      
      const data = await response.json()
      setSyncStatus(data)
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to fetch sync status'])
    }
  }

  const runSync = async (type: 'organizations' | 'teams' | 'users' | 'full') => {
    setLoading(true)
    setErrors([])
    
    try {
      const response = await fetch(`/api/sync/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // For now, we're not passing CSV path - will add file upload later
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Sync failed with status ${response.status}`)
      }

      const result = await response.json()
      setSyncResults(prev => ({ ...prev, [type]: result }))
      
      // Refresh status after sync
      await fetchSyncStatus()
      
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Sync failed'])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'started':
        return <Badge className="bg-yellow-500">In Progress</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">WordPress Data Sync</h1>
        <p className="text-muted-foreground">
          Sync teams, organizations, and user memberships from WordPress
        </p>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {errors.map((error, i) => (
              <div key={i}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncStatus?.currentCounts.organizations || 0}</div>
            <p className="text-xs text-muted-foreground">Total organizations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncStatus?.currentCounts.teams || 0}</div>
            <p className="text-xs text-muted-foreground">Total teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Team Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncStatus?.currentCounts.teamMemberships || 0}</div>
            <p className="text-xs text-muted-foreground">User-team relationships</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {syncStatus?.syncHistory[0] ? (
                format(new Date(syncStatus.syncHistory[0].started_at), 'MMM d, h:mm a')
              ) : (
                'Never'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {syncStatus?.syncHistory[0]?.sync_type || 'No syncs yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manual">Manual Sync</TabsTrigger>
          <TabsTrigger value="history">Sync History</TabsTrigger>
          <TabsTrigger value="upload">CSV Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Sync Operations</CardTitle>
              <CardDescription>
                Trigger individual or full sync operations from WordPress data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  onClick={() => runSync('organizations')}
                  disabled={loading}
                  className="w-full"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Sync Organizations
                </Button>
                <Button
                  onClick={() => runSync('teams')}
                  disabled={loading}
                  className="w-full"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Sync Teams
                </Button>
                <Button
                  onClick={() => runSync('users')}
                  disabled={loading}
                  className="w-full"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Sync Users
                </Button>
                <Button
                  onClick={() => runSync('full')}
                  disabled={loading}
                  variant="default"
                  className="w-full"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Full Sync
                </Button>
              </div>

              {Object.entries(syncResults).map(([type, result]) => result && (
                <Alert key={type} variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertTitle className="capitalize">{type} Sync Results</AlertTitle>
                  <AlertDescription>
                    {type === 'full' ? (
                      <div>
                        <p>Organizations: {result.results.organizations.created} created, {result.results.organizations.updated} updated</p>
                        <p>Teams: {result.results.teams.created} created, {result.results.teams.updated} updated</p>
                        <p>Users: {result.results.users.created} created, {result.results.users.updated} updated</p>
                      </div>
                    ) : (
                      <div>
                        <p>Created: {result.created}, Updated: {result.updated}</p>
                        {result.errors.length > 0 && (
                          <p className="text-red-500 mt-1">
                            Errors: {result.errors.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>
                Recent sync operations and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncStatus?.syncHistory.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="capitalize">{log.sync_type}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        {format(new Date(log.started_at), 'MMM d, h:mm a')}
                      </TableCell>
                      <TableCell>
                        {log.completed_at ? (
                          `${Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000)}s`
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{log.records_created || 0}</TableCell>
                      <TableCell>{log.records_updated || 0}</TableCell>
                      <TableCell>
                        {log.error_message ? (
                          <span className="text-red-500">Yes</span>
                        ) : (
                          <span className="text-green-500">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV Upload</CardTitle>
              <CardDescription>
                Upload WordPress export CSV files for team and user data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  CSV upload functionality coming soon
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Will support Teams-Export and learndash_group_users data
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}