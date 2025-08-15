/**
 * Dashboard Data Queries with Security Boundaries
 * All queries respect role-based access control and organization boundaries
 */

import { supabase } from './supabase';
import { logDataAccess } from './audit-logging';

// Types
export interface SecurityContext {
  userId: string;
  roles: string[];
  organizationId?: string;
  teamIds: string[];
  childIds: string[];
}

export interface DashboardData {
  user: any;
  metrics: any;
  recentActivity: any[];
  quickActions: any[];
}

/**
 * Get user's full security context for data access
 */
export async function getUserSecurityContext(userId: string): Promise<SecurityContext> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        organization:club_organizations(*),
        teams:team_members!inner(
          team:team_teams!inner(*)
        ),
        children:parent_child_relationships!parent_id(
          child:users!child_id(*)
        )
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      userId,
      roles: user.roles || [],
      organizationId: user.organization_id,
      teamIds: user.teams?.map((tm: any) => tm.team.id) || [],
      childIds: user.children?.map((rel: any) => rel.child.id) || []
    };
  } catch (error) {
    console.error('Failed to get security context:', error);
    throw error;
  }
}

/**
 * Fetch dashboard data based on role and security context
 */
export async function fetchDashboardData(
  role: string,
  userId: string,
  context: SecurityContext
): Promise<DashboardData> {
  // Log data access attempt
  await logDataAccess('dashboard_view', 'dashboard', null, true);

  switch (role) {
    case 'administrator':
      return fetchAdminDashboard(userId);
    case 'club_director':
      return fetchDirectorDashboard(userId, context);
    case 'team_coach':
      return fetchCoachDashboard(userId, context);
    case 'player':
      return fetchPlayerDashboard(userId, context);
    case 'parent':
      return fetchParentDashboard(userId, context);
    default:
      throw new Error(`Unknown role: ${role}`);
  }
}

/**
 * Admin Dashboard - Full system access
 */
async function fetchAdminDashboard(userId: string): Promise<DashboardData> {
  const [clubs, users, subscriptions, children] = await Promise.all([
    // Get all clubs (not organizations)
    supabase.from('clubs').select('*').order('created_at', { ascending: false }),
    
    // Get user statistics
    supabase.from('users').select('roles', { count: 'exact' }),
    
    // Get subscription metrics
    supabase.from('user_subscriptions')
      .select('status', { count: 'exact' })
      .eq('status', 'active'),
    
    // Get admin's children if they have parent role
    supabase.from('parent_child_relationships')
      .select(`
        *,
        child:users!child_id(*)
      `)
      .eq('parent_id', userId)
  ]);

  return {
    user: { id: userId, role: 'administrator' },
    metrics: {
      totalOrganizations: clubs.data?.length || 0,
      totalUsers: users.count || 0,
      activeSubscriptions: subscriptions.count || 0,
      children: children.data || []
    },
    recentActivity: [],
    quickActions: [
      { label: 'Manage Roles', href: '/admin/role-management' },
      { label: 'View Organizations', href: '/admin/organizations' },
      { label: 'Platform Analytics', href: '/admin/analytics' }
    ]
  };
}

/**
 * Director Dashboard - Organization-scoped access
 */
async function fetchDirectorDashboard(
  userId: string,
  context: SecurityContext
): Promise<DashboardData> {
  if (!context.organizationId) {
    throw new Error('Director must have organization assignment');
  }

  const [orgData, teams, coaches, players] = await Promise.all([
    // Get club details (not organization)
    supabase
      .from('clubs')
      .select('*')
      .eq('id', context.organizationId)
      .single(),
    
    // Get all teams in organization
    supabase
      .from('team_teams')
      .select('*')
      .eq('organization_id', context.organizationId),
    
    // Get coaches in organization
    supabase
      .from('team_members')
      .select(`
        user:users(*)
      `)
      .eq('role', 'coach')
      .in('team_id', context.teamIds),
    
    // Get players in organization
    supabase
      .from('team_members')
      .select(`
        user:users(*)
      `)
      .eq('role', 'player')
      .in('team_id', context.teamIds)
  ]);

  return {
    user: { id: userId, role: 'director' },
    metrics: {
      organization: orgData.data,
      totalTeams: teams.data?.length || 0,
      totalCoaches: coaches.data?.length || 0,
      totalPlayers: players.data?.length || 0
    },
    recentActivity: [],
    quickActions: [
      { label: 'Manage Teams', href: '/club/teams' },
      { label: 'Manage Coaches', href: '/club/coaches' },
      { label: 'Club Analytics', href: '/club/analytics' }
    ]
  };
}

/**
 * Coach Dashboard - Team-scoped access
 */
