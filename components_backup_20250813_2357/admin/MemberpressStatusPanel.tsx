/**
 * MemberpressStatusPanel Component
 * Shows Memberpress sync status and provides manual sync controls
 * Contract: membership-capability-002.yaml
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Alert,
  AlertDescription,
  AlertTitle 
} from '@/components/ui/alert'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Loader2,
  Settings,
  Activity,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react'
import { toast } from 'sonner'

// Types
interface SyncStatus {
  isConnected: boolean
  lastSyncTime?: Date
  nextSyncTime?: Date
  syncInProgress: boolean
  totalUsers: number
  syncedUsers: number
  failedUsers: number
  conflicts: SyncConflict[]
}

interface SyncConflict {
  id: string
  userId: string
  userEmail: string
  conflictType: 'membership_mismatch' | 'user_not_found' | 'expired_membership' | 'duplicate_user'
  description: string
  wordpressData?: any
  supabaseData?: any
  suggestedAction: string
}

interface SyncResult {
  success: boolean
  syncedCount: number
  failedCount: number
  conflicts: SyncConflict[]
  duration: number
  errors: string[]
}

export default function MemberpressStatusPanel() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    syncInProgress: false,
    totalUsers: 0,
    syncedUsers: 0,
    failedUsers: 0,
    conflicts: []
  })
  const [loading, setLoading] = useState(true)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false)

  useEffect(() => {
    fetchSyncStatus()
    
    // Set up polling for sync status updates
    const interval = setInterval(fetchSyncStatus, 30000) // Poll every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const fetchSyncStatus = async () => {
    try {
      setLoading(true)
      
      // Simulate API call to get sync status
      // In real implementation, this would call the WordPress/Memberpress API
      const mockStatus: SyncStatus = {
        isConnected: Math.random() > 0.1, // 90% chance of being connected
        lastSyncTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
        nextSyncTime: new Date(Date.now() + 60 * 60 * 1000), // Next hour
        syncInProgress: false,
        totalUsers: 150,
        syncedUsers: 145,
        failedUsers: 2,
        conflicts: [
          {
            id: '1',
            userId: 'user-123',
            userEmail: 'john@example.com',
            conflictType: 'membership_mismatch',
            description: 'User has Skills Academy Monthly in WordPress but Basic in Supabase',
            wordpressData: { membership: 'skills_academy_monthly', status: 'active' },
            supabaseData: { membership: 'skills_academy_basic', status: 'active' },
            suggestedAction: 'Update Supabase to match WordPress'
          },
          {
            id: '2',
            userId: 'user-456',
            userEmail: 'jane@example.com',
            conflictType: 'expired_membership',
            description: 'Membership expired in WordPress but still active in Supabase',
            wordpressData: { membership: 'coach_essentials_kit', status: 'expired' },
            supabaseData: { membership: 'coach_essentials_kit', status: 'active' },
            suggestedAction: 'Mark as expired in Supabase'
          }
        ]
      }
      
      setSyncStatus(mockStatus)
    } catch (error) {
      console.error('Error fetching sync status:', error)
      toast.error('Failed to fetch sync status')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSync = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, syncInProgress: true }))
      
      // Simulate sync process
      toast.info('Starting Memberpress sync...')
      
      // In real implementation, this would call the sync API endpoint
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockResult: SyncResult = {
        success: true,
        syncedCount: 48,
        failedCount: 2,
        conflicts: syncStatus.conflicts,
        duration: 3.2,
        errors: ['User not found in WordPress: test@example.com']
      }
      
      setSyncResult(mockResult)
      toast.success(`Sync completed! ${mockResult.syncedCount} users synced`)
      
      // Refresh status
      await fetchSyncStatus()
      
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Sync failed')
    } finally {
      setSyncStatus(prev => ({ ...prev, syncInProgress: false }))
    }
  }

  const handleResolveConflict = async (conflictId: string, action: 'accept_wordpress' | 'accept_supabase' | 'manual') => {
    try {
      // In real implementation, this would call API to resolve the conflict
      toast.success('Conflict resolved')
      
      // Remove conflict from list
      setSyncStatus(prev => ({
        ...prev,
        conflicts: prev.conflicts.filter(c => c.id !== conflictId)
      }))
    } catch (error) {
      console.error('Error resolving conflict:', error)
      toast.error('Failed to resolve conflict')
    }
  }

  const getSyncStatusBadge = () => {
    if (loading) {
      return <Badge variant="outline"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Loading</Badge>
    }
    
    if (!syncStatus.isConnected) {
      return <Badge variant="destructive"><WifiOff className="h-3 w-3 mr-1" />Disconnected</Badge>
    }
    
    if (syncStatus.syncInProgress) {
      return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Syncing</Badge>
    }
    
    if (syncStatus.conflicts.length > 0) {
      return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Conflicts</Badge>
    }
    
    return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>
  }

  const getSyncProgress = () => {
    if (syncStatus.totalUsers === 0) return 0
    return (syncStatus.syncedUsers / syncStatus.totalUsers) * 100
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Memberpress Integration Status
            </div>
            {getSyncStatusBadge()}
          </CardTitle>
          <CardDescription>
            Real-time synchronization with WordPress Memberpress
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Connection Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {syncStatus.isConnected ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium">
                  {syncStatus.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {syncStatus.lastSyncTime && (
                <div className="text-sm text-gray-600">
                  Last sync: {syncStatus.lastSyncTime.toLocaleString()}
                </div>
              )}
              
              {syncStatus.nextSyncTime && (
                <div className="text-sm text-gray-600">
                  Next sync: {syncStatus.nextSyncTime.toLocaleString()}
                </div>
              )}
            </div>

            {/* Sync Stats */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Sync Statistics</span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>Total Users: {syncStatus.totalUsers}</div>
                <div>Synced: {syncStatus.syncedUsers}</div>
                <div>Failed: {syncStatus.failedUsers}</div>
                <div>Conflicts: {syncStatus.conflicts.length}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={handleManualSync}
                disabled={syncStatus.syncInProgress || !syncStatus.isConnected}
                className="w-full"
              >
                {syncStatus.syncInProgress ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Manual Sync
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={fetchSyncStatus}
                disabled={loading}
                className="w-full"
              >
                <Activity className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          </div>

          {/* Sync Progress */}
          {syncStatus.syncInProgress && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Sync Progress</span>
                <span>{Math.round(getSyncProgress())}%</span>
              </div>
              <Progress value={getSyncProgress()} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conflicts Alert */}
      {syncStatus.conflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Sync Conflicts Detected</AlertTitle>
          <AlertDescription>
            {syncStatus.conflicts.length} conflict{syncStatus.conflicts.length > 1 ? 's' : ''} need{syncStatus.conflicts.length === 1 ? 's' : ''} resolution.
            <Dialog open={conflictDialogOpen} onOpenChange={setConflictDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto ml-2">
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Sync Conflicts</DialogTitle>
                  <DialogDescription>
                    Resolve data mismatches between WordPress and Supabase
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {syncStatus.conflicts.map((conflict) => (
                    <Card key={conflict.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>{conflict.userEmail}</span>
                          <Badge variant="outline">
                            {conflict.conflictType.replace('_', ' ')}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{conflict.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="font-medium mb-2">WordPress Data</h5>
                            <pre className="text-xs bg-gray-100 p-2 rounded">
                              {JSON.stringify(conflict.wordpressData, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Supabase Data</h5>
                            <pre className="text-xs bg-gray-100 p-2 rounded">
                              {JSON.stringify(conflict.supabaseData, null, 2)}
                            </pre>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleResolveConflict(conflict.id, 'accept_wordpress')}
                          >
                            Use WordPress Data
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveConflict(conflict.id, 'accept_supabase')}
                          >
                            Keep Supabase Data
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleResolveConflict(conflict.id, 'manual')}
                          >
                            Manual Resolution
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Sync Result */}
      {syncResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Last Sync Result
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-green-600">{syncResult.syncedCount}</div>
                <div className="text-sm text-gray-600">Synced</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{syncResult.failedCount}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{syncResult.conflicts.length}</div>
                <div className="text-sm text-gray-600">Conflicts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{syncResult.duration}s</div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
            </div>
            
            {syncResult.errors.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium mb-2">Errors:</h5>
                <ul className="text-sm text-red-600 space-y-1">
                  {syncResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sync Configuration
          </CardTitle>
          <CardDescription>
            Configure automatic synchronization settings
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              • Automatic sync every hour
            </div>
            <div className="text-sm text-gray-600">
              • Webhook notifications enabled
            </div>
            <div className="text-sm text-gray-600">
              • Conflict resolution: Manual approval required
            </div>
            
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}