/**
 * Webhook Queue Processor
 * Handles reliable webhook processing with retry logic
 */

import { createClient } from '@supabase/supabase-js'

// Admin client for webhook processing
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { 
    auth: { 
      autoRefreshToken: false, 
      persistSession: false 
    } 
  })
}

export interface WebhookQueueItem {
  id: string
  webhook_id: string
  source: string
  event_type: string
  payload: any
  status: string
  attempts: number
  max_attempts: number
  last_error?: string
  next_retry_at?: string
  created_at: string
  started_at?: string
  completed_at?: string
}

export class WebhookProcessor {
  private supabase: ReturnType<typeof createClient>
  private isProcessing: boolean = false
  private processingInterval?: NodeJS.Timeout

  constructor() {
    this.supabase = getAdminClient()
  }

  /**
   * Start the webhook processor
   */
  start(intervalMs: number = 5000) {
    if (this.processingInterval) {
      console.log('Webhook processor already running')
      return
    }

    console.log(`Starting webhook processor with ${intervalMs}ms interval`)
    
    // Process immediately
    this.processQueue()
    
    // Then process on interval
    this.processingInterval = setInterval(() => {
      if (!this.isProcessing) {
        this.processQueue()
      }
    }, intervalMs)
  }

  /**
   * Stop the webhook processor
   */
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = undefined
      console.log('Webhook processor stopped')
    }
  }

  /**
   * Process pending webhooks in the queue
   */
  async processQueue() {
    if (this.isProcessing) return
    
    this.isProcessing = true
    
    try {
      // Get next batch of webhooks to process
      const { data: webhooks, error } = await this.supabase
        .rpc('get_next_webhook_to_process')
      
      if (error) {
        console.error('Error fetching webhooks:', error)
        return
      }

      if (!webhooks || webhooks.length === 0) {
        return // Nothing to process
      }

      // Process single webhook (function returns one at a time)
      const webhook = Array.isArray(webhooks) ? webhooks[0] : webhooks
      if (webhook && webhook.id) {
        await this.processWebhook(webhook)
      }
      
    } catch (error) {
      console.error('Queue processing error:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Process a single webhook
   */
  private async processWebhook(webhook: WebhookQueueItem) {
    const startTime = Date.now()
    
    try {
      console.log(`Processing webhook ${webhook.webhook_id} (attempt ${webhook.attempts})`)
      
      // Route to appropriate handler based on event type
      await this.routeWebhook(webhook)
      
      // Mark as completed
      const processingTime = Date.now() - startTime
      await this.supabase.rpc('complete_webhook', {
        p_queue_id: webhook.id,
        p_processing_time_ms: processingTime
      })
      
      console.log(`Webhook ${webhook.webhook_id} completed in ${processingTime}ms`)
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error'
      console.error(`Webhook ${webhook.webhook_id} failed:`, errorMessage)
      
      // Schedule retry or move to dead letter
      await this.supabase.rpc('retry_webhook', {
        p_queue_id: webhook.id,
        p_error_message: errorMessage
      })
    }
  }

  /**
   * Route webhook to appropriate handler
   */
  private async routeWebhook(webhook: WebhookQueueItem) {
    const { event_type, payload } = webhook
    
    switch (event_type) {
      case 'subscription.created':
      case 'subscription.activated':
      case 'subscription.upgraded':
        await this.handleSubscriptionCreated(payload)
        break
        
      case 'subscription.canceled':
      case 'subscription.expired':
        await this.handleSubscriptionCanceled(payload)
        break
        
      case 'transaction.completed':
        await this.handleTransactionCompleted(payload)
        break
        
      case 'transaction.refunded':
        await this.handleTransactionRefunded(payload)
        break
        
      default:
        console.log(`Unhandled webhook event type: ${event_type}`)
    }
  }

  /**
   * Handle subscription created/activated
   */
  private async handleSubscriptionCreated(payload: any) {
    const membershipId = Number(payload?.membership_id || 0)
    const wpUserId = Number(payload?.user_id || 0)
    const email = payload?.email
    const fullName = payload?.full_name
    
    if (!membershipId) {
      throw new Error('Missing membership_id in payload')
    }
    
    // Lookup product mapping
    const { data: product } = await this.supabase
      .from('membership_products')
      .select('*')
      .eq('wp_membership_id', membershipId)
      .maybeSingle()
    
    if (!product) {
      console.log(`No mapping found for membership ${membershipId}`)
      return
    }
    
    // Ensure user exists
    const userId = await this.ensureUser(email, wpUserId, fullName)
    
    // Create entitlement
    await this.supabase.from('membership_entitlements').insert({
      user_id: userId,
      entitlement_key: product.entitlement_key,
      status: 'active',
      source: 'memberpress',
      metadata: { membershipId }
    })
    
    // Create team/club if needed
    if (product.create_behavior === 'create_team') {
      await this.createTeamWithLinks(null, product, userId, email)
    } else if (product.create_behavior === 'create_club') {
      await this.createClubWithTeamsAndLinks(product, userId, email)
    }
  }

  /**
   * Handle subscription canceled/expired
   */
  private async handleSubscriptionCanceled(payload: any) {
    const membershipId = Number(payload?.membership_id || 0)
    const wpUserId = Number(payload?.user_id || 0)
    const email = payload?.email
    const event = payload?.event || payload?.type || ''
    
    // Get user
    const userId = await this.ensureUser(email, wpUserId)
    if (!userId) return
    
    // Lookup product
    const { data: product } = await this.supabase
      .from('membership_products')
      .select('*')
      .eq('wp_membership_id', membershipId)
      .maybeSingle()
    
    if (!product) return
    
    // Update entitlement status
    const newStatus = event.includes('canceled') ? 'canceled' : 'expired'
    await this.supabase
      .from('membership_entitlements')
      .update({ 
        status: newStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .eq('entitlement_key', product.entitlement_key)
    
    // Soft unlink team memberships
    if (product.scope === 'team') {
      await this.supabase
        .from('team_members')
        .update({ status: 'inactive' })
        .eq('user_id', userId)
    }
  }

  /**
   * Handle transaction completed
   */
  private async handleTransactionCompleted(payload: any) {
    // Log transaction for audit
    console.log('Transaction completed:', payload)
    // Additional transaction logging can be added here
  }

  /**
   * Handle transaction refunded
   */
  private async handleTransactionRefunded(payload: any) {
    // Log refund and consider entitlement changes
    console.log('Transaction refunded:', payload)
    // Additional refund handling can be added here
  }

  /**
   * Ensure user exists in database
   */
  private async ensureUser(email?: string, wordpressId?: number, fullName?: string): Promise<string | null> {
    if (!email && !wordpressId) return null
    
    // Check by WordPress ID first
    if (wordpressId) {
      const { data: byWp } = await this.supabase
        .from('users')
        .select('id')
        .eq('wordpress_id', wordpressId)
        .maybeSingle()
      
      if (byWp?.id) return byWp.id
    }
    
    // Check by email
    if (email) {
      const { data: byEmail } = await this.supabase
        .from('users')
        .select('id, wordpress_id')
        .eq('email', email)
        .maybeSingle()
      
      if (byEmail?.id) {
        // Update WordPress ID if missing
        if (wordpressId && !byEmail.wordpress_id) {
          await this.supabase
            .from('users')
            .update({ wordpress_id: wordpressId })
            .eq('id', byEmail.id)
        }
        return byEmail.id
      }
      
      // Create new user
      const { data: newUser } = await this.supabase
        .from('users')
        .insert({ 
          email, 
          wordpress_id: wordpressId || null, 
          full_name: fullName || null,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()
      
      return newUser?.id || null
    }
    
    return null
  }

  /**
   * Generate secure token
   */
  private generateSecureToken(): string {
    // In Node.js environment
    if (typeof window === 'undefined') {
      const { randomBytes } = require('crypto')
      return randomBytes(32).toString('base64url')
    }
    
    // In browser environment (fallback)
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  /**
   * Create team with registration links
   */
  private async createTeamWithLinks(
    clubId: string | null, 
    product: any, 
    buyerUserId: string | null,
    email?: string
  ) {
    // Create team
    const { data: team } = await this.supabase
      .from('team_teams')
      .insert({ 
        club_id: clubId, 
        name: `${product.entitlement_key} – ${email || 'team'}`
      })
      .select('id')
      .single()
    
    if (!team) return
    
    // Create registration links
    const links = [
      { default_role: 'player', max_uses: 25 },
      { default_role: 'parent', max_uses: 75 }
    ]
    
    for (const link of links) {
      await this.supabase.from('registration_links').insert({
        token: this.generateSecureToken(),
        target_type: 'team',
        target_id: team.id,
        default_role: link.default_role,
        max_uses: link.max_uses,
        created_by: buyerUserId
      })
    }
    
    return team.id
  }

  /**
   * Create club with teams and links
   */
  private async createClubWithTeamsAndLinks(
    product: any,
    buyerUserId: string | null,
    email?: string
  ) {
    // Create club
    const { data: club } = await this.supabase
      .from('club_organizations')
      .insert({ 
        name: `${product.entitlement_key} – ${email || 'club'}`
      })
      .select('id')
      .single()
    
    if (!club) return
    
    // Create 3 teams under club
    const teamNames = ['Team A', 'Team B', 'Team C']
    for (const name of teamNames) {
      await this.createTeamWithLinks(club.id, { ...product, entitlement_key: name }, buyerUserId)
    }
    
    return club.id
  }
}

// Export singleton instance
export const webhookProcessor = new WebhookProcessor()