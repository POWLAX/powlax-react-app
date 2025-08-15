/**
 * User Display Name Helpers
 * 
 * Manages the display of user names based on context:
 * - Display names for public/gaming contexts (like Xbox gamertags)
 * - Real names for coach views and internal team management
 */

export type DisplayContext = 
  | 'public'           // Public pages, general display
  | 'leaderboard'      // Public leaderboards
  | 'gamification'     // Badges, points, achievements
  | 'coach_view'       // Coach viewing players
  | 'team_roster'      // Team roster display
  | 'practice_plan'    // Practice planning
  | 'administrator'    // Administrator views
  | 'profile_edit';    // User editing their own profile

export interface UserDisplayInfo {
  id: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  account_type?: string;
  name_display_settings?: {
    public_display: string;
    coach_view: string;
    team_roster: string;
    leaderboard: string;
    gamification: string;
    allow_display_name_change?: boolean;
  };
}

/**
 * Get the appropriate display name based on context
 */
export function getUserDisplayName(
  user: UserDisplayInfo, 
  context: DisplayContext = 'public'
): string {
  // Public contexts - always use display name (gamertag style)
  const publicContexts: DisplayContext[] = [
    'public', 
    'leaderboard', 
    'gamification'
  ];
  
  // Internal contexts - use real name if available
  const internalContexts: DisplayContext[] = [
    'coach_view', 
    'team_roster', 
    'practice_plan',
    'administrator'
  ];

  // User editing their own profile - show both
  if (context === 'profile_edit') {
    return user.display_name; // They can see/edit their display name
  }

  // Public contexts - use display name
  if (publicContexts.includes(context)) {
    return user.display_name || 'Anonymous Player';
  }

  // Internal contexts - use real name if available
  if (internalContexts.includes(context)) {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    // Fallback to display name if real name not available
    return user.display_name || user.email.split('@')[0];
  }

  // Default to display name
  return user.display_name || 'Unknown User';
}

/**
 * Get initials for avatar display
 */
export function getUserInitials(
  user: UserDisplayInfo,
  context: DisplayContext = 'public'
): string {
  const name = getUserDisplayName(user, context);
  
  // If it's a real name with space, use first letter of each word
  if (name.includes(' ')) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  // Otherwise use first two letters
  return name.slice(0, 2).toUpperCase();
}

/**
 * Format user for select/dropdown displays
 */
export function getUserSelectLabel(
  user: UserDisplayInfo,
  showEmail: boolean = false
): string {
  const hasRealName = user.first_name && user.last_name;
  const realName = hasRealName ? `${user.first_name} ${user.last_name}` : null;
  
  // If real name exists and differs from display name, show both
  if (realName && realName !== user.display_name) {
    return showEmail 
      ? `${realName} (${user.display_name}) - ${user.email}`
      : `${realName} (${user.display_name})`;
  }
  
  // Otherwise just show display name
  return showEmail 
    ? `${user.display_name} - ${user.email}`
    : user.display_name;
}

/**
 * Check if user can change their display name
 */
export function canChangeDisplayName(user: UserDisplayInfo): boolean {
  return user.name_display_settings?.allow_display_name_change !== false;
}

/**
 * Validate display name (gamertag style rules)
 */
export function validateDisplayName(displayName: string): {
  valid: boolean;
  error?: string;
} {
  // Remove whitespace for validation
  const trimmed = displayName.trim();
  
  // Check length (3-20 characters is typical for gamertags)
  if (trimmed.length < 3) {
    return { valid: false, error: 'Display name must be at least 3 characters' };
  }
  
  if (trimmed.length > 20) {
    return { valid: false, error: 'Display name must be 20 characters or less' };
  }
  
  // Allow letters, numbers, spaces, underscores, and hyphens
  const validPattern = /^[a-zA-Z0-9 _-]+$/;
  if (!validPattern.test(trimmed)) {
    return { 
      valid: false, 
      error: 'Display name can only contain letters, numbers, spaces, underscores, and hyphens' 
    };
  }
  
  // Check for inappropriate consecutive characters
  if (/[ _-]{2,}/.test(trimmed)) {
    return { 
      valid: false, 
      error: 'Display name cannot have multiple consecutive special characters' 
    };
  }
  
  return { valid: true };
}

/**
 * Get privacy-appropriate display for different contexts
 */
export function getPrivacyAwareDisplay(
  user: UserDisplayInfo,
  viewerId: string | null,
  context: DisplayContext
): string {
  // User viewing their own profile - show everything
  if (viewerId === user.id) {
    return getUserDisplayName(user, context);
  }
  
  // Check privacy settings
  const privacySettings = user.name_display_settings;
  
  // If profile is not visible publicly, only show display name
  if (context === 'public' && privacySettings?.public_display === 'display_name') {
    return user.display_name || 'Private User';
  }
  
  return getUserDisplayName(user, context);
}

/**
 * React Hook Example Usage:
 * 
 * import { getUserDisplayName } from '@/lib/user-display-helpers';
 * 
 * // In a public leaderboard component:
 * const displayName = getUserDisplayName(user, 'leaderboard');
 * 
 * // In a coach's team management view:
 * const playerName = getUserDisplayName(player, 'coach_view');
 * 
 * // In a user profile edit form:
 * const currentDisplayName = getUserDisplayName(user, 'profile_edit');
 */