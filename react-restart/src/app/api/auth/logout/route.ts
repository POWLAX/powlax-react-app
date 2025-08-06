import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    // Use our proxy logout endpoint
    const proxyResponse = await fetch(`${request.nextUrl.origin}/api/auth/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'logout',
        token
      })
    })

    const proxyData = await proxyResponse.json()

    return NextResponse.json({
      success: proxyData.success,
      message: proxyData.message || 'Logged out successfully'
    })

  } catch (error) {
    console.error('Logout error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Logout failed'
      },
      { status: 500 }
    )
  }
}