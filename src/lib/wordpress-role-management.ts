/**
 * WordPress Role Management System
 * Handles role updates via WordPress REST API with proper sync to Supabase
 */

import { supabase } from './supabase';
import { wordpressAuth } from './wordpress-auth';

// Role definitions matching WordPress
export const WORDPRESS_ROLES = {
  ADMIN: 'administrator',
  DIRECTOR: 'club_director', 
  COACH: 'team_coach',
  PLAYER: 'player',
  PARENT: 'parent'
} as const;

export type WordPressRole = typeof WORDPRESS_ROLES[keyof typeof WORDPRESS_ROLES];

// App role mapping
export const APP_ROLES = {
  [WORDPRESS_ROLES.ADMIN]: 'admin',
  [WORDPRESS_ROLES.DIRECTOR]: 'director',
  [WORDPRESS_ROLES.COACH]: 'coach',
  [WORDPRESS_ROLES.PLAYER]: 'player',
  [WORDPRESS_ROLES.PARENT]: 'parent'
} as const;

export type AppRole = typeof APP_ROLES[keyof typeof APP_ROLES];

interface RoleUpdateResult {
  success: boolean;
  error?: string;
  updatedUser?: any;
}

interface RoleChangeAudit {
  targetUserId: string;
  targetWordPressId: number;
  oldRoles: string[];
  newRoles: string[];
  performedBy: string;
  reason?: string;
}

export class WordPressRoleManager {
  private baseUrl: string;
  private adminUsername: string;
  private adminPassword: string;

  constructor() {
    this.baseUrl = process.env.WORDPRESS_API_URL || '';
    this.adminUsername = process.env.WORDPRESS_ADMIN_USERNAME || '';
    this.adminPassword = process.env.WORDPRESS_ADMIN_PASSWORD || '';
  }

  /**
   * Get admin authorization headers for WordPress API
   */
  private getAdminHeaders(): HeadersInit {
    const credentials = btoa(`${this.adminUsername}:${this.adminPassword}`);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Verify if current user has permission to modify roles
   */
  async verifyPermission(currentUserId: string): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('roles')
        .eq('id', currentUserId)
        .single();

      if (error || !user) return false;

      // Only admins and directors can modify roles
      return user.roles.includes('administrator') || user.roles.includes('club_director');
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  /**
   * Get organization scope for directors
   */
  async getDirectorScope(directorId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', directorId)
        .single();

      return data?.organization_id || null;
    } catch (error) {
      console.error('Failed to get director scope:', error);
      return null;
    }
  }

  /**
   * Update user role in WordPress and sync to Supabase
   */
  async updateUserRole(
    targetUserId: string,
    newRole: WordPressRole,
    performedBy: string,
    reason?: string
  ): Promise<RoleUpdateResult> {
    try {
      // 1. Verify permissions
      const hasPermission = await this.verifyPermission(performedBy);
      if (!hasPermission) {
        return { success: false, error: 'Unauthorized: Insufficient permissions' };
      }

      // 2. Get current user data
      const { data: targetUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (fetchError || !targetUser) {
        return { success: false, error: 'User not found' };
      }

      // 3. Check scope for directors
      const { data: performer } = await supabase
        .from('users')
        .select('roles, organization_id')
        .eq('id', performedBy)
        .single();

      // Directors can only modify users in their organization
      if (performer?.roles.includes('club_director') && 
          !performer.roles.includes('administrator')) {
        if (targetUser.organization_id !== performer.organization_id) {
          return { 
            success: false, 
            error: 'Unauthorized: Can only modify users in your organization' 
          };
        }
      }

      // 4. Update role in WordPress
      const wpResponse = await fetch(
        `${this.baseUrl}/users/${targetUser.wordpress_id}`,
        {
          method: 'POST',
          headers: this.getAdminHeaders(),
          body: JSON.stringify({
            roles: [newRole]
          })
        }
      );

      if (!wpResponse.ok) {
        const error = await wpResponse.text();
        return { success: false, error: `WordPress update failed: ${error}` };
      }

      const updatedWpUser = await wpResponse.json();

      // 5. Sync to Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({
          roles: updatedWpUser.roles,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUserId);

      if (updateError) {
        return { success: false, error: 'Failed to sync role to database' };
      }

      // 6. Create audit log
      await this.auditRoleChange({
        targetUserId,
        targetWordPressId: targetUser.wordpress_id,
        oldRoles: targetUser.roles,
        newRoles: [newRole],
        performedBy,
        reason
      });

      // 7. Invalidate user sessions to force re-authentication
      await this.invalidateUserSessions(targetUserId);

      return { 
        success: true, 
        updatedUser: { ...targetUser, roles: [newRole] }
      };

    } catch (error) {
      console.error('Role update failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Role update failed' 
      };
    }
  }

