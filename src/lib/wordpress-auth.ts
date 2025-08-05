/**
 * WordPress Authentication Bridge
 * Handles user authentication via WordPress/MemberPress integration
 */

import { supabase } from './supabase';

interface WordPressUser {
  id: number;
  username: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  avatar_urls: { [key: string]: string };
  roles: string[];
  meta?: {
    memberpress_subscriptions?: any[];
    memberpress_active?: boolean;
  };
}

interface MemberPressSubscription {
  id: number;
  membership_id: number;
  membership_name: string;
  status: string;
  created_at: string;
  expires_at: string | null;
}

interface AuthResponse {
  success: boolean;
  user?: WordPressUser;
  token?: string;
  error?: string;
  subscriptions?: MemberPressSubscription[];
}

class WordPressAuth {
  private baseUrl: string;
  private username: string;
  private appPassword: string;

  constructor() {
    this.baseUrl = process.env.WORDPRESS_API_URL || '';
    this.username = process.env.WORDPRESS_USERNAME || '';
    this.appPassword = process.env.WORDPRESS_APP_PASSWORD || '';

    if (!this.baseUrl || !this.username || !this.appPassword) {
      console.error('WordPress authentication configuration missing');
    }
  }

  private getAuthHeaders(): HeadersInit {
    const credentials = btoa(`${this.username}:${this.appPassword}`);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Authenticate user with WordPress credentials
   */
  async authenticateUser(username: string, password: string): Promise<AuthResponse> {
    try {
      // Use Basic Auth to validate credentials
      const credentials = btoa(`${username}:${password}`);
      
      // Get user details using their credentials
      const userResponse = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }

      const userData: WordPressUser = await userResponse.json();

      // Create a pseudo-token for session management (Basic auth credentials)
      const token = credentials;

      // Get MemberPress subscription data
      const subscriptions = await this.getMemberPressSubscriptions(userData.id, token);

      // Sync user to Supabase
      await this.syncUserToSupabase(userData, subscriptions);

      return {
        success: true,
        user: userData,
        token, // This is now the Basic auth credentials
        subscriptions,
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * Get MemberPress subscription data for a user
   */
  private async getMemberPressSubscriptions(userId: number, token: string): Promise<MemberPressSubscription[]> {
    try {
      const mpUrl = `${this.baseUrl.replace('/wp/v2', '')}/wp-json/mp/v1/members/${userId}/subscriptions`;
      
      const response = await fetch(mpUrl, {
        headers: {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Failed to fetch MemberPress data');
        return [];
      }

      const subscriptions = await response.json();
      return subscriptions;
    } catch (error) {
      console.error('MemberPress fetch error:', error);
      return [];
    }
  }

  /**
   * Sync WordPress user data to Supabase
   */
  private async syncUserToSupabase(wpUser: WordPressUser, subscriptions: MemberPressSubscription[]): Promise<void> {
    try {
      // Check if user exists in Supabase
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('wordpress_id', wpUser.id)
        .single();

      const userData = {
        wordpress_id: wpUser.id,
        email: wpUser.email,
        username: wpUser.username,
        first_name: wpUser.first_name,
        last_name: wpUser.last_name,
        full_name: wpUser.name,
        avatar_url: wpUser.avatar_urls?.['96'] || null,
        roles: wpUser.roles,
        is_active: subscriptions.some(sub => sub.status === 'active'),
        subscription_status: this.getSubscriptionStatus(subscriptions),
        subscription_expires_at: this.getLatestExpiration(subscriptions),
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (existingUser) {
        // Update existing user
        const { error: updateError } = await supabase
          .from('users')
          .update(userData)
          .eq('wordpress_id', wpUser.id);

        if (updateError) {
          console.error('Error updating user in Supabase:', updateError);
        }
      } else {
        // Insert new user
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            ...userData,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error inserting user in Supabase:', insertError);
        }
      }

      // Sync subscription details
      if (subscriptions.length > 0) {
        await this.syncSubscriptions(wpUser.id, subscriptions);
      }
    } catch (error) {
      console.error('Supabase sync error:', error);
    }
  }

  /**
   * Sync subscription data to Supabase
   */
  private async syncSubscriptions(wordpressUserId: number, subscriptions: MemberPressSubscription[]): Promise<void> {
    try {
      // Delete existing subscriptions for this user
      await supabase
        .from('user_subscriptions')
        .delete()
        .eq('wordpress_user_id', wordpressUserId);

      // Insert new subscriptions
      const subscriptionData = subscriptions.map(sub => ({
        wordpress_user_id: wordpressUserId,
        membership_id: sub.membership_id,
        membership_name: sub.membership_name,
        status: sub.status,
        started_at: sub.created_at,
        expires_at: sub.expires_at,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData);

      if (error) {
        console.error('Error syncing subscriptions:', error);
      }
    } catch (error) {
      console.error('Subscription sync error:', error);
    }
  }

  /**
   * Validate user session with WordPress
   */
  async validateSession(token: string): Promise<{ valid: boolean; user?: WordPressUser }> {
    try {
      // Token is now Basic auth credentials
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const user = await response.json();
        return { valid: true, user };
      }

      return { valid: false };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }

  /**
   * Check if user has active subscription
   */
  async checkSubscriptionStatus(wordpressUserId: number): Promise<{
    hasActiveSubscription: boolean;
    subscriptions: MemberPressSubscription[];
  }> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('wordpress_user_id', wordpressUserId)
        .eq('status', 'active');

      if (error) {
        console.error('Error checking subscription status:', error);
        return { hasActiveSubscription: false, subscriptions: [] };
      }

      return {
        hasActiveSubscription: data.length > 0,
        subscriptions: data,
      };
    } catch (error) {
      console.error('Subscription check error:', error);
      return { hasActiveSubscription: false, subscriptions: [] };
    }
  }

  /**
   * Get subscription status from MemberPress data
   */
  private getSubscriptionStatus(subscriptions: MemberPressSubscription[]): string {
    if (subscriptions.length === 0) return 'none';
    
    const activeSubscription = subscriptions.find(sub => sub.status === 'active');
    if (activeSubscription) return 'active';
    
    const pendingSubscription = subscriptions.find(sub => sub.status === 'pending');
    if (pendingSubscription) return 'pending';
    
    return 'expired';
  }

  /**
   * Get latest expiration date from subscriptions
   */
  private getLatestExpiration(subscriptions: MemberPressSubscription[]): string | null {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active' && sub.expires_at);
    
    if (activeSubscriptions.length === 0) return null;
    
    const latestExpiration = activeSubscriptions.reduce((latest, sub) => {
      if (!latest || !sub.expires_at) return latest;
      return new Date(sub.expires_at) > new Date(latest) ? sub.expires_at : latest;
    }, activeSubscriptions[0].expires_at);
    
    return latestExpiration;
  }

  /**
   * Logout user (clear local session)
   */
  async logout(): Promise<void> {
    // This would typically clear any stored tokens/session data
    // Implementation depends on your storage method (cookies, localStorage, etc.)
    try {
      // If using Supabase auth as well
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

export const wordpressAuth = new WordPressAuth();
export type { WordPressUser, MemberPressSubscription, AuthResponse };