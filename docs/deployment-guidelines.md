# Vercel Deployment Guidelines

## Common Build Issues and Solutions

### 1. Import/Export Mismatches

**Problem**: Components exported as default but imported as named exports
```typescript
// ❌ Wrong - causes build error
import { VideoModal } from '@/components/modals/VideoModal'

// ✅ Correct - matches default export
import VideoModal from '@/components/modals/VideoModal'
```

**Prevention**:
- Always check how a component is exported before importing
- Use consistent export patterns across the codebase
- Prefer named exports for multiple exports from a single file

### 2. Supabase Client Usage in API Routes

**Problem**: Using browser client in server-side API routes
```typescript
// ❌ Wrong - browser client
import { createClient } from '@/lib/supabase'

// ✅ Correct - server client
import { createServerClient } from '@/lib/supabase-server'
```

**Best Practice**:
- API routes should always use `createServerClient`
- Pass SupabaseClient as parameter to utility functions instead of creating internally
- This allows functions to work in both client and server contexts

### 3. Dynamic Server Usage

**Problem**: Routes using cookies/headers being statically generated
```typescript
// Add this to force dynamic rendering for routes using cookies
export const dynamic = 'force-dynamic'
```

**When to Use**:
- Routes that access cookies or headers
- Routes that need fresh data on every request
- Authentication-dependent routes

### 4. Environment Variables

**Problem**: Missing environment variables causing build failures
```typescript
// ❌ Wrong - throws at build time
constructor() {
  if (!process.env.API_URL) {
    throw new Error('API_URL required');
  }
}

// ✅ Correct - validates at runtime
private ensureConfigured() {
  if (!this.config.apiUrl) {
    throw new Error('API_URL required');
  }
}

async fetchData() {
  this.ensureConfigured(); // Check when actually used
  // ... rest of method
}
```

**Best Practice**:
- Validate environment variables at runtime, not build time
- Provide fallbacks where appropriate
- Document all required environment variables

## Pre-Deployment Checklist

1. **Run local build test**:
   ```bash
   npm run build
   ```

2. **Check for TypeScript errors**:
   ```bash
   npm run lint
   ```

3. **Verify environment variables**:
   - Ensure all required env vars are set in Vercel dashboard
   - Check `.env.example` for required variables

4. **Test critical paths**:
   - Authentication flow
   - Database connections
   - API endpoints
   - Static asset loading

## Vercel-Specific Configuration

### Next.js Config
```javascript
// next.config.js
module.exports = {
  // Ignore TypeScript errors during build (use cautiously)
  typescript: {
    ignoreBuildErrors: false
  },
  // Ignore ESLint errors during build (use cautiously)
  eslint: {
    ignoreDuringBuilds: false
  }
}
```

### API Route Best Practices

1. **Always handle errors gracefully**:
```typescript
export async function GET(request: NextRequest) {
  try {
    // Your logic here
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

2. **Use proper HTTP methods**:
```typescript
export async function GET() { /* ... */ }
export async function POST() { /* ... */ }
export async function PUT() { /* ... */ }
export async function DELETE() { /* ... */ }
```

3. **Return appropriate status codes**:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Debugging Build Failures

1. **Check Vercel build logs**:
   - Look for "Attempted import error" messages
   - Check for missing environment variables
   - Review TypeScript compilation errors

2. **Common error patterns**:
   - `Module not found`: Check import paths and case sensitivity
   - `Dynamic server usage`: Add `export const dynamic = 'force-dynamic'`
   - `Cannot read properties of undefined`: Check for missing env vars

3. **Test locally with production build**:
   ```bash
   npm run build
   npm run start
   ```

## Performance Optimization

1. **Use static generation where possible**:
   - Pages without user-specific data
   - Marketing/landing pages
   - Documentation pages

2. **Optimize images**:
   - Use Next.js Image component
   - Provide width and height props
   - Use appropriate formats (WebP, AVIF)

3. **Code splitting**:
   - Use dynamic imports for large components
   - Lazy load non-critical features
   - Split vendor bundles appropriately

## Monitoring

1. **Set up error tracking**:
   - Integrate Sentry or similar service
   - Monitor API response times
   - Track client-side errors

2. **Performance monitoring**:
   - Use Vercel Analytics
   - Monitor Core Web Vitals
   - Set up alerts for degraded performance

## Emergency Rollback

If deployment causes issues:

1. **Instant rollback in Vercel**:
   - Go to Vercel dashboard
   - Navigate to Deployments
   - Click "..." on previous working deployment
   - Select "Promote to Production"

2. **Git rollback**:
   ```bash
   git revert HEAD
   git push origin main
   ```

## Contact for Issues

- Check deployment logs in Vercel dashboard
- Review this guide for common issues
- Test locally with production build first
- Document any new issues and solutions discovered