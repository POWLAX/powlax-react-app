# Page-Specific Authentication Implementation Plan

## Executive Summary

This document outlines a comprehensive plan to implement page-specific authentication that preserves the user's intended destination after login, rather than always redirecting to the dashboard. The solution will enhance user experience by maintaining context and reducing friction in the authentication flow.

## Current State Analysis

### Authentication Architecture
- **Primary Auth System**: Supabase Auth with WordPress integration
- **Auth Context**: `SupabaseAuthContext` (`src/contexts/SupabaseAuthContext.tsx`)
- **Protected Routes**: Use `(authenticated)` layout group with `useRequireAuth` hook
- **Login Page**: `src/app/auth/login/page.tsx`
- **Current Redirect Behavior**: Always redirects to `/dashboard` after login

### Current Authentication Flow
1. User attempts to access protected page
2. `useRequireAuth` hook detects unauthenticated user
3. User redirected to `/auth/login`
4. After successful login, user always redirected to `/dashboard`
5. **Problem**: Original intended destination is lost

### Identified Issues
1. **Hard-coded redirects**: Login page and auth context always redirect to `/dashboard`
2. **No URL preservation**: Current URL not captured before redirect to login
3. **Poor UX**: Users lose context and must navigate back to intended page
4. **Inconsistent behavior**: Some hooks use `window.location.href` while others use `router.push`

## Proposed Solution

### 1. URL Preservation System

#### A. Create URL State Management Utility
**File**: `src/lib/auth-redirect.ts`
```typescript
interface AuthRedirectState {
  returnTo: string | null
  timestamp: number
}

export class AuthRedirectManager {
  private static STORAGE_KEY = 'powlax_auth_redirect'
  private static EXPIRY_TIME = 30 * 60 * 1000 // 30 minutes

  static saveReturnUrl(url: string): void
  static getReturnUrl(): string | null
  static clearReturnUrl(): void
  static isValidReturnUrl(url: string): boolean
}
```

#### B. Enhanced Authentication Context
**File**: `src/contexts/SupabaseAuthContext.tsx`
- Add `loginWithRedirect` method that accepts optional `returnTo` parameter
- Modify existing login methods to use redirect manager
- Update `useRequireAuth` hook to save current URL before redirecting

### 2. Login Page Enhancement

#### A. URL Parameter Support
**File**: `src/app/auth/login/page.tsx`
- Add support for `returnTo` query parameter
- Validate return URLs for security (whitelist approach)
- Display user-friendly message about where they'll be redirected

#### B. Smart Redirect Logic
```typescript
const getRedirectDestination = (returnTo?: string): string => {
  // Priority order:
  // 1. Valid returnTo parameter
  // 2. Saved return URL from AuthRedirectManager
  // 3. Default dashboard
}
```

### 3. Protected Route Updates

#### A. Enhanced useRequireAuth Hook
**File**: `src/contexts/SupabaseAuthContext.tsx`
```typescript
export function useRequireAuth(options?: {
  redirectTo?: string
  saveCurrentUrl?: boolean
}) {
  // Save current URL before redirecting (default: true)
  // Allow custom login page (default: /auth/login)
}
```

#### B. Layout-Level Protection
**File**: `src/app/(authenticated)/layout.tsx`
- Update to use enhanced `useRequireAuth` with URL saving
- Ensure consistent behavior across all protected pages

### 4. Public Page Integration

#### A. Call-to-Action Links
**Files**: 
- `src/app/skills-academy-public/page.tsx`
- `src/app/page.tsx`
- Other public pages

Update authentication links to preserve context:
```typescript
<Link href="/auth/login?returnTo=/skills-academy">
  Start Training
</Link>
```

#### B. Smart Authentication Prompts
Create reusable component for authentication prompts that automatically capture return URLs.

## Implementation Details

### Phase 1: Core Infrastructure (Priority: High)

