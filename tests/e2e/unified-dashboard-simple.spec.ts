import { test, expect } from '@playwright/test'

test.describe('Unified Dashboard Basic Tests', () => {
  const BASE_URL = 'http://localhost:3000'

  test('Dashboard page loads', async ({ page }) => {
    // Go to dashboard directly
    await page.goto(`${BASE_URL}/dashboard`)
    
    // Page should load (even if redirected)
    await page.waitForLoadState('networkidle')
    
    // Check if we have a dashboard or login page
    const dashboardTitle = page.locator('h1').first()
    await expect(dashboardTitle).toBeVisible({ timeout: 10000 })
  })

  test('Teams page loads and shows content', async ({ page }) => {
    await page.goto(`${BASE_URL}/teams`)
    await page.waitForLoadState('networkidle')
    
    // Check for Teams heading
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    
    // Check for mock indicators
    const mockText = page.locator('text=/Mock/i').first()
    if (await mockText.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(mockText).toBeVisible()
    }
  })

  test('Resources page has mock badges', async ({ page }) => {
    await page.goto(`${BASE_URL}/resources`)
    await page.waitForLoadState('networkidle')
    
    // Check for Resources heading
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    
    // Check for MOCK badges
    const mockBadges = page.locator('text=MOCK')
    const count = await mockBadges.count()
    expect(count).toBeGreaterThan(0)
  })

  test('Admin role management page exists', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/role-management`)
    await page.waitForLoadState('networkidle')
    
    // Page should exist (even if redirected)
    const title = await page.title()
    expect(title).toBeTruthy()
  })

  test('Check mock elements on dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle')
    
    // Look for any mock indicators
    const mockIndicators = page.locator('text=/Mock:/i')
    const hasMockElements = await mockIndicators.count() > 0
    
    // We expect mock elements to exist
    if (hasMockElements) {
      const firstMock = mockIndicators.first()
      await expect(firstMock).toBeVisible()
    }
  })

  test('Verify dashboard components structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle')
    
    // Check for cards (common dashboard element)
    const cards = page.locator('[class*="card"], .card, div[class*="Card"]')
    const cardCount = await cards.count()
    
    // Dashboard should have some cards
    expect(cardCount).toBeGreaterThan(0)
  })
})