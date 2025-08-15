/**
 * API route for team operations
 * GET /api/teams/[teamId] - Get team details
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getAuthUser } from '@/lib/supabase-server';

// GET /api/teams/[teamId] - Get team details
export async function GET(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params;
    const { user, error: authError } = await getAuthUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createServerClient();

    // Fetch team data
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members(
          id,
          role,
          user:users(
            id,
            display_name,
            email,
            role
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

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}