async function fetchCoachDashboard(
  userId: string,
  context: SecurityContext
): Promise<DashboardData> {
  if (context.teamIds.length === 0) {
    throw new Error('Coach must have team assignment');
  }

  const [teams, roster, practices, drills] = await Promise.all([
    // Get coach's teams
    supabase
      .from('team_teams')
      .select(`
        *,
        organization:club_organizations(name)
      `)
      .in('id', context.teamIds),
    
    // Get team roster with more details
    supabase
      .from('team_members')
      .select(`
        *,
        user:users(*)
      `)
      .eq('role', 'player')
      .in('team_id', context.teamIds),
    
    // Get recent practice plans (from practices table)
    Promise.resolve({ data: [] }), // Placeholder
    
    // Get favorite drills (when drills table exists)
    Promise.resolve({ data: [] }) // Placeholder
  ]);

  return {
    user: { id: userId, role: 'coach' },
    metrics: {
      teams: teams.data || [],
      rosterSize: roster.data?.length || 0,
      recentPractices: practices.data?.length || 0,
      favoriteDrills: drills.data?.length || 0
    },
    recentActivity: [],
    quickActions: [
      { label: 'Create Practice Plan', href: `/teams/${context.teamIds[0]}/practice-plans` },
      { label: 'Manage Roster', href: `/teams/${context.teamIds[0]}/roster` },
      { label: 'View Drills', href: '/drills' }
    ]
  };
}

/**
 * Player Dashboard - Personal data only
 */
async function fetchPlayerDashboard(
  userId: string,
  context: SecurityContext
): Promise<DashboardData> {
  const [profile, team, progress] = await Promise.all([
    // Get player profile
    supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single(),
    
    // Get player's team
    supabase
      .from('team_members')
      .select(`
        team:team_teams(
          *,
          organization:club_organizations(name)
        )
      `)
      .eq('user_id', userId)
      .eq('role', 'player')
      .single(),
    
    // Get player progress (when progress tables exist)
    Promise.resolve({ data: {} }) // Placeholder
  ]);

  return {
    user: profile.data,
    metrics: {
      team: team.data?.team || null,
      progress: progress.data || {}
    },
    recentActivity: [],
    quickActions: [
      { label: 'Skills Academy', href: '/skills-academy' },
      { label: 'My Progress', href: '/my-progress' },
      { label: 'Team Schedule', href: '/team-schedule' }
    ]
  };
}

/**
 * Parent Dashboard - Children's data access
 */
async function fetchParentDashboard(
  userId: string,
  context: SecurityContext
): Promise<DashboardData> {
  if (context.childIds.length === 0) {
    return {
      user: { id: userId, role: 'parent' },
      metrics: { children: [] },
      recentActivity: [],
      quickActions: [
        { label: 'Parent Resources', href: '/parent-resources' }
      ]
    };
  }

  const [children, childTeams, childProgress] = await Promise.all([
    // Get children details
    supabase
      .from('users')
      .select('*')
      .in('id', context.childIds),
    
    // Get children's teams
    supabase
      .from('team_members')
      .select(`
        user_id,
        team:team_teams(*)
      `)
      .in('user_id', context.childIds)
      .eq('role', 'player'),
    
    // Get children's progress (when available)
    Promise.resolve({ data: [] }) // Placeholder
  ]);

  return {
    user: { id: userId, role: 'parent' },
    metrics: {
      children: children.data || [],
      teams: childTeams.data || [],
      progress: childProgress.data || []
    },
    recentActivity: [],
    quickActions: [
      { label: 'View Progress', href: '/children-progress' },
      { label: 'Team Schedules', href: '/team-schedules' },
      { label: 'Parent Resources', href: '/parent-resources' }
    ]
  };
}

/**
 * Verify data access permission
 */
export async function verifyDataAccess(
  userId: string,
  resourceType: string,
  resourceId: string,
  action: string = 'view'
): Promise<boolean> {
  const context = await getUserSecurityContext(userId);
  
  // Admins can access everything
  if (context.roles.includes('administrator')) {
    return true;
  }

  // Check based on resource type
  switch (resourceType) {
    case 'organization':
      return context.organizationId === resourceId;
      
    case 'team':
      return context.teamIds.includes(resourceId);
      
    case 'user':
      // Can view self, children, or team members
      return (
        userId === resourceId ||
        context.childIds.includes(resourceId) ||
        (await isTeamMember(userId, resourceId))
      );
      
    default:
      return false;
  }
}

/**
 * Helper to check if users are on same team
 */
async function isTeamMember(userId1: string, userId2: string): Promise<boolean> {
  const { data } = await supabase
    .from('team_members')
    .select('team_id')
    .or(`user_id.eq.${userId1},user_id.eq.${userId2}`);
    
  if (!data || data.length < 2) return false;
  
  const teams1 = data.filter(tm => tm.user_id === userId1).map(tm => tm.team_id);
  const teams2 = data.filter(tm => tm.user_id === userId2).map(tm => tm.team_id);
  
  return teams1.some(t => teams2.includes(t));
}