  /**
   * Batch update multiple users' roles
   */
  async batchUpdateRoles(
    updates: Array<{ userId: string; newRole: WordPressRole }>,
    performedBy: string,
    reason?: string
  ): Promise<Array<RoleUpdateResult>> {
    const results: RoleUpdateResult[] = [];

    for (const update of updates) {
      const result = await this.updateUserRole(
        update.userId,
        update.newRole,
        performedBy,
        reason
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Create audit log entry for role change
   */
  private async auditRoleChange(audit: RoleChangeAudit): Promise<void> {
    try {
      await supabase.from('audit_log').insert({
        user_id: audit.performedBy,
        action: 'role_change',
        table_name: 'users',
        record_id: audit.targetUserId,
        old_values: { roles: audit.oldRoles },
        new_values: { roles: audit.newRoles },
        details: {
          wordpress_id: audit.targetWordPressId,
          reason: audit.reason,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Invalidate all sessions for a user (force re-login)
   */
  private async invalidateUserSessions(userId: string): Promise<void> {
    try {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId);
    } catch (error) {
      console.error('Failed to invalidate sessions:', error);
    }
  }

  /**
   * Get available roles for a user based on performer's permissions
   */
  getAvailableRoles(performerRole: string[]): WordPressRole[] {
    if (performerRole.includes('administrator')) {
      // Admins can assign any role
      return Object.values(WORDPRESS_ROLES);
    } else if (performerRole.includes('club_director')) {
      // Directors can only assign coach, player, parent roles
      return [
        WORDPRESS_ROLES.COACH,
        WORDPRESS_ROLES.PLAYER,
        WORDPRESS_ROLES.PARENT
      ];
    }
    // Others cannot assign roles
    return [];
  }

  /**
   * Validate role transition rules
   */
  validateRoleTransition(
    currentRoles: string[],
    newRole: WordPressRole,
    performerRoles: string[]
  ): { valid: boolean; reason?: string } {
    // Admins can do anything
    if (performerRoles.includes('administrator')) {
      return { valid: true };
    }

    // Cannot promote to admin or director without being admin
    if (newRole === WORDPRESS_ROLES.ADMIN || newRole === WORDPRESS_ROLES.DIRECTOR) {
      return { 
        valid: false, 
        reason: 'Only administrators can assign admin or director roles' 
      };
    }

    // Directors can manage coaches, players, parents
    if (performerRoles.includes('club_director')) {
      return { valid: true };
    }

    return { 
      valid: false, 
      reason: 'Insufficient permissions to modify roles' 
    };
  }

  /**
   * Sync all WordPress roles to Supabase (admin only)
   */
  async syncAllRoles(performedBy: string): Promise<{ 
    success: boolean; 
    synced: number; 
    errors: string[] 
  }> {
    // Verify admin permission
    const { data: performer } = await supabase
      .from('users')
      .select('roles')
      .eq('id', performedBy)
      .single();

    if (!performer?.roles.includes('administrator')) {
      return { 
        success: false, 
        synced: 0, 
        errors: ['Only administrators can sync all roles'] 
      };
    }

    let synced = 0;
    const errors: string[] = [];

    try {
      // Fetch all users from WordPress
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `${this.baseUrl}/users?per_page=100&page=${page}`,
          { headers: this.getAdminHeaders() }
        );

        if (!response.ok) {
          errors.push(`Failed to fetch page ${page}`);
          break;
        }

        const users = await response.json();
        
        if (users.length === 0) {
          hasMore = false;
          break;
        }

        // Sync each user
        for (const wpUser of users) {
          try {
            await supabase
              .from('users')
              .update({ 
                roles: wpUser.roles,
                updated_at: new Date().toISOString()
              })
              .eq('wordpress_id', wpUser.id);
            
            synced++;
          } catch (error) {
            errors.push(`Failed to sync user ${wpUser.id}: ${error}`);
          }
        }

        page++;
      }

      return { success: errors.length === 0, synced, errors };
    } catch (error) {
      return { 
        success: false, 
        synced, 
        errors: [`Sync failed: ${error}`] 
      };
    }
  }
}

// Export singleton instance
export const roleManager = new WordPressRoleManager();