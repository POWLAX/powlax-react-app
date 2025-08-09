import { test, expect } from '@playwright/test'

test.describe('Practice Planner Pull-up Navigation', () => {
  test('verify pull-up navigation menu on mobile', async ({ page, isMobile }) => {
    // Only test on mobile viewports
    if (!isMobile) {
      test.skip()
      return
    }
    
    // Navigate to practice planner
    await page.goto('/teams/test-team/practice-plans')
    
    // Wait for page to load
    await page.waitForTimeout(2000)
    
    // Close welcome modal if present
    const closeButton = page.locator('button:has-text("Skip for now"), button:has-text("×")').first()
    if (await closeButton.isVisible()) {
      await closeButton.click()
    }
    
    // Check that default bottom navigation is not visible
    const defaultNav = page.locator('nav.fixed.bottom-0').first()
    const navCount = await defaultNav.count()
    expect(navCount).toBe(0) // Should be hidden on practice planner
    
    // Check that pull-up menu tab is visible
    const pullTab = page.locator('button:has-text("Menu")').first()
    expect(await pullTab.isVisible()).toBe(true)
    
    // Take screenshot before opening menu
    await page.screenshot({ 
      path: 'screenshots/practice-planner-nav-closed.png',
      fullPage: true 
    })
    
    // Click to open menu
    await pullTab.click()
    await page.waitForTimeout(500) // Wait for animation
    
    // Check that navigation menu is visible
    const navMenu = page.locator('nav:has(button:has-text("Dashboard"))').first()
    expect(await navMenu.isVisible()).toBe(true)
    
    // Take screenshot with menu open
    await page.screenshot({ 
      path: 'screenshots/practice-planner-nav-open.png',
      fullPage: true 
    })
    
    // Test navigation to Dashboard
    const dashboardButton = page.locator('button:has-text("Dashboard")').first()
    await dashboardButton.click()
    
    // Should navigate away from practice planner
    await page.waitForURL('**/dashboard')
    expect(page.url()).toContain('/dashboard')
  })
  
  test('verify desktop still has normal navigation', async ({ page, isMobile }) => {
    // Only test on desktop
    if (isMobile) {
      test.skip()
      return
    }
    
    // Navigate to practice planner
    await page.goto('/teams/test-team/practice-plans')
    
    // Wait for page to load
    await page.waitForTimeout(2000)
    
    // Close welcome modal if present
    const closeButton = page.locator('button:has-text("Skip for now"), button:has-text("×")').first()
    if (await closeButton.isVisible()) {
      await closeButton.click()
    }
    
    // Pull-up menu should not be visible on desktop
    const pullTab = page.locator('button:has-text("Menu")').first()
    expect(await pullTab.isVisible()).toBe(false)
    
    // Regular sidebar navigation should be visible
    const sidebar = page.locator('nav.bg-slate-900').first()
    expect(await sidebar.isVisible()).toBe(true)
  })
})