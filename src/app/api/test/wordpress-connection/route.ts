import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const wordpressUrl = process.env.WORDPRESS_API_URL

    if (!wordpressUrl) {
      return NextResponse.json(
        { error: 'WORDPRESS_API_URL not configured' },
        { status: 500 }
      )
    }

    // Test basic connection to WordPress REST API
    const response = await fetch(`${wordpressUrl}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'POWLAX-Test/1.0'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: `WordPress API returned ${response.status}`,
          details: response.statusText,
          url: wordpressUrl
        },
        { status: 400 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: 'WordPress REST API is accessible',
      wordpressUrl,
      apiInfo: {
        name: data.name || 'Unknown',
        description: data.description || '',
        url: data.url || wordpressUrl,
        routes: data.routes ? Object.keys(data.routes).length : 'Unknown'
      }
    })

  } catch (error) {
    console.error('WordPress connection test error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to connect to WordPress API',
        details: error instanceof Error ? error.message : 'Unknown error',
        troubleshooting: [
          'Check WORDPRESS_API_URL in .env.local',
          'Verify WordPress site is accessible',
          'Ensure REST API is enabled',
          'Check CORS settings if needed'
        ]
      },
      { status: 500 }
    )
  }
}