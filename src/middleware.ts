import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // NO AUTHENTICATION - ALL ROUTES ACCESSIBLE
  // Simple routing middleware only
  
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') || ''
  
  // Avoid redirect loops - don't redirect if already on target path
  if (pathname === '/teams/no-team/practiceplan') {
    return NextResponse.next()
  }
  
  // HANDLE DOMAIN-BASED REDIRECTS
  // Redirect app.powlax.com root to practice planner (only if not already there)
  if (hostname.includes('app.powlax.com') && pathname === '/') {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/teams/no-team/practiceplan'
    return NextResponse.redirect(redirectUrl)
  }
  
  // HANDLE ROOT PATH - Redirect to practice planner for localhost too
  if (pathname === '/') {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/teams/no-team/practiceplan'
    return NextResponse.redirect(redirectUrl)
  }
  
  // Allow all routes
  return NextResponse.next()
}

// Configure which routes middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}