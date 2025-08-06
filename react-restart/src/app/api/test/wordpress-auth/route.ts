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

    const wordpressUrl = process.env.WORDPRESS_API_URL

    if (!wordpressUrl) {
      return NextResponse.json(
        { error: 'WORDPRESS_API_URL not configured' },
        { status: 500 }
      )
    }

    // Try multiple authentication methods
    let authResult = null
    let authMethod = 'Unknown'

    // Method 1: Try WordPress XML-RPC authentication (works with regular passwords)
    try {
      const wpBaseUrl = wordpressUrl.replace('/wp-json/wp/v2', '')
      const xmlrpcUrl = `${wpBaseUrl}/xmlrpc.php`
      
      const xmlrpcBody = `<?xml version="1.0"?>
        <methodCall>
          <methodName>wp.getProfile</methodName>
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

      if (xmlrpcResponse.ok) {
        const xmlrpcText = await xmlrpcResponse.text()
        
        // Check if authentication was successful (no fault in response)
        if (!xmlrpcText.includes('<fault>') && xmlrpcText.includes('<methodResponse>')) {
          // Authentication successful, now get user data via REST API with a different approach
          try {
            // Try to get user data by searching for the username
            const usersResponse = await fetch(`${wordpressUrl}/users?search=${encodeURIComponent(username)}`, {
              headers: {
                'User-Agent': 'POWLAX-App/1.0'
              }
            })
            
            if (usersResponse.ok) {
              const users = await usersResponse.json()
              const userData = users.find((user: any) => user.slug === username.toLowerCase() || user.username === username)
              
              if (userData) {
                authResult = {
                  success: true,
                  user: userData,
                  authMethod: 'XML-RPC (Regular Password)'
                }
                authMethod = 'XML-RPC (Regular Password)'
              }
            }
          } catch (restError) {
            console.log('Could not get user data via REST API after XML-RPC success:', restError)
          }
        }
      }
    } catch (xmlrpcError) {
      console.log('XML-RPC authentication failed:', xmlrpcError)
    }

    // Method 2: Try REST API with Basic Auth (Application Password)
    if (!authResult) {
      try {
        const credentials = Buffer.from(`${username}:${password}`).toString('base64')
        
        const response = await fetch(`${wordpressUrl}/users/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
            'User-Agent': 'POWLAX-App/1.0'
          }
        })

        if (response.ok) {
          const userData = await response.json()
          authResult = {
            success: true,
            user: userData,
            authMethod: 'REST API Basic Auth'
          }
          authMethod = 'REST API Basic Auth (App Password)'
        }
      } catch (restError) {
        console.log('REST API authentication failed:', restError)
      }
    }

    // If authentication failed with both methods
    if (!authResult || !authResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid username or password',
          details: 'Both regular password and Application Password authentication failed',
          troubleshooting: [
            'Verify your WordPress username and password are correct',
            'Check if your WordPress site allows XML-RPC (wp.xmlrpc_enabled)',
            'Try creating an Application Password in WordPress admin',
            'Ensure your WordPress site is accessible from this server'
          ]
        },
        { status: 401 }
      )
    }

    const userData = authResult.user

    // Test MemberPress data access (if available)
    let memberPressInfo = null
    try {
      // Try to get extended user data if we have REST API access
      if (authMethod.includes('REST API')) {
        const credentials = Buffer.from(`${username}:${password}`).toString('base64')
        const mpResponse = await fetch(`${wordpressUrl}/users/${userData.id}?context=edit`, {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (mpResponse.ok) {
          const mpData = await mpResponse.json()
          memberPressInfo = {
            hasMeta: !!mpData.meta,
            hasSubscriptions: !!(mpData.meta?.memberpress_subscriptions),
            subscriptionCount: mpData.meta?.memberpress_subscriptions?.length || 0
          }
        }
      }
    } catch (mpError) {
      console.log('MemberPress data not accessible:', mpError)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully authenticated as ${userData.name || userData.display_name}`,
      user: {
        id: userData.id,
        username: userData.username || userData.slug,
        name: userData.name || userData.display_name,
        email: userData.email,
        roles: userData.roles || [],
        avatar: userData.avatar_urls?.[96] || null,
        registered: userData.registered_date || userData.date
      },
      memberPress: memberPressInfo,
      authMethod: authMethod
    })

  } catch (error) {
    console.error('WordPress auth test error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Authentication test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        troubleshooting: [
          'Check your WordPress site URL is correct',
          'Verify your WordPress username and password',
          'Ensure your WordPress site is online and accessible',
          'Try both your regular password and Application Password'
        ]
      },
      { status: 500 }
    )
  }
}