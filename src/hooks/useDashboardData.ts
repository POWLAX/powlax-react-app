'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWordPressAuth } from './useWordPressAuth';
import { 
  getUserSecurityContext, 
  fetchDashboardData,
  verifyDataAccess,
  type SecurityContext,
  type DashboardData
} from '@/lib/dashboard-queries';
import { logDataAccess, logSecurityViolation } from '@/lib/audit-logging';
import { toast } from 'sonner';

/**
 * Hook to fetch dashboard data with security context
 */
export function useDashboardData() {
  const { user } = useWordPressAuth();
  const queryClient = useQueryClient();

  // Get user's security context
  const { data: securityContext, isLoading: contextLoading } = useQuery({
    queryKey: ['security-context', user?.id],
    queryFn: () => getUserSecurityContext(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch dashboard data based on role and context
  const { 
    data: dashboardData, 
    isLoading: dataLoading,
    error 
  } = useQuery({
    queryKey: ['dashboard', user?.roles?.[0], user?.id, securityContext],
    queryFn: async () => {
      if (!user || !securityContext) return null;
      
      const primaryRole = user.roles?.[0] || 'player';
      return fetchDashboardData(primaryRole, user.id, securityContext);
    },
    enabled: !!user && !!securityContext,
    staleTime: primaryRole => {
      // Different cache times based on role
      switch (primaryRole) {
        case 'administrator': return 30 * 1000; // 30 seconds
        case 'club_director': return 60 * 1000; // 1 minute
        case 'team_coach': return 2 * 60 * 1000; // 2 minutes
        default: return 5 * 60 * 1000; // 5 minutes
      }
    },
    refetchInterval: user?.roles?.includes('team_coach') ? 60000 : false,
    retry: (failureCount, error: any) => {
      // Don't retry on permission errors
      if (error?.message?.includes('Access denied')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    securityContext,
    dashboardData,
    isLoading: contextLoading || dataLoading,
    error,
    userRole: user?.roles?.[0] || 'player'
  };
}

/**
 * Hook to verify data access before fetching
 */
export function useSecureDataAccess() {
  const { user } = useWordPressAuth();

  const checkAccess = useMutation({
    mutationFn: async ({ 
      resourceType, 
      resourceId, 
      action = 'view' 
    }: {
      resourceType: string;
      resourceId: string;
      action?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const hasAccess = await verifyDataAccess(
        user.id,
        resourceType,
        resourceId,
        action
      );

      if (!hasAccess) {
        await logSecurityViolation(action, resourceType, resourceId);
        throw new Error('Access denied');
      }

      await logDataAccess(action, resourceType, resourceId, true);
      return true;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return { checkAccess };
}

/**
 * Hook for admin role toggle functionality
 */
export function useAdminRoleToggle() {
  const { user } = useWordPressAuth();
  const queryClient = useQueryClient();
  
  const isAdmin = user?.roles?.includes('administrator');
  
  // Store viewing state in session storage
  const viewingRole = typeof window !== 'undefined' 
    ? sessionStorage.getItem('admin_viewing_role') 
    : null;
    
  const viewingContext = typeof window !== 'undefined'
    ? JSON.parse(sessionStorage.getItem('admin_viewing_context') || '{}')
    : {};

  const setViewingRole = (role: string | null, context?: any) => {
    if (!isAdmin) return;
    
    if (role) {
      sessionStorage.setItem('admin_viewing_role', role);
      if (context) {
        sessionStorage.setItem('admin_viewing_context', JSON.stringify(context));
      }
    } else {
      sessionStorage.removeItem('admin_viewing_role');
      sessionStorage.removeItem('admin_viewing_context');
    }
    
    // Invalidate all queries to refetch with new role
    queryClient.invalidateQueries();
    
    // Log the role switch
    logDataAccess('admin_role_toggle', 'system', null, true, undefined, {
      from_role: 'administrator',
      to_role: role,
      context
    });
  };

  return {
    isAdmin,
    isViewingAs: !!viewingRole,
    viewingRole,
    viewingContext,
    setViewingRole,
    clearViewingRole: () => setViewingRole(null)
  };
}

/**
 * Hook to fetch data for a specific organization (Director use)
 */
export function useOrganizationData(organizationId?: string) {
  const { user } = useWordPressAuth();
  const { checkAccess } = useSecureDataAccess();

  return useQuery({
    queryKey: ['organization', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      // Verify access
      await checkAccess.mutateAsync({
        resourceType: 'organization',
        resourceId: organizationId
      });

      // Fetch organization data
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          teams:teams(count),
          members:team_members(count)
        `)
        .eq('id', organizationId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!organizationId
  });
}

/**
 * Hook to fetch team data (Coach use)
 */
export function useTeamData(teamId?: string) {
  const { user } = useWordPressAuth();
  const { checkAccess } = useSecureDataAccess();

  return useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      
      // Verify access
      await checkAccess.mutateAsync({
        resourceType: 'team',
        resourceId: teamId
      });

      // Fetch team data
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          organization:organizations(name),
          members:team_members(
            user:users(*)
          )
        `)
        .eq('id', teamId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!teamId
  });
}

/**
 * Hook to fetch children data (Parent use)
 */
export function useChildrenData() {
  const { user } = useWordPressAuth();
  const { securityContext } = useDashboardData();

  return useQuery({
    queryKey: ['children', user?.id],
    queryFn: async () => {
      if (!securityContext?.childIds?.length) return [];

      // Parents automatically have access to their children
      await logDataAccess('view_children', 'user', undefined, true);

      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          teams:team_members(
            team:teams(*)
          )
        `)
        .in('id', securityContext.childIds);

      if (error) throw error;
      return data;
    },
    enabled: !!user && user.roles?.includes('parent') && !!securityContext
  });
}