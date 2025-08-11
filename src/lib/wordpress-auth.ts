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
   * Supports both regular WordPress passwords and Application Passwords
   */
  async authenticateUser(username: string, password: string): Promise<AuthResponse> {
    try {
      // Method 1: Try WordPress login endpoint with regular password
      const loginResult = await this.tryWordPressLogin(username, password);
      if (loginResult.success) {
        return loginResult;
      }

      // Method 2: Try Basic Auth with REST API (Application Password or enabled Basic Auth)
      const restResult = await this.tryRestAPIAuth(username, password);
      if (restResult.success) {
        return restResult;
      }

      // If both methods fail, return helpful error message
      return {
        success: false,
        error: 'Login failed. Please check your username and password. If you continue having issues, you may need to enable Application Passwords in your WordPress admin.',
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
   * Try WordPress login with regular password using XML-RPC
   */
  private async tryWordPressLogin(username: string, password: string): Promise<AuthResponse> {
    try {
      // Extract domain from baseUrl for XML-RPC
      const wpUrl = this.baseUrl.replace('/wp-json/wp/v2', '');
      const xmlrpcUrl = `${wpUrl}/xmlrpc.php`;
      
      // XML-RPC request to authenticate and get user profile
      const xmlrpcBody = `<?xml version="1.0"?>
        <methodCall>
          <methodName>wp.getProfile</methodName>
          <params>
            <param><value><string>${username}</string></value></param>
            <param><value><string>${password}</string></value></param>
          </params>
        </methodCall>`;

      const xmlrpcResponse = await fetch(xmlrpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
          'User-Agent': 'POWLAX-App/1.0'
        },
        body: xmlrpcBody
      });

      if (!xmlrpcResponse.ok) {
        return { success: false, error: 'WordPress XML-RPC not accessible' };
      }

      const xmlrpcText = await xmlrpcResponse.text();
      
      // Check if authentication was successful (no fault in response)
      if (xmlrpcText.includes('<fault>')) {
        return { success: false, error: 'Invalid WordPress credentials' };
      }

      if (!xmlrpcText.includes('<methodResponse>')) {
        return { success: false, error: 'WordPress authentication failed' };
      }

      // Authentication successful, now get user data via REST API
      try {
        // Try to get user data by searching for the username
        const usersResponse = await fetch(`${this.baseUrl}/users?search=${encodeURIComponent(username)}`, {
          headers: {
            'User-Agent': 'POWLAX-App/1.0'
          }
        });
        
        if (usersResponse.ok) {
          const users = await usersResponse.json();
          const userData = users.find((user: any) => 
            user.slug === username.toLowerCase() || 
            user.username === username ||
            user.name === username
          );
          
          if (userData) {
            // Create a token indicating XML-RPC authentication
            const token = btoa(`xmlrpc:${username}:${Date.now()}`);
            
            // Get MemberPress subscription data (may be limited without full REST API access)
            const subscriptions: MemberPressSubscription[] = [];

            // Sync user to Supabase
            await this.syncUserToSupabase(userData, subscriptions);

            return {
              success: true,
              user: userData,
              token,
              subscriptions,
            };
          }
        }
      } catch (restError) {
        console.error('Could not get user data via REST API:', restError);
      }

      // If we can't get user data via REST API, create minimal user object
      return {
        success: true,
        user: {
          id: 0, // We don't have the actual ID without REST API access
          username: username,
          email: '',
          name: username,
          first_name: '',
          last_name: '',
          avatar_urls: {},
          roles: ['subscriber'], // Default role
        } as WordPressUser,
        token: btoa(`xmlrpc:${username}:${Date.now()}`),
        subscriptions: [],
      };

    } catch (error) {
      console.error('WordPress XML-RPC login error:', error);
      return { success: false, error: 'WordPress XML-RPC authentication failed' };
    }
  }

  /**
   * Try REST API authentication (Application Password or Basic Auth)
   */
  private async tryRestAPIAuth(username: string, password: string): Promise<AuthResponse> {
    try {
      const credentials = btoa(`${username}:${password}`);
      
      // Get user details using Basic Auth
      const userResponse = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        return {
          success: false,
          error: 'REST API authentication failed',
        };
      }

      const userData: WordPressUser = await userResponse.json();

      // Create token from Basic auth credentials
      const token = credentials;

      // Get MemberPress subscription data
      const subscriptions = await this.getMemberPressSubscriptions(userData.id, token);

      // Sync user to Supabase
      await this.syncUserToSupabase(userData, subscriptions);

      return {
        success: true,
        user: userData,
        token,
        subscriptions,
      };
    } catch (error) {
      console.error('REST API auth error:', error);
      return {
        success: false,
        error: 'REST API authentication failed',
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
   * Sync WordPress user data to Supabase (now public for use by magic link system)
   */
  async syncUserToSupabase(wpUser: WordPressUser, subscriptions: MemberPressSubscription[]): Promise<void> {
    try {
      // Check if user exists in Supabase users table
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id, auth_user_id')
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
   * Create or link Supabase Auth user for WordPress user
   */
  async createSupabaseAuthUser(wpUser: WordPressUser): Promise<{ user: any; error: any }> {
    try {
      // Check if Supabase Auth user already exists
      const adminClient = supabase.createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data: existingUsers } = await adminClient.auth.admin.listUsers();
      let existingUser = existingUsers.users.find(u => u.email === wpUser.email);
      
      if (existingUser) {
        // Update existing user metadata with WordPress info
        const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
          existingUser.id,
          {
            user_metadata: {
              ...existingUser.user_metadata,
              wordpress_id: wpUser.id,
              full_name: wpUser.name,
              first_name: wpUser.first_name,
              last_name: wpUser.last_name,
              avatar_url: wpUser.avatar_urls?.['96'] || null,
              roles: wpUser.roles
            }
          }
        );
        
        if (updateError) {
          return { user: null, error: updateError };
        }
        
        return { user: updatedUser.user, error: null };
      } else {
        // Create new Supabase Auth user
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: wpUser.email,
          email_confirm: true,
          user_metadata: {
            wordpress_id: wpUser.id,
            full_name: wpUser.name,
            first_name: wpUser.first_name,
            last_name: wpUser.last_name,
            avatar_url: wpUser.avatar_urls?.['96'] || null,
            roles: wpUser.roles,
            username: wpUser.username
          }
        });
        
        if (createError) {
          return { user: null, error: createError };
        }
        
        return { user: newUser.user, error: null };
      }
    } catch (error) {
      console.error('Error creating/linking Supabase Auth user:', error);
      return { user: null, error };
    }
  }

  /**
   * Link WordPress user to existing Supabase Auth user by email
   */
  async linkWordPressUserByEmail(email: string): Promise<{ user: WordPressUser | null; linked: boolean }> {
    try {
      // Search for WordPress user by email
      const response = await fetch(
        `${this.baseUrl}/users?search=${encodeURIComponent(email)}`,
        {
          headers: this.getAuthHeaders()
        }
      );
      
      if (!response.ok) {
        return { user: null, linked: false };
      }
      
      const users = await response.json();
      const wpUser = users.find((user: any) => 
        user.email?.toLowerCase() === email.toLowerCase()
      );
      
      if (wpUser) {
        // Sync WordPress user to our database
        await this.syncUserToSupabase(wpUser, []);
        
        // Try to get MemberPress subscriptions
        const subscriptions = await this.getMemberPressSubscriptions(wpUser.id, '');
        if (subscriptions.length > 0) {
          await this.syncSubscriptions(wpUser.id, subscriptions);
        }
        
        return { user: wpUser, linked: true };
      }
      
      return { user: null, linked: false };
    } catch (error) {
      console.error('Error linking WordPress user by email:', error);
      return { user: null, linked: false };
    }
  }

  /**
   * Get WordPress user by email (for magic link authentication)
   */
  async getWordPressUserByEmail(email: string): Promise<WordPressUser | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users?search=${encodeURIComponent(email)}`,
        {
          headers: this.getAuthHeaders()
        }
      );
      
      if (!response.ok) {
        return null;
      }
      
      const users = await response.json();
      return users.find((user: any) => 
        user.email?.toLowerCase() === email.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Error getting WordPress user by email:', error);
      return null;
    }
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