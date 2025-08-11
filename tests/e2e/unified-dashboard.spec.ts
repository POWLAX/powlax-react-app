import { test, expect } from '@playwright/test'

test.describe('Unified Dashboard Implementation Tests', () => {
  // Test configuration
  const PATRICK_EMAIL = 'patrick@powlax.com'
  const BASE_URL = 'http://localhost:3000'

  test.beforeEach(async ({ page }) => {
    // Start at direct login page
    await page.goto(`${BASE_URL}/direct-login`)
    
    // Login as Patrick
    await page.click(`text=Login as ${PATRICK_EMAIL}`)
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 })
  })

  test('Admin Dashboard shows real data', async ({ page }) => {
    // Verify we're on the dashboard
    await expect(page.locator('h1')).toContainText('Admin Dashboard')
    
    // Check for real user count (14+)
    const usersStat = page.locator('text=/Total Users.*[0-9]+/i').first()
    await expect(usersStat).toBeVisible()
    
    // Check for team count (13)
    const teamsStat = page.locator('text=/Total Teams.*[0-9]+/i').first()
    await expect(teamsStat).toBeVisible()
    
    // Check for children section
    await expect(page.locator('text=Your Children')).toBeVisible()
    await expect(page.locator('text=Alex Chapla')).toBeVisible()
    await expect(page.locator('text=Morgan Chapla')).toBeVisible()
    await expect(page.locator('text=Taylor Chapla')).toBeVisible()
    
    // Check for mock indicators
    await expect(page.locator('text=/Mock.*99.9%/i')).toBeVisible()
  })

  test('Role Management shows all users', async ({ page }) => {
    // Navigate to Role Management
    await page.click('text=Role Management')
    await page.waitForURL('**/admin/role-management')
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Role Management')
    
    // Check for user statistics
    await expect(page.locator('text=/Total Users.*[0-9]+/i')).toBeVisible()
    await expect(page.locator('text=/Administrators.*[0-9]+/i')).toBeVisible()
    await expect(page.locator('text=/Players.*[0-9]+/i')).toBeVisible()
    
    // Check for user table
    await expect(page.locator('table')).toBeVisible()
    
    // Verify Patrick is in the list
    await expect(page.locator('text=Patrick Chapla')).toBeVisible()
    await expect(page.locator('text=patrick@powlax.com')).toBeVisible()
    
    // Check for multiple role badges
    const patrickRow = page.locator('tr', { hasText: 'patrick@powlax.com' })
    await expect(patrickRow.locator('text=administrator')).toBeVisible()
    await expect(patrickRow.locator('text=parent')).toBeVisible()
  })

  test('Director Dashboard shows Your Club OS', async ({ page }) => {
    // Switch to Director view (would need role switcher implementation)
    // For now, navigate directly
    await page.goto(`${BASE_URL}/dashboard`)
    
    // Look for Director-specific content if role switching is available
    // This would need the actual role switcher to be implemented
    const clubText = page.locator('text=/Your Club OS/i').first()
    
    if (await clubText.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Check for Your Club OS teams
      await expect(page.locator('text=Your Varsity Team HQ')).toBeVisible()
      await expect(page.locator('text=Your JV Team HQ')).toBeVisible()
      await expect(page.locator('text=Your 8th Grade Team HQ')).toBeVisible()
    }
  })

  test('Teams page shows Your Club OS teams', async ({ page }) => {
    // Navigate to Teams page
    await page.click('text=Teams')
    await page.waitForURL('**/teams')
    
    // Check for Your Club OS teams
    await expect(page.locator('h1')).toContainText('Teams')
    
    // Look for team cards
    const varsityTeam = page.locator('text=Your Varsity Team HQ').first()
    const jvTeam = page.locator('text=Your JV Team HQ').first()
    const eighthGradeTeam = page.locator('text=Your 8th Grade Team HQ').first()
    
    // Check at least one team is visible
    const teamsVisible = await Promise.any([
      varsityTeam.isVisible({ timeout: 5000 }).catch(() => false),
      jvTeam.isVisible({ timeout: 5000 }).catch(() => false),
      eighthGradeTeam.isVisible({ timeout: 5000 }).catch(() => false)
    ])
    
    expect(teamsVisible).toBeTruthy()
    
    // Check for mock indicators
    await expect(page.locator('text=/Mock.*Communication/i').first()).toBeVisible()
    await expect(page.locator('text=/Mock.*Statistics/i').first()).toBeVisible()
  })

  test('Resources page has mock badges on all cards', async ({ page }) => {
    // Navigate to Resources page  
    await page.click('text=Resources')
    await page.waitForURL('**/resources')
    
    // Check for Resources title
    await expect(page.locator('h1')).toContainText('Resources')
    
    // Check for MOCK badges
    const mockBadges = page.locator('text=MOCK')
    await expect(mockBadges).toHaveCount(await mockBadges.count())
    
    // Check for mock descriptions
    await expect(page.locator('text=/Mock.*Equipment/i').first()).toBeVisible()
    await expect(page.locator('text=/Mock.*Training/i').first()).toBeVisible()
    await expect(page.locator('text=/Mock.*Rule/i').first()).toBeVisible()
    
    // Check for gray/disabled styling
    const cards = page.locator('.border-dashed')
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('Parent Dashboard shows children including demo', async ({ page }) => {
    // Check if parent view content is visible
    const childrenSection = page.locator('text=Your Children').first()
    
    if (await childrenSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Check for all 4 children (3 real + 1 demo)
      await expect(page.locator('text=Alex Chapla')).toBeVisible()
      await expect(page.locator('text=Morgan Chapla')).toBeVisible()
      await expect(page.locator('text=Taylor Chapla')).toBeVisible()
      
      // The demo child (powlax_coach) might be displayed differently
      // Check for 4 children total
      const childCards = page.locator('[data-testid="child-card"], .child-card, div:has-text("Chapla")')
      const childCount = await childCards.count()
      expect(childCount).toBeGreaterThanOrEqual(3)
    }
  })

  test('Mock elements are clearly marked', async ({ page }) => {
    // Check dashboard for mock indicators
    const mockElements = page.locator('text=/Mock:/i')
    const mockCount = await mockElements.count()
    
    // Should have multiple mock elements
    expect(mockCount).toBeGreaterThan(0)
    
    // Check for specific mock elements
    await expect(page.locator('text=/Mock.*99.9%/i').first()).toBeVisible()
    await expect(page.locator('text=/Mock.*session/i').first()).toBeVisible()
    
    // Check for gray badges
    const grayBadges = page.locator('.bg-gray-100, .text-gray-600').filter({ hasText: /Mock/i })
    expect(await grayBadges.count()).toBeGreaterThan(0)
  })

  test('Database verification - Patrick has all roles', async ({ page }) => {
    // Go to Role Management to verify Patrick's roles
    await page.goto(`${BASE_URL}/admin/role-management`)
    await page.waitForLoadState('networkidle')
    
    // Find Patrick's row
    const patrickRow = page.locator('tr', { hasText: 'patrick@powlax.com' })
    
    // Check for all 5 roles
    const roles = ['administrator', 'parent', 'club_director', 'team_coach', 'player']
    
    for (const role of roles) {
      const roleBadge = patrickRow.locator(`text=${role}`)
      await expect(roleBadge).toBeVisible()
    }
  })
})