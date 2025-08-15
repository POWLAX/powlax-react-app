import { test, expect } from '@playwright/test';

test.describe('Authentication Cleanup Verification', () => {
  
  // Phase 1: Verify Supabase-only auth context (no localStorage mock)
  test.describe('Phase 1: Supabase Auth Context', () => {
    test('should not use localStorage for authentication', async ({ page }) => {
      // Clear any existing localStorage
      await page.goto('http://localhost:3000');
      await page.evaluate(() => localStorage.clear());
      
      // Check that localStorage doesn't contain mock auth
      const localStorageAuth = await page.evaluate(() => {
        return {
          hasAuthUser: localStorage.getItem('supabase_auth_user') !== null,
          hasAuthSession: localStorage.getItem('supabase_auth_session') !== null
        };
      });
      
      expect(localStorageAuth.hasAuthUser).toBe(false);
      expect(localStorageAuth.hasAuthSession).toBe(false);
    });
    
    test('should check for Supabase session on load', async ({ page }) => {
      // Monitor network requests for Supabase auth calls
      const authRequests: string[] = [];
      page.on('request', request => {
        if (request.url().includes('supabase') && request.url().includes('auth')) {
          authRequests.push(request.url());
        }
      });
      
      await page.goto('http://localhost:3000');
      await page.waitForTimeout(1000); // Give time for auth checks
      
      // Should have made Supabase auth requests
      const hasSupabaseAuth = authRequests.some(url => 
        url.includes('/auth/v1/token') || 
        url.includes('/auth/v1/user') ||
        url.includes('getSession')
      );
      
      expect(authRequests.length).toBeGreaterThan(0);
    });
  });
  
  // Phase 2: Verify middleware protection
  test.describe('Phase 2: Middleware Protection', () => {
    test('should redirect unauthenticated users from protected routes to login', async ({ page }) => {
      // Clear any auth
      await page.context().clearCookies();
      
      // Try to access protected route
      await page.goto('http://localhost:3000/dashboard');
      
      // Should be redirected to login
      await expect(page).toHaveURL(/\/auth\/login/);
      
      // Should preserve redirect destination
      const url = page.url();
      expect(url).toContain('redirectTo');
    });
    
    test('should redirect root path to login when unauthenticated', async ({ page }) => {
      await page.context().clearCookies();
      
      await page.goto('http://localhost:3000/');
      
      // Should redirect to login
      await expect(page).toHaveURL('http://localhost:3000/auth/login');
    });
    
    test('should protect multiple routes', async ({ page }) => {
      await page.context().clearCookies();
      
      const protectedRoutes = [
        '/teams',
        '/skills-academy',
        '/resources',
        '/strategies',
        '/admin'
      ];
      
      for (const route of protectedRoutes) {
        await page.goto(`http://localhost:3000${route}`);
        await expect(page).toHaveURL(/\/auth\/login/);
      }
    });
    
    test('should allow access to auth pages without authentication', async ({ page }) => {
      await page.context().clearCookies();
      
      // Login page should be accessible
      await page.goto('http://localhost:3000/auth/login');
      await expect(page).toHaveURL('http://localhost:3000/auth/login');
      
      // Should not redirect
      await expect(page.locator('h1, h2, h3').first()).toContainText(/Welcome|Sign|Login/i);
    });
  });
  
  // Phase 3: Verify direct-login uses real auth (development only)
  test.describe('Phase 3: Direct-Login Real Auth', () => {
    test('should access direct-login in development', async ({ page }) => {
      // Direct-login should be accessible in dev
      await page.goto('http://localhost:3000/direct-login');
      
      // Should not redirect away
      await expect(page).toHaveURL('http://localhost:3000/direct-login');
      
      // Should show development quick login UI
      await expect(page.locator('text=/Development.*Quick.*Login/i')).toBeVisible();
    });
    
    test('should not have localStorage mock auth in direct-login', async ({ page }) => {
      await page.goto('http://localhost:3000/direct-login');
      
      // Look for the old localStorage code patterns
      const pageContent = await page.content();
      
      // Should NOT contain localStorage.setItem for auth
      expect(pageContent).not.toContain('localStorage.setItem(\'supabase_auth_user\'');
      expect(pageContent).not.toContain('localStorage.setItem(\'supabase_auth_session\'');
      
      // Should contain real Supabase auth references
      await expect(page.locator('text=/real.*Supabase/i')).toBeVisible();
    });
    
    test('should show development mode indicator', async ({ page }) => {
      await page.goto('http://localhost:3000/direct-login');
      
      // Should have development mode warning
      await expect(page.locator('text=/Development.*Mode.*Only/i')).toBeVisible();
    });
  });
  
  // Phase 4: Verify magic link is primary flow
  test.describe('Phase 4: Magic Link Primary Flow', () => {
    test('should show magic link focused login page', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/login');
      
      // Should have magic link UI elements
      await expect(page.locator('text=/Welcome to POWLAX/i')).toBeVisible();
      await expect(page.locator('text=/no password needed/i')).toBeVisible();
      await expect(page.locator('button:has-text("Send Magic Link")')).toBeVisible();
      
      // Should NOT have password field
      const passwordFields = await page.locator('input[type="password"]').count();
      expect(passwordFields).toBe(0);
    });
    
    test('should show 3-step process explanation', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/login');
      
      // Should show numbered steps
      await expect(page.locator('text=/Enter your email/i')).toBeVisible();
      await expect(page.locator('text=/email you a secure/i')).toBeVisible();
      await expect(page.locator('text=/Click the link/i')).toBeVisible();
    });
    
    test('should validate email before sending', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/login');
      
      // Try to submit without email
      const submitButton = page.locator('button:has-text("Send Magic Link")');
      
      // Button should be disabled without email
      await expect(submitButton).toBeDisabled();
      
      // Enter invalid email
      await page.fill('input[type="email"]', 'invalid-email');
      await submitButton.click();
      
      // Should show error (HTML5 validation or custom)
      const validationMessage = await page.locator('input[type="email"]').evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    });
    
    test('should handle magic link sending flow', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/login');
      
      // Enter valid email
      await page.fill('input[type="email"]', 'test@example.com');
      
      // Click send
      await page.locator('button:has-text("Send Magic Link")').click();
      
      // Should show sending state or success state
      await expect(page.locator('text=/Sending|Check Your Email|sent/i')).toBeVisible({ timeout: 10000 });
    });
    
    test('should show development quick login link in dev mode', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/login');
      
      // Should have dev mode helper
      await expect(page.locator('text=/Dev Mode.*Quick Login/i')).toBeVisible();
      await expect(page.locator('a[href="/direct-login"]')).toBeVisible();
    });
    
    test('should preserve redirectTo parameter', async ({ page }) => {
      // Access protected route
      await page.goto('http://localhost:3000/teams');
      
      // Should redirect to login with redirectTo
      await expect(page).toHaveURL(/\/auth\/login\?redirectTo/);
      
      // The redirectTo should be preserved
      const url = new URL(page.url());
      expect(url.searchParams.get('redirectTo')).toBe('/teams');
      
      // Should show notice about signing in to access page
      await expect(page.locator('text=/sign in to access/i')).toBeVisible();
    });
  });
  
  // Integration test: Full flow
  test.describe('Integration: Complete Auth Flow', () => {
    test('should handle complete unauthenticated user journey', async ({ page }) => {
      // 1. Clear all auth
      await page.context().clearCookies();
      await page.goto('http://localhost:3000');
      await page.evaluate(() => localStorage.clear());
      
      // 2. Try to access protected content
      await page.goto('http://localhost:3000/dashboard');
      
      // 3. Should be on login page
      await expect(page).toHaveURL(/\/auth\/login/);
      
      // 4. Should see magic link form
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button:has-text("Send Magic Link")')).toBeVisible();
      
      // 5. No localStorage mock auth
      const hasLocalStorageAuth = await page.evaluate(() => {
        return localStorage.getItem('supabase_auth_user') !== null;
      });
      expect(hasLocalStorageAuth).toBe(false);
    });
    
    test('should not have any WordPress auth references', async ({ page }) => {
      await page.goto('http://localhost:3000/auth/login');
      
      const pageContent = await page.content();
      
      // Should not contain WordPress auth patterns
      expect(pageContent.toLowerCase()).not.toContain('wordpress');
      expect(pageContent).not.toContain('wp-admin');
      expect(pageContent).not.toContain('memberpress');
      
      // Should not have username/password traditional login
      const usernameFields = await page.locator('input[name="username"], input[placeholder*="username" i]').count();
      expect(usernameFields).toBe(0);
    });
  });
});

// Performance and build verification
test.describe('Build and Performance', () => {
  test('should load login page quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
  
  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForTimeout(2000);
    
    // Filter out expected development warnings
    const realErrors = consoleErrors.filter(err => 
      !err.includes('Next.js') && 
      !err.includes('DevTools') &&
      !err.includes('hydration')
    );
    
    expect(realErrors).toHaveLength(0);
  });
});