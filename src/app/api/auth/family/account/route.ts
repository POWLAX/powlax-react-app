import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user record from users table
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id, account_type')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is part of a family account
    const { data: familyMember, error: familyError } = await supabase
      .from('family_members')
      .select(`
        family_id,
        role_in_family,
        family_accounts!inner(
          id,
          family_name,
          primary_parent_id,
          emergency_contact
        )
      `)
      .eq('user_id', userRecord.id)
      .single()

    if (familyError || !familyMember) {
      // No family account found
      return NextResponse.json({ error: 'No family account found' }, { status: 404 })
    }

    // Get all family members
    const { data: allMembers, error: membersError } = await supabase
      .from('family_members')
      .select(`
        user_id,
        role_in_family,
        users!inner(
          id,
          email,
          first_name,
          last_name,
          full_name,
          account_type,
          age_group
        )
      `)
      .eq('family_id', familyMember.family_id)

    if (membersError) {
      throw new Error(`Failed to load family members: ${membersError.message}`)
    }

    // Format response
    const familyAccount = {
      id: familyMember.family_accounts.id,
      family_name: familyMember.family_accounts.family_name,
      primary_parent_id: familyMember.family_accounts.primary_parent_id,
      emergency_contact: familyMember.family_accounts.emergency_contact,
      members: allMembers?.map(member => ({
        id: member.users.id,
        email: member.users.email,
        first_name: member.users.first_name,
        last_name: member.users.last_name,
        full_name: member.users.full_name,
        account_type: member.users.account_type,
        age_group: member.users.age_group,
        role_in_family: member.role_in_family
      })) || []
    }

    return NextResponse.json(familyAccount)

  } catch (error) {
    console.error('Family account API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const { family_name, child_emails } = await request.json()

    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user record
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id, email, account_type')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create family account using the database function
    const { data: familyId, error: createError } = await supabase
      .rpc('create_family_account', {
        p_primary_parent_email: userRecord.email,
        p_family_name: family_name,
        p_child_emails: child_emails || []
      })

    if (createError) {
      throw new Error(`Failed to create family account: ${createError.message}`)
    }

    return NextResponse.json({ 
      success: true, 
      family_id: familyId,
      message: 'Family account created successfully'
    })

  } catch (error) {
    console.error('Create family account error:', error)
    return NextResponse.json(
      { error: 'Failed to create family account' },
      { status: 500 }
    )
  }
}
