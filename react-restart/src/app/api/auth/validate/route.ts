import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Use our proxy validation endpoint
    const proxyResponse = await fetch(`${request.nextUrl.origin}/api/auth/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'validate',
        token
      })
    })

    const proxyData = await proxyResponse.json()

    if (!proxyResponse.ok) {
      return NextResponse.json(
        { error: proxyData.error || 'Invalid token' },
        { status: proxyResponse.status }
      )
    }

    return NextResponse.json({
      valid: proxyData.valid,
      user: proxyData.user,
      expiresAt: proxyData.expiresAt
    })

  } catch (error) {
    console.error('Token validation error:', error)
    
    return NextResponse.json(
      { error: 'Token validation failed' },
      { status: 500 }
    )
  }
}