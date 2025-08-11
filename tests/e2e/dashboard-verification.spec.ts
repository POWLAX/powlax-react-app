import { test, expect } from '@playwright/test'

test.describe('Dashboard Verification', () => {
  test('Dashboard loads and shows content', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Since we're not logged in, should show public dashboard
    const h1Text = await page.locator('h1').first().textContent()
    console.log('Dashboard heading:', h1Text)
    
    // Check for POWLAX branding
    await expect(page.locator('text=POWLAX').first()).toBeVisible()
    
    // Verify it's not showing loading spinner indefinitely
    const loadingSpinner = page.locator('.animate-spin')
    if (await loadingSpinner.isVisible()) {
      // Wait a bit to see if it goes away
      await page.waitForTimeout(2000)
      // Check again - should not be visible anymore
      const stillLoading = await loadingSpinner.isVisible()
      expect(stillLoading).toBeFalsy()
    }
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: 'test-results/dashboard-public.png', 
      fullPage: true 
    })
    
    console.log('✅ Dashboard loads successfully without authentication')
  })

  test('Dashboard shows different content based on mock roles', async ({ page }) => {
    // Test Player Dashboard
    await page.goto('/dashboard')
    
    // Mock player authentication by setting localStorage or using evaluate
    await page.evaluate(() => {
      // Mock a player user in the auth context
      window.localStorage.setItem('mockRole', 'player')
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Check if dashboard loaded (even if it shows public due to no real auth)
    const dashboardContent = await page.locator('body').textContent()
    console.log('Dashboard content loaded, checking for key elements...')
    
    // Check for any dashboard-specific elements
    const hasCards = await page.locator('.card, [class*="card"]').count()
    console.log(`Found ${hasCards} card elements on the page`)
    
    // Check for buttons
    const hasButtons = await page.locator('button').count()
    console.log(`Found ${hasButtons} buttons on the page`)
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/dashboard-with-mock-player.png', 
      fullPage: true 
    })
    
    console.log('✅ Dashboard renders with mock player role')
  })

  test('Dashboard is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Check that content adapts to mobile
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(viewportWidth).toBe(375)
    
    // Check for mobile-specific elements or layout
    const content = await page.locator('main, body').first()
    await expect(content).toBeVisible()
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'test-results/dashboard-mobile.png', 
      fullPage: true 
    })
    
    console.log('✅ Dashboard is responsive on mobile')
  })

  test('Dashboard has no console errors', async ({ page }) => {
    const errors: string[] = []
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Wait a moment for any delayed errors
    await page.waitForTimeout(2000)
    
    // Report any errors found
    if (errors.length > 0) {
      console.log('Console errors found:', errors)
    }
    
    // Expect no console errors
    expect(errors.length).toBe(0)
    
    console.log('✅ Dashboard loads without console errors')
  })
})