#### 1.1 Create Auth Redirect Manager
```typescript
// src/lib/auth-redirect.ts
export class AuthRedirectManager {
  private static STORAGE_KEY = 'powlax_auth_redirect'
  private static EXPIRY_TIME = 30 * 60 * 1000 // 30 minutes
  
  static saveReturnUrl(url: string): void {
    if (!this.isValidReturnUrl(url)) return
    
    const state: AuthRedirectState = {
      returnTo: url,
      timestamp: Date.now()
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state))
    }
  }
  
  static getReturnUrl(): string | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null
      
      const state: AuthRedirectState = JSON.parse(stored)
      
      // Check if expired
      if (Date.now() - state.timestamp > this.EXPIRY_TIME) {
        this.clearReturnUrl()
        return null
      }
      
      return state.returnTo
    } catch {
      return null
    }
  }
  
  static clearReturnUrl(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }
  
  static isValidReturnUrl(url: string): boolean {
    // Security: Only allow relative URLs or same-origin URLs
    try {
      // Allow relative URLs
      if (url.startsWith('/') && !url.startsWith('//')) {
        return true
      }
      
      // Allow same-origin absolute URLs
      const urlObj = new URL(url)
      return urlObj.origin === window.location.origin
    } catch {
      return false
    }
  }
}
```

#### 1.2 Enhance Authentication Context
```typescript
// src/contexts/SupabaseAuthContext.tsx
// Add new method:
const loginWithRedirect = useCallback(async (
  email: string, 
  returnTo?: string
): Promise<boolean> => {
  const success = await login(email)
  
  if (success && returnTo && AuthRedirectManager.isValidReturnUrl(returnTo)) {
    AuthRedirectManager.saveReturnUrl(returnTo)
  }
  
  return success
}, [login])

// Update useRequireAuth:
export function useRequireAuth(options: {
  redirectTo?: string
  saveCurrentUrl?: boolean
} = {}) {
  const { 
    redirectTo = '/auth/login',
    saveCurrentUrl = true 
  } = options
  
  const { user, loading } = useAuth()
  const [redirected, setRedirected] = useState(false)
  
  useEffect(() => {
    if (!loading && !user && !redirected && typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search
      const isAuthPage = currentPath.includes('/auth/') || 
                        currentPath.includes('/login') || 
                        currentPath.includes('/direct-login')
      
      if (!isAuthPage) {
        if (saveCurrentUrl) {
          AuthRedirectManager.saveReturnUrl(currentPath)
        }
        
        setRedirected(true)
        window.location.href = redirectTo
      }
    }
  }, [user, loading, redirected, redirectTo, saveCurrentUrl])
  
  return { user, loading }
}
```

### Phase 2: Login Page Enhancement (Priority: High)

#### 2.1 Update Login Page
```typescript
// src/app/auth/login/page.tsx
export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, error, user } = useAuth()
  
  const returnTo = searchParams?.get('returnTo')
  
  // Redirect logic after successful login
  const handleSuccessfulLogin = useCallback(() => {
    const destination = getRedirectDestination(returnTo)
    AuthRedirectManager.clearReturnUrl()
    router.push(destination)
  }, [returnTo, router])
  
  // Enhanced redirect logic
  const getRedirectDestination = (returnToParam?: string | null): string => {
    // 1. Check URL parameter
    if (returnToParam && AuthRedirectManager.isValidReturnUrl(returnToParam)) {
      return returnToParam
    }
    
    // 2. Check saved return URL
    const savedUrl = AuthRedirectManager.getReturnUrl()
    if (savedUrl) {
      return savedUrl
    }
    
    // 3. Default to dashboard
    return '/dashboard'
  }
  
  // Update useEffect for already logged in users
  useEffect(() => {
    if (user) {
      handleSuccessfulLogin()
    }
  }, [user, handleSuccessfulLogin])
  
  // Update form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setLoginError(null)

    try {
      const success = await login(formData.username, formData.password)
      
      if (success) {
        handleSuccessfulLogin()
      } else {
        setLoginError(error || 'Login failed. Please check your credentials.')
        setFormData(prev => ({ ...prev, password: '' }))
      }
    } catch (err) {
      console.error('Login error:', err)
      setLoginError('Connection error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
}
```

