import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const { target_user_id } = await request.json()

    if (!target_user_id) {
      return NextResponse.json({ error: 'Missing target_user_id' }, { status: 400 })
    }

    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user record
    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('id, account_type')
      .eq('auth_user_id', user.id)
      .single()

    if (currentUserError || !currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 })
    }

    // Get target user record
    const { data: targetUser, error: targetUserError } = await supabase
      .from('users')
      .select('id, email, account_type, auth_user_id')
      .eq('id', target_user_id)
      .single()

    if (targetUserError || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    // Verify permission to switch to this profile
    let hasPermission = false

    // Check if switching to own profile
    if (currentUser.id === target_user_id) {
      hasPermission = true
    }
    // Check if parent switching to child
    else if (currentUser.account_type === 'parent') {
      const { data: relationship, error: relationError } = await supabase
        .from('parent_child_relationships')
        .select('id')
        .eq('parent_id', currentUser.id)
        .eq('child_id', target_user_id)
        .single()

      hasPermission = !relationError && !!relationship
    }
    // Check if both users are in same family
    else {
      const { data: familyCheck, error: familyError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', currentUser.id)
        .single()

      if (!familyError && familyCheck) {
        const { data: targetInFamily, error: targetFamilyError } = await supabase
          .from('family_members')
          .select('id')
          .eq('family_id', familyCheck.family_id)
          .eq('user_id', target_user_id)
          .single()

        hasPermission = !targetFamilyError && !!targetInFamily
      }
    }

    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Log the profile switch
    await supabase
      .from('user_activity_log')
      .insert({
        user_id: currentUser.id,
        action: 'profile_switch',
        details: {
          from_user_id: currentUser.id,
          to_user_id: target_user_id,
          to_email: targetUser.email,
          switch_type: currentUser.account_type === 'parent' ? 'parent_to_child' : 'family_member'
        }
      })

    // Create a session token for the target user
    // Note: In a real implementation, you'd want to create a special session
    // that maintains the original auth but operates as the target user
    const sessionData = {
      original_user_id: currentUser.id,
      active_user_id: target_user_id,
      switch_timestamp: new Date().toISOString(),
      permissions: currentUser.account_type === 'parent' ? 'full_child_access' : 'family_member_access'
    }

    return NextResponse.json({
      success: true,
      active_user_id: target_user_id,
      session_data: sessionData,
      message: `Switched to ${targetUser.email} profile`
    })

  } catch (error) {
    console.error('Profile switch error:', error)
    return NextResponse.json(
      { error: 'Failed to switch profile' },
      { status: 500 }
    )
  }
}
