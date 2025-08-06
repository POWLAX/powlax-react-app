import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, getAuthUser } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Check Supabase auth
    const { user: supabaseUser, error: supabaseError } = await getAuthUser()
    
    // Check cookies
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    // Check for JWT token in localStorage (this won't work server-side, just for info)
    const authCookies = allCookies.filter(c => 
      c.name.includes('auth') || 
      c.name.includes('supabase') || 
      c.name.includes('jwt') ||
      c.name.includes('wp')
    )

    return NextResponse.json({
      supabase: {
        authenticated: !!supabaseUser,
        user: supabaseUser ? {
          id: supabaseUser.id,
          email: supabaseUser.email
        } : null,
        error: supabaseError?.message
      },
      cookies: {
        total: allCookies.length,
        authRelated: authCookies.map(c => ({
          name: c.name,
          hasValue: !!c.value,
          valueLength: c.value?.length || 0
        }))
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}