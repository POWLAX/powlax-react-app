/**
 * Example API route demonstrating role-based security
 * GET /api/teams/[teamId] - Get team details
 * PUT /api/teams/[teamId] - Update team (coaches only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { roleMiddleware } from '@/middleware/roleValidation';
import { supabase } from '@/lib/supabase';

// GET /api/teams/[teamId] - Anyone in the team can view
export const GET = roleMiddleware.authenticated(async (
  req: NextRequest,
  { params }: { params: { teamId: string } }
) => {
  try {
    const { teamId } = params;
    const { securityContext } = req as any;

    // Check if user has access to this team
    if (!securityContext.roles.includes('administrator') && 
        !securityContext.teamIds.includes(teamId)) {
      return NextResponse.json(
        { error: 'Access denied to this team' },
        { status: 403 }
      );
    }

    // Fetch team data
    const { data, error } = await supabase
      .from('team_teams')
      .select(`
        *,
        organization:club_organizations(name, id),
        members:team_members(
          user:users(
            id,
            display_name,
            email,
            roles
          )
        )
      `)
      .eq('id', teamId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Filter member data based on role
    if (securityContext.roles.includes('player')) {
      // Players only see limited member info
      data.members = data.members.map((member: any) => ({
        user: {
          id: member.user.id,
          display_name: member.user.display_name,
          roles: member.user.roles
        }
      }));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/teams/[teamId] - Only coaches and above can update
export const PUT = roleMiddleware.coachLevel(async (
  req: NextRequest,
  { params }: { params: { teamId: string } }
) => {
  try {
    const { teamId } = params;
    const { securityContext } = req as any;
    const body = await req.json();

    // Additional check for coaches - can only update their own teams
    if (securityContext.roles.includes('team_coach') && 
        !securityContext.teamIds.includes(teamId)) {
      return NextResponse.json(
        { error: 'You can only update your own teams' },
        { status: 403 }
      );
    }

    // Validate update fields - coaches have limited update capabilities
    const allowedFields = securityContext.roles.includes('administrator') || 
                         securityContext.roles.includes('club_director')
      ? ['name', 'age_band', 'description', 'settings'] // Full access
      : ['description', 'settings']; // Coach limited access

    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Update team
    const { data, error } = await supabase
      .from('team_teams')
      .update(updateData)
      .eq('id', teamId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update team' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});