/**
 * WordPress API Hook - Phase 1 Foundation
 * 
 * React hook for interacting with WordPress Memberpress API.
 * Full implementation will be completed in Phase 2.
 */

'use client'

import { useState, useCallback } from 'react'
import { 
  MembershipStatus, 
  SyncResult, 
  BulkSyncResult, 
  Subscription 
} from '@/lib/wordpress/memberpress-client'

interface UseWordPressAPIReturn {
  // State
  loading: boolean
  error: string | null
  
  // Actions
  checkMembershipStatus: (userId: string) => Promise<MembershipStatus | null>
  syncUser: (userId: string) => Promise<SyncResult | null>
  bulkSyncUsers: (userIds: string[]) => Promise<BulkSyncResult | null>
  getUserSubscriptions: (userId: string) => Promise<Subscription[] | null>
  validateMembership: (userId: string, productId: string) => Promise<boolean>
  testConnection: () => Promise<boolean>
  clearError: () => void
}

/**
 * Custom hook for WordPress API interactions
 */
export function useWordPressAPI(): UseWordPressAPIReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const makeAPICall = useCallback(async <T>(
    endpoint: string, 
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add proper authentication in Phase 2
          'Authorization': 'Bearer placeholder-token'
        },
        body: body ? JSON.stringify(body) : undefined
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed')
      }

      return data.data as T
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('WordPress API Error:', errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const checkMembershipStatus = useCallback(async (userId: string): Promise<MembershipStatus | null> => {
    return await makeAPICall<MembershipStatus>(
      `/api/wordpress/memberpress?action=status&userId=${userId}`
    )
  }, [makeAPICall])

  const syncUser = useCallback(async (userId: string): Promise<SyncResult | null> => {
    return await makeAPICall<SyncResult>(
      '/api/wordpress/memberpress',
      'POST',
      { action: 'sync', userId }
    )
  }, [makeAPICall])

  const bulkSyncUsers = useCallback(async (userIds: string[]): Promise<BulkSyncResult | null> => {
    return await makeAPICall<BulkSyncResult>(
      '/api/wordpress/memberpress',
      'POST',
      { action: 'bulkSync', userIds }
    )
  }, [makeAPICall])

  const getUserSubscriptions = useCallback(async (userId: string): Promise<Subscription[] | null> => {
    const result = await makeAPICall<{ subscriptions: Subscription[] }>(
      `/api/wordpress/memberpress?action=subscriptions&userId=${userId}`
    )
    return result?.subscriptions || null
  }, [makeAPICall])

  const validateMembership = useCallback(async (userId: string, productId: string): Promise<boolean> => {
    const result = await makeAPICall<{ isValid: boolean }>(
      '/api/wordpress/memberpress',
      'POST',
      { action: 'validate', userId, productId }
    )
    return result?.isValid || false
  }, [makeAPICall])

  const testConnection = useCallback(async (): Promise<boolean> => {
    // Phase 1: Return false (not implemented)
    // TODO: Implement connection test in Phase 2
    setLoading(true)
    setError(null)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setError('Phase 1 placeholder - connection test not implemented')
    }, 1000)
    
    return false
  }, [])

  return {
    loading,
    error,
    checkMembershipStatus,
    syncUser,
    bulkSyncUsers,
    getUserSubscriptions,
    validateMembership,
    testConnection,
    clearError
  }
}

/**
 * Helper hook for membership status checking
 */
export function useMembershipStatus(userId?: string) {
  const [status, setStatus] = useState<MembershipStatus | null>(null)
  const { checkMembershipStatus, loading, error } = useWordPressAPI()

  const refreshStatus = useCallback(async () => {
    if (!userId) return
    
    const result = await checkMembershipStatus(userId)
    if (result) {
      setStatus(result)
    }
  }, [userId, checkMembershipStatus])

  return {
    status,
    refreshStatus,
    loading,
    error
  }
}