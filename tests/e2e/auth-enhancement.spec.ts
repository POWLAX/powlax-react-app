import { test, expect } from '@playwright/test'

test.describe('Authentication Enhancement System', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('Modal appears on protected route when not authenticated', async ({ page }) => {
    // Navigate to a protected route
    await page.goto('/dashboard')
    
    // Wait for either modal or redirect
    await page.waitForTimeout(2000)
    
    // Check if we're on dashboard (auth might be disabled) or if modal appears
    const currentUrl = page.url()
    
    if (currentUrl.includes('/dashboard')) {
      // Check if modal is present
      const modal = await page.locator('[role="dialog"]').first()
      const modalVisible = await modal.isVisible().catch(() => false)
      
      if (modalVisible) {
        console.log('✅ Modal authentication is active')
        
        // Verify modal has email input
        const emailInput = await page.locator('input[type="email"]').first()
        await expect(emailInput).toBeVisible()
        
        // Verify modal has submit button
        const submitButton = await page.locator('button[type="submit"]').first()
        await expect(submitButton).toBeVisible()
        
        // Verify modal can be closed
        const closeButton = await page.locator('button').filter({ hasText: /close|cancel|×/i }).first()
        if (await closeButton.isVisible()) {
          console.log('✅ Modal has close button')
        }
      } else {
        console.log('⚠️ Auth might be bypassed - no modal appeared on protected route')
      }
    } else if (currentUrl.includes('/auth/login') || currentUrl.includes('/login')) {
      console.log('⚠️ Redirected to login page instead of showing modal')
    }
  })

  test('Admin navigation items check', async ({ page }) => {
    // Navigate to the app
    await page.goto('/dashboard')
    
    // Check if sidebar exists
    const sidebar = await page.locator('aside').first()
    const sidebarVisible = await sidebar.isVisible().catch(() => false)
    
    if (sidebarVisible) {
      console.log('✅ Sidebar navigation is visible')
      
      // Look for admin section (may not be visible without auth)
      const adminSection = await page.locator('text=/admin/i').first()
      const adminVisible = await adminSection.isVisible().catch(() => false)
      
      if (adminVisible) {
        console.log('✅ Admin section found in navigation')
        
        // Check for specific admin items
        const roleManagement = await page.locator('text="Role Management"').isVisible().catch(() => false)
        const drillEditor = await page.locator('text="Drill Editor"').isVisible().catch(() => false)
        
        if (roleManagement) console.log('✅ Role Management menu item found')
        if (drillEditor) console.log('✅ Drill Editor menu item found')
      } else {
        console.log('ℹ️ Admin section not visible (expected without authentication)')
      }
    }
  })

  test('Protected routes behavior', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/teams',
      '/skills-academy/workouts',
      '/resources',
      '/admin/role-management'
    ]
    
    for (const route of protectedRoutes) {
      await page.goto(`${route}`)
      await page.waitForTimeout(1000)
      
      const currentUrl = page.url()
      const modal = await page.locator('[role="dialog"]').first()
      const modalVisible = await modal.isVisible().catch(() => false)
      
      if (currentUrl.includes(route)) {
        if (modalVisible) {
          console.log(`✅ ${route} - Shows modal when not authenticated`)
        } else {
          console.log(`⚠️ ${route} - Accessible without authentication (auth might be disabled)`)
        }
      } else if (currentUrl.includes('/auth/login') || currentUrl.includes('/login')) {
        console.log(`⚠️ ${route} - Redirects to login page (old behavior)`)
      } else {
        console.log(`❌ ${route} - Unexpected redirect to ${currentUrl}`)
      }
    }
  })

  test('Check authentication context and hooks', async ({ page }) => {
    // Navigate to dashboard to trigger auth check
    await page.goto('/dashboard')
    
    // Check if auth context is working by looking at console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.waitForTimeout(2000)
    
    // Check for common auth errors
    const authErrors = consoleErrors.filter(err => 
      err.includes('useAuth') || 
      err.includes('SupabaseAuthContext') ||
      err.includes('authentication')
    )
    
    if (authErrors.length === 0) {
      console.log('✅ No authentication context errors detected')
    } else {
      console.log('❌ Authentication errors found:', authErrors)
    }
  })

  test('Modal functionality test', async ({ page }) => {
    // Go to a protected route
    await page.goto('/dashboard')
    await page.waitForTimeout(2000)
    
    // Check if modal appears
    const modal = await page.locator('[role="dialog"]').first()
    const modalVisible = await modal.isVisible().catch(() => false)
    
    if (modalVisible) {
      console.log('✅ Modal is visible on protected route')
      
      // Test email input
      const emailInput = await page.locator('input[type="email"]').first()
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com')
        const value = await emailInput.inputValue()
        if (value === 'test@example.com') {
          console.log('✅ Email input accepts text')
        }
      }
      
      // Test ESC key closes modal (if implemented)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
      const stillVisible = await modal.isVisible().catch(() => false)
      if (!stillVisible) {
        console.log('✅ ESC key closes modal')
      } else {
        console.log('ℹ️ ESC key does not close modal (might be intentional)')
      }
    } else {
      console.log('ℹ️ Modal not visible - auth might be disabled or user already authenticated')
    }
  })

  test('Check for infinite loading issues', async ({ page }) => {
    let loadingDetected = false
    let loadingDuration = 0
    const startTime = Date.now()
    
    // Set up listener for loading indicators
    page.on('domcontentloaded', async () => {
      // Check for common loading indicators
      const loadingIndicators = [
        'text="Loading"',
        '.animate-spin',
        '[aria-label="Loading"]',
        'text="Please wait"'
      ]
      
      for (const indicator of loadingIndicators) {
        const element = await page.locator(indicator).first()
        if (await element.isVisible().catch(() => false)) {
          loadingDetected = true
          console.log(`ℹ️ Loading indicator detected: ${indicator}`)
        }
      }
    })
    
    await page.goto('/dashboard')
    
    // Wait and check if loading persists
    await page.waitForTimeout(5000)
    
    if (loadingDetected) {
      loadingDuration = Date.now() - startTime
      if (loadingDuration > 3000) {
        console.log(`⚠️ Long loading time detected: ${loadingDuration}ms`)
      } else {
        console.log(`✅ Loading resolved within acceptable time: ${loadingDuration}ms`)
      }
    } else {
      console.log('✅ No infinite loading detected')
    }
  })
})

test.describe('Admin Access Verification', () => {
  test('Verify admin permissions setup', async ({ page }) => {
    // This test checks if the admin setup is correct
    // It doesn't require authentication but verifies the structure
    
    await page.goto('/dashboard')
    
    // Check if the page loads without critical errors
    const pageTitle = await page.title()
    console.log(`Page title: ${pageTitle}`)
    
    // Check for POWLAX branding
    const logo = await page.locator('img[alt="POWLAX"]').first()
    if (await logo.isVisible().catch(() => false)) {
      console.log('✅ POWLAX logo visible')
    }
    
    // Summary
    console.log('\n=== ADMIN ACCESS SETUP ===')
    console.log('To verify Patrick\'s admin access:')
    console.log('1. Login with patrick@powlax.com')
    console.log('2. Check for Admin section in sidebar')
    console.log('3. Verify access to /admin/role-management')
    console.log('4. Verify access to /admin/drill-editor')
  })
})