#### 2.2 Add User-Friendly Messaging
```typescript
// In login page component
const destination = getRedirectDestination(returnTo)
const isReturning = destination !== '/dashboard'

return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Welcome to POWLAX
        </CardTitle>
        <CardDescription className="text-center">
          {isReturning ? (
            <>Sign in to continue to <strong>{getPageTitle(destination)}</strong></>
          ) : (
            'Sign in with your POWLAX account'
          )}
        </CardDescription>
      </CardHeader>
      {/* ... rest of form */}
    </Card>
  </div>
)
```

### Phase 3: Public Page Integration (Priority: Medium)

#### 3.1 Update Call-to-Action Links
```typescript
// src/app/skills-academy-public/page.tsx
<Button size="lg" variant="secondary" asChild>
  <Link href="/auth/login?returnTo=/skills-academy">
    Start Training
  </Link>
</Button>

// src/components/common/AuthPrompt.tsx (new component)
interface AuthPromptProps {
  returnTo?: string
  children: React.ReactNode
  variant?: 'button' | 'link'
}

export function AuthPrompt({ returnTo, children, variant = 'button' }: AuthPromptProps) {
  const currentPath = typeof window !== 'undefined' ? 
    window.location.pathname + window.location.search : ''
  
  const loginUrl = returnTo ? 
    `/auth/login?returnTo=${encodeURIComponent(returnTo)}` :
    `/auth/login?returnTo=${encodeURIComponent(currentPath)}`
  
  if (variant === 'link') {
    return <Link href={loginUrl}>{children}</Link>
  }
  
  return (
    <Button asChild>
      <Link href={loginUrl}>{children}</Link>
    </Button>
  )
}
```

#### 3.2 Smart Context Preservation
```typescript
// For dynamic pages that might need authentication
// src/hooks/useAuthPrompt.ts
export function useAuthPrompt() {
  const saveCurrentPage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.pathname + window.location.search
      AuthRedirectManager.saveReturnUrl(currentUrl)
    }
  }, [])
  
  const getLoginUrl = useCallback((returnTo?: string) => {
    const destination = returnTo || (typeof window !== 'undefined' ? 
      window.location.pathname + window.location.search : '/dashboard')
    
    return `/auth/login?returnTo=${encodeURIComponent(destination)}`
  }, [])
  
  return { saveCurrentPage, getLoginUrl }
}
```

### Phase 4: Enhanced Security & Validation (Priority: Medium)

#### 4.1 URL Validation Whitelist
```typescript
// src/lib/auth-redirect.ts
const ALLOWED_RETURN_PATHS = [
  '/dashboard',
  '/skills-academy',
  '/strategies',
  '/gamification',
  '/practice-planner',
  '/community',
  '/resources',
  '/academy',
  '/teams',
  '/admin',
  // Add specific patterns
  /^\/skills-academy\/workout\/\d+$/,
  /^\/teams\/[a-zA-Z0-9-]+\/dashboard$/,
  /^\/details\/\w+\/\d+$/
]

static isValidReturnUrl(url: string): boolean {
  try {
    // Allow relative URLs only
    if (!url.startsWith('/') || url.startsWith('//')) {
      return false
    }
    
    // Remove query parameters for path checking
    const path = url.split('?')[0]
    
    // Check against whitelist
    return ALLOWED_RETURN_PATHS.some(pattern => {
      if (typeof pattern === 'string') {
        return path === pattern || path.startsWith(pattern + '/')
      } else {
        return pattern.test(path)
      }
    })
  } catch {
    return false
  }
}
```

#### 4.2 Session-Based Fallback
```typescript
// For server-side redirect preservation
// src/lib/server-auth-redirect.ts
export async function saveReturnUrlToSession(
  request: NextRequest, 
  returnTo: string
): Promise<void> {
  // Implementation for server-side URL preservation
  // Using encrypted cookies or session storage
}
```

