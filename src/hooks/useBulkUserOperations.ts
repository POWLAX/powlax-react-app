import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  email: string
  display_name?: string
  roles: string[]
  created_at: string
  last_sign_in_at?: string
  teams?: Array<{
    id: number
    name: string
    role_in_team?: string
  }>
  clubs?: Array<{
    id: number
    name: string
  }>
  membership_products?: Array<{
    id: string
    name: string
    capabilities: string[]
  }>
}

export interface BulkOperationProgress {
  operationId: string
  total: number
  completed: number
  failed: number
  currentOperation: string
  errors: Array<{
    userId: string
    userEmail: string
    error: string
  }>
}

export interface BulkFilterCriteria {
  roles?: string[]
  teams?: number[]
  clubs?: number[]
  memberships?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  activityStatus?: 'active' | 'inactive' | 'never_logged_in'
}

export interface BulkRoleOperation {
  add?: string[]
  remove?: string[]
  set?: string[]
}

export interface BulkResult {
  success: boolean
  operationId: string
  totalProcessed: number
  successCount: number
  failureCount: number
  errors: Array<{
    userId: string
    userEmail: string
    error: string
  }>
}

export function useBulkUserOperations() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [operationProgress, setOperationProgress] = useState<BulkOperationProgress | null>(null)

  const loadUsers = useCallback(async (): Promise<User[]> => {
    try {
      setLoading(true)
      
      // Get users with all related data
      const { data: usersData, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          display_name,
          roles,
          created_at,
          last_sign_in_at,
          team_members!inner(
            teams!inner(
              id,
              name
            ),
            role_in_team
          ),
          membership_entitlements(
            membership_products!inner(
              id,
              name,
              capabilities
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading users:', error)
        throw error
      }

      // Transform the data
      const transformedUsers: User[] = usersData?.map(user => ({
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        roles: user.roles || [],
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        teams: user.team_members?.map((tm: any) => ({
          id: tm.teams.id,
          name: tm.teams.name,
          role_in_team: tm.role_in_team
        })) || [],
        clubs: [], // TODO: Add club relationships when implemented
        membership_products: user.membership_entitlements?.map((me: any) => me.membership_products) || []
      })) || []

      setUsers(transformedUsers)
      setFilteredUsers(transformedUsers)
      return transformedUsers
    } catch (error) {
      console.error('Failed to load users:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const filterUsers = useCallback((criteria: BulkFilterCriteria): User[] => {
    let filtered = [...users]

    // Filter by roles
    if (criteria.roles && criteria.roles.length > 0) {
      filtered = filtered.filter(user => 
        criteria.roles!.some(role => user.roles.includes(role))
      )
    }

    // Filter by teams
    if (criteria.teams && criteria.teams.length > 0) {
      filtered = filtered.filter(user => 
        user.teams?.some(team => criteria.teams!.includes(team.id))
      )
    }

    // Filter by clubs
    if (criteria.clubs && criteria.clubs.length > 0) {
      filtered = filtered.filter(user => 
        user.clubs?.some(club => criteria.clubs!.includes(club.id))
      )
    }

    // Filter by membership products
    if (criteria.memberships && criteria.memberships.length > 0) {
      filtered = filtered.filter(user => 
        user.membership_products?.some(product => 
          criteria.memberships!.includes(product.id)
        )
      )
    }

    // Filter by date range
    if (criteria.dateRange) {
      filtered = filtered.filter(user => {
        const createdAt = new Date(user.created_at)
        return createdAt >= criteria.dateRange!.start && 
               createdAt <= criteria.dateRange!.end
      })
    }

    // Filter by activity status
    if (criteria.activityStatus) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      filtered = filtered.filter(user => {
        const lastLogin = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
        
        switch (criteria.activityStatus) {
          case 'active':
            return lastLogin && lastLogin >= thirtyDaysAgo
          case 'inactive':
            return lastLogin && lastLogin < thirtyDaysAgo
          case 'never_logged_in':
            return !lastLogin
          default:
            return true
        }
      })
    }

    setFilteredUsers(filtered)
    return filtered
  }, [users])

  const bulkUpdateRoles = useCallback(async (
    userIds: string[],
    operations: BulkRoleOperation
  ): Promise<BulkResult> => {
    const operationId = crypto.randomUUID()
    const errors: BulkResult['errors'] = []
    let successCount = 0

    try {
      // Initialize progress tracking
      setOperationProgress({
        operationId,
        total: userIds.length,
        completed: 0,
        failed: 0,
        currentOperation: 'Updating user roles...',
        errors: []
      })

      // Process users in batches of 5 to avoid overwhelming the database
      const batchSize = 5
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize)
        
        await Promise.all(batch.map(async (userId) => {
          try {
            const user = users.find(u => u.id === userId)
            if (!user) {
              throw new Error('User not found')
            }

            // Calculate new roles
            let newRoles = [...user.roles]

            if (operations.set) {
              newRoles = [...operations.set]
            } else {
              if (operations.remove) {
                newRoles = newRoles.filter(role => !operations.remove!.includes(role))
              }
              if (operations.add) {
                operations.add.forEach(role => {
                  if (!newRoles.includes(role)) {
                    newRoles.push(role)
                  }
                })
              }
            }

            // Update in database
            const { error } = await supabase
              .from('users')
              .update({ roles: newRoles })
              .eq('id', userId)

            if (error) {
              throw error
            }

            successCount++
            
            // Update progress
            setOperationProgress(prev => prev ? {
              ...prev,
              completed: prev.completed + 1,
              currentOperation: `Updated roles for ${user.email}`
            } : null)

          } catch (error) {
            const user = users.find(u => u.id === userId)
            errors.push({
              userId,
              userEmail: user?.email || 'Unknown',
              error: (error as Error).message
            })

            setOperationProgress(prev => prev ? {
              ...prev,
              failed: prev.failed + 1,
              errors: [...prev.errors, {
                userId,
                userEmail: user?.email || 'Unknown',
                error: (error as Error).message
              }]
            } : null)
          }
        }))
      }

      // Refresh users data
      await loadUsers()

      const result: BulkResult = {
        success: errors.length === 0,
        operationId,
        totalProcessed: userIds.length,
        successCount,
        failureCount: errors.length,
        errors
      }

      // Clear progress after a delay
      setTimeout(() => {
        setOperationProgress(null)
      }, 3000)

      return result

    } catch (error) {
      console.error('Bulk role update failed:', error)
      setOperationProgress(null)
      throw error
    }
  }, [users, loadUsers])

  const bulkAssignMemberships = useCallback(async (
    userIds: string[],
    productIds: string[]
  ): Promise<BulkResult> => {
    const operationId = crypto.randomUUID()
    const errors: BulkResult['errors'] = []
    let successCount = 0

    try {
      // Initialize progress tracking
      setOperationProgress({
        operationId,
        total: userIds.length,
        completed: 0,
        failed: 0,
        currentOperation: 'Assigning membership products...',
        errors: []
      })

      // Process users in batches
      const batchSize = 5
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize)
        
        await Promise.all(batch.map(async (userId) => {
          try {
            const user = users.find(u => u.id === userId)
            if (!user) {
              throw new Error('User not found')
            }

            // Create membership entitlements for each product
            const entitlements = productIds.map(productId => ({
              user_id: userId,
              membership_product_id: productId,
              granted_at: new Date().toISOString(),
              is_active: true
            }))

            // Insert new entitlements (upsert to avoid duplicates)
            for (const entitlement of entitlements) {
              const { error } = await supabase
                .from('membership_entitlements')
                .upsert(entitlement, {
                  onConflict: 'user_id,membership_product_id'
                })

              if (error) {
                throw error
              }
            }

            successCount++
            
            // Update progress
            setOperationProgress(prev => prev ? {
              ...prev,
              completed: prev.completed + 1,
              currentOperation: `Assigned memberships to ${user.email}`
            } : null)

          } catch (error) {
            const user = users.find(u => u.id === userId)
            errors.push({
              userId,
              userEmail: user?.email || 'Unknown',
              error: (error as Error).message
            })

            setOperationProgress(prev => prev ? {
              ...prev,
              failed: prev.failed + 1,
              errors: [...prev.errors, {
                userId,
                userEmail: user?.email || 'Unknown',
                error: (error as Error).message
              }]
            } : null)
          }
        }))
      }

      // Refresh users data
      await loadUsers()

      const result: BulkResult = {
        success: errors.length === 0,
        operationId,
        totalProcessed: userIds.length,
        successCount,
        failureCount: errors.length,
        errors
      }

      // Clear progress after a delay
      setTimeout(() => {
        setOperationProgress(null)
      }, 3000)

      return result

    } catch (error) {
      console.error('Bulk membership assignment failed:', error)
      setOperationProgress(null)
      throw error
    }
  }, [users, loadUsers])

  const bulkSendMagicLinks = useCallback(async (
    userIds: string[],
    options: {
      expiresIn?: number
      redirectTo?: string
      capabilities?: string[]
    } = {}
  ): Promise<BulkResult> => {
    const operationId = crypto.randomUUID()
    const errors: BulkResult['errors'] = []
    let successCount = 0

    try {
      // Initialize progress tracking
      setOperationProgress({
        operationId,
        total: userIds.length,
        completed: 0,
        failed: 0,
        currentOperation: 'Sending magic links...',
        errors: []
      })

      // Process users in batches to avoid overwhelming email service
      const batchSize = 3
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize)
        
        await Promise.all(batch.map(async (userId) => {
          try {
            const user = users.find(u => u.id === userId)
            if (!user) {
              throw new Error('User not found')
            }

            // Generate magic link
            const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
            const expiresIn = options.expiresIn || (24 * 60 * 60) // 24 hours
            const expiresAt = new Date(Date.now() + (expiresIn * 1000)).toISOString()

            // Insert magic link
            const { data: linkData, error: linkError } = await supabase
              .from('magic_links')
              .insert({
                user_id: userId,
                token,
                expires_at: expiresAt,
                redirect_url: options.redirectTo || '/dashboard',
                capabilities: options.capabilities || []
              })
              .select()
              .single()

            if (linkError) {
              throw linkError
            }

            // Send email (placeholder - replace with actual email service)
            const magicLinkUrl = `${window.location.origin}/auth/magic-link?token=${token}`
            
            // For now, we'll just log the magic link URL
            // In production, this would send an actual email
            console.log(`Magic link for ${user.email}: ${magicLinkUrl}`)

            successCount++
            
            // Update progress
            setOperationProgress(prev => prev ? {
              ...prev,
              completed: prev.completed + 1,
              currentOperation: `Sent magic link to ${user.email}`
            } : null)

          } catch (error) {
            const user = users.find(u => u.id === userId)
            errors.push({
              userId,
              userEmail: user?.email || 'Unknown',
              error: (error as Error).message
            })

            setOperationProgress(prev => prev ? {
              ...prev,
              failed: prev.failed + 1,
              errors: [...prev.errors, {
                userId,
                userEmail: user?.email || 'Unknown',
                error: (error as Error).message
              }]
            } : null)
          }
        }))

        // Small delay between batches to avoid overwhelming services
        if (i + batchSize < userIds.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      const result: BulkResult = {
        success: errors.length === 0,
        operationId,
        totalProcessed: userIds.length,
        successCount,
        failureCount: errors.length,
        errors
      }

      // Clear progress after a delay
      setTimeout(() => {
        setOperationProgress(null)
      }, 3000)

      return result

    } catch (error) {
      console.error('Bulk magic link send failed:', error)
      setOperationProgress(null)
      throw error
    }
  }, [users])

  const resetPasswords = useCallback(async (userIds: string[]): Promise<BulkResult> => {
    const operationId = crypto.randomUUID()
    const errors: BulkResult['errors'] = []
    let successCount = 0

    try {
      // Initialize progress tracking
      setOperationProgress({
        operationId,
        total: userIds.length,
        completed: 0,
        failed: 0,
        currentOperation: 'Resetting passwords...',
        errors: []
      })

      // Process users in batches
      const batchSize = 5
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize)
        
        await Promise.all(batch.map(async (userId) => {
          try {
            const user = users.find(u => u.id === userId)
            if (!user) {
              throw new Error('User not found')
            }

            // Use Supabase Auth Admin API to reset password
            const { error } = await supabase.auth.admin.generateLink({
              type: 'recovery',
              email: user.email
            })

            if (error) {
              throw error
            }

            successCount++
            
            // Update progress
            setOperationProgress(prev => prev ? {
              ...prev,
              completed: prev.completed + 1,
              currentOperation: `Reset password for ${user.email}`
            } : null)

          } catch (error) {
            const user = users.find(u => u.id === userId)
            errors.push({
              userId,
              userEmail: user?.email || 'Unknown',
              error: (error as Error).message
            })

            setOperationProgress(prev => prev ? {
              ...prev,
              failed: prev.failed + 1,
              errors: [...prev.errors, {
                userId,
                userEmail: user?.email || 'Unknown',
                error: (error as Error).message
              }]
            } : null)
          }
        }))
      }

      const result: BulkResult = {
        success: errors.length === 0,
        operationId,
        totalProcessed: userIds.length,
        successCount,
        failureCount: errors.length,
        errors
      }

      // Clear progress after a delay
      setTimeout(() => {
        setOperationProgress(null)
      }, 3000)

      return result

    } catch (error) {
      console.error('Bulk password reset failed:', error)
      setOperationProgress(null)
      throw error
    }
  }, [users])

  const cancelOperation = useCallback(() => {
    setOperationProgress(null)
  }, [])

  return {
    users,
    filteredUsers,
    loading,
    operationProgress,
    loadUsers,
    filterUsers,
    bulkUpdateRoles,
    bulkAssignMemberships,
    bulkSendMagicLinks,
    resetPasswords,
    cancelOperation
  }
}