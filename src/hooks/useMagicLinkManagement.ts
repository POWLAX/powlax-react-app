import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getOptimalRoute } from '@/lib/magic-links/capability-router'

export interface MagicLink {
  id: string
  user_id: string
  user_email?: string
  token: string
  magic_link_url: string
  expires_at: string
  used_at?: string
  redirect_url?: string
  capabilities?: string[]
  created_at: string
}

export interface GenerateMagicLinkOptions {
  userId: string
  expiresIn?: number // seconds
  redirectTo?: string
  capabilities?: string[]
  forceRoute?: boolean
}

export interface GenerateMagicLinkResult {
  id: string
  token: string
  magicLinkUrl: string
  redirectUrl: string
}

export interface EmailResult {
  success: boolean
  message: string
}

export function useMagicLinkManagement() {
  const [magicLinks, setMagicLinks] = useState<MagicLink[]>([])
  const [loading, setLoading] = useState(false)

  const refreshMagicLinks = useCallback(async (userId?: string) => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('magic_links')
        .select(`
          id,
          user_id,
          token,
          expires_at,
          used_at,
          redirect_url,
          capabilities,
          created_at,
          users!inner(email)
        `)
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching magic links:', error)
        throw error
      }

      // Transform the data to include user email
      const transformedData = data?.map(link => ({
        ...link,
        user_email: (link.users as any)?.email,
        magic_link_url: `${window.location.origin}/auth/magic-link?token=${link.token}`
      })) || []

      setMagicLinks(transformedData)
    } catch (error) {
      console.error('Failed to refresh magic links:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const generateMagicLink = useCallback(async (options: GenerateMagicLinkOptions): Promise<GenerateMagicLinkResult> => {
    try {
      // Get user capabilities for routing if not specified
      let capabilities = options.capabilities
      if (!capabilities) {
        const { data: userCapabilities } = await supabase
          .from('membership_entitlements')
          .select('capabilities')
          .eq('user_id', options.userId)
          .single()
        
        capabilities = userCapabilities?.capabilities || []
      }

      // Determine redirect URL
      let redirectUrl = options.redirectTo
      if (!redirectUrl || redirectUrl === 'auto') {
        redirectUrl = getOptimalRoute(capabilities)
      }

      // Generate a secure token
      const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
      
      // Calculate expiry time (default 24 hours)
      const expiresIn = options.expiresIn || (24 * 60 * 60) // 24 hours in seconds
      const expiresAt = new Date(Date.now() + (expiresIn * 1000)).toISOString()

      // Insert the magic link
      const { data, error } = await supabase
        .from('magic_links')
        .insert({
          user_id: options.userId,
          token,
          expires_at: expiresAt,
          redirect_url: redirectUrl,
          capabilities
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating magic link:', error)
        throw new Error(`Failed to create magic link: ${error.message}`)
      }

      const magicLinkUrl = `${window.location.origin}/auth/magic-link?token=${token}`

      return {
        id: data.id,
        token,
        magicLinkUrl,
        redirectUrl
      }
    } catch (error) {
      console.error('Failed to generate magic link:', error)
      throw error
    }
  }, [])

  const revokeMagicLink = useCallback(async (linkId: string): Promise<void> => {
    try {
      // Set expiry to now to effectively revoke the link
      const { error } = await supabase
        .from('magic_links')
        .update({ expires_at: new Date().toISOString() })
        .eq('id', linkId)

      if (error) {
        console.error('Error revoking magic link:', error)
        throw new Error(`Failed to revoke magic link: ${error.message}`)
      }
    } catch (error) {
      console.error('Failed to revoke magic link:', error)
      throw error
    }
  }, [])

  const sendViaEmail = useCallback(async (linkId: string): Promise<EmailResult> => {
    try {
      // Get the magic link details
      const { data: link, error: linkError } = await supabase
        .from('magic_links')
        .select(`
          *,
          users!inner(email, display_name)
        `)
        .eq('id', linkId)
        .single()

      if (linkError || !link) {
        throw new Error('Magic link not found')
      }

      const user = (link.users as any)
      const magicLinkUrl = `${window.location.origin}/auth/magic-link?token=${link.token}`

      // Prepare email data
      const emailData = {
        to: user.email,
        subject: 'Your POWLAX Login Link',
        template: 'magic-link',
        data: {
          userName: user.display_name || user.email,
          magicLinkUrl,
          expiresAt: new Date(link.expires_at).toLocaleString(),
          capabilities: link.capabilities || []
        }
      }

      // Send via WordPress API
      const response = await fetch('/api/email/send-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to send email: ${errorData}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        message: 'Email sent successfully'
      }
    } catch (error) {
      console.error('Failed to send magic link email:', error)
      return {
        success: false,
        message: (error as Error).message
      }
    }
  }, [])

  const listActiveLinks = useCallback(async (userId: string): Promise<MagicLink[]> => {
    try {
      const { data, error } = await supabase
        .from('magic_links')
        .select(`
          id,
          user_id,
          token,
          expires_at,
          used_at,
          redirect_url,
          capabilities,
          created_at,
          users!inner(email)
        `)
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString()) // Only get non-expired links
        .is('used_at', null) // Only get unused links
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching active magic links:', error)
        throw error
      }

      // Transform the data to include user email and magic link URL
      return data?.map(link => ({
        ...link,
        user_email: (link.users as any)?.email,
        magic_link_url: `${window.location.origin}/auth/magic-link?token=${link.token}`
      })) || []
    } catch (error) {
      console.error('Failed to list active magic links:', error)
      throw error
    }
  }, [])

  const getMagicLinkStats = useCallback(async (userId?: string) => {
    try {
      let query = supabase
        .from('magic_links')
        .select('id, expires_at, used_at, created_at')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      const now = new Date()
      const stats = {
        total: data?.length || 0,
        active: 0,
        expired: 0,
        used: 0,
        unused: 0
      }

      data?.forEach(link => {
        if (link.used_at) {
          stats.used++
        } else {
          stats.unused++
          if (new Date(link.expires_at) > now) {
            stats.active++
          } else {
            stats.expired++
          }
        }
      })

      return stats
    } catch (error) {
      console.error('Failed to get magic link stats:', error)
      throw error
    }
  }, [])

  return {
    magicLinks,
    loading,
    refreshMagicLinks,
    generateMagicLink,
    revokeMagicLink,
    sendViaEmail,
    listActiveLinks,
    getMagicLinkStats
  }
}