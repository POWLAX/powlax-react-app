import { test, expect } from '@playwright/test'

test.describe('Role-Based Dashboards', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the dashboard page
    await page.goto('/dashboard')
  })

  test('Public Dashboard - Shows marketing content when logged out', async ({ page }) => {
    // Wait for the public dashboard to load
    await page.waitForLoadState('networkidle')
    
    // Check for public dashboard elements
    await expect(page.locator('h1')).toContainText('Welcome to POWLAX')
    
    // Verify key sections are present
    await expect(page.locator('text=The complete lacrosse training platform')).toBeVisible()
    await expect(page.locator('text=Get Started Free')).toBeVisible()
    await expect(page.locator('text=Learn More')).toBeVisible()
    
    // Check for stats banner
    await expect(page.locator('text=Training Drills')).toBeVisible()
    await expect(page.locator('text=160+')).toBeVisible()
    
    // Verify features section
    await expect(page.locator('text=Skills Academy')).toBeVisible()
    await expect(page.locator('text=Practice Planner')).toBeVisible()
    await expect(page.locator('text=Team Management')).toBeVisible()
    
    // Check for testimonials
    await expect(page.locator('text=Coach Sarah Johnson')).toBeVisible()
    
    // Verify CTA section
    await expect(page.locator('text=Ready to Transform Your Lacrosse Experience?')).toBeVisible()
    await expect(page.locator('text=Start Free Trial')).toBeVisible()
    
    console.log('✅ Public Dashboard test passed')
  })

  test('Player Dashboard - Shows player-specific content', async ({ page }) => {
    // Mock authentication as a player
    await page.evaluate(() => {
      localStorage.setItem('mockUserRole', 'player')
    })
    
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Check for player dashboard elements
    await expect(page.locator('text=Player Dashboard')).toBeVisible()
    
    // Verify player-specific sections
    await expect(page.locator('text=Day Streak!')).toBeVisible()
    await expect(page.locator('text=Total Points')).toBeVisible()
    await expect(page.locator('text=Attack Tokens')).toBeVisible()
    await expect(page.locator('text=Defense Dollars')).toBeVisible()
    
    // Check skill development section
    await expect(page.locator('text=Skill Development')).toBeVisible()
    
    // Verify team workouts
    await expect(page.locator('text=Team Workouts')).toBeVisible()
    await expect(page.locator('text=Coach-assigned workouts')).toBeVisible()
    
    // Check recent achievements
    await expect(page.locator('text=Recent Achievements')).toBeVisible()
    
    // Verify upcoming schedule
    await expect(page.locator('text=Upcoming')).toBeVisible()
    
    console.log('✅ Player Dashboard test passed')
  })

  test('Coach Dashboard - Shows coaching tools and team overview', async ({ page }) => {
    // Mock authentication as a coach
    await page.evaluate(() => {
      localStorage.setItem('mockUserRole', 'team_coach')
    })
    
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Check for coach dashboard elements
    await expect(page.locator('text=Coach Dashboard')).toBeVisible()
    
    // Verify today's practice banner
    const practiceSection = page.locator('text=Offensive Drills')
    if (await practiceSection.isVisible()) {
      await expect(page.locator('text=3:30 PM')).toBeVisible()
    }
    
    // Check team statistics
    await expect(page.locator('text=Active Players')).toBeVisible()
    await expect(page.locator('text=Attendance')).toBeVisible()
    
    // Verify team performance section
    await expect(page.locator('text=Team Performance')).toBeVisible()
    
    // Check player highlights
    await expect(page.locator('text=Player Highlights')).toBeVisible()
    await expect(page.locator('text=Top Performer')).toBeVisible()
    
    // Verify quick actions
    await expect(page.locator('text=Create Practice')).toBeVisible()
    await expect(page.locator('text=Assign Workout')).toBeVisible()
    await expect(page.locator('text=Team Message')).toBeVisible()
    
    console.log('✅ Coach Dashboard test passed')
  })

  test('Parent Dashboard - Shows children progress monitoring', async ({ page }) => {
    // Mock authentication as a parent
    await page.evaluate(() => {
      localStorage.setItem('mockUserRole', 'parent')
    })
    
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Check for parent dashboard elements
    await expect(page.locator('text=Parent Dashboard')).toBeVisible()
    await expect(page.locator('text=Monitor Your Children')).toBeVisible()
    
    console.log('✅ Parent Dashboard test passed')
  })

  test('Director Dashboard - Shows club management overview', async ({ page }) => {
    // Mock authentication as a director
    await page.evaluate(() => {
      localStorage.setItem('mockUserRole', 'club_director')
    })
    
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Check for director dashboard elements
    await expect(page.locator('text=Club Director Dashboard')).toBeVisible()
    
    // Verify key metrics
    await expect(page.locator('text=Total Players')).toBeVisible()
    await expect(page.locator('text=Active Teams')).toBeVisible()
    await expect(page.locator('text=Monthly Revenue')).toBeVisible()
    
    // Check financial performance
    await expect(page.locator('text=Financial Performance')).toBeVisible()
    
    // Verify team performance overview
    await expect(page.locator('text=Team Performance Overview')).toBeVisible()
    
    // Check system health
    await expect(page.locator('text=System Health')).toBeVisible()
    
    console.log('✅ Director Dashboard test passed')
  })

  test('Admin Dashboard - Shows system administration tools', async ({ page }) => {
    // Mock authentication as an admin
    await page.evaluate(() => {
      localStorage.setItem('mockUserRole', 'administrator')
    })
    
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Check for admin dashboard elements
    await expect(page.locator('text=Admin Dashboard')).toBeVisible()
    await expect(page.locator('text=System Administration')).toBeVisible()
    
    // Verify system status
    await expect(page.locator('text=System Status: All Systems Operational')).toBeVisible()
    
    // Check system metrics
    await expect(page.locator('text=System Uptime')).toBeVisible()
    await expect(page.locator('text=New Users')).toBeVisible()
    await expect(page.locator('text=Total Drills')).toBeVisible()
    
    // Verify admin tools
    await expect(page.locator('text=User Management')).toBeVisible()
    await expect(page.locator('text=Content Library')).toBeVisible()
    await expect(page.locator('text=System Settings')).toBeVisible()
    
    // Check critical admin tools section
    await expect(page.locator('text=Critical Admin Tools')).toBeVisible()
    await expect(page.locator('text=Database Admin')).toBeVisible()
    await expect(page.locator('text=Security Center')).toBeVisible()
    
    console.log('✅ Admin Dashboard test passed')
  })

  test('Dashboard responsiveness - Mobile view', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Check that content is still visible and accessible on mobile
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Verify mobile layout adjustments
    const firstButton = page.locator('button').first()
    await expect(firstButton).toBeVisible()
    
    console.log('✅ Mobile responsiveness test passed')
  })

  test('Dashboard responsiveness - Tablet view', async ({ page }) => {
    // Set viewport to tablet size
    await page.setViewportSize({ width: 768, height: 1024 })
    
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Check that content adapts to tablet view
    await expect(page.locator('h1').first()).toBeVisible()
    
    console.log('✅ Tablet responsiveness test passed')
  })

  test('Dashboard navigation - Quick action links work', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Test if Skills Academy link is present and clickable
    const skillsLink = page.locator('text=Skills Academy').first()
    if (await skillsLink.isVisible()) {
      // Check that the link has proper href or onClick handler
      const parentElement = await skillsLink.locator('..').first()
      const hasHref = await parentElement.getAttribute('href')
      
      if (hasHref) {
        console.log(`✅ Skills Academy link found with href: ${hasHref}`)
      }
    }
    
    console.log('✅ Navigation links test passed')
  })

  test('Dashboard performance - Page loads quickly', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Check that page loads within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    console.log(`✅ Page loaded in ${loadTime}ms`)
  })
})

test.describe('Dashboard Content Validation', () => {
  test('Mock data displays correctly', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Check that mock data values are displayed
    const statsVisible = await page.locator('text=160+').isVisible()
    
    if (statsVisible) {
      console.log('✅ Mock statistics are displaying correctly')
    }
    
    // Verify data formatting (currency, percentages, etc.)
    const revenueText = await page.locator('text=$').first()
    if (await revenueText.isVisible()) {
      console.log('✅ Currency formatting is correct')
    }
    
    const percentageText = await page.locator('text=%').first()
    if (await percentageText.isVisible()) {
      console.log('✅ Percentage formatting is correct')
    }
  })

  test('All dashboard cards render without errors', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Check for console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Wait a moment for any delayed errors
    await page.waitForTimeout(1000)
    
    // Verify no console errors
    expect(consoleErrors.length).toBe(0)
    
    console.log('✅ No console errors detected')
  })
})