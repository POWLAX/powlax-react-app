import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Store active sessions (in production, use Redis or database)
const sessions = new Map<string, { 
  user: any
  wpCredentials: string
  expiresAt: number 
}>()

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now()
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(token)
    }
  }
}, 60000) // Clean every minute

export async function POST(request: NextRequest) {
  try {
    const { action, username, password, token } = await request.json()

    if (action === 'login') {
      return handleLogin(username, password)
    } else if (action === 'validate') {
      return handleValidate(token)
    } else if (action === 'logout') {
      return handleLogout(token)
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Proxy auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

async function handleLogin(username: string, password: string) {
  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username and password are required' },
      { status: 400 }
    )
  }

  const adminUsername = process.env.WORDPRESS_USERNAME
  const adminPassword = process.env.WORDPRESS_APP_PASSWORD
  const wordpressUrl = process.env.WORDPRESS_API_URL

  if (!adminUsername || !adminPassword || !wordpressUrl) {
    return NextResponse.json(
      { error: 'WordPress configuration missing' },
      { status: 500 }
    )
  }

  try {
    // First, verify the user exists and get their data using admin credentials
    const adminCredentials = Buffer.from(`${adminUsername}:${adminPassword}`).toString('base64')
    
    // Search for the user
    const searchResponse = await fetch(
      `${wordpressUrl}/users?search=${encodeURIComponent(username)}`,
      {
        headers: {
          'Authorization': `Basic ${adminCredentials}`,
          'User-Agent': 'POWLAX-App/1.0'
        }
      }
    )

    if (!searchResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 500 }
      )
    }

    const users = await searchResponse.json()
    const user = users.find((u: any) => 
      u.slug === username.toLowerCase() ||
      u.name?.toLowerCase() === username.toLowerCase()
    )

    console.log(`Found ${users.length} users, looking for: ${username}`)
    console.log('User found:', user ? `${user.slug || user.name} (${user.id})` : 'none')

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Now validate the password using a custom WordPress endpoint
    // Since we can't directly validate passwords via REST API, we'll use a workaround
    // Try to authenticate the user by attempting to access their own profile
    const userCredentials = Buffer.from(`${username}:${password}`).toString('base64')
    
    // Test if credentials work by trying to get user's own data
    const authTestResponse = await fetch(
      `${wordpressUrl}/users/me`,
      {
        headers: {
          'Authorization': `Basic ${userCredentials}`,
          'User-Agent': 'POWLAX-App/1.0'
        }
      }
    )

    // If the user can't authenticate with their credentials, try XML-RPC as fallback
    if (!authTestResponse.ok) {
      console.log('REST API auth failed, trying XML-RPC fallback')
      // Try XML-RPC authentication
      const wpBaseUrl = wordpressUrl.replace('/wp-json/wp/v2', '')
      const xmlrpcUrl = `${wpBaseUrl}/xmlrpc.php`
      
      const xmlrpcBody = `<?xml version="1.0"?>
        <methodCall>
          <methodName>wp.getUsersBlogs</methodName>
          <params>
            <param><value><string>${username}</string></value></param>
            <param><value><string>${password}</string></value></param>
          </params>
        </methodCall>`

      const xmlrpcResponse = await fetch(xmlrpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
          'User-Agent': 'POWLAX-App/1.0'
        },
        body: xmlrpcBody
      })

      const xmlrpcText = await xmlrpcResponse.text()
      
      // Check if authentication failed
      if (xmlrpcText.includes('<name>faultCode</name>')) {
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        )
      }

      // XML-RPC auth succeeded but REST API failed
      // This means the user has a valid password but no Application Password
      // We'll create a session using admin privileges to fetch user data
    }

    // Generate a secure session token
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 hours

    // Store the session
    sessions.set(sessionToken, {
      user: {
        id: user.id,
        username: user.slug,
        name: user.name,
        email: user.email || '',
        roles: user.roles || ['subscriber'],
        avatar: user.avatar_urls?.[96] || null
      },
      wpCredentials: adminCredentials, // Use admin credentials for API calls
      expiresAt
    })

    return NextResponse.json({
      success: true,
      message: `Successfully authenticated as ${user.name}`,
      user: {
        id: user.id,
        username: user.slug,
        name: user.name,
        email: user.email || '',
        roles: user.roles || ['subscriber'],
        avatar: user.avatar_urls?.[96] || null
      },
      token: sessionToken,
      expiresAt
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Authentication failed. Please check your credentials.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function handleValidate(token: string) {
  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 400 }
    )
  }

  const session = sessions.get(token)
  
  if (!session) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(token)
    return NextResponse.json(
      { error: 'Token expired' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    valid: true,
    user: session.user,
    expiresAt: session.expiresAt
  })
}

async function handleLogout(token: string) {
  if (token) {
    sessions.delete(token)
  }
  
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  })
}

// Export GET handler for fetching WordPress data using stored credentials
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-session-token')
    const endpoint = request.nextUrl.searchParams.get('endpoint')

    if (!token || !endpoint) {
      return NextResponse.json(
        { error: 'Token and endpoint are required' },
        { status: 400 }
      )
    }

    const session = sessions.get(token)
    
    if (!session || session.expiresAt < Date.now()) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const wordpressUrl = process.env.WORDPRESS_API_URL
    const fullUrl = `${wordpressUrl}${endpoint}`

    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': `Basic ${session.wpCredentials}`,
        'User-Agent': 'POWLAX-App/1.0'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch WordPress data' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Proxy GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}