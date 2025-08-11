/**
 * Role-based validation middleware for API routes
 * Ensures all data access respects role boundaries
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { getUserSecurityContext } from '@/lib/dashboard-queries';
import { logDataAccess, logSecurityViolation } from '@/lib/audit-logging';

export interface RoleValidationOptions {
  allowedRoles?: string[];
  requireOrgScope?: boolean;
  requireTeamScope?: boolean;
  checkResourceOwnership?: boolean;
}

/**
 * Middleware to validate role-based access
 */
export function withRoleValidation(
  handler: Function,
  options: RoleValidationOptions = {}
) {
  return async (req: NextRequest) => {
    const supabase = createMiddlewareClient({ req, res: NextResponse.next() });
    
    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        await logSecurityViolation('unauthenticated_access', 'api', req.nextUrl.pathname);
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Get user's security context
      const context = await getUserSecurityContext(user.id);
      
      // Check allowed roles
      if (options.allowedRoles && options.allowedRoles.length > 0) {
        const hasAllowedRole = context.roles.some(role => 
          options.allowedRoles!.includes(role)
        );
        
        if (!hasAllowedRole) {
          await logSecurityViolation(
            'insufficient_role',
            'api',
            req.nextUrl.pathname,
            `Required roles: ${options.allowedRoles.join(', ')}`
          );
          return NextResponse.json(
            { error: 'Forbidden: Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // Validate organization scope for directors
      if (options.requireOrgScope && context.roles.includes('club_director')) {
        const orgId = req.nextUrl.searchParams.get('organizationId') || 
                     req.headers.get('x-organization-id');
        
        if (orgId && orgId !== context.organizationId) {
          await logSecurityViolation(
            'cross_org_access',
            'organization',
            orgId,
            'Attempted to access different organization'
          );
          return NextResponse.json(
            { error: 'Forbidden: Access denied to this organization' },
            { status: 403 }
          );
        }
      }

      // Validate team scope for coaches
      if (options.requireTeamScope && context.roles.includes('team_coach')) {
        const teamId = req.nextUrl.searchParams.get('teamId') || 
                      req.headers.get('x-team-id');
        
        if (teamId && !context.teamIds.includes(teamId)) {
          await logSecurityViolation(
            'cross_team_access',
            'team',
            teamId,
            'Attempted to access different team'
          );
          return NextResponse.json(
            { error: 'Forbidden: Access denied to this team' },
            { status: 403 }
          );
        }
      }

      // Add security context to request
      const modifiedReq = req as any;
      modifiedReq.securityContext = context;
      modifiedReq.user = user;

      // Log successful access
      await logDataAccess(
        req.method.toLowerCase(),
        'api',
        req.nextUrl.pathname,
        true
      );

      // Call the actual handler
      return handler(modifiedReq);
      
    } catch (error) {
      console.error('Role validation error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Validate resource ownership
 */
export async function validateResourceOwnership(
  userId: string,
  resourceType: string,
  resourceId: string,
  context: any
): Promise<boolean> {
  const supabase = createMiddlewareClient({ 
    req: new NextRequest(new URL('http://localhost')), 
    res: NextResponse.next() 
  });

  switch (resourceType) {
    case 'practice_plan':
      const { data: plan } = await supabase
        .from('practices')
        .select('coach_id, team_id')
        .eq('id', resourceId)
        .single();
      
      return plan?.coach_id === userId || 
             context.teamIds.includes(plan?.team_id);

    case 'user_progress':
      const { data: progress } = await supabase
        .from('player_progress')
        .select('player_id')
        .eq('id', resourceId)
        .single();
      
      return progress?.player_id === userId ||
             context.childIds.includes(progress?.player_id);

    default:
      return false;
  }
}

/**
 * Middleware presets for common scenarios
 */
export const roleMiddleware = {
  // Admin only endpoints
  adminOnly: (handler: Function) => 
    withRoleValidation(handler, { 
      allowedRoles: ['administrator'] 
    }),

  // Director and admin endpoints
  directorLevel: (handler: Function) => 
    withRoleValidation(handler, { 
      allowedRoles: ['administrator', 'club_director'],
      requireOrgScope: true 
    }),

  // Coach level access
  coachLevel: (handler: Function) => 
    withRoleValidation(handler, { 
      allowedRoles: ['administrator', 'club_director', 'team_coach'],
      requireTeamScope: true 
    }),

  // Any authenticated user
  authenticated: (handler: Function) => 
    withRoleValidation(handler, {}),

  // Parent accessing children
  parentOnly: (handler: Function) => 
    withRoleValidation(handler, { 
      allowedRoles: ['parent'],
      checkResourceOwnership: true 
    }),
};