## Testing Strategy

### Unit Tests
- `AuthRedirectManager` utility functions
- URL validation logic
- Redirect destination calculation

### Integration Tests
- Full authentication flow with return URLs
- Public page → login → protected page flow
- URL preservation across page refreshes

### E2E Tests
```typescript
// tests/e2e/auth-redirect.spec.ts
test('preserves return URL through login flow', async ({ page }) => {
  // 1. Navigate to protected page while unauthenticated
  await page.goto('/skills-academy/workout/123')
  
  // 2. Should redirect to login with returnTo parameter
  await expect(page).toHaveURL(/\/auth\/login\?returnTo=/)
  
  // 3. Complete login
  await page.fill('[name="username"]', 'testuser')
  await page.fill('[name="password"]', 'testpass')
  await page.click('button[type="submit"]')
  
  // 4. Should redirect back to original page
  await expect(page).toHaveURL('/skills-academy/workout/123')
})
```

## Security Considerations

### 1. URL Validation
- **Whitelist approach**: Only allow predefined path patterns
- **No external redirects**: Block any URLs that could redirect outside the app
- **Path traversal protection**: Prevent `../` and similar attacks

### 2. Storage Security
- **Client-side storage**: Use localStorage with expiration
- **No sensitive data**: Only store sanitized path information
- **Automatic cleanup**: Clear expired redirect URLs

### 3. CSRF Protection
- **State validation**: Verify redirect requests are legitimate
- **Token validation**: Ensure auth tokens are valid before redirecting

## Migration Plan

### Step 1: Infrastructure (Week 1)
1. Create `AuthRedirectManager` utility
2. Add unit tests for URL validation
3. Update TypeScript types

### Step 2: Context Updates (Week 1-2)
1. Enhance `SupabaseAuthContext` with redirect support
2. Update `useRequireAuth` hook
3. Test authentication flow

### Step 3: Login Page (Week 2)
1. Update login page with returnTo support
2. Add user-friendly messaging
3. Test various redirect scenarios

### Step 4: Public Pages (Week 2-3)
1. Update call-to-action links
2. Create reusable `AuthPrompt` component
3. Update marketing pages

### Step 5: Testing & Refinement (Week 3)
1. Comprehensive testing
2. Performance optimization
3. Documentation updates

## Success Metrics

### User Experience
- **Reduced navigation friction**: Users land on intended pages after login
- **Context preservation**: No loss of form data or page state
- **Improved conversion**: Better login-to-engagement rates from public pages

### Technical Metrics
- **Authentication success rate**: Maintain current rates
- **Page load performance**: No degradation
- **Error rates**: Monitor for redirect-related errors

## Rollback Plan

### Immediate Rollback
- Feature flags for new redirect behavior
- Fallback to dashboard redirect if errors occur
- Monitoring for authentication failures

### Gradual Rollout
- A/B testing with percentage of users
- Monitor metrics before full deployment
- Quick revert capability

## Future Enhancements

### 1. Deep Linking
- Preserve query parameters and fragments
- Support for modal states and tab selections

### 2. Multi-Step Flows
- Remember complex navigation paths
- Support for multi-page authentication flows

### 3. Personalization
- Smart default destinations based on user role
- Recently visited pages prioritization

### 4. Analytics Integration
- Track authentication conversion funnels
- Monitor drop-off points in auth flow

## Conclusion

This implementation will significantly improve the user experience by preserving context during authentication flows. The solution balances user convenience with security requirements, using a whitelist approach for URL validation and proper state management.

The phased approach ensures minimal risk during deployment while providing immediate value to users. The comprehensive testing strategy and rollback plan provide safety nets for production deployment.

Key benefits:
- **Enhanced UX**: Users stay on intended pages after login
- **Reduced friction**: No need to re-navigate after authentication
- **Better conversion**: Improved engagement from public pages
- **Maintainable code**: Clean, testable implementation
- **Security-first**: Proper validation and protection against attacks

This solution addresses the core issue while providing a foundation for future authentication enhancements.
