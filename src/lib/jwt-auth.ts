/**
 * JWT Authentication for WordPress
 * This is the permanent authentication solution using WordPress JWT plugin
 */

interface JWTResponse {
  token: string
  user_email: string
  user_nicename: string
  user_display_name: string
}

interface UserData {
  id: number
  username: string
  name: string
  email: string
  roles: string[]
  avatar?: string
}

 class JWTAuth {
  private baseUrl: string
  private appOrigin: string
  private tokenKey = 'wp_jwt_token'
  private userKey = 'wp_user_data'
  private refreshTimer: NodeJS.Timeout | null = null
  private useProxy: boolean

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://powlax.com'
    this.appOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    // Default to proxy to avoid CORS and plugin dependency during development
    this.useProxy = (process.env.NEXT_PUBLIC_AUTH_PROXY || 'true') === 'true'
  }

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<{ success: boolean; user?: UserData; error?: string }> {
    try {
      if (this.useProxy && this.appOrigin) {
        // Prefer the internal proxy API to authenticate against WordPress
        const response = await fetch(`${this.appOrigin}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        })

        const data = await response.json()
        if (!response.ok || !data?.success) {
          return {
            success: false,
            error: data?.error || 'Login failed'
          }
        }

        // Store session token from proxy and user payload
        this.storeToken(String(data.token))
        if (data.user) {
          localStorage.setItem(this.userKey, JSON.stringify(data.user as UserData))
        }
        this.setupTokenRefresh()
        return { success: true, user: data.user as UserData }
      }

      // Fallback to WordPress JWT plugin direct login (if proxy disabled)
      const response = await fetch(`${this.baseUrl}/wp-json/jwt-auth/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })

      if (!response.ok) {
        const error = await response.json()
        return { 
          success: false, 
          error: error.message || 'Invalid username or password' 
        }
      }

      const data: JWTResponse = await response.json()
      this.storeToken(data.token)
      const userData = await this.getUserData(data.token)
      if (userData) {
        localStorage.setItem(this.userKey, JSON.stringify(userData))
      }
      this.setupTokenRefresh()
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Connection error. Please try again.' }
    }
  }

  /**
   * Validate current token
   */
  async validateToken(): Promise<boolean> {
    const token = this.getToken()
    if (!token) return false

    try {
      if (this.useProxy && this.appOrigin) {
        const response = await fetch(`${this.appOrigin}/api/auth/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
        const data = await response.json()
        if (response.ok && data?.valid) {
          if (data.user) {
            localStorage.setItem(this.userKey, JSON.stringify(data.user as UserData))
          }
          return true
        }
        this.clearAuth()
        return false
      }

      const response = await fetch(`${this.baseUrl}/wp-json/jwt-auth/v1/token/validate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const userData = await this.getUserData(token)
        if (userData) localStorage.setItem(this.userKey, JSON.stringify(userData))
        return true
      }
      this.clearAuth()
      return false
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }

  /**
   * Get user data from WordPress
   */
  async getUserData(token: string): Promise<UserData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        return null
      }

      const user = await response.json()
      
      return {
        id: user.id,
        username: user.slug,
        name: user.name,
        email: user.email || '',
        roles: user.roles || ['subscriber'],
        avatar: user.avatar_urls?.[96]
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }

  /**
   * Refresh token before expiry
   */
  async refreshToken(): Promise<boolean> {
    const token = this.getToken()
    
    if (!token) {
      return false
    }

    try {
      // JWT plugin doesn't have a refresh endpoint by default
      // So we validate the token, and if it's still valid, keep using it
      const isValid = await this.validateToken()
      
      if (!isValid) {
        this.clearAuth()
        return false
      }
      
      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  /**
   * Set up automatic token refresh
   */
  setupTokenRefresh() {
    // Clear any existing timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
    
    // Refresh token every 50 minutes (tokens typically expire after 60 minutes)
    this.refreshTimer = setInterval(() => {
      this.refreshToken()
    }, 50 * 60 * 1000)
  }

  /**
   * Store token securely
   */
  private storeToken(token: string) {
    // Store in localStorage for persistence
    localStorage.setItem(this.tokenKey, token)
    
    // Also set as cookie for same-domain sharing
    // Note: In production, use httpOnly cookies via backend
    const domain = new URL(this.baseUrl).hostname
    document.cookie = `${this.tokenKey}=${token}; domain=.${domain}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=lax`
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    // Try localStorage first
    const token = localStorage.getItem(this.tokenKey)
    if (token) return token
    
    // Fallback to cookie
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === this.tokenKey) {
        return value
      }
    }
    
    return null
  }

  /**
   * Get stored user data
   */
  getUser(): UserData | null {
    const userData = localStorage.getItem(this.userKey)
    if (userData) {
      try {
        return JSON.parse(userData)
      } catch {
        return null
      }
    }
    return null
  }

  /**
   * Logout and clear auth
   */
  logout() {
    this.clearAuth()
  }

  /**
   * Clear all auth data
   */
  private clearAuth() {
    // Clear token
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.userKey)
    
    // Clear cookie
    document.cookie = `${this.tokenKey}=; domain=.powlax.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure; samesite=lax`
    
    // Clear refresh timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  /**
   * Make authenticated API request
   */
  async apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken()
    if (!token) {
      throw new Error('No authentication token')
    }

    if (this.useProxy && this.appOrigin) {
      const url = `${this.appOrigin}/api/auth/proxy?endpoint=${encodeURIComponent(endpoint)}`
      return fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          'x-session-token': token,
          'Content-Type': 'application/json'
        }
      })
    }

    return fetch(`${this.baseUrl}/wp-json${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  }
}

export const jwtAuth = new JWTAuth()
export type { UserData }