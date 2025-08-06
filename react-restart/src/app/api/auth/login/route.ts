import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Use our proxy authentication endpoint
    const proxyResponse = await fetch(`${request.nextUrl.origin}/api/auth/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        username,
        password
      })
    })

    const proxyData = await proxyResponse.json()

    if (!proxyResponse.ok) {
      return NextResponse.json(
        { 
          success: false,
          error: proxyData.error || 'Login failed. Please check your credentials.',
          details: proxyData.details
        },
        { status: proxyResponse.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: proxyData.message,
      user: proxyData.user,
      token: proxyData.token,
      expiresAt: proxyData.expiresAt
    })

  } catch (error) {
    console.error('Login error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Login failed. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}