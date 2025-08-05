import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Test basic Supabase connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned (which is OK for test)
      console.error('Supabase connection error:', error)
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Supabase connection failed',
          details: error.message,
          troubleshooting: [
            'Check NEXT_PUBLIC_SUPABASE_URL in .env.local',
            'Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct',
            'Ensure Supabase project is active',
            'Check if profiles table exists'
          ]
        },
        { status: 500 }
      )
    }

    // Test service role key if available
    let serviceRoleTest = null
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (serviceRoleKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabaseServiceRole = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey
        )

        const { error: serviceError } = await supabaseServiceRole
          .from('profiles')
          .select('count(*)')
          .limit(1)

        serviceRoleTest = {
          available: true,
          working: !serviceError,
          error: serviceError?.message || null
        }
      } catch (serviceError) {
        serviceRoleTest = {
          available: true,
          working: false,
          error: serviceError instanceof Error ? serviceError.message : 'Unknown error'
        }
      }
    } else {
      serviceRoleTest = {
        available: false,
        working: false,
        error: 'SUPABASE_SERVICE_ROLE_KEY not configured'
      }
    }

    // Check environment configuration
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      connection: {
        status: 'connected',
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        testQuery: 'profiles table accessible'
      },
      environment: envCheck,
      serviceRole: serviceRoleTest,
      recommendations: serviceRoleTest.working ? [] : [
        'Configure SUPABASE_SERVICE_ROLE_KEY for user sync operations',
        'Ensure Row Level Security (RLS) policies allow user creation'
      ]
    })

  } catch (error) {
    console.error('Supabase test error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Supabase test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        troubleshooting: [
          'Verify Supabase project is active and accessible',
          'Check all environment variables are set correctly',
          'Ensure database tables exist (run migrations if needed)',
          'Verify network connectivity to Supabase'
        ]
      },
      { status: 500 }
    )
  }
}